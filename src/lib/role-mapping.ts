import type { Database } from "@/lib/supabase/database.types";
import type { Role, RoleColor } from "@/types";

export type DbRoleRow = Database["public"]["Tables"]["roles"]["Row"];
export type RoleInsert = Database["public"]["Tables"]["roles"]["Insert"];
export type RoleUpdate = Database["public"]["Tables"]["roles"]["Update"];
export type RoleDefaultUpdates = Partial<Pick<Role, "name" | "color">>;

export interface RoleCreateDefaults {
  name: string;
  color: RoleColor;
  order: number;
}

export function rowToRole(row: DbRoleRow): Role {
  return {
    id: row.id,
    name: row.name,
    color: row.color,
    order: row.order_index,
    archivedAt: row.archived_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function roleDefaultsToInsert(
  role: RoleCreateDefaults,
  userId: string,
  now = new Date().toISOString(),
): RoleInsert {
  return {
    user_id: userId,
    name: role.name,
    color: role.color,
    order_index: role.order,
    archived_at: null,
    created_at: now,
    updated_at: now,
  };
}

/**
 * Full upsert payload for a durable Role default, keyed on `id`.
 *
 * Editing a Role writes through the week's Role Snapshot, whose `id` only maps
 * to a durable `roles` row when that role was created via the durable table. A
 * plain `UPDATE … WHERE id = … .single()` returns 0 rows for snapshots that
 * predate the table and surfaces as a 406. Upserting the full snapshot instead
 * lazily materializes the missing durable row, so an edit can never 406.
 *
 * `archived_at` / `created_at` are intentionally omitted: on insert they fall
 * back to their column defaults, and on conflict they are left untouched so an
 * edit never silently un-archives or re-stamps an existing role.
 */
export function roleDefaultsToUpsert(
  role: RoleCreateDefaults & { id: string },
  userId: string,
  now = new Date().toISOString(),
): RoleInsert {
  return {
    id: role.id,
    user_id: userId,
    name: role.name,
    color: role.color,
    order_index: role.order,
    updated_at: now,
  };
}

/**
 * Full upsert payload that archives a Role (`archived_at` set). Mirrors
 * `roleDefaultsToUpsert`: deleting flows through a Role Snapshot whose id may
 * have no durable row yet, so archiving must be able to insert the row (with
 * every NOT NULL column) rather than 406 on a 0-row `.single()`. An archived
 * row is excluded from the active-name unique index, so no name collision is
 * possible here.
 */
export function roleArchiveUpsert(
  role: RoleCreateDefaults & { id: string },
  userId: string,
  now = new Date().toISOString(),
): RoleInsert {
  return {
    id: role.id,
    user_id: userId,
    name: role.name,
    color: role.color,
    order_index: role.order,
    archived_at: now,
    updated_at: now,
  };
}

export function roleRestoreUpdate(
  updates: Pick<Role, "name" | "order">,
  now = new Date().toISOString(),
): RoleUpdate {
  return {
    name: updates.name,
    order_index: updates.order,
    archived_at: null,
    updated_at: now,
  };
}
