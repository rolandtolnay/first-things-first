import { describe, it, expect, vi } from "vitest";
import {
  resolveDrop,
  resolveTimeGridDropPreview,
  dispatchDropIntent,
  type DropActions,
} from "@/lib/drop-routing";
import { MAX_PRIORITIES_PER_DAY } from "@/lib/constants";
import type {
  GoalDragData,
  BlockDragData,
  PriorityDragData,
  EveningDragData,
  DropZoneData,
} from "@/types/dnd";
import type { DayPriority, EveningBlock, Role, TimeBlock } from "@/types";

// ============================================================================
// Fixtures
// ============================================================================

const TARGET_DAY = 2;

const blockDrag: BlockDragData = { type: "block", blockId: "block-1", sourceDay: 1 };
const priorityDrag: PriorityDragData = {
  type: "priority",
  priorityId: "prio-1",
  goalId: "goal-1",
  roleId: "role-1",
  text: "Ship",
  sourceDayIndex: 1,
};
const eveningDrag: EveningDragData = {
  type: "evening",
  eveningBlockId: "ev-1",
  goalId: "goal-1",
  roleId: "role-1",
  title: "Ship",
  sourceDayIndex: 1,
};
const goalDrag: GoalDragData = { type: "goal", goalId: "goal-1", roleId: "role-1", text: "Ship" };

const prioritiesZone: DropZoneData = { zone: "priorities", dayIndex: TARGET_DAY };
const eveningZone: DropZoneData = { zone: "evening", dayIndex: TARGET_DAY };
const timegridZone: DropZoneData = { zone: "timegrid", dayIndex: TARGET_DAY, slotIndex: 4 };

/** Free snapshot: no priorities and no evening blocks anywhere. */
const free = { dayPriorities: [] as DayPriority[], eveningBlocks: [] as EveningBlock[] };

function fullPriorities(dayIndex: number): DayPriority[] {
  return Array.from({ length: MAX_PRIORITIES_PER_DAY }, (_, i) => ({
    id: `p${i}`,
    goalId: "goal-1",
    dayIndex: dayIndex as DayPriority["dayIndex"],
    order: i,
    completed: false,
  }));
}

function timeBlock(id: string, startSlot: number, duration: number, roleId = "role-1"): TimeBlock {
  return {
    id,
    type: "goal",
    goalId: "goal-1",
    roleId,
    dayIndex: TARGET_DAY,
    startSlot: startSlot as TimeBlock["startSlot"],
    duration,
    title: "Ship",
    completed: false,
  };
}

const roles: Role[] = [{ id: "role-1", name: "Work", color: "teal", order: 0 }];

// ============================================================================
// The 12-route table on a free snapshot (object equality)
// ============================================================================

describe("resolveDrop — routing matrix (free snapshot)", () => {
  it("block → priorities", () => {
    expect(resolveDrop(blockDrag, prioritiesZone, free)).toEqual({
      action: "convertBlockToPriority",
      blockId: "block-1",
      dayIndex: TARGET_DAY,
    });
  });

  it("block → evening", () => {
    expect(resolveDrop(blockDrag, eveningZone, free)).toEqual({
      action: "moveBlockToEvening",
      blockId: "block-1",
      dayIndex: TARGET_DAY,
    });
  });

  it("block → timegrid", () => {
    expect(resolveDrop(blockDrag, timegridZone, free)).toEqual({
      action: "moveTimeBlock",
      blockId: "block-1",
      dayIndex: TARGET_DAY,
      slotIndex: 4,
    });
  });

  it("priority → timegrid", () => {
    expect(resolveDrop(priorityDrag, timegridZone, free)).toEqual({
      action: "convertPriorityToBlock",
      priorityId: "prio-1",
      dayIndex: TARGET_DAY,
      slotIndex: 4,
    });
  });

  it("priority → evening", () => {
    expect(resolveDrop(priorityDrag, eveningZone, free)).toEqual({
      action: "convertPriorityToEvening",
      priorityId: "prio-1",
      dayIndex: TARGET_DAY,
    });
  });

  it("priority → priorities", () => {
    expect(resolveDrop(priorityDrag, prioritiesZone, free)).toEqual({
      action: "movePriorityToDay",
      priorityId: "prio-1",
      dayIndex: TARGET_DAY,
    });
  });

  it("evening → priorities", () => {
    expect(resolveDrop(eveningDrag, prioritiesZone, free)).toEqual({
      action: "convertEveningToPriority",
      eveningBlockId: "ev-1",
      dayIndex: TARGET_DAY,
    });
  });

  it("evening → timegrid", () => {
    expect(resolveDrop(eveningDrag, timegridZone, free)).toEqual({
      action: "moveEveningToBlock",
      eveningBlockId: "ev-1",
      dayIndex: TARGET_DAY,
      slotIndex: 4,
    });
  });

  it("evening → evening", () => {
    expect(resolveDrop(eveningDrag, eveningZone, free)).toEqual({
      action: "moveEveningToDay",
      eveningBlockId: "ev-1",
      dayIndex: TARGET_DAY,
    });
  });

  it("goal → priorities", () => {
    expect(resolveDrop(goalDrag, prioritiesZone, free)).toEqual({
      action: "addDayPriority",
      input: { goalId: "goal-1", dayIndex: TARGET_DAY, completed: false },
    });
  });

  it("goal → timegrid", () => {
    expect(resolveDrop(goalDrag, timegridZone, free)).toEqual({
      action: "placeTimeBlockAt",
      input: {
        type: "goal",
        goalId: "goal-1",
        roleId: "role-1",
        dayIndex: TARGET_DAY,
        title: "Ship",
        completed: false,
      },
      slotIndex: 4,
    });
  });

  it("goal → evening", () => {
    expect(resolveDrop(goalDrag, eveningZone, free)).toEqual({
      action: "addEveningBlock",
      input: {
        type: "goal",
        goalId: "goal-1",
        roleId: "role-1",
        dayIndex: TARGET_DAY,
        title: "Ship",
        completed: false,
      },
    });
  });
});

