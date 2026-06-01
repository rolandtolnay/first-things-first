/**
 * First Things First — persistence adapter (Supabase Postgres).
 *
 * The browser talks to Supabase directly; Row Level Security (`auth.uid() =
 * user_id`) is the access boundary, so reads are auto-scoped to the signed-in
 * user and writes include the authenticated `user_id` so PostgREST can target
 * the per-user composite key while RLS still verifies ownership (ADR-0003).
 * Each Week is a JSONB document — the row mapping lives in `week-mapping.ts`
 * (ADR-0004).
 *
 * The function surface mirrors the seam the store already depends on, so the
 * store's optimistic-update / `withWeek` semantics are unchanged.
 */

import { createClient } from "@/lib/supabase/client";
import {
  roleArchiveUpdate,
  roleDefaultUpdatesToRow,
  roleDefaultsToInsert,
  roleRestoreUpdate,
  rowToRole,
  type RoleDefaultUpdates,
} from "@/lib/role-mapping";
import { rowToWeek, weekToRow } from "@/lib/week-mapping";
import type { Role, RoleColor, Week, WeekId } from "@/types";

const WEEKS_TABLE = "weeks";
const ROLES_TABLE = "roles";

export interface DbRequestOptions {
  signal?: AbortSignal;
}

export interface CreateRoleInput {
  name: string;
  color: RoleColor;
  order: number;
}

/** The shared browser client (createBrowserClient memoizes per env). */
function client() {
  return createClient();
}

async function currentUserId(): Promise<string> {
  const supabase = client();
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) throw error;
  if (!session?.user.id) throw new Error("You are not signed in");
  return session.user.id;
}

/**
 * Get a week by id. RLS scopes the lookup to the current user, so the per-user
 * id is unique and `maybeSingle()` is safe.
 */
export async function getWeek(
  weekId: WeekId,
  options: DbRequestOptions = {},
): Promise<Week | undefined> {
  const baseQuery = client().from(WEEKS_TABLE).select("*").eq("id", weekId);
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
  const userId = await currentUserId();
  const baseQuery = client()
    .from(WEEKS_TABLE)
    .upsert(weekToRow(week, userId), { onConflict: "user_id,id" });
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
  const baseQuery = client().from(WEEKS_TABLE).select("id");
  const query = options.signal
    ? baseQuery.abortSignal(options.signal)
    : baseQuery;

  const { data, error } = await query.order("id", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row) => row.id as WeekId);
}

export async function getActiveRoles(
  options: DbRequestOptions = {},
): Promise<Role[]> {
  const baseQuery = client()
    .from(ROLES_TABLE)
    .select("*")
    .is("archived_at", null)
    .order("order_index", { ascending: true });
  const query = options.signal ? baseQuery.abortSignal(options.signal) : baseQuery;

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(rowToRole);
}

export async function searchArchivedRoles(
  queryText: string,
  options: DbRequestOptions = {},
): Promise<Role[]> {
  const query = queryText.trim();
  if (!query) return [];

  const baseQuery = client()
    .from(ROLES_TABLE)
    .select("*")
    .not("archived_at", "is", null)
    .ilike("name", `%${query}%`)
    .order("updated_at", { ascending: false })
    .limit(5);
  const request = options.signal ? baseQuery.abortSignal(options.signal) : baseQuery;

  const { data, error } = await request;
  if (error) throw error;
  return (data ?? []).map(rowToRole);
}

export async function createRole(
  input: CreateRoleInput,
  options: DbRequestOptions = {},
): Promise<Role> {
  const userId = await currentUserId();
  const baseQuery = client()
    .from(ROLES_TABLE)
    .insert(roleDefaultsToInsert(input, userId));
  const query = options.signal ? baseQuery.abortSignal(options.signal) : baseQuery;

  const { data, error } = await query.select("*").single();
  if (error) throw error;
  return rowToRole(data);
}

export async function updateRoleDefaults(
  roleId: string,
  updates: RoleDefaultUpdates,
  options: DbRequestOptions = {},
): Promise<Role> {
  const baseQuery = client()
    .from(ROLES_TABLE)
    .update(roleDefaultUpdatesToRow(updates))
    .eq("id", roleId);
  const query = options.signal ? baseQuery.abortSignal(options.signal) : baseQuery;

  const { data, error } = await query.select("*").single();
  if (error) throw error;
  return rowToRole(data);
}

export async function archiveRole(
  roleId: string,
  options: DbRequestOptions = {},
): Promise<Role> {
  const baseQuery = client()
    .from(ROLES_TABLE)
    .update(roleArchiveUpdate())
    .eq("id", roleId);
  const query = options.signal ? baseQuery.abortSignal(options.signal) : baseQuery;

  const { data, error } = await query.select("*").single();
  if (error) throw error;
  return rowToRole(data);
}

export async function restoreRole(
  roleId: string,
  updates: Pick<Role, "name" | "order">,
  options: DbRequestOptions = {},
): Promise<Role> {
  const baseQuery = client()
    .from(ROLES_TABLE)
    .update(roleRestoreUpdate(updates))
    .eq("id", roleId);
  const query = options.signal ? baseQuery.abortSignal(options.signal) : baseQuery;

  const { data, error } = await query.select("*").single();
  if (error) throw error;
  return rowToRole(data);
}

export async function persistRoleOrder(
  roleIds: readonly string[],
  options: DbRequestOptions = {},
): Promise<Role[]> {
  const baseQuery = client().rpc("reorder_roles", { role_ids: [...roleIds] });
  const query = options.signal ? baseQuery.abortSignal(options.signal) : baseQuery;

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(rowToRole).sort((left, right) => left.order - right.order);
}
