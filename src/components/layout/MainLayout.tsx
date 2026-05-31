"use client";

import { useState, type ReactNode } from "react";
import { PanelRightClose, PanelRightOpen } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MainLayoutProps {
  sidebar: ReactNode;
  children: ReactNode;
  rail: ReactNode;
}

/**
 * MainLayout — the workspace grid:
 *   Sidebar (296px) · Calendar (1fr) · collapsible Rail (44px / 304px).
 *
 * Each surface owns its own side border, padding, and internal scroll, so the
 * cells stay bare wrappers (min-h-0 + overflow-hidden) that let the surfaces
 * fill their height. The Rail starts collapsed to give the planner more daily
 * working width, and expands on demand. Responsive collapse: Sidebar + Rail hide
 * ≤1024px.
 */
export function MainLayout({ sidebar, children, rail }: MainLayoutProps) {
  const [isRailOpen, setIsRailOpen] = useState(false);

  return (
    <div
      className={cn(
        "grid min-h-0 flex-1 max-[1024px]:grid-cols-1",
        isRailOpen ? "grid-cols-[296px_1fr_304px]" : "grid-cols-[296px_1fr_44px]"
      )}
    >
      <div className="min-h-0 overflow-hidden max-[1024px]:hidden">{sidebar}</div>
      <main className="min-h-0 min-w-0 overflow-hidden">{children}</main>
      <div className="min-h-0 overflow-hidden max-[1024px]:hidden">
        {isRailOpen ? (
          <div className="relative h-full border-l border-border">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Collapse right sidebar"
              onClick={() => setIsRailOpen(false)}
              className="absolute right-3 top-4 z-10"
            >
              <PanelRightClose className="size-3.5" strokeWidth={1.4} />
            </Button>
            {rail}
          </div>
        ) : (
          <CollapsedRail onExpand={() => setIsRailOpen(true)} />
        )}
      </div>
    </div>
  );
}

function CollapsedRail({ onExpand }: { onExpand: () => void }) {
  return (
    <aside className="flex h-full flex-col items-center gap-3 border-l border-border bg-background px-2 py-3">
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Expand right sidebar"
        onClick={onExpand}
      >
        <PanelRightOpen className="size-3.5" strokeWidth={1.4} />
      </Button>
      <span className="mt-1 font-mono text-label uppercase tracking-[0.12em] text-muted-foreground [writing-mode:vertical-rl]">
        Metrics
      </span>
    </aside>
  );
}
