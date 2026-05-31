"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
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
import { getRoleColorStyle } from "@/lib/role-colors";
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
  const [isRewarding, setIsRewarding] = useState(false);
  const rewardTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (rewardTimeoutRef.current !== null) {
        window.clearTimeout(rewardTimeoutRef.current);
      }
    };
  }, []);

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

  function handleToggleCompleted() {
    if (!goal.completed) {
      setIsRewarding(true);
      if (rewardTimeoutRef.current !== null) {
        window.clearTimeout(rewardTimeoutRef.current);
      }
      rewardTimeoutRef.current = window.setTimeout(() => {
        setIsRewarding(false);
        rewardTimeoutRef.current = null;
      }, 650);
    }
    void toggleGoalCompleted(goal.id);
  }

  return (
    <>
      <div
        ref={setNodeRef}
        {...(isEditing ? {} : listeners)}
        {...attributes}
        className={cn(
          "group/goal relative flex min-h-7 cursor-grab items-start gap-2 rounded-[var(--ds-r-xs)] py-1.5 pl-0 pr-1.5 active:cursor-grabbing transition-[background-color,opacity] hover:bg-[var(--ds-hover-tint)]",
          goal.completed && "bg-[var(--ds-sunk-tint)]",
          isRewarding && "goal-complete-reward",
          isDragging && "opacity-50"
        )}
        style={{ "--goal-role-color": getRoleColorStyle(roleColor) } as CSSProperties}
      >
        <Checkbox
          checked={goal.completed}
          onCheckedChange={handleToggleCompleted}
          // Stop drag listeners from swallowing the toggle interaction.
          onPointerDown={(e) => e.stopPropagation()}
          className="mt-0.5 size-3.5 shrink-0 data-checked:border-[var(--goal-role-color)] data-checked:bg-[var(--goal-role-color)] data-checked:text-[var(--ds-accent-ink)] dark:data-checked:bg-[var(--goal-role-color)]"
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
            className="h-7 flex-1 text-[12px] text-foreground"
            aria-label="Edit goal text"
          />
        ) : (
          <span
            className={cn(
              "min-w-0 flex-1 cursor-text pt-0.5 text-[12px] leading-[1.35]",
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
            className="flex size-5 shrink-0 items-center justify-center rounded-[3px] text-[var(--ds-fg-faint)] opacity-0 transition-[opacity,background-color,color] hover:bg-[var(--ds-line)] hover:text-foreground group-hover/goal:opacity-100"
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
