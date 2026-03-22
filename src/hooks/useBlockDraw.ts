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
import { hasOverlap, getClampedDuration } from "@/lib/overlap";
import { useWeekStore } from "@/stores/weekStore";

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
  }, []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      // Skip clicks on existing blocks
      if ((e.target as HTMLElement).closest("[data-block]")) return;

      // Only respond to primary button (left click)
      if (e.button !== 0) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const startSlot = Math.floor((e.clientY - rect.top) / 32);

      // Validate range
      if (startSlot < 0 || startSlot > 23) return;

      // Check if starting slot overlaps existing blocks
      if (hasOverlap(startSlot, startSlot + 1, dayBlocks)) return;

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
      let currentEndSlot = Math.round(relativeY / 32);

      // Clamp minimum to startSlot + 1 (at least one slot)
      currentEndSlot = Math.max(drawState.startSlot + 1, currentEndSlot);

      // Clamp maximum using overlap detection
      const requestedDuration = currentEndSlot - drawState.startSlot;
      const clampedDuration = getClampedDuration(
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
    async (e: React.PointerEvent) => {
      if (!isDrawing || !drawState) return;

      // Calculate final duration (min 1 slot)
      const duration = Math.max(
        1,
        drawState.currentEndSlot - drawState.startSlot
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

      // Clear drawing state
      setIsDrawing(false);
      setDrawState(null);
    },
    [isDrawing, drawState, dayIndex, addTimeBlock]
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
