// SLOT_HEIGHT now lives in @/lib/time-model (single owner of the time domain).

// Day-column section heights (px). The TimeLabelsColumn spacers consume the
// same constants so hour labels stay in lockstep with the grid — keep them
// matched to the day-column sections or labels drift off the grid.
export const HEADER_HEIGHT = 52;
export const PRIORITIES_SECTION_HEIGHT = 108;
export const EVENING_SECTION_HEIGHT = 80;

/** Width of the sticky time-labels gutter (px). */
export const TIME_LABELS_WIDTH = 52;

export const MAX_PRIORITIES_PER_DAY = 2;

/** Weekly planning target used by the Rail's Week Metrics (not user-configurable). */
export const WEEKLY_TARGET_HOURS = 40;
