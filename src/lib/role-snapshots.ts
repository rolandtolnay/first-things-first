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

  return {
    ...week,
    roles: week.roles.filter((snapshot) => snapshot.id !== roleId),
    goals: week.goals.filter((goal) => goal.roleId !== roleId),
    dayPriorities: week.dayPriorities.filter((priority) => !removedGoalIds.has(priority.goalId)),
    timeBlocks: week.timeBlocks.filter(
      (block) => block.type === "freestyle" || !removedGoalIds.has(block.goalId!),
    ),
    eveningBlocks: week.eveningBlocks.filter(
      (block) => block.type === "freestyle" || !removedGoalIds.has(block.goalId!),
    ),
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
