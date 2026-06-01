"use client";

import { useMemo } from "react";
import { useDroppable, useDndContext } from "@dnd-kit/core";
import { useWeekStore } from "@/stores/weekStore";
import { cn } from "@/lib/utils";
import { MAX_PRIORITIES_PER_DAY, PRIORITIES_SECTION_HEIGHT } from "@/lib/constants";
import { PriorityItem } from "./PriorityItem";
import type { DayOfWeek } from "@/types";
import { isCalendarDragData, type DropZoneData } from "@/types/dnd";

interface DayPrioritiesProps {
  dayIndex: DayOfWeek;
}

const PRIORITIES_Y_PADDING = 12;
const PRIORITIES_GAP = 4;

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

  // Show dashed border only for calendar-routable drags, not Sidebar Role sorting.
  const { active } = useDndContext();
  const isCalendarDragging = isCalendarDragData(active?.data.current);
  const isEmpty = priorities.length === 0;
  const showDropHint = isEmpty && isCalendarDragging;
  const showDropOver = isOver && isCalendarDragging;
  const priorityCardHeight =
    (PRIORITIES_SECTION_HEIGHT - PRIORITIES_Y_PADDING - PRIORITIES_GAP * (MAX_PRIORITIES_PER_DAY - 1)) /
    MAX_PRIORITIES_PER_DAY;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "px-1.5 py-1.5 flex flex-col gap-1",
        showDropHint && "border border-dashed border-primary bg-primary-soft",
        showDropOver && "bg-primary-soft"
      )}
      style={{
        height: `${PRIORITIES_SECTION_HEIGHT}px`,
        borderBottom: '1px solid var(--ds-line)',
        ...(showDropOver && !showDropHint && {
          outline: '1px dashed var(--ds-accent)',
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
            height={priorityCardHeight}
          />
        );
      })}
    </div>
  );
}
