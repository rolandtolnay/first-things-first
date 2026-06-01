import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the Supabase persistence adapter so the store runs in a plain node env
// and we can count persists. saveWeek is the single write path withWeek funnels
// through; getWeek / getAllWeekIds / getActiveRoles back loadWeek / bootstrap.
vi.mock("@/lib/db", () => ({
  getWeek: vi.fn(),
  saveWeek: vi.fn().mockResolvedValue("2026-W01"),
  getAllWeekIds: vi.fn().mockResolvedValue([]),
  getActiveRoles: vi.fn().mockResolvedValue([]),
  searchArchivedRoles: vi.fn().mockResolvedValue([]),
  createRole: vi.fn().mockImplementation((input: { name: string; color: string; order: number }) => Promise.resolve({
    id: `role-${input.name.toLowerCase().replace(/\\s+/g, "-")}`,
    name: input.name,
    color: input.color,
    order: input.order,
    archivedAt: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  })),
  updateRoleDefaults: vi.fn().mockImplementation((role: { id: string; name: string; color: string; order: number }) => Promise.resolve({
    id: role.id,
    name: role.name,
    color: role.color,
    order: role.order,
    archivedAt: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  })),
  archiveRole: vi.fn().mockImplementation((role: { id: string; name: string; color: string; order: number }) => Promise.resolve({
    id: role.id,
    name: role.name,
    color: role.color,
    order: role.order,
    archivedAt: "2026-01-02T00:00:00.000Z",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-02T00:00:00.000Z",
  })),
  restoreRole: vi.fn().mockImplementation((roleId: string, updates: { name: string; order: number }) => Promise.resolve({
    id: roleId,
    name: updates.name,
    color: "teal",
    order: updates.order,
    archivedAt: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-02T00:00:00.000Z",
  })),
  persistRoleOrder: vi.fn().mockImplementation((roleIds: string[]) => Promise.resolve(
    roleIds.map((roleId, order) => ({
      id: roleId,
      name: roleId,
      color: "teal",
      order,
      archivedAt: null,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    }))
  )),
}));

import { useWeekStore } from "@/stores/weekStore";
import { getActiveRoles, getAllWeekIds, getWeek, saveWeek } from "@/lib/db";
import type { Week, WeekId, EveningBlock, CreateDayPriorityInput, Role, RoleSnapshot } from "@/types";

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

describe("bootstrap", () => {
  it("loads an existing week even when durable role defaults fail", async () => {
    useWeekStore.getState().reset();
    vi.mocked(getActiveRoles).mockRejectedValueOnce({ message: "roles endpoint unavailable" });
    vi.mocked(getAllWeekIds).mockResolvedValueOnce(["2026-W01" as WeekId]);
    vi.mocked(getWeek).mockResolvedValueOnce(makeWeek());

    await useWeekStore.getState().bootstrap();

    expect(useWeekStore.getState().currentWeek).toMatchObject({ id: "2026-W01" });
    expect(useWeekStore.getState().availableWeekIds).toEqual(["2026-W01"]);
    expect(useWeekStore.getState().activeRoles).toEqual([]);
    expect(useWeekStore.getState().isLoading).toBe(false);
    expect(useWeekStore.getState().error).toBe("roles endpoint unavailable");
  });

  it("creates a first week with no snapshots when role defaults fail on first sign-in", async () => {
    useWeekStore.getState().reset();
    vi.mocked(getActiveRoles).mockRejectedValueOnce({ message: "roles endpoint unavailable" });
    vi.mocked(getAllWeekIds).mockResolvedValueOnce([]);

    await useWeekStore.getState().bootstrap();

    const state = useWeekStore.getState();
    expect(state.currentWeek).not.toBeNull();
    expect(state.currentWeek!.roles).toEqual([]);
    expect(state.selectedWeekId).toBe(state.currentWeek!.id);
    expect(state.activeRoles).toEqual([]);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBe("roles endpoint unavailable");
  });
});

