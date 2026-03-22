"use client";

/**
 * GoalItem Component
 *
 * Displays a single goal with:
 * - Role color accent (left border + tinted background)
 * - Goal text (editable on double-click)
 * - Notes indicator icon (if goal has notes) - right of text
 * - Completion checkbox on the RIGHT side
 * - Delete button (appears on hover)
 * - Drag capability for dropping onto Day Priorities
 */

import { useCallback } from "react";
import { useDraggable } from "@dnd-kit/core";
import { X, FileText } from "lucide-react";
import { useWeekStore } from "@/stores/weekStore";
import { getRoleColorStyle, getRoleColorStyleWithOpacity } from "@/lib/role-colors";
import { useEditableText } from "@/hooks/useEditableText";
import { CompletionCheckbox } from "@/components/ui/CompletionCheckbox";
import { cn } from "@/lib/utils";
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

  // Compute background based on completion state
  const backgroundColor = goal.completed
    ? 'var(--completed-bg)'
    : getRoleColorStyleWithOpacity(roleColor, 0.08);

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        "group flex items-center gap-2 transition-colors",
        "cursor-grab active:cursor-grabbing",
        isDragging && "opacity-50"
      )}
      style={{
        borderLeft: `3px solid ${getRoleColorStyle(roleColor)}`,
        backgroundColor,
        borderRadius: 'var(--radius-md)',
        padding: '10px 12px',
        opacity: goal.completed && !isDragging ? 'var(--completed-opacity)' : undefined,
      }}
      onMouseEnter={(e) => {
        if (!goal.completed) {
          e.currentTarget.style.backgroundColor = getRoleColorStyleWithOpacity(roleColor, 0.12);
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = backgroundColor;
      }}
    >
      {/* Goal text display or edit input */}
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={save}
          onKeyDown={handleKeyDown}
          className="flex-1 min-w-0 bg-transparent focus:outline-none"
          style={{
            fontSize: '14px',
            border: `1px solid var(--border-emphasis)`,
            borderRadius: 'var(--radius-sm)',
            padding: '2px 6px',
          }}
          aria-label="Edit goal text"
        />
      ) : (
        <span
          className="flex-1 min-w-0 truncate cursor-pointer"
          style={{
            fontSize: '14px',
            lineHeight: '1.5',
            color: 'var(--text-primary)',
          }}
          onDoubleClick={startEdit}
          title={goal.text}
        >
          {goal.text}
        </span>
      )}

      {/* Notes indicator */}
      {goal.notes && !isEditing && (
        <span
          className="flex-shrink-0"
          style={{ color: 'var(--text-muted)' }}
          title="Has notes"
          aria-label="Goal has notes"
        >
          <FileText size={12} />
        </span>
      )}

      {/* Completion checkbox - RIGHT side */}
      {!isEditing && (
        <CompletionCheckbox
          completed={goal.completed}
          onToggle={() => toggleGoalCompleted(goal.id)}
        />
      )}

      {/* Delete button (visible on hover) */}
      {!isEditing && (
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
          aria-label={`Delete goal ${goal.text}`}
        >
          <X size={12} />
        </button>
      )}
    </div>
  );
}
