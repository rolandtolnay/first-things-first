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
