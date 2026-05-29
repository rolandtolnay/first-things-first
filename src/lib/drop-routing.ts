/**
 * Drop Routing — pure DnD dispatch policy.
 *
 * Owns the routing matrix + capacity policy that used to live inside
 * `DndProvider.handleDragEnd`: the `(dragData.type, dropData.zone)` mapping, the
 * priorities-capacity gate, the goal→evening "already occupied" pre-check, and
 * the timegrid `slotIndex` guards. Extracted so the single largest piece of DnD
 * wiring is a plain function — testable by object equality, with no React,
 * dnd-kit, or store dependency.
 *
 * `resolveDrop` returns a plain data *intent* (not a bound thunk) so the routing
 * table is the artifact under test. `dispatchDropIntent` is the thin, mechanical
 * mapping from intent → store action, leaving the component holding only
 * `resolveDrop(...) → dispatchDropIntent(...)`.
 *
 * Only two guards live here; the rest of the rejection policy already lives
 * silently in the store actions (which return `null`):
 *  - priorities capacity (`MAX_PRIORITIES_PER_DAY`) — no store action checks it.
 *  - goal→evening occupied — `addEveningBlock` *throws* on a duplicate, so this
 *    pre-checks to keep drag-and-drop snap-back silent.
 */

import type {
  DayOfWeek,
  TimeSlotIndex,
  DayPriority,
  EveningBlock,
  CreateDayPriorityInput,
  CreateTimeBlockInput,
  CreateEveningBlockInput,
} from "@/types";
import type { DragData, DropZoneData } from "@/types/dnd";
import { MAX_PRIORITIES_PER_DAY } from "@/lib/constants";

// ============================================================================
// Intent — a resolved drop expressed as plain data
// ============================================================================

export type DropIntent =
  | { action: "convertBlockToPriority"; blockId: string; dayIndex: DayOfWeek }
  | { action: "moveBlockToEvening"; blockId: string; dayIndex: DayOfWeek }
  | { action: "moveTimeBlock"; blockId: string; dayIndex: DayOfWeek; slotIndex: TimeSlotIndex }
  | { action: "convertPriorityToBlock"; priorityId: string; dayIndex: DayOfWeek; slotIndex: TimeSlotIndex }
  | { action: "convertPriorityToEvening"; priorityId: string; dayIndex: DayOfWeek }
  | { action: "movePriorityToDay"; priorityId: string; dayIndex: DayOfWeek }
  | { action: "convertEveningToPriority"; eveningBlockId: string; dayIndex: DayOfWeek }
  | { action: "moveEveningToBlock"; eveningBlockId: string; dayIndex: DayOfWeek; slotIndex: TimeSlotIndex }
  | { action: "moveEveningToDay"; eveningBlockId: string; dayIndex: DayOfWeek }
  | { action: "addDayPriority"; input: CreateDayPriorityInput }
  | { action: "placeTimeBlockAt"; input: Omit<CreateTimeBlockInput, "startSlot" | "duration">; slotIndex: TimeSlotIndex }
  | { action: "addEveningBlock"; input: CreateEveningBlockInput };

/**
 * Minimal read-model so the capacity + evening-occupied gates stay pure: only the
 * two arrays those gates inspect, not the whole `Week`.
 */
interface DropSnapshot {
  dayPriorities: DayPriority[];
  eveningBlocks: EveningBlock[];
}

// ============================================================================
// resolveDrop — the routing matrix + capacity policy
// ============================================================================

/**
 * Resolve a (drag, drop) pair to a single store-action intent, or `null` when the
 * drop is a no-op (full priorities, occupied evening, missing slot, or an
 * unmapped zone). Callers handle the `over == null` guard before reaching here.
 */
