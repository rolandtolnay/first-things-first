import * as React from "react";

import { cn } from "@/lib/utils";

interface SectionLabelProps {
  /** Optional leading icon (e.g. a lucide icon at stroke 1.4). */
  icon?: React.ReactNode;
  children: React.ReactNode;
  /** Optional trailing action (e.g. an add button), pinned to the right. */
  action?: React.ReactNode;
  className?: string;
}

/**
 * The signature monospaced UPPERCASE micro-label that separates sections
 * ("WEEK METRICS", "ROLES & GOALS"). See CONTEXT.md → Section Label.
 */
export function SectionLabel({ icon, children, action, className }: SectionLabelProps) {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      <span className="inline-flex items-center gap-1.5 whitespace-nowrap font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-secondary-foreground [&_svg]:size-3 [&_svg]:opacity-85">
        {icon}
        {children}
      </span>
      {action}
    </div>
  );
}
