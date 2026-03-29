"use client";

import { useCallback, useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { useWeekStore } from "@/stores/weekStore";
import { BlockCard } from "@/components/ui/BlockCard";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import type { Goal, RoleColor } from "@/types";
import type { GoalDragData } from "@/types/dnd";

interface GoalItemProps {
  goal: Goal;
  roleColor: RoleColor;
}

export function GoalItem({ goal, roleColor }: GoalItemProps) {
  const updateGoal = useWeekStore((state) => state.updateGoal);
  const deleteGoal = useWeekStore((state) => state.deleteGoal);
  const toggleGoalCompleted = useWeekStore((state) => state.toggleGoalCompleted);
  const [alertOpen, setAlertOpen] = useState(false);

  const handleEdit = useCallback(
    (newText: string) => updateGoal(goal.id, { text: newText }),
    [updateGoal, goal.id]
  );

  const dragData: GoalDragData = {
    type: "goal",
    goalId: goal.id,
    roleId: goal.roleId,
    text: goal.text,
  };

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `goal-${goal.id}`,
    data: dragData,
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        "cursor-grab active:cursor-grabbing",
        isDragging && "opacity-50"
      )}
    >
      <BlockCard
        text={goal.text}
        roleColor={roleColor}
        completed={goal.completed}
        editable
        compact={false}
        height={56}
        onToggle={() => toggleGoalCompleted(goal.id)}
        onEdit={handleEdit}
        onDelete={() => setAlertOpen(true)}
      />

      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogTitle>Delete goal</AlertDialogTitle>
          <AlertDialogDescription>
            Delete &ldquo;{goal.text}&rdquo;? This cannot be undone.
          </AlertDialogDescription>
          <div className="flex justify-end gap-2 mt-4">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteGoal(goal.id)}>
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
