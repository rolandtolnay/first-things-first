import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface BlockMetaProps {
  items: ReactNode[];
  className?: string;
}

/**
 * BlockMeta — compact mono metadata inside BlockCard.
 * Mirrors the design prototype's `.ftf-block__meta` treatment so time/duration
 * labels stay consistent wherever BlockCard appears.
 */
export function BlockMeta({ items, className }: BlockMetaProps) {
  return (
    <span
      className={cn(
        "flex min-w-0 items-center gap-[5px] overflow-hidden font-mono text-[9.5px] leading-none tracking-[0.04em] text-muted-foreground",
        className
      )}
    >
      {items.map((item, index) => (
        <span key={index} className="contents">
          {index > 0 && <span className="shrink-0 text-muted-foreground/60">·</span>}
          <span className="min-w-0 truncate">{item}</span>
        </span>
      ))}
    </span>
  );
}
