/**
 * Role Balance — one shared aggregation of planned/completed hours per role.
 *
 * Single owner of "how blocks roll up into role hours", so the weighting rules
 * live in exactly one place instead of being duplicated between the sidebar's
 * Weekly Balance and each role row.
 *
 * Weighting:
 *   - TimeBlock contributes slotsToHours(duration) (a block's slot span).
 *   - EveningBlock contributes a fixed EVENING_BLOCK_HOURS (it has no duration).
 */

import type { TimeBlock, EveningBlock } from "@/types";
import { slotsToHours, EVENING_BLOCK_HOURS } from "./time-model";

export interface RoleHours {
  planned: number;
  completed: number;
}

export interface RoleBalance {
  roleHoursMap: Map<string, RoleHours>;
  totalPlanned: number;
  totalCompleted: number;
}

/**
 * Aggregate planned/completed hours per role across time blocks and evening
 * blocks. Blocks without a roleId are skipped. Undefined arrays are treated as
 * empty (the store exposes them via optional chaining).
 */
export function computeRoleBalance(input: {
  timeBlocks?: TimeBlock[];
  eveningBlocks?: EveningBlock[];
}): RoleBalance {
  const { timeBlocks, eveningBlocks } = input;
  const map = new Map<string, RoleHours>();

  if (timeBlocks) {
    for (const tb of timeBlocks) {
      if (!tb.roleId) continue;
      const entry = map.get(tb.roleId) ?? { planned: 0, completed: 0 };
      const hours = slotsToHours(tb.duration);
      entry.planned += hours;
      if (tb.completed) entry.completed += hours;
      map.set(tb.roleId, entry);
    }
  }

  if (eveningBlocks) {
    for (const eb of eveningBlocks) {
      if (!eb.roleId) continue;
      const entry = map.get(eb.roleId) ?? { planned: 0, completed: 0 };
      entry.planned += EVENING_BLOCK_HOURS;
      if (eb.completed) entry.completed += EVENING_BLOCK_HOURS;
      map.set(eb.roleId, entry);
    }
  }

  let totalPlanned = 0;
  let totalCompleted = 0;
  for (const entry of map.values()) {
    totalPlanned += entry.planned;
    totalCompleted += entry.completed;
  }

  return { roleHoursMap: map, totalPlanned, totalCompleted };
}
