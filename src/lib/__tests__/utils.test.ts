import { describe, it, expect } from "vitest";
import {
  getWeekId,
  parseWeekId,
  formatWeekId,
  getWeekNumber,
  getCurrentWeekId,
  getNextWeekId,
  getPreviousWeekId,
  getWeekIdRange,
  getWeekDates,
  getWeekStartDate,
  getDateForDayIndex,
  isSameDay,
} from "@/lib/utils";
import type { WeekId } from "@/types";

// ============================================================================
// UTC-based, deterministic week math (the bulk of the coverage).
//
// getWeekId / parseWeekId / formatWeekId / getWeekNumber and the navigation
// helpers built on them are all UTC-based, so these assertions are machine- and
// timezone-independent. getWeekStartDate / getDateForDayIndex / isSameDay use
// *local* date methods — those are covered further down with explicit, TZ-robust
// inputs.
//
// Reference anchor: ISO week 2026-W01 starts Monday 2025-12-29 (UTC); its
// Thursday is 2026-01-01. Several cases below lean on that boundary.
// ============================================================================

describe("getWeekId / parseWeekId round-trip", () => {
  it("round-trips a mid-year week", () => {
    const id = "2026-W23" as WeekId;
    expect(getWeekId(parseWeekId(id))).toBe(id);
  });

  it("round-trips the first ISO week across the year boundary", () => {
    const id = "2026-W01" as WeekId;
    expect(getWeekId(parseWeekId(id))).toBe(id);
  });

  it("parseWeekId returns a Monday (UTC) anchored at 2025-12-29 for 2026-W01", () => {
    const monday = parseWeekId("2026-W01" as WeekId);
    expect(monday.getUTCDay()).toBe(1); // Monday
    expect(monday.getUTCFullYear()).toBe(2025);
    expect(monday.getUTCMonth()).toBe(11); // December
    expect(monday.getUTCDate()).toBe(29);
  });

  it("throws on a malformed week id", () => {
    expect(() => parseWeekId("not-a-week" as WeekId)).toThrow();
  });
});

describe("week id navigation", () => {
  it("getNextWeekId advances one week", () => {
    expect(getNextWeekId("2026-W01" as WeekId)).toBe("2026-W02");
  });

  it("getPreviousWeekId crosses the year boundary into the last week of 2025", () => {
    expect(getPreviousWeekId("2026-W01" as WeekId)).toBe("2025-W52");
  });

  it("getNextWeekId and getPreviousWeekId are inverse", () => {
    expect(getPreviousWeekId(getNextWeekId("2026-W10" as WeekId))).toBe("2026-W10");
  });

  it("getWeekIdRange returns n consecutive weeks starting at the given id", () => {
    expect(getWeekIdRange("2026-W01" as WeekId, 3)).toEqual([
      "2026-W01",
      "2026-W02",
      "2026-W03",
    ]);
  });

  it("getWeekIdRange of length 1 is just the start id", () => {
    expect(getWeekIdRange("2026-W07" as WeekId, 1)).toEqual(["2026-W07"]);
  });
});

describe("formatWeekId", () => {
  it("formats a same-month week (2026-W03: Jan 12-18)", () => {
    expect(formatWeekId("2026-W03" as WeekId)).toBe("Jan 12-18, 2026");
  });

  it("formats a cross-month, cross-year week (2026-W01: Dec 29 - Jan 4)", () => {
    expect(formatWeekId("2026-W01" as WeekId)).toBe("Dec 29 - Jan 4, 2026");
  });
});

describe("getWeekNumber", () => {
  it("extracts the numeric week", () => {
    expect(getWeekNumber("2026-W07" as WeekId)).toBe(7);
  });

  it("throws on a malformed id", () => {
    expect(() => getWeekNumber("bad" as WeekId)).toThrow();
  });
});

describe("getCurrentWeekId", () => {
  it("returns a well-formed ISO week id", () => {
    expect(getCurrentWeekId()).toMatch(/^\d{4}-W\d{2}$/);
  });
});

describe("getWeekDates", () => {
  it("returns 7 consecutive calendar days", () => {
    const dates = getWeekDates("2026-W03" as WeekId);
    expect(dates).toHaveLength(7);

    for (let i = 1; i < 7; i++) {
      const diffHours = (dates[i].getTime() - dates[i - 1].getTime()) / 3_600_000;
      // Consecutive days; 23–25h tolerance keeps the assertion DST-robust.
      expect(diffHours).toBeGreaterThanOrEqual(23);
      expect(diffHours).toBeLessThanOrEqual(25);
    }
  });
});

// ============================================================================
// Local-date helpers — inputs built with the local Date constructor so the
// assertions don't depend on the runner's timezone offset.
// ============================================================================

describe("getWeekStartDate (local)", () => {
  it("returns the Monday for a mid-week local date", () => {
    // Wed 2026-05-27 (local) → Monday 2026-05-25
    const monday = getWeekStartDate(new Date(2026, 4, 27, 15, 0));
    expect(monday.getDay()).toBe(1); // Monday
    expect(monday.getDate()).toBe(25);
    expect(monday.getHours()).toBe(0);
    expect(monday.getMinutes()).toBe(0);
  });

  it("treats Sunday as the end of the week (returns the prior Monday)", () => {
    // Sun 2026-05-31 (local) → Monday 2026-05-25
    const monday = getWeekStartDate(new Date(2026, 4, 31, 12, 0));
    expect(monday.getDay()).toBe(1);
    expect(monday.getDate()).toBe(25);
  });
});

describe("getDateForDayIndex (local)", () => {
  it("offsets the week-start date by the day index", () => {
    const start = new Date(2026, 4, 25); // Monday (local)
    expect(getDateForDayIndex(start, 0).getDate()).toBe(25);
    expect(getDateForDayIndex(start, 2).getDate()).toBe(27);
    expect(getDateForDayIndex(start, 6).getDate()).toBe(31);
  });
});

describe("isSameDay (local)", () => {
  it("is true for the same calendar day at different times", () => {
    expect(
      isSameDay(new Date(2026, 4, 30, 9, 0), new Date(2026, 4, 30, 18, 30))
    ).toBe(true);
  });

  it("is false for different calendar days", () => {
    expect(isSameDay(new Date(2026, 4, 30), new Date(2026, 4, 31))).toBe(false);
  });

  it("is false for the same day-of-month in different months", () => {
    expect(isSameDay(new Date(2026, 4, 30), new Date(2026, 5, 30))).toBe(false);
  });
});
