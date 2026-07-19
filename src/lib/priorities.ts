/**
 * Priorities — pure helpers for the Day Priority model.
 *
 * Owns the goal-linked vs freestyle distinction so components and the store
 * never branch on raw shape. Also owns legacy normalization: Week documents
 * persisted before Freestyle Day Priorities existed have no `type` field, and
 * every stored priority then was goal-linked.
 */

import type { DayPriority, Goal, Week } from "@/types";

/** Fill the `type` discriminant on a priority persisted before it existed. */
export function normalizeDayPriority(priority: DayPriority): DayPriority {
  if (priority.type === "goal" || priority.type === "freestyle") return priority;
  return { ...priority, type: priority.goalId ? "goal" : "freestyle" };
}

/**
 * Normalize a Week snapshot loaded from persistence. Returns the same reference
 * when nothing needs normalizing so unchanged loads stay cheap.
 */
export function normalizeWeek(week: Week): Week {
  const needsNormalization = week.dayPriorities.some(
    (priority) => priority.type !== "goal" && priority.type !== "freestyle"
  );
  if (!needsNormalization) return week;
  return { ...week, dayPriorities: week.dayPriorities.map(normalizeDayPriority) };
}

/** Display text for a priority: the linked Goal's text, or its own. */
export function priorityText(priority: DayPriority, goals: readonly Goal[]): string {
  if (priority.type === "goal") {
    return goals.find((goal) => goal.id === priority.goalId)?.text ?? "";
  }
  return priority.text ?? "";
}

/** Role identity for a priority: the linked Goal's Role, or its own assignment. */
export function priorityRoleId(
  priority: DayPriority,
  goals: readonly Goal[]
): string | undefined {
  if (priority.type === "goal") {
    return goals.find((goal) => goal.id === priority.goalId)?.roleId;
  }
  return priority.roleId;
}
