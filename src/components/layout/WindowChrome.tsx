"use client";

import { useState } from "react";
import { Settings } from "lucide-react";

import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/**
 * Window Chrome — the top bar inside the app window (CONTEXT.md → Window Chrome).
 *
 * Carries the app wordmark, the functional theme toggle, and a placeholder
 * Settings button that opens an intentionally empty dialog shell — a wired
 * extension surface, not a no-op. Decorative traffic-light / menu buttons are
 * omitted.
 */
export function WindowChrome() {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <header className="flex shrink-0 items-center justify-between px-4 py-3">
      <div className="flex items-center gap-2">
        <span
          aria-hidden={true}
          className="size-3.5 rounded-[5px] bg-primary shadow-[0_0_10px_var(--ds-accent-soft)]"
        />
        <span className="text-[13px] font-semibold tracking-tight text-foreground">
          First Things First
        </span>
      </div>

      <div className="flex items-center gap-1">
        <ThemeToggle />
        <Button
          variant="ghost"
          size="icon"
          aria-label="Settings"
          onClick={() => setSettingsOpen(true)}
        >
          <Settings className="size-4 text-secondary-foreground" strokeWidth={1.4} />
        </Button>
      </div>

      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
            <DialogDescription>
              Workspace preferences will live here.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center gap-2 rounded-[var(--ds-r-md)] border border-dashed border-border px-6 py-10 text-center">
            <Settings className="size-5 text-muted-foreground" strokeWidth={1.4} />
            <p className="text-caption text-muted-foreground">
              There&apos;s nothing to configure here yet.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}
