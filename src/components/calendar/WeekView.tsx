"use client";

/**
 * WeekView - 7-day week container with navigation and day columns
 *
 * Main calendar visualization showing all 7 days in a horizontal grid.
 * Initial week selection is owned by the store's bootstrap() (triggered by
 * AuthProvider when the User signs in); this component just reads currentWeek /
 * selectedWeekId from the store and renders.
 */

import { useState } from "react";
import type { DayOfWeek } from "@/types";
import { getWeekDates } from "@/lib/utils";
import { useWeekStore } from "@/stores/weekStore";
import { DayColumn } from "./DayColumn";
import { TimeLabelsColumn } from "./TimeLabelsColumn";
import { WeekNavigation } from "./WeekNavigation";
import { CarryoverDialog } from "./CarryoverDialog";

export function WeekView() {
  const selectedWeekId = useWeekStore((s) => s.selectedWeekId);
  const currentWeek = useWeekStore((s) => s.currentWeek);
  const isLoading = useWeekStore((s) => s.isLoading);

  const [isCarryoverOpen, setIsCarryoverOpen] = useState(false);

  function openCarryover() {
    setIsCarryoverOpen(true);
  }

  function closeCarryover() {
    setIsCarryoverOpen(false);
  }

  // Derive dates from selectedWeekId
  const dates = selectedWeekId ? getWeekDates(selectedWeekId) : null;

  // Guard: show nothing meaningful until initialized
  if (!selectedWeekId || !dates) {
    return <div className="h-full flex flex-col" />;
  }

  // If currentWeek is null and not loading, the selected week doesn't exist in DB
  // (shouldn't happen with navigation only between existing weeks, but guard anyway)
  if (!currentWeek && !isLoading) {
    return (
      <div className="h-full flex flex-col">
        <WeekNavigation onNewWeek={openCarryover} />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Navigation header */}
      <WeekNavigation onNewWeek={openCarryover} />

      {/* Carryover dialog */}
      <CarryoverDialog
        open={isCarryoverOpen}
        onClose={closeCarryover}
        sourceWeek={currentWeek}
        viewedWeekId={selectedWeekId}
      />

      {/* Day columns with shared time labels */}
      <div className="flex-1 overflow-auto">
        <div className="flex min-w-[1000px] min-h-full pb-8">
          {/* Shared time labels column */}
          <TimeLabelsColumn />

          {/* Day columns */}
          <div className="grid grid-cols-7 flex-1">
            {dates.map((date, index) => (
              <DayColumn
                key={index}
                dayIndex={index as DayOfWeek}
                date={date}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
