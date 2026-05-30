"use client";

import { Plus } from "lucide-react";
import { useWeekStore } from "@/stores/weekStore";
import { AddItemInput } from "@/components/ui/AddItemInput";

interface AddGoalButtonProps {
  roleId: string;
}

/**
 * Subtle, mono add-goal affordance. Not currently mounted (RoleSection drives
 * the inline add-goal flow via GoalList) but kept wired for reuse.
 */
export function AddGoalButton({ roleId }: AddGoalButtonProps) {
  const addGoal = useWeekStore((state) => state.addGoal);

  return (
    <AddItemInput
      label="Add goal"
      placeholder="New goal…"
      onAdd={(text) => addGoal({ roleId, text })}
      icon={<Plus size={12} strokeWidth={1.6} className="text-muted-foreground" />}
    />
  );
}
