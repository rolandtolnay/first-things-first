"use client";

import { X } from "lucide-react";

import { useWeekStore } from "@/stores/weekStore";

/**
 * StoreErrorBanner — the single surface for the week store's `error` state.
 *
 * Saves now cross the network, so they can fail; load/bootstrap can fail too.
 * Rather than add a toast library (ADR-aligned), failures reuse the store's
 * `error` field and show here as a thin, dismissible hairline bar under the
 * Window Chrome. Renders nothing when there's no error.
 */
export function StoreErrorBanner() {
  const error = useWeekStore((s) => s.error);
  const clearError = useWeekStore((s) => s.clearError);

  if (!error) return null;

  return (
    <div
      role="alert"
      className="flex shrink-0 items-center justify-between gap-3 border-b border-border bg-warning-soft px-5 py-2"
      style={{ borderLeft: "3px solid var(--warning)" }}
    >
      <p className="min-w-0 truncate text-caption text-secondary-foreground">
        <span className="font-semibold">Something went wrong.</span> {error}
      </p>
      <button
        type="button"
        onClick={clearError}
        aria-label="Dismiss"
        className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-card-hover hover:text-foreground"
      >
        <X className="size-3.5" strokeWidth={1.4} />
      </button>
    </div>
  );
}