// ============================================================================
// Capacity gate — the 4 priorities-target routes
// ============================================================================

describe("resolveDrop — priorities capacity gate", () => {
  const fullSnapshot = { dayPriorities: fullPriorities(TARGET_DAY), eveningBlocks: [] };

  it("rejects all 4 priorities-target routes when the day is full", () => {
    expect(resolveDrop(blockDrag, prioritiesZone, fullSnapshot)).toBeNull();
    expect(resolveDrop(priorityDrag, prioritiesZone, fullSnapshot)).toBeNull();
    expect(resolveDrop(eveningDrag, prioritiesZone, fullSnapshot)).toBeNull();
    expect(resolveDrop(goalDrag, prioritiesZone, fullSnapshot)).toBeNull();
  });

  it("allows the routes when the day is below capacity", () => {
    const belowSnapshot = { dayPriorities: fullPriorities(TARGET_DAY).slice(0, MAX_PRIORITIES_PER_DAY - 1), eveningBlocks: [] };
    expect(resolveDrop(blockDrag, prioritiesZone, belowSnapshot)).not.toBeNull();
    expect(resolveDrop(priorityDrag, prioritiesZone, belowSnapshot)).not.toBeNull();
    expect(resolveDrop(eveningDrag, prioritiesZone, belowSnapshot)).not.toBeNull();
    expect(resolveDrop(goalDrag, prioritiesZone, belowSnapshot)).not.toBeNull();
  });

  it("counts only the target day toward capacity", () => {
    // Full on a different day must not block the target day.
    const otherDayFull = { dayPriorities: fullPriorities(5), eveningBlocks: [] };
    expect(resolveDrop(goalDrag, prioritiesZone, otherDayFull)).not.toBeNull();
  });
});

// ============================================================================
// goal → evening occupied gate
// ============================================================================

describe("resolveDrop — goal→evening occupied gate", () => {
  it("rejects when an evening block already exists for the day", () => {
    const occupied = {
      dayPriorities: [],
      eveningBlocks: [
        { id: "ev-x", type: "freestyle", dayIndex: TARGET_DAY, title: "Taken", completed: false } as EveningBlock,
      ],
    };
    expect(resolveDrop(goalDrag, eveningZone, occupied)).toBeNull();
  });

  it("allows when the evening slot is occupied on a different day", () => {
    const otherDay = {
      dayPriorities: [],
      eveningBlocks: [
        { id: "ev-x", type: "freestyle", dayIndex: 5, title: "Taken", completed: false } as EveningBlock,
      ],
    };
    expect(resolveDrop(goalDrag, eveningZone, otherDay)).not.toBeNull();
  });
});

// ============================================================================
// timegrid slot guard — routes that need a slotIndex
// ============================================================================

describe("resolveDrop — timegrid slot guard", () => {
  const noSlot: DropZoneData = { zone: "timegrid", dayIndex: TARGET_DAY }; // slotIndex undefined

  it("returns null for every timegrid route when slotIndex is undefined", () => {
    expect(resolveDrop(blockDrag, noSlot, free)).toBeNull();
    expect(resolveDrop(priorityDrag, noSlot, free)).toBeNull();
    expect(resolveDrop(eveningDrag, noSlot, free)).toBeNull();
    expect(resolveDrop(goalDrag, noSlot, free)).toBeNull();
  });
});

// ============================================================================
// resolveTimeGridDropPreview — canonical intent + scheduling preview
// ============================================================================

