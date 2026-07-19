/**
 * Role Trends — cross-week planned-hours-per-Role aggregation for the Rail.
 *
 * Groups historical work by durable Role identity and presents it with the
 * Role's CURRENT display values (CONTEXT.md: cross-week analytics use current
 * display values; individual Week details keep historical Role Snapshots).
 * Hours use the same weighting as Weekly Balance: block slot duration, evening
 * blocks as one fixed hour. Planning support only — read-only, no Week mutation.
 */

import type { Role, Week, WeekId } from "@/types";
import { computeRoleBalance } from "./role-balance";

export interface RoleTrendPoint {
  weekId: WeekId;
  hours: number;
}

export interface RoleTrend {
  role: Pick<Role, "id" | "name" | "color">;
  /** One point per week, ascending; weeks without hours read as zero. */
  points: RoleTrendPoint[];
}

export interface RoleTrendsModel {
  trends: RoleTrend[];
  weekIds: WeekId[];
  /** Shared y-scale max across every role and week (≥ 1 to avoid div-by-zero). */
  maxHours: number;
}

/** Number of most-recent weeks a trend covers. */
export const TREND_WEEKS = 8;

export function buildRoleTrends(
  weeks: readonly Week[],
  activeRoles: readonly Role[],
  maxWeeks: number = TREND_WEEKS
): RoleTrendsModel {
  // WeekIds sort lexically in chronological order; keep the most recent window.
  const ordered = [...weeks]
    .sort((left, right) => left.id.localeCompare(right.id))
    .slice(-maxWeeks);
  const balances = ordered.map((week) =>
    computeRoleBalance({ timeBlocks: week.timeBlocks, eveningBlocks: week.eveningBlocks })
  );

  const trends = activeRoles
    .filter((role) => role.archivedAt === null)
    .slice()
    .sort((left, right) => left.order - right.order)
    .map((role) => ({
      role: { id: role.id, name: role.name, color: role.color },
      points: ordered.map((week, index) => ({
        weekId: week.id,
        hours: balances[index].roleHoursMap.get(role.id)?.planned ?? 0,
      })),
    }));

  const maxHours = Math.max(
    1,
    ...trends.flatMap((trend) => trend.points.map((point) => point.hours))
  );

  return { trends, weekIds: ordered.map((week) => week.id), maxHours };
}
