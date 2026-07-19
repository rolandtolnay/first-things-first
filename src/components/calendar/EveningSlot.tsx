"use client";

import { useState } from "react";
import { useDroppable, useDraggable, useDndContext } from "@dnd-kit/core";
import { Plus, Repeat } from "lucide-react";
import type { DayOfWeek, EveningBlock, RoleColor } from "@/types";
import { isCalendarDragData, type DropZoneData, type EveningDragData } from "@/types/dnd";
import { useWeekStore, selectEveningBlock } from "@/stores/weekStore";
import { BlockCard } from "@/components/ui/BlockCard";
import { AssignRoleMenuItems, RepeatMenuItem } from "./BlockMenuExtras";
import { cn } from "@/lib/utils";
import { EVENING_SECTION_HEIGHT } from "@/lib/constants";

interface EveningSlotProps {
  dayIndex: DayOfWeek;
}

export function EveningSlot({ dayIndex }: EveningSlotProps) {
  const deleteEveningBlock = useWeekStore((state) => state.deleteEveningBlock);
  const addEveningBlock = useWeekStore((state) => state.addEveningBlock);
  const eveningBlock = useWeekStore((state) => selectEveningBlock(state, dayIndex));

  // Newly created freestyle evening block awaiting its first title.
  const [newEveningId, setNewEveningId] = useState<string | null>(null);

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

  async function handleAddFreestyle() {
    if (eveningBlock) return;
    try {
      const block = await addEveningBlock({
        type: "freestyle",
        dayIndex,
        title: "",
        completed: false,
      });
      setNewEveningId(block.id);
    } catch {
      // Raced with another create for this day; the existing block wins.
    }
  }

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "group/evening px-2 py-2.5 flex flex-col",
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
      {eveningBlock ? (
        <DraggableEveningBlock
          eveningBlock={eveningBlock}
          roleColor={roleColor}
          dayIndex={dayIndex}
          autoEditBlockId={newEveningId}
          onClearAutoEdit={() => setNewEveningId(null)}
          onDelete={() => {
            deleteEveningBlock(eveningBlock.id);
            setNewEveningId(null);
          }}
        />
      ) : (
        !isCalendarDragging && (
          <button
            type="button"
            onClick={handleAddFreestyle}
            className={cn(
              "flex flex-1 items-center justify-center gap-1 rounded-[var(--ds-r-sm)] border border-dashed border-transparent",
              "text-[11px] text-muted-foreground opacity-0 transition-[opacity,border-color,background-color]",
              "group-hover/evening:opacity-100 hover:border-[var(--ds-line)] hover:bg-[var(--ds-hover-tint)]",
              "focus-visible:opacity-100 focus-visible:outline-none focus-visible:border-[var(--ds-line)]"
            )}
            aria-label="Add an evening event"
          >
            <Plus className="size-3" strokeWidth={1.6} />
            <span>Add evening</span>
          </button>
        )
      )}
    </div>
  );
}

interface DraggableEveningBlockProps {
  eveningBlock: EveningBlock;
  roleColor: RoleColor | undefined;
  dayIndex: DayOfWeek;
  autoEditBlockId: string | null;
  onClearAutoEdit: () => void;
  onDelete: () => void;
}

function DraggableEveningBlock({
  eveningBlock,
  roleColor,
  dayIndex,
  autoEditBlockId,
  onClearAutoEdit,
  onDelete,
}: DraggableEveningBlockProps) {
  const toggleEveningBlockCompleted = useWeekStore((state) => state.toggleEveningBlockCompleted);
  const updateEveningBlock = useWeekStore((state) => state.updateEveningBlock);

  const isFreestyle = eveningBlock.type === "freestyle";
  const isNewFreestyle =
    isFreestyle && autoEditBlockId === eveningBlock.id && eveningBlock.title === "";
  const isRecurring = eveningBlock.recurrence === "weekly";

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

  function handleEdit(newText: string) {
    updateEveningBlock(eveningBlock.id, { title: newText });
    onClearAutoEdit();
  }

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
        freestyle={isFreestyle}
        unassigned={!eveningBlock.roleId}
        editable={isFreestyle}
        autoEdit={isNewFreestyle}
        editPlaceholder="Evening event..."
        height={56}
        metaItems={
          isRecurring
            ? [
                <span key="repeat" className="flex items-center gap-1">
                  <Repeat className="size-2.5" strokeWidth={1.8} aria-hidden={true} />
                  Weekly
                </span>,
              ]
            : undefined
        }
        menuExtras={
          isFreestyle ? (
            <>
              <AssignRoleMenuItems
                currentRoleId={eveningBlock.roleId}
                onAssign={(roleId) => updateEveningBlock(eveningBlock.id, { roleId })}
              />
              <RepeatMenuItem
                recurring={isRecurring}
                onToggle={() =>
                  updateEveningBlock(eveningBlock.id, {
                    recurrence: isRecurring ? undefined : "weekly",
                  })
                }
              />
            </>
          ) : undefined
        }
        onToggle={() => toggleEveningBlockCompleted(eveningBlock.id)}
        onDelete={onDelete}
        onEdit={isFreestyle ? handleEdit : undefined}
      />
    </div>
  );
}
