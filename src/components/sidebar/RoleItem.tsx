"use client";

/**
 * RoleItem Component
 *
 * Displays a single role with:
 * - Color indicator (dot)
 * - Role name (editable on double-click)
 * - Delete button (appears on hover)
 */

import { useState, useRef, useEffect } from "react";
import { useWeekStore } from "@/stores/weekStore";
import { getRoleColorStyle } from "@/lib/role-colors";
import type { Role } from "@/types";

interface RoleItemProps {
  role: Role;
}

export function RoleItem({ role }: RoleItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(role.name);
  const inputRef = useRef<HTMLInputElement>(null);

  const updateRole = useWeekStore((state) => state.updateRole);
  const deleteRole = useWeekStore((state) => state.deleteRole);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Reset edit value when role changes
  useEffect(() => {
    setEditValue(role.name);
  }, [role.name]);

  const handleStartEdit = () => {
    setIsEditing(true);
    setEditValue(role.name);
  };

  const handleSave = () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== role.name) {
      updateRole(role.id, { name: trimmed });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(role.name);
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
    if (window.confirm(`Delete role "${role.name}"? This will also delete all goals for this role.`)) {
      deleteRole(role.id);
    }
  };

  return (
    <div className="group flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-secondary/50 transition-colors">
      {/* Color indicator */}
      <div
        className="w-3 h-3 rounded-full flex-shrink-0"
        style={{ backgroundColor: getRoleColorStyle(role.color) }}
        aria-hidden="true"
      />

      {/* Name display or edit input */}
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className="flex-1 min-w-0 text-sm bg-transparent border border-border rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-ring"
          aria-label="Edit role name"
        />
      ) : (
        <span
          className="flex-1 min-w-0 text-sm text-foreground truncate cursor-pointer"
          onDoubleClick={handleStartEdit}
          title={role.name}
        >
          {role.name}
        </span>
      )}

      {/* Delete button (visible on hover) */}
      {!isEditing && (
        <button
          type="button"
          onClick={handleDelete}
          className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity p-0.5 rounded"
          aria-label={`Delete role ${role.name}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
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
