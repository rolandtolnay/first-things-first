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
import { cn } from "@/lib/utils";

interface TimeSlotProps {
  slotIndex: TimeSlotIndex;
  dayIndex: DayOfWeek;
}

export function TimeSlot({ slotIndex, dayIndex }: TimeSlotProps) {
  // Hour boundaries have different background for visual hierarchy
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
      className={cn(
        "h-8 border-b border-border relative",
        isHourStart ? "bg-background" : "bg-muted/30",
        isOver && "bg-primary/20 ring-1 ring-primary"
      )}
      data-slot={slotIndex}
      data-day={dayIndex}
    />
  );
}
