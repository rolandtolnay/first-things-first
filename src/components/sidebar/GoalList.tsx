"use client";

import { useMemo, useRef, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { useWeekStore } from "@/stores/weekStore";
import { AddGoalButton } from "./AddGoalButton";
import { GoalItem } from "./GoalItem";
import type { RoleColor } from "@/types";

interface GoalListProps {
  roleId: string;
  roleColor: RoleColor;
  addingGoal?: boolean;
  onStartAddingGoal?: () => void;
  onAddingGoalDone?: () => void;
}

export function GoalList({
  roleId,
  roleColor,
  addingGoal,
  onStartAddingGoal,
  onAddingGoalDone,
}: GoalListProps) {
  const currentWeek = useWeekStore((state) => state.currentWeek);
  const addGoal = useWeekStore((state) => state.addGoal);
  const allGoals = currentWeek?.goals;
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!addingGoal) return;

    const focusFrame = requestAnimationFrame(() => {
      inputRef.current?.focus();
    });

    return () => cancelAnimationFrame(focusFrame);
  }, [addingGoal]);

  const goals = useMemo(() => {
    if (!allGoals) return [];
    return allGoals.filter((g) => g.roleId === roleId);
  }, [allGoals, roleId]);

  function handleSubmit() {
    const trimmed = inputValue.trim();
    if (trimmed) {
      addGoal({ roleId, text: trimmed });
    }
    setInputValue("");
    onAddingGoalDone?.();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setInputValue("");
      onAddingGoalDone?.();
    }
  }

  function handleBlur() {
    handleSubmit();
  }

  const hasGoals = goals.length > 0;

  return (
    <div className="flex flex-col gap-1">
      {goals.map((goal) => (
        <GoalItem key={goal.id} goal={goal} roleColor={roleColor} />
      ))}

      {addingGoal ? (
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder="New goal…"
          className="h-7 text-[12px] text-foreground"
          aria-label="New goal text"
        />
      ) : !hasGoals ? (
        <AddGoalButton
          onClick={() => onStartAddingGoal?.()}
          className="h-6 justify-start self-stretch"
        />
      ) : null}
    </div>
  );
}
