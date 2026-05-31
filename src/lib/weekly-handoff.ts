import { generateId, getWeekStartDate, parseWeekId } from "@/lib/utils";
import type { Goal, Role, Week, WeekId } from "@/types";

export interface WeeklyHandoffModelInput {
  sourceWeek: Week | null;
  targetWeekId: WeekId;
  existingWeekIds: readonly WeekId[];
  selectedGoalIds: ReadonlySet<string>;
}

export interface WeeklyHandoffSummary {
  completedGoals: number;
  totalGoals: number;
  unfinishedGoals: number;
  completionPercent: number;
}

export interface WeeklyHandoffGoalGroup {
  role: Role;
  goals: Goal[];
}

export interface WeeklyHandoffModel {
  summary: WeeklyHandoffSummary;
  unfinishedGoalGroups: WeeklyHandoffGoalGroup[];
  unfinishedGoalIds: string[];
  selectedCount: number;
  isReplacingTargetWeek: boolean;
  isCleanSlate: boolean;
  primaryActionLabel: string;
}

export interface BuildWeekOptions {
  weekId: WeekId;
  carryOverRoles?: readonly Role[];
  now?: string;
  createId?: () => string;
}

export interface BuildTargetWeekOptions {
  targetWeekId: WeekId;
  sourceWeek?: Week;
  carryOverGoals?: readonly Goal[];
  now?: string;
  createId?: () => string;
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
  if (isCleanSlate) return isReplacingTargetWeek ? "Replace Week" : "Start Week";
  if (selectedCount === 0) return isReplacingTargetWeek ? "Replace and start fresh" : "Start fresh";

  const goalNoun = selectedCount === 1 ? "Goal" : "Goals";
  return isReplacingTargetWeek
    ? `Replace and carry forward ${selectedCount} ${goalNoun}`
    : `Carry forward ${selectedCount} ${goalNoun}`;
}

function buildWeekShell({
  weekId,
  carryOverRoles,
  now = new Date().toISOString(),
  createId = generateId,
}: BuildWeekOptions): { week: Week; roleIdMap: Map<string, string> } {
  const monday = parseWeekId(weekId);
  const roleIdMap = new Map<string, string>();
  const roles: Role[] = carryOverRoles
    ? carryOverRoles.map((role, index) => {
        const clonedRole = {
          id: createId(),
          name: role.name,
          color: role.color,
          order: index,
        } satisfies Role;
        roleIdMap.set(role.id, clonedRole.id);
        return clonedRole;
      })
    : [];

  return {
    week: {
      id: weekId,
      startDate: getWeekStartDate(monday).toISOString(),
      roles,
      goals: [],
      dayPriorities: [],
      timeBlocks: [],
      eveningBlocks: [],
      createdAt: now,
      updatedAt: now,
    },
    roleIdMap,
  };
}

export function buildEmptyWeek(options: BuildWeekOptions): Week {
  return buildWeekShell(options).week;
}

export function buildTargetWeek({
  targetWeekId,
  sourceWeek,
  carryOverGoals,
  now,
  createId,
}: BuildTargetWeekOptions): Week {
  const nextId = createId ?? generateId;
  const { week, roleIdMap } = buildWeekShell({
    weekId: targetWeekId,
    carryOverRoles: sourceWeek?.roles,
    now,
    createId: nextId,
  });

  week.goals = (carryOverGoals ?? []).flatMap((goal): Goal[] => {
    const newRoleId = roleIdMap.get(goal.roleId);
    if (!newRoleId) return [];

    return [{
      id: nextId(),
      roleId: newRoleId,
      text: goal.text,
      notes: goal.notes,
      completed: false,
    }];
  });

  return week;
}

export function buildWeeklyHandoffModel({
  sourceWeek,
  targetWeekId,
  existingWeekIds,
  selectedGoalIds,
}: WeeklyHandoffModelInput): WeeklyHandoffModel {
  const goals = sourceWeek?.goals ?? [];
  const unfinishedGoals = goals.filter((goal) => !goal.completed);
  const completedGoals = goals.length - unfinishedGoals.length;
  const totalGoals = goals.length;
  const unfinishedGoalGroups =
    sourceWeek
      ? [...sourceWeek.roles]
          .sort((left, right) => left.order - right.order)
          .map((role) => ({
            role,
            goals: unfinishedGoals.filter((goal) => goal.roleId === role.id),
          }))
          .filter((group) => group.goals.length > 0)
      : [];
  const unfinishedGoalIds = unfinishedGoalGroups.flatMap((group) =>
    group.goals.map((goal) => goal.id)
  );
  const selectedCount = unfinishedGoalIds.filter((goalId) => selectedGoalIds.has(goalId)).length;
  const isReplacingTargetWeek = existingWeekIds.includes(targetWeekId);
  const isCleanSlate = unfinishedGoalIds.length === 0;
  const primaryActionLabel = getPrimaryActionLabel({
    isCleanSlate,
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
    isCleanSlate,
    primaryActionLabel,
  };
}
