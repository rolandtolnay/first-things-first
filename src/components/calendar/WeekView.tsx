"use client";

/**
 * WeekView - 7-day week container with navigation and day columns
 *
 * Main calendar visualization showing all 7 days in a horizontal grid.
 * Handles initial week selection: auto-creates on first-ever use,
 * otherwise navigates to the latest existing week.
 */

import { useEffect, useState, useRef } from "react";
import type { DayOfWeek } from "@/types";
import { getCurrentWeekId, getWeekDates } from "@/lib/utils";
import { db } from "@/lib/db";
import { useWeekStore } from "@/stores/weekStore";
import { DayColumn } from "./DayColumn";
import { WeekNavigation } from "./WeekNavigation";
import { CarryoverDialog } from "./CarryoverDialog";

export function WeekView() {
  const selectedWeekId = useWeekStore((s) => s.selectedWeekId);
  const currentWeek = useWeekStore((s) => s.currentWeek);
  const isLoading = useWeekStore((s) => s.isLoading);
  const navigateToWeek = useWeekStore((s) => s.navigateToWeek);
  const createNewWeek = useWeekStore((s) => s.createNewWeek);

  const [isCarryoverOpen, setIsCarryoverOpen] = useState(false);
  const initializedRef = useRef(false);

  function openCarryover() {
    setIsCarryoverOpen(true);
  }

  function closeCarryover() {
    setIsCarryoverOpen(false);
  }

  // On mount, determine initial week
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    async function init() {
      const count = await db.weeks.count();

      if (count === 0) {
        // First-ever use: auto-create the current week
        const weekId = getCurrentWeekId();
        await createNewWeek(weekId, {});
        await navigateToWeek(weekId);
      } else {
        // Navigate to the latest existing week
        const keys = await db.weeks
          .orderBy("id")
          .reverse()
          .limit(1)
          .primaryKeys();
        if (keys.length > 0) {
          await navigateToWeek(keys[0]);
        }
      }
    }

    init();
  }, [createNewWeek, navigateToWeek]);

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
      />

      {/* Day columns */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-7 min-w-[1000px] h-full">
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
  );
}
