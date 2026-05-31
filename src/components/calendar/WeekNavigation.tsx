"use client";

import type { ReactNode } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useWeekStore } from "@/stores/weekStore";
import { formatWeekId, getCurrentWeekId, getWeekDates } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { TabPill } from "@/components/ui/TabPill";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import type { WeekId } from "@/types";

interface WeekNavigationProps {
  onNewWeek: () => void;
  actions?: ReactNode;
}

export function WeekNavigation({ onNewWeek, actions }: WeekNavigationProps) {
  const selectedWeekId = useWeekStore((s) => s.selectedWeekId);
  const navigateToWeek = useWeekStore((s) => s.navigateToWeek);

  const weekIds = useWeekStore((s) => s.availableWeekIds);

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

  const weekLabel = selectedWeekId
    ? formatWeekTabLabel(selectedWeekId)
    : "Loading…";

  return (
    <div className="shrink-0">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center border-b border-border px-4 py-3">
        {/* Left: active-week tab pill */}
        <div className="flex items-center gap-2.5">
          <TabPill
            active
            icon={<Calendar strokeWidth={1.4} />}
            onAdd={onNewWeek}
          >
            {weekLabel}
          </TabPill>
          {showBanner && (
            <Button variant="link" className="h-auto p-0 text-caption" onClick={onNewWeek}>
              Plan this week?
            </Button>
          )}
        </div>

        {/* Center: prev / TODAY / next */}
        <div className="flex items-center gap-1 justify-self-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handlePrev}
                disabled={!canGoPrev}
                aria-label="Previous week"
              >
                <ChevronLeft className="size-3.5" strokeWidth={1.4} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Previous week</TooltipContent>
          </Tooltip>

          <button
            type="button"
            onClick={handleToday}
            className="rounded-md border border-border px-2.5 py-1 font-mono text-label uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:border-border-emphasis hover:bg-card-hover hover:text-foreground"
          >
            Today
          </button>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleNext}
                disabled={!canGoNext}
                aria-label="Next week"
              >
                <ChevronRight className="size-3.5" strokeWidth={1.4} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Next week</TooltipContent>
          </Tooltip>
        </div>

        {/* Right: new-week action + compact global controls */}
        <div className="flex items-center gap-2 justify-self-end">
          {!isCurrentCalendarWeek && !showBanner && (
            <span className="font-mono text-label uppercase tracking-[0.12em] text-muted-foreground tabular-nums max-[1180px]:hidden">
              {selectedWeekId ? formatWeekId(selectedWeekId) : ""}
            </span>
          )}
          <Button variant="outline" size="sm" onClick={onNewWeek}>
            + New
          </Button>
          {actions && (
            <>
              <div className="h-5 w-px bg-border" aria-hidden="true" />
              {actions}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

function formatWeekTabLabel(weekId: WeekId): string {
  const [monday] = getWeekDates(weekId);
  return `Week of ${MONTH_NAMES[monday.getUTCMonth()]} ${monday.getUTCDate()}`;
}
