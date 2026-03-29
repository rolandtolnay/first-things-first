"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { useWeekStore } from "@/stores/weekStore";
import { formatWeekId, getCurrentWeekId } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import type { WeekId } from "@/types";

interface WeekNavigationProps {
  onNewWeek: () => void;
}

export function WeekNavigation({ onNewWeek }: WeekNavigationProps) {
  const selectedWeekId = useWeekStore((s) => s.selectedWeekId);
  const navigateToWeek = useWeekStore((s) => s.navigateToWeek);

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
    if (canGoPrev) navigateToWeek(weekIds[currentIndex - 1]);
  }

  function handleNext() {
    if (canGoNext) navigateToWeek(weekIds[currentIndex + 1]);
  }

  function handleToday() {
    if (currentCalendarWeekExists) {
      navigateToWeek(currentCalendarWeekId);
    } else if (weekIds.length > 0) {
      navigateToWeek(weekIds[weekIds.length - 1]);
    }
  }

  const showBanner = weekIds.length > 0 && !currentCalendarWeekExists;

  return (
    <div className="shrink-0">
      <div
        className="flex items-center gap-3 px-5 py-2 border-b border-border"
      >
        {/* Arrow buttons */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrev}
              disabled={!canGoPrev}
              aria-label="Previous week"
            >
              <ChevronLeft className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Previous week</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNext}
              disabled={!canGoNext}
              aria-label="Next week"
            >
              <ChevronRight className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Next week</TooltipContent>
        </Tooltip>

        {/* Date range label */}
        <h2 className="flex items-center gap-2 text-[15px] font-semibold text-foreground">
          {selectedWeekId ? formatWeekId(selectedWeekId) : "Loading..."}
          {isCurrentCalendarWeek && (
            <Badge variant="secondary">This week</Badge>
          )}
        </h2>

        <div className="flex-1" />

        {/* Today / Plan this week? */}
        {showBanner ? (
          <Button variant="link" onClick={onNewWeek}>
            Plan this week?
          </Button>
        ) : !isCurrentCalendarWeek ? (
          <Button variant="outline" onClick={handleToday}>
            Today
          </Button>
        ) : null}

        {/* +New button */}
        <Button onClick={onNewWeek}>+ New</Button>
      </div>
    </div>
  );
}
