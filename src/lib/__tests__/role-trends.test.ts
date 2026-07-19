import { describe, it, expect } from "vitest";

import { buildRoleTrends } from "@/lib/role-trends";
import type { Role, TimeBlock, Week, WeekId } from "@/types";

function role(overrides: Partial<Role> = {}): Role {
  return {
    id: "work",
    name: "Work",
    color: "teal",
    order: 0,
    archivedAt: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function block(overrides: Partial<TimeBlock> = {}): TimeBlock {
  return {
    id: "b",
    type: "goal",
    goalId: "g",
    roleId: "work",
    dayIndex: 0,
    startSlot: 0,
    duration: 4, // 2h
    title: "Block",
    completed: false,
    ...overrides,
  };
}

function week(id: string, overrides: Partial<Week> = {}): Week {
  return {
    id: id as WeekId,
    startDate: "2026-01-05T00:00:00.000Z",
    roles: [],
    goals: [],
    dayPriorities: [],
    timeBlocks: [],
    eveningBlocks: [],
    createdAt: "2026-01-05T00:00:00.000Z",
    updatedAt: "2026-01-05T00:00:00.000Z",
    ...overrides,
  };
}

describe("buildRoleTrends", () => {
  it("aggregates planned hours per durable role per week, zeros for quiet weeks", () => {
    const weeks = [
      week("2026-W01", { timeBlocks: [block({ id: "b1" })] }), // 2h work
      week("2026-W02"), // nothing
      week("2026-W03", {
        timeBlocks: [block({ id: "b2", duration: 8 })], // 4h work
        eveningBlocks: [
          { id: "e1", type: "freestyle", roleId: "health", dayIndex: 2, title: "Run", completed: false },
        ],
      }),
    ];
    const roles = [role(), role({ id: "health", name: "Health", color: "rose", order: 1 })];

    const model = buildRoleTrends(weeks, roles);

    expect(model.weekIds).toEqual(["2026-W01", "2026-W02", "2026-W03"]);
    expect(model.trends).toHaveLength(2);
    expect(model.trends[0].points.map((p) => p.hours)).toEqual([2, 0, 4]);
    expect(model.trends[1].points.map((p) => p.hours)).toEqual([0, 0, 1]);
    expect(model.maxHours).toBe(4);
  });

  it("keeps only the most recent window and orders weeks ascending", () => {
    const weeks = Array.from({ length: 10 }, (_, i) =>
      week(`2026-W${String(i + 1).padStart(2, "0")}`)
    ).reverse();

    const model = buildRoleTrends(weeks, [role()], 8);
    expect(model.weekIds[0]).toBe("2026-W03");
    expect(model.weekIds[7]).toBe("2026-W10");
  });

  it("lists only active roles, in role order, with current display values", () => {
    const weeks = [week("2026-W01")];
    const roles = [
      role({ id: "later", name: "Later", order: 5 }),
      role({ id: "gone", name: "Gone", archivedAt: "2026-01-02T00:00:00.000Z" }),
      role({ id: "first", name: "Renamed", color: "amber", order: 0 }),
    ];

    const model = buildRoleTrends(weeks, roles);
    expect(model.trends.map((t) => t.role.name)).toEqual(["Renamed", "Later"]);
    expect(model.trends[0].role.color).toBe("amber");
  });

  it("never divides by zero on an all-quiet history", () => {
    const model = buildRoleTrends([week("2026-W01")], [role()]);
    expect(model.maxHours).toBe(1);
  });
});
