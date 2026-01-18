"use client";

/**
 * GoalItem Component
 *
 * Displays a single goal with:
 * - Role color accent (left border)
 * - Goal text (editable on double-click)
 * - Notes indicator icon (if goal has notes)
 * - Delete button (appears on hover)
 */

import { useState, useRef, useEffect } from "react";
import { useWeekStore } from "@/stores/weekStore";
import { getRoleColorStyle } from "@/lib/role-colors";
import type { Goal, RoleColor } from "@/types";

interface GoalItemProps {
  goal: Goal;
  roleColor: RoleColor;
}

export function GoalItem({ goal, roleColor }: GoalItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(goal.text);
  const inputRef = useRef<HTMLInputElement>(null);

  const updateGoal = useWeekStore((state) => state.updateGoal);
  const deleteGoal = useWeekStore((state) => state.deleteGoal);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Reset edit value when goal changes
  useEffect(() => {
    setEditValue(goal.text);
  }, [goal.text]);

  const handleStartEdit = () => {
    setIsEditing(true);
    setEditValue(goal.text);
  };

  const handleSave = () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== goal.text) {
      updateGoal(goal.id, { text: trimmed });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(goal.text);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    }
  };

  const handleDelete = () => {
    if (window.confirm(`Delete goal "${goal.text}"?`)) {
      deleteGoal(goal.id);
    }
  };

  return (
    <div
      className="group flex items-center gap-2 py-1 px-2 rounded-md hover:bg-secondary/50 transition-colors"
      style={{ borderLeft: `3px solid ${getRoleColorStyle(roleColor)}` }}
    >
      {/* Goal text display or edit input */}
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className="flex-1 min-w-0 text-sm bg-transparent border border-border rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-ring"
          aria-label="Edit goal text"
        />
      ) : (
        <span
          className="flex-1 min-w-0 text-sm text-foreground truncate cursor-pointer"
          onDoubleClick={handleStartEdit}
          title={goal.text}
        >
          {goal.text}
        </span>
      )}

      {/* Notes indicator */}
      {goal.notes && !isEditing && (
        <span
          className="text-muted-foreground flex-shrink-0"
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
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  );
}
