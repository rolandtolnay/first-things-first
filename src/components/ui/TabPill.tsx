import * as React from "react";
import { X, Plus } from "lucide-react";

import { cn } from "@/lib/utils";

interface TabPillProps {
  /** Optional leading icon (e.g. a lucide icon). */
  icon?: React.ReactNode;
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  onClose?: () => void;
  onAdd?: () => void;
  className?: string;
}

/**
 * The rounded "tab pill" widget (e.g. the active-week label in the week nav).
 */
export function TabPill({
  icon,
  children,
  active,
  onClick,
  onClose,
  onAdd,
  className,
}: TabPillProps) {
  return (
    <span
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border bg-card py-[5px] pl-3 pr-2.5 [font-size:var(--ds-t-caption)] leading-none text-foreground transition-colors",
        active ? "border-border-emphasis" : "border-border",
        onClick && "cursor-pointer hover:border-border-emphasis hover:bg-card-hover",
        className
      )}
    >
      {icon && (
        <span className="inline-flex size-3.5 items-center justify-center text-muted-foreground">
          {icon}
        </span>
      )}
      <span>{children}</span>
      {onClose && (
        <button
          type="button"
          aria-label="Close"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="inline-flex size-4 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-border hover:text-foreground"
        >
          <X className="size-2.5" strokeWidth={1.4} />
        </button>
      )}
      {onAdd && (
        <button
          type="button"
          aria-label="Add"
          onClick={(e) => {
            e.stopPropagation();
            onAdd();
          }}
          className="inline-flex size-4 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-border hover:text-foreground"
        >
          <Plus className="size-2.5" strokeWidth={1.4} />
        </button>
      )}
    </span>
  );
}
