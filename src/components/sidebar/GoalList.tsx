"use client";

import { useMemo, useRef, useEffect, useState } from "react";
import { useWeekStore } from "@/stores/weekStore";
import { GoalItem } from "./GoalItem";
import { Input } from "@/components/ui/input";
import type { RoleColor } from "@/types";

interface GoalListProps {
  roleId: string;
  roleColor: RoleColor;
  addingGoal?: boolean;
  onAddingGoalDone?: () => void;
}

export function GoalList({ roleId, roleColor, addingGoal, onAddingGoalDone }: GoalListProps) {
  const currentWeek = useWeekStore((state) => state.currentWeek);
  const addGoal = useWeekStore((state) => state.addGoal);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (addingGoal && inputRef.current) {
      inputRef.current.focus();
    }
  }, [addingGoal]);

  const goals = useMemo(() => {
    if (!currentWeek?.goals) return [];
    return currentWeek.goals.filter((g) => g.roleId === roleId);
  }, [currentWeek?.goals, roleId]);

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

  return (
    <div className="flex flex-col gap-2">
      {goals.map((goal) => (
        <GoalItem key={goal.id} goal={goal} roleColor={roleColor} />
      ))}

      {addingGoal && (
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder="Goal text..."
          className="text-sm"
          aria-label="New goal text"
        />
      )}
    </div>
  );
}
