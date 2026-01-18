"use client";

/**
 * GoalList Component
 *
 * Container for displaying goals under a specific role.
 * Renders GoalItem for each goal and AddGoalButton at the end.
 */

import { useMemo } from "react";
import { useWeekStore } from "@/stores/weekStore";
import { GoalItem } from "./GoalItem";
import { AddGoalButton } from "./AddGoalButton";
import type { RoleColor } from "@/types";

interface GoalListProps {
  roleId: string;
  roleColor: RoleColor;
}

export function GoalList({ roleId, roleColor }: GoalListProps) {
  const currentWeek = useWeekStore((state) => state.currentWeek);

  // Memoize filtered goals to avoid hydration issues
  // (same pattern as RoleList for sorted roles)
  const goals = useMemo(() => {
    if (!currentWeek?.goals) return [];
    return currentWeek.goals.filter((g) => g.roleId === roleId);
  }, [currentWeek?.goals, roleId]);

  return (
    <div className="flex flex-col">
      {/* Goal items */}
      {goals.map((goal) => (
        <GoalItem key={goal.id} goal={goal} roleColor={roleColor} />
      ))}

      {/* Add goal button always visible at the end */}
      <AddGoalButton roleId={roleId} />
    </div>
  );
}
