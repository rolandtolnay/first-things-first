import { describe, it, expect } from "vitest";
import { hasOverlap, getMaxAvailableDuration, getClampedDuration } from "@/lib/overlap";
import type { TimeBlock } from "@/types";

/**
 * Helper to create a minimal TimeBlock for testing overlap logic.
 */
function makeBlock(
  startSlot: number,
  duration: number,
  id = "block-1"
): TimeBlock {
  return {
    id,
    type: "freestyle",
    dayIndex: 1,
    startSlot: startSlot as TimeBlock["startSlot"],
    duration,
    title: "Test",
    completed: false,
  };
}

// ============================================================================
// hasOverlap
// ============================================================================

describe("hasOverlap", () => {
  it("returns false when no overlap (block at 0-2, check 4-6)", () => {
    const blocks = [makeBlock(0, 2)];
    expect(hasOverlap(4, 6, blocks)).toBe(false);
  });

  it("returns true for partial overlap (block at 2-4, check 3-5)", () => {
    const blocks = [makeBlock(2, 2)];
    expect(hasOverlap(3, 5, blocks)).toBe(true);
  });

  it("returns false for adjacent blocks (block at 0-2, check 2-4)", () => {
    // Adjacent means end of one equals start of another -- NOT an overlap
    const blocks = [makeBlock(0, 2)];
    expect(hasOverlap(2, 4, blocks)).toBe(false);
  });

  it("returns true for full containment (block at 2-6, check 3-5)", () => {
    const blocks = [makeBlock(2, 4)];
    expect(hasOverlap(3, 5, blocks)).toBe(true);
  });

  it("returns false when excludeId matches the overlapping block", () => {
    const blocks = [makeBlock(2, 2, "self")];
    expect(hasOverlap(2, 4, blocks, "self")).toBe(false);
  });

  it("returns false when checking between two non-overlapping blocks", () => {
    const blocks = [makeBlock(0, 2, "a"), makeBlock(6, 2, "b")];
    expect(hasOverlap(3, 5, blocks)).toBe(false);
  });

  it("returns false for empty blocks array", () => {
    expect(hasOverlap(0, 4, [])).toBe(false);
  });
});

// ============================================================================
// getMaxAvailableDuration
// ============================================================================

describe("getMaxAvailableDuration", () => {
  it("returns min(16, 24 - startSlot) on empty day (startSlot 0 -> 16)", () => {
    expect(getMaxAvailableDuration(0, [])).toBe(16);
  });

  it("returns 24 - startSlot when near end of day (startSlot 20 -> 4)", () => {
    expect(getMaxAvailableDuration(20, [])).toBe(4);
  });

  it("returns distance to nearest block ahead (startSlot 4, block at 8 -> 4)", () => {
    const blocks = [makeBlock(8, 2)];
    expect(getMaxAvailableDuration(4, blocks)).toBe(4);
  });

  it("returns distance to nearest of multiple blocks ahead", () => {
    const blocks = [makeBlock(10, 2, "a"), makeBlock(6, 2, "b")];
    expect(getMaxAvailableDuration(4, blocks)).toBe(2); // nearest is at 6
  });

  it("excludes self when excludeId is provided", () => {
    const blocks = [makeBlock(6, 2, "self"), makeBlock(10, 2, "other")];
    expect(getMaxAvailableDuration(4, blocks, "self")).toBe(6); // skip self at 6, next is 10
  });

  it("ignores blocks behind (startSlot 6, block at 2-4 -> 16)", () => {
    const blocks = [makeBlock(2, 2)];
    expect(getMaxAvailableDuration(6, blocks)).toBe(16);
  });

  it("caps at 24 - startSlot when block at end of day", () => {
    const blocks = [makeBlock(22, 2)];
    expect(getMaxAvailableDuration(18, blocks)).toBe(4); // nearest block at 22, distance = 4
  });
});

// ============================================================================
// getClampedDuration
// ============================================================================

describe("getClampedDuration", () => {
  it("returns requested duration when it fits", () => {
    // max available = 16 (empty day at slot 0), requested 4 -> 4
    expect(getClampedDuration(4, 0, [])).toBe(4);
  });

  it("clamps to max available when requested exceeds", () => {
    const blocks = [makeBlock(8, 2)];
    // max available from slot 4 = 4 (block at 8), requested 6 -> 4
    expect(getClampedDuration(6, 4, blocks)).toBe(4);
  });

  it("returns minimum 1 when requested is 0", () => {
    expect(getClampedDuration(0, 0, [])).toBe(1);
  });

  it("passes excludeId through to getMaxAvailableDuration", () => {
    const blocks = [makeBlock(6, 2, "self"), makeBlock(10, 2, "other")];
    // Without exclude: max from 4 = 2 (block at 6), requested 5 -> 2
    expect(getClampedDuration(5, 4, blocks)).toBe(2);
    // With exclude "self": max from 4 = 6 (next block at 10), requested 5 -> 5
    expect(getClampedDuration(5, 4, blocks, "self")).toBe(5);
  });
});
