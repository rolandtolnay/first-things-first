"use client";

import { useState } from "react";
import { Eraser, LogOut, Settings } from "lucide-react";

import { ThemeToggle } from "@/components/ThemeToggle";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/providers/AuthProvider";
import { useWeekStore } from "@/stores/weekStore";

/**
 * AppActions — compact global controls mounted in the week toolbar.
 *
 * The standalone Window Chrome row was removed to give the planner more usable
 * vertical space; theme and settings stay available here without reserving a
 * dedicated title bar.
 */
export function AppActions() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isClearingWeek, setIsClearingWeek] = useState(false);
  const { user, signOut } = useAuth();
  const clearCurrentWeek = useWeekStore((state) => state.clearCurrentWeek);
  const currentWeek = useWeekStore((state) => state.currentWeek);

  async function handleSignOut() {
    setIsSigningOut(true);
    try {
      await signOut();
    } finally {
      setIsSigningOut(false);
    }
  }

  async function handleClearWeek() {
    setIsClearingWeek(true);
    try {
      await clearCurrentWeek();
      setSettingsOpen(false);
    } finally {
      setIsClearingWeek(false);
    }
  }

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

      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
            <DialogDescription>
              You&apos;re signed in. Manage your session below.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3 rounded-[var(--ds-r-md)] border border-border px-4 py-3">
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="font-mono text-label uppercase tracking-[0.12em] text-muted-foreground">
                  Current week
                </span>
                <span className="text-sm text-foreground">
                  Clear all roles, goals, priorities, and blocks.
                </span>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={!currentWeek || isClearingWeek}
                  >
                    <Eraser className="size-3.5" strokeWidth={1.4} />
                    Clear week
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear this week?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently remove all roles, goals, priorities, time blocks, and evening blocks from the current week. This cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isClearingWeek}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      variant="destructive"
                      disabled={isClearingWeek}
                      onClick={handleClearWeek}
                    >
                      {isClearingWeek ? "Clearing…" : "Clear week"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            <div className="flex items-center justify-between gap-3 rounded-[var(--ds-r-md)] border border-border px-4 py-3">
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="font-mono text-label uppercase tracking-[0.12em] text-muted-foreground">
                  Signed in as
                </span>
                <span className="truncate text-sm text-foreground">
                  {user?.email ?? "—"}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={isSigningOut}
                onClick={handleSignOut}
              >
                <LogOut className="size-3.5" strokeWidth={1.4} />
                {isSigningOut ? "Signing out…" : "Sign out"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
