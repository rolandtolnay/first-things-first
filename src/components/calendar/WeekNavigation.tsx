"use client";

/**
 * WeekNavigation - Navigation header for browsing between existing weeks.
 *
 * Uses useLiveQuery for a reactive week index that auto-updates when weeks
 * are created or deleted. Arrow buttons navigate between existing weeks only.
 * Includes a banner when the current calendar week hasn't been planned.
 */

import { ChevronLeft, ChevronRight } from "lucide-react";
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
  const showBanner = weekIds.length > 0 && !currentCalendarWeekExists;

  return (
    <div className="shrink-0">
      {/* Navigation controls */}
      <div
        className="flex items-center gap-3"
        style={{
          padding: '14px 20px',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        {/* Arrow buttons */}
        <button
          type="button"
          onClick={handlePrev}
          disabled={!canGoPrev}
          className="p-2 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          style={{
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-secondary)',
          }}
          onMouseEnter={(e) => {
            if (!e.currentTarget.disabled)
              e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
          aria-label="Previous week"
        >
          <ChevronLeft size={16} />
        </button>

        <button
          type="button"
          onClick={handleNext}
          disabled={!canGoNext}
          className="p-2 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          style={{
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-secondary)',
          }}
          onMouseEnter={(e) => {
            if (!e.currentTarget.disabled)
              e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
          aria-label="Next week"
        >
          <ChevronRight size={16} />
        </button>

        {/* Date range label */}
        <h2
          className="flex items-center gap-2"
          style={{
            fontSize: '15px',
            fontWeight: 600,
            lineHeight: '1.4',
            color: 'var(--text-primary)',
          }}
        >
          {selectedWeekId ? formatWeekId(selectedWeekId) : "Loading..."}
          {isCurrentCalendarWeek && (
            <span
              style={{
                fontSize: '11px',
                fontWeight: 500,
                color: 'var(--primary)',
                backgroundColor: 'var(--primary-soft)',
                borderRadius: 'var(--radius-full)',
                padding: '2px 10px',
              }}
            >
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
            className="transition-colors cursor-pointer"
            style={{
              fontSize: '14px',
              padding: '6px 12px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            Today
          </button>
        )}

        {/* +New button */}
        <button
          type="button"
          onClick={onNewWeek}
          className="transition-colors font-medium cursor-pointer"
          style={{
            fontSize: '14px',
            padding: '6px 12px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--primary)',
            color: 'var(--text-on-primary)',
            boxShadow: 'var(--shadow-sm)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--primary-hover)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--primary)';
          }}
        >
          + New
        </button>
      </div>

      {/* "Plan this week?" banner */}
      {showBanner && (
        <div
          className="flex items-center justify-center gap-3"
          style={{
            padding: '12px 20px',
            backgroundColor: 'var(--warning-soft)',
            borderLeft: '3px solid var(--warning)',
            borderRadius: 'var(--radius-md)',
            margin: '12px 20px 0',
          }}
        >
          <span
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--warning)',
            }}
          >
            Plan this week?
          </span>
          <button
            type="button"
            onClick={onNewWeek}
            className="transition-colors font-medium cursor-pointer"
            style={{
              fontSize: '13px',
              padding: '4px 12px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--primary)',
              color: 'var(--text-on-primary)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--primary-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--primary)';
            }}
          >
            Start
          </button>
        </div>
      )}
    </div>
  );
}
