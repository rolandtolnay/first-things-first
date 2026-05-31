/**
 * First Things First — persistence adapter (Supabase Postgres).
 *
 * The browser talks to Supabase directly; Row Level Security (`auth.uid() =
 * user_id`) is the access boundary, so reads are auto-scoped to the signed-in
 * user and writes let Postgres default `user_id` from `auth.uid()` (ADR-0003).
 * Each Week is a JSONB document — the row mapping lives in `week-mapping.ts`
 * (ADR-0004).
 *
 * The function surface mirrors the seam the store already depends on, so the
 * store's optimistic-update / `withWeek` semantics are unchanged.
 */

import { createClient } from "@/lib/supabase/client";
import { rowToWeek, weekToRow } from "@/lib/week-mapping";
import type { Week, WeekId } from "@/types";

const TABLE = "weeks";

interface DbRequestOptions {
  signal?: AbortSignal;
}

/** The shared browser client (createBrowserClient memoizes per env). */
function client() {
  return createClient();
}

/**
 * Get a week by id. RLS scopes the lookup to the current user, so the per-user
 * id is unique and `maybeSingle()` is safe.
 */
export async function getWeek(
  weekId: WeekId,
  options: DbRequestOptions = {},
): Promise<Week | undefined> {
  const baseQuery = client().from(TABLE).select("*").eq("id", weekId);
  const query = options.signal
    ? baseQuery.abortSignal(options.signal)
    : baseQuery;

  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  return data ? rowToWeek(data) : undefined;
}

/** Upsert a week for the current user (last-write-wins on the whole snapshot). */
export async function saveWeek(
  week: Week,
  options: DbRequestOptions = {},
): Promise<WeekId> {
  const baseQuery = client()
    .from(TABLE)
    .upsert(weekToRow(week), { onConflict: "user_id,id" });
  const query = options.signal
    ? baseQuery.abortSignal(options.signal)
    : baseQuery;

  const { error } = await query;
  if (error) throw error;
  return week.id;
}

/**
 * Get the current user's week ids, ascending — the lightweight feed for the
 * store's reactive `availableWeekIds` (navigation, carry-over target list).
 * WeekIds sort lexically in chronological order ("2026-W02" < "2026-W10").
 */
export async function getAllWeekIds(
  options: DbRequestOptions = {},
): Promise<WeekId[]> {
  const baseQuery = client().from(TABLE).select("id");
  const query = options.signal
    ? baseQuery.abortSignal(options.signal)
    : baseQuery;

  const { data, error } = await query.order("id", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row) => row.id as WeekId);
}
