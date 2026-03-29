"use client";

/**
 * TimeGrid - Time slot grid for 8:00-20:00
 *
 * Renders 24 TimeSlot components (30-minute intervals).
 * TimeBlocks overlay the slot column with absolute positioning.
 * Supports click-drag-draw for freestyle block creation.
 * Time labels are rendered separately by TimeLabelsColumn.
 */

import { useMemo } from "react";
import type { TimeSlotIndex, DayOfWeek } from "@/types";
import { useWeekStore } from "@/stores/weekStore";
import { useBlockDraw } from "@/hooks/useBlockDraw";
import { SLOT_HEIGHT } from "@/lib/constants";
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

  // Click-drag-draw hook for freestyle block creation
  const {
    containerProps,
    isDrawing,
    previewBlock,
    newBlockId,
    clearNewBlockId,
  } = useBlockDraw(dayIndex, blocks);

  return (
    <div
      className="relative"
      data-slots-column
      {...containerProps}
      style={
        isDrawing
          ? { touchAction: "none", userSelect: "none" }
          : undefined
      }
    >
      {/* Grid of slots */}
      {slots.map((slotIndex) => (
        <TimeSlot key={slotIndex} slotIndex={slotIndex} dayIndex={dayIndex} />
      ))}

      {/* Blocks overlaid with absolute positioning */}
      {blocks.map((block) => (
        <TimeBlock
          key={block.id}
          block={block}
          dayBlocks={blocks}
          editingBlockId={newBlockId}
          onClearEditing={clearNewBlockId}
        />
      ))}

      {/* Draw preview during click-drag-draw */}
      {isDrawing && previewBlock && (
        <div
          className="absolute left-0 right-0 z-20 pointer-events-none"
          style={{
            top: `${previewBlock.startSlot * SLOT_HEIGHT}px`,
            height: `${previewBlock.duration * SLOT_HEIGHT}px`,
            borderRadius: 'var(--radius-md)',
            border: '2px dashed var(--primary)',
            backgroundColor: 'rgba(20, 184, 166, 0.1)',
            opacity: 0.5,
          }}
        />
      )}
    </div>
  );
}
