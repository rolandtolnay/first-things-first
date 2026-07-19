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

/** Default first hour shown on the grid (8:00). */
export const DAY_START_HOUR = 8;
/** Default exclusive end of the grid day (20:00). */
export const DAY_END_HOUR = 20;
/** 30-minute slots per hour. */
export const SLOTS_PER_HOUR = 2;
/** Minutes covered by one slot. */
export const MINUTES_PER_SLOT = 30;
/** Hours covered by one slot (duration weighting). */
export const HOURS_PER_SLOT = 0.5;
/** Hours an evening block contributes to role balance (it has no duration). */
export const EVENING_BLOCK_HOURS = 1;

// ============================================================================
// Day bounds — the configurable start/end of a Week's planning day
// ============================================================================

/**
 * A Week's grid window in whole hours; `endHour` is exclusive. Slot 0 always
 * means `startHour`:00, so changing bounds re-indexes existing blocks (the
 * store owns that shift — see updateDayBounds).
 */
export interface DayBounds {
  startHour: number;
  endHour: number;
}

export const DEFAULT_DAY_BOUNDS: DayBounds = {
  startHour: DAY_START_HOUR,
  endHour: DAY_END_HOUR,
};

/** Settings limits: the day may start 5:00–12:00 and end 16:00–24:00. */
export const EARLIEST_DAY_START_HOUR = 5;
export const LATEST_DAY_START_HOUR = 12;
export const EARLIEST_DAY_END_HOUR = 16;
export const LATEST_DAY_END_HOUR = 24;

/** True when the pair is a whole-hour window this product supports. */
export function isValidDayBounds(bounds: DayBounds): boolean {
  return (
    Number.isInteger(bounds.startHour) &&
    Number.isInteger(bounds.endHour) &&
    bounds.startHour >= EARLIEST_DAY_START_HOUR &&
    bounds.startHour <= LATEST_DAY_START_HOUR &&
    bounds.endHour >= EARLIEST_DAY_END_HOUR &&
    bounds.endHour <= LATEST_DAY_END_HOUR &&
    bounds.startHour < bounds.endHour
  );
}

/**
 * The bounds a Week plans under. Structural parameter (not the Week type) so
 * this module stays dependency-free of app types.
 */
export function weekDayBounds(
  week: { dayBounds?: DayBounds } | null | undefined
): DayBounds {
  const bounds = week?.dayBounds;
  return bounds && isValidDayBounds(bounds) ? bounds : DEFAULT_DAY_BOUNDS;
}

/** Total slots in a day under the given bounds (default 24: 8:00–20:00). */
export function totalSlots(bounds: DayBounds = DEFAULT_DAY_BOUNDS): number {
  return (bounds.endHour - bounds.startHour) * SLOTS_PER_HOUR;
}

/** Highest valid slot index under the given bounds. */
export function maxSlotIndex(bounds: DayBounds = DEFAULT_DAY_BOUNDS): number {
  return totalSlots(bounds) - 1;
}

/** Total slots under the default 8:00–20:00 bounds. */
export const TOTAL_SLOTS = totalSlots();
/** Highest valid slot index under the default bounds (23, i.e. 19:30). */
export const MAX_SLOT_INDEX = maxSlotIndex();

/** Maximum block duration in slots (8 hours = 16 × 30-min slots). */
export const MAX_BLOCK_SLOTS = 16;
/** Minimum committed block duration in slots (1 hour) — the draw/drop floor. */
export const MIN_BLOCK_SLOTS = 2;
/** Default duration in slots for a freshly created block (1 hour). */
export const DEFAULT_BLOCK_SLOTS = 2;

/** Height of one 30-minute slot row in pixels on the grid. */
export const SLOT_HEIGHT = 24;
/** Total height of the time grid under the given bounds. */
export function gridHeight(bounds: DayBounds = DEFAULT_DAY_BOUNDS): number {
  return totalSlots(bounds) * SLOT_HEIGHT;
}
/** Total height of the default 8:00–20:00 time grid. */
export const TIME_GRID_HEIGHT = gridHeight();

// ============================================================================
// Slot ↔ Clock conversions
// ============================================================================

/**
 * Convert a slot index to a clock string ("H:MM") under the given bounds.
 * Default bounds: slot 0 → "8:00", slot 1 → "8:30", slot 23 → "19:30".
 */
export function slotToTime(
  slot: number,
  bounds: DayBounds = DEFAULT_DAY_BOUNDS
): string {
  const hour = Math.floor(slot / SLOTS_PER_HOUR) + bounds.startHour;
  const minute = (slot % SLOTS_PER_HOUR) * MINUTES_PER_SLOT;
  return `${hour}:${minute.toString().padStart(2, "0")}`;
}

/**
 * Convert a clock string ("H:MM") to a slot index under the given bounds.
 * Returns -1 for times outside the grid window.
 */
export function timeToSlot(
  time: string,
  bounds: DayBounds = DEFAULT_DAY_BOUNDS
): number {
  const [hourStr, minStr] = time.split(":");
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minStr, 10);

  // Last hour with valid slots is endHour - 1; its half-hour is the final slot.
  const lastHour = bounds.endHour - 1;
  if (
    hour < bounds.startHour ||
    hour > lastHour ||
    (hour === lastHour && minute > MINUTES_PER_SLOT)
  ) {
    return -1;
  }

  return (
    (hour - bounds.startHour) * SLOTS_PER_HOUR +
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
 * Float math preserved exactly: ((h - startHour)*60 + m) / MINUTES_PER_SLOT * SLOT_HEIGHT.
 */
export function timeToPixels(
  hours: number,
  minutes: number,
  bounds: DayBounds = DEFAULT_DAY_BOUNDS
): number {
  return (
    ((hours - bounds.startHour) * 60 + minutes) / MINUTES_PER_SLOT * SLOT_HEIGHT
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
export function slotToHourLabel(
  slot: number,
  bounds: DayBounds = DEFAULT_DAY_BOUNDS
): number {
  return bounds.startHour + Math.floor(slot / SLOTS_PER_HOUR);
}

/** Structured block metadata parts, e.g. ["10:30", "2h"]. */
export function formatBlockMetaParts(
  startSlot: number,
  duration: number,
  bounds: DayBounds = DEFAULT_DAY_BOUNDS
): string[] {
  return [slotToTime(startSlot, bounds), `${slotsToHours(duration)}h`];
}

/** Human-readable block metadata, e.g. "10:30 · 2h". */
export function formatBlockMeta(
  startSlot: number,
  duration: number,
  bounds: DayBounds = DEFAULT_DAY_BOUNDS
): string {
  return formatBlockMetaParts(startSlot, duration, bounds).join(" · ");
}
