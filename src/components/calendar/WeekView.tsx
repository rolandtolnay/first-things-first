"use client";

/**
 * WeekView - 7-day week container with day columns
 *
 * Main calendar visualization showing all 7 days in a horizontal grid.
 * Each day column contains priorities, time slots (8:00-20:00), and evening slot.
 */

import { useEffect } from "react";
import type { WeekId, DayOfWeek } from "@/types";
import { getCurrentWeekId, getWeekDates } from "@/lib/utils";
import { useWeekStore } from "@/stores/weekStore";
import { DayColumn } from "./DayColumn";

interface WeekViewProps {
  weekId?: WeekId;
}

export function WeekView({ weekId }: WeekViewProps) {
  // Use provided weekId or get current week
  const currentWeekId = weekId ?? getCurrentWeekId();
  const dates = getWeekDates(currentWeekId);
  const loadWeek = useWeekStore((state) => state.loadWeek);

  // Load week data on mount or when weekId changes
  useEffect(() => {
    loadWeek(currentWeekId);
  }, [currentWeekId, loadWeek]);

  return (
    <div className="h-full flex flex-col">
      {/* Week header with date range */}
      <div className="p-4 border-b border-border shrink-0">
        <h2 className="text-lg font-semibold">
          Week of{" "}
          {dates[1].toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
          })}
        </h2>
      </div>

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
