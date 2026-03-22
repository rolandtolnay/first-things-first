"use client";

/**
 * DayColumn - Single day column structure
 *
 * Contains all sections for one day:
 * - Day header (name + date, highlights today)
 * - Progress bar (completion ratio for all completable items)
 * - Day Priorities section (drop zone for daily goals)
 * - Time grid (8:00-20:00 slots)
 * - Evening slot (single block for evening activities)
 */

import { useMemo } from "react";
import type { DayOfWeek } from "@/types";
import { cn, isSameDay, DAY_NAMES_SHORT } from "@/lib/utils";
import { useWeekStore } from "@/stores/weekStore";
import { DayPriorities } from "./DayPriorities";
import { TimeGrid } from "./TimeGrid";
import { EveningSlot } from "./EveningSlot";

interface DayColumnProps {
  dayIndex: DayOfWeek;
  date: Date;
}

export function DayColumn({ dayIndex, date }: DayColumnProps) {
  const dayName = DAY_NAMES_SHORT[dayIndex];
  const dateNum = date.getDate();
  const monthShort = date.toLocaleDateString("en-US", { month: "short" });
  const isToday = isSameDay(date, new Date());

  // Compute completion counts for progress bar
  const dayPriorities = useWeekStore((state) => state.currentWeek?.dayPriorities);
  const timeBlocks = useWeekStore((state) => state.currentWeek?.timeBlocks);
  const eveningBlocks = useWeekStore((state) => state.currentWeek?.eveningBlocks);

  const { completed, total } = useMemo(() => {
    let comp = 0;
    let tot = 0;

    if (dayPriorities) {
      const dp = dayPriorities.filter((p) => p.dayIndex === dayIndex);
      tot += dp.length;
      comp += dp.filter((p) => p.completed).length;
    }

    if (timeBlocks) {
      const tb = timeBlocks.filter((b) => b.dayIndex === dayIndex);
      tot += tb.length;
      comp += tb.filter((b) => b.completed).length;
    }

    if (eveningBlocks) {
      const eb = eveningBlocks.filter((b) => b.dayIndex === dayIndex);
      tot += eb.length;
      comp += eb.filter((b) => b.completed).length;
    }

    return { completed: comp, total: tot };
  }, [dayPriorities, timeBlocks, eveningBlocks, dayIndex]);

  const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div
      className={cn(
        "flex flex-col min-w-[140px]",
      )}
      style={{
        borderRight: '1px solid rgba(226, 232, 240, 0.5)',
        backgroundColor: isToday ? 'var(--bg-today)' : undefined,
      }}
    >
      {/* Day header - sticky */}
      <div
        className="p-2 text-center sticky top-0 z-10"
        style={{
          backgroundColor: isToday ? 'var(--bg-today)' : 'var(--bg-card)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div
          style={{
            fontSize: '12px',
            fontWeight: 500,
            lineHeight: '1.4',
            letterSpacing: '0.01em',
            color: 'var(--text-muted)',
          }}
        >
          {dayName}
        </div>
        <div className="flex items-center justify-center mt-0.5">
          {isToday ? (
            <span
              className="inline-flex items-center justify-center"
              style={{
                width: '28px',
                height: '28px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--primary-soft)',
                color: 'var(--primary)',
                fontSize: '14px',
                fontWeight: 700,
              }}
            >
              {dateNum}
            </span>
          ) : (
            <span
              style={{
                fontSize: '14px',
                color: 'var(--text-secondary)',
              }}
            >
              {monthShort} {dateNum}
            </span>
          )}
        </div>

        {/* Progress bar */}
        {total > 0 && (
          <div
            className="mt-1.5 mx-auto"
            style={{
              height: '3px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--border-subtle)',
              maxWidth: '80%',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${progressPercent}%`,
                backgroundColor: 'var(--primary-muted)',
                borderRadius: 'var(--radius-full)',
                transition: 'width 300ms ease',
              }}
            />
          </div>
        )}
      </div>

      {/* Day Priorities section */}
      <DayPriorities dayIndex={dayIndex} />

      {/* Time grid */}
      <div className="flex-1">
        <TimeGrid dayIndex={dayIndex} />
      </div>

      {/* Evening slot */}
      <EveningSlot dayIndex={dayIndex} />
    </div>
  );
}
