"use client";

/**
 * DayPriorities - Day priorities drop zone section
 *
 * Appears at the top of each day column for prioritized goals.
 * Goals in this section are not time-bound but represent what
 * the user wants to accomplish that day.
 *
 * Will become a drop zone in Phase 5.
 */

import type { DayOfWeek, DayPriority } from "@/types";

interface DayPrioritiesProps {
  dayIndex: DayOfWeek;
}

export function DayPriorities({ dayIndex }: DayPrioritiesProps) {
  // TODO: Get priorities from store in Phase 5
  const priorities: DayPriority[] = [];

  return (
    <div
      className="min-h-[80px] p-2 border-b border-border bg-muted/10"
      data-day={dayIndex}
      data-section="priorities"
    >
      {priorities.length === 0 ? (
        <div className="h-full flex items-center justify-center">
          <span className="text-xs text-muted-foreground italic">
            Drop goals here
          </span>
        </div>
      ) : (
        <div className="space-y-1">
          {/* Priority items will render here */}
        </div>
      )}
    </div>
  );
}
