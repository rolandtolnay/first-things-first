"use client";

import { useMemo, useState } from "react";
import { useDroppable, useDndContext } from "@dnd-kit/core";
import { Plus } from "lucide-react";
import { useWeekStore } from "@/stores/weekStore";
import { cn } from "@/lib/utils";
import { MAX_PRIORITIES_PER_DAY, PRIORITIES_SECTION_HEIGHT } from "@/lib/constants";
import { priorityRoleId, priorityText } from "@/lib/priorities";
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
  const addFreestylePriority = useWeekStore((state) => state.addFreestylePriority);

  // Newly created freestyle priority awaiting its first title (inline edit).
  const [newPriorityId, setNewPriorityId] = useState<string | null>(null);

  const priorities = useMemo(() => {
    if (!dayPriorities) return [];
    return dayPriorities
      .filter((p) => p.dayIndex === dayIndex)
      .sort((a, b) => a.order - b.order);
  }, [dayPriorities, dayIndex]);

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

  // Show dashed border only for calendar-routable drags.
  const { active } = useDndContext();
  const isCalendarDragging = isCalendarDragData(active?.data.current);
  const isEmpty = priorities.length === 0;
  const showDropHint = isEmpty && isCalendarDragging;
  const showDropOver = isOver && isCalendarDragging;
  const priorityCardHeight =
    (PRIORITIES_SECTION_HEIGHT - PRIORITIES_Y_PADDING - PRIORITIES_GAP * (MAX_PRIORITIES_PER_DAY - 1)) /
    MAX_PRIORITIES_PER_DAY;

  const canAdd = priorities.length < MAX_PRIORITIES_PER_DAY && !isCalendarDragging;

  async function handleAddFreestyle() {
    const priority = await addFreestylePriority(dayIndex);
    if (priority) setNewPriorityId(priority.id);
  }

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "group/priorities px-1.5 py-1.5 flex flex-col gap-1",
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
        const resolvedRoleId = priorityRoleId(priority, goals ?? []);
        const role = resolvedRoleId ? rolesMap.get(resolvedRoleId) : undefined;
        const text = priorityText(priority, goals ?? []);

        // A goal-linked priority whose Goal or Role vanished has nothing to show.
        if (priority.type === "goal" && (!text || !role)) return null;

        return (
          <PriorityItem
            key={priority.id}
            priority={priority}
            text={text}
            roleId={resolvedRoleId}
            roleColor={role?.color}
            dayIndex={dayIndex}
            height={priorityCardHeight}
            autoEditPriorityId={newPriorityId}
            onClearAutoEdit={() => setNewPriorityId(null)}
          />
        );
      })}

      {/* Hover-revealed create affordance for freestyle priorities */}
      {canAdd && (
        <button
          type="button"
          onClick={handleAddFreestyle}
          className={cn(
            "flex items-center justify-center gap-1 rounded-[var(--ds-r-sm)] border border-dashed border-transparent",
            "text-[11px] text-muted-foreground opacity-0 transition-[opacity,border-color,background-color]",
            "group-hover/priorities:opacity-100 hover:border-[var(--ds-line)] hover:bg-[var(--ds-hover-tint)]",
            "focus-visible:opacity-100 focus-visible:outline-none focus-visible:border-[var(--ds-line)]"
          )}
          style={{ height: `${priorityCardHeight}px` }}
          aria-label="Add a priority"
        >
          <Plus className="size-3" strokeWidth={1.6} />
          <span>Add priority</span>
        </button>
      )}
    </div>
  );
}
