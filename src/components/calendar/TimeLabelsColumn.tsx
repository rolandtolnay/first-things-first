"use client";

import { PRIORITIES_SECTION_HEIGHT, EVENING_SECTION_HEIGHT, TIME_LABELS_WIDTH } from "@/lib/constants";

const SLOT_COUNT = 24;

export function TimeLabelsColumn() {
  const slots = Array.from({ length: SLOT_COUNT }, (_, i) => i);

  return (
    <div className="flex-shrink-0 flex flex-col" style={{ width: `${TIME_LABELS_WIDTH}px` }}>
      {/* Header spacer */}
      <div className="sticky top-0 z-10 bg-card h-[35px] border-b border-border" />

      {/* TOP label */}
      <div
        className="flex items-center justify-end pr-2 text-[11px] text-muted-foreground uppercase border-b border-border"
        style={{ height: `${PRIORITIES_SECTION_HEIGHT}px` }}
      >
        TOP
      </div>

      {/* Time labels */}
      <div className="flex-1">
        {slots.map((slotIndex) => {
          const isHourStart = slotIndex % 2 === 0;
          const hour = 8 + Math.floor(slotIndex / 2);

          return (
            <div
              key={slotIndex}
              className="h-7 flex items-start justify-end pr-2 text-[11px] font-medium text-muted-foreground tabular-nums"
            >
              {isHourStart && `${hour}:00`}
            </div>
          );
        })}
      </div>

      {/* EVE label */}
      <div
        className="flex items-center justify-end pr-2 text-[11px] text-muted-foreground uppercase border-t border-border"
        style={{ height: `${EVENING_SECTION_HEIGHT}px` }}
      >
        EVE
      </div>
    </div>
  );
}
