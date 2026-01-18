"use client";

/**
 * TimeGrid - Time slot grid for 8:00-20:00
 *
 * Renders 24 TimeSlot components (30-minute intervals) with time labels
 * at hour boundaries on the left side. Uses CSS Grid for alignment.
 */

import type { TimeSlotIndex, DayOfWeek } from "@/types";
import { TimeSlot } from "./TimeSlot";

interface TimeGridProps {
  dayIndex: DayOfWeek;
}

export function TimeGrid({ dayIndex }: TimeGridProps) {
  // Generate 24 slots: 0-23 representing 8:00-19:30
  const slots = Array.from({ length: 24 }, (_, i) => i as TimeSlotIndex);

  return (
    <div className="relative">
      {slots.map((slotIndex) => {
        const isHourStart = slotIndex % 2 === 0;
        const hour = 8 + Math.floor(slotIndex / 2);

        return (
          <div key={slotIndex} className="grid grid-cols-[3rem_1fr]">
            {/* Time label - only shown at hour boundaries */}
            <div className="h-8 flex items-start justify-end pr-2 text-xs text-muted-foreground">
              {isHourStart && `${hour}:00`}
            </div>
            {/* Time slot */}
            <TimeSlot slotIndex={slotIndex} dayIndex={dayIndex} />
          </div>
        );
      })}
    </div>
  );
}
