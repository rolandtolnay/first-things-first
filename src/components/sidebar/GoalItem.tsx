"use client";

import { useCallback, useState } from "react";
import { X } from "lucide-react";
import { useDraggable } from "@dnd-kit/core";
import { useWeekStore } from "@/stores/weekStore";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useEditableText } from "@/hooks/useEditableText";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import type { Goal } from "@/types";
import type { GoalDragData } from "@/types/dnd";

interface GoalItemProps {
  goal: Goal;
}

export function GoalItem({ goal }: GoalItemProps) {
  const updateGoal = useWeekStore((state) => state.updateGoal);
  const deleteGoal = useWeekStore((state) => state.deleteGoal);
  const toggleGoalCompleted = useWeekStore((state) => state.toggleGoalCompleted);
  const [alertOpen, setAlertOpen] = useState(false);

  const handleEdit = useCallback(
    (newText: string) => updateGoal(goal.id, { text: newText }),
    [updateGoal, goal.id]
  );

  const { isEditing, editValue, setEditValue, inputRef, startEdit, save, handleKeyDown } =
    useEditableText(goal.text, handleEdit);

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
    <>
      <div
        ref={setNodeRef}
        {...(isEditing ? {} : listeners)}
        {...attributes}
        className={cn(
          "group/goal relative flex cursor-grab items-center gap-2 rounded-[4px] py-1 pl-0 pr-1 active:cursor-grabbing hover:bg-[var(--ds-hover-tint)]",
          isDragging && "opacity-50"
        )}
      >
        <Checkbox
          checked={goal.completed}
          onCheckedChange={() => toggleGoalCompleted(goal.id)}
          // Stop drag listeners from swallowing the toggle interaction.
          onPointerDown={(e) => e.stopPropagation()}
          className="size-3 shrink-0"
          aria-label={goal.completed ? "Mark goal incomplete" : "Mark goal complete"}
        />

        {isEditing ? (
          <Input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={save}
            onKeyDown={handleKeyDown}
            onPointerDown={(e) => e.stopPropagation()}
            className="flex-1 text-[12px] text-foreground"
            aria-label="Edit goal text"
          />
        ) : (
          <span
            className={cn(
              "min-w-0 flex-1 cursor-text text-[12px] leading-[1.35]",
              goal.completed
                ? "text-muted-foreground line-through decoration-[var(--ds-fg-faint)]"
                : "text-foreground"
            )}
            onDoubleClick={(e) => {
              e.stopPropagation();
              startEdit();
            }}
            title={goal.text}
          >
            {goal.text}
          </span>
        )}

        {!isEditing && (
          <button
            onClick={() => setAlertOpen(true)}
            onPointerDown={(e) => e.stopPropagation()}
            aria-label="Delete goal"
            className="flex size-4 shrink-0 items-center justify-center rounded-[3px] text-[var(--ds-fg-faint)] opacity-0 transition-[opacity,background-color,color] hover:bg-[var(--ds-line)] hover:text-foreground group-hover/goal:opacity-100"
          >
            <X size={11} strokeWidth={1.8} />
          </button>
        )}
      </div>

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
    </>
  );
}
