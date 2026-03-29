interface PieChartProps {
  completed: number;
  total: number;
  size?: number;
}

function pieArc(cx: number, cy: number, r: number, fraction: number): string {
  if (fraction <= 0) return "";
  if (fraction >= 1) {
    // Full circle: two half-arcs
    return [
      `M ${cx} ${cy - r}`,
      `A ${r} ${r} 0 1 1 ${cx} ${cy + r}`,
      `A ${r} ${r} 0 1 1 ${cx} ${cy - r}`,
      "Z",
    ].join(" ");
  }
  const angle = fraction * 2 * Math.PI;
  const x = cx + r * Math.sin(angle);
  const y = cy - r * Math.cos(angle);
  const largeArc = fraction > 0.5 ? 1 : 0;
  return [
    `M ${cx} ${cy}`,
    `L ${cx} ${cy - r}`,
    `A ${r} ${r} 0 ${largeArc} 1 ${x} ${y}`,
    "Z",
  ].join(" ");
}

export function PieChart({ completed, total, size = 20 }: PieChartProps) {
  const center = size / 2;
  const radius = center - 1;
  const percent = total > 0 ? completed / total : 0;

  return (
    <svg width={size} height={size} className="flex-shrink-0">
      {/* Background circle */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="var(--border)"
        stroke="var(--muted-foreground)"
        strokeWidth={0.5}
      />
      {/* Filled wedge */}
      {percent > 0 && (
        <path
          d={pieArc(center, center, radius, percent)}
          fill="var(--primary)"
          style={{ transition: "d 300ms ease" }}
        />
      )}
    </svg>
  );
}
