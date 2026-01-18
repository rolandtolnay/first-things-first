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
 * Union type for all draggable item data.
 */
export type DragData = GoalDragData | BlockDragData | PriorityDragData | EveningDragData;

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
