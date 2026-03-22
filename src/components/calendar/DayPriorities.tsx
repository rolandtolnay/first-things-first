"use client";

/**
 * DayPriorities - Day priorities drop zone section
 *
 * Appears at the top of each day column for prioritized goals.
 * Goals in this section are not time-bound but represent what
 * the user wants to accomplish that day.
 *
 * Features:
 * - Drop zone for goals dragged from sidebar
 * - Visual feedback when dragging over (highlight)
 * - Renders priority items with goal text and role color
 */

import { useMemo } from "react";
import { useDroppable } from "@dnd-kit/core";
import { useWeekStore } from "@/stores/weekStore";
import { PriorityItem } from "./PriorityItem";
import type { DayOfWeek } from "@/types";
import type { DropZoneData } from "@/types/dnd";

interface DayPrioritiesProps {
  dayIndex: DayOfWeek;
}

export function DayPriorities({ dayIndex }: DayPrioritiesProps) {
  // Get raw data from store (stable references)
  const dayPriorities = useWeekStore((state) => state.currentWeek?.dayPriorities);
  const goals = useWeekStore((state) => state.currentWeek?.goals);
  const roles = useWeekStore((state) => state.currentWeek?.roles);

  // Filter and sort priorities in useMemo (avoids infinite loop)
  const priorities = useMemo(() => {
    if (!dayPriorities) return [];
    return dayPriorities
      .filter((p) => p.dayIndex === dayIndex)
      .sort((a, b) => a.order - b.order);
  }, [dayPriorities, dayIndex]);

  // Create lookup maps for efficient rendering (memoized for hydration safety)
  const goalsMap = useMemo(() => {
    if (!goals) return new Map();
    return new Map(goals.map((g) => [g.id, g]));
  }, [goals]);

  const rolesMap = useMemo(() => {
    if (!roles) return new Map();
    return new Map(roles.map((r) => [r.id, r]));
  }, [roles]);

  // Make this a drop zone
  const dropData: DropZoneData = {
    zone: "priorities",
    dayIndex,
  };

  const { setNodeRef, isOver } = useDroppable({
    id: `priorities-${dayIndex}`,
    data: dropData,
  });

  return (
    <div
      ref={setNodeRef}
      className="min-h-[80px] p-2 transition-colors"
      style={{
        borderBottom: '1px solid var(--border-subtle)',
        backgroundColor: isOver ? 'var(--primary-soft)' : 'var(--bg-muted)',
        borderTopLeftRadius: 'var(--radius-lg)',
        borderTopRightRadius: 'var(--radius-lg)',
        ...(isOver && {
          outline: '1px dashed var(--primary)',
          outlineOffset: '-1px',
        }),
      }}
      data-day={dayIndex}
      data-section="priorities"
    >
      {priorities.length === 0 ? (
        <div className="h-full flex items-center justify-center min-h-[64px]">
          <span
            className="italic"
            style={{
              fontSize: '12px',
              color: 'var(--text-muted)',
            }}
          >
            Drop goals here
          </span>
        </div>
      ) : (
        <div className="space-y-2">
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
      )}
    </div>
  );
}
