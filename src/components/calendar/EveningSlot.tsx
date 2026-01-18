"use client";

/**
 * EveningSlot - Evening slot section below time grid
 *
 * Appears at the bottom of each day column for evening activities
 * (after 8:00 PM). Each day can hold one goal or freestyle block.
 *
 * Will become a drop target in Phase 5.
 */

import type { DayOfWeek } from "@/types";

interface EveningSlotProps {
  dayIndex: DayOfWeek;
}

export function EveningSlot({ dayIndex }: EveningSlotProps) {
  // TODO: Get evening block from store in Phase 5
  const eveningBlock = null;

  return (
    <div
      className="min-h-[48px] p-2 border-t border-border bg-muted/10"
      data-day={dayIndex}
      data-section="evening"
    >
      {!eveningBlock ? (
        <div className="h-full flex items-center justify-center">
          <span className="text-xs text-muted-foreground italic">Evening</span>
        </div>
      ) : (
        <div>{/* Evening block will render here */}</div>
      )}
    </div>
  );
}
