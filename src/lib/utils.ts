/**
 * First Things First - Utility Functions
 *
 * Core utilities for ID generation, date/week calculations.
 */

import type { WeekId } from "@/types";

// ============================================================================
// ID Generation
// ============================================================================

/**
 * Generate a UUID using the native crypto API.
 * Supported in all modern browsers (Chrome 92+, Firefox 95+, Safari 15.4+).
 */
export function generateId(): string {
  return crypto.randomUUID();
}

// ============================================================================
// Week Calculations
// ============================================================================

/**
 * Get the ISO week ID for a given date.
 * Format: "YYYY-Www" (e.g., "2026-W03")
 *
 * ISO week numbering:
 * - Week 1 is the week containing the first Thursday of the year
 * - Weeks start on Monday
 */
export function getWeekId(date: Date): WeekId {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );

  // Set to nearest Thursday: current date + 4 - current day number
  // Make Sunday = 7 instead of 0
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);

  // Get first day of year
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));

  // Calculate week number
  const weekNum = Math.ceil(
    ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
  );

  return `${d.getUTCFullYear()}-W${weekNum.toString().padStart(2, "0")}` as WeekId;
}

/**
 * Get the Monday (week start) for a given date.
 * Returns a new Date set to 00:00:00 of that Monday.
 */
export function getWeekStartDate(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  // Adjust: Sunday (0) becomes -6, Monday (1) becomes 0, etc.
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Parse a WeekId back to the Monday start date.
 * Input: "2026-W03" -> Returns Date for Monday of that week
 */
export function parseWeekId(weekId: WeekId): Date {
  const match = weekId.match(/^(\d{4})-W(\d{2})$/);
  if (!match) {
    throw new Error(`Invalid week ID format: ${weekId}`);
  }

  const year = parseInt(match[1], 10);
  const week = parseInt(match[2], 10);

  // January 4 is always in week 1 (ISO 8601)
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const jan4Day = jan4.getUTCDay() || 7; // Make Sunday = 7

  // Find the Monday of week 1
  const week1Monday = new Date(jan4);
  week1Monday.setUTCDate(jan4.getUTCDate() - jan4Day + 1);

  // Add weeks
  const targetMonday = new Date(week1Monday);
  targetMonday.setUTCDate(week1Monday.getUTCDate() + (week - 1) * 7);

  return targetMonday;
}

/**
 * Format a week ID for human display.
 * Input: "2026-W03" -> "Jan 13-19, 2026"
 */
export function formatWeekId(weekId: WeekId): string {
  const monday = parseWeekId(weekId);
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);

  const monthNames = [
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
  ];

  const monMonth = monthNames[monday.getUTCMonth()];
  const sunMonth = monthNames[sunday.getUTCMonth()];
  const monDay = monday.getUTCDate();
  const sunDay = sunday.getUTCDate();
  const year = monday.getUTCFullYear();

  // Same month
  if (monday.getUTCMonth() === sunday.getUTCMonth()) {
    return `${monMonth} ${monDay}-${sunDay}, ${year}`;
  }

  // Different months (e.g., "Dec 30 - Jan 5, 2026")
  return `${monMonth} ${monDay} - ${sunMonth} ${sunDay}, ${year}`;
}

/**
 * Get the current week ID based on today's date.
 */
export function getCurrentWeekId(): WeekId {
  return getWeekId(new Date());
}

/**
 * Get the next week ID from a given week ID.
 */
export function getNextWeekId(weekId: WeekId): WeekId {
  const monday = parseWeekId(weekId);
  monday.setUTCDate(monday.getUTCDate() + 7);
  return getWeekId(monday);
}

/**
 * Get the previous week ID from a given week ID.
 */
export function getPreviousWeekId(weekId: WeekId): WeekId {
  const monday = parseWeekId(weekId);
  monday.setUTCDate(monday.getUTCDate() - 7);
  return getWeekId(monday);
}

// ============================================================================
// Time Slot Calculations
// ============================================================================

/**
 * Convert a time slot index to a time string.
 * Input: 0 -> "8:00", 1 -> "8:30", 2 -> "9:00", etc.
 */
export function slotToTime(slot: number): string {
  const hour = Math.floor(slot / 2) + 8;
  const minute = (slot % 2) * 30;
  return `${hour}:${minute.toString().padStart(2, "0")}`;
}

/**
 * Convert a time string to a slot index.
 * Input: "8:00" -> 0, "8:30" -> 1, "9:00" -> 2, etc.
 * Returns -1 if outside valid range.
 */
export function timeToSlot(time: string): number {
  const [hourStr, minStr] = time.split(":");
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minStr, 10);

  if (hour < 8 || hour > 19 || (hour === 19 && minute > 30)) {
    return -1;
  }

  return (hour - 8) * 2 + (minute >= 30 ? 1 : 0);
}

// ============================================================================
// Day Index Helpers
// ============================================================================

/**
 * Day names indexed by DayOfWeek (0 = Sunday)
 */
export const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

/**
 * Short day names indexed by DayOfWeek (0 = Sunday)
 */
export const DAY_NAMES_SHORT = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
] as const;

/**
 * Get the date for a specific day within a week.
 * @param weekStartDate - Monday of the week
 * @param dayIndex - 0-6 (Sunday-Saturday)
 */
export function getDateForDayIndex(weekStartDate: Date, dayIndex: number): Date {
  const result = new Date(weekStartDate);
  // weekStartDate is Monday (dayIndex would be 1 in a Sunday-start week)
  // Adjust: Monday = 1, Tuesday = 2, ..., Saturday = 6, Sunday = 0 -> +6
  const offset = dayIndex === 0 ? 6 : dayIndex - 1;
  result.setDate(result.getDate() + offset);
  return result;
}
