"use client";

import { useDraggable } from "@dnd-kit/core";
import { useWeekStore } from "@/stores/weekStore";
import { BlockCard } from "@/components/ui/BlockCard";
import { cn } from "@/lib/utils";
import { getRoleColorStyle } from "@/lib/role-colors";
import type { DayPriority, DayOfWeek, Goal, RoleColor } from "@/types";
import type { PriorityDragData } from "@/types/dnd";

interface PriorityItemProps {
  priority: DayPriority;
  goal: Goal;
  roleColor: RoleColor;
  dayIndex: DayOfWeek;
  height: number;
}

export function PriorityItem({ priority, goal, roleColor, dayIndex, height }: PriorityItemProps) {
  const removeDayPriority = useWeekStore((state) => state.removeDayPriority);
  const toggleDayPriorityCompleted = useWeekStore((state) => state.toggleDayPriorityCompleted);
  const dragData = {
    type: "priority",
    priorityId: priority.id,
    goalId: goal.id,
    roleId: goal.roleId,
    text: goal.text,
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
  }

  const leadingCompletion = (
    <button
      type="button"
      className={cn(
        "mt-[5px] size-2 shrink-0 rounded-full transition-[box-shadow,opacity]",
        priority.completed && "opacity-80"
      )}
      style={{ backgroundColor: getRoleColorStyle(roleColor) }}
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
        text={goal.text}
        roleColor={roleColor}
        completed={priority.completed}
        compact={true}
        height={height}
        leading={leadingCompletion}
        hideCompletedIndicator={true}
        menuLabel="Open priority menu"
        className="h-full gap-[12px] rounded-[var(--ds-r-sm)] px-1.5 py-1 text-[12px]"
        onToggle={handleToggleCompleted}
        onDelete={handleDelete}
      />
    </div>
  );
}
