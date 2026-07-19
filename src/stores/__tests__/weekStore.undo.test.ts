import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
  getWeek: vi.fn(),
  saveWeek: vi.fn().mockResolvedValue("2026-W01"),
  getAllWeekIds: vi.fn().mockResolvedValue([]),
  getActiveRoles: vi.fn().mockResolvedValue([]),
  searchArchivedRoles: vi.fn().mockResolvedValue([]),
  createRole: vi.fn(),
  updateRoleDefaults: vi.fn(),
  archiveRole: vi.fn(),
  restoreRole: vi.fn(),
  persistRoleOrder: vi.fn(),
}));

import { useWeekStore } from "@/stores/weekStore";
import type { DayPriority, EveningBlock, TimeBlock, Week, WeekId } from "@/types";

function block(overrides: Partial<TimeBlock> = {}): TimeBlock {
  return {
    id: "block-1",
    type: "freestyle",
    dayIndex: 1,
    startSlot: 4,
    duration: 2,
    title: "Deep work",
    completed: true,
    roleId: "role-1",
    ...overrides,
  };
}

function priority(overrides: Partial<DayPriority> = {}): DayPriority {
  return {
    id: "priority-1",
    type: "freestyle",
    text: "Call the bank",
    dayIndex: 2,
    order: 0,
    completed: true,
    ...overrides,
  };
}

function evening(overrides: Partial<EveningBlock> = {}): EveningBlock {
  return {
    id: "evening-1",
    type: "freestyle",
    dayIndex: 3,
    title: "Dinner with L",
    completed: false,
    ...overrides,
  };
}

function makeWeek(overrides: Partial<Week> = {}): Week {
  return {
    id: "2026-W01" as WeekId,
    startDate: "2025-12-29T00:00:00.000Z",
    roles: [{ id: "role-1", name: "Work", color: "teal", order: 0 }],
    goals: [{ id: "goal-1", roleId: "role-1", text: "Ship the report", completed: false }],
    dayPriorities: [],
    timeBlocks: [],
    eveningBlocks: [],
    createdAt: "2025-12-29T00:00:00.000Z",
    updatedAt: "2025-12-29T00:00:00.000Z",
    ...overrides,
  };
}

