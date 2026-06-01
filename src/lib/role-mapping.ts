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

export function roleDefaultUpdatesToRow(
  updates: RoleDefaultUpdates,
  now = new Date().toISOString(),
): RoleUpdate {
  return {
    ...(updates.name !== undefined ? { name: updates.name } : {}),
    ...(updates.color !== undefined ? { color: updates.color } : {}),
    updated_at: now,
  };
}

export function roleArchiveUpdate(now = new Date().toISOString()): RoleUpdate {
  return { archived_at: now, updated_at: now };
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
