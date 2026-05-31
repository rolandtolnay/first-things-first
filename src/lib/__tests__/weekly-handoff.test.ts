import { describe, expect, it } from "vitest";
import { buildEmptyWeek, buildTargetWeek, buildWeeklyHandoffModel } from "@/lib/weekly-handoff";
import type { Goal, Role, Week, WeekId } from "@/types";

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
}: {
  sourceWeek: Week | null;
  targetWeekId?: WeekId;
  existingWeekIds?: readonly WeekId[];
  selectedGoalIds?: ReadonlySet<string>;
}) {
  return buildWeeklyHandoffModel({
    sourceWeek,
    targetWeekId,
    existingWeekIds,
    selectedGoalIds,
  });
}

function idSequence(...ids: string[]): () => string {
  let index = 0;
  return () => ids[index++] ?? `generated-${index}`;
}

describe("buildEmptyWeek", () => {
  it("builds an empty Week shell with copied Roles and no planning items", () => {
    const target = buildEmptyWeek({
      weekId: defaultTargetWeekId,
      carryOverRoles: [
        role({ id: "old-work", name: "Work", color: "teal", order: 7 }),
        role({ id: "old-health", name: "Health", color: "rose", order: 2 }),
      ],
      now: "2026-03-08T10:00:00.000Z",
      createId: idSequence("new-work", "new-health"),
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
      { id: "new-work", name: "Work", color: "teal", order: 0 },
      { id: "new-health", name: "Health", color: "rose", order: 1 },
    ]);
  });
});

describe("buildTargetWeek", () => {
  it("carries Roles and selected Goals through an explicit source-role-id map", () => {
    const sourceWeek = week({
      roles: [
        role({ id: "work-a", name: "Work", color: "teal", order: 0 }),
        role({ id: "work-b", name: "Work", color: "amber", order: 1 }),
      ],
    });

    const target = buildTargetWeek({
      targetWeekId: defaultTargetWeekId,
      sourceWeek,
      carryOverGoals: [
        goal({ id: "ship", roleId: "work-a", text: "Ship", notes: "soon", completed: true }),
        goal({ id: "budget", roleId: "work-b", text: "Budget", completed: false }),
      ],
      now: "2026-03-08T10:00:00.000Z",
      createId: idSequence("new-work-a", "new-work-b", "new-ship", "new-budget"),
    });

    expect(target.roles.map((targetRole) => targetRole.name)).toEqual(["Work", "Work"]);
    expect(target.goals).toEqual([
      {
        id: "new-ship",
        roleId: "new-work-a",
        text: "Ship",
        notes: "soon",
        completed: false,
      },
      {
        id: "new-budget",
        roleId: "new-work-b",
        text: "Budget",
        notes: undefined,
        completed: false,
      },
    ]);
    expect(target.dayPriorities).toEqual([]);
    expect(target.timeBlocks).toEqual([]);
    expect(target.eveningBlocks).toEqual([]);
  });

  it("drops carried Goals whose source Role is not present", () => {
    const target = buildTargetWeek({
      targetWeekId: defaultTargetWeekId,
      sourceWeek: week({ roles: [role({ id: "work" })] }),
      carryOverGoals: [
        goal({ id: "ship", roleId: "work", text: "Ship" }),
        goal({ id: "orphan", roleId: "missing", text: "Orphan" }),
      ],
      createId: idSequence("new-work", "new-ship"),
    });

    expect(target.goals.map((targetGoal) => targetGoal.text)).toEqual(["Ship"]);
  });

  it("starts fresh by carrying Source Week Roles without carrying Goals", () => {
    const target = buildTargetWeek({
      targetWeekId: defaultTargetWeekId,
      sourceWeek: week({
        roles: [role({ id: "work" })],
        goals: [goal({ id: "open", roleId: "work" })],
      }),
      now: "2026-03-08T10:00:00.000Z",
      createId: idSequence("new-work"),
    });

    expect(target.roles).toEqual([{ id: "new-work", name: "Work", color: "teal", order: 0 }]);
    expect(target.goals).toEqual([]);
  });
});

describe("buildWeeklyHandoffModel", () => {
  it("summarizes Source Week Goal completion from Goal state only", () => {
    const sourceWeek = week({
      roles: [role()],
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

  it("groups only unfinished Goals under their Role in Role order", () => {
    const work = role({ id: "work", name: "Work", color: "teal", order: 0 });
    const health = role({ id: "health", name: "Health", color: "rose", order: 1 });
    const family = role({ id: "family", name: "Family", color: "amber", order: 2 });
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

  it("counts selected unfinished Goals", () => {
    const sourceWeek = week({
      roles: [role()],
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
    const sourceWeek = week({ roles: [role()], goals: [goal()] });

    expect(
      buildModel({
        sourceWeek,
        existingWeekIds: ["2026-W09" as WeekId, defaultTargetWeekId],
      }).isReplacingTargetWeek
    ).toBe(true);
  });

  it("uses primary action copy for start, carry-forward, and replace outcomes", () => {
    const sourceWeek = week({
      roles: [role()],
      goals: [goal({ id: "open-1" }), goal({ id: "open-2" })],
    });
    const cleanSourceWeek = week({ roles: [role()], goals: [goal({ id: "done", completed: true })] });

    expect(buildModel({ sourceWeek: cleanSourceWeek }).primaryActionLabel).toBe("Start Week");

    expect(
      buildModel({
        sourceWeek,
        selectedGoalIds: new Set(["open-1"]),
      }).primaryActionLabel
    ).toBe("Carry forward 1 Goal");

    expect(buildModel({ sourceWeek }).primaryActionLabel).toBe("Start fresh");

    expect(
      buildModel({
        sourceWeek,
        existingWeekIds: [defaultTargetWeekId],
        selectedGoalIds: new Set(["open-1", "open-2"]),
      }).primaryActionLabel
    ).toBe("Replace and carry forward 2 Goals");

    expect(
      buildModel({
        sourceWeek,
        existingWeekIds: [defaultTargetWeekId],
      }).primaryActionLabel
    ).toBe("Replace and start fresh");
  });

  it("reports clean-slate state when the Source Week has no unfinished Goals", () => {
    const sourceWeek = week({
      roles: [role()],
      goals: [goal({ id: "done-1", completed: true }), goal({ id: "done-2", completed: true })],
    });

    const model = buildModel({
      sourceWeek,
      existingWeekIds: [defaultTargetWeekId],
      selectedGoalIds: new Set(["done-1"]),
    });

    expect(model.isCleanSlate).toBe(true);
    expect(model.unfinishedGoalGroups).toEqual([]);
    expect(model.unfinishedGoalIds).toEqual([]);
    expect(model.selectedCount).toBe(0);
    expect(model.primaryActionLabel).toBe("Replace Week");
  });
});
