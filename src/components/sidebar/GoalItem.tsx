"use client";

/**
 * GoalItem Component
 *
 * Displays a single goal with:
 * - Role color accent (left border)
 * - Goal text (editable on double-click)
 * - Notes indicator icon (if goal has notes)
 * - Delete button (appears on hover)
 * - Drag capability for dropping onto Day Priorities
 */

import { useCallback } from "react";
import { useDraggable } from "@dnd-kit/core";
import { useWeekStore } from "@/stores/weekStore";
import { getRoleColorStyle } from "@/lib/role-colors";
import { useEditableText } from "@/hooks/useEditableText";
import { CloseIcon } from "@/components/ui/CloseIcon";
import { CompletionCheckbox } from "@/components/ui/CompletionCheckbox";
import type { Goal, RoleColor } from "@/types";
import type { GoalDragData } from "@/types/dnd";

interface GoalItemProps {
  goal: Goal;
  roleColor: RoleColor;
}

export function GoalItem({ goal, roleColor }: GoalItemProps) {
  const updateGoal = useWeekStore((state) => state.updateGoal);
  const deleteGoal = useWeekStore((state) => state.deleteGoal);
  const toggleGoalCompleted = useWeekStore((state) => state.toggleGoalCompleted);

  const handleSaveGoal = useCallback(
    (value: string) => updateGoal(goal.id, { text: value }),
    [updateGoal, goal.id]
  );

  const { isEditing, editValue, setEditValue, inputRef, startEdit, save, handleKeyDown } =
    useEditableText(goal.text, handleSaveGoal);

  // Make goal draggable for dropping onto Day Priorities
  const dragData: GoalDragData = {
    type: "goal",
    goalId: goal.id,
    roleId: goal.roleId,
    text: goal.text,
  };

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `goal-${goal.id}`,
    data: dragData,
    disabled: isEditing,
  });

  const handleDelete = () => {
    if (window.confirm(`Delete goal "${goal.text}"?`)) {
      deleteGoal(goal.id);
    }
  };

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`group flex items-center gap-2 py-1 px-2 rounded-md hover:bg-secondary/50 transition-colors cursor-grab active:cursor-grabbing ${
        isDragging ? "opacity-50" : ""
      }`}
      style={{
        borderLeft: `3px solid ${getRoleColorStyle(roleColor)}`,
        ...(goal.completed && {
          backgroundColor: "hsl(var(--success) / 0.15)",
        }),
      }}
    >
      {/* Completion checkbox */}
      {!isEditing && (
        <CompletionCheckbox
          completed={goal.completed}
          onToggle={() => toggleGoalCompleted(goal.id)}
        />
      )}

      {/* Goal text display or edit input */}
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={save}
          onKeyDown={handleKeyDown}
          className="flex-1 min-w-0 text-sm bg-transparent border border-border rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-ring"
          aria-label="Edit goal text"
        />
      ) : (
        <span
          className={`flex-1 min-w-0 text-sm text-foreground truncate cursor-pointer ${
            goal.completed ? "opacity-60" : ""
          }`}
          onDoubleClick={startEdit}
          title={goal.text}
        >
          {goal.text}
        </span>
      )}

      {/* Notes indicator */}
      {goal.notes && !isEditing && (
        <span
          className={`text-muted-foreground flex-shrink-0 ${
            goal.completed ? "opacity-60" : ""
          }`}
          title="Has notes"
          aria-label="Goal has notes"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
        </span>
      )}

      {/* Delete button (visible on hover) */}
      {!isEditing && (
        <button
          type="button"
          onClick={handleDelete}
          className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity p-0.5 rounded flex-shrink-0"
          aria-label={`Delete goal ${goal.text}`}
        >
          <CloseIcon />
        </button>
      )}
    </div>
  );
}
