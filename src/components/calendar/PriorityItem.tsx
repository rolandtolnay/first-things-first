"use client";

import { useDraggable } from "@dnd-kit/core";
import { useWeekStore } from "@/stores/weekStore";
import { BlockCard } from "@/components/ui/BlockCard";
import { cn } from "@/lib/utils";
import type { DayPriority, DayOfWeek, Goal, RoleColor } from "@/types";
import type { PriorityDragData } from "@/types/dnd";

interface PriorityItemProps {
  priority: DayPriority;
  goal: Goal;
  roleColor: RoleColor;
  dayIndex: DayOfWeek;
}

export function PriorityItem({ priority, goal, roleColor, dayIndex }: PriorityItemProps) {
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

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        "cursor-grab active:cursor-grabbing",
        isDragging && "opacity-50"
      )}
    >
      <BlockCard
        text={goal.text}
        roleColor={roleColor}
        completed={priority.completed}
        compact
        height={56}
        onToggle={() => toggleDayPriorityCompleted(priority.id)}
        onDelete={() => removeDayPriority(priority.id)}
      />
    </div>
  );
}
