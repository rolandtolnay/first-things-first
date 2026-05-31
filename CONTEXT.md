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
…) are each individually testable.

The **DnD dispatch policy** now lives in `src/lib/drop-routing.ts` (pure — no
React/dnd-kit/store imports). `resolveDrop(dragData, dropData, snapshot)` is the
`(dragData.type, dropData.zone)` routing matrix: it returns a plain `DropIntent`
(a data object naming one store action + its args) or `null` when the drop is a
no-op. Only two guards live there — the `MAX_PRIORITIES_PER_DAY` capacity gate
(no store action checks it) and the goal→evening "already occupied" pre-check
(`addEveningBlock` *throws* on a duplicate, so this keeps snap-back silent); every
other rejection already returns `null` from the store action. `dispatchDropIntent`
is the thin intent → action mapping. `DndProvider` is reduced to **snapshot →
resolve → dispatch**: it keeps the `over == null` guard and reads fresh state via
`getState()` at drop time (drops must see the current week, not a stale render).

## Role Balance — `src/lib/role-balance.ts`

The one shared aggregation of planned/completed hours per role:
`computeRoleBalance({ timeBlocks, eveningBlocks }) → { roleHoursMap, totalPlanned,
totalCompleted }`. Time blocks weigh `slotsToHours(duration)`; evening blocks weigh
`EVENING_BLOCK_HOURS`. Consumed by `useRoleHours` (sidebar Weekly Balance) and the
per-role "Xh planned" figure in `RoleSection`.

## Identity & Ownership — Supabase auth

Planning data is no longer global to a browser; it belongs to a person.

- **User** — an authenticated person who owns their planning data. Identified by
  email; one User per account.
- **Session** — the authenticated state proving who the current User is. It
  persists across visits, so a User signs in rarely, not every visit.

A **User** owns many **Weeks**; every Week — and the Roles, Goals, Day Priorities,
and blocks nested in it — is private to exactly one User. There is no sharing or
collaboration: ownership is exclusive.

## UI Vocabulary — Dark Workspace redesign

The redesign re-skins the app onto the **Dark Workspace Kit** aesthetic. The kit's
HTML/React prototype lives in `design/` and is the executable reference; it uses its
own term set (`ds-*` / `ftf-*`) that does **not** ship to production. These are the
canonical production names; the prototype aliases are listed so future agents don't
introduce duplicates.

**Donut**:
The SVG progress ring showing completed-of-total (day header completion, Weekly
Balance total). The existing `PieChart` component IS the Donut — restyled, not
replaced.
_Avoid_: PieChart (legacy name, kept only as the filename until renamed), ProgressRing.

**Section Label**:
A monospaced UPPERCASE micro-label that separates sections by whitespace and a single
hairline ("WEEK METRICS", "ROLES & GOALS"). The signature type rhythm of the kit.
_Avoid_: heading, title, header (those imply a heavier visual treatment).

**App Actions**:
Compact global controls (theme + settings/session) mounted in the week toolbar.
The previous standalone Window Chrome row was removed so the planner gets more
usable vertical space; do not reintroduce decorative title-bar controls unless
they carry functional value.

**Rail**:
The right column (304px) holding Week Metrics and Daily Streak. Distinct from the
**Sidebar** (left, 296px, Weekly Balance + Roles & Goals).
_Avoid_: panel, aside (ambiguous — both columns are asides).

**Free block**:
A time block with no linked goal (`type: "freestyle"`, `goalId` undefined). Rendered
with a dashed border. The codebase term is **freestyle**; the prototype calls the same
thing "free". Use **freestyle** in code, "free" only in user-facing labels if needed.
_Avoid_: manual block, custom block.

**Accent**:
The single brand color (amber by default), driven by the `--ds-accent-h` hue token so
it can be re-themed wholesale. Only the accent is ever a filled color; everything else
is hairline-bordered.

## Flagged ambiguities

- "Donut" vs "PieChart" — same component; **Donut** is canonical, `PieChart` is the
  current filename pending rename.
- "free" vs "freestyle" block — same concept; **freestyle** is canonical in code.
- "Daily Streak" counts a day complete only when **all** its day-priorities are done
  and the day has ≥1 priority; the grid is current-week only (no cross-week rolling).
