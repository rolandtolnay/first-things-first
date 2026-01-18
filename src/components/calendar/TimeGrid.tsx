"use client";

/**
 * TimeGrid - Time slot grid for 8:00-20:00
 *
 * Renders 24 TimeSlot components (30-minute intervals) with time labels
 * at hour boundaries on the left side. Uses CSS Grid for alignment.
 * TimeBlocks overlay the slot column with absolute positioning.
 */

import { useMemo } from "react";
import type { TimeSlotIndex, DayOfWeek } from "@/types";
import { useWeekStore } from "@/stores/weekStore";
import { TimeSlot } from "./TimeSlot";
import { TimeBlock } from "./TimeBlock";

interface TimeGridProps {
  dayIndex: DayOfWeek;
}

export function TimeGrid({ dayIndex }: TimeGridProps) {
  // Generate 24 slots: 0-23 representing 8:00-19:30
  const slots = Array.from({ length: 24 }, (_, i) => i as TimeSlotIndex);

  // Get raw time blocks from store (stable reference)
  const timeBlocks = useWeekStore((state) => state.currentWeek?.timeBlocks);

  // Filter blocks for this day in useMemo (avoids infinite loop)
  const blocks = useMemo(() => {
    if (!timeBlocks) return [];
    return timeBlocks.filter((b) => b.dayIndex === dayIndex);
  }, [timeBlocks, dayIndex]);

  return (
    <div className="grid grid-cols-[3rem_1fr]">
      {/* Time labels column */}
      <div>
        {slots.map((slotIndex) => {
          const isHourStart = slotIndex % 2 === 0;
          const hour = 8 + Math.floor(slotIndex / 2);

          return (
            <div
              key={slotIndex}
              className="h-8 flex items-start justify-end pr-2 text-xs text-muted-foreground"
            >
              {isHourStart && `${hour}:00`}
            </div>
          );
        })}
      </div>

      {/* Slots column with blocks overlay */}
      <div className="relative">
        {/* Grid of slots */}
        {slots.map((slotIndex) => (
          <TimeSlot key={slotIndex} slotIndex={slotIndex} dayIndex={dayIndex} />
        ))}

        {/* Blocks overlaid with absolute positioning */}
        {blocks.map((block) => (
          <TimeBlock key={block.id} block={block} />
        ))}
      </div>
    </div>
  );
}
