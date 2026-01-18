"use client";

/**
 * TimeBlock - Visual rendering of a scheduled time block
 *
 * Renders a time block in the calendar grid with:
 * - Height based on duration (duration * 32px)
 * - Position based on startSlot (startSlot * 32px)
 * - Role color styling (background with opacity, solid left border)
 * - Delete button on hover
 * - Draggable for repositioning via drag-drop
 */

import { useDraggable } from "@dnd-kit/core";
import type { TimeBlock as TimeBlockType, DayOfWeek } from "@/types";
import type { BlockDragData } from "@/types/dnd";
import { getRoleColorStyle } from "@/lib/role-colors";
import { useWeekStore } from "@/stores/weekStore";
import { cn } from "@/lib/utils";

interface TimeBlockProps {
  block: TimeBlockType;
}

export function TimeBlock({ block }: TimeBlockProps) {
  const deleteTimeBlock = useWeekStore((state) => state.deleteTimeBlock);

  // Set up draggable with block data
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `block-${block.id}`,
    data: {
      type: "block",
      blockId: block.id,
      sourceDay: block.dayIndex as DayOfWeek,
    } satisfies BlockDragData,
  });

  // Calculate height based on duration: each slot is 32px (h-8)
  const height = block.duration * 32;
  // Calculate top position based on start slot
  const top = block.startSlot * 32;

  // Get role color for styling (or use neutral for freestyle without role)
  const roleColor = block.roleId
    ? getRoleColorStyle(
        useWeekStore.getState().currentWeek?.roles.find((r) => r.id === block.roleId)?.color ?? "teal"
      )
    : undefined;

  const handleDelete = () => {
    deleteTimeBlock(block.id);
  };

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        "absolute left-0 right-0 z-10 rounded-sm overflow-hidden",
        "group flex flex-col justify-start p-1",
        "cursor-grab active:cursor-grabbing",
        block.roleId ? "" : "bg-muted",
        isDragging && "opacity-50"
      )}
      style={{
        top: `${top}px`,
        height: `${height}px`,
        ...(roleColor && {
          backgroundColor: `${roleColor.replace(")", " / 0.2)")}`,
          borderLeft: `3px solid ${roleColor}`,
        }),
      }}
    >
      {/* Title - truncated */}
      <span className="text-xs font-medium truncate pr-5">{block.title}</span>

      {/* Delete button - visible on hover */}
      <button
        type="button"
        onClick={handleDelete}
        className={cn(
          "absolute top-1 right-1 p-0.5 rounded-sm",
          "opacity-0 group-hover:opacity-100 transition-opacity",
          "hover:bg-destructive/20 text-muted-foreground hover:text-destructive"
        )}
        aria-label="Delete time block"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}
