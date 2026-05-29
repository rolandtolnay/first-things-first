import { describe, it, expect } from "vitest";
import { computeRoleBalance } from "@/lib/role-balance";
import type { TimeBlock, EveningBlock } from "@/types";

function makeTimeBlock(
  roleId: string | undefined,
  duration: number,
  completed = false,
  id = "tb"
): TimeBlock {
  return {
    id,
    type: roleId ? "goal" : "freestyle",
    roleId,
    dayIndex: 1,
    startSlot: 0,
    duration,
    title: "Test",
    completed,
  };
}

function makeEveningBlock(
  roleId: string | undefined,
  completed = false,
  id = "eb"
): EveningBlock {
  return {
    id,
    type: roleId ? "goal" : "freestyle",
    roleId,
    dayIndex: 1,
    title: "Test",
    completed,
  };
}

describe("computeRoleBalance", () => {
  it("returns empty totals for empty/undefined input", () => {
    expect(computeRoleBalance({})).toEqual({
      roleHoursMap: new Map(),
      totalPlanned: 0,
      totalCompleted: 0,
    });
  });

  it("weights a time block as slotsToHours(duration) (4 slots → 2h)", () => {
    const result = computeRoleBalance({
      timeBlocks: [makeTimeBlock("r1", 4)],
    });
    expect(result.roleHoursMap.get("r1")).toEqual({ planned: 2, completed: 0 });
    expect(result.totalPlanned).toBe(2);
    expect(result.totalCompleted).toBe(0);
  });

  it("counts completed hours only when the block is completed", () => {
    const result = computeRoleBalance({
      timeBlocks: [makeTimeBlock("r1", 2, true)],
    });
    expect(result.roleHoursMap.get("r1")).toEqual({ planned: 1, completed: 1 });
    expect(result.totalCompleted).toBe(1);
  });

  it("weights an evening block as exactly EVENING_BLOCK_HOURS (+1), not by duration", () => {
    const result = computeRoleBalance({
      eveningBlocks: [makeEveningBlock("r1")],
    });
    expect(result.roleHoursMap.get("r1")).toEqual({ planned: 1, completed: 0 });
    expect(result.totalPlanned).toBe(1);
  });

  it("counts a completed evening block toward completed (+1)", () => {
    const result = computeRoleBalance({
      eveningBlocks: [makeEveningBlock("r1", true)],
    });
    expect(result.roleHoursMap.get("r1")).toEqual({ planned: 1, completed: 1 });
  });

  it("skips blocks without a roleId", () => {
    const result = computeRoleBalance({
      timeBlocks: [makeTimeBlock(undefined, 4)],
      eveningBlocks: [makeEveningBlock(undefined)],
    });
    expect(result.roleHoursMap.size).toBe(0);
    expect(result.totalPlanned).toBe(0);
  });

  it("accumulates time and evening blocks for the same role", () => {
    const result = computeRoleBalance({
      timeBlocks: [makeTimeBlock("r1", 4, true, "tb1")],
      eveningBlocks: [makeEveningBlock("r1", false, "eb1")],
    });
    // 4 slots = 2h planned (+1h completed) + evening +1h planned = 3h planned, 2h completed
    expect(result.roleHoursMap.get("r1")).toEqual({ planned: 3, completed: 2 });
    expect(result.totalPlanned).toBe(3);
    expect(result.totalCompleted).toBe(2);
  });

  it("aggregates and totals across multiple roles", () => {
    const result = computeRoleBalance({
      timeBlocks: [
        makeTimeBlock("r1", 2, false, "tb1"),
        makeTimeBlock("r2", 6, true, "tb2"),
      ],
      eveningBlocks: [makeEveningBlock("r2", true, "eb1")],
    });
    expect(result.roleHoursMap.get("r1")).toEqual({ planned: 1, completed: 0 });
    expect(result.roleHoursMap.get("r2")).toEqual({ planned: 4, completed: 4 });
    expect(result.totalPlanned).toBe(5);
    expect(result.totalCompleted).toBe(4);
  });
});