function seed(week: Week) {
  useWeekStore.setState({
    currentWeek: week,
    selectedWeekId: week.id,
    activeRoles: [],
    availableWeekIds: [week.id],
    isLoading: false,
    error: null,
    lastUndo: null,
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  useWeekStore.getState().reset();
});

describe("undo for deleted time blocks", () => {
  it("captures the deletion and restores the block exactly", async () => {
    seed(makeWeek({ timeBlocks: [block()] }));
    const store = useWeekStore.getState();

    await store.deleteTimeBlock("block-1");
    expect(useWeekStore.getState().currentWeek!.timeBlocks).toHaveLength(0);
    const entry = useWeekStore.getState().lastUndo;
    expect(entry).toMatchObject({ weekId: "2026-W01", label: "Deleted “Deep work”" });

    const message = await useWeekStore.getState().undoLastDelete(entry!.id);
    expect(message).toBeNull();
    expect(useWeekStore.getState().currentWeek!.timeBlocks[0]).toMatchObject({
      id: "block-1",
      startSlot: 4,
      duration: 2,
      completed: true,
      roleId: "role-1",
    });
    expect(useWeekStore.getState().lastUndo).toBeNull();
  });

  it("does not capture the abandoned empty-title draw", async () => {
    seed(makeWeek({ timeBlocks: [block({ title: "" })] }));
    await useWeekStore.getState().deleteTimeBlock("block-1");
    expect(useWeekStore.getState().lastUndo).toBeNull();
  });

  it("refuses to restore over a block that took the space", async () => {
    seed(makeWeek({ timeBlocks: [block()] }));
    await useWeekStore.getState().deleteTimeBlock("block-1");

    // Something new occupies the freed span before Undo.
    await useWeekStore.getState().addTimeBlock({
      type: "freestyle",
      dayIndex: 1,
      startSlot: 4,
      duration: 2,
      title: "Newer",
      completed: false,
    });

    const message = await useWeekStore.getState().undoLastDelete();
    expect(message).toContain("Couldn’t undo");
    const titles = useWeekStore.getState().currentWeek!.timeBlocks.map((b) => b.title);
    expect(titles).toEqual(["Newer"]);
  });
});

describe("undo for priorities and evening blocks", () => {
  it("restores a removed priority with text, completion, and order", async () => {
    seed(makeWeek({ dayPriorities: [priority()] }));
    await useWeekStore.getState().removeDayPriority("priority-1");
    expect(useWeekStore.getState().lastUndo?.label).toBe("Removed “Call the bank”");

    await useWeekStore.getState().undoLastDelete();
    expect(useWeekStore.getState().currentWeek!.dayPriorities[0]).toMatchObject({
      id: "priority-1",
      text: "Call the bank",
      completed: true,
      order: 0,
    });
  });

  it("refuses to restore a priority into a day that has refilled to the cap", async () => {
    seed(makeWeek({ dayPriorities: [priority()] }));
    await useWeekStore.getState().removeDayPriority("priority-1");

    await useWeekStore.getState().addDayPriority({ type: "freestyle", text: "A", dayIndex: 2, completed: false });
    await useWeekStore.getState().addDayPriority({ type: "freestyle", text: "B", dayIndex: 2, completed: false });

    const message = await useWeekStore.getState().undoLastDelete();
    expect(message).not.toBeNull();
    expect(useWeekStore.getState().currentWeek!.dayPriorities).toHaveLength(2);
  });

  it("restores an evening block only while its day stays free", async () => {
    seed(makeWeek({ eveningBlocks: [evening()] }));
    await useWeekStore.getState().deleteEveningBlock("evening-1");

    await useWeekStore.getState().undoLastDelete();
    expect(useWeekStore.getState().currentWeek!.eveningBlocks[0]).toMatchObject({
      id: "evening-1",
      title: "Dinner with L",
    });
  });
});

describe("undo for deleted goals", () => {
  it("restores the goal with its cascaded priorities and goal-linked blocks", async () => {
    seed(
      makeWeek({
        dayPriorities: [priority({ id: "p-goal", type: "goal", goalId: "goal-1", text: undefined })],
        timeBlocks: [
          block({ id: "b-goal", type: "goal", goalId: "goal-1", title: "Ship the report" }),
          block({ id: "b-free", startSlot: 8 }),
        ],
        eveningBlocks: [evening({ id: "e-goal", type: "goal", goalId: "goal-1" })],
      })
    );

    await useWeekStore.getState().deleteGoal("goal-1");
    const midWeek = useWeekStore.getState().currentWeek!;
    expect(midWeek.goals).toHaveLength(0);
    expect(midWeek.timeBlocks.map((b) => b.id)).toEqual(["b-free"]);
    expect(midWeek.dayPriorities).toHaveLength(0);
    expect(midWeek.eveningBlocks).toHaveLength(0);
    expect(useWeekStore.getState().lastUndo?.label).toBe("Deleted goal “Ship the report”");

    const message = await useWeekStore.getState().undoLastDelete();
    expect(message).toBeNull();
    const restored = useWeekStore.getState().currentWeek!;
    expect(restored.goals.map((g) => g.id)).toEqual(["goal-1"]);
    expect(restored.dayPriorities.map((p) => p.id)).toEqual(["p-goal"]);
    expect(restored.timeBlocks.map((b) => b.id).sort()).toEqual(["b-free", "b-goal"]);
    expect(restored.eveningBlocks.map((b) => b.id)).toEqual(["e-goal"]);
  });
});

describe("undo scoping and levels", () => {
  it("is single-level: a second deletion replaces the first entry", async () => {
    seed(makeWeek({ timeBlocks: [block(), block({ id: "block-2", startSlot: 8, title: "Second" })] }));
    await useWeekStore.getState().deleteTimeBlock("block-1");
    const firstEntry = useWeekStore.getState().lastUndo!;
    await useWeekStore.getState().deleteTimeBlock("block-2");
    const secondEntry = useWeekStore.getState().lastUndo!;
    expect(secondEntry.id).not.toBe(firstEntry.id);

    // A stale toast (first entry id) must not undo the newer deletion.
    const staleResult = await useWeekStore.getState().undoLastDelete(firstEntry.id);
    expect(staleResult).toBeNull();
    expect(useWeekStore.getState().currentWeek!.timeBlocks).toHaveLength(0);

    await useWeekStore.getState().undoLastDelete(secondEntry.id);
    expect(useWeekStore.getState().currentWeek!.timeBlocks.map((b) => b.id)).toEqual(["block-2"]);
  });

  it("never mutates a different week than the one the deletion happened in", async () => {
    seed(makeWeek({ timeBlocks: [block()] }));
    await useWeekStore.getState().deleteTimeBlock("block-1");

    const otherWeek = makeWeek({ id: "2026-W02" as WeekId, timeBlocks: [] });
    useWeekStore.setState({ currentWeek: otherWeek, selectedWeekId: otherWeek.id });

    const message = await useWeekStore.getState().undoLastDelete();
    expect(message).toBeNull();
    expect(useWeekStore.getState().currentWeek!.timeBlocks).toHaveLength(0);
    expect(useWeekStore.getState().lastUndo).toBeNull();
  });

  it("keeps edits made between the deletion and the undo", async () => {
    seed(makeWeek({ timeBlocks: [block()] }));
    await useWeekStore.getState().deleteTimeBlock("block-1");
    await useWeekStore.getState().addTimeBlock({
      type: "freestyle",
      dayIndex: 5,
      startSlot: 0,
      duration: 2,
      title: "Unrelated",
      completed: false,
    });

    await useWeekStore.getState().undoLastDelete();
    const titles = useWeekStore.getState().currentWeek!.timeBlocks.map((b) => b.title).sort();
    expect(titles).toEqual(["Deep work", "Unrelated"]);
  });

  it("expires the pending entry when day bounds change (slot indices shift)", async () => {
    seed(makeWeek({ timeBlocks: [block()] }));
    await useWeekStore.getState().deleteTimeBlock("block-1");
    expect(useWeekStore.getState().lastUndo).not.toBeNull();

    await useWeekStore.getState().updateDayBounds({ startHour: 7, endHour: 20 });
    expect(useWeekStore.getState().lastUndo).toBeNull();
  });
});

describe("undo navigation race", () => {
  it("expires the pending entry when navigating to another week", async () => {
    seed(makeWeek({ timeBlocks: [block()] }));
    await useWeekStore.getState().deleteTimeBlock("block-1");
    expect(useWeekStore.getState().lastUndo).not.toBeNull();

    // navigateToWeek clears the entry before the new week's data arrives.
    void useWeekStore.getState().navigateToWeek("2026-W02" as WeekId);
    expect(useWeekStore.getState().lastUndo).toBeNull();
  });

  it("does not restore while the newly selected week is still loading", async () => {
    seed(makeWeek({ timeBlocks: [block()] }));
    await useWeekStore.getState().deleteTimeBlock("block-1");
    const entry = useWeekStore.getState().lastUndo!;

    // Simulate the loading window: selection moved on, currentWeek still stale.
    useWeekStore.setState({ selectedWeekId: "2026-W02" as WeekId, lastUndo: entry });

    const message = await useWeekStore.getState().undoLastDelete(entry.id);
    expect(message).toBeNull();
    expect(useWeekStore.getState().currentWeek!.timeBlocks).toHaveLength(0);
  });
});
