"use client";

/**
 * AddGoalButton Component
 *
 * Two-state component for adding new goals to a role:
 * 1. Button state: Shows "+ Add Goal" button
 * 2. Input state: Shows text input with save on Enter/blur, cancel on Escape
 */

import { useState, useRef, useEffect } from "react";
import { useWeekStore } from "@/stores/weekStore";

interface AddGoalButtonProps {
  roleId: string;
}

export function AddGoalButton({ roleId }: AddGoalButtonProps) {
  const [isInputMode, setIsInputMode] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const addGoal = useWeekStore((state) => state.addGoal);

  // Focus input when entering input mode
  useEffect(() => {
    if (isInputMode && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isInputMode]);

  const handleButtonClick = () => {
    setIsInputMode(true);
    setInputValue("");
  };

  const handleSubmit = () => {
    const trimmed = inputValue.trim();
    if (trimmed) {
      addGoal({ roleId, text: trimmed });
    }
    setInputValue("");
    setIsInputMode(false);
  };

  const handleCancel = () => {
    setInputValue("");
    setIsInputMode(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    }
  };

  const handleBlur = () => {
    // Submit if there's a value, otherwise cancel
    const trimmed = inputValue.trim();
    if (trimmed) {
      handleSubmit();
    } else {
      handleCancel();
    }
  };

  if (isInputMode) {
    return (
      <div className="px-2 py-1">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder="Goal text..."
          className="w-full text-xs border border-border rounded px-2 py-1 bg-transparent focus:outline-none focus:ring-1 focus:ring-ring"
          aria-label="New goal text"
        />
      </div>
    );
  }

  return (
    <div className="px-2 py-1">
      <button
        type="button"
        onClick={handleButtonClick}
        className="text-left text-xs text-muted-foreground hover:text-foreground transition-colors px-1 py-0.5 rounded hover:bg-secondary/50"
      >
        <span className="mr-1">+</span>
        Add Goal
      </button>
    </div>
  );
}
