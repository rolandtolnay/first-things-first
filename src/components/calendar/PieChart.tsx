interface PieChartProps {
  completed: number;
  total: number;
  size?: number;
}

export function PieChart({ completed, total, size = 24 }: PieChartProps) {
  const radius = (size - 3) / 2; // 3px stroke
  const circumference = 2 * Math.PI * radius;
  const percent = total > 0 ? completed / total : 0;
  const offset = circumference * (1 - percent);
  const center = size / 2;

  return (
    <svg width={size} height={size} className="flex-shrink-0">
      {/* Track ring */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke="var(--border)"
        strokeWidth={3}
      />
      {/* Fill arc */}
      {total > 0 && (
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="var(--primary)"
          strokeWidth={3}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: 'stroke-dashoffset 300ms ease',
            transform: 'rotate(-90deg)',
            transformOrigin: 'center',
          }}
        />
      )}
    </svg>
  );
}
