/**
 * Pure mapping between a `weeks` row and a `Week`.
 *
 * The row promotes only the columns needed for ownership, filtering, and sorting
 * (`id`, `user_id`, `start_date`, `created_at`, `updated_at`); insert payloads
 * omit `user_id` so the database stamps ownership from `auth.uid()`. The whole Week
 * snapshot is carried verbatim in `data` (ADR-0004). Because `data` IS the
 * snapshot, the reverse mapping reads straight from it — the promoted columns
 * are derived projections, never a second source of truth.
 *
 * No Supabase imports here on purpose: this is the isolation-testable core, and
 * the adapter in `db.ts` is the thin I/O around it.
 */

import type { Database, Json } from "@/lib/supabase/database.types";
import type { Week, WeekId } from "@/types";

type DbWeekRow = Database["public"]["Tables"]["weeks"]["Row"];
type DbWeekInsert = Database["public"]["Tables"]["weeks"]["Insert"];

/** App-facing interpretation of a `public.weeks` row. */
export type WeekRow = Omit<DbWeekRow, "data"> & { data: Week };

/** Insert/upsert payload. `user_id` is defaulted by Postgres from `auth.uid()`. */
export type WeekInsert = Omit<DbWeekInsert, "data"> & { data: Json };

/** Project a Week onto a `weeks` upsert payload; ownership is stamped by the DB. */
export function weekToRow(week: Week): WeekInsert {
  return {
    id: week.id,
    // `startDate` is an ISO datetime at UTC midnight; the column is a plain date.
    start_date: week.startDate.slice(0, 10),
    data: week as unknown as Json,
    created_at: week.createdAt,
    updated_at: week.updatedAt,
  };
}

/** Reconstruct a Week from a `weeks` row — the snapshot lives in `data`. */
export function rowToWeek(row: DbWeekRow | WeekRow): Week {
  // Trust the JSONB snapshot per ADR-0004, but keep the id branded from the
  // promoted column so a caller selecting a narrow projection still gets a
  // well-typed WeekId. The domain cast lives here, at the mapping boundary.
  const snapshot = row.data as unknown as Week;
  return { ...snapshot, id: row.id as WeekId };
}
