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

// ============================================================================
// B3 — Week creation / carry-over
// ============================================================================

describe("createWeek", () => {
  it("persists a newly built Week seeded from active Roles and adds it to the available Week ids", async () => {
    useWeekStore.setState({
      activeRoles: [durableRole({ id: "old-1", name: "Work", color: "teal", order: 0 })],
    });
    vi.clearAllMocks();

    const week = await useWeekStore.getState().createWeek("2026-W05" as WeekId);

    expect(saveWeek).toHaveBeenCalledTimes(1);
    expect(vi.mocked(saveWeek).mock.calls[0][0]).toBe(week);
    expect(useWeekStore.getState().availableWeekIds).toContain("2026-W05");
    expect(week.id).toBe("2026-W05");
    expect(week.roles).toHaveLength(1);
  });
});

describe("createNewWeek", () => {
  function sourceWeek(): Week {
    return {
      ...makeWeek(),
      id: "2026-W04" as WeekId,
      roles: [
        { id: "s-1", name: "Work", color: "teal", order: 0 },
        { id: "s-2", name: "Health", color: "amber", order: 1 },
      ],
      goals: [],
      timeBlocks: [],
      eveningBlocks: [],
    };
  }

  it("persists a Target Week for carried Goals and adds it to the available Week ids", async () => {
    const source = sourceWeek();
    useWeekStore.setState({ activeRoles: source.roles.map(durableRole) });
    vi.clearAllMocks();

    const week = await useWeekStore
      .getState()
      .createNewWeek("2026-W05" as WeekId, {
        sourceWeek: {
          ...source,
          goals: [{ id: "g-1", roleId: "s-1", text: "Ship", completed: false }],
        },
        carryOverGoalIds: ["g-1"],
      });

    expect(saveWeek).toHaveBeenCalledTimes(1);
    expect(vi.mocked(saveWeek).mock.calls[0][0]).toBe(week);
    expect(useWeekStore.getState().availableWeekIds).toContain("2026-W05");
    expect(week.roles).toHaveLength(2);
    expect(week.goals).toHaveLength(1);
  });

  it("persists a fresh Target Week with active Role defaults and no Goals", async () => {
    const source = sourceWeek();
    useWeekStore.setState({ activeRoles: source.roles.map(durableRole) });
    vi.clearAllMocks();

    const week = await useWeekStore
      .getState()
      .createNewWeek("2026-W05" as WeekId, { sourceWeek: source });

    expect(saveWeek).toHaveBeenCalledTimes(1);
    expect(vi.mocked(saveWeek).mock.calls[0][0]).toBe(week);
    expect(week.roles).toHaveLength(2);
    expect(week.goals).toHaveLength(0);
  });
});
