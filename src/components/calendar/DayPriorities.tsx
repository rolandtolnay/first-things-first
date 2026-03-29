"use client";

import { useMemo } from "react";
import { useDroppable, useDndContext } from "@dnd-kit/core";
import { useWeekStore } from "@/stores/weekStore";
import { cn } from "@/lib/utils";
import { PRIORITIES_SECTION_HEIGHT } from "@/lib/constants";
import { PriorityItem } from "./PriorityItem";
import type { DayOfWeek } from "@/types";
import type { DropZoneData } from "@/types/dnd";

interface DayPrioritiesProps {
  dayIndex: DayOfWeek;
}

export function DayPriorities({ dayIndex }: DayPrioritiesProps) {
  const dayPriorities = useWeekStore((state) => state.currentWeek?.dayPriorities);
  const goals = useWeekStore((state) => state.currentWeek?.goals);
  const roles = useWeekStore((state) => state.currentWeek?.roles);

  const priorities = useMemo(() => {
    if (!dayPriorities) return [];
    return dayPriorities
      .filter((p) => p.dayIndex === dayIndex)
      .sort((a, b) => a.order - b.order);
  }, [dayPriorities, dayIndex]);

  const goalsMap = useMemo(() => {
    if (!goals) return new Map();
    return new Map(goals.map((g) => [g.id, g]));
  }, [goals]);

  const rolesMap = useMemo(() => {
    if (!roles) return new Map();
    return new Map(roles.map((r) => [r.id, r]));
  }, [roles]);

  const dropData: DropZoneData = {
    zone: "priorities",
    dayIndex,
  };

  const { setNodeRef, isOver } = useDroppable({
    id: `priorities-${dayIndex}`,
    data: dropData,
  });

  // Show dashed border when dragging and empty
  const { active } = useDndContext();
  const isDragging = active !== null;
  const isEmpty = priorities.length === 0;
  const showDropHint = isEmpty && isDragging;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "p-2 bg-muted flex flex-col gap-2",
        showDropHint && "border border-dashed border-primary bg-primary-soft",
        isOver && "bg-primary-soft"
      )}
      style={{
        height: `${PRIORITIES_SECTION_HEIGHT}px`,
        borderBottom: '1px solid var(--border-emphasis)',
        ...(isOver && !showDropHint && {
          outline: '1px dashed var(--primary)',
          outlineOffset: '-1px',
        }),
      }}
      data-day={dayIndex}
      data-section="priorities"
    >
      {priorities.map((priority) => {
        const goal = goalsMap.get(priority.goalId);
        if (!goal) return null;

        const role = rolesMap.get(goal.roleId);
        if (!role) return null;

        return (
          <PriorityItem
            key={priority.id}
            priority={priority}
            goal={goal}
            roleColor={role.color}
            dayIndex={dayIndex}
          />
        );
      })}
    </div>
  );
}
