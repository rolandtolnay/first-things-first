/**
 * Pure mapping between a `weeks` row and a `Week`.
 *
 * The row promotes only the columns needed for ownership, filtering, and sorting
 * (`id`, `user_id`, `start_date`, `created_at`, `updated_at`); the whole Week
 * snapshot is carried verbatim in `data` (ADR-0004). Because `data` IS the
 * snapshot, the reverse mapping reads straight from it — the promoted columns
 * are derived projections, never a second source of truth.
 *
 * No Supabase imports here on purpose: this is the isolation-testable core, and
 * the adapter in `db.ts` is the thin I/O around it.
 */

import type { Week, WeekId } from "@/types";

/** A row of the `public.weeks` table. */
export interface WeekRow {
  /** WeekId — unique per user (the table PK is composite `(user_id, id)`). */
  id: string;
  /** Owner; matches `auth.uid()` under RLS. */
  user_id: string;
  /** Postgres `date` (YYYY-MM-DD), promoted from the snapshot's `startDate`. */
  start_date: string;
  /** The whole Week snapshot. */
  data: Week;
  /** Mirrors `Week.createdAt`. */
  created_at: string;
  /** Mirrors `Week.updatedAt`; the app writes it (no DB trigger). */
  updated_at: string;
}

/** Project a Week onto a `weeks` row for the given owner (upsert payload). */
export function weekToRow(week: Week, userId: string): WeekRow {
  return {
    id: week.id,
    user_id: userId,
    // `startDate` is an ISO datetime at UTC midnight; the column is a plain date.
    start_date: week.startDate.slice(0, 10),
    data: week,
    created_at: week.createdAt,
    updated_at: week.updatedAt,
  };
}

/** Reconstruct a Week from a `weeks` row — the snapshot lives in `data`. */
export function rowToWeek(row: WeekRow): Week {
  // Trust the snapshot, but keep the id branded from the promoted column so a
  // caller selecting a narrow projection still gets a well-typed WeekId.
  return { ...row.data, id: row.id as WeekId };
}
