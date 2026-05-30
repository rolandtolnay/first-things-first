interface PieChartProps {
  completed: number;
  total: number;
  size?: number;
  /** Stroke/fill of the completed arc. Defaults to the amber accent. */
  color?: string;
  showLabel?: boolean;
}

/**
 * The Donut: a thin progress ring showing completed-of-total.
 * (Canonical name is Donut; the filename rename is deferred — see CONTEXT.md.)
 */
export function PieChart({
  completed,
  total,
  size = 28,
  color = "var(--ds-accent)",
  showLabel = true,
}: PieChartProps) {
  const center = size / 2;
  const strokeWidth = 2.5;
  const radius = center - strokeWidth / 2 - 0.5;
  const circumference = 2 * Math.PI * radius;
  const percent = total > 0 ? completed / total : 0;
  const filledLength = circumference * percent;
  const gapLength = circumference - filledLength;

  return (
    <div className="flex items-center gap-1">
      <svg
        width={size}
        height={size}
        className="flex-shrink-0"
        style={{ transform: "rotate(-90deg)" }}
      >
        {/* Track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="var(--ds-line)"
          strokeWidth={strokeWidth}
        />
        {/* Completed arc */}
        {percent > 0 && (
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${filledLength} ${gapLength}`}
            strokeLinecap="round"
            style={{ transition: "stroke-dasharray 300ms ease" }}
          />
        )}
      </svg>
      {showLabel && (
        <span className="text-caption text-muted-foreground tabular-nums">
          {completed}/{total}
        </span>
      )}
    </div>
  );
}
