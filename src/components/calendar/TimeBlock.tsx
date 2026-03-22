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
import { X } from "lucide-react";
import type { TimeBlock as TimeBlockType, DayOfWeek } from "@/types";
import type { BlockDragData } from "@/types/dnd";
import { getRoleColorStyle, getRoleColorStyleWithOpacity } from "@/lib/role-colors";
import { useWeekStore } from "@/stores/weekStore";
import { useBlockResize } from "@/hooks/useBlockResize";
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
  const roleColor = useWeekStore((state) =>
    block.roleId
      ? state.currentWeek?.roles.find((r) => r.id === block.roleId)?.color
      : undefined
  );

  // Line clamping based on block height
  const lineClamp = displayDuration >= 2 ? 2 : 1;

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

  // Compute background based on completion state
  const computeBackground = () => {
    if (block.completed) return 'var(--completed-bg)';
    if (roleColor) return getRoleColorStyleWithOpacity(roleColor, 0.12);
    return 'var(--bg-muted)';
  };

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      data-block
      className={cn(
        "absolute left-0 right-0 z-10 overflow-hidden",
        "group flex flex-col justify-start",
        "cursor-grab active:cursor-grabbing",
        isDragging && "opacity-90",
        isResizing && "z-20"
      )}
      style={{
        top: `${top}px`,
        height: `${height}px`,
        borderRadius: 'var(--radius-md)',
        boxShadow: isDragging ? 'var(--shadow-drag)' : 'var(--shadow-sm)',
        backgroundColor: computeBackground(),
        borderLeft: roleColor ? `3px solid ${getRoleColorStyle(roleColor)}` : undefined,
        padding: '4px 8px',
        opacity: block.completed && !isDragging ? 'var(--completed-opacity)' : undefined,
        ...(isResizing && {
          touchAction: "none",
          userSelect: "none",
        }),
      }}
      onMouseEnter={(e) => {
        if (!isDragging) {
          e.currentTarget.style.boxShadow = 'var(--shadow-md)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isDragging) {
          e.currentTarget.style.boxShadow = isDragging ? 'var(--shadow-drag)' : 'var(--shadow-sm)';
        }
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
          className="font-medium bg-transparent outline-none w-full pr-5"
          style={{
            fontSize: '12px',
            border: `1px solid var(--border-emphasis)`,
            borderRadius: 'var(--radius-sm)',
            padding: '1px 4px',
          }}
          placeholder="Block title..."
        />
      ) : (
        <div className="flex items-start gap-1 pr-5">
          <CompletionCheckbox
            completed={block.completed}
            onToggle={() => toggleTimeBlockCompleted(block.id)}
            size={12}
          />
          <span
            className="font-medium overflow-hidden"
            style={{
              fontSize: '12px',
              lineHeight: '1.4',
              display: '-webkit-box',
              WebkitLineClamp: lineClamp,
              WebkitBoxOrient: 'vertical',
              opacity: block.completed && !isDragging ? 1 : undefined,
            }}
          >
            {block.title}
          </span>
        </div>
      )}

      {/* Time label during resize */}
      {isResizing && previewDuration !== null && (
        <span
          className="mt-auto"
          style={{
            fontSize: '10px',
            color: 'var(--text-muted)',
          }}
        >
          {slotToTime(block.startSlot)} &ndash;{" "}
          {slotToTime(block.startSlot + previewDuration)}
        </span>
      )}

      {/* Delete button - visible on hover */}
      <button
        type="button"
        onClick={() => deleteTimeBlock(block.id)}
        className={cn(
          "absolute top-1 right-1 p-0.5",
          "opacity-0 group-hover:opacity-100 transition-opacity",
          "cursor-pointer"
        )}
        style={{
          borderRadius: 'var(--radius-sm)',
          color: 'var(--text-muted)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--destructive)';
          e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--text-muted)';
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
        aria-label="Delete time block"
      >
        <X size={12} />
      </button>

      {/* Resize handle at bottom edge - hover-revealed */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize",
          "opacity-0 group-hover:opacity-100 transition-opacity"
        )}
        style={{
          borderBottom: '2px solid var(--border-emphasis)',
        }}
        {...handleProps}
      />
    </div>
  );
}
