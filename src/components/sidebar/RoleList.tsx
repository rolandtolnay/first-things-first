"use client";

/**
 * RoleList Component
 *
 * Container for displaying the list of roles in the sidebar. Owns the
 * "ROLES & GOALS" section label (with an add-role + action) and the add-role
 * state shared between that action and the dashed AddRoleButton at the bottom.
 * Connects to weekStore for role data and renders RoleSection for each role
 * (which includes the role header and its associated goals).
 */

import { useMemo, useState } from "react";
import { useDndMonitor } from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus, Users } from "lucide-react";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { useWeekStore } from "@/stores/weekStore";
import { isRoleReorderDragData } from "@/types/dnd";
import { RoleSection } from "./RoleSection";
import { AddRoleButton } from "./AddRoleButton";

export function RoleList() {
  const currentWeek = useWeekStore((state) => state.currentWeek);
  const isLoading = useWeekStore((state) => state.isLoading);
  const reorderRoles = useWeekStore((state) => state.reorderRoles);
  const [isAddingRole, setIsAddingRole] = useState(false);
  const weekRoles = currentWeek?.roles;

  // Memoize sorted roles to avoid infinite loop during hydration
  // (selectors that return new arrays on each call cause SSR issues)
  const roles = useMemo(() => {
    if (!weekRoles) return [];
    return [...weekRoles].sort((a, b) => a.order - b.order);
  }, [weekRoles]);
  const roleIds = useMemo(() => roles.map((role) => role.id), [roles]);

  useDndMonitor({
    onDragEnd(event) {
      const { active, over } = event;
      if (!over) return;
      if (!isRoleReorderDragData(active.data.current)) return;
      if (!isRoleReorderDragData(over.data.current)) return;

      const oldIndex = roleIds.indexOf(active.data.current.roleId);
      const newIndex = roleIds.indexOf(over.data.current.roleId);
      if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return;

      void reorderRoles(arrayMove(roleIds, oldIndex, newIndex));
    },
  });

  const addRoleControl = (
    <AddRoleButton
      isAdding={isAddingRole}
      onStartAdding={() => setIsAddingRole(true)}
      onDone={() => setIsAddingRole(false)}
    />
  );

  const sectionLabel = (
    <SectionLabel
      icon={<Users strokeWidth={1.4} />}
      action={
        <button
          onClick={() => setIsAddingRole(true)}
          aria-label="Add role"
          className="flex size-5 items-center justify-center rounded-[4px] text-muted-foreground transition-colors hover:bg-[var(--ds-hover-tint)] hover:text-foreground"
        >
          <Plus size={12} strokeWidth={1.6} />
        </button>
      }
    >
      Roles &amp; Goals
    </SectionLabel>
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {sectionLabel}
        <p className="py-4 text-center text-sm text-muted-foreground">
          Loading roles...
        </p>
      </div>
    );
  }

  // Empty state - no roles and week is loaded
  if (roles.length === 0 && currentWeek) {
    return (
      <div className="flex flex-col gap-3">
        {sectionLabel}
        {!isAddingRole && (
          <p className="py-2 text-center text-sm text-muted-foreground">
            No roles yet. Add your first role below.
          </p>
        )}
        {addRoleControl}
      </div>
    );
  }

  // Normal render - roles exist
  return (
    <div className="flex flex-col gap-3">
      {sectionLabel}
      <div className="flex flex-col gap-1.5">
        <SortableContext items={roleIds} strategy={verticalListSortingStrategy}>
          {roles.map((role) => (
            <RoleSection key={role.id} role={role} />
          ))}
        </SortableContext>
        {addRoleControl}
      </div>
    </div>
  );
}