describe("save failure surfacing", () => {
  it("sets error and keeps the optimistic edit when saveWeek rejects", async () => {
    vi.mocked(saveWeek).mockRejectedValueOnce(new Error("network down"));

    // addRole optimistically updates state, then persists via saveCurrentWeek.
    await useWeekStore.getState().addRole({ name: "Offline" });

    // The failure surfaces through the shared error state...
    expect(useWeekStore.getState().error).toBe("network down");
    // ...and the user's edit is NOT silently dropped.
    expect(
      useWeekStore.getState().currentWeek!.roles.some((r) => r.name === "Offline")
    ).toBe(true);
  });

  it("clears a stale error once a later save succeeds", async () => {
    vi.mocked(saveWeek).mockRejectedValueOnce(new Error("network down"));
    await useWeekStore.getState().addRole({ name: "First" });
    expect(useWeekStore.getState().error).toBe("network down");

    // saveWeek reverts to its default resolved value for the next call.
    await useWeekStore.getState().addRole({ name: "Second" });
    expect(useWeekStore.getState().error).toBeNull();
  });

  it("keeps a pending optimistic snapshot instead of reloading a stale row", async () => {
    let resolveSave!: (weekId: WeekId) => void;
    vi.mocked(saveWeek).mockImplementationOnce(
      () => new Promise<WeekId>((resolve) => {
        resolveSave = resolve;
      }),
    );

    const savePromise = useWeekStore.getState().addRole({ name: "Pending" });
    await Promise.resolve();
    useWeekStore.setState({ currentWeek: null, selectedWeekId: "2026-W01" as WeekId });
    vi.mocked(getWeek).mockResolvedValueOnce(makeWeek());

    await useWeekStore.getState().loadWeek("2026-W01" as WeekId);

    expect(getWeek).not.toHaveBeenCalled();
    expect(
      useWeekStore.getState().currentWeek!.roles.some((r) => r.name === "Pending"),
    ).toBe(true);

    resolveSave("2026-W01" as WeekId);
    await savePromise;
  });

  it("does not let an older same-timestamp save clear the newest pending snapshot", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));

    let resolveFirst!: (weekId: WeekId) => void;
    let resolveSecond!: (weekId: WeekId) => void;
    vi.mocked(saveWeek)
      .mockImplementationOnce(
        () => new Promise<WeekId>((resolve) => {
          resolveFirst = resolve;
        }),
      )
      .mockImplementationOnce(
        () => new Promise<WeekId>((resolve) => {
          resolveSecond = resolve;
        }),
      );

    try {
      const firstSave = useWeekStore.getState().addRole({ name: "First pending" });
      await Promise.resolve();
      await Promise.resolve();
      const secondSave = useWeekStore.getState().addRole({ name: "Second pending" });
      await Promise.resolve();
      await Promise.resolve();

      resolveFirst("2026-W01" as WeekId);
      await firstSave;
      await Promise.resolve();

      useWeekStore.setState({ currentWeek: null, selectedWeekId: "2026-W01" as WeekId });
      vi.mocked(getWeek).mockResolvedValueOnce(makeWeek());

      await useWeekStore.getState().loadWeek("2026-W01" as WeekId);

      expect(getWeek).not.toHaveBeenCalled();
      const roleNames = useWeekStore.getState().currentWeek!.roles.map((r) => r.name);
      expect(roleNames).toContain("First pending");
      expect(roleNames).toContain("Second pending");

      resolveSecond("2026-W01" as WeekId);
      await secondSave;
    } finally {
      vi.useRealTimers();
    }
  });
});

