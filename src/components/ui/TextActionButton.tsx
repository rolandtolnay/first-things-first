import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Monospaced uppercase micro-action used for low-emphasis text controls
 * such as "+ ADD GOAL" and "+ ADD ROLE". This intentionally avoids the
 * default Button text scale so it stays aligned with the app's label system.
 */
export function TextActionButton({
  className,
  type = "button",
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex h-5 shrink-0 cursor-pointer items-center justify-center gap-1 rounded-[4px] border-0 bg-transparent px-1.5 font-mono text-[length:var(--text-label)] font-medium uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:bg-[var(--ds-hover-tint)] hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-3 [&_svg]:shrink-0",
        className
      )}
      {...props}
    />
  );
}
