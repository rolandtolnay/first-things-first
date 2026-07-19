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
import { saveWeek } from "@/lib/db";
import type { TimeBlock, Week, WeekId } from "@/types";

function block(overrides: Partial<TimeBlock> = {}): TimeBlock {
  return {
    id: "block-1",
    type: "freestyle",
    dayIndex: 1,
    startSlot: 4, // 10:00 under the default 8:00 start
    duration: 2,
    title: "Deep work",
    completed: false,
    ...overrides,
  };
}

function makeWeek(overrides: Partial<Week> = {}): Week {
  return {
    id: "2026-W01" as WeekId,
    startDate: "2025-12-29T00:00:00.000Z",
    roles: [],
    goals: [],
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
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  useWeekStore.getState().reset();
});

describe("updateDayBounds", () => {
  it("re-indexes block slots so wall-clock times survive a start change", async () => {
    seed(makeWeek({ timeBlocks: [block()] }));

    const message = await useWeekStore
      .getState()
      .updateDayBounds({ startHour: 7, endHour: 20 });

    expect(message).toBeNull();
    const week = useWeekStore.getState().currentWeek!;
    expect(week.dayBounds).toEqual({ startHour: 7, endHour: 20 });
    // 10:00 was slot 4 from an 8:00 start; from a 7:00 start it is slot 6.
    expect(week.timeBlocks[0].startSlot).toBe(6);
    expect(saveWeek).toHaveBeenCalledTimes(1);
  });

  it("refuses narrowing that would strand a block, naming the conflict", async () => {
    // 8:00–9:00 block; moving the start to 9:00 would push it before the day.
    seed(makeWeek({ timeBlocks: [block({ startSlot: 0, dayIndex: 3 })] }));

    const message = await useWeekStore
      .getState()
      .updateDayBounds({ startHour: 9, endHour: 20 });

    expect(message).toContain("Thursday");
    expect(message).toContain("Deep work");
    expect(message).toContain("8:00");
    const week = useWeekStore.getState().currentWeek!;
    expect(week.dayBounds).toBeUndefined();
    expect(week.timeBlocks[0].startSlot).toBe(0);
    expect(saveWeek).not.toHaveBeenCalled();
  });

  it("refuses an end earlier than a scheduled block", async () => {
    // 18:00–20:00 block (slot 20, duration 4); ending at 19:00 strands it.
    seed(makeWeek({ timeBlocks: [block({ startSlot: 20, duration: 4 })] }));

    const message = await useWeekStore
      .getState()
      .updateDayBounds({ startHour: 8, endHour: 19 });

    expect(message).not.toBeNull();
    expect(saveWeek).not.toHaveBeenCalled();
  });

  it("rejects an inverted or out-of-range window", async () => {
    seed(makeWeek());
    const message = await useWeekStore
      .getState()
      .updateDayBounds({ startHour: 12, endHour: 12 });
    expect(message).not.toBeNull();
    expect(saveWeek).not.toHaveBeenCalled();
  });

  it("is a no-op when the bounds do not change", async () => {
    seed(makeWeek());
    const message = await useWeekStore
      .getState()
      .updateDayBounds({ startHour: 8, endHour: 20 });
    expect(message).toBeNull();
    expect(saveWeek).not.toHaveBeenCalled();
  });

  it("keeps wall-clock times through a widen-then-restore round trip", async () => {
    seed(makeWeek({ timeBlocks: [block()] }));
    const store = useWeekStore.getState();

    await store.updateDayBounds({ startHour: 6, endHour: 22 });
    expect(useWeekStore.getState().currentWeek!.timeBlocks[0].startSlot).toBe(8);

    await useWeekStore.getState().updateDayBounds({ startHour: 8, endHour: 20 });
    expect(useWeekStore.getState().currentWeek!.timeBlocks[0].startSlot).toBe(4);
  });
});