export function resolveDrop(
  dragData: DragData,
  dropData: DropZoneData,
  snapshot: DropSnapshot
): DropIntent | null {
  const day = dropData.dayIndex;
  const slot = dropData.slotIndex;

  const isPrioritiesFull = (dayIdx: DayOfWeek): boolean =>
    snapshot.dayPriorities.filter((p) => p.dayIndex === dayIdx).length >=
    MAX_PRIORITIES_PER_DAY;

  const isEveningOccupied = (dayIdx: DayOfWeek): boolean =>
    snapshot.eveningBlocks.some((b) => b.dayIndex === dayIdx);

  switch (dragData.type) {
    case "block": {
      const { blockId } = dragData;
      if (dropData.zone === "priorities") {
        if (isPrioritiesFull(day)) return null;
        return { action: "convertBlockToPriority", blockId, dayIndex: day };
      }
      if (dropData.zone === "evening") {
        return { action: "moveBlockToEvening", blockId, dayIndex: day };
      }
      if (dropData.zone === "timegrid" && slot !== undefined) {
        return { action: "moveTimeBlock", blockId, dayIndex: day, slotIndex: slot };
      }
      return null;
    }

    case "priority": {
      const { priorityId } = dragData;
      if (dropData.zone === "timegrid" && slot !== undefined) {
        return { action: "convertPriorityToBlock", priorityId, dayIndex: day, slotIndex: slot };
      }
      if (dropData.zone === "evening") {
        return { action: "convertPriorityToEvening", priorityId, dayIndex: day };
      }
      if (dropData.zone === "priorities") {
        if (isPrioritiesFull(day)) return null;
        return { action: "movePriorityToDay", priorityId, dayIndex: day };
      }
      return null;
    }

    case "evening": {
      const { eveningBlockId } = dragData;
      if (dropData.zone === "priorities") {
        if (isPrioritiesFull(day)) return null;
        return { action: "convertEveningToPriority", eveningBlockId, dayIndex: day };
      }
      if (dropData.zone === "timegrid" && slot !== undefined) {
        return { action: "moveEveningToBlock", eveningBlockId, dayIndex: day, slotIndex: slot };
      }
      if (dropData.zone === "evening") {
        return { action: "moveEveningToDay", eveningBlockId, dayIndex: day };
      }
      return null;
    }

    case "goal": {
      if (dropData.zone === "priorities") {
        if (isPrioritiesFull(day)) return null;
        return {
          action: "addDayPriority",
          input: { goalId: dragData.goalId, dayIndex: day, completed: false },
        };
      }
      if (dropData.zone === "timegrid" && slot !== undefined) {
        return {
          action: "placeTimeBlockAt",
          input: {
            type: "goal",
            goalId: dragData.goalId,
            roleId: dragData.roleId,
            dayIndex: day,
            title: dragData.text,
            completed: false,
          },
          slotIndex: slot,
        };
      }
      if (dropData.zone === "evening") {
        // Single-array create — addEveningBlock throws on a duplicate, so pre-check
        // here to keep snap-back silent.
        if (isEveningOccupied(day)) return null;
        return {
          action: "addEveningBlock",
          input: {
            type: "goal",
            goalId: dragData.goalId,
            roleId: dragData.roleId,
            dayIndex: day,
            title: dragData.text,
            completed: false,
          },
        };
      }
      return null;
    }
  }

  return null;
}

// ============================================================================
// dispatchDropIntent — intent → bound store action
// ============================================================================

/**
 * The 12 store actions the dispatch needs, by name. Declared with `void` returns
 * and `TimeSlotIndex` slots; the real (Promise-returning) store actions are
 * assignable to this shape, so `DndProvider` can pass them straight through.
 */
export interface DropActions {
  convertBlockToPriority: (blockId: string, dayIndex: DayOfWeek) => void;
  moveBlockToEvening: (blockId: string, dayIndex: DayOfWeek) => void;
  moveTimeBlock: (blockId: string, dayIndex: DayOfWeek, slotIndex: TimeSlotIndex) => void;
  convertPriorityToBlock: (priorityId: string, dayIndex: DayOfWeek, slotIndex: TimeSlotIndex) => void;
  convertPriorityToEvening: (priorityId: string, dayIndex: DayOfWeek) => void;
  movePriorityToDay: (priorityId: string, dayIndex: DayOfWeek) => void;
  convertEveningToPriority: (eveningBlockId: string, dayIndex: DayOfWeek) => void;
  moveEveningToBlock: (eveningBlockId: string, dayIndex: DayOfWeek, slotIndex: TimeSlotIndex) => void;
  moveEveningToDay: (eveningBlockId: string, dayIndex: DayOfWeek) => void;
  addDayPriority: (input: CreateDayPriorityInput) => void;
  placeTimeBlockAt: (input: Omit<CreateTimeBlockInput, "startSlot" | "duration">, slotIndex: TimeSlotIndex) => void;
  addEveningBlock: (input: CreateEveningBlockInput) => void;
}

/** Apply a resolved intent by calling its single bound store action. */
export function dispatchDropIntent(intent: DropIntent, actions: DropActions): void {
  switch (intent.action) {
    case "convertBlockToPriority":
      actions.convertBlockToPriority(intent.blockId, intent.dayIndex);
      return;
    case "moveBlockToEvening":
      actions.moveBlockToEvening(intent.blockId, intent.dayIndex);
      return;
    case "moveTimeBlock":
      actions.moveTimeBlock(intent.blockId, intent.dayIndex, intent.slotIndex);
      return;
    case "convertPriorityToBlock":
      actions.convertPriorityToBlock(intent.priorityId, intent.dayIndex, intent.slotIndex);
      return;
    case "convertPriorityToEvening":
      actions.convertPriorityToEvening(intent.priorityId, intent.dayIndex);
      return;
    case "movePriorityToDay":
      actions.movePriorityToDay(intent.priorityId, intent.dayIndex);
      return;
    case "convertEveningToPriority":
      actions.convertEveningToPriority(intent.eveningBlockId, intent.dayIndex);
      return;
    case "moveEveningToBlock":
      actions.moveEveningToBlock(intent.eveningBlockId, intent.dayIndex, intent.slotIndex);
      return;
    case "moveEveningToDay":
      actions.moveEveningToDay(intent.eveningBlockId, intent.dayIndex);
      return;
    case "addDayPriority":
      actions.addDayPriority(intent.input);
      return;
    case "placeTimeBlockAt":
      actions.placeTimeBlockAt(intent.input, intent.slotIndex);
      return;
    case "addEveningBlock":
      actions.addEveningBlock(intent.input);
      return;
  }
}
