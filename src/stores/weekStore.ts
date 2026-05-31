/**
 * First Things First - Week Store
 *
 * Zustand store for week data with Supabase persistence.
 * Implements optimistic updates for instant UI feedback.
 */

import { create } from "zustand";
import {
  generateId,
  getCurrentWeekId,
  getWeekStartDate,
  parseWeekId,
} from "@/lib/utils";
import {
  resolveNewPlacement,
  resolveMovePlacement,
  resolveResize,
} from "@/lib/scheduling";
import { weekPersistence } from "@/stores/weekPersistence";
import type {
  Week,
  WeekId,
  Role,
  Goal,
  DayPriority,
  TimeBlock,
  EveningBlock,
  RoleColor,
  DayOfWeek,
  TimeSlotIndex,
  CreateRoleInput,
  CreateGoalInput,
  CreateTimeBlockInput,
  CreateDayPriorityInput,
  CreateEveningBlockInput,
} from "@/types";

// ============================================================================
// Role Color Palette
// ============================================================================

/**
 * Available role colors in assignment order.
 * Colors cycle if more than 8 roles exist.
 */
const ROLE_COLORS: RoleColor[] = [
  "teal",
  "amber",
  "rose",
  "violet",
  "emerald",
  "orange",
  "sky",
  "fuchsia",
];

/**
 * Get the next available color for a new role.
 * Cycles through the palette based on existing role count.
 */
export function getNextRoleColor(existingRoles: Role[]): RoleColor {
  return ROLE_COLORS[existingRoles.length % ROLE_COLORS.length];
}

// ============================================================================
// Store Types
// ============================================================================

interface WeekStore {
  // Current week state
  currentWeek: Week | null;
  selectedWeekId: WeekId | null;
  /** Ids of every week the signed-in user owns, ascending (reactive nav feed). */
  availableWeekIds: WeekId[];
  isLoading: boolean;
  error: string | null;

  // Session lifecycle (driven by AuthProvider)
  /** Load the user's week list + an initial week (today's, else latest, else a
   *  fresh empty week). Called when a User signs in. */
  bootstrap: () => Promise<void>;
  /** Clear all in-memory week state. Called on sign-out. */
  reset: () => void;
  /** Dismiss the current error banner. */
  clearError: () => void;

  // Week operations
  loadWeek: (weekId: WeekId) => Promise<void>;
  navigateToWeek: (weekId: WeekId) => Promise<void>;
  createWeek: (weekId: WeekId, carryOverRoles?: Role[]) => Promise<Week>;
  createNewWeek: (
    weekId: WeekId,
    options: { carryOverGoals?: Goal[]; sourceWeek?: Week }
  ) => Promise<Week>;
  saveCurrentWeek: () => Promise<void>;
  clearCurrentWeek: () => Promise<void>;

  // Role operations
  addRole: (input: CreateRoleInput) => Promise<Role>;
  updateRole: (roleId: string, updates: Partial<Omit<Role, "id">>) => Promise<void>;
  deleteRole: (roleId: string) => Promise<void>;
  reorderRoles: (roleIds: string[]) => Promise<void>;

  // Goal operations
  addGoal: (input: CreateGoalInput) => Promise<Goal>;
  updateGoal: (goalId: string, updates: Partial<Omit<Goal, "id" | "roleId">>) => Promise<void>;
  deleteGoal: (goalId: string) => Promise<void>;
  toggleGoalCompleted: (goalId: string) => Promise<void>;

  // Day priority operations
  addDayPriority: (input: CreateDayPriorityInput) => Promise<DayPriority>;
  removeDayPriority: (priorityId: string) => Promise<void>;
  toggleDayPriorityCompleted: (priorityId: string) => Promise<void>;
  reorderDayPriorities: (dayIndex: number, priorityIds: string[]) => Promise<void>;

