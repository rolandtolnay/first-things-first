"use client";

/**
 * AddRoleButton Component
 *
 * Two-state component for adding new roles:
 * 1. Button state: Shows "+ Add Role" button
 * 2. Input state: Shows text input with save on Enter/blur, cancel on Escape
 */

import { useState, useRef, useEffect } from "react";
import { useWeekStore } from "@/stores/weekStore";

export function AddRoleButton() {
  const [isInputMode, setIsInputMode] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const addRole = useWeekStore((state) => state.addRole);

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
      addRole({ name: trimmed });
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
      <div className="py-2 border-t border-border mt-2">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder="Role name..."
          className="w-full text-sm border border-border rounded px-2 py-1 bg-transparent focus:outline-none focus:ring-1 focus:ring-ring"
          aria-label="New role name"
        />
      </div>
    );
  }

  return (
    <div className="py-2 border-t border-border mt-2">
      <button
        type="button"
        onClick={handleButtonClick}
        className="w-full text-left text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded hover:bg-secondary/50"
      >
        <span className="mr-1">+</span>
        Add Role
      </button>
    </div>
  );
}
