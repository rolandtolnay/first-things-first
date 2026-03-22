# Phase 8: Week Navigation — Research

<research_summary>

## Summary

Phase 8 requires no new dependencies. The existing stack (Dexie.js, Zustand, React 19, Tailwind v4) provides everything needed for multi-week navigation, intentional week creation, and a goal carryover dialog.

The core architecture is: extend `weekStore` with a `selectedWeekId` field for navigation state, use `useLiveQuery` from `dexie-react-hooks` (already installed but unused) for a reactive week index, and use the native HTML `<dialog>` element with `showModal()` for the carryover dialog. The critical refactoring task is splitting `loadWeek`'s current auto-creation behavior into separate "load existing" and "create new" operations.

Dexie's `primaryKeys()` API enables efficient week index queries without loading full week objects. Since WeekIds follow `YYYY-Www` format, lexicographic ordering on the primary key equals chronological ordering — no custom sort needed. The `useLiveQuery` hook makes this reactive: navigation arrows auto-update when weeks are created or deleted.

</research_summary>

<standard_stack>

## Standard Stack

No new libraries required. All capabilities come from already-installed packages:

| Library | Version | Phase 8 Role |
|---------|---------|-------------|
| dexie | 4.2.1 | Week index queries (`primaryKeys()`, `where().above/below()`) |
| dexie-react-hooks | 4.2.0 | `useLiveQuery` for reactive week index (installed, not yet used in project) |
| zustand | 5.0.10 | Navigation state (`selectedWeekId`), extended week creation |
| react | 19.2.3 | Native `<dialog>` refs (no `forwardRef` needed in React 19), `useTransition` |
| tailwindcss | v4 | Dialog styling via `backdrop:`, `open:`, `starting:` variants |

</standard_stack>

<architecture_patterns>

## Architecture Patterns

### Navigation State: Zustand + useLiveQuery Hybrid

- **`selectedWeekId`** in Zustand store — drives which week is displayed, updates synchronously on arrow click
- **`existingWeekIds`** from `useLiveQuery(() => db.weeks.orderBy('id').primaryKeys())` — reactive sorted list of all week IDs, auto-updates on create/delete
- **Navigation logic** derived in component: `previousWeekId`, `nextWeekId`, `canGoPrev`, `canGoNext` computed from these two sources

Why this split: `useLiveQuery` provides automatic cache invalidation when weeks are created — no manual store updates needed. Zustand provides synchronous `selectedWeekId` updates that prevent stale UI during async loads.

### loadWeek Refactoring: Separate Load from Create

Current `loadWeek` auto-creates weeks on miss. This must be split:
- `loadWeek(weekId)` — returns `null` if week doesn't exist (no auto-creation)
- `createNewWeek(weekId, options)` — explicit creation with carryover options

The navigation arrows call `loadWeek` only for existing week IDs (from the week index). The "+New" button triggers the dialog, which calls `createNewWeek` on confirmation.

### Carryover Dialog: Native `<dialog>` with Controlled State

- Parent owns `isDialogOpen` boolean state
- Dialog component syncs to imperative API via `useEffect` (`showModal()` / `close()`)
- `showModal()` provides: top-layer rendering, `::backdrop`, focus trapping, Esc dismissal
- Week creation is atomic: only creates the week record when user confirms dialog

### First-Ever Open Detection

```
weekCount = db.weeks.count()
if (weekCount === 0) → auto-create current week without dialog
```

### Banner Visibility (Pure Derivation)

```
showBanner = existingWeekIds.length > 0 && !existingWeekIds.includes(getCurrentWeekId())
```

Shows when: user has existing weeks AND current calendar week doesn't exist. Hidden on first-ever open (no weeks at all) and when current week already exists.

### Smooth Navigation with useTransition

Wrap `loadWeek()` in `startTransition()` so React keeps the old week visible while the new one loads. Combine with `isPending` for a subtle loading indicator (e.g., reduced opacity). Optional polish since Dexie reads are fast (~1ms), but prevents any visual flash.

</architecture_patterns>

<dont_hand_roll>

## Don't Hand-Roll

| Need | Use This | Don't Build |
|------|----------|-------------|
| Reactive week list | `useLiveQuery(() => db.weeks.orderBy('id').primaryKeys())` | Manual Dexie change subscriptions or store cache invalidation |
| Modal dialog | Native `<dialog>` + `showModal()` | Custom overlay + portal + focus trap + z-index management |
| Backdrop overlay | `::backdrop` pseudo-element (automatic with `showModal()`) | Custom backdrop div |
| Focus trapping | `showModal()` handles automatically | Manual focus trap implementation |
| Esc to close | Native `<dialog>` behavior | Manual keydown listener |
| Accessibility | `showModal()` sets `aria-modal="true"` auto | Manual ARIA management |
| Sorted week querying | `db.weeks.orderBy('id')` (lexicographic on YYYY-Www = chronological) | Manual array sort after full table scan |
| Adjacent week lookup | `db.weeks.where('id').above/below().limit(1).primaryKeys()` | Linear scan through all weeks |
| Role color in dialog | `getRoleColorStyle()` from `role-colors.ts` | Duplicate color logic |
| Week date display | `formatWeekId()` from `utils.ts` | New date formatting code |

