import { describe, expect, it } from "vitest";
import { buildTargetWeek, countRepeatingBlocks } from "@/lib/weekly-handoff";
import type { EveningBlock, Role, TimeBlock, Week, WeekId } from "@/types";

const sourceWeekId = "2026-W10" as WeekId;
const targetWeekId = "2026-W11" as WeekId;

function week(overrides: Partial<Week> = {}): Week {
  return {
    id: sourceWeekId,
    startDate: "2026-03-02T00:00:00.000Z",
    roles: [{ id: "role-1", name: "Work", color: "teal", order: 0 }],
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

function repeatingBlock(overrides: Partial<TimeBlock> = {}): TimeBlock {
  return {
    id: "gym",
    type: "freestyle",
    dayIndex: 1,
    startSlot: 4,
    duration: 2,
    title: "Gym",
    completed: true,
    recurrence: "weekly",
    ...overrides,
  };
}

function repeatingEvening(overrides: Partial<EveningBlock> = {}): EveningBlock {
  return {
    id: "reading",
    type: "freestyle",
    dayIndex: 3,
    title: "Reading",
    completed: true,
    recurrence: "weekly",
    ...overrides,
  };
}

function build(sourceWeek: Week, activeRoles: readonly Role[] = [role()]) {
  return buildTargetWeek({
    targetWeekId,
    activeRoles,
    sourceWeek,
    createId: (() => {
      let n = 0;
      return () => `new-${++n}`;
    })(),
    now: "2026-03-09T00:00:00.000Z",
  });
}

describe("buildTargetWeek recurrence carry", () => {
  it("copies repeating Freestyle Blocks with fresh ids, reset completion, and recurrence kept", () => {
    const target = build(
      week({
        timeBlocks: [
          repeatingBlock({ roleId: "role-1" }),
          { ...repeatingBlock({ id: "once", title: "One-off" }), recurrence: undefined },
        ],
        eveningBlocks: [repeatingEvening()],
      })
    );

    expect(target.timeBlocks).toHaveLength(1);
    expect(target.timeBlocks[0]).toMatchObject({
      type: "freestyle",
      title: "Gym",
      dayIndex: 1,
      startSlot: 4,
      duration: 2,
      roleId: "role-1",
      completed: false,
      recurrence: "weekly",
    });
    expect(target.timeBlocks[0].id).not.toBe("gym");

    expect(target.eveningBlocks).toHaveLength(1);
    expect(target.eveningBlocks[0]).toMatchObject({
      title: "Reading",
      dayIndex: 3,
      completed: false,
      recurrence: "weekly",
    });
  });

  it("never copies goal-linked blocks, recurring or not", () => {
    const target = build(
      week({
        timeBlocks: [
          repeatingBlock({ id: "linked", type: "goal", goalId: "goal-1", roleId: "role-1" }),
        ],
      })
    );

    expect(target.timeBlocks).toHaveLength(0);
  });

  it("clears the Role assignment when the Role is no longer active", () => {
    const target = build(
      week({ timeBlocks: [repeatingBlock({ roleId: "role-archived" })] }),
      [role()]
    );

    expect(target.timeBlocks[0].roleId).toBeUndefined();
  });

  it("keeps at most one repeating Evening Block per day", () => {
    const target = build(
      week({
        eveningBlocks: [
          repeatingEvening({ id: "a", dayIndex: 3 }),
          repeatingEvening({ id: "b", dayIndex: 3, title: "Second" }),
        ],
      })
    );

    expect(target.eveningBlocks).toHaveLength(1);
    expect(target.eveningBlocks[0].title).toBe("Reading");
  });
});

describe("countRepeatingBlocks", () => {
  it("counts repeating freestyle time and evening blocks only", () => {
    const source = week({
      timeBlocks: [
        repeatingBlock(),
        { ...repeatingBlock({ id: "once" }), recurrence: undefined },
        repeatingBlock({ id: "linked", type: "goal", goalId: "goal-1" }),
      ],
      eveningBlocks: [repeatingEvening()],
    });

    expect(countRepeatingBlocks(source)).toBe(2);
    expect(countRepeatingBlocks(null)).toBe(0);
  });
});