  // Time block operations
  addTimeBlock: (input: CreateTimeBlockInput) => Promise<TimeBlock>;
  updateTimeBlock: (blockId: string, updates: Partial<Omit<TimeBlock, "id">>) => Promise<void>;
  deleteTimeBlock: (blockId: string) => Promise<void>;
  toggleTimeBlockCompleted: (blockId: string) => Promise<void>;

  // Evening block operations
  addEveningBlock: (input: CreateEveningBlockInput) => Promise<EveningBlock>;
  updateEveningBlock: (blockId: string, updates: Partial<Omit<EveningBlock, "id">>) => Promise<void>;
  deleteEveningBlock: (blockId: string) => Promise<void>;
  toggleEveningBlockCompleted: (blockId: string) => Promise<void>;

  // -------------------------------------------------------------------------
  // Scheduling operations (placement-aware; route through @/lib/scheduling).
  // Each decides via the pure layer, then mutates via withWeek so persistence
  // semantics match existing CRUD. Rejection is silent: return null, never throw.
  // -------------------------------------------------------------------------

  // Same-zone
  placeTimeBlockAt: (
    input: Omit<CreateTimeBlockInput, "startSlot" | "duration">,
    startSlot: number,
    requested?: number
  ) => Promise<TimeBlock | null>;
  moveTimeBlock: (blockId: string, dayIndex: DayOfWeek, startSlot: number) => Promise<TimeBlock | null>;
  resizeTimeBlock: (blockId: string, requested: number) => Promise<void>;

  // Atomic cross-zone (each = one withWeek updater touching both arrays)
  moveBlockToEvening: (blockId: string, dayIndex: DayOfWeek) => Promise<EveningBlock | null>;
  convertBlockToPriority: (blockId: string, dayIndex: DayOfWeek) => Promise<DayPriority | null>;
  convertPriorityToBlock: (priorityId: string, dayIndex: DayOfWeek, startSlot: number) => Promise<TimeBlock | null>;
  convertPriorityToEvening: (priorityId: string, dayIndex: DayOfWeek) => Promise<EveningBlock | null>;
  movePriorityToDay: (priorityId: string, dayIndex: DayOfWeek) => Promise<DayPriority | null>;
  moveEveningToBlock: (eveningBlockId: string, dayIndex: DayOfWeek, startSlot: number) => Promise<TimeBlock | null>;
  convertEveningToPriority: (eveningBlockId: string, dayIndex: DayOfWeek) => Promise<DayPriority | null>;
  moveEveningToDay: (eveningBlockId: string, dayIndex: DayOfWeek) => Promise<EveningBlock | null>;
}

// ============================================================================
// Helper: Create Empty Week
// ============================================================================

function createEmptyWeek(weekId: WeekId, carryOverRoles?: Role[]): Week {
  const monday = parseWeekId(weekId);
  const now = new Date().toISOString();

  // If carrying over roles, reset their IDs and keep order/colors
  const roles: Role[] = carryOverRoles
    ? carryOverRoles.map((role, index) => ({
        id: generateId(),
        name: role.name,
        color: role.color,
        order: index,
      }))
    : [];

  return {
    id: weekId,
    startDate: getWeekStartDate(monday).toISOString(),
    roles,
    goals: [],
    dayPriorities: [],
    timeBlocks: [],
    eveningBlocks: [],
    createdAt: now,
    updatedAt: now,
  };
}

// ============================================================================
// Helper: Update Week Pattern
// ============================================================================

type StoreGet = () => WeekStore;
type StoreSet = (partial: Partial<WeekStore>) => void;

/**
 * Common pattern: get current week, throw if null, apply updater, persist.
 */
async function withWeek(
  get: StoreGet,
  set: StoreSet,
  updater: (week: Week) => Partial<Week>
): Promise<void> {
  const week = get().currentWeek;
  if (!week) throw new Error("No week loaded");

  await commitWeek(get, set, { ...week, ...updater(week) });
}

