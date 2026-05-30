import { describe, it, expect } from "vitest";
import { computeStreak } from "@/lib/streak";
import type { Week, DayPriority } from "@/types";

/** A minimal DayPriority — only the fields computeStreak reads. */
function makePriority(
  dayIndex: number,
  completed: boolean,
  id = `p-${dayIndex}-${completed}`
): DayPriority {
  return {
    id,
    goalId: "g",
    dayIndex: dayIndex as DayPriority["dayIndex"],
    order: 0,
    completed,
  };
}

/**
 * Build a Week-shaped fixture carrying only dayPriorities (the sole field the
 * function reads). Cast as Week — the other fields are irrelevant here, same as
 * the role-balance test casts its fixtures.
 */
function makeWeek(dayPriorities: DayPriority[]): Week {
  return { dayPriorities } as Week;
}

describe("computeStreak", () => {
  it("marks a day complete when it has >=1 priority and all are completed", () => {
    const week = makeWeek([
      makePriority(0, true, "a"),
      makePriority(0, true, "b"),
    ]);
    const result = computeStreak(week, 0);
    expect(result.days[0]).toBe(true);
  });

  it("does NOT mark a day complete when some priorities are incomplete", () => {
    const week = makeWeek([
      makePriority(2, true, "a"),
      makePriority(2, false, "b"),
    ]);
    const result = computeStreak(week, 2);
    expect(result.days[2]).toBe(false);
  });

  it("does NOT mark a day complete when it has zero priorities", () => {
    // Day 3 has no priorities at all.
    const week = makeWeek([makePriority(0, true)]);
    const result = computeStreak(week, 6);
    expect(result.days[3]).toBe(false);
  });

  it("counts currentRun back from todayIndex, stopping at the first incomplete day", () => {
    // Days 0,1,2 complete; day 3 incomplete; day 4 complete. todayIndex = 4.
    const week = makeWeek([
      makePriority(0, true),
      makePriority(1, true),
      makePriority(2, true),
      makePriority(3, false), // breaks the run before today
      makePriority(4, true),
    ]);
    const result = computeStreak(week, 4);
    // Walking back from 4: day 4 complete (1), day 3 incomplete => stop.
    expect(result.currentRun).toBe(1);
  });

  it("counts a multi-day run up to todayIndex", () => {
    // Days 2,3,4 complete; today = 4 => run of 3. Day 1 is empty (not a run member).
    const week = makeWeek([
      makePriority(2, true),
      makePriority(3, true),
      makePriority(4, true),
    ]);
    const result = computeStreak(week, 4);
    expect(result.currentRun).toBe(3);
    expect(result.days).toEqual([false, false, true, true, true, false, false]);
  });

  it("returns currentRun 0 when today itself is incomplete", () => {
    const week = makeWeek([
      makePriority(0, true),
      makePriority(1, false), // today incomplete
    ]);
    const result = computeStreak(week, 1);
    expect(result.currentRun).toBe(0);
  });

  it("clamps todayIndex < 0 to a run of 0 (today is before this week)", () => {
    const week = makeWeek([
      makePriority(0, true),
      makePriority(1, true),
    ]);
    const result = computeStreak(week, -1);
    expect(result.currentRun).toBe(0);
    // days are still derived even when the run is 0.
    expect(result.days[0]).toBe(true);
    expect(result.days[1]).toBe(true);
  });

  it("clamps todayIndex > 6 to day 6 (counts the trailing run from Sunday)", () => {
    // Days 5 and 6 complete; today after the week (e.g. 7) counts from day 6.
    const week = makeWeek([
      makePriority(5, true),
      makePriority(6, true),
    ]);
    const result = computeStreak(week, 7);
    expect(result.currentRun).toBe(2);
  });

  it("returns empty days and run 0 for a null week", () => {
    const result = computeStreak(null, 3);
    expect(result.days).toEqual([
      false, false, false, false, false, false, false,
    ]);
    expect(result.currentRun).toBe(0);
  });

  it("returns empty days and run 0 for an undefined week", () => {
    const result = computeStreak(undefined, 3);
    expect(result.days).toEqual([
      false, false, false, false, false, false, false,
    ]);
    expect(result.currentRun).toBe(0);
  });
});
