"use client";

import { Flame } from "lucide-react";

import { SectionLabel } from "@/components/ui/SectionLabel";
import { StreakGrid } from "@/components/ui/StreakGrid";
import { computeStreak } from "@/lib/streak";
import { getWeekDates, isSameDay } from "@/lib/utils";
import { useWeekStore } from "@/stores/weekStore";

/** Mono single-letter legend aligned under the 7-cell grid (Mon → Sun). */
const DAY_LETTERS = ["M", "T", "W", "T", "F", "S", "S"] as const;

/**
 * Daily Streak — a 7-cell current-week completion grid plus the current run.
 *
 * A day counts complete only when it has >= 1 priority and all are done
 * (CONTEXT.md → Daily Streak). "Today" is resolved against the current week's
 * dates: findIndex yields -1 when today is outside this week, which the pure
 * computeStreak handles (no run for a future week); a fully-elapsed past week
 * is passed index 7 so the trailing run from Sunday is counted.
 */
export function StreakCard() {
  const week = useWeekStore((s) => s.currentWeek);

  const todayIndex = resolveTodayIndex(week?.id);
  const { days, currentRun } = computeStreak(week, todayIndex);

  // boolean[] → fill level: complete days are filled (2); today, if planned but
  // not yet fully complete, gets a subtle partial (1); everything else empty.
  const levels = days.map((complete, i) => {
    if (complete) return 2;
    if (i === todayIndex) return 1;
    return 0;
  });

  return (
    <div className="flex flex-col gap-3">
      <SectionLabel icon={<Flame strokeWidth={1.4} />}>Daily Streak</SectionLabel>

      <div className="flex items-baseline gap-1.5">
        <span className="font-mono text-2xl font-semibold tabular-nums text-primary">
          {currentRun}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          Day Streak
        </span>
      </div>

      <StreakGrid days={levels} />

      <div className="grid grid-cols-7 gap-[5px] font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        {DAY_LETTERS.map((letter, i) => (
          <span key={i} className="text-center">
            {letter}
          </span>
        ))}
      </div>
    </div>
  );
}

/**
 * Resolve "today" to a day index within the given week.
 *  -1  → today is not in this week (future week / before it): no run.
 *   7  → today is after a fully-elapsed past week: count the trailing run.
 *  0–6 → today's position in the current week.
 */
function resolveTodayIndex(weekId: string | undefined): number {
  if (!weekId) return -1;

  const dates = getWeekDates(weekId as Parameters<typeof getWeekDates>[0]);
  const now = new Date();
  const index = dates.findIndex((d) => isSameDay(d, now));
  if (index >= 0) return index;

  // Not in this week: if the whole week is in the past, count from Sunday.
  const sunday = dates[6];
  return now > sunday ? 7 : -1;
}
