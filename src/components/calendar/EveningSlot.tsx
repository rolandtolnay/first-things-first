"use client";

/**
 * EveningSlot - Evening slot section below time grid
 *
 * Appears at the bottom of each day column for evening activities
 * (after 8:00 PM). Each day can hold one goal or freestyle block.
 * Drop target for goals - dropping creates an evening block.
 * Evening blocks are draggable for cross-section movement.
 */

import { useDroppable, useDraggable } from "@dnd-kit/core";
import { X } from "lucide-react";
import type { DayOfWeek, EveningBlock, RoleColor } from "@/types";
import type { DropZoneData, EveningDragData } from "@/types/dnd";
import { useWeekStore, selectEveningBlock } from "@/stores/weekStore";
import { getRoleColorStyle, getRoleColorStyleWithOpacity } from "@/lib/role-colors";
import { CompletionCheckbox } from "@/components/ui/CompletionCheckbox";
import { cn } from "@/lib/utils";

interface EveningSlotProps {
  dayIndex: DayOfWeek;
}

export function EveningSlot({ dayIndex }: EveningSlotProps) {
  const deleteEveningBlock = useWeekStore((state) => state.deleteEveningBlock);

  // Get evening block for this day
  const eveningBlock = useWeekStore((state) => selectEveningBlock(state, dayIndex));

  // Make this slot a drop target
  const dropData: DropZoneData = {
    zone: "evening",
    dayIndex,
  };

  const { setNodeRef, isOver } = useDroppable({
    id: `evening-${dayIndex}`,
    data: dropData,
  });

  // Get role color for styling (if block has a role)
  const roleColor = useWeekStore((state) =>
    eveningBlock?.roleId
      ? state.currentWeek?.roles.find((r) => r.id === eveningBlock.roleId)?.color
      : undefined
  );

  const handleDelete = () => {
    if (eveningBlock) {
      deleteEveningBlock(eveningBlock.id);
    }
  };

  return (
    <div
      ref={setNodeRef}
      className="min-h-[48px] p-2"
      style={{
        borderTop: '1px solid var(--border-subtle)',
        backgroundColor: isOver ? 'var(--primary-soft)' : 'var(--bg-muted)',
        borderBottomLeftRadius: 'var(--radius-lg)',
        borderBottomRightRadius: 'var(--radius-lg)',
        ...(isOver && {
          outline: '1px dashed var(--primary)',
          outlineOffset: '-1px',
        }),
      }}
      data-day={dayIndex}
      data-section="evening"
    >
      {!eveningBlock ? (
        <div className="h-full flex items-center justify-center">
          <span
            className="italic"
            style={{
              fontSize: '12px',
              color: 'var(--text-muted)',
            }}
          >
            Evening
          </span>
        </div>
      ) : (
        <DraggableEveningBlock
          eveningBlock={eveningBlock}
          roleColor={roleColor}
          dayIndex={dayIndex}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}

/**
 * Inner draggable component for evening blocks.
 * Separated to keep droppable on outer container and draggable on inner block.
 */
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

  // Set up draggable
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

  // Compute background based on completion state
  const background = eveningBlock.completed
    ? 'var(--completed-bg)'
    : roleColor
      ? getRoleColorStyleWithOpacity(roleColor, 0.12)
      : 'var(--bg-muted)';

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        "group relative p-2",
        "cursor-grab active:cursor-grabbing",
        isDragging && "opacity-90"
      )}
      style={{
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-sm)',
        backgroundColor: background,
        borderLeft: roleColor ? `3px solid ${getRoleColorStyle(roleColor)}` : undefined,
        opacity: eveningBlock.completed && !isDragging ? 'var(--completed-opacity)' : undefined,
      }}
    >
      {/* Title with completion checkbox */}
      <div className="flex items-center gap-1 pr-5">
        <CompletionCheckbox
          completed={eveningBlock.completed}
          onToggle={() => toggleEveningBlockCompleted(eveningBlock.id)}
          size={12}
        />
        <span
          className="font-medium truncate"
          style={{
            fontSize: '12px',
          }}
        >
          {eveningBlock.title}
        </span>
      </div>

      {/* Delete button - visible on hover */}
      <button
        type="button"
        onClick={onDelete}
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
        aria-label="Delete evening block"
      >
        <X size={12} />
      </button>
    </div>
  );
}
