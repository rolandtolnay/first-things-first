"use client";

import { Plus } from "lucide-react";
import { useWeekStore } from "@/stores/weekStore";
import { AddItemInput } from "@/components/ui/AddItemInput";

interface AddGoalButtonProps {
  roleId: string;
}

export function AddGoalButton({ roleId }: AddGoalButtonProps) {
  const addGoal = useWeekStore((state) => state.addGoal);

  return (
    <AddItemInput
      label="Add goal"
      placeholder="Goal text..."
      onAdd={(text) => addGoal({ roleId, text })}
      icon={<Plus size={14} className="text-primary" />}
    />
  );
}
