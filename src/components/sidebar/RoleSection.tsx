"use client";

/**
 * RoleSection Component
 *
 * Combines a role header with its goals list.
 * Displays:
 * - Role header (color dot, name, edit/delete)
 * - GoalList underneath
 * - Entire section tinted with role color at 8% opacity
 */

import { useCallback } from "react";
import { Trash2 } from "lucide-react";
import { useWeekStore } from "@/stores/weekStore";
import { getRoleColorStyle, getRoleColorStyleWithOpacity } from "@/lib/role-colors";
import { useEditableText } from "@/hooks/useEditableText";
import { GoalList } from "./GoalList";
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
    <div
      className="flex flex-col"
      style={{
        backgroundColor: getRoleColorStyleWithOpacity(role.color, 0.08),
        borderRadius: 'var(--radius-md)',
        padding: '12px',
        marginBottom: '12px',
      }}
    >
      {/* Role header */}
      <div className="group flex items-center gap-2 transition-colors">
        {/* Color indicator - 8px dot */}
        <div
          className="w-2 h-2 rounded-full flex-shrink-0"
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
            className="flex-1 min-w-0 bg-transparent focus:outline-none"
            style={{
              fontSize: '15px',
              fontWeight: 600,
              border: `1px solid var(--border-emphasis)`,
              borderRadius: 'var(--radius-sm)',
              padding: '2px 6px',
            }}
            aria-label="Edit role name"
          />
        ) : (
          <span
            className="flex-1 min-w-0 truncate cursor-pointer"
            style={{
              fontSize: '15px',
              fontWeight: 600,
              lineHeight: '1.4',
              color: 'var(--text-primary)',
            }}
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
            className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded cursor-pointer"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--destructive)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-muted)';
            }}
            aria-label={`Delete role ${role.name}`}
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {/* Goals list - inside colored section, no extra indent */}
      <div className="mt-2">
        <GoalList roleId={role.id} roleColor={role.color} />
      </div>
    </div>
  );
}
