/**
 * Streak — the pure derivation behind the Rail's Daily Streak card.
 *
 * Single owner of the "is a day complete?" and "how long is the current run?"
 * rules, kept free of React, the store, and Date so it can be unit-tested in
 * isolation (mirrors role-balance.ts). The caller resolves "today" to a day
 * index and hands it in; this module never reads the clock.
 *
 * Day completion rule (CONTEXT.md → Daily Streak):
 *   A day counts complete iff it has >= 1 DayPriority AND all of that day's
 *   priorities are completed. Zero priorities => not complete (you cannot
 *   complete what you never planned).
 *
 * Current run:
 *   Starting at todayIndex (inclusive) and walking backward toward day 0, the
 *   count of consecutive complete days, stopping at the first incomplete day.
 *   The reference index is clamped to the current week:
 *     - todayIndex < 0  => 0 (today is before this week / a future week)
 *     - todayIndex > 6  => treated as day 6 (today is after a fully-elapsed week)
 *
 * Scope is the single passed-in week only — no cross-week / rolling reads.
 */

import type { Week } from "@/types";

export interface StreakResult {
  /** Per-day completion in week order (index 0 = Monday … 6 = Sunday). */
  days: boolean[];
  /** Consecutive complete days walking back from todayIndex (inclusive). */
  currentRun: number;
}

const EMPTY_DAYS: boolean[] = [false, false, false, false, false, false, false];

/**
 * Derive per-day completion and the current run of complete days for a week.
 * A null/undefined week yields all-false days and a run of 0.
 */
export function computeStreak(
  week: Week | null | undefined,
  todayIndex: number
): StreakResult {
  if (!week) {
    return { days: [...EMPTY_DAYS], currentRun: 0 };
  }

  // days[i]: the day has >= 1 priority and every one of them is completed.
  const days: boolean[] = Array.from({ length: 7 }, (_, i) => {
    const dayPriorities = week.dayPriorities.filter((p) => p.dayIndex === i);
    return dayPriorities.length > 0 && dayPriorities.every((p) => p.completed);
  });

  // Reference index for the run: today is before this week => no run yet;
  // today is after a fully-elapsed week => count the trailing run from Sunday.
  if (todayIndex < 0) {
    return { days, currentRun: 0 };
  }
  const reference = todayIndex > 6 ? 6 : todayIndex;

  let currentRun = 0;
  for (let i = reference; i >= 0; i--) {
    if (!days[i]) break;
    currentRun++;
  }

  return { days, currentRun };
}
