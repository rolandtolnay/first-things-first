import { describe, it, expect } from "vitest";
import {
  DAY_START_HOUR,
  DAY_END_HOUR,
  SLOTS_PER_HOUR,
  MINUTES_PER_SLOT,
  HOURS_PER_SLOT,
  EVENING_BLOCK_HOURS,
  TOTAL_SLOTS,
  MAX_SLOT_INDEX,
  MAX_BLOCK_SLOTS,
  MIN_BLOCK_SLOTS,
  DEFAULT_BLOCK_SLOTS,
  SLOT_HEIGHT,
  slotToTime,
  timeToSlot,
  slotsToHours,
  pixelToSlotFloor,
  pixelToSlotRound,
  slotToPixels,
  durationToPixels,
  timeToPixels,
  slotIsHourStart,
  slotToHourLabel,
} from "@/lib/time-model";

// ============================================================================
// Constant identity — locks the byte-identical contract with the old literals
// ============================================================================

describe("constants", () => {
  it("hold their documented values", () => {
    expect(DAY_START_HOUR).toBe(8);
    expect(DAY_END_HOUR).toBe(20);
    expect(SLOTS_PER_HOUR).toBe(2);
    expect(MINUTES_PER_SLOT).toBe(30);
    expect(HOURS_PER_SLOT).toBe(0.5);
    expect(EVENING_BLOCK_HOURS).toBe(1);
    expect(TOTAL_SLOTS).toBe(24);
    expect(MAX_SLOT_INDEX).toBe(23);
    expect(MAX_BLOCK_SLOTS).toBe(16);
    expect(MIN_BLOCK_SLOTS).toBe(2);
    expect(DEFAULT_BLOCK_SLOTS).toBe(2);
    expect(SLOT_HEIGHT).toBe(28);
  });

  it("keeps MAX_SLOT_INDEX === TOTAL_SLOTS - 1 (no off-by-one)", () => {
    expect(MAX_SLOT_INDEX).toBe(TOTAL_SLOTS - 1);
  });
});

// ============================================================================
// slotToTime
// ============================================================================

describe("slotToTime", () => {
  it("maps slot 0 to 8:00 (day start)", () => {
    expect(slotToTime(0)).toBe("8:00");
  });

  it("maps slot 1 to 8:30 (half-hour padding)", () => {
    expect(slotToTime(1)).toBe("8:30");
  });

  it("maps slot 2 to 9:00 (hour rollover)", () => {
    expect(slotToTime(2)).toBe("9:00");
  });

  it("maps slot 23 to 19:30 (last slot)", () => {
    expect(slotToTime(23)).toBe("19:30");
  });

  it("maps slot 24 to 20:00 (end-of-block clock, used for end labels)", () => {
    expect(slotToTime(24)).toBe("20:00");
  });
});

// ============================================================================
// timeToSlot — exact bounds & -1 sentinel
// ============================================================================

describe("timeToSlot", () => {
  it("maps 8:00 to slot 0", () => {
    expect(timeToSlot("8:00")).toBe(0);
  });

  it("maps 19:30 to slot 23 (last valid)", () => {
    expect(timeToSlot("19:30")).toBe(23);
  });

  it("rounds 8:15 down to slot 0 (minute < 30)", () => {
    expect(timeToSlot("8:15")).toBe(0);
  });

  it("returns -1 just past the last valid slot (19:31)", () => {
    expect(timeToSlot("19:31")).toBe(-1);
  });

  it("returns -1 below the window (7:30)", () => {
    expect(timeToSlot("7:30")).toBe(-1);
  });

  it("returns -1 at the exclusive end (20:00)", () => {
    expect(timeToSlot("20:00")).toBe(-1);
  });

  it("round-trips every valid slot", () => {
    for (let s = 0; s <= MAX_SLOT_INDEX; s++) {
      expect(timeToSlot(slotToTime(s))).toBe(s);
    }
  });
});

// ============================================================================
// slotsToHours
// ============================================================================

describe("slotsToHours", () => {
  it("weights 2 slots as 1 hour", () => {
    expect(slotsToHours(2)).toBe(1);
  });

  it("weights 1 slot as 0.5 hours", () => {
    expect(slotsToHours(1)).toBe(0.5);
  });

  it("weights 0 slots as 0 hours", () => {
    expect(slotsToHours(0)).toBe(0);
  });
});

// ============================================================================
// pixelToSlotFloor vs pixelToSlotRound — the floor/round distinction
// ============================================================================

describe("pixelToSlotFloor (draw start)", () => {
  it("returns the slot the Y falls inside, not the nearest boundary", () => {
    expect(pixelToSlotFloor(0)).toBe(0);
    expect(pixelToSlotFloor(27)).toBe(0); // still inside slot 0
    expect(pixelToSlotFloor(28)).toBe(1);
    expect(pixelToSlotFloor(55)).toBe(1); // still inside slot 1
    expect(pixelToSlotFloor(56)).toBe(2);
  });
});

describe("pixelToSlotRound (resize / draw-move)", () => {
  it("snaps to the nearest slot boundary", () => {
    expect(pixelToSlotRound(13)).toBe(0);
    expect(pixelToSlotRound(14)).toBe(1); // 0.5 rounds up
    expect(pixelToSlotRound(28)).toBe(1);
    expect(pixelToSlotRound(42)).toBe(2); // 1.5 rounds up
  });
});

// ============================================================================
// slotToPixels / durationToPixels
// ============================================================================

describe("slotToPixels / durationToPixels", () => {
  it("multiplies slot index by SLOT_HEIGHT for the top offset", () => {
    expect(slotToPixels(0)).toBe(0);
    expect(slotToPixels(3)).toBe(84);
  });

  it("multiplies duration by SLOT_HEIGHT for the height", () => {
    expect(durationToPixels(1)).toBe(28);
    expect(durationToPixels(4)).toBe(112);
  });
});

// ============================================================================
// timeToPixels — exact float math (current-time line)
// ============================================================================

describe("timeToPixels", () => {
  it("is 0 at exactly day start", () => {
    expect(timeToPixels(8, 0)).toBe(0);
  });

  it("matches the original float formula at 8:30", () => {
    // ((8-8)*60 + 30) / 30 * 28 = 28
    expect(timeToPixels(8, 30)).toBe(28);
  });

  it("matches the original float formula at 12:15", () => {
    // ((12-8)*60 + 15) / 30 * 28 = 255 / 30 * 28 = 238
    expect(timeToPixels(12, 15)).toBe(238);
  });
});

// ============================================================================
// Hour-label helpers
// ============================================================================

describe("slotIsHourStart", () => {
  it("is true on hour boundaries, false on half-hours", () => {
    expect(slotIsHourStart(0)).toBe(true);
    expect(slotIsHourStart(1)).toBe(false);
    expect(slotIsHourStart(2)).toBe(true);
    expect(slotIsHourStart(23)).toBe(false);
  });
});

describe("slotToHourLabel", () => {
  it("returns the integer hour for a slot", () => {
    expect(slotToHourLabel(0)).toBe(8);
    expect(slotToHourLabel(2)).toBe(9);
    expect(slotToHourLabel(22)).toBe(19);
    expect(slotToHourLabel(23)).toBe(19); // half-hour shares the hour label
  });
});
