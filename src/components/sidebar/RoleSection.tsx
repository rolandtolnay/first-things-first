"use client";

/**
 * RoleSection Component
 *
 * Combines a role header with its goals list.
 * Displays:
 * - Role header (color dot, name, edit/delete)
 * - GoalList underneath with slight indentation
 */

import { useCallback } from "react";
import { useWeekStore } from "@/stores/weekStore";
import { getRoleColorStyle } from "@/lib/role-colors";
import { useEditableText } from "@/hooks/useEditableText";
import { GoalList } from "./GoalList";
import { CloseIcon } from "@/components/ui/CloseIcon";
import type { Role } from "@/types";

interface RoleSectionProps {
  role: Role;
}

export function RoleSection({ role }: RoleSectionProps) {
  const updateRole = useWeekStore((state) => state.updateRole);
  const deleteRole = useWeekStore((state) => state.deleteRole);

  const handleSaveRole = useCallback(
    (value: string) => updateRole(role.id, { name: value }),
    [updateRole, role.id]
  );

  const { isEditing, editValue, setEditValue, inputRef, startEdit, save, handleKeyDown } =
    useEditableText(role.name, handleSaveRole);

  const handleDelete = () => {
    if (window.confirm(`Delete role "${role.name}"? This will also delete all goals for this role.`)) {
      deleteRole(role.id);
    }
  };

  return (
    <div className="flex flex-col">
      {/* Role header */}
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
            onBlur={save}
            onKeyDown={handleKeyDown}
            className="flex-1 min-w-0 text-sm bg-transparent border border-border rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-ring"
            aria-label="Edit role name"
          />
        ) : (
          <span
            className="flex-1 min-w-0 text-sm font-medium text-foreground truncate cursor-pointer"
            onDoubleClick={startEdit}
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
            <CloseIcon size={14} />
          </button>
        )}
      </div>

      {/* Goals list - slightly indented */}
      <div className="ml-5">
        <GoalList roleId={role.id} roleColor={role.color} />
      </div>
    </div>
  );
}
