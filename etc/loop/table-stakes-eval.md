# Table-stakes eval — full-product use cases

Falsifiable cases the rounded-out product must pass, written **before** implementation (2026-07-19). Derived from `PROJECT.md`, `CONTEXT.md`, and `etc/prd/manual-ics-calendar-import.md`. Every case is graded pass/fail against the real running local app (`npm run dev` + local Supabase, seeded `dev@example.com` login) through the real auth path.

Criticality: **[C]** critical (must pass), **[N]** nice-to-strong (should pass; failures need a recorded reason).

## Persona

**The daily driver — "R."**: plans their whole life in this app across 4–6 Roles, opens it every morning on a wide desktop screen (≥1440px), uses it as their only scheduler. Expects the polish of a $50–200 commercial product: no dead-end item types, no silent failures, no "that only works if it came from a Goal" asymmetries. Primary browser is Safari; automated verification runs in Chromium — flag anything relying on Chromium-only behavior.

## Verification notes

- **Drag-and-drop limits:** dnd-kit drags are unreliable under CDP-driven pointer synthesis. Cases marked *(dnd)* should be attempted via agent-browser pointer sequences; if the harness cannot complete the gesture, verify the underlying store route via unit tests + a manual-check note instead of failing the case.
- Completion state must be verified **after a page reload** whenever a case says "persists" — optimistic UI alone does not pass.
- The priorities cap is `MAX_PRIORITIES_PER_DAY = 2`; the grid is 8:00–20:00 in 30-min slots; a Day has at most one Evening Block.

## A. Session and shell (existing)

- **A1 [C]** Unauthenticated request to `/` redirects to `/login` (server redirect, `curl -i` check). Magic-link sign-in through local Inbucket lands on the workspace showing the most relevant Week.
- **A2 [C]** The workspace shows Sidebar (Weekly Balance + Roles & Goals), seven Day columns with priorities/time-grid/evening sections, and the collapsed Rail; no horizontal overflow of the app shell at 1440×900.
- **A3 [C]** Reloading the page restores the same Week with identical planning content (cloud persistence, not memory).
- **A4 [N]** A persistence failure surfaces the error banner; dismissing it works. (Verify by unit-test evidence if not cheaply reproducible in browser.)

## B. Roles and Goals (existing)

- **B1 [C]** Create a Role from the Sidebar; it appears with a distinct color and can be renamed inline and recolored via its menu.
- **B2 [C]** Creating a second active Role with the same name is refused with visible feedback.
- **B3 [C]** Archiving a Role removes it and its Goals/placed instances from the current Week only; restoring it from the archive search brings it back (with a distinct name on conflict).
- **B4 [C]** Add a Goal under a Role; edit it inline; complete it (checkbox); delete it with confirmation — its Day Priorities and goal-linked blocks disappear with it.
- **B5 [N]** *(dnd)* Reordering Roles in the Sidebar persists across reload.

## C. Scheduling core (existing)

- **C1 [C]** *(dnd)* Dragging a Goal onto a Day's priorities creates a Day Priority; onto a time slot creates a goal-linked Time Block with role color; onto the evening section creates the Day's Evening Block.
- **C2 [C]** Click-drag-draw on empty grid space creates a Freestyle Block with inline title editing; Escape/empty-commit removes it; Enter commits the title.
- **C3 [C]** Resizing a block from its bottom handle snaps to 30-min slots and refuses to overlap the block below.
- **C4 [C]** *(dnd)* Moving a block onto an occupied span snaps back (no overlap ever persists); a Day never shows two Evening Blocks.
- **C5 [C]** Goal, Day Priority, and block completion are independent: completing a Time Block leaves its Goal and same-Goal priorities untouched.
- **C6 [C]** A Day with ≥1 priority, all completed, counts toward Daily Streak in the Rail; Week Metrics and Weekly Balance hours update when blocks are added/resized/completed.
- **C7 [C]** Deleting any item (priority, block, evening block) from its hover/context menu works and never spawns a stray freestyle block after menu dismissal (draw-suppression lock).

## D. Freestyle Day Priorities (new)

- **D1 [C]** Clicking empty space in a Day's priorities section creates a Freestyle Day Priority with inline text entry; Enter commits, Escape/empty abandons without residue.
- **D2 [C]** A Freestyle Day Priority renders as a first-class peer: completable, deletable, editable (double-click), and visually distinct from goal-linked priorities (no fake Goal is created — Sidebar goal list unchanged).
- **D3 [C]** The 2-per-day cap applies to freestyle + goal-linked priorities combined; at cap, creation is refused without corrupting layout.
- **D4 [C]** Freestyle priorities count toward Daily Streak exactly like goal-linked ones.
- **D5 [C]** *(dnd)* A freestyle priority can be dragged to another Day's priorities, to the time grid (becomes a Freestyle Block with its text), and to an empty evening slot — same routing matrix as goal-linked priorities.
- **D6 [C]** Freestyle priorities persist across reload with their text, completion, order, and any Role assignment.

## E. Freestyle Evening Blocks (new)

- **E1 [C]** Clicking an empty evening section creates a freestyle Evening Block with inline title entry (same commit/abandon semantics as D1); when the Day already has an Evening Block, no create affordance appears/fires.
- **E2 [C]** Freestyle Evening Block titles are editable afterwards (double-click), including ones that arrived by dragging a Freestyle Block into the evening.
- **E3 [C]** Evening blocks persist across reload; completion toggles from card and menus work.

