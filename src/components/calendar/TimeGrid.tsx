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
import { useDndContext } from "@dnd-kit/core";
import type { TimeSlotIndex, DayOfWeek } from "@/types";
import { isCalendarDragData, isCalendarDropZoneData } from "@/types/dnd";
import { useWeekStore } from "@/stores/weekStore";
import { useBlockDraw } from "@/hooks/useBlockDraw";
import { TOTAL_SLOTS, TIME_GRID_HEIGHT, slotToPixels, durationToPixels } from "@/lib/time-model";
import { getRoleColorStyle, getRoleColorStyleWithOpacity } from "@/lib/role-colors";
import { resolveTimeGridDropPreview } from "@/lib/drop-routing";
import { TimeSlot } from "./TimeSlot";
import { TimeBlock } from "./TimeBlock";
import { CurrentTimeIndicator } from "./CurrentTimeIndicator";

interface TimeGridProps {
  dayIndex: DayOfWeek;
  isToday?: boolean;
}

// 24 slots: 0-23 representing 8:00-19:30. Constant — hoisted out of render.
const SLOTS = Array.from({ length: TOTAL_SLOTS }, (_, i) => i as TimeSlotIndex);

export function TimeGrid({ dayIndex, isToday }: TimeGridProps) {
  // Get raw time blocks from store (stable reference)
  const timeBlocks = useWeekStore((state) => state.currentWeek?.timeBlocks);
  const roles = useWeekStore((state) => state.currentWeek?.roles);
  const { active, over } = useDndContext();

  // Filter blocks for this day in useMemo (avoids infinite loop)
  const blocks = useMemo(() => {
    if (!timeBlocks) return [];
    return timeBlocks.filter((b) => b.dayIndex === dayIndex);
  }, [timeBlocks, dayIndex]);

  const dropPreview = useMemo(() => {
    const dragData = active?.data.current;
    if (!isCalendarDragData(dragData)) return null;

    const dropData = over?.data.current;
    if (!isCalendarDropZoneData(dropData)) return null;

    return resolveTimeGridDropPreview(
      dragData,
      dropData,
      dayIndex,
      { timeBlocks: timeBlocks ?? [], roles: roles ?? [] }
    );
  }, [active, over, dayIndex, timeBlocks, roles]);

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
      style={{
        height: `${TIME_GRID_HEIGHT}px`,
        ...(isDrawing ? { touchAction: "none", userSelect: "none" } : {}),
      }}
    >
      {/* Grid of slots */}
      {SLOTS.map((slotIndex) => (
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

      {/* Current time indicator */}
      {isToday && <CurrentTimeIndicator />}

      {/* Drop preview during DnD and draw preview during click-drag-draw */}
      {(dropPreview || (isDrawing && previewBlock)) && (
        <div
          className="absolute z-20 pointer-events-none"
          style={{
            top: `${slotToPixels((dropPreview ?? previewBlock)!.startSlot)}px`,
            left: 4,
            right: 4,
            height: `${durationToPixels((dropPreview ?? previewBlock)!.duration)}px`,
            borderRadius: 'var(--ds-r-sm)',
            border: `1px dashed ${dropPreview?.roleColor ? getRoleColorStyle(dropPreview.roleColor) : "var(--ds-accent)"}`,
            backgroundColor: dropPreview?.roleColor
              ? getRoleColorStyleWithOpacity(dropPreview.roleColor, 0.12)
              : 'var(--ds-accent-soft)',
          }}
        />
      )}
    </div>
  );
}
