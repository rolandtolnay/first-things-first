import { describe, expect, it } from "vitest";
import {
  buildEmptyWeek,
  buildTargetWeek,
  buildWeeklyHandoffModel,
  buildWeeklyHandoffOpeningModel,
} from "@/lib/weekly-handoff";
import type { Goal, Role, RoleSnapshot, Week, WeekId } from "@/types";

const sourceWeekId = "2026-W10" as WeekId;
const defaultTargetWeekId = "2026-W11" as WeekId;

function week(overrides: Partial<Week> = {}): Week {
  return {
    id: sourceWeekId,
    startDate: "2026-03-02T00:00:00.000Z",
    roles: [],
    goals: [],
    dayPriorities: [],
    timeBlocks: [],
    eveningBlocks: [],
    createdAt: "2026-03-02T00:00:00.000Z",
    updatedAt: "2026-03-02T00:00:00.000Z",
    ...overrides,
  };
}

function role(overrides: Partial<Role> = {}): Role {
  return {
    id: "role-1",
    name: "Work",
    color: "teal",
    order: 0,
    archivedAt: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function snapshot(overrides: Partial<RoleSnapshot> = {}): RoleSnapshot {
  return {
    id: "role-1",
    name: "Work",
    color: "teal",
    order: 0,
    ...overrides,
  };
}

function goal(overrides: Partial<Goal> = {}): Goal {
  return {
    id: "goal-1",
    roleId: "role-1",
    text: "Write proposal",
    completed: false,
    ...overrides,
  };
}

function buildModel({
  sourceWeek,
  targetWeekId = defaultTargetWeekId,
  existingWeekIds = [],
  selectedGoalIds = new Set<string>(),
  activeRoles = sourceWeek?.roles.map((sourceRole) => role(sourceRole)) ?? [],
}: {
  sourceWeek: Week | null;
  targetWeekId?: WeekId;
  existingWeekIds?: readonly WeekId[];
  selectedGoalIds?: ReadonlySet<string>;
  activeRoles?: readonly Role[];
}) {
  return buildWeeklyHandoffModel({
    sourceWeek,
    targetWeekId,
    existingWeekIds,
    selectedGoalIds,
    activeRoles,
  });
}

function idSequence(...ids: string[]): () => string {
  let index = 0;
  return () => ids[index++] ?? `generated-${index}`;
}

describe("buildWeeklyHandoffOpeningModel", () => {
  it("chooses the first unplanned Target Week after the viewed Week", () => {
    const sourceWeek = week({
      id: "2026-W11" as WeekId,
      roles: [snapshot()],
      goals: [goal({ id: "open-1" }), goal({ id: "done-1", completed: true })],
    });

    const openingModel = buildWeeklyHandoffOpeningModel({
      sourceWeek,
      viewedWeekId: "2026-W11" as WeekId,
      existingWeekIds: ["2026-W12" as WeekId],
      activeRoles: [role({ id: "role-1" })],
      currentWeekId: "2026-W10" as WeekId,
    });

    expect(openingModel.targetWeekId).toBe("2026-W13");
    expect(openingModel.dropdownWeekIds).not.toContain("2026-W11");
    expect(openingModel.defaultSelectedGoalIds).toEqual(["open-1"]);
  });

  it("falls back to a replacement week when the candidate range is fully planned", () => {
    const candidateWeekIds = ["2026-W10", "2026-W11", "2026-W12"] as WeekId[];
    const openingModel = buildWeeklyHandoffOpeningModel({
      sourceWeek: week({ id: "2026-W10" as WeekId }),
      viewedWeekId: "2026-W11" as WeekId,
      existingWeekIds: candidateWeekIds,
      activeRoles: [],
      currentWeekId: "2026-W10" as WeekId,
      horizonWeeks: 3,
    });

    expect(openingModel.targetWeekId).toBe("2026-W11");
    expect(openingModel.dropdownWeekIds).toEqual(["2026-W11", "2026-W12"]);
  });
});

describe("buildEmptyWeek", () => {
  it("builds an empty Week shell from active durable Roles and no planning items", () => {
    const target = buildEmptyWeek({
      weekId: defaultTargetWeekId,
      activeRoles: [
        role({ id: "archived", name: "Old", color: "rose", order: 0, archivedAt: "2026-03-01T00:00:00.000Z" }),
        role({ id: "work", name: "Work", color: "teal", order: 7 }),
        role({ id: "health", name: "Health", color: "rose", order: 2 }),
      ],
      now: "2026-03-08T10:00:00.000Z",
    });

    expect(target).toMatchObject({
      id: defaultTargetWeekId,
      startDate: "2026-03-08T22:00:00.000Z",
      goals: [],
      dayPriorities: [],
      timeBlocks: [],
      eveningBlocks: [],
      createdAt: "2026-03-08T10:00:00.000Z",
      updatedAt: "2026-03-08T10:00:00.000Z",
    });
    expect(target.roles).toEqual([
      { id: "health", name: "Health", color: "rose", order: 0 },
      { id: "work", name: "Work", color: "teal", order: 1 },
    ]);
  });
});

describe("buildTargetWeek", () => {
  it("uses active durable Role IDs during handoff and carries selected Goals by Source Week Role order", () => {
    const target = buildTargetWeek({
      targetWeekId: defaultTargetWeekId,
      activeRoles: [
        role({ id: "work-a", name: "Work", color: "teal", order: 1 }),
        role({ id: "work-b", name: "Work", color: "amber", order: 0 }),
      ],
      sourceWeek: week({
        roles: [
          snapshot({ id: "work-a", name: "Old Work A", color: "rose", order: 0 }),
          snapshot({ id: "work-b", name: "Old Work B", color: "sky", order: 1 }),
        ],
        goals: [
          goal({ id: "ship", roleId: "work-a", text: "Ship", notes: "soon", completed: false }),
          goal({ id: "budget", roleId: "work-b", text: "Budget", completed: false }),
        ],
      }),
      selectedGoalIds: new Set(["ship", "budget"]),
      now: "2026-03-08T10:00:00.000Z",
      createId: idSequence("new-ship", "new-budget"),
    });

    expect(target.roles).toEqual([
      { id: "work-a", name: "Work", color: "teal", order: 0 },
      { id: "work-b", name: "Work", color: "amber", order: 1 },
    ]);
    expect(target.goals).toEqual([
      {
        id: "new-ship",
        roleId: "work-a",
        text: "Ship",
        notes: "soon",
        completed: false,
      },
      {
        id: "new-budget",
        roleId: "work-b",
        text: "Budget",
        notes: undefined,
        completed: false,
      },
    ]);
    expect(target.dayPriorities).toEqual([]);
    expect(target.timeBlocks).toEqual([]);
    expect(target.eveningBlocks).toEqual([]);
  });

  it("drops selected Goals whose Role is not active", () => {
    const target = buildTargetWeek({
      targetWeekId: defaultTargetWeekId,
      activeRoles: [role({ id: "work" })],
      sourceWeek: week({
        roles: [snapshot({ id: "work" }), snapshot({ id: "missing" })],
        goals: [
          goal({ id: "ship", roleId: "work", text: "Ship" }),
          goal({ id: "orphan", roleId: "missing", text: "Orphan" }),
        ],
      }),
      selectedGoalIds: new Set(["ship", "orphan"]),
      createId: idSequence("new-ship"),
    });

    expect(target.goals.map((targetGoal) => targetGoal.text)).toEqual(["Ship"]);
  });

  it("starts fresh with active Role defaults and no Source Week planning items", () => {
    const target = buildTargetWeek({
      targetWeekId: defaultTargetWeekId,
      activeRoles: [role({ id: "work" })],
      sourceWeek: week({ roles: [snapshot({ id: "work" })], goals: [goal({ id: "ship", roleId: "work" })] }),
      now: "2026-03-08T10:00:00.000Z",
    });

    expect(target.roles).toEqual([{ id: "work", name: "Work", color: "teal", order: 0 }]);
    expect(target.goals).toEqual([]);
  });
});

describe("buildWeeklyHandoffModel", () => {
  it("summarizes Source Week Goal completion from Goal state only", () => {
    const sourceWeek = week({
      roles: [snapshot()],
      goals: [
        goal({ id: "done", completed: true }),
        goal({ id: "open", completed: false }),
        goal({ id: "also-open", completed: false }),
      ],
      dayPriorities: [
        { id: "priority-1", goalId: "open", dayIndex: 0, order: 0, completed: true },
      ],
      timeBlocks: [
        {
          id: "block-1",
          type: "goal",
          goalId: "also-open",
          roleId: "role-1",
          dayIndex: 1,
          startSlot: 2,
          duration: 2,
          title: "Scheduled open goal",
          completed: true,
        },
      ],
    });

    expect(buildModel({ sourceWeek }).summary).toEqual({
      completedGoals: 1,
      totalGoals: 3,
      unfinishedGoals: 2,
      completionPercent: 33,
    });

    expect(buildModel({ sourceWeek: week() }).summary).toEqual({
      completedGoals: 0,
      totalGoals: 0,
      unfinishedGoals: 0,
      completionPercent: 0,
    });

    expect(
      buildModel({
        sourceWeek: week({
          goals: [goal({ id: "done-1", completed: true }), goal({ id: "done-2", completed: true })],
        }),
      }).summary
    ).toEqual({ completedGoals: 2, totalGoals: 2, unfinishedGoals: 0, completionPercent: 100 });
  });

  it("groups only unfinished Goals under their Role Snapshot in Role order", () => {
    const work = snapshot({ id: "work", name: "Work", color: "teal", order: 0 });
    const health = snapshot({ id: "health", name: "Health", color: "rose", order: 1 });
    const family = snapshot({ id: "family", name: "Family", color: "amber", order: 2 });
    const sourceWeek = week({
      roles: [family, work, health],
      goals: [
        goal({ id: "work-done", roleId: "work", text: "Ship report", completed: true }),
        goal({ id: "health-open", roleId: "health", text: "Plan meals" }),
        goal({ id: "family-open", roleId: "family", text: "Book trip" }),
        goal({ id: "family-done", roleId: "family", text: "Call school", completed: true }),
      ],
    });

    expect(
      buildModel({ sourceWeek }).unfinishedGoalGroups.map((group) => ({
        roleName: group.role.name,
        goalTexts: group.goals.map((groupGoal) => groupGoal.text),
      }))
    ).toEqual([
      { roleName: "Health", goalTexts: ["Plan meals"] },
      { roleName: "Family", goalTexts: ["Book trip"] },
    ]);
  });

  it("only offers unfinished Goals whose Roles are still active", () => {
    const sourceWeek = week({
      roles: [
        snapshot({ id: "active", name: "Active" }),
        snapshot({ id: "archived", name: "Archived" }),
      ],
      goals: [
        goal({ id: "carry", roleId: "active", text: "Carry" }),
        goal({ id: "hidden", roleId: "archived", text: "Hidden" }),
      ],
    });

    const model = buildModel({
      sourceWeek,
      activeRoles: [role({ id: "active", name: "Active" })],
      selectedGoalIds: new Set(["carry", "hidden"]),
    });

    expect(model.unfinishedGoalIds).toEqual(["carry"]);
    expect(model.selectedCount).toBe(1);
    expect(model.unfinishedGoalGroups).toHaveLength(1);
    expect(model.unfinishedGoalGroups[0].role.id).toBe("active");
  });

  it("counts selected unfinished Goals", () => {
    const sourceWeek = week({
      roles: [snapshot()],
      goals: [
        goal({ id: "open-1" }),
        goal({ id: "done-1", completed: true }),
        goal({ id: "open-2" }),
      ],
    });

    const model = buildModel({
      sourceWeek,
      selectedGoalIds: new Set(["open-2", "done-1", "missing"]),
    });

    expect(model.unfinishedGoalIds).toEqual(["open-1", "open-2"]);
    expect(model.selectedCount).toBe(1);
  });

  it("reports whether the Target Week already has a plan", () => {
    const sourceWeek = week({ roles: [snapshot()], goals: [goal()] });

    expect(
      buildModel({
        sourceWeek,
        existingWeekIds: ["2026-W09" as WeekId, defaultTargetWeekId],
      }).isReplacingTargetWeek
    ).toBe(true);
  });

  it("uses primary action copy for start, carry-forward, and replace outcomes", () => {
    const sourceWeek = week({
      roles: [snapshot()],
      goals: [goal({ id: "open-1" }), goal({ id: "open-2" })],
    });
    const cleanSourceWeek = week({ roles: [snapshot()], goals: [goal({ id: "done", completed: true })] });

    expect(buildModel({ sourceWeek: cleanSourceWeek }).primaryActionLabel).toBe("Start week");

    expect(
      buildModel({
        sourceWeek,
        selectedGoalIds: new Set(["open-1"]),
      }).primaryActionLabel
    ).toBe("Carry forward 1 goal");

    expect(buildModel({ sourceWeek }).primaryActionLabel).toBe("Start fresh");

    expect(
      buildModel({
        sourceWeek,
        existingWeekIds: [defaultTargetWeekId],
        selectedGoalIds: new Set(["open-1", "open-2"]),
      }).primaryActionLabel
    ).toBe("Replace and carry forward 2 goals");

    expect(
      buildModel({
        sourceWeek,
        existingWeekIds: [defaultTargetWeekId],
      }).primaryActionLabel
    ).toBe("Replace and start fresh");
  });

  it("reports source-complete state when the Source Week has no unfinished Goals", () => {
    const sourceWeek = week({
      roles: [snapshot()],
      goals: [goal({ id: "done-1", completed: true }), goal({ id: "done-2", completed: true })],
    });

    const model = buildModel({
      sourceWeek,
      existingWeekIds: [defaultTargetWeekId],
      selectedGoalIds: new Set(["done-1"]),
    });

    expect(model.isSourceComplete).toBe(true);
    expect(model.hasCarryableGoals).toBe(false);
    expect(model.unfinishedGoalGroups).toEqual([]);
    expect(model.unfinishedGoalIds).toEqual([]);
    expect(model.selectedCount).toBe(0);
    expect(model.primaryActionLabel).toBe("Replace week");
  });
});
