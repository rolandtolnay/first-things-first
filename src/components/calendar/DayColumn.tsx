"use client";

/**
 * DayColumn - Single day column structure
 *
 * Contains all sections for one day:
 * - Day header (name + date, highlights today)
 * - Day Priorities section (drop zone for daily goals)
 * - Time grid (8:00-20:00 slots)
 * - Evening slot (single block for evening activities)
 */

import type { DayOfWeek } from "@/types";
import { cn, isSameDay, DAY_NAMES_SHORT } from "@/lib/utils";
import { DayPriorities } from "./DayPriorities";
import { TimeGrid } from "./TimeGrid";
import { EveningSlot } from "./EveningSlot";

interface DayColumnProps {
  dayIndex: DayOfWeek;
  date: Date;
}

export function DayColumn({ dayIndex, date }: DayColumnProps) {
  const dayName = DAY_NAMES_SHORT[dayIndex];
  const dateStr = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const isToday = isSameDay(date, new Date());

  return (
    <div className="flex flex-col border-r border-border last:border-r-0 min-w-[140px]">
      {/* Day header - sticky */}
      <div
        className={cn(
          "p-2 text-center border-b border-border sticky top-0 bg-background z-10",
          isToday && "bg-primary/10"
        )}
      >
        <div className="text-sm font-medium">{dayName}</div>
        <div
          className={cn(
            "text-xs",
            isToday ? "text-primary font-semibold" : "text-muted-foreground"
          )}
        >
          {dateStr}
        </div>
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
