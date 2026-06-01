import type { Database } from "@/lib/supabase/database.types";

/**
 * First Things First - Data Model Types
 *
 * Week snapshot model: each week is independent and stores Role Snapshots.
 * Durable Roles own default identity/color/order for future Week creation.
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
export type RoleColor = Database["public"]["Enums"]["role_color"];

/**
 * Day of week index (0 = Monday through 6 = Sunday)
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
 * Role - a durable life area/responsibility owned by a User.
 * Week documents contain Role Snapshots, not durable Role records.
 */
export interface Role {
  /** Stable durable Role UUID */
  id: string;
  /** Default display name */
  name: string;
  /** Default color from palette for visual coding */
  color: RoleColor;
  /** Default display order in sidebar (0-indexed) */
  order: number;
  /** ISO datetime when archived, or null when active */
  archivedAt: string | null;
  /** ISO datetime when durable Role was created */
  createdAt: string;
  /** ISO datetime of last durable Role default/archive change */
  updatedAt: string;
}

/**
 * Role Snapshot - the Week-contained display copy of a durable Role.
 * Uses the durable Role ID so Goals can carry across Weeks by Role identity.
 */
export type RoleSnapshot = Pick<Role, "id" | "name" | "color" | "order">;

/**
 * Goal - a weekly objective belonging to a role
 * Goals can appear in multiple places (role column, day priorities, time blocks)
 * as independent instances with their own completion status.
 */
export interface Goal {
  /** UUID */
  id: string;
  /** References RoleSnapshot.id (the durable Role ID) */
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
  /** Day index 0-6 (Monday-Sunday) */
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
  /** Role ID for goal-linked color coding; Freestyle Blocks stay role-less */
  roleId?: string;
  /** Day index 0-6 (Monday-Sunday) */
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
  /** Role ID for goal-linked color coding; Freestyle Blocks stay role-less */
  roleId?: string;
  /** Day index 0-6 (Monday-Sunday) */
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
 * Role Snapshots are created from active durable Roles when creating a new Week.
 * This enables historical accuracy - past weeks display exactly as they were planned.
 */
export interface Week {
  /** ISO week format e.g., "2026-W03" */
  id: WeekId;
  /** ISO date string of Monday (week start) */
  startDate: string;
  /** Role Snapshots for this week */
  roles: RoleSnapshot[];
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
