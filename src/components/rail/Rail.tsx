import { WeekMetrics } from "./WeekMetrics";
import { StreakCard } from "./StreakCard";

/**
 * Rail — the right column (CONTEXT.md → Rail). A scrollable, hairline-bordered
 * vertical stack holding Week Metrics and the Daily Streak card, separated by
 * whitespace and a single hairline. Each child reads the current week from the
 * store itself, keeping the container layout-only.
 */
export function Rail() {
  return (
    <aside className="flex h-full flex-col gap-5 overflow-y-auto border-l border-border px-4 py-5">
      <WeekMetrics />
      <hr className="border-border" />
      <StreakCard />
    </aside>
  );
}
