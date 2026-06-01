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
import type { Role, RoleSnapshot, Week, WeekId } from "@/types";

function durableRole(snapshot: RoleSnapshot): Role {
  return {
    ...snapshot,
    archivedAt: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };
}

function makeWeek(): Week {
  return {
    id: "2026-W01" as WeekId,
    startDate: "2025-12-29T00:00:00.000Z",
    roles: [{ id: "role-1", name: "Work", color: "teal", order: 0 }],
    goals: [{ id: "goal-1", roleId: "role-1", text: "Ship", completed: false }],
    dayPriorities: [],
    timeBlocks: [],
    eveningBlocks: [],
    createdAt: "2025-12-29T00:00:00.000Z",
    updatedAt: "2025-12-29T00:00:00.000Z",
  };
}

function seed(week: Week) {
  useWeekStore.setState({
    currentWeek: week,
    selectedWeekId: week.id,
    activeRoles: week.roles.map(durableRole),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  useWeekStore.getState().reset();
  useWeekStore.setState({
    currentWeek: makeWeek(),
    selectedWeekId: "2026-W01" as WeekId,
    activeRoles: makeWeek().roles.map(durableRole),
    availableWeekIds: ["2026-W01" as WeekId],
    isLoading: false,
    error: null,
  });
});

describe("moveEveningToDay", () => {
  it("moves to an empty day with reset completion (one persist)", async () => {
    seed({
      ...makeWeek(),
      eveningBlocks: [
        { id: "ev-1", type: "goal", goalId: "goal-1", roleId: "role-1", dayIndex: 1, title: "Ship", completed: true },
      ],
    });
    vi.clearAllMocks();

    const moved = await useWeekStore.getState().moveEveningToDay("ev-1", 3);

    expect(saveWeek).toHaveBeenCalledTimes(1);
    expect(moved).toMatchObject({ dayIndex: 3, goalId: "goal-1", title: "Ship", completed: false });
    expect(moved!.id).not.toBe("ev-1"); // new id
    const week = useWeekStore.getState().currentWeek!;
    expect(week.eveningBlocks).toHaveLength(1);
    expect(week.eveningBlocks[0].dayIndex).toBe(3);
  });

  it("rejects a same-day move (null, no persist)", async () => {
    seed({
      ...makeWeek(),
      eveningBlocks: [{ id: "ev-1", type: "freestyle", dayIndex: 1, title: "Read", completed: false }],
    });
    vi.clearAllMocks();

    const result = await useWeekStore.getState().moveEveningToDay("ev-1", 1);

    expect(result).toBeNull();
    expect(saveWeek).not.toHaveBeenCalled();
  });

  it("rejects when the target day's evening slot is occupied (null, no persist)", async () => {
    seed({
      ...makeWeek(),
      eveningBlocks: [
        { id: "ev-1", type: "freestyle", dayIndex: 1, title: "Read", completed: false },
        { id: "ev-2", type: "freestyle", dayIndex: 2, title: "Taken", completed: false },
      ],
    });
    vi.clearAllMocks();

    const result = await useWeekStore.getState().moveEveningToDay("ev-1", 2);

    expect(result).toBeNull();
    expect(saveWeek).not.toHaveBeenCalled();
    expect(useWeekStore.getState().currentWeek!.eveningBlocks).toHaveLength(2);
  });
});