describe("resolveTimeGridDropPreview", () => {
  it("previews a goal drop using the canonical new-placement policy", () => {
    expect(
      resolveTimeGridDropPreview(goalDrag, { ...timegridZone, slotIndex: 23 }, TARGET_DAY, {
        timeBlocks: [],
        roles,
      })
    ).toEqual({ startSlot: 22, duration: 2, roleColor: "teal" });
  });

  it("previews a block move using the existing block duration and role color", () => {
    expect(
      resolveTimeGridDropPreview(blockDrag, { ...timegridZone, slotIndex: 23 }, TARGET_DAY, {
        timeBlocks: [timeBlock("block-1", 0, 6)],
        roles,
      })
    ).toEqual({ startSlot: 18, duration: 6, roleColor: "teal" });
  });

  it("returns null when the canonical drop route is not a time-grid placement", () => {
    expect(
      resolveTimeGridDropPreview(goalDrag, prioritiesZone, TARGET_DAY, {
        timeBlocks: [],
        roles,
      })
    ).toBeNull();
  });
});

// ============================================================================
// Unmapped zone — fall-through returns null
// ============================================================================

describe("resolveDrop — unmapped zone", () => {
  // A zone value outside the known set exercises each case's final `return null`.
  const unknownZone = { zone: "sidebar", dayIndex: TARGET_DAY } as unknown as DropZoneData;

  it("returns null for every drag type on an unmapped zone", () => {
    expect(resolveDrop(blockDrag, unknownZone, free)).toBeNull();
    expect(resolveDrop(priorityDrag, unknownZone, free)).toBeNull();
    expect(resolveDrop(eveningDrag, unknownZone, free)).toBeNull();
    expect(resolveDrop(goalDrag, unknownZone, free)).toBeNull();
  });
});

// ============================================================================
// dispatchDropIntent — intent → the right bound store action
// ============================================================================

describe("dispatchDropIntent", () => {
  function spyActions(): DropActions {
    return {
      convertBlockToPriority: vi.fn(),
      moveBlockToEvening: vi.fn(),
      moveTimeBlock: vi.fn(),
      convertPriorityToBlock: vi.fn(),
      convertPriorityToEvening: vi.fn(),
      movePriorityToDay: vi.fn(),
      convertEveningToPriority: vi.fn(),
      moveEveningToBlock: vi.fn(),
      moveEveningToDay: vi.fn(),
      addDayPriority: vi.fn(),
      placeTimeBlockAt: vi.fn(),
      addEveningBlock: vi.fn(),
    };
  }

  it("routes moveTimeBlock with (blockId, dayIndex, slotIndex)", () => {
    const actions = spyActions();
    dispatchDropIntent(
      { action: "moveTimeBlock", blockId: "block-1", dayIndex: 2, slotIndex: 4 },
      actions
    );
    expect(actions.moveTimeBlock).toHaveBeenCalledWith("block-1", 2, 4);
    expect(actions.moveTimeBlock).toHaveBeenCalledTimes(1);
  });

  it("routes addDayPriority with the input object", () => {
    const actions = spyActions();
    const input = { goalId: "goal-1", dayIndex: 2 as const, completed: false };
    dispatchDropIntent({ action: "addDayPriority", input }, actions);
    expect(actions.addDayPriority).toHaveBeenCalledWith(input);
  });

  it("routes placeTimeBlockAt with (input, slotIndex)", () => {
    const actions = spyActions();
    const input = {
      type: "goal" as const,
      goalId: "goal-1",
      roleId: "role-1",
      dayIndex: 2 as const,
      title: "Ship",
      completed: false,
    };
    dispatchDropIntent({ action: "placeTimeBlockAt", input, slotIndex: 4 }, actions);
    expect(actions.placeTimeBlockAt).toHaveBeenCalledWith(input, 4);
  });

  it("routes convertEveningToPriority with (eveningBlockId, dayIndex)", () => {
    const actions = spyActions();
    dispatchDropIntent(
      { action: "convertEveningToPriority", eveningBlockId: "ev-1", dayIndex: 2 },
      actions
    );
    expect(actions.convertEveningToPriority).toHaveBeenCalledWith("ev-1", 2);
  });

  it("calls exactly one action per intent", () => {
    const actions = spyActions();
    dispatchDropIntent({ action: "moveBlockToEvening", blockId: "block-1", dayIndex: 2 }, actions);

    const calls = Object.values(actions).reduce(
      (sum, fn) => sum + (fn as ReturnType<typeof vi.fn>).mock.calls.length,
      0
    );
    expect(calls).toBe(1);
    expect(actions.moveBlockToEvening).toHaveBeenCalledWith("block-1", 2);
  });
});
