"use client";

/**
 * TimeSlot - Individual 30-minute time slot cell
 *
 * Atomic building block of the calendar grid. Each slot represents
 * a 30-minute interval from 8:00-20:00 (24 slots per day).
 * Drop target for goals - dropping creates a time block.
 */

import { useDroppable } from "@dnd-kit/core";
import type { TimeSlotIndex, DayOfWeek } from "@/types";
import type { DropZoneData } from "@/types/dnd";
import { SLOT_HEIGHT } from "@/lib/time-model";

interface TimeSlotProps {
  slotIndex: TimeSlotIndex;
  dayIndex: DayOfWeek;
}

export function TimeSlot({ slotIndex, dayIndex }: TimeSlotProps) {
  // Make this slot a drop target. Horizontal grid lines are real borders rather
  // than a repeating gradient because Safari can randomly drop 1px gradient
  // hairlines while scrolling/rasterizing the calendar.
  const dropData: DropZoneData = {
    zone: "timegrid",
    dayIndex,
    slotIndex,
  };

  const { setNodeRef, isOver } = useDroppable({
    id: `slot-${dayIndex}-${slotIndex}`,
    data: dropData,
  });

  return (
    <div
      ref={setNodeRef}
      className="relative border-t"
      style={{
        height: `${SLOT_HEIGHT}px`,
        borderColor: slotIndex % 2 === 0 ? "var(--ds-line)" : "var(--ds-line-soft)",
        ...(isOver && {
          backgroundColor: 'var(--ds-accent-soft)',
          boxShadow: 'inset 0 0 0 1px var(--ds-accent)',
        }),
      }}
      data-slot={slotIndex}
      data-day={dayIndex}
    />
  );
}