</dont_hand_roll>

<common_pitfalls>

## Common Pitfalls

### 1. Race Condition on Rapid Navigation (CRITICAL)

**Risk:** User clicks next-next-next quickly. Multiple `loadWeek` calls fire concurrently. The last to resolve may not be the last dispatched, showing wrong week.

**Prevention:** Use a stale-request guard: before calling `set()` with loaded week data, check that the weekId being loaded still matches `selectedWeekId`. Or use `useTransition` which handles this natively by keeping the last-dispatched transition.

### 2. `loadWeek` Auto-Creates Weeks (MUST FIX)

**Risk:** Current `loadWeek` at `weekStore.ts:179-183` calls `createWeek` when a week doesn't exist. With navigation arrows, clicking "next" past the latest week silently creates an empty week — violating the locked decision.

**Prevention:** Refactor `loadWeek` to return null/error for non-existent weeks. Navigation arrows are disabled at boundaries (determined from the week index). Only the "+New" button flow creates weeks.

### 3. ISO Week Year-Boundary Bugs (HIGH RISK)

**Risk:** Dec 30, 2024 is in ISO week 2025-W01. `getWeekId()` could return wrong values at year boundaries, causing duplicate weeks or navigation errors.

**Prevention:** The existing implementation uses the correct Thursday-based algorithm. Must add explicit boundary tests: `2024-W52 → 2025-W01`, `2025-W01 → 2024-W52`, years with 53 weeks (e.g., 2020-W53 → 2021-W01).

### 4. Loading Full Weeks for Navigation (PERFORMANCE)

**Risk:** Using `getAllWeeks()` to build the navigation index loads ALL week data (goals, time blocks, priorities). Grows expensive over months of use.

**Prevention:** Use `db.weeks.orderBy('id').primaryKeys()` — returns only string IDs without deserializing full objects. ISO week IDs sort lexicographically = chronologically.

### 5. Dialog State Leak

**Risk:** If dialog is open and user navigates away (keyboard shortcut, etc.), partially-created week state becomes orphaned.

**Prevention:** Native `<dialog>` with `showModal()` blocks all background interaction. Week creation is atomic — only creates the record when user confirms.

### 6. Tailwind Dynamic Class Purging

**Risk:** Role colors in the carryover dialog must not use dynamic Tailwind classes (e.g., `bg-${color}-500`) — they get purged at build time.

**Prevention:** Use inline styles for role colors, same pattern as existing `GoalItem` component with `borderLeft` style.

### 7. `showModal()` Throws If Already Open

**Risk:** Calling `showModal()` when dialog is already open throws `InvalidStateError`.

**Prevention:** Always guard: `if (!dialog.open) dialog.showModal()` in the `useEffect` that syncs React state to the imperative API.

</common_pitfalls>

<code_examples>

## Code Examples

### Dexie: Efficient Week Index Queries

```typescript
// Get all existing week IDs, sorted chronologically (ascending)
const weekIds = await db.weeks.orderBy('id').primaryKeys();
// Returns: ["2026-W10", "2026-W11", "2026-W12"]

// Get latest (most recent) week
const [latestId] = await db.weeks.orderBy('id').reverse().limit(1).primaryKeys();

// Get adjacent existing week for navigation
const [prevId] = await db.weeks.where('id').below(currentWeekId).reverse().limit(1).primaryKeys();
const [nextId] = await db.weeks.where('id').above(currentWeekId).limit(1).primaryKeys();
```

### useLiveQuery: Reactive Week Index

```typescript
import { useLiveQuery } from 'dexie-react-hooks';

const existingWeekIds = useLiveQuery(
  () => db.weeks.orderBy('id').primaryKeys(),
  [],   // no deps (static query)
  []    // default empty array while loading
);
// Auto-updates when weeks are added/removed from IndexedDB
```

### Native Dialog: Controlled Pattern

```typescript
function CarryoverDialog({ open, onClose, onConfirm }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleCancel = (e: Event) => { e.preventDefault(); onClose(); };
    dialog.addEventListener('cancel', handleCancel);
    return () => dialog.removeEventListener('cancel', handleCancel);
  }, [onClose]);

  return (
    <dialog ref={dialogRef} className="backdrop:bg-black/50 rounded-lg border border-border bg-card p-6 shadow-xl">
      {/* checklist content */}
      <form method="dialog">
        <button value="carry-over" onClick={() => onConfirm(selectedGoals)}>Carry Over Selected</button>
        <button value="start-fresh" onClick={() => onConfirm([])}>Start Fresh</button>
      </form>
    </dialog>
  );
}
```

### Stale-Request Guard for Navigation

```typescript
navigateToWeek: async (weekId: WeekId) => {
  set({ selectedWeekId: weekId, isLoading: true });
  const week = await getWeek(weekId);
  // Guard: only set if still the selected week
  if (get().selectedWeekId === weekId) {
    set({ currentWeek: week, isLoading: false });
  }
}
```

</code_examples>

