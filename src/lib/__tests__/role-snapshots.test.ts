import { describe, expect, it } from "vitest";
import {
  appendRoleSnapshot,
  removeRoleSnapshotCascade,
  reorderRoleSnapshots,
  resolveRestoredRoleName,
  seedRoleSnapshots,
  snapshotFromRole,
  updateRoleSnapshot,
} from "@/lib/role-snapshots";
import type { Role, Week, WeekId } from "@/types";

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

function week(overrides: Partial<Week> = {}): Week {
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

describe("role snapshot rules", () => {
  it("seeds active Roles as contiguous Role Snapshots with stable durable IDs", () => {
    const snapshots = seedRoleSnapshots([
      role({ id: "archived", name: "Old", color: "rose", order: 0, archivedAt: "2026-01-02T00:00:00.000Z" }),
      role({ id: "health", name: "Health", color: "amber", order: 5 }),
      role({ id: "work", name: "Work", color: "teal", order: 2 }),
    ]);

    expect(snapshots).toEqual([
      { id: "work", name: "Work", color: "teal", order: 0 },
      { id: "health", name: "Health", color: "amber", order: 1 },
    ]);
  });

  it("appends and updates only current Week Role Snapshots", () => {
    const base = week({ roles: [{ id: "work", name: "Work", color: "teal", order: 0 }] });
    const withHealth = appendRoleSnapshot(base, role({ id: "health", name: "Health", color: "amber", order: 99 }));

    expect(snapshotFromRole(role({ id: "family", order: 4 }), 7)).toEqual({
      id: "family",
      name: "Work",
      color: "teal",
      order: 7,
    });
    expect(withHealth.roles).toEqual([
      { id: "work", name: "Work", color: "teal", order: 0 },
      { id: "health", name: "Health", color: "amber", order: 1 },
    ]);

    const renamed = updateRoleSnapshot(withHealth, "work", { name: "Deep Work", color: "violet" });
    expect(renamed.roles).toEqual([
      { id: "work", name: "Deep Work", color: "violet", order: 0 },
      { id: "health", name: "Health", color: "amber", order: 1 },
    ]);
  });

  it("removes a Role Snapshot with its goal-linked planning items while preserving Freestyle Blocks", () => {
    const source = week({
      roles: [
        { id: "work", name: "Work", color: "teal", order: 0 },
        { id: "health", name: "Health", color: "amber", order: 1 },
      ],
      goals: [
        { id: "ship", roleId: "work", text: "Ship", completed: false },
        { id: "run", roleId: "health", text: "Run", completed: false },
      ],
      dayPriorities: [{ id: "prio", goalId: "ship", dayIndex: 1, order: 0, completed: false }],
      timeBlocks: [
        { id: "goal-block", type: "goal", goalId: "ship", roleId: "work", dayIndex: 1, startSlot: 0, duration: 2, title: "Ship", completed: false },
        { id: "free-block", type: "freestyle", dayIndex: 2, startSlot: 0, duration: 2, title: "Think", completed: false },
      ],
      eveningBlocks: [
        { id: "goal-evening", type: "goal", goalId: "ship", roleId: "work", dayIndex: 1, title: "Ship", completed: false },
        { id: "free-evening", type: "freestyle", dayIndex: 2, title: "Read", completed: false },
      ],
    });

    const result = removeRoleSnapshotCascade(source, "work");

    expect(result.roles.map((r) => r.id)).toEqual(["health"]);
    expect(result.goals.map((g) => g.id)).toEqual(["run"]);
    expect(result.dayPriorities).toEqual([]);
    expect(result.timeBlocks.map((b) => b.id)).toEqual(["free-block"]);
    expect(result.eveningBlocks.map((b) => b.id)).toEqual(["free-evening"]);
  });

  it("reorders only with a complete unique known Role ID list", () => {
    const source = week({
      roles: [
        { id: "a", name: "A", color: "teal", order: 0 },
        { id: "b", name: "B", color: "amber", order: 1 },
        { id: "c", name: "C", color: "rose", order: 2 },
      ],
    });

    expect(reorderRoleSnapshots(source, ["c", "a", "b"]).roles).toEqual([
      { id: "a", name: "A", color: "teal", order: 1 },
      { id: "b", name: "B", color: "amber", order: 2 },
      { id: "c", name: "C", color: "rose", order: 0 },
    ]);
    expect(reorderRoleSnapshots(source, ["a", "b"])).toBe(source);
    expect(reorderRoleSnapshots(source, ["a", "a", "missing"])).toBe(source);
  });

  it("resolves restored Role name conflicts with a distinct active name", () => {
    const active = [
      role({ id: "work", name: "Work" }),
      role({ id: "work-2", name: " work 2 " }),
    ];

    expect(resolveRestoredRoleName(active, role({ id: "old", name: "Work" }))).toBe("Work 3");
    expect(resolveRestoredRoleName(active, role({ id: "old", name: "Family" }))).toBe("Family");
  });
});