/** Append position for a new priority on a given day (mirrors addDayPriority). */
function nextPriorityOrder(week: Week, dayIndex: number): number {
  return week.dayPriorities.filter((p) => p.dayIndex === dayIndex).length;
}

/**
 * Insert a week id into the reactive list, deduped and kept ascending. WeekId
 * strings sort lexically in chronological order, so a plain sort is correct.
 */
function withWeekId(ids: WeekId[], weekId: WeekId): WeekId[] {
  if (ids.includes(weekId)) return ids;
  return [...ids, weekId].sort();
}

/**
 * Role color id + display title carried from a goal onto a derived block/evening.
 * Returns empty title / undefined role when the goal can't be found (unreachable
 * in practice — a priority/evening always references an existing goal).
 */
function goalFields(week: Week, goalId: string): { roleId: string | undefined; title: string } {
  const goal = week.goals.find((g) => g.id === goalId);
  return { roleId: goal?.roleId, title: goal?.text ?? "" };
}

async function commitWeek(
  get: StoreGet,
  set: StoreSet,
  week: Week,
): Promise<Week> {
  const updatedWeek = { ...week, updatedAt: new Date().toISOString() };
  set({ currentWeek: updatedWeek });

  const result = await weekPersistence.commitWeek(updatedWeek);
  if (result.ok) {
    if (get().error) set({ error: null });
  } else if (!result.stale) {
    // Keep the optimistic edit in memory and surface the persistence failure.
    set({ error: result.message });
  }

  return updatedWeek;
}

async function persistCreatedWeek(
  get: StoreGet,
  set: StoreSet,
  week: Week,
): Promise<void> {
  const epoch = weekPersistence.epoch();
  const result = await weekPersistence.commitWeek(week);

  if (!result.ok) {
    if (!result.stale) {
      set({ error: result.message });
      throw result.error;
    }
    return;
  }

  if (weekPersistence.isCurrent(epoch)) {
    set({ availableWeekIds: withWeekId(get().availableWeekIds, week.id) });
  }
}

// ============================================================================
// Week Store Implementation
// ============================================================================