describe("clearCurrentWeek", () => {
  it("empties the current week and persists once", async () => {
    await useWeekStore.getState().clearCurrentWeek();

    expect(saveWeek).toHaveBeenCalledTimes(1);
    expect(useWeekStore.getState().currentWeek).toMatchObject({
      id: "2026-W01",
      roles: [],
      goals: [],
      dayPriorities: [],
      timeBlocks: [],
      eveningBlocks: [],
    });
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

// ============================================================================
// Shared fixtures for the CRUD / cascade / cross-zone blocks below.
// ============================================================================

/**
 * Richer week for cascade tests: a goal referenced by a priority, a goal-type
 * time block, and a goal-type evening block — PLUS a freestyle block and a
 * freestyle evening that MUST survive role/goal deletion. role-2 / goal-2 give
 * the cascade a sibling that should be left untouched.
 */
function makeRichWeek(): Week {
  return {
    id: "2026-W01" as WeekId,
    startDate: "2025-12-29T00:00:00.000Z",
    roles: [
      { id: "role-1", name: "Work", color: "teal", order: 0 },
      { id: "role-2", name: "Health", color: "amber", order: 1 },
    ],
    goals: [
      { id: "goal-1", roleId: "role-1", text: "Ship", completed: false },
      { id: "goal-2", roleId: "role-2", text: "Run", completed: false },
    ],
    dayPriorities: [
      { id: "prio-1", goalId: "goal-1", dayIndex: 1, order: 0, completed: false },
    ],
    timeBlocks: [
      {
        id: "block-goal",
        type: "goal",
        goalId: "goal-1",
        roleId: "role-1",
        dayIndex: 1,
        startSlot: 0,
        duration: 2,
        title: "Ship",
        completed: false,
      },
      {
        id: "block-free",
        type: "freestyle",
        dayIndex: 2,
        startSlot: 0,
        duration: 2,
        title: "Gym",
        completed: false,
      },
    ],
    eveningBlocks: [
      {
        id: "ev-goal",
        type: "goal",
        goalId: "goal-1",
        roleId: "role-1",
        dayIndex: 1,
        title: "Ship",
        completed: false,
      },
      { id: "ev-free", type: "freestyle", dayIndex: 2, title: "Read", completed: false },
    ],
    createdAt: "2025-12-29T00:00:00.000Z",
    updatedAt: "2025-12-29T00:00:00.000Z",
  };
}

/** Replace the loaded week without touching the rest of the store slice. */
function seed(week: Week) {
  useWeekStore.setState({ currentWeek: week });
}

// ============================================================================
// B1 — Role / Goal / Priority / Block CRUD + cascades
// ============================================================================

describe("addRole", () => {
  it("appends at maxOrder + 1 despite post-deletion order gaps, assigns the next color, one persist", async () => {
    // Two roles but with an order gap (a deletion left order 0 and order 3).
    const week: Week = {
      ...makeWeek(),
      roles: [
        { id: "r-a", name: "A", color: "teal", order: 0 },
        { id: "r-b", name: "B", color: "rose", order: 3 },
      ],
    };
    seed(week);
    useWeekStore.setState({ activeRoles: week.roles.map(durableRole) });
    vi.clearAllMocks();

    const role = await useWeekStore.getState().addRole({ name: "C" });

    expect(saveWeek).toHaveBeenCalledTimes(1);
    expect(role.order).toBe(4); // maxOrder(3) + 1, not roles.length(2)
    expect(role.color).toBe("violet"); // first unused palette color, despite the order gap
    expect(useWeekStore.getState().currentWeek!.roles).toHaveLength(3);
  });
});

describe("updateRole", () => {
  it("persists one Week update and changes only the targeted Role color", async () => {
    seed(makeRichWeek());
    vi.clearAllMocks();

    await useWeekStore.getState().updateRole("role-1", { color: "violet" });

    expect(saveWeek).toHaveBeenCalledTimes(1);
    const week = useWeekStore.getState().currentWeek!;
    expect(week.roles).toEqual([
      { id: "role-1", name: "Work", color: "violet", order: 0 },
      { id: "role-2", name: "Health", color: "amber", order: 1 },
    ]);
    expect(week.goals).toEqual(makeRichWeek().goals);
    expect(week.dayPriorities).toEqual(makeRichWeek().dayPriorities);
    expect(week.timeBlocks).toEqual(makeRichWeek().timeBlocks);
    expect(week.eveningBlocks).toEqual(makeRichWeek().eveningBlocks);
  });
});

describe("reorderRoles", () => {
  it("sets each role's order to its index in the id list", async () => {
    const week: Week = {
      ...makeWeek(),
      roles: [
        { id: "role-1", name: "A", color: "teal", order: 0 },
        { id: "role-2", name: "B", color: "amber", order: 1 },
        { id: "role-3", name: "C", color: "rose", order: 2 },
      ],
    };
    seed(week);
    useWeekStore.setState({ activeRoles: week.roles.map(durableRole) });
    vi.clearAllMocks();

    await useWeekStore.getState().reorderRoles(["role-3", "role-1", "role-2"]);

    expect(saveWeek).toHaveBeenCalledTimes(1);
    const orderById = Object.fromEntries(
      useWeekStore.getState().currentWeek!.roles.map((r) => [r.id, r.order])
    );
    expect(orderById).toEqual({ "role-3": 0, "role-1": 1, "role-2": 2 });
  });

  it("ignores incomplete role id lists without persisting", async () => {
    seed({
      ...makeWeek(),
      roles: [
        { id: "role-1", name: "A", color: "teal", order: 0 },
        { id: "role-2", name: "B", color: "amber", order: 1 },
        { id: "role-3", name: "C", color: "rose", order: 2 },
      ],
    });
    vi.clearAllMocks();

    await useWeekStore.getState().reorderRoles(["role-3", "role-1"]);

    expect(saveWeek).not.toHaveBeenCalled();
    const orderById = Object.fromEntries(
      useWeekStore.getState().currentWeek!.roles.map((r) => [r.id, r.order])
    );
    expect(orderById).toEqual({ "role-1": 0, "role-2": 1, "role-3": 2 });
  });

  it("ignores duplicate or unknown role ids without persisting", async () => {
    seed({
      ...makeWeek(),
      roles: [
        { id: "role-1", name: "A", color: "teal", order: 0 },
        { id: "role-2", name: "B", color: "amber", order: 1 },
        { id: "role-3", name: "C", color: "rose", order: 2 },
      ],
    });
    vi.clearAllMocks();

    await useWeekStore.getState().reorderRoles(["role-3", "role-3", "missing"]);

    expect(saveWeek).not.toHaveBeenCalled();
    const orderById = Object.fromEntries(
      useWeekStore.getState().currentWeek!.roles.map((r) => [r.id, r.order])
    );
    expect(orderById).toEqual({ "role-1": 0, "role-2": 1, "role-3": 2 });
  });
});

describe("deleteRole cascade", () => {
  it("removes the role + its goals + dependent priorities/blocks/evenings, keeps freestyle and other roles, one persist", async () => {
    seed(makeRichWeek());
    vi.clearAllMocks();

    await useWeekStore.getState().deleteRole("role-1");

    expect(saveWeek).toHaveBeenCalledTimes(1);
    const week = useWeekStore.getState().currentWeek!;
    expect(week.roles.map((r) => r.id)).toEqual(["role-2"]);
    expect(week.goals.map((g) => g.id)).toEqual(["goal-2"]);
    expect(week.dayPriorities).toHaveLength(0); // prio-1 referenced goal-1
    expect(week.timeBlocks.map((b) => b.id)).toEqual(["block-free"]); // goal block gone, freestyle kept
    expect(week.eveningBlocks.map((b) => b.id)).toEqual(["ev-free"]);
  });
});

describe("restoreRole", () => {
  it("does not duplicate an existing historical Role Snapshot", async () => {
    useWeekStore.setState({ activeRoles: [] });
    seed(makeWeek());
    vi.clearAllMocks();

    await useWeekStore.getState().restoreRole({
      id: "role-1",
      name: "Work",
      color: "teal",
      order: 0,
      archivedAt: "2026-01-02T00:00:00.000Z",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-02T00:00:00.000Z",
    });

    expect(saveWeek).toHaveBeenCalledTimes(1);
    expect(useWeekStore.getState().currentWeek!.roles).toEqual([
      { id: "role-1", name: "Work", color: "teal", order: 0 },
    ]);
  });
});

describe("addGoal", () => {
  it("appends a goal with completed=false and persists once", async () => {
    const goal = await useWeekStore
      .getState()
      .addGoal({ roleId: "role-1", text: "Plan", notes: "n" });

    expect(saveWeek).toHaveBeenCalledTimes(1);
    expect(goal).toMatchObject({ roleId: "role-1", text: "Plan", notes: "n", completed: false });
    expect(useWeekStore.getState().currentWeek!.goals).toHaveLength(2);
  });
});

describe("updateGoal", () => {
  it("merges updates and persists once", async () => {
    await useWeekStore.getState().updateGoal("goal-1", { text: "Ship v2", notes: "later" });

    expect(saveWeek).toHaveBeenCalledTimes(1);
    expect(useWeekStore.getState().currentWeek!.goals[0]).toMatchObject({
      text: "Ship v2",
      notes: "later",
    });
  });
});

describe("toggleGoalCompleted", () => {
  it("flips the goal completion flag", async () => {
    await useWeekStore.getState().toggleGoalCompleted("goal-1");

    expect(saveWeek).toHaveBeenCalledTimes(1);
    expect(useWeekStore.getState().currentWeek!.goals[0].completed).toBe(true);
  });
});

describe("deleteGoal cascade", () => {
  it("removes the goal + its priorities/goal-blocks, keeps freestyle and the goal's role, one persist", async () => {
    seed(makeRichWeek());
    vi.clearAllMocks();

    await useWeekStore.getState().deleteGoal("goal-1");

    expect(saveWeek).toHaveBeenCalledTimes(1);
    const week = useWeekStore.getState().currentWeek!;
    expect(week.roles).toHaveLength(2); // roles untouched
    expect(week.goals.map((g) => g.id)).toEqual(["goal-2"]);
    expect(week.dayPriorities).toHaveLength(0);
    expect(week.timeBlocks.map((b) => b.id)).toEqual(["block-free"]);
    expect(week.eveningBlocks.map((b) => b.id)).toEqual(["ev-free"]);
  });
});

describe("addDayPriority", () => {
  it("orders by the count already on that day and persists once each", async () => {
    const first = await useWeekStore
      .getState()
      .addDayPriority({ goalId: "goal-1", dayIndex: 3, completed: false });
    const second = await useWeekStore
      .getState()
      .addDayPriority({ goalId: "goal-1", dayIndex: 3, completed: false });

    expect(first.order).toBe(0);
    expect(second.order).toBe(1);
    expect(saveWeek).toHaveBeenCalledTimes(2);
  });

  it("defaults completed to false when omitted (runtime ?? guard)", async () => {
    // The type requires `completed`, but the action falls back to false via
    // `?? false` — cast to exercise that runtime default explicitly.
    const priority = await useWeekStore
      .getState()
      .addDayPriority({ goalId: "goal-1", dayIndex: 3 } as CreateDayPriorityInput);
    expect(priority.completed).toBe(false);
  });

  it("honors an explicit completed flag", async () => {
    const priority = await useWeekStore
      .getState()
      .addDayPriority({ goalId: "goal-1", dayIndex: 3, completed: true });
    expect(priority.completed).toBe(true);
  });
});

describe("removeDayPriority", () => {
  it("removes the priority and persists once", async () => {
    seed({
      ...makeWeek(),
      dayPriorities: [{ id: "p1", goalId: "goal-1", dayIndex: 1, order: 0, completed: false }],
    });
    vi.clearAllMocks();

    await useWeekStore.getState().removeDayPriority("p1");

    expect(saveWeek).toHaveBeenCalledTimes(1);
    expect(useWeekStore.getState().currentWeek!.dayPriorities).toHaveLength(0);
  });
});

describe("toggleDayPriorityCompleted", () => {
  it("flips the completion flag", async () => {
    seed({
      ...makeWeek(),
      dayPriorities: [{ id: "p1", goalId: "goal-1", dayIndex: 1, order: 0, completed: false }],
    });
    vi.clearAllMocks();

    await useWeekStore.getState().toggleDayPriorityCompleted("p1");

    expect(useWeekStore.getState().currentWeek!.dayPriorities[0].completed).toBe(true);
  });
});

describe("reorderDayPriorities", () => {
  it("reorders only the target day and leaves other days untouched", async () => {
    seed({
      ...makeWeek(),
      dayPriorities: [
        { id: "d1-a", goalId: "goal-1", dayIndex: 1, order: 0, completed: false },
        { id: "d1-b", goalId: "goal-1", dayIndex: 1, order: 1, completed: false },
        { id: "d2-a", goalId: "goal-1", dayIndex: 2, order: 0, completed: false },
      ],
    });
    vi.clearAllMocks();

    await useWeekStore.getState().reorderDayPriorities(1, ["d1-b", "d1-a"]);

    expect(saveWeek).toHaveBeenCalledTimes(1);
    const orderById = Object.fromEntries(
      useWeekStore.getState().currentWeek!.dayPriorities.map((p) => [p.id, p.order])
    );
    expect(orderById).toEqual({ "d1-b": 0, "d1-a": 1, "d2-a": 0 }); // day 2 untouched
  });
});

describe("addEveningBlock", () => {
  it("appends an evening block and persists once", async () => {
    const evening = await useWeekStore
      .getState()
      .addEveningBlock({ type: "freestyle", dayIndex: 3, title: "Read", completed: false });

    expect(saveWeek).toHaveBeenCalledTimes(1);
    expect(evening).toMatchObject({ dayIndex: 3, title: "Read", type: "freestyle" });
    expect(useWeekStore.getState().currentWeek!.eveningBlocks).toHaveLength(1);
  });

  it("throws (no persist) on a second block for the same day", async () => {
    seed({
      ...makeWeek(),
      eveningBlocks: [{ id: "ev-x", type: "freestyle", dayIndex: 3, title: "Taken", completed: false }],
    });
    vi.clearAllMocks();

    await expect(
      useWeekStore
        .getState()
        .addEveningBlock({ type: "freestyle", dayIndex: 3, title: "Dup", completed: false })
    ).rejects.toThrow();
    expect(saveWeek).not.toHaveBeenCalled();
  });
});

describe("time block basic ops", () => {
  it("updateTimeBlock merges updates", async () => {
    await useWeekStore.getState().updateTimeBlock("block-1", { title: "Renamed", duration: 4 });

    expect(saveWeek).toHaveBeenCalledTimes(1);
    expect(useWeekStore.getState().currentWeek!.timeBlocks[0]).toMatchObject({
      title: "Renamed",
      duration: 4,
    });
  });

  it("deleteTimeBlock removes the block", async () => {
    await useWeekStore.getState().deleteTimeBlock("block-1");

    expect(saveWeek).toHaveBeenCalledTimes(1);
    expect(useWeekStore.getState().currentWeek!.timeBlocks).toHaveLength(0);
  });

  it("toggleTimeBlockCompleted flips the flag", async () => {
    await useWeekStore.getState().toggleTimeBlockCompleted("block-1");

    expect(useWeekStore.getState().currentWeek!.timeBlocks[0].completed).toBe(true);
  });
});

describe("evening block basic ops", () => {
  function withEvening() {
    seed({
      ...makeWeek(),
      eveningBlocks: [{ id: "ev-1", type: "freestyle", dayIndex: 1, title: "Read", completed: false }],
    });
    vi.clearAllMocks();
  }

  it("updateEveningBlock merges updates", async () => {
    withEvening();
    await useWeekStore.getState().updateEveningBlock("ev-1", { title: "Renamed" });

    expect(saveWeek).toHaveBeenCalledTimes(1);
    expect(useWeekStore.getState().currentWeek!.eveningBlocks[0].title).toBe("Renamed");
  });

  it("deleteEveningBlock removes the block", async () => {
    withEvening();
    await useWeekStore.getState().deleteEveningBlock("ev-1");

    expect(useWeekStore.getState().currentWeek!.eveningBlocks).toHaveLength(0);
  });

  it("toggleEveningBlockCompleted flips the flag", async () => {
    withEvening();
    await useWeekStore.getState().toggleEveningBlockCompleted("ev-1");

    expect(useWeekStore.getState().currentWeek!.eveningBlocks[0].completed).toBe(true);
  });
});

// ============================================================================
// B2 — Remaining cross-zone actions (mirror the cross-zone atomicity block)
// ============================================================================

describe("convertPriorityToEvening", () => {
  it("derives role/title from the goal, removes the priority, one persist", async () => {
    seed({
      ...makeWeek(),
      dayPriorities: [{ id: "prio-1", goalId: "goal-1", dayIndex: 1, order: 0, completed: false }],
    });
    vi.clearAllMocks();

    const evening = await useWeekStore.getState().convertPriorityToEvening("prio-1", 1);

    expect(saveWeek).toHaveBeenCalledTimes(1);
    expect(evening).toMatchObject({
      type: "goal",
      goalId: "goal-1",
      roleId: "role-1",
      title: "Ship",
      dayIndex: 1,
      completed: false,
    });
    const week = useWeekStore.getState().currentWeek!;
    expect(week.dayPriorities).toHaveLength(0);
    expect(week.eveningBlocks).toHaveLength(1);
  });

  it("rejects (null, no persist) when the evening slot is occupied", async () => {
    seed({
      ...makeWeek(),
      dayPriorities: [{ id: "prio-1", goalId: "goal-1", dayIndex: 1, order: 0, completed: false }],
      eveningBlocks: [{ id: "ev-x", type: "freestyle", dayIndex: 1, title: "Taken", completed: false }],
    });
    vi.clearAllMocks();

    const result = await useWeekStore.getState().convertPriorityToEvening("prio-1", 1);

    expect(result).toBeNull();
    expect(saveWeek).not.toHaveBeenCalled();
    expect(useWeekStore.getState().currentWeek!.dayPriorities).toHaveLength(1);
  });
});

describe("movePriorityToDay", () => {
  it("moves to a new day with a fresh id, appended order, and reset completion", async () => {
    seed({
      ...makeWeek(),
      dayPriorities: [
        { id: "prio-1", goalId: "goal-1", dayIndex: 1, order: 0, completed: true },
        { id: "prio-2", goalId: "goal-1", dayIndex: 2, order: 0, completed: false },
      ],
    });
    vi.clearAllMocks();

    const moved = await useWeekStore.getState().movePriorityToDay("prio-1", 2);

    expect(saveWeek).toHaveBeenCalledTimes(1);
    expect(moved).toMatchObject({ goalId: "goal-1", dayIndex: 2, order: 1, completed: false });
    expect(moved!.id).not.toBe("prio-1"); // new id
    const week = useWeekStore.getState().currentWeek!;
    expect(week.dayPriorities.find((p) => p.id === "prio-1")).toBeUndefined();
    expect(week.dayPriorities).toHaveLength(2);
  });

  it("rejects a same-day move (null, no persist)", async () => {
    seed({
      ...makeWeek(),
      dayPriorities: [{ id: "prio-1", goalId: "goal-1", dayIndex: 1, order: 0, completed: false }],
    });
    vi.clearAllMocks();

    const result = await useWeekStore.getState().movePriorityToDay("prio-1", 1);

    expect(result).toBeNull();
    expect(saveWeek).not.toHaveBeenCalled();
  });
});

describe("moveEveningToBlock", () => {
  it("places a clamped block, removes the evening, carries role/title (one persist)", async () => {
    seed({
      ...makeWeek(),
      timeBlocks: [],
      eveningBlocks: [
        { id: "ev-1", type: "goal", goalId: "goal-1", roleId: "role-1", dayIndex: 1, title: "Ship", completed: false },
      ],
    });
    vi.clearAllMocks();

    const block = await useWeekStore.getState().moveEveningToBlock("ev-1", 2, 0);

    expect(saveWeek).toHaveBeenCalledTimes(1);
    expect(block).toMatchObject({
      type: "goal",
      goalId: "goal-1",
      roleId: "role-1",
      title: "Ship",
      dayIndex: 2,
      startSlot: 0,
    });
    const week = useWeekStore.getState().currentWeek!;
    expect(week.eveningBlocks).toHaveLength(0);
    expect(week.timeBlocks).toHaveLength(1);
  });

  it("rejects when the target slot is occupied (null, no persist)", async () => {
    // makeWeek's block-1 occupies day 1, slots 0–2.
    seed({
      ...makeWeek(),
      eveningBlocks: [{ id: "ev-1", type: "freestyle", dayIndex: 2, title: "Read", completed: false }],
    });
    vi.clearAllMocks();

    const result = await useWeekStore.getState().moveEveningToBlock("ev-1", 1, 0);

    expect(result).toBeNull();
    expect(saveWeek).not.toHaveBeenCalled();
    expect(useWeekStore.getState().currentWeek!.eveningBlocks).toHaveLength(1);
  });
});

describe("convertEveningToPriority", () => {
  it("moves a goal-linked evening to priorities (one persist)", async () => {
    seed({
      ...makeWeek(),
      eveningBlocks: [
        { id: "ev-1", type: "goal", goalId: "goal-1", roleId: "role-1", dayIndex: 1, title: "Ship", completed: false },
      ],
    });
    vi.clearAllMocks();

    const priority = await useWeekStore.getState().convertEveningToPriority("ev-1", 1);

    expect(saveWeek).toHaveBeenCalledTimes(1);
    expect(priority).toMatchObject({ goalId: "goal-1", dayIndex: 1, order: 0, completed: false });
    const week = useWeekStore.getState().currentWeek!;
    expect(week.eveningBlocks).toHaveLength(0);
    expect(week.dayPriorities).toHaveLength(1);
  });

  it("rejects (null, no persist) when the evening block has no goalId", async () => {
    seed({
      ...makeWeek(),
      eveningBlocks: [{ id: "ev-1", type: "freestyle", dayIndex: 1, title: "Read", completed: false }],
    });
    vi.clearAllMocks();

    const result = await useWeekStore.getState().convertEveningToPriority("ev-1", 1);

    expect(result).toBeNull();
    expect(saveWeek).not.toHaveBeenCalled();
    expect(useWeekStore.getState().currentWeek!.eveningBlocks).toHaveLength(1);
  });
});
