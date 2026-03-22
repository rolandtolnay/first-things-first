interface CompletionCheckboxProps {
  completed: boolean;
  onToggle: () => void;
  size?: number;
}

export function CompletionCheckbox({
  completed,
  onToggle,
  size = 16,
}: CompletionCheckboxProps) {
  return (
    <button
      type="button"
      className="flex-shrink-0 flex items-center justify-center cursor-pointer"
      style={{
        width: 32,
        height: 32,
        padding: (32 - size) / 2,
      }}
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
        style={{
          transition: 'transform 200ms ease',
          transform: completed ? 'scale(1)' : 'scale(0.9)',
        }}
      >
        {completed ? (
          <>
            <circle
              cx="12"
              cy="12"
              r="10"
              fill="var(--success)"
              stroke="var(--success)"
            />
            <path
              d="M9 12l2 2 4-4"
              stroke="white"
              fill="none"
            />
          </>
        ) : (
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="var(--border-emphasis)"
            fill="var(--bg-card)"
          />
        )}
      </svg>
    </button>
  );
}
