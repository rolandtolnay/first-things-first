"use client";

import { Target } from "lucide-react";

import { SectionLabel } from "@/components/ui/SectionLabel";
import { StatRow } from "@/components/ui/StatRow";
import { computeRoleBalance } from "@/lib/role-balance";
import { WEEKLY_TARGET_HOURS } from "@/lib/constants";
import { useWeekStore } from "@/stores/weekStore";

/**
 * Week Metrics — the Rail's weekly load/progress summary.
 *
 * Planned/Unfilled hours come from the shared role-balance aggregation;
 * Completed counts done-of-total across day priorities, time blocks, and
 * evening blocks. The Sharpen-the-Saw row from the prototype is out of scope.
 */
export function WeekMetrics() {
  const week = useWeekStore((s) => s.currentWeek);

  const { totalPlanned } = computeRoleBalance({
    timeBlocks: week?.timeBlocks,
    eveningBlocks: week?.eveningBlocks,
  });

  const unfilled = WEEKLY_TARGET_HOURS - totalPlanned;

  const priorities = week?.dayPriorities ?? [];
  const timeBlocks = week?.timeBlocks ?? [];
  const eveningBlocks = week?.eveningBlocks ?? [];

  const total = priorities.length + timeBlocks.length + eveningBlocks.length;
  const done =
    priorities.filter((p) => p.completed).length +
    timeBlocks.filter((b) => b.completed).length +
    eveningBlocks.filter((b) => b.completed).length;

  return (
    <div className="flex flex-col gap-2">
      <SectionLabel icon={<Target strokeWidth={1.4} />}>Week Metrics</SectionLabel>
      <div className="flex flex-col">
        <StatRow
          label="Planned"
          value={
            <>
              {totalPlanned}
              <span className="ml-0.5 font-mono text-muted-foreground">h</span>
            </>
          }
        />
        <StatRow
          label="Unfilled"
          accent={unfilled > 0}
          value={
            <>
              {unfilled > 0 ? unfilled : 0}
              <span className="ml-0.5 font-mono text-muted-foreground">h</span>
            </>
          }
        />
        <StatRow label="Completed" value={`${done} / ${total}`} />
      </div>
    </div>
  );
}
