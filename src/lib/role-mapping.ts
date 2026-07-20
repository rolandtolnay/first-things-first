import type { Role, RoleColor } from "@/types";

export type RoleDocument = Role;

export interface RoleCreateDefaults {
  name: string;
  color: RoleColor;
  order: number;
}

export function documentToRole(id: string, data: unknown): Role {
  const role = data as RoleDocument;
  return { ...role, id };
}

export function createRoleDocument(
  id: string,
  input: RoleCreateDefaults,
  now = new Date().toISOString(),
): RoleDocument {
  return {
    id,
    name: input.name,
    color: input.color,
    order: input.order,
    archivedAt: null,
    createdAt: now,
    updatedAt: now,
  };
}

export function updateRoleDocument(
  existing: RoleDocument | null,
  input: RoleCreateDefaults & { id: string },
  now = new Date().toISOString(),
): RoleDocument {
  return {
    id: input.id,
    name: input.name,
    color: input.color,
    order: input.order,
    archivedAt: existing?.archivedAt ?? null,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
}

export function archiveRoleDocument(
  existing: RoleDocument | null,
  input: RoleCreateDefaults & { id: string },
  now = new Date().toISOString(),
): RoleDocument {
  return {
    ...updateRoleDocument(existing, input, now),
    archivedAt: now,
  };
}

export function restoreRoleDocument(
  existing: RoleDocument,
  updates: Pick<Role, "name" | "order">,
  now = new Date().toISOString(),
): RoleDocument {
  return {
    ...existing,
    name: updates.name,
    order: updates.order,
    archivedAt: null,
    updatedAt: now,
  };
}
