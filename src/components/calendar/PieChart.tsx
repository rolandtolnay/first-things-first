interface PieChartProps {
  completed: number;
  total: number;
  size?: number;
  showLabel?: boolean;
}

export function PieChart({ completed, total, size = 28, showLabel = true }: PieChartProps) {
  const center = size / 2;
  const strokeWidth = 3;
  const radius = center - strokeWidth / 2 - 0.5;
  const circumference = 2 * Math.PI * radius;
  const percent = total > 0 ? completed / total : 0;
  const filledLength = circumference * percent;
  const gapLength = circumference - filledLength;

  return (
    <div className="flex items-center gap-1">
      <svg width={size} height={size} className="flex-shrink-0" style={{ transform: "rotate(-90deg)" }}>
        {/* Background ring */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth={strokeWidth}
        />
        {/* Filled ring */}
        {percent > 0 && (
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="var(--primary)"
            strokeWidth={strokeWidth}
            strokeDasharray={`${filledLength} ${gapLength}`}
            strokeLinecap="round"
            style={{ transition: "stroke-dasharray 300ms ease" }}
          />
        )}
      </svg>
      {showLabel && (
        <span className="text-caption text-muted-foreground">{completed}/{total}</span>
      )}
    </div>
  );
}
