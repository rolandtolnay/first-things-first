/**
 * Drag-Drop Type Definitions
 *
 * Types for dnd-kit drag data and drop zone data.
 * Used across draggable goals, droppable zones, and DragOverlay.
 */

import type { DayOfWeek, TimeSlotIndex } from "@/types";

// ============================================================================
// Drag Data Types (attached to draggable items)
// ============================================================================

/**
 * Data attached to draggable goals.
 * Passed via useDraggable's data property.
 */
export interface GoalDragData {
  type: "goal";
  goalId: string;
  roleId: string;
  text: string;
}

/**
 * Data attached to draggable time blocks (for Plan 05-04).
 * Allows moving existing blocks between days.
 */
export interface BlockDragData {
  type: "block";
  blockId: string;
  sourceDay: DayOfWeek;
}

/**
 * Data attached to draggable priority items.
 * Allows moving priorities between days or back to sidebar.
 */
export interface PriorityDragData {
  type: "priority";
  priorityId: string;
  goalId: string;
  roleId: string;
  text: string;
  sourceDayIndex: DayOfWeek;
}

/**
 * Data attached to draggable evening blocks.
 * Allows moving evening blocks between days.
 */
export interface EveningDragData {
  type: "evening";
  eveningBlockId: string;
  goalId?: string;
  roleId?: string;
  title: string;
  sourceDayIndex: DayOfWeek;
}

/**
 * Data attached to sortable Role cards in the Sidebar.
 * Role reorder drags are handled by the Sidebar, not calendar drop routing.
 */
export interface RoleReorderDragData {
  type: "role-reorder";
  roleId: string;
}

/**
 * Union type for all calendar-routable draggable item data.
 */
export type DragData = GoalDragData | BlockDragData | PriorityDragData | EveningDragData;

function isRecord(data: unknown): data is Record<string, unknown> {
  return typeof data === "object" && data !== null;
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isOptionalString(value: unknown): value is string | undefined {
  return value === undefined || isString(value);
}

function isDayOfWeek(value: unknown): value is DayOfWeek {
  return Number.isInteger(value) && typeof value === "number" && value >= 0 && value <= 6;
}

function isTimeSlotIndex(value: unknown): value is TimeSlotIndex {
  return Number.isInteger(value) && typeof value === "number" && value >= 0 && value <= 23;
}

export function isRoleReorderDragData(data: unknown): data is RoleReorderDragData {
  return isRecord(data) && data.type === "role-reorder" && isString(data.roleId);
}

export function isCalendarDragData(data: unknown): data is DragData {
  if (!isRecord(data)) return false;

  switch (data.type) {
    case "goal":
      return isString(data.goalId) && isString(data.roleId) && isString(data.text);
    case "block":
      return isString(data.blockId) && isDayOfWeek(data.sourceDay);
    case "priority":
      return (
        isString(data.priorityId) &&
        isString(data.goalId) &&
        isString(data.roleId) &&
        isString(data.text) &&
        isDayOfWeek(data.sourceDayIndex)
      );
    case "evening":
      return (
        isString(data.eveningBlockId) &&
        isOptionalString(data.goalId) &&
        isOptionalString(data.roleId) &&
        isString(data.title) &&
        isDayOfWeek(data.sourceDayIndex)
      );
    default:
      return false;
  }
}

// ============================================================================
// Drop Zone Types (attached to droppable zones)
// ============================================================================

/**
 * Data attached to droppable zones.
 * Identifies the zone type and context for drop handling.
 */
export interface DropZoneData {
  /** Zone type determines drop behavior */
  zone: "priorities" | "timegrid" | "evening";
  /** Day index (0-6, Sunday-Saturday) */
  dayIndex: DayOfWeek;
  /** Slot index (only for timegrid zone) */
  slotIndex?: TimeSlotIndex;
}

export function isCalendarDropZoneData(data: unknown): data is DropZoneData {
  if (!isRecord(data) || !isDayOfWeek(data.dayIndex)) return false;

  switch (data.zone) {
    case "priorities":
    case "evening":
      return data.slotIndex === undefined;
    case "timegrid":
      return isTimeSlotIndex(data.slotIndex);
    default:
      return false;
  }
}
