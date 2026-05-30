# PRD — Dark Workspace Reskin

> Re-skin the live First Things First app onto the Dark Workspace Kit aesthetic, in a
> single session using parallel LLM subagents over a serial foundation.
> Reference prototype: `design/` · Canonical kit: `~/Development/design-systems/dark-workspace-kit`
> Decisions: `docs/adr/0001-dark-workspace-token-strategy.md`, `docs/adr/0002-role-color-decoupling.md`
> Vocabulary: `CONTEXT.md` (UI Vocabulary section)

## Problem Statement

The live app wears a light, generic teal-on-white shadcn theme. The user has produced
a complete, runnable redesign prototype (in `design/`) on the Dark Workspace Kit — a dark
workspace window with a warm amber glow, hairline borders, monospaced UPPERCASE
micro-labels, a denser calendar, and a new right-hand metrics rail — and prefers it to
the current design. The redesign exists only as a separate prototype; the production app
has not been touched. The user wants to land the new look in one focused session without
destabilising the working scheduling/drag-and-drop logic, and wants a UI surface
(Window Chrome) they can extend with real controls later.

## Solution

Re-skin the existing Next.js app to the prototype's aesthetic while preserving all
behavior. Adopt the kit's `--ds-*` tokens as the single source of truth in `globals.css`
and bridge them to Tailwind/shadcn via `@theme inline`, so the existing radix-backed
primitives keep working unmodified (ADR-0001). Make dark the default theme with light as
an opt-in. Restructure the layout into the three-column window (Sidebar · Calendar · Rail)
inside a floating window frame with a Window Chrome bar that carries the functional theme
toggle and a placeholder Settings button (an empty dialog shell, wired for future use).
Add the right rail with Week Metrics and a Daily Streak. The denser calendar is achieved
by halving the slot pixel height; the time range and typed time domain are unchanged.

The execution shape is **serial foundation → parallel surfaces → serial integration**:
tokens, the time-model density change, the role-color refactor, and the shared `ui/`
components land first (everything depends on them); then three surface agents
(calendar, sidebar, rail) work in parallel on disjoint file sets; then the window shell
is wired as the single integration step.

This PRD covers the **desktop reskin only**. Sharpen the Saw is a separate workstream;
the mobile single-day view is out of scope.

## User Stories

1. As a planner, I want the app to render in the dark workspace aesthetic (dark surfaces,
   amber glow, hairline borders, Geist + monospaced UPPERCASE section labels) so that the
   product matches the chosen brand identity.
2. As a planner, I want dark mode by default with a working toggle to light mode, so that
   the signature look is what I see first but I can switch if I prefer.
3. As a planner, I want the app presented as a floating workspace window on a darker stage
   with the amber glow behind it, so that the interface has the intended depth and focus.
4. As a planner, I want a Window Chrome bar with a theme toggle and a Settings button, so
   that there is an obvious home for global controls; clicking Settings opens a (currently
   empty) panel rather than doing nothing, so the surface is clearly extensible.
5. As a planner, I want a denser calendar grid that matches the prototype, so that more of
   my day is visible without scrolling.
6. As a planner, I want the calendar to keep its 8:00–19:30 schedule range with the evening
   block beneath it, so that the schedule window I already use is unchanged.
7. As a planner, I want to drag goals, time blocks, priorities, and evening blocks exactly
   as before across the restyled calendar, so that the redesign changes how it looks, not
   how it works.
8. As a planner, I want time blocks shown with their role color (faint tint fill, colored
   left accent, title + time/duration meta), with short (≤1h) blocks hiding the meta line,
   so that the schedule reads clearly at the denser size.
9. As a planner, I want free (goal-less) blocks shown with a dashed border so I can
   distinguish ad-hoc time from goal-linked time.
10. As a planner, I want the day-column header to show the day name, date (today in a filled
    accent circle), and a small completion donut, so that I can see each day's progress at
    a glance.
11. As a planner, I want my roles and goals in a restyled left Sidebar with a Weekly Balance
    summary (donut + per-role hours), so that role balance stays front and center.
12. As a planner, I want to add/edit/delete/complete roles and goals exactly as before, so
    that the reskin preserves all sidebar interactions.
13. As a planner, I want a right Rail showing Week Metrics — Planned hours, Unfilled hours
    (accent when above zero), and Completed items — so that I can see weekly load and
    progress without leaving the planner.
14. As a planner, I want a Daily Streak card showing a 7-cell current-week grid and my
    current run of complete days, where a day counts as complete only when all of its
    priorities are done (and it has at least one priority), so that I'm rewarded for
    following through on what I planned.
15. As a planner on a smaller screen, I want the Rail to hide below 1280px and the Sidebar
    below 1024px, so that the calendar stays usable when the window is narrow.
16. As the developer, I want all existing scheduling/role-balance/drop-routing unit tests
    to keep passing (with only the time-model pixel assertions updated), so that I have
    confidence the reskin didn't change behavior.

