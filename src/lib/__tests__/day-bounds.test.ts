import { describe, it, expect } from "vitest";

import {
  DEFAULT_DAY_BOUNDS,
  gridHeight,
  isValidDayBounds,
  maxSlotIndex,
  slotToHourLabel,
  slotToTime,
  timeToSlot,
  totalSlots,
  weekDayBounds,
  SLOT_HEIGHT,
} from "@/lib/time-model";
import { resolveNewPlacement, resolveMovePlacement } from "@/lib/scheduling";
import { buildTargetWeek } from "@/lib/weekly-handoff";
import type { Role, Week, WeekId } from "@/types";

const EARLY_LONG = { startHour: 7, endHour: 22 };

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
    id: "2026-W10" as WeekId,
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

describe("day-bounds time model", () => {
  it("defaults stay the historical 8:00–20:00 grid", () => {
    expect(totalSlots()).toBe(24);
    expect(maxSlotIndex()).toBe(23);
    expect(slotToTime(0)).toBe("8:00");
    expect(slotToTime(23)).toBe("19:30");
  });

  it("scales slot count and grid height with the bounds", () => {
    expect(totalSlots(EARLY_LONG)).toBe(30);
    expect(maxSlotIndex(EARLY_LONG)).toBe(29);
    expect(gridHeight(EARLY_LONG)).toBe(30 * SLOT_HEIGHT);
  });

  it("anchors slot 0 to the configured start hour", () => {
    expect(slotToTime(0, EARLY_LONG)).toBe("7:00");
    expect(slotToTime(29, EARLY_LONG)).toBe("21:30");
    expect(slotToHourLabel(2, EARLY_LONG)).toBe(8);
  });

  it("timeToSlot honors the configured window", () => {
    expect(timeToSlot("7:00", EARLY_LONG)).toBe(0);
    expect(timeToSlot("21:30", EARLY_LONG)).toBe(29);
    expect(timeToSlot("7:00")).toBe(-1);
    expect(timeToSlot("6:30", EARLY_LONG)).toBe(-1);
  });

  it("validates bounds within the supported window and ordering", () => {
    expect(isValidDayBounds({ startHour: 7, endHour: 22 })).toBe(true);
    expect(isValidDayBounds({ startHour: 5, endHour: 24 })).toBe(true);
    expect(isValidDayBounds({ startHour: 4, endHour: 20 })).toBe(false);
    expect(isValidDayBounds({ startHour: 13, endHour: 20 })).toBe(false);
    expect(isValidDayBounds({ startHour: 8, endHour: 25 })).toBe(false);
    expect(isValidDayBounds({ startHour: 8.5, endHour: 20 })).toBe(false);
  });

  it("weekDayBounds falls back to the default for legacy or invalid documents", () => {
    expect(weekDayBounds(week())).toBe(DEFAULT_DAY_BOUNDS);
    expect(weekDayBounds(null)).toBe(DEFAULT_DAY_BOUNDS);
    expect(
      weekDayBounds(week({ dayBounds: { startHour: 3, endHour: 30 } }))
    ).toBe(DEFAULT_DAY_BOUNDS);
    expect(weekDayBounds(week({ dayBounds: EARLY_LONG }))).toEqual(EARLY_LONG);
  });
});

describe("day-bounds scheduling", () => {
  it("accepts placements beyond the default range under wider bounds", () => {
    // Slot 26 = 20:00 under 7:00–22:00 — invalid by default, valid here.
    expect(resolveNewPlacement(26, [], 2)).toMatchObject({ ok: false });
    expect(resolveNewPlacement(26, [], 2, EARLY_LONG)).toMatchObject({
      ok: true,
      startSlot: 26,
      duration: 2,
    });
  });

  it("clamps the end of day to the configured window", () => {
    const placement = resolveNewPlacement(29, [], 2, EARLY_LONG);
    expect(placement).toMatchObject({ ok: true, startSlot: 28, duration: 2 });
  });

  it("rejects moves outside a narrow window", () => {
    const narrow = { startHour: 9, endHour: 17 };
    expect(resolveMovePlacement(16, 2, [], "x", narrow)).toMatchObject({
      ok: false,
      reason: "out-of-range",
    });
  });
});

describe("day-bounds weekly handoff", () => {
  it("carries the Source Week's bounds into the Target Week", () => {
    const target = buildTargetWeek({
      targetWeekId: "2026-W11" as WeekId,
      activeRoles: [role()],
      sourceWeek: week({ dayBounds: EARLY_LONG }),
      selectedGoalIds: new Set(),
    });
    expect(target.dayBounds).toEqual(EARLY_LONG);
  });

  it("leaves default-bounds weeks without the field", () => {
    const target = buildTargetWeek({
      targetWeekId: "2026-W11" as WeekId,
      activeRoles: [role()],
      sourceWeek: week(),
      selectedGoalIds: new Set(),
    });
    expect(target.dayBounds).toBeUndefined();
  });
});

// (Shares the week/role factories above.)
describe("weekly reflection at handoff", () => {
  it("never copies the Source Week's reflection into the Target Week", () => {
    const target = buildTargetWeek({
      targetWeekId: "2026-W11" as WeekId,
      activeRoles: [role()],
      sourceWeek: week({ reflection: "Good week, too many meetings." }),
      selectedGoalIds: new Set(),
    });
    expect(target.reflection).toBeUndefined();
  });
});
