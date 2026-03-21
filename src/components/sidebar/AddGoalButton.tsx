"use client";

import { useWeekStore } from "@/stores/weekStore";
import { AddItemInput } from "@/components/ui/AddItemInput";

interface AddGoalButtonProps {
  roleId: string;
}

export function AddGoalButton({ roleId }: AddGoalButtonProps) {
  const addGoal = useWeekStore((state) => state.addGoal);

  return (
    <AddItemInput
      label="Add Goal"
      placeholder="Goal text..."
      onAdd={(text) => addGoal({ roleId, text })}
      wrapperClassName="px-2 py-1"
      inputClassName="w-full text-xs border border-border rounded px-2 py-1 bg-transparent focus:outline-none focus:ring-1 focus:ring-ring"
      buttonClassName="text-left text-xs text-muted-foreground hover:text-foreground transition-colors px-1 py-0.5 rounded hover:bg-secondary/50"
    />
  );
}
