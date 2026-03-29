"use client";

import { useMemo } from "react";
import type { DayOfWeek } from "@/types";
import { isSameDay, DAY_NAMES_SHORT } from "@/lib/utils";
import { useWeekStore } from "@/stores/weekStore";
import { cn } from "@/lib/utils";
import { DayPriorities } from "./DayPriorities";
import { TimeGrid } from "./TimeGrid";
import { EveningSlot } from "./EveningSlot";
import { PieChart } from "./PieChart";

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
        borderRight: '1px solid rgba(226, 232, 240, 0.5)',
        backgroundColor: isToday ? 'var(--today)' : undefined,
      }}
    >
      {/* Single-line header with pie chart */}
      <div
        className="flex items-center gap-1.5 px-2 pt-2 pb-0.5 sticky top-0 z-10 h-[35px] border-b border-border"
        style={{
          backgroundColor: isToday ? 'var(--today)' : 'var(--card)',
        }}
      >
        <PieChart completed={completed} total={total} size={24} />
        <span className="text-xs text-secondary-foreground">
          {dayName}
        </span>
        <span
          className={cn(
            "text-sm",
            isToday ? "font-bold text-primary" : "text-secondary-foreground"
          )}
        >
          {dateNum}
        </span>
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
