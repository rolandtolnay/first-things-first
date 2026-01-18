"use client";

/**
 * RoleList Component
 *
 * Container for displaying the list of roles in the sidebar.
 * Connects to weekStore for role data and renders RoleItem for each role.
 */

import { useWeekStore, selectSortedRoles } from "@/stores/weekStore";
import { RoleItem } from "./RoleItem";
import { AddRoleButton } from "./AddRoleButton";

export function RoleList() {
  const roles = useWeekStore(selectSortedRoles);
  const currentWeek = useWeekStore((state) => state.currentWeek);
  const isLoading = useWeekStore((state) => state.isLoading);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex flex-col space-y-1">
        <p className="text-sm text-muted-foreground text-center py-4">
          Loading roles...
        </p>
      </div>
    );
  }

  // Empty state - no roles and week is loaded
  if (roles.length === 0 && currentWeek) {
    return (
      <div className="flex flex-col">
        <p className="text-sm text-muted-foreground text-center py-4">
          No roles yet. Add your first role below.
        </p>
        <AddRoleButton />
      </div>
    );
  }

  // Normal render - roles exist
  return (
    <div className="flex flex-col">
      <div className="space-y-1">
        {roles.map((role) => (
          <RoleItem key={role.id} role={role} />
        ))}
      </div>
      <AddRoleButton />
    </div>
  );
}
