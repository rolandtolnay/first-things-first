# weeks

> Self-contained weekly snapshots identified by ISO week ID (YYYY-Www), each embedding its own roles, goals, priorities, time blocks, and evening blocks.

## Decisions

| Decision | Rationale | Source |
|----------|-----------|--------|
| Snapshot model, not global entities | Historical accuracy, matches Sheets | Phase 01-02 |
| ISO week ID format (YYYY-Www) | Natural lexicographic sorting | Phase 01-02 |
| Auto-create week on load if absent | Seamless first-use experience | Phase 03-02 |
| Role carry-over with fresh UUIDs | Prevents cross-week references | Phase 01-02 |
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
- **Load flow**: `WeekView` calls `loadWeek(currentWeekId)` on mount. Store fetches from Dexie; if not found, calls `createWeek` which builds an empty week (optionally with carried-over roles) and persists it.
- **Empty week creation**: `createEmptyWeek(weekId, carryOverRoles?)` -- if roles provided, copies them with new UUIDs; all arrays start empty; timestamps set to now.
- **Dexie storage**: Single `weeks` table with `id` primary key, `startDate` and `createdAt` indexed for queries.

## Pitfalls

- **DayOfWeek vs ISO convention**: `DayOfWeek` uses 0=Sunday (JS convention) but ISO weeks start Monday. The `getWeekDates` function handles this mapping but callers must be aware index 0 is Sunday, not Monday.
- **Week ID parsing edge cases**: `parseWeekId` throws on invalid format. Year boundary weeks (e.g., week 1 of a new year that starts in December) are handled by the ISO 8601 algorithm.
- **No week navigation UI yet**: `getNextWeekId`/`getPreviousWeekId` exist but no UI for switching weeks is implemented.
- **Carry-over loses goals**: Only roles are carried over to new weeks, not goals. This is intentional (fresh planning each week per Covey method).

## Key Files

- `src/types/index.ts` -- Week, WeekId, DayOfWeek type definitions
- `src/stores/weekStore.ts` -- `loadWeek`, `createWeek`, `saveCurrentWeek`; `createEmptyWeek` helper
- `src/lib/utils.ts` -- `getWeekId`, `parseWeekId`, `formatWeekId`, `getCurrentWeekId`, `getNextWeekId`, `getPreviousWeekId`, `getWeekDates`
- `src/lib/db.ts` -- `getWeek`, `saveWeek`, `getAllWeeks`, `weekExists` Dexie operations
- `src/components/calendar/WeekView.tsx` -- Triggers `loadWeek` on mount, renders week header with date range
