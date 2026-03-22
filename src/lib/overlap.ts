/**
 * Overlap detection utilities for time block interactions.
 *
 * Used by resize, click-drag-draw, and drop handlers to enforce
 * the "no overlapping blocks" constraint.
 */

import type { TimeBlock } from "@/types";

/** Maximum block duration in slots (8 hours = 16 x 30-min slots) */
export const MAX_BLOCK_SLOTS = 16;

/** Total slots in a day (24 x 30-min slots covering 8:00-20:00) */
export const TOTAL_SLOTS = 24;

/**
 * Check if a time range [startSlot, endSlot) overlaps any existing blocks.
 * Uses standard interval intersection: startA < endB && startB < endA.
 *
 * @param startSlot - Start of the range to check
 * @param endSlot - End of the range to check (exclusive)
 * @param blocks - Existing blocks to check against
 * @param excludeId - Optional block ID to exclude (for self-exclusion during resize/move)
 */
export function hasOverlap(
  startSlot: number,
  endSlot: number,
  blocks: TimeBlock[],
  excludeId?: string
): boolean {
  return blocks
    .filter((b) => !excludeId || b.id !== excludeId)
    .some((b) => startSlot < b.startSlot + b.duration && endSlot > b.startSlot);
}

/**
 * Get the maximum duration available from a start slot, considering:
 * - Nearest occupied slot boundary ahead
 * - Maximum block duration (16 slots = 8 hours)
 * - End of day (slot 24)
 *
 * @param startSlot - Starting slot index
 * @param dayBlocks - All blocks for the day
 * @param excludeId - Optional block ID to exclude (for self-exclusion)
 */
export function getMaxAvailableDuration(
  startSlot: number,
  dayBlocks: TimeBlock[],
  excludeId?: string
): number {
  let availableEnd = Math.min(startSlot + MAX_BLOCK_SLOTS, TOTAL_SLOTS);

  for (const block of dayBlocks) {
    if (excludeId && block.id === excludeId) continue;
    // Only consider blocks that start at or after our startSlot
    if (block.startSlot >= startSlot && block.startSlot < availableEnd) {
      availableEnd = block.startSlot;
    }
  }

  return availableEnd - startSlot;
}

/**
 * Clamp a requested duration to the available space.
 * Enforces minimum 1 slot (30 minutes).
 *
 * @param requestedDuration - Desired duration in slots
 * @param startSlot - Starting slot index
 * @param dayBlocks - All blocks for the day
 * @param excludeId - Optional block ID to exclude (for self-exclusion)
 */
export function getClampedDuration(
  requestedDuration: number,
  startSlot: number,
  dayBlocks: TimeBlock[],
  excludeId?: string
): number {
  const maxAvailable = getMaxAvailableDuration(startSlot, dayBlocks, excludeId);
  return Math.max(1, Math.min(requestedDuration, maxAvailable));
}
