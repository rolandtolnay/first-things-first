"use client";

import { useDroppable, useDraggable, useDndContext } from "@dnd-kit/core";
import type { DayOfWeek, EveningBlock, RoleColor } from "@/types";
import { isCalendarDragData, type DropZoneData, type EveningDragData } from "@/types/dnd";
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
  const isCalendarDragging = isCalendarDragData(active?.data.current);
  const isEmpty = !eveningBlock;
  const showDropHint = isEmpty && isCalendarDragging;
  const showDropOver = isOver && isCalendarDragging;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "px-2 py-2.5 flex flex-col",
        showDropHint && "border border-dashed border-primary bg-primary-soft",
        showDropOver && "bg-primary-soft"
      )}
      style={{
        height: `${EVENING_SECTION_HEIGHT}px`,
        borderTop: '1px solid var(--ds-line)',
        background: (showDropOver || showDropHint) ? undefined : 'var(--ds-sunk-tint)',
        ...(showDropOver && !showDropHint && {
          outline: '1px dashed var(--ds-accent)',
          outlineOffset: '-1px',
        }),
      }}
      data-day={dayIndex}
      data-section="evening"
    >
      <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-secondary-foreground mb-1.5">
        Evening
      </span>
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
        freestyle={eveningBlock.type === "freestyle"}
        unassigned={!eveningBlock.roleId}
        height={56}
        onToggle={() => toggleEveningBlockCompleted(eveningBlock.id)}
        onDelete={onDelete}
      />
    </div>
  );
}
