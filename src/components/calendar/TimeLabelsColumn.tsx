"use client";

import { EVENING_SECTION_HEIGHT, PRIORITIES_SECTION_HEIGHT, TIME_LABELS_WIDTH } from "@/lib/constants";
import { TOTAL_SLOTS, slotIsHourStart, slotToHourLabel } from "@/lib/time-model";

export function TimeLabelsColumn() {
  const slots = Array.from({ length: TOTAL_SLOTS }, (_, i) => i);

  return (
    <div className="flex-shrink-0 flex flex-col" style={{ width: `${TIME_LABELS_WIDTH}px` }}>
      {/* Header spacer */}
      <div className="sticky top-0 z-10 bg-card h-[56px]" />

      {/* TOP label */}
      <div
        className="flex items-start justify-end pr-2 pt-2 text-label font-bold tracking-[0.06em] text-muted-foreground uppercase"
        style={{ height: `${PRIORITIES_SECTION_HEIGHT}px` }}
      >
        TOP
      </div>

      {/* Time labels */}
      <div className="flex-1">
        {slots.map((slotIndex) => {
          const isHourStart = slotIsHourStart(slotIndex);
          const hour = slotToHourLabel(slotIndex);

          return (
            <div
              key={slotIndex}
              className="h-7 flex items-start justify-end pr-2 text-label font-medium text-muted-foreground tabular-nums"
            >
              {isHourStart && `${hour}:00`}
            </div>
          );
        })}
      </div>

      {/* EVE label */}
      <div
        className="flex items-start justify-end pr-2 pt-2 text-label font-semibold tracking-[0.04em] text-muted-foreground uppercase"
        style={{ height: `${EVENING_SECTION_HEIGHT}px` }}
      >
        EVE
      </div>
    </div>
  );
}
