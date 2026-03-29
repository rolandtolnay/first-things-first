"use client";

import { useDraggable } from "@dnd-kit/core";
import type { TimeBlock as TimeBlockType, DayOfWeek } from "@/types";
import type { BlockDragData } from "@/types/dnd";
import { useWeekStore } from "@/stores/weekStore";
import { useBlockResize } from "@/hooks/useBlockResize";
import { BlockCard } from "@/components/ui/BlockCard";
import { cn, slotToTime } from "@/lib/utils";
import { SLOT_HEIGHT } from "@/lib/constants";

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

  const isNewFreestyle = editingBlockId === block.id && block.title === "";
  const isFreestyle = !block.goalId;

  const { handleProps, isResizing, previewDuration } = useBlockResize(block, dayBlocks);

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `block-${block.id}`,
    data: {
      type: "block",
      blockId: block.id,
      sourceDay: block.dayIndex as DayOfWeek,
    } satisfies BlockDragData,
  });

  const displayDuration = isResizing && previewDuration !== null
    ? previewDuration
    : block.duration;
  const height = displayDuration * SLOT_HEIGHT;
  const top = block.startSlot * SLOT_HEIGHT;

  const roleColor = useWeekStore((state) =>
    block.roleId
      ? state.currentWeek?.roles.find((r) => r.id === block.roleId)?.color
      : undefined
  );

  function handleEdit(newText: string) {
    updateTimeBlock(block.id, { title: newText });
    onClearEditing?.();
  }

  function handleAutoDelete() {
    deleteTimeBlock(block.id);
    onClearEditing?.();
  }

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      data-block
      className={cn(
        "absolute left-0 right-0 z-10 group bg-card rounded-md",
        "cursor-grab active:cursor-grabbing",
        isDragging && "opacity-90",
        isResizing && "z-20"
      )}
      style={{
        top: `${top}px`,
        height: `${height}px`,
        ...(isResizing && { touchAction: "none", userSelect: "none" }),
      }}
    >
      <BlockCard
        text={block.title}
        roleColor={roleColor}
        completed={block.completed}
        compact
        editable={isFreestyle}
        height={height}
        autoEdit={isNewFreestyle}
        onToggle={() => toggleTimeBlockCompleted(block.id)}
        onDelete={isNewFreestyle ? handleAutoDelete : () => deleteTimeBlock(block.id)}
        onEdit={isFreestyle ? handleEdit : undefined}
        className="h-full"
      />

      {/* Time label during resize */}
      {isResizing && previewDuration !== null && (
        <span className="absolute bottom-1 left-2 text-[10px] text-muted-foreground">
          {slotToTime(block.startSlot)} &ndash; {slotToTime(block.startSlot + previewDuration)}
        </span>
      )}

      {/* Resize handle at bottom edge */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize",
          "opacity-0 group-hover:opacity-100 transition-opacity"
        )}
        style={{ borderBottom: '2px solid var(--border-emphasis)' }}
        {...handleProps}
      />
    </div>
  );
}
