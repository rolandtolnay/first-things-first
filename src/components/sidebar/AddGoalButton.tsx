"use client";

import type { ComponentProps } from "react";
import { Plus } from "lucide-react";
import { TextActionButton } from "@/components/ui/TextActionButton";
import { cn } from "@/lib/utils";

interface AddGoalButtonProps extends ComponentProps<"button"> {
  onClick: () => void;
}

/**
 * Compact inline add-goal affordance for an empty role. Keep this visually
 * lighter than AddRoleButton: adding a goal is an in-card action, not a new
 * card-level drop target.
 */
export function AddGoalButton({ onClick, className, ...props }: AddGoalButtonProps) {
  return (
    <TextActionButton className={cn("self-start", className)} onClick={onClick} {...props}>
      <Plus strokeWidth={1.6} />
      Add goal
    </TextActionButton>
  );
}
