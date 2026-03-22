"use client";

/**
 * WeekSelector - Custom dropdown for selecting a target week.
 *
 * Displays week number + date range (e.g., "W13 -- Mar 23-29, 2026").
 * Marks already-planned weeks with a "Planned" badge.
 * Closes on outside click and Escape key.
 */

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
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

  // Close on outside click or Escape
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

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
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
        className="w-full flex items-center justify-between text-left transition-colors cursor-pointer"
        style={{
          fontSize: '14px',
          padding: '8px 12px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--bg-muted)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        <span>
          W{getWeekNumber(value)} &mdash; {formatWeekId(value)}
        </span>
        <ChevronDown
          size={16}
          className={cn("shrink-0 ml-2 transition-transform", isOpen && "rotate-180")}
          style={{ color: 'var(--text-muted)' }}
        />
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <div
          className="absolute left-0 right-0 mt-1 z-10 max-h-56 overflow-y-auto"
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          {options.map((weekId) => {
            const isSelected = weekId === value;
            const isPlanned = existingWeekIds.includes(weekId);

            return (
              <button
                key={weekId}
                type="button"
                onClick={() => handleSelect(weekId)}
                className="w-full flex items-center gap-2 text-left transition-colors cursor-pointer"
                style={{
                  fontSize: '14px',
                  padding: '8px 12px',
                  backgroundColor: isSelected ? 'var(--bg-muted)' : undefined,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-muted)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = isSelected ? 'var(--bg-muted)' : 'transparent';
                }}
              >
                <span className="font-medium shrink-0">
                  W{getWeekNumber(weekId)}
                </span>
                <span style={{ color: 'var(--text-muted)' }}>
                  {formatWeekId(weekId)}
                </span>
                {isPlanned && (
                  <span
                    className="ml-auto shrink-0"
                    style={{
                      fontSize: '12px',
                      color: 'var(--text-muted)',
                      backgroundColor: 'var(--bg-muted)',
                      padding: '2px 6px',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
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
