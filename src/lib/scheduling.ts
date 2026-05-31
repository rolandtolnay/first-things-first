/**
 * Scheduling — pure placement-decision layer.
 *
 * Owns the "put / move a block at (day, slot) only if it fits, clamping to free
 * space" rule that used to be reimplemented across draw, resize, and every drop
 * branch. Wires the overlap interval helpers (overlap.ts) to a placement
 * *decision*: each function returns a plain result and never mutates the store.
 * No React, dnd-kit, or persistence dependency — so the decisions are directly
 * unit-testable.
 */

import type { TimeBlock } from "@/types";
import { hasOverlap, getClampedDuration } from "./overlap";
import {
  DEFAULT_BLOCK_SLOTS,
  MAX_BLOCK_SLOTS,
  MIN_BLOCK_SLOTS,
  MAX_SLOT_INDEX,
  TOTAL_SLOTS,
} from "./time-model";

/** Outcome of a placement decision for a new block or a move. */
export type PlacementResult =
  | { ok: true; startSlot: number; duration: number }
  | { ok: false; reason: "occupied" | "out-of-range" };

/**
 * Single-slot entry gate: can a block start at this slot without overlapping?
 * (excludeId lets a block ignore itself.)
 */
export function canStartAt(
  startSlot: number,
  dayBlocks: TimeBlock[],
  excludeId?: string
): boolean {
  return !hasOverlap(startSlot, startSlot + 1, dayBlocks, excludeId);
}

function clampPlacementDuration(duration: number): number {
  return Math.max(1, Math.min(duration, MAX_BLOCK_SLOTS));
}

/** Clamp a requested start upward when needed so the full duration fits in the Day. */
export function clampStartToFitDuration(startSlot: number, duration: number): number {
  const fittedDuration = clampPlacementDuration(duration);
  const maxStart = TOTAL_SLOTS - fittedDuration;
  return Math.min(startSlot, maxStart);
}

/**
 * Decide placement for a NEW block near startSlot: reject if out of range or the
 * fitted start slot is occupied, otherwise clamp duration only to occupied space
 * ahead. End-of-day overflow snaps the start upward so the requested duration
 * can fit instead of truncating to the final 30-minute Slot.
 */
export function resolveNewPlacement(
  startSlot: number,
  dayBlocks: TimeBlock[],
  requested: number = DEFAULT_BLOCK_SLOTS
): PlacementResult {
  if (startSlot < 0 || startSlot > MAX_SLOT_INDEX) {
    return { ok: false, reason: "out-of-range" };
  }

  const requestedDuration = clampPlacementDuration(requested);
  const fittedStart = clampStartToFitDuration(startSlot, requestedDuration);

  if (!canStartAt(fittedStart, dayBlocks)) {
    return { ok: false, reason: "occupied" };
  }
  return {
    ok: true,
    startSlot: fittedStart,
    duration: getClampedDuration(requestedDuration, fittedStart, dayBlocks),
  };
}

/**
 * Decide placement for MOVING an existing block (it keeps its duration): snap
 * upward at the end of the Day if needed, then reject if the full duration would
 * overlap another block; self is excluded.
 */
export function resolveMovePlacement(
  startSlot: number,
  duration: number,
  dayBlocks: TimeBlock[],
  excludeId: string
): PlacementResult {
  if (startSlot < 0 || startSlot > MAX_SLOT_INDEX) {
    return { ok: false, reason: "out-of-range" };
  }

  if (duration < 1 || duration > MAX_BLOCK_SLOTS) {
    return { ok: false, reason: "out-of-range" };
  }

  const fittedStart = clampStartToFitDuration(startSlot, duration);

  if (hasOverlap(fittedStart, fittedStart + duration, dayBlocks, excludeId)) {
    return { ok: false, reason: "occupied" };
  }
  return { ok: true, startSlot: fittedStart, duration };
}

/** Clamp a resize request to free space (excluding self). Always succeeds. */
export function resolveResize(
  requested: number,
  startSlot: number,
  dayBlocks: TimeBlock[],
  excludeId: string
): number {
  return getClampedDuration(requested, startSlot, dayBlocks, excludeId);
}

/**
 * Final duration committed when a draw ends. Applies the MIN_BLOCK_SLOTS floor
 * THEN re-clamps to free space — so drawing in a 1-slot gap commits 1 slot
 * instead of a 2-slot block overlapping the neighbour (the draw-overshoot fix).
 */
export function resolveDrawCommit(
  drawnDuration: number,
  startSlot: number,
  dayBlocks: TimeBlock[]
): number {
  return getClampedDuration(
    Math.max(MIN_BLOCK_SLOTS, drawnDuration),
    startSlot,
    dayBlocks
  );
}

/** Clamp the in-progress draw end to free space (live preview). */
export function resolveDrawPreview(
  requested: number,
  startSlot: number,
  dayBlocks: TimeBlock[]
): number {
  return getClampedDuration(requested, startSlot, dayBlocks);
}
