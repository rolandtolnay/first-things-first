/**
 * First Things First - Week Store
 *
 * Zustand store for week data with Dexie persistence.
 * Implements optimistic updates for instant UI feedback.
 */

import { create } from "zustand";
import { db, saveWeek } from "@/lib/db";
import { generateId, getWeekStartDate, parseWeekId } from "@/lib/utils";
import type {
  Week,
  WeekId,
  Role,
  Goal,
  DayPriority,
  TimeBlock,
  EveningBlock,
  RoleColor,
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
function getNextRoleColor(existingRoles: Role[]): RoleColor {
  return ROLE_COLORS[existingRoles.length % ROLE_COLORS.length];
}

// ============================================================================
// Store Types
// ============================================================================

interface WeekStore {
  // Current week state
  currentWeek: Week | null;
  isLoading: boolean;
  error: string | null;

  // Week operations
  loadWeek: (weekId: WeekId) => Promise<void>;
  createWeek: (weekId: WeekId, carryOverRoles?: Role[]) => Promise<Week>;
  saveCurrentWeek: () => Promise<void>;

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
// Week Store Implementation
// ============================================================================

export const useWeekStore = create<WeekStore>((set, get) => ({
  // Initial state
  currentWeek: null,
  isLoading: false,
  error: null,

  // -------------------------------------------------------------------------
  // Week Operations
  // -------------------------------------------------------------------------

  loadWeek: async (weekId: WeekId) => {
    set({ isLoading: true, error: null });

    try {
      let week = await db.weeks.get(weekId);

      if (!week) {
        // Create new week if doesn't exist
        week = await get().createWeek(weekId);
      }

      set({ currentWeek: week, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load week";
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  createWeek: async (weekId: WeekId, carryOverRoles?: Role[]) => {
    const week = createEmptyWeek(weekId, carryOverRoles);
    await saveWeek(week);
    return week;
  },

  saveCurrentWeek: async () => {
    const week = get().currentWeek;
    if (!week) return;

    const updatedWeek = { ...week, updatedAt: new Date().toISOString() };
    set({ currentWeek: updatedWeek });
    await saveWeek(updatedWeek);
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

    // Optimistic update
    set({
      currentWeek: {
        ...week,
        roles: [...week.roles, role],
        updatedAt: new Date().toISOString(),
      },
    });

    // Persist
    await get().saveCurrentWeek();
    return role;
  },

  updateRole: async (roleId: string, updates: Partial<Omit<Role, "id">>) => {
    const week = get().currentWeek;
    if (!week) throw new Error("No week loaded");

    set({
      currentWeek: {
        ...week,
        roles: week.roles.map((r) =>
          r.id === roleId ? { ...r, ...updates } : r
        ),
        updatedAt: new Date().toISOString(),
      },
    });

    await get().saveCurrentWeek();
  },

  deleteRole: async (roleId: string) => {
    const week = get().currentWeek;
    if (!week) throw new Error("No week loaded");

    // Delete role and all associated goals
    const goalIds = week.goals.filter((g) => g.roleId === roleId).map((g) => g.id);

    set({
      currentWeek: {
        ...week,
        roles: week.roles.filter((r) => r.id !== roleId),
        goals: week.goals.filter((g) => g.roleId !== roleId),
        // Remove day priorities for deleted goals
        dayPriorities: week.dayPriorities.filter((p) => !goalIds.includes(p.goalId)),
        // Remove time blocks for deleted goals (keep freestyle blocks)
        timeBlocks: week.timeBlocks.filter(
          (b) => b.type === "freestyle" || !goalIds.includes(b.goalId!)
        ),
        // Remove evening blocks for deleted goals
        eveningBlocks: week.eveningBlocks.filter(
          (b) => b.type === "freestyle" || !goalIds.includes(b.goalId!)
        ),
        updatedAt: new Date().toISOString(),
      },
    });

    await get().saveCurrentWeek();
  },

  reorderRoles: async (roleIds: string[]) => {
    const week = get().currentWeek;
    if (!week) throw new Error("No week loaded");

    set({
      currentWeek: {
        ...week,
        roles: week.roles.map((r) => ({
          ...r,
          order: roleIds.indexOf(r.id),
        })),
        updatedAt: new Date().toISOString(),
      },
    });

    await get().saveCurrentWeek();
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

    set({
      currentWeek: {
        ...week,
        goals: [...week.goals, goal],
        updatedAt: new Date().toISOString(),
      },
    });

    await get().saveCurrentWeek();
    return goal;
  },

  updateGoal: async (goalId: string, updates: Partial<Omit<Goal, "id" | "roleId">>) => {
    const week = get().currentWeek;
    if (!week) throw new Error("No week loaded");

    set({
      currentWeek: {
        ...week,
        goals: week.goals.map((g) =>
          g.id === goalId ? { ...g, ...updates } : g
        ),
        updatedAt: new Date().toISOString(),
      },
    });

    await get().saveCurrentWeek();
  },

  deleteGoal: async (goalId: string) => {
    const week = get().currentWeek;
    if (!week) throw new Error("No week loaded");

    set({
      currentWeek: {
        ...week,
        goals: week.goals.filter((g) => g.id !== goalId),
        // Remove day priorities for this goal
        dayPriorities: week.dayPriorities.filter((p) => p.goalId !== goalId),
        // Remove time blocks for this goal (keep freestyle)
        timeBlocks: week.timeBlocks.filter(
          (b) => b.type === "freestyle" || b.goalId !== goalId
        ),
        // Remove evening blocks for this goal
        eveningBlocks: week.eveningBlocks.filter(
          (b) => b.type === "freestyle" || b.goalId !== goalId
        ),
        updatedAt: new Date().toISOString(),
      },
    });

    await get().saveCurrentWeek();
  },

  toggleGoalCompleted: async (goalId: string) => {
    const week = get().currentWeek;
    if (!week) throw new Error("No week loaded");

    set({
      currentWeek: {
        ...week,
        goals: week.goals.map((g) =>
          g.id === goalId ? { ...g, completed: !g.completed } : g
        ),
        updatedAt: new Date().toISOString(),
      },
    });

    await get().saveCurrentWeek();
  },

  // -------------------------------------------------------------------------
  // Day Priority Operations
  // -------------------------------------------------------------------------

  addDayPriority: async (input: CreateDayPriorityInput) => {
    const week = get().currentWeek;
    if (!week) throw new Error("No week loaded");

    // Calculate order (append to end of day's priorities)
    const dayPriorities = week.dayPriorities.filter(
      (p) => p.dayIndex === input.dayIndex
    );
    const order = dayPriorities.length;

    const priority: DayPriority = {
      id: generateId(),
      goalId: input.goalId,
      dayIndex: input.dayIndex,
      order,
      completed: input.completed ?? false,
    };

    set({
      currentWeek: {
        ...week,
        dayPriorities: [...week.dayPriorities, priority],
        updatedAt: new Date().toISOString(),
      },
    });

    await get().saveCurrentWeek();
    return priority;
  },

  removeDayPriority: async (priorityId: string) => {
    const week = get().currentWeek;
    if (!week) throw new Error("No week loaded");

    set({
      currentWeek: {
        ...week,
        dayPriorities: week.dayPriorities.filter((p) => p.id !== priorityId),
        updatedAt: new Date().toISOString(),
      },
    });

    await get().saveCurrentWeek();
  },

  toggleDayPriorityCompleted: async (priorityId: string) => {
    const week = get().currentWeek;
    if (!week) throw new Error("No week loaded");

    set({
      currentWeek: {
        ...week,
        dayPriorities: week.dayPriorities.map((p) =>
          p.id === priorityId ? { ...p, completed: !p.completed } : p
        ),
        updatedAt: new Date().toISOString(),
      },
    });

    await get().saveCurrentWeek();
  },

  reorderDayPriorities: async (dayIndex: number, priorityIds: string[]) => {
    const week = get().currentWeek;
    if (!week) throw new Error("No week loaded");

    set({
      currentWeek: {
        ...week,
        dayPriorities: week.dayPriorities.map((p) => {
          if (p.dayIndex !== dayIndex) return p;
          const newOrder = priorityIds.indexOf(p.id);
          return newOrder >= 0 ? { ...p, order: newOrder } : p;
        }),
        updatedAt: new Date().toISOString(),
      },
    });

    await get().saveCurrentWeek();
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

    set({
      currentWeek: {
        ...week,
        timeBlocks: [...week.timeBlocks, block],
        updatedAt: new Date().toISOString(),
      },
    });

    await get().saveCurrentWeek();
    return block;
  },

  updateTimeBlock: async (blockId: string, updates: Partial<Omit<TimeBlock, "id">>) => {
    const week = get().currentWeek;
    if (!week) throw new Error("No week loaded");

    set({
      currentWeek: {
        ...week,
        timeBlocks: week.timeBlocks.map((b) =>
          b.id === blockId ? { ...b, ...updates } : b
        ),
        updatedAt: new Date().toISOString(),
      },
    });

    await get().saveCurrentWeek();
  },

  deleteTimeBlock: async (blockId: string) => {
    const week = get().currentWeek;
    if (!week) throw new Error("No week loaded");

    set({
      currentWeek: {
        ...week,
        timeBlocks: week.timeBlocks.filter((b) => b.id !== blockId),
        updatedAt: new Date().toISOString(),
      },
    });

    await get().saveCurrentWeek();
  },

  toggleTimeBlockCompleted: async (blockId: string) => {
    const week = get().currentWeek;
    if (!week) throw new Error("No week loaded");

    set({
      currentWeek: {
        ...week,
        timeBlocks: week.timeBlocks.map((b) =>
          b.id === blockId ? { ...b, completed: !b.completed } : b
        ),
        updatedAt: new Date().toISOString(),
      },
    });

    await get().saveCurrentWeek();
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

    set({
      currentWeek: {
        ...week,
        eveningBlocks: [...week.eveningBlocks, block],
        updatedAt: new Date().toISOString(),
      },
    });

    await get().saveCurrentWeek();
    return block;
  },

  updateEveningBlock: async (blockId: string, updates: Partial<Omit<EveningBlock, "id">>) => {
    const week = get().currentWeek;
    if (!week) throw new Error("No week loaded");

    set({
      currentWeek: {
        ...week,
        eveningBlocks: week.eveningBlocks.map((b) =>
          b.id === blockId ? { ...b, ...updates } : b
        ),
        updatedAt: new Date().toISOString(),
      },
    });

    await get().saveCurrentWeek();
  },

  deleteEveningBlock: async (blockId: string) => {
    const week = get().currentWeek;
    if (!week) throw new Error("No week loaded");

    set({
      currentWeek: {
        ...week,
        eveningBlocks: week.eveningBlocks.filter((b) => b.id !== blockId),
        updatedAt: new Date().toISOString(),
      },
    });

    await get().saveCurrentWeek();
  },

  toggleEveningBlockCompleted: async (blockId: string) => {
    const week = get().currentWeek;
    if (!week) throw new Error("No week loaded");

    set({
      currentWeek: {
        ...week,
        eveningBlocks: week.eveningBlocks.map((b) =>
          b.id === blockId ? { ...b, completed: !b.completed } : b
        ),
        updatedAt: new Date().toISOString(),
      },
    });

    await get().saveCurrentWeek();
  },
}));

// ============================================================================
// Selector Hooks (for performance optimization)
// ============================================================================

/**
 * Get roles sorted by order.
 */
export const selectSortedRoles = (state: WeekStore): Role[] => {
  return state.currentWeek?.roles.slice().sort((a, b) => a.order - b.order) ?? [];
};

/**
 * Get goals for a specific role.
 */
export const selectGoalsByRole = (state: WeekStore, roleId: string): Goal[] => {
  return state.currentWeek?.goals.filter((g) => g.roleId === roleId) ?? [];
};

/**
 * Get day priorities for a specific day, sorted by order.
 */
export const selectDayPriorities = (state: WeekStore, dayIndex: number): DayPriority[] => {
  return (
    state.currentWeek?.dayPriorities
      .filter((p) => p.dayIndex === dayIndex)
      .sort((a, b) => a.order - b.order) ?? []
  );
};

/**
 * Get time blocks for a specific day.
 */
export const selectTimeBlocksByDay = (state: WeekStore, dayIndex: number): TimeBlock[] => {
  return state.currentWeek?.timeBlocks.filter((b) => b.dayIndex === dayIndex) ?? [];
};

/**
 * Get evening block for a specific day (max 1 per day).
 */
export const selectEveningBlock = (state: WeekStore, dayIndex: number): EveningBlock | undefined => {
  return state.currentWeek?.eveningBlocks.find((b) => b.dayIndex === dayIndex);
};