<sota_updates>

## State of the Art

### Native `<dialog>` — Community Consensus (2025+)

Prefer native `<dialog>` + `showModal()` over library solutions (react-modal, Radix Dialog) for simple modals. Provides top-layer rendering (no z-index battles), `::backdrop`, focus management, and Esc dismissal natively. React 19 eliminates the need for `forwardRef` when passing refs.

### React 19 `useTransition` for Navigation

The idiomatic way to handle view transitions in React 19. Keeps old content visible while new content loads, replacing the "spinner then swap" pattern. Ideal for week switching where Dexie reads are fast but not synchronous.

### `useLiveQuery` for Reactive IndexedDB

Current recommended approach for reactive Dexie queries in React (replaces manual `db.on('changes')` subscriptions). Automatically re-renders components when relevant IndexedDB data changes.

### URL State Not Needed

For client-side-only local-first apps, Zustand state is simpler than URL searchParams. No SSR, no deep linking, no sharing requirement. URL state can be added later via `nuqs` or `useSearchParams` if needed.

### `forwardRef` Deprecated in React 19

React 19 passes `ref` as a regular prop. Dialog component patterns are simpler — just accept `ref` in props, no `forwardRef` wrapper needed.

</sota_updates>

<open_questions>

## Open Questions

1. **53-week year handling:** Does `getNextWeekId('2020-W53')` correctly produce `2021-W01`? The algorithm (add 7 days, recalculate) should handle this, but needs explicit test coverage.

2. **`loadWeek` refactoring scope:** The current auto-creation is also used for initial app load. The split into "load existing" vs "create new" must preserve the first-ever-open path where auto-creation is desired (detected by `db.weeks.count() === 0`).

3. **Banner persistence across navigation:** Locked decision says banner shows when current week doesn't exist. Should it show on every week view, or only when viewing the most recent week? Recommend: show on every view as a persistent prompt — it's non-intrusive and reminds the user to plan the current week regardless of which past week they're browsing.

</open_questions>

<sources>

## Sources

### From External Docs Agent
- [MDN `<dialog>` element](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog) — Modal API, `showModal()`, `::backdrop`, cancel/close events
- [Dexie.js Collection.primaryKeys()](https://dexie.org/docs/Collection/Collection.primaryKeys()) — Efficient key-only queries
- [Dexie.js WhereClause.above/below()](https://dexie.org/docs/) — Range queries for adjacent week lookup
- [Dexie-react-hooks useLiveQuery](https://dexie.org/docs/dexie-react-hooks/useLiveQuery()) — Reactive IndexedDB queries
- [React 19 useTransition docs](https://react.dev/reference/react/useTransition) — Non-blocking state transitions
- [Tailwind CSS v4 starting: variant](https://stevekinney.com/courses/tailwind/starting-style) — `@starting-style` CSS rules for dialog animations
- [Dialog styling with Tailwind](https://benjamincrozat.com/dialog-backdrop-styling-tailwind-css) — `backdrop:` modifier usage

### From Codebase Analysis Agent
- `src/stores/weekStore.ts:141-158` — `withWeek` optimistic update pattern
- `src/stores/weekStore.ts:174-191` — `loadWeek` auto-creation behavior (must refactor)
- `src/stores/weekStore.ts:104-129` — `createEmptyWeek` helper (accepts `carryOverRoles`)
- `src/components/calendar/WeekView.tsx:22` — `weekId` prop, defaults to `getCurrentWeekId()`
- `src/lib/db.ts:192-207` — `getAllWeeks` with order support
- `src/lib/db.ts:213-216` — `weekExists` guard
- `src/components/ui/CompletionCheckbox.tsx` — Reusable in carryover dialog
- `src/lib/role-colors.ts` — `getRoleColorStyle()` for role indicators in dialog
- `dexie-react-hooks` installed but unused — `useLiveQuery` available

### From Best Practices Agent
- [Max Rozen - Race conditions in React useEffect](https://maxrozen.com/race-conditions-fetching-data-react-with-useeffect) — Stale-request guard pattern
- [Tom Hazledine - What even is a week?](https://tomhazledine.com/what-is-an-iso-week/) — ISO week boundary edge cases
- [CSS-Tricks - No need to trap focus on dialog](https://css-tricks.com/there-is-no-need-to-trap-focus-on-a-dialog-element/) — Native dialog focus handling
- [NN/G - Date Input Guidelines](https://www.nngroup.com/articles/date-input/) — Disable vs. hide for boundary arrows
- [Smashing Magazine - Pagination patterns](https://www.smashingmagazine.com/2007/11/pagination-gallery-examples-and-good-practices/) — Arrow disable pattern at edges

</sources>

<metadata>

## Metadata

| Field | Value |
|-------|-------|
| Phase | 08-week-navigation |
| Mode | implementation |
| Date | 2026-03-22 |
| Agents | external-docs (ms-researcher), codebase-patterns (ms-codebase-researcher), best-practices (ms-researcher) |
| Conflicts | None — all 3 agents aligned on approach |
| New Dependencies | None |
| Confidence | HIGH across all sections |

</metadata>
