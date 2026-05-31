"use client";

import { useState } from "react";
import { Eraser, LogOut, X } from "lucide-react";

import { SectionLabel } from "@/components/ui/SectionLabel";
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
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/providers/AuthProvider";
import { useWeekStore } from "@/stores/weekStore";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
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
      onOpenChange(false);
    } finally {
      setIsClearingWeek(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-w-[calc(100vw-2rem)] gap-0 overflow-hidden rounded-[var(--ds-r-lg)] border border-[var(--ds-line)] bg-[var(--ds-window)] p-0 shadow-[var(--ds-shadow-lg)] sm:max-w-[640px]"
      >
        <DialogHeader className="border-b border-[var(--ds-line-soft)] px-8 py-7 pr-20">
          <DialogTitle className="text-[var(--ds-t-h3)] font-semibold leading-none tracking-[-0.02em]">
            Settings
          </DialogTitle>
          <DialogDescription className="max-w-[46ch] text-[var(--ds-t-body-l)] leading-6 text-muted-foreground">
            Manage the current planning workspace and your signed-in session.
          </DialogDescription>
        </DialogHeader>

        <DialogClose asChild>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-5 top-5 rounded-[var(--ds-r-md)] text-muted-foreground hover:bg-[var(--ds-panel)] hover:text-foreground"
            aria-label="Close settings"
          >
            <X className="size-4" strokeWidth={1.4} />
          </Button>
        </DialogClose>

        <div className="grid gap-7 px-8 py-8">
          <section className="grid gap-4">
            <div className="flex items-center justify-between gap-6">
              <div className="grid gap-2">
                <SectionLabel>Current week</SectionLabel>
                <p className="m-0 max-w-[36ch] text-[var(--ds-t-body-l)] leading-6 text-foreground">
                  Clear all roles, goals, priorities, and blocks so you can plan this week from scratch.
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    disabled={!currentWeek || isClearingWeek}
                  >
                    <Eraser className="size-3.5" strokeWidth={1.4} />
                    Clear week
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-[var(--ds-window)] p-6 shadow-[var(--ds-shadow-lg)]">
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
          </section>

          <div className="h-px bg-[var(--ds-line-soft)]" aria-hidden="true" />

          <section className="grid gap-4">
            <div className="flex items-center justify-between gap-6">
              <div className="grid min-w-0 gap-2">
                <SectionLabel>Account</SectionLabel>
                <p className="m-0 truncate text-[var(--ds-t-body-l)] leading-6 text-foreground">
                  {user?.email ?? "—"}
                </p>
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
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
