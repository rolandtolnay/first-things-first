"use client";

/**
 * PriorityItem Component
 *
 * Displays a priority item in the Day Priorities section:
 * - Role color left border (3px, consistent with GoalItem)
 * - Goal text (truncated with title tooltip)
 * - Delete button on hover to remove priority
 * - Draggable for cross-section drag-drop
 *
 * Compact styling (text-xs, py-0.5) for efficient space usage.
 */

import { useDraggable } from "@dnd-kit/core";
import { useWeekStore } from "@/stores/weekStore";
import { getRoleColorStyle } from "@/lib/role-colors";
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

  // Set up draggable
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

  const handleDelete = () => {
    removeDayPriority(priority.id);
  };

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        "group flex items-center gap-1.5 py-0.5 px-1.5 rounded hover:bg-secondary/50 transition-colors",
        "cursor-grab active:cursor-grabbing",
        isDragging && "opacity-50"
      )}
      style={{ borderLeft: `3px solid ${getRoleColorStyle(roleColor)}` }}
    >
      {/* Goal text - truncated with tooltip */}
      <span
        className="flex-1 min-w-0 text-xs text-foreground truncate"
        title={goal.text}
      >
        {goal.text}
      </span>

      {/* Delete button (visible on hover) */}
      <button
        type="button"
        onClick={handleDelete}
        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity p-0.5 rounded flex-shrink-0"
        aria-label={`Remove priority ${goal.text}`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}
