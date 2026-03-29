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

interface TimeSlotProps {
  slotIndex: TimeSlotIndex;
  dayIndex: DayOfWeek;
}

export function TimeSlot({ slotIndex, dayIndex }: TimeSlotProps) {
  // Hour boundaries have different border for visual hierarchy
  const isHourStart = slotIndex % 2 === 0;

  // Make this slot a drop target
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
      className="h-7 relative"
      style={{
        borderBottom: isHourStart
          ? '1px solid var(--border)'
          : '1px solid rgba(226, 232, 240, 0.3)',
        ...(isOver && {
          backgroundColor: 'rgba(20, 184, 166, 0.2)',
          boxShadow: 'inset 0 0 0 1px var(--primary)',
        }),
      }}
      data-slot={slotIndex}
      data-day={dayIndex}
    />
  );
}
