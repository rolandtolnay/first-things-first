# Context — Domain Language

First Things First is a weekly planner: a grid of seven days, each split into
30-minute **slots** from 8:00 to 20:00, plus an evening slot and a per-day
priorities list. This document names the shared vocabulary so plans, reviews,
and refactors talk about the same things.

## Time Model — `src/lib/time-model.ts`

The single owner of the time domain: how the abstract **slot** coordinate (a
30-minute interval, slot 0 = 8:00 … slot 23 = 19:30) maps onto every other
representation the UI needs.

- **Slot** — integer index `0…23` (`TOTAL_SLOTS = 24`, `MAX_SLOT_INDEX = 23`).
  A block's `startSlot` + `duration` (in slots) describes its placement.
- **Clock conversions** — `slotToTime` / `timeToSlot` (the `-1` sentinel marks a
  time outside the grid window).
- **Duration weighting** — `slotsToHours` (2 slots = 1 hour); evening blocks have
  no duration and weigh a fixed `EVENING_BLOCK_HOURS`.
- **Pixel conversions** — `pixelToSlotFloor` ("which slot is this Y inside",
  draw start) vs. `pixelToSlotRound` ("nearest boundary", resize / draw-move):
  two named functions so floor/round can't be swapped by accident. Plus
  `slotToPixels` / `durationToPixels` / `timeToPixels` for layout.

`overlap.ts` re-exports `MAX_BLOCK_SLOTS` / `TOTAL_SLOTS` from here; constants
live in time-model, not `constants.ts` (which keeps only layout pixels).

## Scheduling — `src/lib/scheduling.ts` (decisions) + store actions

The **placement decision** layer: the "put / move a block at (day, slot) only if
it fits, clamping to free space" rule, expressed as pure functions that return a
`PlacementResult` and never mutate. Built on the `overlap.ts` interval helpers.

- `canStartAt` — single-slot entry gate.
- `resolveNewPlacement` — a *new* block: range-check, reject if occupied, else
  clamp duration to free space.
- `resolveMovePlacement` — *moving* an existing block: the **full** duration must
  fit (no clamp); excludes self.
- `resolveResize` — clamp a resize to free space (always succeeds).
- `resolveDrawCommit` / `resolveDrawPreview` — the floor-then-clamp logic for
  click-drag-draw (drawing in a 1-slot gap commits 1 slot, not an overlapping 2).

**Placement / move operations** are the store actions that apply these decisions
through `withWeek` (one transition → one persist). **Cross-zone moves**
(block↔evening, priority↔timegrid, evening↔timegrid, priority/evening→priorities)
are **atomic**: a single updater touches both arrays, so there is no half-state.
Rejection is silent (`return null`), preserving drag-and-drop snap-back. The
explicit verb-per-transition names (`moveBlockToEvening`, `convertPriorityToBlock`,
…) are each individually testable. `DndProvider` is now a flat dispatch on
`(dragData.type, dropData.zone)` that builds intent and calls one action; it keeps
only DnD policy (the `over == null` guard, the `isPrioritiesFull` capacity gate,
and the goal single-array creates).

## Role Balance — `src/lib/role-balance.ts`

The one shared aggregation of planned/completed hours per role:
`computeRoleBalance({ timeBlocks, eveningBlocks }) → { roleHoursMap, totalPlanned,
totalCompleted }`. Time blocks weigh `slotsToHours(duration)`; evening blocks weigh
`EVENING_BLOCK_HOURS`. Consumed by `useRoleHours` (sidebar Weekly Balance) and the
per-role "Xh planned" figure in `RoleSection`.
