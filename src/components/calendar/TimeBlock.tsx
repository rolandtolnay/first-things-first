"use client";

import { useDraggable } from "@dnd-kit/core";
import type { TimeBlock as TimeBlockType, DayOfWeek } from "@/types";
import type { BlockDragData } from "@/types/dnd";
import { useWeekStore } from "@/stores/weekStore";
import { useBlockResize } from "@/hooks/useBlockResize";
import { BlockCard } from "@/components/ui/BlockCard";
import { cn } from "@/lib/utils";
import { slotToTime, slotToPixels, durationToPixels } from "@/lib/time-model";

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
  const height = durationToPixels(displayDuration);
  const top = slotToPixels(block.startSlot);

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
        "absolute left-1 right-1 z-10 group bg-card rounded-[6px]",
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
        freestyle={isFreestyle}
        height={height}
        autoEdit={isNewFreestyle}
        subtitle={`${slotToTime(block.startSlot)} \u2013 ${slotToTime(block.startSlot + displayDuration)}`}
        onToggle={() => toggleTimeBlockCompleted(block.id)}
        onDelete={isNewFreestyle ? handleAutoDelete : () => deleteTimeBlock(block.id)}
        onEdit={isFreestyle ? handleEdit : undefined}
        className="h-full"
      />

      {/* Resize handle at bottom edge — large hit area, small pill indicator */}
      <div
        className="absolute bottom-0 left-0 right-0 h-3 cursor-ns-resize flex items-end justify-center pb-0.5"
        {...handleProps}
      >
        <div
          className={cn(
            "w-6 h-[3px] rounded-full bg-foreground/40 transition-opacity",
            "opacity-0 group-hover:opacity-100"
          )}
        />
      </div>
    </div>
  );
}
