import * as React from "react";

import { cn } from "@/lib/utils";

interface StatRowProps {
  /** Monospaced UPPERCASE label on the left. */
  label: React.ReactNode;
  /** Tabular value on the right. */
  value: React.ReactNode;
  /** Render the value in the amber accent (e.g. Unfilled hours > 0). */
  accent?: boolean;
  className?: string;
}

/**
 * A baseline-aligned metric row: mono uppercase label · tabular value.
 * Used by the Rail's Week Metrics card.
 */
export function StatRow({ label, value, accent, className }: StatRowProps) {
  return (
    <div
      className={cn(
        "flex items-baseline justify-between py-[5px] text-caption",
        className
      )}
    >
      <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </span>
      <span
        className={cn(
          "tabular-nums",
          accent ? "font-semibold text-primary" : "text-foreground"
        )}
      >
        {value}
      </span>
    </div>
  );
}