export const useWeekStore = create<WeekStore>((set, get) => ({
  // Initial state
  currentWeek: null,
  selectedWeekId: null,
  availableWeekIds: [],
  isLoading: false,
  error: null,

  // -------------------------------------------------------------------------
  // Session Lifecycle (driven by AuthProvider)
  // -------------------------------------------------------------------------

  bootstrap: async () => {
    const epoch = weekPersistence.epoch();
    set({ isLoading: true, error: null });

    const weekIdsResult = await weekPersistence.listWeekIds(epoch);
    if (!weekIdsResult.ok) {
      if (!weekIdsResult.stale) {
        set({ error: weekIdsResult.message, isLoading: false });
      }
      return;
    }

    if (!weekPersistence.isCurrent(epoch)) return;
    const weekIds = weekIdsResult.value;
    set({ availableWeekIds: weekIds });

    if (weekIds.length === 0) {
      // First-ever sign-in: start fresh on the current calendar week.
      const weekId = getCurrentWeekId();
      try {
        const week = await get().createWeek(weekId);
        if (!weekPersistence.isCurrent(epoch)) return;
        set({ currentWeek: week, selectedWeekId: week.id, isLoading: false });
      } catch (error) {
        if (!weekPersistence.isCurrent(epoch)) return;
        const message = error instanceof Error ? error.message : "Failed to load your weeks";
        set({ error: message, isLoading: false });
      }
      return;
    }

    // Prefer the current calendar week if the user has one; else the latest.
    const currentId = getCurrentWeekId();
    const targetId = weekIds.includes(currentId)
      ? currentId
      : weekIds[weekIds.length - 1];

    set({ selectedWeekId: targetId });
    await get().loadWeek(targetId);
  },

  reset: () => {
    weekPersistence.reset();
    set({
      currentWeek: null,
      selectedWeekId: null,
      availableWeekIds: [],
      isLoading: false,
      error: null,
    });
  },

  clearError: () => set({ error: null }),

  // -------------------------------------------------------------------------
  // Week Operations
  // -------------------------------------------------------------------------

  loadWeek: async (weekId: WeekId) => {
    const epoch = weekPersistence.epoch();
    const existingPending = weekPersistence.pendingSnapshot(weekId);
    set({ isLoading: true, error: existingPending ? get().error : null });

    const result = await weekPersistence.loadWeek(weekId, epoch);
    if (!result.ok) {
      if (!result.stale) {
        set({ error: result.message, isLoading: false });
        throw result.error;
      }
      return;
    }

    // Stale-request guard: another navigation or session reset may have started.
    if (!weekPersistence.isCurrent(epoch) || get().selectedWeekId !== weekId) return;

    set({ currentWeek: result.value ?? null, isLoading: false });
  },

  navigateToWeek: async (weekId: WeekId) => {
    set({ selectedWeekId: weekId });
    await get().loadWeek(weekId);
  },

  createWeek: async (weekId: WeekId, carryOverRoles?: Role[]) => {
    const week = createEmptyWeek(weekId, carryOverRoles);
    await persistCreatedWeek(get, set, week);
    return week;
  },

  createNewWeek: async (
    weekId: WeekId,
    options: { carryOverGoals?: Goal[]; sourceWeek?: Week }
  ) => {
    const { carryOverGoals, sourceWeek } = options;

    // Create empty week with roles carried over from source
    const week = createEmptyWeek(weekId, sourceWeek?.roles);

    // Map carried-over goals to the new week's roles
    if (carryOverGoals && carryOverGoals.length > 0 && sourceWeek) {
      const mappedGoals: Goal[] = [];

      for (const goal of carryOverGoals) {
        // Find the source role name for this goal
        const sourceRole = sourceWeek.roles.find((r) => r.id === goal.roleId);
        if (!sourceRole) continue;

        // Find the new role with the same name
        const newRole = week.roles.find((r) => r.name === sourceRole.name);
        if (!newRole) continue;

        const newGoal: Goal = {
          id: generateId(),
          roleId: newRole.id,
          text: goal.text,
          notes: goal.notes,
          completed: false,
        };
        mappedGoals.push(newGoal);
      }

      week.goals = mappedGoals;
    }

    await persistCreatedWeek(get, set, week);
    return week;
  },

  saveCurrentWeek: async () => {
    const week = get().currentWeek;
    if (!week) return;

    await commitWeek(get, set, week);
  },

  clearCurrentWeek: async () => {
    await withWeek(get, set, () => ({
      roles: [],
      goals: [],
      dayPriorities: [],
      timeBlocks: [],
      eveningBlocks: [],
    }));
  },

  // -------------------------------------------------------------------------
  // Role Operations
  // -------------------------------------------------------------------------

  addRole: async (input: CreateRoleInput) => {
    const week = get().currentWeek;
    if (!week) throw new Error("No week loaded");

    // Use max order + 1 to ensure new role appears at end
    // (roles.length doesn't work after deletions create order gaps)
    const maxOrder = week.roles.reduce((max, r) => Math.max(max, r.order), -1);

    const role: Role = {
      id: generateId(),
      name: input.name,
      color: getNextRoleColor(week.roles),
      order: maxOrder + 1,
    };

    await commitWeek(get, set, { ...week, roles: [...week.roles, role] });
    return role;
  },

  updateRole: async (roleId: string, updates: Partial<Omit<Role, "id">>) => {
    await withWeek(get, set, (week) => ({
      roles: week.roles.map((r) => (r.id === roleId ? { ...r, ...updates } : r)),
    }));
  },

  deleteRole: async (roleId: string) => {
    await withWeek(get, set, (week) => {
      const goalIds = week.goals.filter((g) => g.roleId === roleId).map((g) => g.id);
      return {
        roles: week.roles.filter((r) => r.id !== roleId),
        goals: week.goals.filter((g) => g.roleId !== roleId),
        dayPriorities: week.dayPriorities.filter((p) => !goalIds.includes(p.goalId)),
        timeBlocks: week.timeBlocks.filter((b) => b.type === "freestyle" || !goalIds.includes(b.goalId!)),
        eveningBlocks: week.eveningBlocks.filter((b) => b.type === "freestyle" || !goalIds.includes(b.goalId!)),
      };
    });
  },

  reorderRoles: async (roleIds: string[]) => {
    await withWeek(get, set, (week) => ({
      roles: week.roles.map((r) => ({ ...r, order: roleIds.indexOf(r.id) })),
    }));
  },

  // -------------------------------------------------------------------------
  // Goal Operations
  // -------------------------------------------------------------------------

  addGoal: async (input: CreateGoalInput) => {
    const week = get().currentWeek;
    if (!week) throw new Error("No week loaded");

    const goal: Goal = {
      id: generateId(),
      roleId: input.roleId,
      text: input.text,
      notes: input.notes,
      completed: false,
    };

    await commitWeek(get, set, { ...week, goals: [...week.goals, goal] });
    return goal;
  },

  updateGoal: async (goalId: string, updates: Partial<Omit<Goal, "id" | "roleId">>) => {
    await withWeek(get, set, (week) => ({
      goals: week.goals.map((g) => (g.id === goalId ? { ...g, ...updates } : g)),
    }));
  },

  deleteGoal: async (goalId: string) => {
    await withWeek(get, set, (week) => ({
      goals: week.goals.filter((g) => g.id !== goalId),
      dayPriorities: week.dayPriorities.filter((p) => p.goalId !== goalId),
      timeBlocks: week.timeBlocks.filter((b) => b.type === "freestyle" || b.goalId !== goalId),
      eveningBlocks: week.eveningBlocks.filter((b) => b.type === "freestyle" || b.goalId !== goalId),
    }));
  },

  toggleGoalCompleted: async (goalId: string) => {
    await withWeek(get, set, (week) => ({
      goals: week.goals.map((g) => (g.id === goalId ? { ...g, completed: !g.completed } : g)),
    }));
  },

  // -------------------------------------------------------------------------
  // Day Priority Operations
  // -------------------------------------------------------------------------

  addDayPriority: async (input: CreateDayPriorityInput) => {
    const week = get().currentWeek;
    if (!week) throw new Error("No week loaded");

    const priority: DayPriority = {
      id: generateId(),
      goalId: input.goalId,
      dayIndex: input.dayIndex,
      order: nextPriorityOrder(week, input.dayIndex), // append to end of day's priorities
      completed: input.completed ?? false,
    };

    await commitWeek(get, set, {
      ...week,
      dayPriorities: [...week.dayPriorities, priority],
    });
    return priority;
  },

  removeDayPriority: async (priorityId: string) => {
    await withWeek(get, set, (week) => ({
      dayPriorities: week.dayPriorities.filter((p) => p.id !== priorityId),
    }));
  },

  toggleDayPriorityCompleted: async (priorityId: string) => {
    await withWeek(get, set, (week) => ({
      dayPriorities: week.dayPriorities.map((p) => (p.id === priorityId ? { ...p, completed: !p.completed } : p)),
    }));
  },

  reorderDayPriorities: async (dayIndex: number, priorityIds: string[]) => {
    await withWeek(get, set, (week) => ({
      dayPriorities: week.dayPriorities.map((p) => {
        if (p.dayIndex !== dayIndex) return p;
        const newOrder = priorityIds.indexOf(p.id);
        return newOrder >= 0 ? { ...p, order: newOrder } : p;
      }),
    }));
  },

  // -------------------------------------------------------------------------
  // Time Block Operations
  // -------------------------------------------------------------------------

  addTimeBlock: async (input: CreateTimeBlockInput) => {
    const week = get().currentWeek;
    if (!week) throw new Error("No week loaded");

    const block: TimeBlock = {
      id: generateId(),
      ...input,
    };

    await commitWeek(get, set, { ...week, timeBlocks: [...week.timeBlocks, block] });
    return block;
  },

  updateTimeBlock: async (blockId: string, updates: Partial<Omit<TimeBlock, "id">>) => {
    await withWeek(get, set, (week) => ({
      timeBlocks: week.timeBlocks.map((b) => (b.id === blockId ? { ...b, ...updates } : b)),
    }));
  },

  deleteTimeBlock: async (blockId: string) => {
    await withWeek(get, set, (week) => ({
      timeBlocks: week.timeBlocks.filter((b) => b.id !== blockId),
    }));
  },

  toggleTimeBlockCompleted: async (blockId: string) => {
    await withWeek(get, set, (week) => ({
      timeBlocks: week.timeBlocks.map((b) => (b.id === blockId ? { ...b, completed: !b.completed } : b)),
    }));
  },

  // -------------------------------------------------------------------------
  // Evening Block Operations
  // -------------------------------------------------------------------------

  addEveningBlock: async (input: CreateEveningBlockInput) => {
    const week = get().currentWeek;
    if (!week) throw new Error("No week loaded");

    // Check if evening block already exists for this day
    const existing = week.eveningBlocks.find((b) => b.dayIndex === input.dayIndex);
    if (existing) {
      throw new Error(`Evening block already exists for day ${input.dayIndex}`);
    }

    const block: EveningBlock = {
      id: generateId(),
      ...input,
    };

    await commitWeek(get, set, {
      ...week,
      eveningBlocks: [...week.eveningBlocks, block],
    });
    return block;
  },

  updateEveningBlock: async (blockId: string, updates: Partial<Omit<EveningBlock, "id">>) => {
    await withWeek(get, set, (week) => ({
      eveningBlocks: week.eveningBlocks.map((b) => (b.id === blockId ? { ...b, ...updates } : b)),
    }));
  },

  deleteEveningBlock: async (blockId: string) => {
    await withWeek(get, set, (week) => ({
      eveningBlocks: week.eveningBlocks.filter((b) => b.id !== blockId),
    }));
  },

  toggleEveningBlockCompleted: async (blockId: string) => {
    await withWeek(get, set, (week) => ({
      eveningBlocks: week.eveningBlocks.map((b) => (b.id === blockId ? { ...b, completed: !b.completed } : b)),
    }));
  },

  // -------------------------------------------------------------------------
  // Scheduling Operations (placement-aware)
  // -------------------------------------------------------------------------

  placeTimeBlockAt: async (input, startSlot, requested) => {
    const week = get().currentWeek;
    if (!week) return null;

    const dayBlocks = week.timeBlocks.filter((b) => b.dayIndex === input.dayIndex);
    const placement = resolveNewPlacement(startSlot, dayBlocks, requested);
    if (!placement.ok) return null;

    const block: TimeBlock = {
      id: generateId(),
      ...input,
      startSlot: placement.startSlot as TimeSlotIndex,
      duration: placement.duration,
    };

    await withWeek(get, set, (w) => ({ timeBlocks: [...w.timeBlocks, block] }));
    return block;
  },

  moveTimeBlock: async (blockId, dayIndex, startSlot) => {
    const week = get().currentWeek;
    if (!week) return null;

    const block = week.timeBlocks.find((b) => b.id === blockId);
    if (!block) return null;

    const dayBlocks = week.timeBlocks.filter((b) => b.dayIndex === dayIndex);
    // Exclude self so the block doesn't collide with its own footprint.
    const placement = resolveMovePlacement(startSlot, block.duration, dayBlocks, blockId);
    if (!placement.ok) return null;

    const moved: TimeBlock = {
      ...block,
      dayIndex,
      startSlot: startSlot as TimeSlotIndex,
    };
    await withWeek(get, set, (w) => ({
      timeBlocks: w.timeBlocks.map((b) => (b.id === blockId ? moved : b)),
    }));
    return moved;
  },

  resizeTimeBlock: async (blockId, requested) => {
    const week = get().currentWeek;
    if (!week) return;

    const block = week.timeBlocks.find((b) => b.id === blockId);
    if (!block) return;

    const dayBlocks = week.timeBlocks.filter((b) => b.dayIndex === block.dayIndex);
    const duration = resolveResize(requested, block.startSlot, dayBlocks, blockId);

    await withWeek(get, set, (w) => ({
      timeBlocks: w.timeBlocks.map((b) => (b.id === blockId ? { ...b, duration } : b)),
    }));
  },

  moveBlockToEvening: async (blockId, dayIndex) => {
    const week = get().currentWeek;
    if (!week) return null;

    const block = week.timeBlocks.find((b) => b.id === blockId);
    if (!block) return null;
    // Precondition before the updater: the inlined add bypasses addEveningBlock's
    // throw guard, so replicate the "one evening block per day" check here.
    if (week.eveningBlocks.some((b) => b.dayIndex === dayIndex)) return null;

    const evening: EveningBlock = {
      id: generateId(),
      type: block.goalId ? "goal" : "freestyle",
      goalId: block.goalId,
      roleId: block.roleId,
      dayIndex,
      title: block.title,
      completed: false,
    };
    await withWeek(get, set, (w) => ({
      eveningBlocks: [...w.eveningBlocks, evening],
      timeBlocks: w.timeBlocks.filter((b) => b.id !== blockId),
    }));
    return evening;
  },

  convertBlockToPriority: async (blockId, dayIndex) => {
    const week = get().currentWeek;
    if (!week) return null;

    const block = week.timeBlocks.find((b) => b.id === blockId);
    if (!block || !block.goalId) return null;

    const priority: DayPriority = {
      id: generateId(),
      goalId: block.goalId,
      dayIndex,
      order: nextPriorityOrder(week, dayIndex),
      completed: false,
    };
    await withWeek(get, set, (w) => ({
      dayPriorities: [...w.dayPriorities, priority],
      timeBlocks: w.timeBlocks.filter((b) => b.id !== blockId),
    }));
    return priority;
  },

  convertPriorityToBlock: async (priorityId, dayIndex, startSlot) => {
    const week = get().currentWeek;
    if (!week) return null;

    const priority = week.dayPriorities.find((p) => p.id === priorityId);
    if (!priority) return null;

    const dayBlocks = week.timeBlocks.filter((b) => b.dayIndex === dayIndex);
    const placement = resolveNewPlacement(startSlot, dayBlocks);
    if (!placement.ok) return null;

    const { roleId, title } = goalFields(week, priority.goalId);
    const block: TimeBlock = {
      id: generateId(),
      type: "goal",
      goalId: priority.goalId,
      roleId,
      dayIndex,
      startSlot: placement.startSlot as TimeSlotIndex,
      duration: placement.duration,
      title,
      completed: false,
    };
    await withWeek(get, set, (w) => ({
      timeBlocks: [...w.timeBlocks, block],
      dayPriorities: w.dayPriorities.filter((p) => p.id !== priorityId),
    }));
    return block;
  },

  convertPriorityToEvening: async (priorityId, dayIndex) => {
    const week = get().currentWeek;
    if (!week) return null;

    const priority = week.dayPriorities.find((p) => p.id === priorityId);
    if (!priority) return null;
    if (week.eveningBlocks.some((b) => b.dayIndex === dayIndex)) return null;

    const { roleId, title } = goalFields(week, priority.goalId);
    const evening: EveningBlock = {
      id: generateId(),
      type: "goal",
      goalId: priority.goalId,
      roleId,
      dayIndex,
      title,
      completed: false,
    };
    await withWeek(get, set, (w) => ({
      eveningBlocks: [...w.eveningBlocks, evening],
      dayPriorities: w.dayPriorities.filter((p) => p.id !== priorityId),
    }));
    return evening;
  },

  movePriorityToDay: async (priorityId, dayIndex) => {
    const week = get().currentWeek;
    if (!week) return null;

    const priority = week.dayPriorities.find((p) => p.id === priorityId);
    if (!priority) return null;
    if (priority.dayIndex === dayIndex) return null; // same-day no-op

    const moved: DayPriority = {
      id: generateId(),
      goalId: priority.goalId,
      dayIndex,
      order: nextPriorityOrder(week, dayIndex),
      completed: false,
    };
    await withWeek(get, set, (w) => ({
      dayPriorities: [
        ...w.dayPriorities.filter((p) => p.id !== priorityId),
        moved,
      ],
    }));
    return moved;
  },

  moveEveningToBlock: async (eveningBlockId, dayIndex, startSlot) => {
    const week = get().currentWeek;
    if (!week) return null;

    const evening = week.eveningBlocks.find((b) => b.id === eveningBlockId);
    if (!evening) return null;

    const dayBlocks = week.timeBlocks.filter((b) => b.dayIndex === dayIndex);
    const placement = resolveNewPlacement(startSlot, dayBlocks);
    if (!placement.ok) return null;

    const block: TimeBlock = {
      id: generateId(),
      type: evening.goalId ? "goal" : "freestyle",
      goalId: evening.goalId,
      roleId: evening.roleId,
      dayIndex,
      startSlot: placement.startSlot as TimeSlotIndex,
      duration: placement.duration,
      title: evening.title,
      completed: false,
    };
    await withWeek(get, set, (w) => ({
      timeBlocks: [...w.timeBlocks, block],
      eveningBlocks: w.eveningBlocks.filter((b) => b.id !== eveningBlockId),
    }));
    return block;
  },

  convertEveningToPriority: async (eveningBlockId, dayIndex) => {
    const week = get().currentWeek;
    if (!week) return null;

    const evening = week.eveningBlocks.find((b) => b.id === eveningBlockId);
    if (!evening || !evening.goalId) return null;

    const priority: DayPriority = {
      id: generateId(),
      goalId: evening.goalId,
      dayIndex,
      order: nextPriorityOrder(week, dayIndex),
      completed: false,
    };
    await withWeek(get, set, (w) => ({
      dayPriorities: [...w.dayPriorities, priority],
      eveningBlocks: w.eveningBlocks.filter((b) => b.id !== eveningBlockId),
    }));
    return priority;
  },

  moveEveningToDay: async (eveningBlockId, dayIndex) => {
    const week = get().currentWeek;
    if (!week) return null;

    const evening = week.eveningBlocks.find((b) => b.id === eveningBlockId);
    if (!evening) return null;
    if (evening.dayIndex === dayIndex) return null; // same-day no-op
    if (week.eveningBlocks.some((b) => b.dayIndex === dayIndex)) return null;

    const moved: EveningBlock = {
      id: generateId(),
      type: evening.type,
      goalId: evening.goalId,
      roleId: evening.roleId,
      dayIndex,
      title: evening.title,
      completed: false, // Reset completed status on move (matches prior behaviour)
    };
    await withWeek(get, set, (w) => ({
      eveningBlocks: [
        ...w.eveningBlocks.filter((b) => b.id !== eveningBlockId),
        moved,
      ],
    }));
    return moved;
  },
}));

// ============================================================================
// Selector Hooks (for performance optimization)
// ============================================================================

/**
 * Get evening block for a specific day (max 1 per day).
 */
export const selectEveningBlock = (state: WeekStore, dayIndex: number): EveningBlock | undefined => {
  return state.currentWeek?.eveningBlocks.find((b) => b.dayIndex === dayIndex);
};
