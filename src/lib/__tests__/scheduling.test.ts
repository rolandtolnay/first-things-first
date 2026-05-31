import { describe, it, expect } from "vitest";
import {
  canStartAt,
  clampStartToFitDuration,
  resolveNewPlacement,
  resolveMovePlacement,
  resolveResize,
  resolveDrawCommit,
  resolveDrawPreview,
} from "@/lib/scheduling";
import type { TimeBlock } from "@/types";

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
// canStartAt
// ============================================================================

describe("canStartAt", () => {
  it("is true on an empty day", () => {
    expect(canStartAt(0, [])).toBe(true);
  });

  it("is false when the start slot is occupied", () => {
    expect(canStartAt(2, [makeBlock(2, 2)])).toBe(false);
  });

  it("is true in a free slot between blocks", () => {
    const blocks = [makeBlock(0, 2, "a"), makeBlock(4, 2, "b")];
    expect(canStartAt(2, blocks)).toBe(true);
  });

  it("excludes self", () => {
    expect(canStartAt(2, [makeBlock(2, 2, "self")], "self")).toBe(true);
  });
});

// ============================================================================
// clampStartToFitDuration
// ============================================================================

describe("clampStartToFitDuration", () => {
  it("keeps a start when the duration already fits", () => {
    expect(clampStartToFitDuration(10, 4)).toBe(10);
  });

  it("snaps the start upward so the duration fits before end of day", () => {
    expect(clampStartToFitDuration(23, 2)).toBe(22);
    expect(clampStartToFitDuration(23, 6)).toBe(18);
  });
});

// ============================================================================
// resolveNewPlacement
// ============================================================================

describe("resolveNewPlacement", () => {
  it("places at the default duration on an empty day", () => {
    expect(resolveNewPlacement(0, [])).toEqual({
      ok: true,
      startSlot: 0,
      duration: 2,
    });
  });

  it("rejects an occupied start slot", () => {
    expect(resolveNewPlacement(2, [makeBlock(2, 2)])).toEqual({
      ok: false,
      reason: "occupied",
    });
  });

  it("rejects an out-of-range start slot (below 0)", () => {
    expect(resolveNewPlacement(-1, [])).toEqual({
      ok: false,
      reason: "out-of-range",
    });
  });

  it("rejects an out-of-range start slot (past last slot)", () => {
    expect(resolveNewPlacement(24, [])).toEqual({
      ok: false,
      reason: "out-of-range",
    });
  });

  it("clamps the requested duration to free space ahead", () => {
    // block at slot 4 -> only 4 slots free from slot 0
    const result = resolveNewPlacement(0, [makeBlock(4, 2)], 8);
    expect(result).toEqual({ ok: true, startSlot: 0, duration: 4 });
  });

  it("snaps upward at the last slot so the default duration fits", () => {
    // slot 23 with the default 2-slot duration previews/drops as 19:00-20:00.
    expect(resolveNewPlacement(23, [])).toEqual({
      ok: true,
      startSlot: 22,
      duration: 2,
    });
  });

  it("snaps upward so a requested duration fits before end of day", () => {
    expect(resolveNewPlacement(23, [], 6)).toEqual({
      ok: true,
      startSlot: 18,
      duration: 6,
    });
  });

  it("honours a requested duration that fits", () => {
    expect(resolveNewPlacement(0, [], 3)).toEqual({
      ok: true,
      startSlot: 0,
      duration: 3,
    });
  });
});

// ============================================================================
// resolveMovePlacement — full duration must fit; end-of-day snaps upward; excludes self
// ============================================================================

describe("resolveMovePlacement", () => {
  it("accepts a move where the full duration fits", () => {
    const blocks = [makeBlock(0, 2, "self"), makeBlock(8, 2, "other")];
    expect(resolveMovePlacement(4, 2, blocks, "self")).toEqual({
      ok: true,
      startSlot: 4,
      duration: 2,
    });
  });

  it("rejects (does NOT clamp) when the full duration would overlap", () => {
    // self dur 4, other at slot 6; moving self to slot 4 -> 4..8 overlaps other.
    // A clamp would shrink to 2 and succeed; a move must reject instead.
    const blocks = [makeBlock(0, 4, "self"), makeBlock(6, 2, "other")];
    expect(resolveMovePlacement(4, 4, blocks, "self")).toEqual({
      ok: false,
      reason: "occupied",
    });
  });

  it("excludes self so a block can move within its own footprint", () => {
    const blocks = [makeBlock(2, 4, "self")];
    expect(resolveMovePlacement(3, 4, blocks, "self")).toEqual({
      ok: true,
      startSlot: 3,
      duration: 4,
    });
  });

  it("snaps upward at the last slot so the full moved duration fits", () => {
    expect(resolveMovePlacement(23, 6, [], "self")).toEqual({
      ok: true,
      startSlot: 18,
      duration: 6,
    });
  });
});

// ============================================================================
// resolveResize — clamps, floors at 1, excludes self
// ============================================================================

describe("resolveResize", () => {
  it("clamps the requested duration to free space (excluding self)", () => {
    const blocks = [makeBlock(0, 2, "self"), makeBlock(8, 2, "other")];
    // from slot 0, next block (excluding self) is at 8 -> max 8; requested 10 -> 8
    expect(resolveResize(10, 0, blocks, "self")).toBe(8);
  });

  it("floors at 1 slot", () => {
    expect(resolveResize(0, 0, [], "self")).toBe(1);
  });
});

// ============================================================================
// resolveDrawCommit — THE BUG FIX
// ============================================================================

describe("resolveDrawCommit", () => {
  it("commits 1 slot (not 2) when drawing in a 1-slot gap", () => {
    // gap is exactly slot 2 (block a covers 0-1, block b covers 3-4)
    const blocks = [makeBlock(0, 2, "a"), makeBlock(3, 2, "b")];
    // old code: Math.max(2, 1) = 2 -> overlaps b. fixed: re-clamp to free space = 1.
    expect(resolveDrawCommit(1, 2, blocks)).toBe(1);
  });

  it("applies the MIN_BLOCK_SLOTS floor when there is room", () => {
    // tiny draw on an empty day still commits at least the 2-slot minimum
    expect(resolveDrawCommit(1, 0, [])).toBe(2);
  });

  it("keeps a larger drawn duration when it fits", () => {
    expect(resolveDrawCommit(5, 0, [])).toBe(5);
  });
});

// ============================================================================
// resolveDrawPreview
// ============================================================================

describe("resolveDrawPreview", () => {
  it("clamps the in-progress end to free space", () => {
    expect(resolveDrawPreview(8, 0, [makeBlock(4, 2)])).toBe(4);
  });

  it("returns the requested duration when it fits", () => {
    expect(resolveDrawPreview(3, 0, [])).toBe(3);
  });
});
