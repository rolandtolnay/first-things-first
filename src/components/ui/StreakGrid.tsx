import * as React from "react";

import { cn } from "@/lib/utils";

interface StreakGridProps {
  /**
   * One entry per day, in week order. Each entry is a fill level:
   *   0 = empty (incomplete / no plan), 1 = partial, 2 = complete.
   * (Callers with a boolean per day can map `done ? 2 : 0`.)
   */
  days: number[];
  className?: string;
}

/**
 * A row of small color squares visualising a streak (one cell per day).
 */
export function StreakGrid({ days, className }: StreakGridProps) {
  return (
    <div className={cn("flex gap-[5px]", className)}>
      {days.map((level, i) => (
        <div
          key={i}
          className={cn(
            "h-6 flex-1 rounded-[var(--ds-r-xs)] border",
            level >= 2 && "border-primary bg-primary",
            level === 1 && "border-transparent bg-primary-soft",
            level <= 0 && "border-border-soft bg-card"
          )}
        />
      ))}
    </div>
  );
}
