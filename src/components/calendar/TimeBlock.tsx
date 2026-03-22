"use client";

/**
 * TimeBlock - Visual rendering of a scheduled time block
 *
 * Renders a time block in the calendar grid with:
 * - Height based on duration (duration * 32px)
 * - Position based on startSlot (startSlot * 32px)
 * - Role color styling (background with opacity, solid left border)
 * - Delete button on hover
 * - Resize handle at bottom edge (hover-revealed)
 * - Draggable for repositioning via drag-drop
 * - Inline title editing for newly drawn freestyle blocks
 */

import { useState, useRef, useEffect } from "react";
import { useDraggable } from "@dnd-kit/core";
import type { TimeBlock as TimeBlockType, DayOfWeek } from "@/types";
import type { BlockDragData } from "@/types/dnd";
import { getRoleColorStyle } from "@/lib/role-colors";
import { useWeekStore } from "@/stores/weekStore";
import { useBlockResize } from "@/hooks/useBlockResize";
import { CloseIcon } from "@/components/ui/CloseIcon";
import { CompletionCheckbox } from "@/components/ui/CompletionCheckbox";
import { cn, slotToTime } from "@/lib/utils";

interface TimeBlockProps {
  block: TimeBlockType;
  dayBlocks: TimeBlockType[];
  editingBlockId?: string | null;
  onClearEditing?: () => void;
}

export function TimeBlock({
  block,
  dayBlocks,
  editingBlockId,
  onClearEditing,
}: TimeBlockProps) {
  const deleteTimeBlock = useWeekStore((state) => state.deleteTimeBlock);
  const updateTimeBlock = useWeekStore((state) => state.updateTimeBlock);
  const toggleTimeBlockCompleted = useWeekStore((state) => state.toggleTimeBlockCompleted);

  // Inline editing state for newly drawn freestyle blocks
  const isInlineEditing =
    editingBlockId === block.id && block.title === "";
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isInlineEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isInlineEditing]);

  // Resize hook
  const { handleProps, isResizing, previewDuration } = useBlockResize(
    block,
    dayBlocks
  );

  // Set up draggable with block data
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `block-${block.id}`,
    data: {
      type: "block",
      blockId: block.id,
      sourceDay: block.dayIndex as DayOfWeek,
    } satisfies BlockDragData,
  });

  // Calculate display values -- use preview during resize
  const displayDuration = isResizing && previewDuration !== null
    ? previewDuration
    : block.duration;
  const height = displayDuration * 32;
  const top = block.startSlot * 32;

  // Get role color for styling (or use neutral for freestyle without role)
  const roleColorRaw = useWeekStore((state) =>
    block.roleId
      ? state.currentWeek?.roles.find((r) => r.id === block.roleId)?.color
      : undefined
  );
  const roleColor = roleColorRaw ? getRoleColorStyle(roleColorRaw) : undefined;

  const handleInlineKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Stop all keys from reaching dnd-kit's KeyboardSensor on the parent draggable
    e.stopPropagation();
    if (e.key === "Enter") {
      e.preventDefault();
      const trimmed = editValue.trim();
      if (trimmed) {
        updateTimeBlock(block.id, { title: trimmed });
      } else {
        // Empty title on Enter -- cancel creation
        deleteTimeBlock(block.id);
      }
      onClearEditing?.();
    } else if (e.key === "Escape") {
      e.preventDefault();
      // Cancel creation -- delete the empty block
      deleteTimeBlock(block.id);
      onClearEditing?.();
    }
  };

  const handleInlineBlur = () => {
    const trimmed = editValue.trim();
    if (trimmed) {
      updateTimeBlock(block.id, { title: trimmed });
      onClearEditing?.();
    } else {
      // Empty title on blur -- cancel creation
      deleteTimeBlock(block.id);
      onClearEditing?.();
    }
  };

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      data-block
      className={cn(
        "absolute left-0 right-0 z-10 rounded-sm overflow-hidden",
        "group flex flex-col justify-start p-1",
        "cursor-grab active:cursor-grabbing",
        block.roleId ? "" : "bg-muted",
        isDragging && "opacity-50",
        isResizing && "z-20"
      )}
      style={{
        top: `${top}px`,
        height: `${height}px`,
        ...(roleColor && {
          backgroundColor: block.completed
            ? `hsl(var(--success) / 0.15)`
            : `${roleColor.slice(0, -1)} / 0.2)`,
          borderLeft: `3px solid ${roleColor}`,
        }),
        ...(!roleColor && block.completed && {
          backgroundColor: "hsl(var(--success) / 0.15)",
        }),
        ...(isResizing && {
          touchAction: "none",
          userSelect: "none",
        }),
      }}
    >
      {/* Title or inline edit input */}
      {isInlineEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleInlineKeyDown}
          onBlur={handleInlineBlur}
          className="text-xs font-medium bg-transparent border-none outline-none w-full pr-5"
          placeholder="Block title..."
        />
      ) : (
        <div className="flex items-center gap-1 pr-5">
          <CompletionCheckbox
            completed={block.completed}
            onToggle={() => toggleTimeBlockCompleted(block.id)}
            size={12}
          />
          <span className={cn(
            "text-xs font-medium truncate",
            block.completed && !isDragging && "opacity-60"
          )}>
            {block.title}
          </span>
        </div>
      )}

      {/* Time label during resize */}
      {isResizing && previewDuration !== null && (
        <span className="text-[10px] text-muted-foreground mt-auto">
          {slotToTime(block.startSlot)} &ndash;{" "}
          {slotToTime(block.startSlot + previewDuration)}
        </span>
      )}

      {/* Delete button - visible on hover */}
      <button
        type="button"
        onClick={() => deleteTimeBlock(block.id)}
        className={cn(
          "absolute top-1 right-1 p-0.5 rounded-sm",
          "opacity-0 group-hover:opacity-100 transition-opacity",
          "hover:bg-destructive/20 text-muted-foreground hover:text-destructive"
        )}
        aria-label="Delete time block"
      >
        <CloseIcon />
      </button>

      {/* Resize handle at bottom edge - hover-revealed */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize",
          "opacity-0 group-hover:opacity-100 transition-opacity"
        )}
        {...handleProps}
      />
    </div>
  );
}
