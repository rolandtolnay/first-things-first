import { useMemo } from "react";
import { useWeekStore } from "@/stores/weekStore";

interface RoleHours {
  planned: number;
  completed: number;
}

interface UseRoleHoursResult {
  roleHoursMap: Map<string, RoleHours>;
  totalPlanned: number;
  totalCompleted: number;
}

export function useRoleHours(): UseRoleHoursResult {
  const timeBlocks = useWeekStore((state) => state.currentWeek?.timeBlocks);
  const eveningBlocks = useWeekStore((state) => state.currentWeek?.eveningBlocks);
  const roles = useWeekStore((state) => state.currentWeek?.roles);

  return useMemo(() => {
    const map = new Map<string, RoleHours>();

    if (timeBlocks) {
      for (const tb of timeBlocks) {
        if (!tb.roleId) continue;
        const entry = map.get(tb.roleId) ?? { planned: 0, completed: 0 };
        const hours = tb.duration * 0.5;
        entry.planned += hours;
        if (tb.completed) entry.completed += hours;
        map.set(tb.roleId, entry);
      }
    }

    if (eveningBlocks) {
      for (const eb of eveningBlocks) {
        if (!eb.roleId) continue;
        const entry = map.get(eb.roleId) ?? { planned: 0, completed: 0 };
        entry.planned += 1;
        if (eb.completed) entry.completed += 1;
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
  }, [timeBlocks, eveningBlocks, roles]);
}
