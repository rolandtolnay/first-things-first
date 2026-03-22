"use client";

/**
 * WeekSelector - Custom dropdown for selecting a target week.
 *
 * Displays week number + date range (e.g., "W13 -- Mar 23-29, 2026").
 * Marks already-planned weeks with a "Planned" badge.
 * Closes on outside click and Escape key.
 */

import { useEffect, useRef, useState } from "react";
import { cn, formatWeekId, getWeekNumber } from "@/lib/utils";
import type { WeekId } from "@/types";

interface WeekSelectorProps {
  value: WeekId;
  onChange: (weekId: WeekId) => void;
  options: WeekId[];
  existingWeekIds: WeekId[];
}

export function WeekSelector({
  value,
  onChange,
  options,
  existingWeekIds,
}: WeekSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  function toggle() {
    setIsOpen((prev) => !prev);
  }

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    function handleMouseDown(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  function handleSelect(weekId: WeekId) {
    onChange(weekId);
    setIsOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger button */}
      <button
        type="button"
        onClick={toggle}
        className="w-full flex items-center justify-between text-sm px-3 py-2 rounded-md border border-border hover:bg-muted transition-colors text-left"
      >
        <span>
          W{getWeekNumber(value)} &mdash; {formatWeekId(value)}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn("shrink-0 ml-2 transition-transform", isOpen && "rotate-180")}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <div className="absolute left-0 right-0 mt-1 z-10 max-h-56 overflow-y-auto bg-card border border-border rounded-lg shadow-lg">
          {options.map((weekId) => {
            const isSelected = weekId === value;
            const isPlanned = existingWeekIds.includes(weekId);

            return (
              <button
                key={weekId}
                type="button"
                onClick={() => handleSelect(weekId)}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-muted transition-colors",
                  isSelected && "bg-muted"
                )}
              >
                <span className="font-medium shrink-0">
                  W{getWeekNumber(weekId)}
                </span>
                <span className="text-muted-foreground">
                  {formatWeekId(weekId)}
                </span>
                {isPlanned && (
                  <span className="ml-auto text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded shrink-0">
                    Planned
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
