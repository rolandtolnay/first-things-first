"use client";

import { useDraggable } from "@dnd-kit/core";
import { useWeekStore } from "@/stores/weekStore";
import { BlockCard } from "@/components/ui/BlockCard";
import { AssignRoleMenuItems } from "./BlockMenuExtras";
import { cn } from "@/lib/utils";
import { getRoleColorStyle } from "@/lib/role-colors";
import type { DayPriority, DayOfWeek, RoleColor } from "@/types";
import type { PriorityDragData } from "@/types/dnd";

interface PriorityItemProps {
  priority: DayPriority;
  /** Display text (linked Goal's text, or the freestyle priority's own). */
  text: string;
  /** Resolved Role identity (linked Goal's Role, or the freestyle assignment). */
  roleId?: string;
  /** Resolved Role color; undefined for unassigned freestyle priorities. */
  roleColor?: RoleColor;
  dayIndex: DayOfWeek;
  height: number;
  /** Newly created freestyle priority id awaiting its first title. */
  autoEditPriorityId?: string | null;
  onClearAutoEdit?: () => void;
}

export function PriorityItem({
  priority,
  text,
  roleId,
  roleColor,
  dayIndex,
  height,
  autoEditPriorityId,
  onClearAutoEdit,
}: PriorityItemProps) {
  const removeDayPriority = useWeekStore((state) => state.removeDayPriority);
  const updateDayPriority = useWeekStore((state) => state.updateDayPriority);
  const toggleDayPriorityCompleted = useWeekStore((state) => state.toggleDayPriorityCompleted);

  const isFreestyle = priority.type === "freestyle";
  const isNewFreestyle =
    isFreestyle && autoEditPriorityId === priority.id && (priority.text ?? "") === "";

  const dragData = {
    type: "priority",
    priorityId: priority.id,
    goalId: priority.goalId,
    roleId,
    text,
    sourceDayIndex: dayIndex,
  } satisfies PriorityDragData;

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `priority-${priority.id}`,
    data: dragData,
  });

  function handleToggleCompleted() {
    toggleDayPriorityCompleted(priority.id);
  }

  function handleDelete() {
    removeDayPriority(priority.id);
    onClearAutoEdit?.();
  }

  function handleEdit(newText: string) {
    updateDayPriority(priority.id, { text: newText });
    onClearAutoEdit?.();
  }

  const leadingCompletion = (
    <button
      type="button"
      className={cn(
        "mt-[5px] size-2 shrink-0 rounded-full transition-[box-shadow,opacity]",
        priority.completed && "opacity-80",
        !roleColor && "border border-dashed border-[var(--ds-fg-faint)]"
      )}
      style={roleColor ? { backgroundColor: getRoleColorStyle(roleColor) } : undefined}
      onPointerDown={(event) => event.stopPropagation()}
      onClick={(event) => {
        event.stopPropagation();
        handleToggleCompleted();
      }}
      aria-label={priority.completed ? "Mark priority incomplete" : "Mark priority complete"}
    />
  );

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        "cursor-grab active:cursor-grabbing",
        isDragging && "opacity-50"
      )}
      style={{ height: `${height}px` }}
    >
      <BlockCard
        text={text}
        roleColor={roleColor}
        completed={priority.completed}
        compact={true}
        height={height}
        roleBorder="uniform"
        freestyle={isFreestyle}
        editable={isFreestyle}
        autoEdit={isNewFreestyle}
        leading={leadingCompletion}
        hideCompletedIndicator={true}
        editPlaceholder="Priority title..."
        menuLabel="Open priority menu"
        menuExtras={
          isFreestyle ? (
            <AssignRoleMenuItems
              currentRoleId={priority.roleId}
              onAssign={(roleId) => updateDayPriority(priority.id, { roleId })}
            />
          ) : undefined
        }
        className="h-full gap-[12px] rounded-[var(--ds-r-sm)] px-1.5 py-1 text-[12px]"
        onToggle={handleToggleCompleted}
        onDelete={handleDelete}
        onEdit={isFreestyle ? handleEdit : undefined}
      />
    </div>
  );
}
