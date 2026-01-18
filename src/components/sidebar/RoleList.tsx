"use client";

/**
 * RoleList Component
 *
 * Container for displaying the list of roles in the sidebar.
 * Connects to weekStore for role data and renders RoleSection for each role
 * (which includes the role header and its associated goals).
 */

import { useMemo } from "react";
import { useWeekStore } from "@/stores/weekStore";
import { RoleSection } from "./RoleSection";
import { AddRoleButton } from "./AddRoleButton";

export function RoleList() {
  const currentWeek = useWeekStore((state) => state.currentWeek);
  const isLoading = useWeekStore((state) => state.isLoading);

  // Memoize sorted roles to avoid infinite loop during hydration
  // (selectors that return new arrays on each call cause SSR issues)
  const roles = useMemo(() => {
    if (!currentWeek?.roles) return [];
    return [...currentWeek.roles].sort((a, b) => a.order - b.order);
  }, [currentWeek?.roles]);

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
      <div className="space-y-2">
        {roles.map((role) => (
          <RoleSection key={role.id} role={role} />
        ))}
      </div>
      <AddRoleButton />
    </div>
  );
}
