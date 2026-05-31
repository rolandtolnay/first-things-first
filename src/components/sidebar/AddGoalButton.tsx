"use client";

import { Plus } from "lucide-react";
import { TextActionButton } from "@/components/ui/TextActionButton";

interface AddGoalButtonProps {
  onClick: () => void;
}

/**
 * Compact inline add-goal affordance for an empty role. Keep this visually
 * lighter than AddRoleButton: adding a goal is an in-card action, not a new
 * card-level drop target.
 */
export function AddGoalButton({ onClick }: AddGoalButtonProps) {
  return (
    <TextActionButton className="self-start" onClick={onClick}>
      <Plus strokeWidth={1.6} />
      Add goal
    </TextActionButton>
  );
}
