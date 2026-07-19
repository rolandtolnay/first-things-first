"use client";

import { useEffect, useMemo, useState } from "react";
import { TrendingUp } from "lucide-react";

import { SectionLabel } from "@/components/ui/SectionLabel";
import { getAllWeeks } from "@/lib/db";
import { getRoleColorStyle } from "@/lib/role-colors";
import { buildRoleTrends, type RoleTrend } from "@/lib/role-trends";
import { useWeekStore } from "@/stores/weekStore";
import type { Week } from "@/types";

const SPARK_WIDTH = 96;
const SPARK_HEIGHT = 20;

/**
 * Role trends — a small recent-weeks sparkline of planned hours per active
 * Role. Loaded lazily when the Rail is expanded (this component mounts), kept
 * live for the viewed Week by overlaying the store's current Week onto the
 * fetched history. Deliberately tiny: it supports planning, it is not a
 * reporting surface.
 */
export function RoleTrendsCard() {
  const activeRoles = useWeekStore((state) => state.activeRoles);
  const currentWeek = useWeekStore((state) => state.currentWeek);
  const [history, setHistory] = useState<Week[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getAllWeeks()
      .then((weeks) => {
        if (!cancelled) setHistory(weeks);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const model = useMemo(() => {
    if (!history) return null;
    // The viewed Week stays live: edits show up without a refetch.
    const weeks = currentWeek
      ? [...history.filter((week) => week.id !== currentWeek.id), currentWeek]
      : history;
    return buildRoleTrends(weeks, activeRoles);
  }, [history, currentWeek, activeRoles]);

  if (failed || activeRoles.length === 0) return null;

  return (
    <>
      <hr className="border-border" />
      <div className="flex flex-col gap-2.5">
        <SectionLabel icon={<TrendingUp strokeWidth={1.4} />}>Role Trends</SectionLabel>
        {!model ? (
          <p className="m-0 text-[12px] leading-5 text-muted-foreground">Loading…</p>
        ) : model.weekIds.length < 2 ? (
          <p className="m-0 text-[12px] leading-5 text-muted-foreground">
            Trends appear once a couple of weeks are planned.
          </p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {model.trends.map((trend) => (
              <RoleTrendRow key={trend.role.id} trend={trend} maxHours={model.maxHours} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function RoleTrendRow({ trend, maxHours }: { trend: RoleTrend; maxHours: number }) {
  const color = getRoleColorStyle(trend.role.color);
  const latest = trend.points[trend.points.length - 1]?.hours ?? 0;

  const linePoints = trend.points
    .map((point, index) => {
      const x =
        trend.points.length === 1
          ? SPARK_WIDTH / 2
          : (index / (trend.points.length - 1)) * (SPARK_WIDTH - 4) + 2;
      // Zero sits on the baseline; 2px padding keeps the peak stroke visible.
      const y = SPARK_HEIGHT - 1 - (point.hours / maxHours) * (SPARK_HEIGHT - 4);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const summary = trend.points
    .map((point) => `${point.weekId.slice(5)}: ${point.hours}h`)
    .join(", ");

  return (
    <div
      className="flex items-center gap-2"
      title={`${trend.role.name} — planned hours by week (${summary})`}
    >
      <span
        className="size-2 shrink-0 rounded-full"
        style={{ backgroundColor: color }}
        aria-hidden={true}
      />
      <span className="min-w-0 flex-1 truncate text-[12px] text-secondary-foreground">
        {trend.role.name}
      </span>
      <svg
        width={SPARK_WIDTH}
        height={SPARK_HEIGHT}
        viewBox={`0 0 ${SPARK_WIDTH} ${SPARK_HEIGHT}`}
        className="shrink-0"
        role="img"
        aria-label={`${trend.role.name}: ${summary}`}
      >
        <polyline
          points={linePoints}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="w-8 shrink-0 text-right font-mono text-[11px] tabular-nums text-muted-foreground">
        {latest}h
      </span>
    </div>
  );
}