## F. Role assignment on freestyle items (new)

- **F1 [C]** A Freestyle Block's menu (dropdown and right-click) offers "Assign role" listing the Week's Roles with color dots; assigning tints the block with the Role color.
- **F2 [C]** Role assignment works identically for freestyle Evening Blocks and Freestyle Day Priorities.
- **F3 [C]** An assigned freestyle item counts in Weekly Balance under that Role, and NEVER appears in the Sidebar goal list.
- **F4 [C]** "Remove role" clears the assignment and returns the unassigned (dotted/neutral) styling; hours leave Weekly Balance.
- **F5 [N]** Role assignment survives conversions (priority↔block↔evening) and reload.

## G. Recurring blocks (new)

- **G1 [C]** A Freestyle Block's menu offers "Repeat weekly"; a repeating block shows a visible repeat indicator; the toggle is reversible.
- **G2 [C]** Weekly Handoff copies repeating Freestyle Blocks (time + evening) into the Target Week at the same day/slot/duration with completion reset and recurrence still on; non-repeating blocks are not copied.
- **G3 [C]** The Weekly Handoff dialog discloses how many repeating events will carry, before confirming.
- **G4 [C]** Recurrence never mutates other existing Weeks: the Source Week and unrelated historical Weeks are unchanged after handoff.
- **G5 [N]** A repeating Evening Block is skipped (not duplicated) if the Target Week somehow already has an Evening Block that day (replace-week path).

## H. Manual `.ics` calendar import (new — per PRD)

- **H1 [C]** An "Import calendar" action exists in the Week toolbar; it opens a dialog that accepts a single `.ics` file (picker; drag-drop optional).
- **H2 [C]** Only entries occurring in the currently viewed Week appear in review; timed entries are classified as Freestyle Block candidates and all-day entries as Freestyle Day Priority candidates.
- **H3 [C]** Review rows show title, day/time, and available details (location/notes/URL/meeting link); each row is selectable; summary counts (importable / skipped / conflicts / duplicates) are shown.
- **H4 [C]** Skip/conflict classification per PRD: out-of-grid (before 8:00 / after 20:00), non-30-min-aligned, overlapping existing or already-selected blocks, cancelled entries, and over-cap all-day entries are shown with reasons and default to unselected.
- **H5 [C]** Weekly recurring entries expand to this Week's instances only.
- **H6 [C]** Confirming imports all selected items in one Week update: timed → unassigned Freestyle Blocks on the grid, all-day → Freestyle Day Priorities (incomplete, ordered after existing), each carrying Import Metadata (fingerprint, UID, original times, safe details).
- **H7 [C]** Re-importing the same file marks previously imported items as duplicates, defaulting to skipped — confirming again does not duplicate the plan.
- **H8 [C]** Imported items behave as normal freestyle items afterwards: complete, delete, edit, assign role, drag.
- **H9 [N]** A malformed or empty `.ics` file produces a calm, explanatory state — never a crash or silent no-op.

## I. Weekly Handoff and navigation (existing)

- **I1 [C]** Weekly Handoff from the viewed Week: summary of completed/unfinished Goals, per-Role unfinished list with checkboxes, target-week selector defaulting to the next free Week, and clear replace-week copy when the target exists.
- **I2 [C]** Carried Goals appear in the Target Week under their Roles, incomplete, with fresh identity; Day Priorities and non-repeating blocks start empty.
- **I3 [C]** Prev/next/Today navigation works and disabled states are correct at the ends of the week list.

## J. UX / polish

- **J1 [C]** All new surfaces (freestyle creation, role submenu, repeat indicator, import dialog) compose from Dark Workspace tokens and shared primitives — no ad-hoc colors, radii, or one-off styled inputs; verified in dark AND light theme.
- **J2 [C]** New UI copy is customer-friendly ("Import calendar", "this week", "Repeat weekly") with no internal jargon (no "freestyle", "slot", "snapshot" in visible text).
- **J3 [C]** Hover menus on all item types follow the reserved-trailing-slot pattern: no layout shift on hover, Escape and outside-click dismiss cleanly, and no stuck focus ring afterwards.
- **J4 [N]** Empty states feel intentional: empty priorities/evening sections show their create affordance discoverably (hover hint) without cluttering the resting view.
- **J5 [N]** A fresh judge assuming the persona rates the whole as coherent and commercial-grade — nothing feels bolted on.

## How the tricky parts are demonstrated (not asserted)

- D5/C1/C4 *(dnd)*: attempt real pointer sequences in agent-browser; where the gesture won't synthesize, cite the store/routing unit tests that cover the exact route and record the limitation.
- H2–H7: drive with two committed fixture files (`etc/fixtures/import-basic.ics`, `etc/fixtures/import-edge-cases.ics`) containing timed/all-day/recurring/cancelled/out-of-grid/misaligned/overlapping entries pinned to the viewed week via relative-date generation or a fixed test week.
- A3/D6/E3/F5: reload the page after each mutation batch and re-read the DOM.
- G2–G4: create a repeating block, run handoff to a fresh Target Week, verify both Weeks' content; re-open the Source Week to prove it is untouched.
