"use client";

/**
 * WeekNavigation - Navigation header for browsing between existing weeks.
 *
 * Uses useLiveQuery for a reactive week index that auto-updates when weeks
 * are created or deleted. Arrow buttons navigate between existing weeks only.
 * Includes a banner when the current calendar week hasn't been planned.
 */

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { useWeekStore } from "@/stores/weekStore";
import { formatWeekId, getCurrentWeekId } from "@/lib/utils";
import type { WeekId } from "@/types";

interface WeekNavigationProps {
  onNewWeek: () => void;
}

export function WeekNavigation({ onNewWeek }: WeekNavigationProps) {
  const selectedWeekId = useWeekStore((s) => s.selectedWeekId);
  const navigateToWeek = useWeekStore((s) => s.navigateToWeek);

  // Reactive sorted list of existing week IDs
  const weekIds =
    useLiveQuery(() => db.weeks.orderBy("id").primaryKeys(), [], []) as WeekId[];

  const currentCalendarWeekId = getCurrentWeekId();
  const currentIndex = selectedWeekId
    ? weekIds.indexOf(selectedWeekId)
    : -1;

  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex >= 0 && currentIndex < weekIds.length - 1;
  const isCurrentCalendarWeek = selectedWeekId === currentCalendarWeekId;
  const currentCalendarWeekExists = weekIds.includes(currentCalendarWeekId);

  function handlePrev() {
    if (canGoPrev) {
      navigateToWeek(weekIds[currentIndex - 1]);
    }
  }

  function handleNext() {
    if (canGoNext) {
      navigateToWeek(weekIds[currentIndex + 1]);
    }
  }

  function handleToday() {
    if (currentCalendarWeekExists) {
      navigateToWeek(currentCalendarWeekId);
    } else if (weekIds.length > 0) {
      // Navigate to the latest existing week
      navigateToWeek(weekIds[weekIds.length - 1]);
    }
  }

  // Show banner when weeks exist but current calendar week hasn't been planned
  const showBanner =
    weekIds.length > 0 && !currentCalendarWeekExists;

  return (
    <div className="shrink-0">
      {/* Navigation controls */}
      <div className="p-4 border-b border-border flex items-center gap-3">
        {/* Arrow buttons */}
        <button
          type="button"
          onClick={handlePrev}
          disabled={!canGoPrev}
          className="p-1.5 rounded-md hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous week"
        >
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
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>

        <button
          type="button"
          onClick={handleNext}
          disabled={!canGoNext}
          className="p-1.5 rounded-md hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Next week"
        >
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
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>

        {/* Date range label */}
        <h2 className="text-lg font-semibold flex items-center gap-2">
          {selectedWeekId ? formatWeekId(selectedWeekId) : "Loading..."}
          {isCurrentCalendarWeek && (
            <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              This week
            </span>
          )}
        </h2>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Today button */}
        {!isCurrentCalendarWeek && (
          <button
            type="button"
            onClick={handleToday}
            className="text-sm px-3 py-1.5 rounded-md border border-border hover:bg-muted transition-colors"
          >
            Today
          </button>
        )}

        {/* +New button */}
        <button
          type="button"
          onClick={onNewWeek}
          className="text-sm px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
        >
          + New
        </button>
      </div>

      {/* "Plan this week?" banner */}
      {showBanner && (
        <div className="px-4 py-2.5 bg-primary/10 border-b border-border flex items-center gap-3">
          <span className="text-sm font-medium">
            Plan this week?
          </span>
          <button
            type="button"
            onClick={onNewWeek}
            className="text-sm px-3 py-1 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
          >
            Start
          </button>
        </div>
      )}
    </div>
  );
}
