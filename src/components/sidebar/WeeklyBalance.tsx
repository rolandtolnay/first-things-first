"use client";

import { useRoleHours } from "@/hooks/useRoleHours";
import { useWeekStore } from "@/stores/weekStore";
import { getRoleColorStyle } from "@/lib/role-colors";

export function WeeklyBalance() {
  const { roleHoursMap, totalPlanned, totalCompleted } = useRoleHours();
  const roles = useWeekStore((state) => state.currentWeek?.roles);

  const sortedRoles = roles ? [...roles].sort((a, b) => a.order - b.order) : [];

  return (
    <div className="flex flex-col">
      <span className="text-label font-bold uppercase tracking-[0.05em] text-muted-foreground mb-2">
        Weekly Balance
      </span>

      {/* Stacked horizontal bar */}
      <div className="h-2.5 rounded-[5px] overflow-hidden flex bg-border">
        {totalPlanned > 0 &&
          sortedRoles.map((role) => {
            const hours = roleHoursMap.get(role.id);
            if (!hours || hours.planned <= 0) return null;
            const pct = (hours.planned / totalPlanned) * 100;
            return (
              <div
                key={role.id}
                style={{
                  width: `${pct}%`,
                  backgroundColor: getRoleColorStyle(role.color),
                }}
              />
            );
          })}
      </div>

      {/* Summary */}
      <span className="text-caption text-muted-foreground mt-1.5">
        {totalPlanned}h planned &middot;{" "}
        <span className="font-semibold text-foreground">{totalCompleted}h</span> done
      </span>

      <hr className="border-border my-3.5" />
    </div>
  );
}
