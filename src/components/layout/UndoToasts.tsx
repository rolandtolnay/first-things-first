"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";

import { Toaster } from "@/components/ui/sonner";
import { useWeekStore } from "@/stores/weekStore";

const UNDO_TOAST_DURATION_MS = 6000;

/**
 * Mounts the toast surface and turns the store's pending undo entry into a
 * toast with an Undo action. Single-level, most-recent-wins: a newer deletion
 * dismisses the previous toast, and each toast undoes only its own entry (the
 * entry id travels with the action, so a stale toast can never restore a newer
 * deletion).
 */
export function UndoToasts() {
  const lastUndo = useWeekStore((state) => state.lastUndo);
  const undoLastDelete = useWeekStore((state) => state.undoLastDelete);
  const shownEntryIdRef = useRef<string | null>(null);
  const activeToastIdRef = useRef<string | number | null>(null);

  useEffect(() => {
    if (!lastUndo || lastUndo.id === shownEntryIdRef.current) return;
    shownEntryIdRef.current = lastUndo.id;

    if (activeToastIdRef.current !== null) {
      toast.dismiss(activeToastIdRef.current);
    }

    const entryId = lastUndo.id;
    activeToastIdRef.current = toast(lastUndo.label, {
      duration: UNDO_TOAST_DURATION_MS,
      action: {
        label: "Undo",
        onClick: () => {
          void undoLastDelete(entryId).then((message) => {
            if (message) toast(message, { duration: UNDO_TOAST_DURATION_MS });
          });
        },
      },
    });
  }, [lastUndo, undoLastDelete]);

  return <Toaster position="bottom-right" />;
}
