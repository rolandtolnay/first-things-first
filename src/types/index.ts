/**
 * First Things First - Data Model Types
 *
 * Week snapshot model: each week is independent, roles/goals copied forward on new week creation.
 * This enables historical accuracy and matches the original Google Sheets mental model.
 */

// ============================================================================
// Helper Types
// ============================================================================

/**
 * Branded string type for week IDs (ISO week format: "2026-W03")
 */
export type WeekId = string & { readonly __brand: "WeekId" };

/**
 * Allowed role colors from the design system palette.
 * Each role gets auto-assigned a unique color.
 */
export type RoleColor =
  | "teal"
  | "amber"
  | "rose"
  | "violet"
  | "emerald"
  | "orange"
  | "sky"
  | "fuchsia";

/**
 * Day of week index (0 = Sunday through 6 = Saturday)
 */
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/**
 * Time slot index for the day schedule.
 * 0 = 8:00, 1 = 8:30, 2 = 9:00, ..., 23 = 19:30
 * (24 slots covering 8:00-20:00 in 30-minute increments)
 */
export type TimeSlotIndex =
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20
  | 21
  | 22
  | 23;

// ============================================================================
// Core Data Types
// ============================================================================

/**
 * Role - a life area/responsibility (e.g., "Family", "Work", "Health")
 * Roles are per-week (snapshot model) with auto-assigned colors.
 */
export interface Role {
  /** UUID */
  id: string;
  /** Display name */
  name: string;
  /** Color from palette for visual coding */
  color: RoleColor;
  /** Display order in sidebar (0-indexed) */
  order: number;
}

/**
 * Goal - a weekly objective belonging to a role
 * Goals can appear in multiple places (role column, day priorities, time blocks)
 * as independent instances with their own completion status.
 */
export interface Goal {
  /** UUID */
  id: string;
  /** References Role.id */
  roleId: string;
  /** Goal text/description */
  text: string;
  /** Optional detailed notes */
  notes?: string;
  /** Completion status in the role column */
  completed: boolean;
}

/**
 * DayPriority - a goal instance in the Day Priorities section
 * Independent completion from the goal's role column status.
 */
export interface DayPriority {
  /** UUID */
  id: string;
  /** References Goal.id */
  goalId: string;
  /** Day index 0-6 (Sunday-Saturday) */
  dayIndex: DayOfWeek;
  /** Position in the priorities list for this day */
  order: number;
  /** Independent completion status */
  completed: boolean;
}

/**
 * TimeBlock - a scheduled time slot on the calendar
 * Can be tied to a goal or created freestyle (manual block).
 */
export interface TimeBlock {
  /** UUID */
  id: string;
  /** Block type: goal-linked or freestyle */
  type: "goal" | "freestyle";
  /** References Goal.id (only if type === 'goal') */
  goalId?: string;
  /** Role ID for color coding (from goal's role or manual assignment) */
  roleId?: string;
  /** Day index 0-6 (Sunday-Saturday) */
  dayIndex: DayOfWeek;
  /**
   * Starting slot index (0-23)
   * 0 = 8:00, 1 = 8:30, 2 = 9:00, ..., 23 = 19:30
   */
  startSlot: TimeSlotIndex;
  /**
   * Duration in 30-minute slots
   * min 1 (30 min), max 24 (12 hours, though practically limited to 16 for 8 hours)
   */
  duration: number;
  /** Display text (goal text or freestyle title) */
  title: string;
  /** Completion status */
  completed: boolean;
}

/**
 * EveningBlock - a single block in the evening slot (after 20:00)
 * Each day can have one evening block.
 */
export interface EveningBlock {
  /** UUID */
  id: string;
  /** Block type: goal-linked or freestyle */
  type: "goal" | "freestyle";
  /** References Goal.id (only if type === 'goal') */
  goalId?: string;
  /** Role ID for color coding */
  roleId?: string;
  /** Day index 0-6 (Sunday-Saturday) */
  dayIndex: DayOfWeek;
  /** Display text (goal text or freestyle title) */
  title: string;
  /** Completion status */
  completed: boolean;
}

// ============================================================================
// Week Container (Snapshot Model)
// ============================================================================

/**
 * Week - the main container for a week's planning data
 *
 * Implements the snapshot model: each week is independent and self-contained.
 * Roles are copied forward when creating a new week (not shared globally).
 * This enables historical accuracy - past weeks display exactly as they were planned.
 */
export interface Week {
  /** ISO week format e.g., "2026-W03" */
  id: WeekId;
  /** ISO date string of Monday (week start) */
  startDate: string;
  /** All roles for this week */
  roles: Role[];
  /** All goals for this week */
  goals: Goal[];
  /** Day priority instances */
  dayPriorities: DayPriority[];
  /** Scheduled time blocks */
  timeBlocks: TimeBlock[];
  /** Evening slot blocks (max 7, one per day) */
  eveningBlocks: EveningBlock[];
  /** ISO datetime when week was created */
  createdAt: string;
  /** ISO datetime of last modification */
  updatedAt: string;
}

// ============================================================================
// Utility Types for Store Operations
// ============================================================================

/**
 * Role creation input (id and order are auto-assigned)
 */
export type CreateRoleInput = Pick<Role, "name">;

/**
 * Goal creation input (id and completed are auto-set)
 */
export type CreateGoalInput = Pick<Goal, "roleId" | "text"> & {
  notes?: string;
};

/**
 * TimeBlock creation input
 */
export type CreateTimeBlockInput = Omit<TimeBlock, "id">;

/**
 * DayPriority creation input
 */
export type CreateDayPriorityInput = Omit<DayPriority, "id" | "order">;

/**
 * EveningBlock creation input
 */
export type CreateEveningBlockInput = Omit<EveningBlock, "id">;
