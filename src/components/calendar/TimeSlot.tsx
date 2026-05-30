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
  // Make this slot a drop target. Hour hairlines are painted by the TimeGrid
  // background gradient, so slots themselves are borderless at this density.
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
      className="relative"
      style={{
        height: `${SLOT_HEIGHT}px`,
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
