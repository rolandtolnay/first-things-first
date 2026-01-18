"use client";

/**
 * TimeSlot - Individual 30-minute time slot cell
 *
 * Atomic building block of the calendar grid. Each slot represents
 * a 30-minute interval from 8:00-20:00 (24 slots per day).
 * Will become a drop target for goals/blocks in Phase 5.
 */

import type { TimeSlotIndex, DayOfWeek } from "@/types";
import { cn } from "@/lib/utils";

interface TimeSlotProps {
  slotIndex: TimeSlotIndex;
  dayIndex: DayOfWeek;
}

export function TimeSlot({ slotIndex, dayIndex }: TimeSlotProps) {
  // Hour boundaries have different background for visual hierarchy
  const isHourStart = slotIndex % 2 === 0;

  return (
    <div
      className={cn(
        "h-8 border-b border-border relative",
        isHourStart ? "bg-background" : "bg-muted/30"
      )}
      data-slot={slotIndex}
      data-day={dayIndex}
    >
      {/* Time blocks will render here in Phase 5 */}
    </div>
  );
}
