"use client";

/**
 * DayColumn - Single day column structure
 *
 * Contains all sections for one day:
 * - Day header (name + date, highlights today)
 * - Day Priorities section (placeholder for 02-03)
 * - Time grid (8:00-20:00 slots)
 * - Evening slot (placeholder for 02-03)
 */

import type { DayOfWeek } from "@/types";
import { cn, isSameDay, DAY_NAMES_SHORT } from "@/lib/utils";
import { TimeGrid } from "./TimeGrid";

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
    <div className="flex flex-col border-r border-border last:border-r-0">
      {/* Day header */}
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

      {/* Day Priorities placeholder - added in 02-03 */}
      <div className="p-2 border-b border-border min-h-[60px] bg-muted/20">
        <span className="text-xs text-muted-foreground">Priorities</span>
      </div>

      {/* Time grid */}
      <div className="flex-1">
        <TimeGrid dayIndex={dayIndex} />
      </div>

      {/* Evening slot placeholder - added in 02-03 */}
      <div className="p-2 border-t border-border min-h-[40px] bg-muted/20">
        <span className="text-xs text-muted-foreground">Evening</span>
      </div>
    </div>
  );
}
