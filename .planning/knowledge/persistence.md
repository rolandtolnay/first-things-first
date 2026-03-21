# persistence

> IndexedDB via Dexie.js with a single `weeks` table storing complete week snapshots, optimistic Zustand updates, and Safari persistent storage handling.

## Decisions

| Decision | Rationale | Source |
|----------|-----------|--------|
| Dexie.js for IndexedDB, not localStorage | Structured data, larger capacity | PROJECT.md |
| Zustand + Dexie, not Zustand persist | Optimistic UI with durable storage | PROJECT.md |
| Week snapshot model (self-contained) | Historical accuracy, no shared refs | Phase 01-02 |
| Single `weeks` table, not normalized | Simpler queries, atomic week updates | Phase 01-02 |
| Safari persistent storage request | Prevents 7-day eviction on Safari | Phase 01-02 |
| crypto.randomUUID() for IDs | No external UUID library needed | Phase 01-02 |
| ISO week format for week IDs | Natural lexicographic sort (YYYY-Www) | Phase 01-02 |
| Auth + cloud sync deferred to post-v1 | Ship faster, no backend dependency | PROJECT.md |

## Architecture

- **Dexie database**: `FirstThingsFirstDB` extends Dexie with `weeks` table. Schema v1 indexes: `id` (primary), `startDate`, `createdAt`.
- **Singleton instance**: `export const db = new FirstThingsFirstDB()` imported by stores.
- **Week operations**: `getWeek`, `saveWeek` (put = upsert), `deleteWeek`, `getAllWeeks` (ordered by createdAt), `weekExists`.
- **Initialization**: `initializeDatabase()` opens DB, calls `requestPersistentStorage()`, logs storage estimate. Guarded by `initialized` flag for idempotency.
- **DatabaseProvider**: React component wrapping children, calls `initializeDatabase` in useEffect. Renders children immediately (non-blocking) -- stores handle loading states.
- **Optimistic update pattern**: `withWeek(get, set, updater)` reads currentWeek, applies updater to Zustand state, then calls `saveCurrentWeek()` which puts to Dexie.
- **`saveCurrentWeek()`**: Reads `get().currentWeek`, stamps `updatedAt`, sets back to Zustand, writes to Dexie via `saveWeek`.
- **`loadWeek(weekId)`**: Fetches from Dexie. If absent, calls `createWeek` to create empty week. Sets `currentWeek` in store.
- **Week creation with carry-over**: `createWeek(weekId, carryOverRoles?)` copies role names/colors with fresh UUIDs.
- **ID generation**: `crypto.randomUUID()` wrapped in `generateId()`.
- **Week ID utilities**: `getWeekId(date)`, `parseWeekId(weekId)`, `getCurrentWeekId()`, `getNextWeekId()`, `getPreviousWeekId()`, `formatWeekId()`.

## Pitfalls

- **Safari 7-day eviction**: Without `navigator.storage.persist()`, Safari may evict IndexedDB data after 7 days of inactivity. The `requestPersistentStorage` call is critical.
- **Persistence grant not guaranteed**: `navigator.storage.persist()` may return false (denied). The app logs a warning but continues -- data may be evicted under storage pressure.
- **Non-blocking init**: `DatabaseProvider` renders children before DB is ready. Components must handle `currentWeek === null` state (loading state in stores).
- **No offline error handling**: If Dexie write fails, the optimistic Zustand state diverges from IndexedDB. No retry or reconciliation logic exists.

## Key Files

- `src/lib/db.ts` -- Dexie database class, singleton, week CRUD, storage persistence
- `src/stores/weekStore.ts` -- Zustand store with optimistic updates and Dexie persistence
- `src/providers/DatabaseProvider.tsx` -- React provider that initializes DB on mount
- `src/lib/utils.ts` -- Week ID parsing, formatting, navigation utilities
- `src/types/index.ts` -- WeekId branded type, Week interface (the persisted shape)
