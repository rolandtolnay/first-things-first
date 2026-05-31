"use client";

import { useState } from "react";
import { Settings } from "lucide-react";

import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { SettingsDialog } from "@/components/layout/SettingsDialog";

/**
 * AppActions — compact global controls mounted in the week toolbar.
 *
 * The standalone Window Chrome row was removed to give the planner more usable
 * vertical space; theme and settings stay available here without reserving a
 * dedicated title bar.
 */
export function AppActions() {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
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

      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
}
