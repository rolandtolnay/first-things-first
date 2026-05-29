import { useMemo } from "react";
import { useWeekStore } from "@/stores/weekStore";
import { computeRoleBalance, type RoleBalance } from "@/lib/role-balance";

/**
 * Subscribe to the current week's blocks and aggregate role hours.
 * Thin wrapper over computeRoleBalance (the shared aggregation lives in
 * @/lib/role-balance). roles is intentionally not a dependency — the
 * computation never reads it.
 */
export function useRoleHours(): RoleBalance {
  const timeBlocks = useWeekStore((state) => state.currentWeek?.timeBlocks);
  const eveningBlocks = useWeekStore((state) => state.currentWeek?.eveningBlocks);

  return useMemo(
    () => computeRoleBalance({ timeBlocks, eveningBlocks }),
    [timeBlocks, eveningBlocks]
  );
}
