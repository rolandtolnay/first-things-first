# Implementation decisions

Lightweight, non-obvious implementation choices future runs should not repeatedly reopen. Hard-to-reverse architectural choices belong in `docs/adr/`; product choices belong in `PROJECT.md`.

## 2026-07-16 — Feature PRDs are intent, not shipped-state evidence

**Decision:** Treat `etc/prd/` as scoped design and implementation intent. Confirm current behavior in source, migrations, and tests before relying on a PRD; an explicit goal may activate an unimplemented PRD.

**Why:** The repository intentionally retains forward-looking documents such as manual ICS import alongside completed PRDs. Treating every PRD as current behavior would corrupt the product baseline.

## 2026-07-16 — Hover-revealed card menus use a reserved trailing slot

**Decision:** For Role, Goal, and Block card overflow menus, reserve a fixed trailing slot and swap its duration/trigger content rather than overlaying labels or inserting an in-flow hover row. Keep the trigger’s hit area larger than its icon. On Radix menu dismissal, prevent trigger focus restoration and blur hover-hidden triggers.

**Why:** Grid overlays, overlapping labels, and in-flow hover controls produced stuck hover/focus states in Safari and Chrome. The reserved slot preserves layout and avoids a visible focus ring on a hidden trigger.

**Revisit when:** The card interaction is replaced with an always-visible control that is verified across pointer, touch, keyboard, Chrome, and Safari.

## 2026-07-16 — Calendar-layer menu actions use `onSelect`

**Decision:** Use Radix `DropdownMenuItem` and `ContextMenuItem` `onSelect`, not `onClick`, for actions layered over the calendar grid.

**Why:** `onClick` can lose touch/pointer timing to the underlying draw handler and create an accidental Freestyle Block.

## 2026-07-16 — Tailwind extensions use recognized v4 token namespaces

**Decision:** Extend built-in Tailwind utilities with their matching `@theme inline` namespace: `--text-*`, `--color-*`, `--radius-*`, and `--shadow-*`.

**Why:** Tailwind v4 silently ignores unknown namespaces such as `--font-size-*`; builds can pass while the intended utility is absent. Confirm new utilities in compiled CSS when token behavior changes.

## 2026-07-19 — Legacy Day Priorities normalize at the mapping boundary

**Decision:** `rowToWeek` runs `normalizeWeek` (`src/lib/priorities.ts`), which fills the missing `type` discriminant on Day Priorities persisted before Freestyle Day Priorities existed (missing `type` + `goalId` ⇒ `"goal"`). No migration or backfill of stored JSONB documents.

**Why:** ADR-0004 keeps Weeks as verbatim snapshots; a read-time normalization is the one seam every load already passes through, keeps historical documents untouched, and returns the same reference when nothing needs fixing.

## 2026-07-19 — Recurrence is a per-block flag applied only at Week creation

**Decision:** `recurrence: "weekly"` lives on Freestyle Blocks (time + evening). `buildTargetWeek` copies repeating freestyle blocks into the Target Week with fresh ids, completion reset, recurrence kept, and Role assignments dropped when the Role is no longer active. Goal-linked blocks never carry via recurrence.

**Why:** The Week-snapshot model forbids background mutation of existing Weeks; Weekly Handoff is the single explicit moment a new Week is derived. Goal-linked blocks would dangle because `buildTargetWeek` re-ids Goals.

## 2026-07-19 — Freestyle role assignment clears on Role archive (cascade)

**Decision:** `removeRoleSnapshotCascade` deletes goal-linked items with their Goals but keeps freestyle items, clearing a `roleId` that points at the removed snapshot.

**Why:** Freestyle items are the User's own entries, not Goal derivatives; deleting them on archive would destroy planning data, while a dangling `roleId` would silently count hours under a Role the Week no longer shows.

## 2026-07-19 — ICS parsing uses ical.js with window-scan recurrence expansion

**Decision:** `src/lib/ics-import.ts` wraps `ical.js` 2.x: register embedded VTIMEZONEs, relate exceptions to parents, iterate recurrences from DTSTART (never seed the iterator with the window start — that corrupts occurrence times), filter to the viewed Week by local calendar day, and additionally include exception instances moved into the window. Classification (out-of-grid, misalignment, overlap, cap, duplicates-by-fingerprint) is sequential in day/time order so earlier importable candidates reserve their span/cap.

**Why:** Hand-rolling RRULE/timezone handling is the classic ICS correctness trap; ical.js is browser-capable and testable. The iterator-seeding pitfall was observed directly (occurrences inherit the seed's time-of-day).

## 2026-07-19 — Day Bounds are a Week-snapshot field with slot re-indexing

**Decision:** The configurable planning-day window (`Week.dayBounds`, default 8:00–20:00) lives on the Week JSONB snapshot — no settings table, no migration. Slot `0` stays anchored to the day-start hour, so `updateDayBounds` shifts every Time Block's `startSlot` by the start-hour delta to preserve wall-clock times, and refuses (with the conflicting block named) when narrowing would strand a block. Weekly Handoff copies the Source Week's bounds into the Target Week; `buildEmptyWeek` uses the default. `TimeSlotIndex` is now a plain `number`; validity is enforced by the scheduling resolvers against the week's bounds.

**Why:** Bounds are part of how a Week was planned — historical Weeks must keep rendering under their own hours (snapshot model), and the daily driver's bounds follow the handoff ritual without a durable-preferences table. Refusal over silent moving matches "explicit over automatic". Pending undo entries are expired on a bounds change because their captured slot indices go stale.

## 2026-07-19 — Undo restores entities, single-level, week-scoped

**Decision:** Deletions (Day Priority, Time Block, Evening Block, Goal + cascade) capture the removed entities in `weekStore.lastUndo`; the toast's Undo re-appends them after integrity checks (no overlap, one evening per day, priorities cap) and reports partial restores honestly. Most-recent-wins; the toast carries its entry id so a stale toast can never undo a newer deletion; abandoned inline creations (empty titles) are not captured.

**Why:** Restoring a whole pre-mutation Week snapshot would clobber edits made between delete and undo; entity restore keeps them. Integrity checks keep the "no overlapping blocks" and cap constraints unconditional.

## 2026-07-19 — Import refresh matches UID + recurrence id, conservatively

**Decision:** Re-import classifies an entry whose UID(+recurrence id) matches an already-imported item as an `update` when the fingerprint differs (moved/resized — defaults to selected) or when only the title differs from the planned item (rename — defaults to unselected, position taken from the PLANNED item, since it may be the User's own rename). The old block's span stays reserved during classification so a deselected update can never confirm an overlap; items the User converted to another surface are never auto-updated. Confirmed updates preserve completion, Role assignment, and recurrence. The fingerprint formula is unchanged (title exclusive) for backward compatibility with previously imported items.

**Why:** A moved meeting should move the planned block, not duplicate it — but everything still flows through the explicit Import Review, and user edits to planned items must never be silently clobbered.

## 2026-07-19 — Today view is a CSS-swapped companion, not a planning surface

**Decision:** At phone widths (≤768px) the workspace route renders `TodayView` (one Day: priorities with toggles and quick freestyle capture, time-ordered schedule, evening) instead of the seven-Day grid, via a CSS-only breakpoint swap in `src/app/(app)/page.tsx` — both trees mount, media queries pick one. No drag-and-drop, no block drawing, no goal management on the phone.

**Why:** PROJECT.md keeps whole-Week desktop planning primary; the phone moment is executing a day that isn't going to plan. The CSS swap avoids matchMedia hydration mismatches and keeps a single route.
