"use client";

/**
 * useBlockResize - Hook for resizing time blocks by dragging the bottom edge.
 *
 * Uses raw pointer events with setPointerCapture for reliable tracking.
 * State is local during interaction; store mutation happens once on pointerup.
 * Calls e.stopPropagation() on pointerdown to prevent dnd-kit activation.
 */

import { useState, useRef, useCallback } from "react";
import type { TimeBlock } from "@/types";
import { resolveResize } from "@/lib/scheduling";
import { useWeekStore } from "@/stores/weekStore";
import { pixelToSlotRound } from "@/lib/time-model";

interface UseBlockResizeResult {
  handleProps: {
    onPointerDown: (e: React.PointerEvent) => void;
    onPointerMove: (e: React.PointerEvent) => void;
    onPointerUp: (e: React.PointerEvent) => void;
  };
  isResizing: boolean;
  previewDuration: number | null;
}

export function useBlockResize(
  block: TimeBlock,
  dayBlocks: TimeBlock[]
): UseBlockResizeResult {
  const [isResizing, setIsResizing] = useState(false);
  const [previewDuration, setPreviewDuration] = useState<number | null>(null);
  const containerRectRef = useRef<DOMRect | null>(null);

  const resizeTimeBlock = useWeekStore((state) => state.resizeTimeBlock);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      // Prevent dnd-kit PointerSensor from activating
      e.stopPropagation();
      // Prevent text selection
      e.preventDefault();

      // Capture pointer for reliable tracking even if pointer leaves element
      (e.target as HTMLElement).setPointerCapture(e.pointerId);

      // Find the slots column container and cache its rect
      const container = (e.currentTarget as HTMLElement).closest(
        "[data-slots-column]"
      );
      if (!container) return;
      containerRectRef.current = container.getBoundingClientRect();

      setIsResizing(true);
      setPreviewDuration(block.duration);
    },
    [block.duration]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isResizing || !containerRectRef.current) return;

      // Calculate new end slot from absolute pointer position
      const relativeY = e.clientY - containerRectRef.current.top;
      const newEndSlot = pixelToSlotRound(relativeY);
      const newDuration = newEndSlot - block.startSlot;

      // Clamp with overlap prevention (excludes self)
      const clamped = resolveResize(newDuration, block.startSlot, dayBlocks, block.id);

      setPreviewDuration(clamped);
    },
    [isResizing, block.startSlot, block.id, dayBlocks]
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!isResizing) return;

      // Pointer capture auto-releases on pointerup
      const finalDuration = previewDuration ?? block.duration;

      // Commit to store only if duration actually changed
      if (finalDuration !== block.duration) {
        resizeTimeBlock(block.id, finalDuration);
      }

      setIsResizing(false);
      setPreviewDuration(null);
      containerRectRef.current = null;
    },
    [isResizing, previewDuration, block.duration, block.id, resizeTimeBlock]
  );

  return {
    handleProps: { onPointerDown, onPointerMove, onPointerUp },
    isResizing,
    previewDuration,
  };
}
