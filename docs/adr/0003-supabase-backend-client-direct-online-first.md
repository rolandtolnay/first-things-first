# Supabase backend: client-direct with RLS, online-first

The app moves from offline-first IndexedDB (Dexie, scoped to one browser) to **Supabase (Postgres + Auth) as the single source of truth**. The browser talks to Supabase **directly** via `supabase-js`; security is enforced by **Row Level Security** (`auth.uid() = user_id`), not by an API/proxy layer — adding route handlers to relay database calls would be redundant work given RLS is the boundary. The app is **online-first**: Dexie is dropped, with no offline cache or sync engine, because a single-user tool does not need conflict resolution and the existing optimistic-update pattern keeps the UI feeling instant. Authentication is passwordless **magic link**, wired into Next.js via `@supabase/ssr` + a thin `middleware.ts` (cookie sessions, token refresh, route gating).

## Consequences

- The app now requires a network connection. The optimistic-update pattern preserves an instant feel, and an offline cache can be re-added later behind the unchanged `db.ts` seam without touching the store.
- Security lives in RLS policies, not application code — a missing or wrong policy is a data-exposure bug, so the policies are the thing to review.
- Concurrent edits to the *same* week from two devices resolve last-write-wins (a full-week upsert, no field-level merge). Acceptable for a single user.
- Lock-in: Supabase is now both the auth provider and the datastore; replacing it would be a meaningful migration.
- `DatabaseProvider` and the Safari `requestPersistentStorage` / `initializeDatabase` machinery in `db.ts` are removed — they existed only to protect IndexedDB.
