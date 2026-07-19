"use client";

import {
  EVENING_SECTION_HEIGHT,
  HEADER_HEIGHT,
  PRIORITIES_SECTION_HEIGHT,
  TIME_LABELS_WIDTH,
} from "@/lib/constants";
import {
  gridHeight,
  slotIsHourStart,
  slotToHourLabel,
  slotToPixels,
  totalSlots,
  weekDayBounds,
} from "@/lib/time-model";
import { useWeekStore } from "@/stores/weekStore";

export function TimeLabelsColumn() {
  const dayBounds = useWeekStore((state) => weekDayBounds(state.currentWeek));

  // Only hour-start slots carry a label; positioned absolutely against the grid
  // so they stay in lockstep with the day-column hour lines.
  const hourSlots = Array.from({ length: totalSlots(dayBounds) }, (_, i) => i).filter(
    slotIsHourStart
  );

  return (
    <div
      className="flex-shrink-0 sticky left-0 z-20 flex flex-col"
      style={{
        width: `${TIME_LABELS_WIDTH}px`,
        backgroundColor: "var(--ds-window)",
        borderRight: "1px solid var(--ds-line)",
      }}
    >
      {/* Header spacer — matches the day-column header height */}
      <div
        className="border-b border-border"
        style={{ height: `${HEADER_HEIGHT}px` }}
      />

      {/* Priorities row label */}
      <div
        className="relative border-b border-border"
        style={{ height: `${PRIORITIES_SECTION_HEIGHT}px` }}
      >
        <div className="absolute inset-y-0 right-1.5 flex items-center">
          <span
            className="whitespace-nowrap font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-secondary-foreground"
            style={{ writingMode: "sideways-lr" }}
          >
            Priorities
          </span>
        </div>
      </div>

      {/* Time labels — absolutely positioned over a slot-height grid */}
      <div
        className="relative flex-none"
        style={{ height: `${gridHeight(dayBounds)}px` }}
      >
        {hourSlots.map((slotIndex) => {
          const hour = slotToHourLabel(slotIndex, dayBounds);
          return (
            <div
              key={slotIndex}
              className="absolute flex items-baseline gap-px font-mono text-[10px] tabular-nums"
              style={{ top: `${slotToPixels(slotIndex) + 1}px`, right: 6 }}
            >
              <span className="text-muted-foreground">
                {String(hour).padStart(2, "0")}
              </span>
              <span style={{ color: "var(--ds-fg-dim)" }}>:00</span>
            </div>
          );
        })}
      </div>

      {/* Evening spacer */}
      <div
        style={{
          height: `${EVENING_SECTION_HEIGHT}px`,
          borderTop: "1px solid var(--ds-line)",
        }}
      />
    </div>
  );
}