## Implementation Decisions

### Token strategy (ADR-0001)
- The Dark Workspace Kit `--ds-*` tokens become the source of truth in `globals.css`
  (oklch surfaces/text/accent, hairline border tokens, 4px spacing scale, radii, shadows,
  the amber glow color/size, `--ds-accent-h` hue token). They are bridged to the existing
  Tailwind/shadcn names via `@theme inline` (`--color-background → --ds-window`,
  `--color-card → --ds-panel`, `--color-primary → --ds-accent`, `--color-border → --ds-line`,
  radii by position, etc.).
- Existing shadcn primitives in `src/components/ui/` are **kept and restyled**, not
  replaced; they inherit the new look through the bridge. The radix-backed interaction
  components (dialog, dropdown, context-menu, popover, tooltip, alert-dialog, checkbox)
  are preserved as-is functionally.
- The signature amber glow is added as a fixed, blurred radial gradient behind the window
  (a `body::before` or dedicated element). Geist + Geist Mono load via `next/font/google`
  into `--font-sans` / `--font-mono`.
- Tailwind v4 caveat: a renamed/removed `--ds-*` token silently breaks its bridged utility
  with no build error — compiled CSS must be checked after token changes.

### Theme
- `ThemeProvider` switches to `defaultTheme="dark"` and drops `enableSystem`; light remains
  reachable via the existing `ThemeToggle`. Kit light-theme tokens back the light variant.

