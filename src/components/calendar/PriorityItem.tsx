"use client";

/**
 * PriorityItem Component
 *
 * Displays a priority item in the Day Priorities section:
 * - Role color left border (3px) + tinted background
 * - Goal text (truncated with title tooltip)
 * - Completion checkbox
 * - Delete button on hover
 * - Draggable for cross-section drag-drop
 */

import { useDraggable } from "@dnd-kit/core";
import { X } from "lucide-react";
import { useWeekStore } from "@/stores/weekStore";
import { getRoleColorStyle, getRoleColorStyleWithOpacity } from "@/lib/role-colors";
import { CompletionCheckbox } from "@/components/ui/CompletionCheckbox";
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

  // Compute background based on completion state
  const backgroundColor = priority.completed
    ? 'var(--completed-bg)'
    : getRoleColorStyleWithOpacity(roleColor, 0.08);

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        "group flex items-center gap-1.5 transition-colors",
        "cursor-grab active:cursor-grabbing",
        isDragging && "opacity-50"
      )}
      style={{
        borderLeft: `3px solid ${getRoleColorStyle(roleColor)}`,
        backgroundColor,
        borderRadius: 'var(--radius-md)',
        padding: '8px',
        opacity: priority.completed && !isDragging ? 'var(--completed-opacity)' : undefined,
      }}
      onMouseEnter={(e) => {
        if (!priority.completed) {
          e.currentTarget.style.backgroundColor = getRoleColorStyleWithOpacity(roleColor, 0.12);
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = backgroundColor;
      }}
    >
      {/* Completion checkbox */}
      <CompletionCheckbox
        completed={priority.completed}
        onToggle={() => toggleDayPriorityCompleted(priority.id)}
        size={12}
      />

      {/* Goal text - truncated with tooltip */}
      <span
        className="flex-1 min-w-0 truncate"
        style={{
          fontSize: '12px',
          color: 'var(--text-secondary)',
        }}
        title={goal.text}
      >
        {goal.text}
      </span>

      {/* Delete button (visible on hover) */}
      <button
        type="button"
        onClick={handleDelete}
        className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded flex-shrink-0 cursor-pointer"
        style={{ color: 'var(--text-muted)' }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--destructive)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--text-muted)';
        }}
        aria-label={`Remove priority ${goal.text}`}
      >
        <X size={10} />
      </button>
    </div>
  );
}
