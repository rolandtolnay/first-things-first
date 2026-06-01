import type { Database } from "@/lib/supabase/database.types";
import type { Role, RoleColor } from "@/types";

export type DbRoleRow = Database["public"]["Tables"]["roles"]["Row"];
export type RoleInsert = Database["public"]["Tables"]["roles"]["Insert"];
export type RoleUpdate = Database["public"]["Tables"]["roles"]["Update"];

export function rowToRole(row: DbRoleRow): Role {
  return {
    id: row.id,
    name: row.name,
    color: row.color as RoleColor,
    order: row.order_index,
    archivedAt: row.archived_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function roleToInsert(role: Role, userId: string): RoleInsert {
  return {
    id: role.id,
    user_id: userId,
    name: role.name,
    color: role.color,
    order_index: role.order,
    archived_at: role.archivedAt,
    created_at: role.createdAt,
    updated_at: role.updatedAt,
  };
}

export function roleToUpdate(role: Role): RoleUpdate {
  return {
    name: role.name,
    color: role.color,
    order_index: role.order,
    archived_at: role.archivedAt,
    updated_at: role.updatedAt,
  };
}
