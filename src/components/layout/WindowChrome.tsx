"use client";

import { useState } from "react";
import { LogOut, Settings } from "lucide-react";

import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/providers/AuthProvider";
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
  const [isSigningOut, setIsSigningOut] = useState(false);
  const { user, signOut } = useAuth();

  async function handleSignOut() {
    setIsSigningOut(true);
    try {
      await signOut();
    } finally {
      setIsSigningOut(false);
    }
  }

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
              You&apos;re signed in. Manage your session below.
            </DialogDescription>
          </DialogHeader>
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
        </DialogContent>
      </Dialog>
    </header>
  );
}
