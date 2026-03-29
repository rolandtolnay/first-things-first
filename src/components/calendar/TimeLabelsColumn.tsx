"use client";

/**
 * TimeLabelsColumn - Shared time labels shown once on the left side
 *
 * Renders hour labels (8:00-19:00) in a narrow column that aligns
 * vertically with the TimeGrid slots in each DayColumn. Includes
 * spacers matching the day header and DayPriorities sections.
 */

const SLOT_COUNT = 24; // 8:00-19:30, 30-minute intervals

export function TimeLabelsColumn() {
  const slots = Array.from({ length: SLOT_COUNT }, (_, i) => i);

  return (
    <div className="flex-shrink-0 flex flex-col" style={{ width: '3rem' }}>
      {/* Header spacer - matches DayColumn sticky header */}
      <div
        className="p-2 sticky top-0 z-10"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        {/* Invisible content matching day header structure */}
        <div style={{ fontSize: '12px', lineHeight: '1.4' }}>&nbsp;</div>
        <div className="mt-0.5">
          <span style={{ fontSize: '14px' }}>&nbsp;</span>
        </div>
      </div>

      {/* DayPriorities spacer - matches empty DayPriorities min height */}
      <div
        className="min-h-[80px]"
        style={{
          borderBottom: '1px solid var(--border-subtle)',
        }}
      />

      {/* Time labels - each slot is h-8 (32px), labels at hour boundaries */}
      <div className="flex-1">
        {slots.map((slotIndex) => {
          const isHourStart = slotIndex % 2 === 0;
          const hour = 8 + Math.floor(slotIndex / 2);

          return (
            <div
              key={slotIndex}
              className="h-8 flex items-start justify-end pr-2"
              style={{
                fontSize: '12px',
                fontWeight: 500,
                lineHeight: '1.4',
                letterSpacing: '0.01em',
                color: 'var(--text-muted)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {isHourStart && `${hour}:00`}
            </div>
          );
        })}
      </div>

      {/* Evening spacer - matches EveningSlot min height */}
      <div
        className="min-h-[48px]"
        style={{
          borderTop: '1px solid var(--border-subtle)',
        }}
      />
    </div>
  );
}
