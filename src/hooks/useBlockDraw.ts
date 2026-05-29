"use client";

/**
 * useBlockDraw - Hook for creating freestyle blocks by click-drag-draw on the grid.
 *
 * Operates on the grid container (not on individual blocks), so it never conflicts
 * with dnd-kit. Uses pointer capture for reliable tracking. Guards against drawing
 * on existing blocks via data-block attribute check.
 *
 * State is local during drawing; store mutation happens once on pointerup.
 * After creation, sets newBlockId to trigger inline title editing on the block.
 */

import { useState, useCallback } from "react";
import type { DayOfWeek, TimeBlock, TimeSlotIndex } from "@/types";
import { canStartAt, resolveDrawPreview, resolveDrawCommit } from "@/lib/scheduling";
import { useWeekStore } from "@/stores/weekStore";
import { pixelToSlotFloor, pixelToSlotRound, MAX_SLOT_INDEX } from "@/lib/time-model";

// Module-level flag shared across all useBlockDraw instances (all days).
// Tracks whether ANY day column currently has a freestyle block being edited.
let globalEditingBlock = false;

// Suppresses stray pointer events after menu actions (e.g. Delete) that would
// otherwise land on the grid and start drawing a freestyle block. Uses a boolean
// flag cleared after two animation frames to ensure all stray events are absorbed.
let suppressDraw = false;
let suppressTimeout: ReturnType<typeof setTimeout> | null = null;

export function suppressBlockDraw() {
  suppressDraw = true;
  // Clear any previous timeout
  if (suppressTimeout) clearTimeout(suppressTimeout);
  // Double-RAF ensures we survive the full event dispatch cycle
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      suppressDraw = false;
    });
  });
  // Fallback timeout in case RAF doesn't fire (e.g. tab in background)
  suppressTimeout = setTimeout(() => {
    suppressDraw = false;
    suppressTimeout = null;
  }, 500);
}

interface DrawState {
  startSlot: number;
  currentEndSlot: number;
  containerRect: DOMRect;
}

interface PreviewBlock {
  startSlot: number;
  duration: number;
}

interface UseBlockDrawResult {
  containerProps: {
    onPointerDown: (e: React.PointerEvent) => void;
    onPointerMove: (e: React.PointerEvent) => void;
    onPointerUp: (e: React.PointerEvent) => void;
  };
  isDrawing: boolean;
  previewBlock: PreviewBlock | null;
  newBlockId: string | null;
  clearNewBlockId: () => void;
}

export function useBlockDraw(
  dayIndex: DayOfWeek,
  dayBlocks: TimeBlock[]
): UseBlockDrawResult {
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawState, setDrawState] = useState<DrawState | null>(null);
  const [newBlockId, setNewBlockId] = useState<string | null>(null);

  const addTimeBlock = useWeekStore((state) => state.addTimeBlock);

  const clearNewBlockId = useCallback(() => {
    setNewBlockId(null);
    globalEditingBlock = false;
  }, []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      // Skip clicks on existing blocks
      if ((e.target as HTMLElement).closest("[data-block]")) return;

      // Only respond to primary button (left click)
      if (e.button !== 0) return;

      // Skip stray pointer events from recently-closed menus
      if (suppressDraw) return;

      // If any day column has a freestyle block being edited, dismiss it instead
      if (globalEditingBlock) {
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
        return;
      }

      const rect = e.currentTarget.getBoundingClientRect();
      const startSlot = pixelToSlotFloor(e.clientY - rect.top);

      // Validate range
      if (startSlot < 0 || startSlot > MAX_SLOT_INDEX) return;

      // Check if starting slot overlaps existing blocks
      if (!canStartAt(startSlot, dayBlocks)) return;

      // Prevent default to avoid text selection
      e.preventDefault();
      // Capture pointer for reliable tracking
      e.currentTarget.setPointerCapture(e.pointerId);

      setIsDrawing(true);
      setDrawState({
        startSlot,
        currentEndSlot: startSlot + 1,
        containerRect: rect,
      });
    },
    [dayBlocks]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDrawing || !drawState) return;

      const relativeY = e.clientY - drawState.containerRect.top;
      let currentEndSlot = pixelToSlotRound(relativeY);

      // Floor of one slot *during* drag (live-preview minimum) — distinct from
      // MIN_BLOCK_SLOTS, the committed-block default applied on pointerup.
      currentEndSlot = Math.max(drawState.startSlot + 1, currentEndSlot);

      // Clamp maximum to free space ahead
      const requestedDuration = currentEndSlot - drawState.startSlot;
      const clampedDuration = resolveDrawPreview(
        requestedDuration,
        drawState.startSlot,
        dayBlocks
      );

      setDrawState((prev) =>
        prev
          ? { ...prev, currentEndSlot: prev.startSlot + clampedDuration }
          : null
      );
    },
    [isDrawing, drawState, dayBlocks]
  );

  const onPointerUp = useCallback(
    async () => {
      if (!isDrawing || !drawState) return;

      // Final duration: apply the min-block floor THEN re-clamp to free space,
      // so drawing in a 1-slot gap commits 1 slot instead of overlapping the
      // neighbour (the draw-overshoot fix).
      const duration = resolveDrawCommit(
        drawState.currentEndSlot - drawState.startSlot,
        drawState.startSlot,
        dayBlocks
      );

      // Create the freestyle block
      const block = await addTimeBlock({
        type: "freestyle",
        dayIndex,
        startSlot: drawState.startSlot as TimeSlotIndex,
        duration,
        title: "",
        completed: false,
      });

      // Set the new block ID to trigger inline editing
      setNewBlockId(block.id);
      globalEditingBlock = true;

      // Clear drawing state
      setIsDrawing(false);
      setDrawState(null);
    },
    [isDrawing, drawState, dayIndex, dayBlocks, addTimeBlock]
  );

  // Compute preview block from draw state
  const previewBlock: PreviewBlock | null =
    isDrawing && drawState
      ? {
          startSlot: drawState.startSlot,
          duration: drawState.currentEndSlot - drawState.startSlot,
        }
      : null;

  return {
    containerProps: { onPointerDown, onPointerMove, onPointerUp },
    isDrawing,
    previewBlock,
    newBlockId,
    clearNewBlockId,
  };
}
