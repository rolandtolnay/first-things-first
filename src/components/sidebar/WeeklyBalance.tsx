"use client";

import { LayoutGrid } from "lucide-react";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { PieChart } from "@/components/calendar/PieChart";
import { useRoleHours } from "@/hooks/useRoleHours";
import { useWeekStore } from "@/stores/weekStore";
import { getRoleColorStyle } from "@/lib/role-colors";
import { WEEKLY_TARGET_HOURS } from "@/lib/constants";

export function WeeklyBalance() {
  const { roleHoursMap, totalPlanned } = useRoleHours();
  const roles = useWeekStore((state) => state.currentWeek?.roles);

  const sortedRoles = roles ? [...roles].sort((a, b) => a.order - b.order) : [];

  // Per-role bars: only roles that carry planned hours. Fill is scaled against
  // the weekly target (or the actual total once it overflows 40h).
  const bars = sortedRoles
    .map((role) => ({ role, hours: roleHoursMap.get(role.id)?.planned ?? 0 }))
    .filter(({ hours }) => hours > 0);
  const max = Math.max(WEEKLY_TARGET_HOURS, totalPlanned);

  return (
    <div className="flex flex-col">
      <SectionLabel icon={<LayoutGrid strokeWidth={1.4} />} className="mb-3">
        Weekly Balance
      </SectionLabel>

      {/* Total row: donut (progress toward 40) + big tabular-nums hours */}
      <div className="flex items-center gap-3 border-b border-dashed border-border-soft pb-3.5">
        <PieChart
          completed={Math.min(totalPlanned, WEEKLY_TARGET_HOURS)}
          total={WEEKLY_TARGET_HOURS}
          size={52}
          showLabel={false}
        />
        <div className="flex flex-col gap-1">
          <div className="flex items-baseline text-[22px] font-semibold leading-none tracking-[-0.01em] text-foreground tabular-nums">
            {totalPlanned}
            <span className="ml-0.5 font-mono text-[11px] text-muted-foreground">
              h
            </span>
          </div>
          <div className="font-mono text-[9px] font-medium uppercase tracking-[0.12em] text-secondary-foreground">
            of {WEEKLY_TARGET_HOURS}h planned
          </div>
        </div>
      </div>

      {/* Per-role hour bars */}
      {bars.length > 0 && (
        <div className="mt-3 flex flex-col gap-[7px]">
          {bars.map(({ role, hours }) => (
            <div
              key={role.id}
              className="grid items-center gap-2 text-[11px]"
              style={{ gridTemplateColumns: "8px 1fr 60px auto" }}
            >
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: getRoleColorStyle(role.color) }}
                aria-hidden="true"
              />
              <span className="min-w-0 truncate text-muted-foreground">
                {role.name}
              </span>
              <span className="relative h-1 overflow-hidden rounded-full bg-[var(--ds-line-soft)]">
                <span
                  className="absolute inset-y-0 left-0 rounded-full transition-[width]"
                  style={{
                    width: `${(hours / max) * 100}%`,
                    backgroundColor: getRoleColorStyle(role.color),
                  }}
                />
              </span>
              <span className="font-mono text-[10px] text-secondary-foreground tabular-nums">
                {hours}h
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
