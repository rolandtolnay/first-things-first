interface CompletionCheckboxProps {
  completed: boolean;
  onToggle: () => void;
  size?: number;
}

export function CompletionCheckbox({
  completed,
  onToggle,
  size = 14,
}: CompletionCheckboxProps) {
  return (
    <button
      type="button"
      className="flex-shrink-0 flex items-center justify-center transition-colors duration-150"
      style={{ width: size, height: size }}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      onPointerDown={(e) => {
        e.stopPropagation();
      }}
      aria-label={completed ? "Mark as incomplete" : "Mark as complete"}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {completed ? (
          <>
            <circle
              cx="12"
              cy="12"
              r="10"
              fill="hsl(var(--success))"
              stroke="hsl(var(--success))"
            />
            <path
              d="M9 12l2 2 4-4"
              stroke="hsl(var(--success-foreground))"
              fill="none"
            />
          </>
        ) : (
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="hsl(var(--muted-foreground))"
            fill="none"
          />
        )}
      </svg>
    </button>
  );
}