### Role colors (ADR-0002)
- `RoleColor` union and `COLOR_TO_INDEX` are unchanged — no Dexie migration. The
  `--role-1..8` variables are re-hued to oklch (kit's 6 hues + teal@195 + magenta@330).
- `getRoleColorStyleWithOpacity` changes from `rgba(var(--role-N-rgb), x)` to
  `color-mix(in oklab, var(--role-N), transparent …)`; the `--role-N-rgb` triplet variables
  are removed. Stored color names intentionally decouple from rendered hues.

### Calendar density and layout
- `SLOT_HEIGHT` changes from 28 to **16** in `time-model.ts`. This is the **only**
  time-domain edit: `TOTAL_SLOTS` (24), `MAX_SLOT_INDEX` (23), `DAY_END_HOUR` (20), the
  `TimeSlotIndex` union (`0..23`), and all clock/range logic are **unchanged**. The grid
  still runs 8:00–19:30 with the evening block beneath it. All pixel conversions derive
  from `SLOT_HEIGHT` through the existing functions, so no conversion logic changes.
- Day-column section heights are ported from the prototype as shared layout constants and
  consumed by both the day column sections and the `TimeLabelsColumn` spacers, which must
  stay in lockstep or hour labels drift off the grid (the primary alignment risk).
- The dead `BLOCK_DEFAULT_HEIGHT` constant (no consumers) is removed rather than updated.

### Window shell & chrome
- A `WindowChrome` bar is kept as a deliberate **extension surface**. It carries the
  functional `ThemeToggle` and a placeholder **Settings** button that opens an **empty
  Settings dialog shell** (reusing the shadcn `Dialog`) — wired, not a no-op.
- Decorative-only prototype elements (traffic-light buttons, menu button, Tweaks panel)
  are **omitted** entirely.
- A window frame (`AppWindow`: max-width, rounded border, window shadow) floats on the
  darker stage with the glow behind it. `MainLayout` becomes a three-column grid
  (296px · 1fr · 304px).

### Right rail (new surface; reuses existing data)
- **Week Metrics** card: 3 rows — Planned hours, Unfilled hours (accent when > 0),
  Completed items (`done / total`). The Saw-items row is deferred. Planned/Unfilled are
  sourced from the existing `role-balance` aggregation; `WEEKLY_TARGET_HOURS = 40` is a
  named constant (not user-configurable).
- **Daily Streak** card: a 7-cell current-week grid + the current run count. Backed by a
  new pure **streak-derivation module**: given a `Week`, it computes per-day completion
  (a day is complete iff it has ≥1 day-priority and all of them are `completed`) and the
  current run of complete days up to today. No cross-week / multi-record reads.

### Component reconciliation (DRY — no global stylesheet)
- Repeated values live in tokens / `role-colors.ts`; repeated visual patterns become
  shared `ui/` components; genuinely one-off styling stays local to its component. The
  prototype's `app.css` is a **value reference only** — not ported as a global stylesheet.
- Existing components are reused by restyling, not duplicated: `PieChart` **is** the Donut
  (restyle in place; rename deferred), `useEditableText` is the EditableText behavior,
  `AddItemInput` is the inline capture input, and `BlockCard` already implements the
  role-tinted card with menus (restyle, do not rebuild).
- New presentational components added to `ui/`: `SectionLabel`, `TabPill`, `StatRow`,
  `StreakGrid`. New rail feature components: `Rail`, `WeekMetrics`, `StreakCard`.

### Execution model (subagent fan-out)
- **Serial foundation:** token foundation (`globals.css`, `layout.tsx`, shared constants),
  `time-model` density change, `role-colors` refactor, shared `ui/` primitive restyle +
  new presentational components.
- **Parallel surfaces (disjoint files):** Calendar surface (week view + day column subtree
  + week nav + time labels + current-time indicator); Sidebar surface (sidebar + weekly
  balance + role/goal components); Rail surface (rail + metrics + streak + streak module).
- **Serial integration:** `AppWindow`, `WindowChrome` (+ Settings dialog shell),
  `MainLayout` three-column grid and collapse breakpoints — the single point that wires
  the three surfaces together, so no surface agent edits `MainLayout`.

### Responsive
- Port the prototype's collapse breakpoints: Rail hidden ≤1280px, Sidebar hidden ≤1024px.
  True mobile (≤768px single-day view) is out of scope.

## Testing Decisions

- **What makes a good test here:** assert external behavior and contracts, not rendered
  markup. The pure logic modules (time domain, streak rule) are the right test targets;
  presentational surfaces are verified visually, not via brittle DOM/snapshot tests.
- **`time-model` density change** — update the existing `src/lib/__tests__/time-model.test.ts`
  to re-lock the contract at `SLOT_HEIGHT = 16`: the pixel assertions (`SLOT_HEIGHT`,
  `slotToPixels`, `durationToPixels`, `timeToPixels`, `pixelToSlotFloor`, `pixelToSlotRound`)
  change; every clock/range/round-trip assertion stays byte-identical. This file is the
  prior-art pattern: it already pins constants and conversions as a contract.
- **Streak-derivation module** — new unit test covering: a day with all priorities done
  counts complete; a day with some-but-not-all priorities does not; a day with zero
  priorities does not count (cannot complete what wasn't planned); current-run counting
  stops at the first incomplete day up to today; current-week scope only. Mirrors the pure,
  React-free style of `role-balance.test.ts`.
- **Unchanged suites must stay green:** the other six test files (`scheduling`,
  `drop-routing`, `role-balance`, `overlap`, `weekStore`, `utils`) carry no pixel/range
  literals and must pass without edits — their staying green is the signal that behavior
  was preserved.
- **No new tests** for Week Metrics derivation (thin reuse of `role-balance` + a simple
  item count) or for presentational components.
- **Verification gate:** `vitest` green + `next build` / typecheck clean + a general-purpose
  subagent running an **agent-browser Pareto pass** for obvious, high-impact visual defects
  (especially calendar/grid–label misalignment and layout collapse). The user manually
  tests nuanced interaction flows (drag-and-drop, cross-zone moves).

## Out of Scope

- **Sharpen the Saw** — the four-category habit feature, its `SawItem` type, the Dexie
  schema/version bump and migration, store CRUD, and rail UI. Separate workstream after the
  reskin. The Week Metrics "Saw items" row is deferred until then.
- **Mobile single-day view** (≤768px) and any swipe/bottom-sheet patterns. Only the desktop
  collapse breakpoints are in scope.
- **Real Settings functionality** — only the empty, wired dialog shell ships now.
- **Accent-color / glow / density personalization** (the prototype's Tweaks panel) — not
  user-facing; winning defaults are baked in.
- **Cross-week rolling streak** — the streak is current-week only.
- **Decorative chrome** — traffic-light buttons, menu button.
- **Carryover changes** — the existing `CarryoverDialog` is reskinned by the token pass but
  its behavior is unchanged.

## Further Notes

- The `design/` directory is a full runnable React prototype (React UMD + Babel, in-memory
  state, native HTML5 DnD), not static mockups, and ships with its own `MIGRATION.md`. Read
  prototype source directly for exact values: `design/ds/tokens.css` (tokens),
  `design/app/app.css` (`ftf-*` layout/section heights/block styling), `design/app/*.jsx`
  (composition). The production app uses dnd-kit and Dexie, which the prototype does not.
- Goal/priority/block/evening **completion is already fully implemented** in `weekStore`
  (every entity has `completed` + a toggle action). `MIGRATION.md`'s open question about
  whether goals can be checked is therefore moot — the reskin just restyles existing
  checkboxes.
- Baseline at time of writing: 167 unit tests across 7 files, all green (206ms).
- `MIGRATION.md`'s 5–7 day estimate is optimistic — it predates the Option C decision and
  underweights the calendar reskin and a real QA pass. It remains a useful file-level
  porting reference, but this PRD's scope and decisions supersede it where they differ
  (notably: Option C over Option A token mapping, density via slot height, Saw deferred,
  decorative chrome omitted, streak rule fixed).
- After the reskin, the legacy `PieChart` filename should be renamed to `Donut` to match
  `CONTEXT.md`; deferred to avoid churn during the parallel pass.
