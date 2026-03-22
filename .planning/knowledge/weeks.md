# weeks

> Self-contained weekly snapshots identified by ISO week ID (YYYY-Www), each embedding its own roles, goals, priorities, time blocks, and evening blocks.

## Decisions

| Decision | Rationale | Source |
|----------|-----------|--------|
| Snapshot model, not global entities | Historical accuracy, matches Sheets | Phase 01-02 |
| ISO week ID format (YYYY-Www) | Natural lexicographic sorting | Phase 01-02 |
| loadWeek never auto-creates; only createNewWeek creates | Every week must be intentionally created; auto-creation on navigate would pollute week history | Phase 08-01 |
| Role carry-over with fresh UUIDs (always) | Prevents cross-week references | Phase 01-02 |
| Goal carry-over opt-in via dialog | Covey-aligned intentionality — user re-commits to each goal | Phase 08-01 |
| Custom dropdown for target week selection, not native `<input type="week">` | Native week inputs render inconsistently across browsers | adhoc-01 |
| Carryover target week range: 11 weeks (current + 10 future) | Reasonable planning horizon without overwhelming the user | adhoc-01 |
| Smart default scans forward from getNextWeekId(viewedWeekId), wraps if all remaining planned, falls back to first if all planned | Surfaces the most actionable default without requiring user action | adhoc-01 |
| Week starts Monday (ISO 8601) | Standard convention | Phase 01-02 |
| DayOfWeek 0=Sunday through 6=Saturday | Matches JS Date.getDay() convention | Phase 02-02 |
| createdAt + updatedAt timestamps | Enables sort-by-recent and sync prep | Phase 01-02 |

## Architecture

- **Week interface**: `id` (WeekId), `startDate` (ISO string of Monday), `roles[]`, `goals[]`, `dayPriorities[]`, `timeBlocks[]`, `eveningBlocks[]`, `createdAt`, `updatedAt`.
- **WeekId**: branded string type (`string & { __brand: "WeekId" }`) for type safety.
- **Week ID calculation**: `getWeekId(date)` uses ISO 8601 algorithm (week 1 contains first Thursday). Formats as `"2026-W03"`.
- **Navigation**: `getNextWeekId(weekId)` / `getPreviousWeekId(weekId)` add/subtract 7 days from parsed Monday.
- **`formatWeekId`**: Converts `"2026-W03"` to `"Jan 13-19, 2026"` for display, handles cross-month ranges.
- **`getWeekDates(weekId)`**: Returns 7 Date objects in DayOfWeek order (index 0 = Sunday, 1 = Monday, ..., 6 = Saturday). Sunday is calculated as Monday - 1 day.
- **Navigation state**: `selectedWeekId` in Zustand drives displayed week. `navigateToWeek(weekId)` is the coordinator: sets `selectedWeekId`, calls `loadWeek`, stale-request guards the result. `loadWeek(weekId)` returns null if week doesn't exist — no auto-creation.
- **Reactive week index**: `useLiveQuery(() => db.weeks.orderBy('id').primaryKeys())` in `WeekNavigation` component provides a sorted list of all existing week IDs. Auto-updates when weeks are created/deleted. YYYY-Www lexicographic order equals chronological order — no custom sort needed.
- **First-ever open detection**: `WeekView` checks `db.weeks.count() === 0` on mount. If zero weeks exist, auto-creates current week without dialog. Otherwise navigates to the latest existing week and shows the "Plan this week?" banner if current calendar week doesn't exist.
- **Stale-request guard**: After `await getWeek(weekId)`, `navigateToWeek` checks `get().selectedWeekId === weekId` before calling `set()`. Prevents rapid-click race condition where a slow earlier response overwrites a faster later one.
- **Load flow**: `WeekView` initializes on mount. If first-ever use (no weeks), auto-creates current week. Otherwise calls `navigateToWeek(latestWeekId)`. Subsequent navigation via arrow buttons calls `navigateToWeek` directly.
- **Empty week creation**: `createEmptyWeek(weekId, carryOverRoles?)` -- if roles provided, copies them with new UUIDs; all arrays start empty; timestamps set to now.
- **`getWeekNumber(weekId)`**: Extracts the numeric week number from a WeekId string (e.g. `"2026-W03"` → `3`). Pure utility, no date arithmetic.
- **`getWeekIdRange(startWeekId, count)`**: Generates an array of `count` consecutive WeekIds starting from `startWeekId`, using `getNextWeekId` iteration. Encapsulates loop logic so components receive a plain array.
- **CarryoverDialog target week**: Accepts `viewedWeekId` prop from WeekView (passes `selectedWeekId`). Uses `useLiveQuery` to fetch existing week primary keys from Dexie; computes smart default from the 11-week range on first render; shows `WeekSelector` dropdown for user override.
- **Dexie storage**: Single `weeks` table with `id` primary key, `startDate` and `createdAt` indexed for queries.

## Pitfalls

- **DayOfWeek vs ISO convention**: `DayOfWeek` uses 0=Sunday (JS convention) but ISO weeks start Monday. The `getWeekDates` function handles this mapping but callers must be aware index 0 is Sunday, not Monday.
- **Week ID parsing edge cases**: `parseWeekId` throws on invalid format. Year boundary weeks (e.g., week 1 of a new year that starts in December) are handled by the ISO 8601 algorithm.
- **Goal carryover maps by role name match**: `createNewWeek` matches source goals to new-week roles by role name, not role ID. Fresh UUIDs assigned to carried-over goals. Use for-loop not map+filter to avoid TypeScript inference issues with optional `notes` field.
- **Banner shows whenever current calendar week doesn't exist**: Shown unconditionally regardless of which past week the user is browsing. Triggers the same carryover dialog as "+New" button.

## Key Files

- `src/types/index.ts` -- Week, WeekId, DayOfWeek type definitions
- `src/stores/weekStore.ts` -- `loadWeek`, `createWeek`, `saveCurrentWeek`; `createEmptyWeek` helper
- `src/lib/utils.ts` -- `getWeekId`, `parseWeekId`, `formatWeekId`, `getCurrentWeekId`, `getNextWeekId`, `getPreviousWeekId`, `getWeekDates`, `getWeekNumber`, `getWeekIdRange`
- `src/lib/db.ts` -- `getWeek`, `saveWeek`, `getAllWeeks`, `weekExists` Dexie operations
- `src/components/calendar/WeekView.tsx` -- Initialization logic (first-ever vs. navigate-to-latest), wires navigation and carryover dialog
- `src/components/calendar/WeekNavigation.tsx` -- Navigation header with arrows, Today, +New buttons, and "Plan this week?" banner; uses useLiveQuery for reactive week index
- `src/components/calendar/WeekSelector.tsx` -- Custom dropdown: "Wxx -- date range" label format, Planned badge on existing weeks, outside-click and Escape close
- `src/components/calendar/CarryoverDialog.tsx` -- Native dialog with goal checkboxes grouped by role; drives createNewWeek on confirm; WeekSelector for target week with smart default and amber overwrite warning
