import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the Dexie persistence layer so the store runs in a plain node env and we
// can count persists. saveWeek is the single write path withWeek funnels through.
vi.mock("@/lib/db", () => ({
  db: { weeks: { get: vi.fn(), put: vi.fn() } },
  saveWeek: vi.fn().mockResolvedValue("2026-W01"),
}));

import { useWeekStore } from "@/stores/weekStore";
import { saveWeek } from "@/lib/db";
import type { Week, WeekId, EveningBlock } from "@/types";

function makeWeek(): Week {
  return {
    id: "2026-W01" as WeekId,
    startDate: "2025-12-29T00:00:00.000Z",
    roles: [{ id: "role-1", name: "Work", color: "teal", order: 0 }],
    goals: [{ id: "goal-1", roleId: "role-1", text: "Ship", completed: false }],
    dayPriorities: [],
    timeBlocks: [
      {
        id: "block-1",
        type: "goal",
        goalId: "goal-1",
        roleId: "role-1",
        dayIndex: 1,
        startSlot: 0,
        duration: 2,
        title: "Ship",
        completed: false,
      },
    ],
    eveningBlocks: [],
    createdAt: "2025-12-29T00:00:00.000Z",
    updatedAt: "2025-12-29T00:00:00.000Z",
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  useWeekStore.setState({
    currentWeek: makeWeek(),
    selectedWeekId: "2026-W01" as WeekId,
    isLoading: false,
    error: null,
  });
});

describe("placeTimeBlockAt", () => {
  it("creates a clamped block on a free day with a single persist", async () => {
    const created = await useWeekStore
      .getState()
      .placeTimeBlockAt(
        { type: "goal", goalId: "goal-1", roleId: "role-1", dayIndex: 3, title: "Ship", completed: false },
        0,
        8
      );

    expect(saveWeek).toHaveBeenCalledTimes(1);
    expect(created).toMatchObject({ dayIndex: 3, startSlot: 0, duration: 8 });
  });

  it("rejects an occupied slot without persisting", async () => {
    // day 1 slot 0 is occupied by block-1
    const created = await useWeekStore
      .getState()
      .placeTimeBlockAt(
        { type: "goal", goalId: "goal-1", roleId: "role-1", dayIndex: 1, title: "Ship", completed: false },
        0
      );

    expect(created).toBeNull();
    expect(saveWeek).not.toHaveBeenCalled();
  });
});

describe("moveTimeBlock", () => {
  it("moves within the grid with a single persist", async () => {
    const moved = await useWeekStore.getState().moveTimeBlock("block-1", 2, 4);

    expect(saveWeek).toHaveBeenCalledTimes(1);
    expect(moved).toMatchObject({ dayIndex: 2, startSlot: 4 });
    expect(useWeekStore.getState().currentWeek!.timeBlocks[0]).toMatchObject({
      dayIndex: 2,
      startSlot: 4,
    });
  });

  it("rejects (no persist) when the full duration would overlap", async () => {
    useWeekStore.setState((s) => ({
      currentWeek: {
        ...s.currentWeek!,
        timeBlocks: [
          ...s.currentWeek!.timeBlocks,
          {
            id: "block-2",
            type: "freestyle",
            dayIndex: 1,
            startSlot: 4,
            duration: 2,
            title: "Busy",
            completed: false,
          },
        ],
      },
    }));
    vi.clearAllMocks();

    // block-1 has duration 2; moving to slot 4 would collide with block-2 (4-6)
    const moved = await useWeekStore.getState().moveTimeBlock("block-1", 1, 4);

    expect(moved).toBeNull();
    expect(saveWeek).not.toHaveBeenCalled();
  });
});

describe("resizeTimeBlock", () => {
  it("clamps the resize to free space and persists once", async () => {
    // add a block at slot 6 so block-1 (start 0) can only grow to 6 slots
    useWeekStore.setState((s) => ({
      currentWeek: {
        ...s.currentWeek!,
        timeBlocks: [
          ...s.currentWeek!.timeBlocks,
          {
            id: "block-2",
            type: "freestyle",
            dayIndex: 1,
            startSlot: 6,
            duration: 2,
            title: "Busy",
            completed: false,
          },
        ],
      },
    }));
    vi.clearAllMocks();

    await useWeekStore.getState().resizeTimeBlock("block-1", 10);

    expect(saveWeek).toHaveBeenCalledTimes(1);
    const b1 = useWeekStore
      .getState()
      .currentWeek!.timeBlocks.find((b) => b.id === "block-1")!;
    expect(b1.duration).toBe(6);
  });
});

describe("cross-zone atomicity", () => {
  it("moveBlockToEvening updates both arrays in a single persist", async () => {
    const evening = await useWeekStore.getState().moveBlockToEvening("block-1", 1);

    expect(saveWeek).toHaveBeenCalledTimes(1); // atomicity proof: one write
    const week = useWeekStore.getState().currentWeek!;
    expect(week.timeBlocks).toHaveLength(0);
    expect(week.eveningBlocks).toHaveLength(1);
    expect(evening).toMatchObject({
      dayIndex: 1,
      goalId: "goal-1",
      roleId: "role-1",
      title: "Ship",
      type: "goal",
      completed: false,
    });
  });

  it("moveBlockToEvening rejects (no persist) when the evening slot is occupied", async () => {
    const occupying: EveningBlock = {
      id: "ev-x",
      type: "freestyle",
      dayIndex: 1,
      title: "Taken",
      completed: false,
    };
    useWeekStore.setState((s) => ({
      currentWeek: { ...s.currentWeek!, eveningBlocks: [occupying] },
    }));
    vi.clearAllMocks();

    const result = await useWeekStore.getState().moveBlockToEvening("block-1", 1);

    expect(result).toBeNull();
    expect(saveWeek).not.toHaveBeenCalled();
    expect(useWeekStore.getState().currentWeek!.timeBlocks).toHaveLength(1);
  });

  it("convertBlockToPriority moves to priorities and removes the block (one persist)", async () => {
    const priority = await useWeekStore.getState().convertBlockToPriority("block-1", 1);

    expect(saveWeek).toHaveBeenCalledTimes(1);
    const week = useWeekStore.getState().currentWeek!;
    expect(week.timeBlocks).toHaveLength(0);
    expect(week.dayPriorities).toHaveLength(1);
    expect(priority).toMatchObject({ goalId: "goal-1", dayIndex: 1, order: 0, completed: false });
  });

  it("convertPriorityToBlock derives role/title from the goal and clamps placement", async () => {
    useWeekStore.setState((s) => ({
      currentWeek: {
        ...s.currentWeek!,
        timeBlocks: [],
        dayPriorities: [{ id: "prio-1", goalId: "goal-1", dayIndex: 1, order: 0, completed: false }],
      },
    }));
    vi.clearAllMocks();

    const block = await useWeekStore.getState().convertPriorityToBlock("prio-1", 1, 0);

    expect(saveWeek).toHaveBeenCalledTimes(1);
    expect(block).toMatchObject({
      type: "goal",
      goalId: "goal-1",
      roleId: "role-1",
      title: "Ship",
      dayIndex: 1,
      startSlot: 0,
      duration: 2,
    });
    expect(useWeekStore.getState().currentWeek!.dayPriorities).toHaveLength(0);
  });
});
