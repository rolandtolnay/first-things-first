import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { WeekId } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ============================================================================
// ID Generation
// ============================================================================

export function generateId(): string {
  return crypto.randomUUID();
}

// ============================================================================
// Week Calculations
// ============================================================================

export function getWeekId(date: Date): WeekId {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );

  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);

  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));

  const weekNum = Math.ceil(
    ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
  );

  return `${d.getUTCFullYear()}-W${weekNum.toString().padStart(2, "0")}` as WeekId;
}

export function getWeekStartDate(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function parseWeekId(weekId: WeekId): Date {
  const match = weekId.match(/^(\d{4})-W(\d{2})$/);
  if (!match) {
    throw new Error(`Invalid week ID format: ${weekId}`);
  }

  const year = parseInt(match[1], 10);
  const week = parseInt(match[2], 10);

  const jan4 = new Date(Date.UTC(year, 0, 4));
  const jan4Day = jan4.getUTCDay() || 7;

  const week1Monday = new Date(jan4);
  week1Monday.setUTCDate(jan4.getUTCDate() - jan4Day + 1);

  const targetMonday = new Date(week1Monday);
  targetMonday.setUTCDate(week1Monday.getUTCDate() + (week - 1) * 7);

  return targetMonday;
}

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const;

export function formatWeekId(weekId: WeekId): string {
  const monday = parseWeekId(weekId);

  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);

  const monMonth = MONTH_NAMES[monday.getUTCMonth()];
  const sunMonth = MONTH_NAMES[sunday.getUTCMonth()];
  const monDay = monday.getUTCDate();
  const sunDay = sunday.getUTCDate();
  const year = sunday.getUTCFullYear();

  if (monday.getUTCMonth() === sunday.getUTCMonth()) {
    return `${monMonth} ${monDay}-${sunDay}, ${year}`;
  }

  return `${monMonth} ${monDay} - ${sunMonth} ${sunDay}, ${year}`;
}

export function getCurrentWeekId(): WeekId {
  return getWeekId(new Date());
}

export function getWeekNumber(weekId: WeekId): number {
  const match = weekId.match(/^(\d{4})-W(\d{2})$/);
  if (!match) {
    throw new Error(`Invalid week ID format: ${weekId}`);
  }
  return parseInt(match[2], 10);
}

export function getWeekIdRange(startWeekId: WeekId, count: number): WeekId[] {
  const result: WeekId[] = [startWeekId];
  let current = startWeekId;
  for (let i = 1; i < count; i++) {
    current = getNextWeekId(current);
    result.push(current);
  }
  return result;
}

export function getNextWeekId(weekId: WeekId): WeekId {
  const monday = parseWeekId(weekId);
  monday.setUTCDate(monday.getUTCDate() + 7);
  return getWeekId(monday);
}

export function getPreviousWeekId(weekId: WeekId): WeekId {
  const monday = parseWeekId(weekId);
  monday.setUTCDate(monday.getUTCDate() - 7);
  return getWeekId(monday);
}

export function getWeekDates(weekId: WeekId): Date[] {
  const monday = parseWeekId(weekId);

  return Array.from({ length: 7 }, (_, dayIndex) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + dayIndex);
    return date;
  });
}

// Time slot ↔ clock conversions now live in @/lib/time-model.

// ============================================================================
// Day Index Helpers
// ============================================================================

export const DAY_NAMES = [
  "Monday", "Tuesday", "Wednesday", "Thursday",
  "Friday", "Saturday", "Sunday",
] as const;

export const DAY_NAMES_SHORT = [
  "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun",
] as const;

export function getDateForDayIndex(weekStartDate: Date, dayIndex: number): Date {
  const result = new Date(weekStartDate);
  result.setDate(result.getDate() + dayIndex);
  return result;
}

export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}
