"use client";

import { useDroppable, useDraggable, useDndContext } from "@dnd-kit/core";
import type { DayOfWeek, EveningBlock, RoleColor } from "@/types";
import type { DropZoneData, EveningDragData } from "@/types/dnd";
import { useWeekStore, selectEveningBlock } from "@/stores/weekStore";
import { BlockCard } from "@/components/ui/BlockCard";
import { cn } from "@/lib/utils";
import { EVENING_SECTION_HEIGHT } from "@/lib/constants";

interface EveningSlotProps {
  dayIndex: DayOfWeek;
}

export function EveningSlot({ dayIndex }: EveningSlotProps) {
  const deleteEveningBlock = useWeekStore((state) => state.deleteEveningBlock);
  const eveningBlock = useWeekStore((state) => selectEveningBlock(state, dayIndex));

  const dropData: DropZoneData = {
    zone: "evening",
    dayIndex,
  };

  const { setNodeRef, isOver } = useDroppable({
    id: `evening-${dayIndex}`,
    data: dropData,
  });

  const roleColor = useWeekStore((state) =>
    eveningBlock?.roleId
      ? state.currentWeek?.roles.find((r) => r.id === eveningBlock.roleId)?.color
      : undefined
  );

  const { active } = useDndContext();
  const isDragging = active !== null;
  const isEmpty = !eveningBlock;
  const showDropHint = isEmpty && isDragging;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "p-2 bg-muted",
        showDropHint && "border border-dashed border-primary bg-primary-soft",
        isOver && "bg-primary-soft"
      )}
      style={{
        height: `${EVENING_SECTION_HEIGHT}px`,
        borderTop: '1px solid var(--border-emphasis)',
        ...(isOver && !showDropHint && {
          outline: '1px dashed var(--primary)',
          outlineOffset: '-1px',
        }),
      }}
      data-day={dayIndex}
      data-section="evening"
    >
      {eveningBlock && (
        <DraggableEveningBlock
          eveningBlock={eveningBlock}
          roleColor={roleColor}
          dayIndex={dayIndex}
          onDelete={() => deleteEveningBlock(eveningBlock.id)}
        />
      )}
    </div>
  );
}

interface DraggableEveningBlockProps {
  eveningBlock: EveningBlock;
  roleColor: RoleColor | undefined;
  dayIndex: DayOfWeek;
  onDelete: () => void;
}

function DraggableEveningBlock({
  eveningBlock,
  roleColor,
  dayIndex,
  onDelete,
}: DraggableEveningBlockProps) {
  const toggleEveningBlockCompleted = useWeekStore((state) => state.toggleEveningBlockCompleted);

  const dragData = {
    type: "evening",
    eveningBlockId: eveningBlock.id,
    goalId: eveningBlock.goalId,
    roleId: eveningBlock.roleId,
    title: eveningBlock.title,
    sourceDayIndex: dayIndex,
  } satisfies EveningDragData;

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `evening-block-${eveningBlock.id}`,
    data: dragData,
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        "cursor-grab active:cursor-grabbing",
        isDragging && "opacity-90"
      )}
    >
      <BlockCard
        text={eveningBlock.title}
        roleColor={roleColor}
        completed={eveningBlock.completed}
        compact
        height={56}
        onToggle={() => toggleEveningBlockCompleted(eveningBlock.id)}
        onDelete={onDelete}
      />
    </div>
  );
}
