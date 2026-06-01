import {
  generateId,
  getCurrentWeekId,
  getNextWeekId,
  getWeekIdRange,
  getWeekStartDate,
  parseWeekId,
} from "@/lib/utils";
import { seedRoleSnapshots, snapshotFromRole } from "@/lib/role-snapshots";
import type { Goal, Role, RoleSnapshot, Week, WeekId } from "@/types";

export interface WeeklyHandoffModelInput {
  sourceWeek: Week | null;
  targetWeekId: WeekId;
  existingWeekIds: readonly WeekId[];
  selectedGoalIds: ReadonlySet<string>;
  activeRoles: readonly Role[];
}

export interface WeeklyHandoffSummary {
  completedGoals: number;
  totalGoals: number;
  unfinishedGoals: number;
  completionPercent: number;
}

export interface WeeklyHandoffGoalGroup {
  role: RoleSnapshot;
  goals: Goal[];
}

export interface WeeklyHandoffModel {
  summary: WeeklyHandoffSummary;
  unfinishedGoalGroups: WeeklyHandoffGoalGroup[];
  unfinishedGoalIds: string[];
  selectedCount: number;
  isReplacingTargetWeek: boolean;
  isSourceComplete: boolean;
  hasCarryableGoals: boolean;
  primaryActionLabel: string;
}

export interface WeeklyHandoffOpeningModelInput {
  sourceWeek: Week | null;
  viewedWeekId: WeekId;
  existingWeekIds: readonly WeekId[];
  activeRoles: readonly Role[];
  currentWeekId?: WeekId;
  horizonWeeks?: number;
}

export interface WeeklyHandoffOpeningModel {
  targetWeekId: WeekId;
  dropdownWeekIds: WeekId[];
  defaultSelectedGoalIds: string[];
}

export interface BuildWeekOptions {
  weekId: WeekId;
  activeRoles?: readonly Role[];
  now?: string;
}

export interface BuildTargetWeekOptions {
  targetWeekId: WeekId;
  activeRoles: readonly Role[];
  sourceWeek?: Week | null;
  selectedGoalIds?: ReadonlySet<string>;
  now?: string;
  createId?: () => string;
}

function activeRoleIdsForCarryover(activeRoles: readonly Role[]): Set<string> {
  return new Set(activeRoles.filter((role) => role.archivedAt === null).map((role) => role.id));
}

function seedTargetRoleSnapshots(
  activeRoles: readonly Role[],
  sourceWeek: Week | null | undefined,
): RoleSnapshot[] {
  const activeRoleById = new Map(
    activeRoles
      .filter((role) => role.archivedAt === null)
      .map((role) => [role.id, role]),
  );
  const usedRoleIds = new Set<string>();
  const sourceOrderedSnapshots = sourceWeek
    ? [...sourceWeek.roles]
        .sort((left, right) => left.order - right.order)
        .flatMap((snapshot): RoleSnapshot[] => {
          const activeRole = activeRoleById.get(snapshot.id);
          if (!activeRole) return [];
          usedRoleIds.add(activeRole.id);
          return [snapshotFromRole(activeRole, usedRoleIds.size - 1)];
        })
    : [];
  const missingActiveSnapshots = activeRoles
    .filter((role) => role.archivedAt === null && !usedRoleIds.has(role.id))
    .slice()
    .sort((left, right) => left.order - right.order)
    .map((role, index) => snapshotFromRole(role, sourceOrderedSnapshots.length + index));

  return [...sourceOrderedSnapshots, ...missingActiveSnapshots];
}

function getPrimaryActionLabel({
  isCleanSlate,
  isReplacingTargetWeek,
  selectedCount,
}: {
  isCleanSlate: boolean;
  isReplacingTargetWeek: boolean;
  selectedCount: number;
}): string {
  if (isCleanSlate) return isReplacingTargetWeek ? "Replace week" : "Start week";
  if (selectedCount === 0) return isReplacingTargetWeek ? "Replace and start fresh" : "Start fresh";

  const goalNoun = selectedCount === 1 ? "goal" : "goals";
  return isReplacingTargetWeek
    ? `Replace and carry forward ${selectedCount} ${goalNoun}`
    : `Carry forward ${selectedCount} ${goalNoun}`;
}

