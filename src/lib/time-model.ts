/**
 * Time Model — single owner of the time domain.
 *
 * Maps the planner's abstract "slot" coordinate (a 30-minute interval starting
 * at 8:00) onto every other representation the UI needs: clock strings, hours
 * for role-balance weighting, and pixel offsets on the grid.
 *
 * Kept dependency-free of app types so the conversions stay trivially
 * unit-testable without React, dnd-kit, or IndexedDB.
 */

// ============================================================================
// Constants
// ============================================================================

/** First hour shown on the grid (8:00). */
export const DAY_START_HOUR = 8;
/** Exclusive end of the grid day (20:00). */
export const DAY_END_HOUR = 20;
/** 30-minute slots per hour. */
export const SLOTS_PER_HOUR = 2;
/** Minutes covered by one slot. */
export const MINUTES_PER_SLOT = 30;
/** Hours covered by one slot (duration weighting). */
export const HOURS_PER_SLOT = 0.5;
/** Hours an evening block contributes to role balance (it has no duration). */
export const EVENING_BLOCK_HOURS = 1;

/** Total slots in a day (24 × 30-min slots covering 8:00-20:00). */
export const TOTAL_SLOTS = 24;
/** Highest valid slot index (TOTAL_SLOTS - 1 = 23, i.e. 19:30). */
export const MAX_SLOT_INDEX = 23;

/** Maximum block duration in slots (8 hours = 16 × 30-min slots). */
export const MAX_BLOCK_SLOTS = 16;
/** Minimum committed block duration in slots (1 hour) — the draw/drop floor. */
export const MIN_BLOCK_SLOTS = 2;
/** Default duration in slots for a freshly created block (1 hour). */
export const DEFAULT_BLOCK_SLOTS = 2;

/** Height of one 30-minute slot row in pixels on the grid. */
export const SLOT_HEIGHT = 24;
/** Total height of the visible 8:00–20:00 time grid. */
export const TIME_GRID_HEIGHT = TOTAL_SLOTS * SLOT_HEIGHT;

// ============================================================================
// Slot ↔ Clock conversions
// ============================================================================

/**
 * Convert a slot index to a clock string ("H:MM").
 * slot 0 → "8:00", slot 1 → "8:30", slot 23 → "19:30".
 */
export function slotToTime(slot: number): string {
  const hour = Math.floor(slot / SLOTS_PER_HOUR) + DAY_START_HOUR;
  const minute = (slot % SLOTS_PER_HOUR) * MINUTES_PER_SLOT;
  return `${hour}:${minute.toString().padStart(2, "0")}`;
}

/**
 * Convert a clock string ("H:MM") to a slot index.
 * Returns -1 for times outside the 8:00-19:30 grid window.
 */
export function timeToSlot(time: string): number {
  const [hourStr, minStr] = time.split(":");
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minStr, 10);

  // Last hour with valid slots is 19 (DAY_END_HOUR - 1); 19:30 is the final slot.
  const lastHour = DAY_END_HOUR - 1;
  if (
    hour < DAY_START_HOUR ||
    hour > lastHour ||
    (hour === lastHour && minute > MINUTES_PER_SLOT)
  ) {
    return -1;
  }

  return (
    (hour - DAY_START_HOUR) * SLOTS_PER_HOUR +
    (minute >= MINUTES_PER_SLOT ? 1 : 0)
  );
}

// ============================================================================
// Duration weighting
// ============================================================================

/** Convert a slot count to hours (e.g. 2 slots → 1 hour). */
export function slotsToHours(slots: number): number {
  return slots * HOURS_PER_SLOT;
}

// ============================================================================
// Pixel ↔ Slot conversions
//
// Two named functions instead of one with a mode flag so the Math.floor /
// Math.round distinction can't be swapped by accident:
//   - floor: "which slot does this Y fall inside" (draw start)
//   - round: "nearest slot boundary"             (resize / draw-move)
// Callers compute relativeY = clientY - rect.top themselves.
// ============================================================================

/** Which slot does this Y offset fall inside (draw start). */
export function pixelToSlotFloor(relativeY: number): number {
  return Math.floor(relativeY / SLOT_HEIGHT);
}

/** Nearest slot boundary to this Y offset (resize / draw-move end). */
export function pixelToSlotRound(relativeY: number): number {
  return Math.round(relativeY / SLOT_HEIGHT);
}

/** Top offset in pixels for a slot index. */
export function slotToPixels(slot: number): number {
  return slot * SLOT_HEIGHT;
}

/** Height in pixels for a duration in slots. */
export function durationToPixels(slots: number): number {
  return slots * SLOT_HEIGHT;
}

/**
 * Pixel offset for a wall-clock time (current-time line).
 * Float math preserved exactly: ((h - DAY_START_HOUR)*60 + m) / MINUTES_PER_SLOT * SLOT_HEIGHT.
 */
export function timeToPixels(hours: number, minutes: number): number {
  return (
    ((hours - DAY_START_HOUR) * 60 + minutes) / MINUTES_PER_SLOT * SLOT_HEIGHT
  );
}

// ============================================================================
// Hour-label helpers
// ============================================================================

/** True when a slot sits on an hour boundary (used for grid lines / labels). */
export function slotIsHourStart(slot: number): boolean {
  return slot % SLOTS_PER_HOUR === 0;
}

/** Integer hour for a slot's label (e.g. slot 0 → 8). Caller formats `${hour}:00`. */
export function slotToHourLabel(slot: number): number {
  return DAY_START_HOUR + Math.floor(slot / SLOTS_PER_HOUR);
}

/** Human-readable block metadata, e.g. "10:30 · 2h". */
export function formatBlockMeta(startSlot: number, duration: number): string {
  return `${slotToTime(startSlot)} · ${slotsToHours(duration)}h`;
}
