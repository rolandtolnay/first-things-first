/**
 * First Things First — persistence adapter (Supabase Postgres).
 *
 * The browser talks to Supabase directly; Row Level Security (`auth.uid() =
 * user_id`) is the access boundary, so reads are auto-scoped to the signed-in
 * user and writes stamp `user_id` from the current Session (ADR-0003). Each Week
 * is a JSONB document — the row mapping lives in `week-mapping.ts` (ADR-0004).
 *
 * The function surface mirrors the seam the store already depends on, so the
 * store's optimistic-update / `withWeek` semantics are unchanged.
 */

import { createClient } from "@/lib/supabase/client";
import { rowToWeek, weekToRow, type WeekRow } from "@/lib/week-mapping";
import type { Week, WeekId } from "@/types";

const TABLE = "weeks";

/** The shared browser client (createBrowserClient memoizes per env). */
function client() {
  return createClient();
}

/** Resolve the signed-in user's id for writes (reads rely on RLS, not this). */
async function requireUserId(): Promise<string> {
  const { data, error } = await client().auth.getUser();
  if (error || !data.user) {
    throw new Error("You must be signed in to save your weeks.");
  }
  return data.user.id;
}

/**
 * Get a week by id. RLS scopes the lookup to the current user, so the per-user
 * id is unique and `maybeSingle()` is safe.
 */
export async function getWeek(weekId: WeekId): Promise<Week | undefined> {
  const { data, error } = await client()
    .from(TABLE)
    .select("*")
    .eq("id", weekId)
    .maybeSingle();

  if (error) throw error;
  return data ? rowToWeek(data as WeekRow) : undefined;
}

/** Upsert a week for the current user (last-write-wins on the whole snapshot). */
export async function saveWeek(week: Week): Promise<WeekId> {
  const userId = await requireUserId();
  const { error } = await client().from(TABLE).upsert(weekToRow(week, userId));
  if (error) throw error;
  return week.id;
}

/**
 * Get the current user's week ids, ascending — the lightweight feed for the
 * store's reactive `availableWeekIds` (navigation, carry-over target list).
 * WeekIds sort lexically in chronological order ("2026-W02" < "2026-W10").
 */
export async function getAllWeekIds(): Promise<WeekId[]> {
  const { data, error } = await client()
    .from(TABLE)
    .select("id")
    .order("id", { ascending: true });

  if (error) throw error;
  return (data ?? []).map((row) => row.id as WeekId);
}