function buildWeekShell({
  weekId,
  activeRoles = [],
  now = new Date().toISOString(),
}: BuildWeekOptions): Week {
  const monday = parseWeekId(weekId);

  return {
    id: weekId,
    startDate: getWeekStartDate(monday).toISOString(),
    roles: seedRoleSnapshots(activeRoles),
    goals: [],
    dayPriorities: [],
    timeBlocks: [],
    eveningBlocks: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function buildEmptyWeek(options: BuildWeekOptions): Week {
  return buildWeekShell(options);
}

export function buildTargetWeek({
  targetWeekId,
  activeRoles,
  sourceWeek,
  selectedGoalIds = new Set(),
  now,
  createId,
}: BuildTargetWeekOptions): Week {
  const nextId = createId ?? generateId;
  const week = buildWeekShell({
    weekId: targetWeekId,
    activeRoles,
    now,
  });
  week.roles = seedTargetRoleSnapshots(activeRoles, sourceWeek);
  const activeRoleIds = new Set(week.roles.map((role) => role.id));

  week.goals = (sourceWeek?.goals ?? []).flatMap((goal): Goal[] => {
    if (goal.completed || !selectedGoalIds.has(goal.id) || !activeRoleIds.has(goal.roleId)) return [];

    return [{
      id: nextId(),
      roleId: goal.roleId,
      text: goal.text,
      notes: goal.notes,
      completed: false,
    }];
  });

  return week;
}

function getDefaultTargetWeekId({
  viewedWeekId,
  existingWeekIds,
  candidateWeekIds,
  excludedWeekId,
}: {
  viewedWeekId: WeekId;
  existingWeekIds: readonly WeekId[];
  candidateWeekIds: readonly WeekId[];
  excludedWeekId?: WeekId;
}): WeekId {
  const scanStart = getNextWeekId(viewedWeekId);
  const scanIndex = candidateWeekIds.indexOf(scanStart);
  const startIdx = scanIndex >= 0 ? scanIndex : 0;

  for (let i = 0; i < candidateWeekIds.length; i++) {
    const candidate = candidateWeekIds[(startIdx + i) % candidateWeekIds.length];
    if (candidate !== excludedWeekId && !existingWeekIds.includes(candidate)) return candidate;
  }

  return candidateWeekIds.find((weekId) => weekId !== excludedWeekId) ?? candidateWeekIds[0];
}

export function buildWeeklyHandoffOpeningModel({
  sourceWeek,
  viewedWeekId,
  existingWeekIds,
  activeRoles,
  currentWeekId = getCurrentWeekId(),
  horizonWeeks = 11,
}: WeeklyHandoffOpeningModelInput): WeeklyHandoffOpeningModel {
  const candidateWeekIds = getWeekIdRange(currentWeekId, Math.max(1, horizonWeeks));
  const targetWeekId = getDefaultTargetWeekId({
    viewedWeekId,
    existingWeekIds,
    candidateWeekIds,
    excludedWeekId: sourceWeek?.id,
  });
  const openingModel = buildWeeklyHandoffModel({
    sourceWeek,
    targetWeekId,
    existingWeekIds,
    selectedGoalIds: new Set(),
    activeRoles,
  });

  return {
    targetWeekId,
    dropdownWeekIds: candidateWeekIds.filter((weekId) => weekId !== sourceWeek?.id),
    defaultSelectedGoalIds: openingModel.unfinishedGoalIds,
  };
}

export function buildWeeklyHandoffModel({
  sourceWeek,
  targetWeekId,
  existingWeekIds,
  selectedGoalIds,
  activeRoles,
}: WeeklyHandoffModelInput): WeeklyHandoffModel {
  const goals = sourceWeek?.goals ?? [];
  const unfinishedGoals = goals.filter((goal) => !goal.completed);
  const activeRoleIds = activeRoleIdsForCarryover(activeRoles);
  const carryableUnfinishedGoals = unfinishedGoals.filter((goal) => activeRoleIds.has(goal.roleId));
  const completedGoals = goals.length - unfinishedGoals.length;
  const totalGoals = goals.length;
  const unfinishedGoalGroups =
    sourceWeek
      ? [...sourceWeek.roles]
          .sort((left, right) => left.order - right.order)
          .map((role) => ({
            role,
            goals: carryableUnfinishedGoals.filter((goal) => goal.roleId === role.id),
          }))
          .filter((group) => group.goals.length > 0)
      : [];
  const unfinishedGoalIds = unfinishedGoalGroups.flatMap((group) =>
    group.goals.map((goal) => goal.id)
  );
  const selectedCount = unfinishedGoalIds.filter((goalId) => selectedGoalIds.has(goalId)).length;
  const isReplacingTargetWeek = existingWeekIds.includes(targetWeekId);
  const isSourceComplete = unfinishedGoals.length === 0;
  const hasCarryableGoals = unfinishedGoalIds.length > 0;
  const primaryActionLabel = getPrimaryActionLabel({
    isCleanSlate: isSourceComplete,
    isReplacingTargetWeek,
    selectedCount,
  });

  return {
    summary: {
      completedGoals,
      totalGoals,
      unfinishedGoals: unfinishedGoals.length,
      completionPercent: totalGoals === 0 ? 0 : Math.round((completedGoals / totalGoals) * 100),
    },
    unfinishedGoalGroups,
    unfinishedGoalIds,
    selectedCount,
    isReplacingTargetWeek,
    isSourceComplete,
    hasCarryableGoals,
    primaryActionLabel,
  };
}
