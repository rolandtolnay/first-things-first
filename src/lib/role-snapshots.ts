import type { Role, RoleSnapshot, Week } from "@/types";

export function snapshotFromRole(role: Role, order = role.order): RoleSnapshot {
  return {
    id: role.id,
    name: role.name,
    color: role.color,
    order,
  };
}

export function seedRoleSnapshots(activeRoles: readonly Role[]): RoleSnapshot[] {
  return activeRoles
    .filter((role) => role.archivedAt === null)
    .slice()
    .sort((left, right) => left.order - right.order)
    .map((role, index) => snapshotFromRole(role, index));
}

export function appendRoleSnapshot(week: Week, role: Role): Week {
  if (week.roles.some((snapshot) => snapshot.id === role.id)) return week;

  const maxOrder = week.roles.reduce((max, snapshot) => Math.max(max, snapshot.order), -1);
  return {
    ...week,
    roles: [...week.roles, snapshotFromRole(role, maxOrder + 1)],
  };
}

export function updateRoleSnapshot(
  week: Week,
  roleId: string,
  updates: Partial<Omit<RoleSnapshot, "id">>,
): Week {
  return {
    ...week,
    roles: week.roles.map((snapshot) =>
      snapshot.id === roleId ? { ...snapshot, ...updates } : snapshot
    ),
  };
}

export function removeRoleSnapshotCascade(week: Week, roleId: string): Week {
  const removedGoalIds = new Set(
    week.goals.filter((goal) => goal.roleId === roleId).map((goal) => goal.id),
  );

  // Goal-linked items cascade away with their Goals. Freestyle items are the
  // User's own entries: they survive, but a Role assignment pointing at the
  // removed snapshot is cleared so they render (and count) as unassigned.
  const clearedRoleId = <T extends { roleId?: string }>(item: T): T =>
    item.roleId === roleId ? { ...item, roleId: undefined } : item;

  return {
    ...week,
    roles: week.roles.filter((snapshot) => snapshot.id !== roleId),
    goals: week.goals.filter((goal) => goal.roleId !== roleId),
    dayPriorities: week.dayPriorities
      .filter(
        (priority) =>
          priority.type === "freestyle" || !removedGoalIds.has(priority.goalId ?? ""),
      )
      .map((priority) => (priority.type === "freestyle" ? clearedRoleId(priority) : priority)),
    timeBlocks: week.timeBlocks
      .filter((block) => block.type === "freestyle" || !removedGoalIds.has(block.goalId!))
      .map((block) => (block.type === "freestyle" ? clearedRoleId(block) : block)),
    eveningBlocks: week.eveningBlocks
      .filter((block) => block.type === "freestyle" || !removedGoalIds.has(block.goalId!))
      .map((block) => (block.type === "freestyle" ? clearedRoleId(block) : block)),
  };
}

export function reorderRoleSnapshots(week: Week, roleIds: readonly string[]): Week {
  const currentIds = new Set(week.roles.map((snapshot) => snapshot.id));
  const requestedIds = new Set(roleIds);
  const isCompleteUniqueKnownSet =
    roleIds.length === week.roles.length &&
    requestedIds.size === roleIds.length &&
    roleIds.every((roleId) => currentIds.has(roleId));

  if (!isCompleteUniqueKnownSet) return week;

  return {
    ...week,
    roles: week.roles.map((snapshot) => ({
      ...snapshot,
      order: roleIds.indexOf(snapshot.id),
    })),
  };
}

function normalizedName(name: string): string {
  return name.trim().toLocaleLowerCase();
}

export function resolveRestoredRoleName(
  activeRoles: readonly Role[],
  archivedRole: Role,
): string {
  const activeNames = new Set(activeRoles.map((role) => normalizedName(role.name)));
  const baseName = archivedRole.name.trim();
  if (!activeNames.has(normalizedName(baseName))) return baseName;

  let suffix = 2;
  let candidate = `${baseName} ${suffix}`;
  while (activeNames.has(normalizedName(candidate))) {
    suffix += 1;
    candidate = `${baseName} ${suffix}`;
  }
  return candidate;
}
