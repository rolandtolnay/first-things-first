"use client";

import { useMemo } from "react";
import type { DayOfWeek } from "@/types";
import { cn, isSameDay, DAY_NAMES_SHORT } from "@/lib/utils";
import { useWeekStore } from "@/stores/weekStore";
import { HEADER_HEIGHT } from "@/lib/constants";
import { DayPriorities } from "./DayPriorities";
import { TimeGrid } from "./TimeGrid";
import { EveningSlot } from "./EveningSlot";
import { PieChart } from "./PieChart";

/** Faint accent wash behind today's column (derived from the accent token so
 *  it tracks the theme's accent rather than a hardcoded amber lightness). */
const TODAY_WASH = "color-mix(in oklab, var(--ds-accent), transparent 97.5%)";
const TODAY_HEADER_WASH = "color-mix(in oklab, var(--ds-accent), transparent 95%)";

interface DayColumnProps {
  dayIndex: DayOfWeek;
  date: Date;
}

export function DayColumn({ dayIndex, date }: DayColumnProps) {
  const dayName = DAY_NAMES_SHORT[dayIndex];
  const dateNum = date.getDate();
  const isToday = isSameDay(date, new Date());

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

  return (
    <div
      className="flex flex-col min-w-[140px]"
      style={{
        borderRight: '1px solid var(--ds-line)',
        backgroundColor: isToday ? TODAY_WASH : undefined,
      }}
    >
      {/* Header with stacked day/date and the completion Donut */}
      <div
        className="flex items-center justify-between px-3 sticky top-0 z-10 border-b border-border"
        style={{
          height: `${HEADER_HEIGHT}px`,
          backgroundColor: isToday ? TODAY_HEADER_WASH : 'var(--ds-window)',
        }}
      >
        {/* Left: stacked day name + date */}
        <div className="flex flex-col items-start gap-0.5 leading-none">
          <span className="font-mono text-label uppercase tracking-[0.12em] text-secondary-foreground">
            {dayName}
          </span>
          <span
            className={cn(
              "relative text-[20px] font-semibold tabular-nums tracking-[-0.02em]",
              isToday ? "text-primary" : "text-foreground"
            )}
          >
            {isToday && (
              <span
                aria-hidden={true}
                className="absolute -inset-x-1.5 -inset-y-0.5 rounded-[var(--ds-r-xs)] bg-[var(--ds-accent-faint)] ring-1 ring-[var(--ds-accent-soft)]"
              />
            )}
            <span className="relative">{dateNum}</span>
          </span>
        </div>

        {/* Right: completion Donut */}
        <PieChart completed={completed} total={total} size={26} showLabel={false} />
      </div>

      {/* Day Priorities section */}
      <DayPriorities dayIndex={dayIndex} />

      {/* Time grid */}
      <TimeGrid dayIndex={dayIndex} isToday={isToday} />

      {/* Evening slot */}
      <EveningSlot dayIndex={dayIndex} />
    </div>
  );
}
