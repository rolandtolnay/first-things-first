import { describe, expect, it } from "vitest";
import { isCalendarDragData, isCalendarDropZoneData, isRoleReorderDragData } from "@/types/dnd";

describe("dnd type guards", () => {
  it("validates role reorder drag data", () => {
    expect(isRoleReorderDragData({ type: "role-reorder", roleId: "role-1" })).toBe(true);
    expect(isRoleReorderDragData({ type: "role-reorder" })).toBe(false);
  });

  it("validates full calendar drag payloads", () => {
    expect(isCalendarDragData({ type: "goal", goalId: "goal-1", roleId: "role-1", text: "Ship" })).toBe(true);
    expect(isCalendarDragData({ type: "block", blockId: "block-1", sourceDay: 2 })).toBe(true);
    expect(isCalendarDragData({
      type: "priority",
      priorityId: "priority-1",
      goalId: "goal-1",
      roleId: "role-1",
      text: "Ship",
      sourceDayIndex: 3,
    })).toBe(true);
    expect(isCalendarDragData({
      type: "evening",
      eveningBlockId: "evening-1",
      title: "Read",
      sourceDayIndex: 4,
    })).toBe(true);

    expect(isCalendarDragData({ type: "goal", goalId: "goal-1" })).toBe(false);
    expect(isCalendarDragData({ type: "block", blockId: "block-1", sourceDay: 7 })).toBe(false);
    expect(isCalendarDragData({ type: "evening", eveningBlockId: "evening-1", title: "Read", sourceDayIndex: -1 })).toBe(false);
  });

  it("validates calendar drop zones", () => {
    expect(isCalendarDropZoneData({ zone: "priorities", dayIndex: 1 })).toBe(true);
    expect(isCalendarDropZoneData({ zone: "evening", dayIndex: 6 })).toBe(true);
    expect(isCalendarDropZoneData({ zone: "timegrid", dayIndex: 0, slotIndex: 23 })).toBe(true);

    expect(isCalendarDropZoneData({ zone: "timegrid", dayIndex: 0 })).toBe(false);
    expect(isCalendarDropZoneData({ zone: "priorities", dayIndex: 0, slotIndex: 1 })).toBe(false);
    expect(isCalendarDropZoneData({ zone: "evening", dayIndex: 9 })).toBe(false);
    expect(isCalendarDropZoneData({ zone: "sidebar", dayIndex: 1 })).toBe(false);
  });
});
