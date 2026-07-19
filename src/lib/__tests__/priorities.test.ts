import { describe, expect, it } from "vitest";
import { normalizeDayPriority, normalizeWeek, priorityRoleId, priorityText } from "@/lib/priorities";
import type { DayPriority, Goal, Week, WeekId } from "@/types";

const goals: Goal[] = [
  { id: "goal-1", roleId: "role-1", text: "Ship report", completed: false },
];

function priority(overrides: Partial<DayPriority>): DayPriority {
  return {
    id: "p-1",
    type: "goal",
    goalId: "goal-1",
    dayIndex: 0,
    order: 0,
    completed: false,
    ...overrides,
  };
}

function week(overrides: Partial<Week> = {}): Week {
  return {
    id: "2026-W30" as WeekId,
    startDate: "2026-07-20T00:00:00.000Z",
    roles: [],
    goals,
    dayPriorities: [],
    timeBlocks: [],
    eveningBlocks: [],
    createdAt: "2026-07-20T00:00:00.000Z",
    updatedAt: "2026-07-20T00:00:00.000Z",
    ...overrides,
  };
}

describe("normalizeDayPriority", () => {
  it("fills type 'goal' on a legacy priority that has a goalId", () => {
    const legacy = { id: "p", goalId: "goal-1", dayIndex: 1, order: 0, completed: false };
    expect(normalizeDayPriority(legacy as DayPriority).type).toBe("goal");
  });

  it("returns the same reference when type is already present", () => {
    const current = priority({ type: "freestyle", goalId: undefined, text: "Dentist" });
    expect(normalizeDayPriority(current)).toBe(current);
  });
});

describe("normalizeWeek", () => {
  it("normalizes only when a priority is missing its type", () => {
    const legacy = week({
      dayPriorities: [
        { id: "p", goalId: "goal-1", dayIndex: 1, order: 0, completed: false } as DayPriority,
      ],
    });
    const normalized = normalizeWeek(legacy);
    expect(normalized).not.toBe(legacy);
    expect(normalized.dayPriorities[0].type).toBe("goal");
  });

  it("returns the same reference for an up-to-date week", () => {
    const current = week({ dayPriorities: [priority({})] });
    expect(normalizeWeek(current)).toBe(current);
  });
});

describe("priorityText / priorityRoleId", () => {
  it("resolves through the linked Goal for goal-linked priorities", () => {
    const linked = priority({});
    expect(priorityText(linked, goals)).toBe("Ship report");
    expect(priorityRoleId(linked, goals)).toBe("role-1");
  });

  it("uses own text and role for freestyle priorities", () => {
    const freestyle = priority({
      type: "freestyle",
      goalId: undefined,
      text: "Dentist",
      roleId: "role-9",
    });
    expect(priorityText(freestyle, goals)).toBe("Dentist");
    expect(priorityRoleId(freestyle, goals)).toBe("role-9");
  });

  it("is empty/undefined for an unassigned freestyle priority", () => {
    const freestyle = priority({ type: "freestyle", goalId: undefined, text: undefined });
    expect(priorityText(freestyle, goals)).toBe("");
    expect(priorityRoleId(freestyle, goals)).toBeUndefined();
  });
});
