# Supabase Auth & Cloud Persistence

## Problem Statement

A user's entire plan — their Weeks, Roles, Goals, Day Priorities, and time/evening blocks — lives only in the IndexedDB of the one browser they created it in. There is no account, so the data is anonymous, undiscoverable, and trapped: open the app on a second device (or a fresh browser, or after the browser evicts storage) and the plan is simply gone. For a tool whose whole premise is steady weekly planning, "your weeks only exist on this one machine" is a real liability.

## Solution

The app gains a **User**: you sign in with a passwordless magic link, and from then on your Weeks are stored in the cloud (Supabase) and private to you. Sign in on any device and the same plans are there. Editing still feels instant, and signing out is one click. The change is invisible in day-to-day use — the planner looks and behaves exactly as before — but the data is now durable, portable, and owned.

## User Stories

1. As a user, I want to sign in with a magic link sent to my email, so that I can reach my plans without creating or remembering a password.
2. As a user, I want clear feedback while the link is sending and once it's sent ("check your email"), so that I know what to do next.
3. As a user, I want a clear, recoverable error if the link fails to send or the link I click is invalid or expired, so that I can simply try again.
4. As a user, I want clicking the magic link to land me back in the app already signed in, so that sign-in is seamless.
5. As a user, I want to be redirected to a login page whenever I'm not authenticated, so that my planning data is never shown without a session.
6. As a user, I want my session to persist across visits, so that I rarely have to sign in again.
7. As a user, I want my Weeks stored in the cloud and available on any device I sign in on, so that my planning is durable and portable rather than tied to one browser.
8. As a user, I want to see only my own data, so that my plans stay private to me.
9. As a user, I want my edits to feel instant even though they persist to the cloud, so that planning stays fluid.
10. As a user, I want to be told when a change fails to save, so that I never lose work silently.
11. As a user, I want to sign out from the Settings dialog, which shows the email I'm signed in as, so that I can end my session and confirm which account I'm using.
12. As a user, I want signing out in one tab to sign me out in all open tabs, so that my session state stays consistent.
13. As a first-time user, I want to start with a clean, empty workspace on first sign-in, so that I begin planning fresh without importing legacy local data.

## Implementation Decisions

### Backend and access model — see ADR-0003

- **Supabase (Postgres + Auth) is the single source of truth; the app is online-first.** IndexedDB/Dexie is removed entirely — there is no local cache or sync engine.
- **The browser talks to Supabase directly** via `supabase-js`. There is **no API/proxy layer**. Security is enforced by **Row Level Security**, not application code.
- The existing **optimistic-update** pattern is preserved: state updates locally first, then persists, so the UI still feels instant despite network round-trips.
- **Multi-device concurrent edits resolve last-write-wins** (a full-Week upsert; no field-level merge). Accepted for a single user.

### Data model — see ADR-0004

A single `weeks` table stores each Week as a document, with only the columns needed for ownership, filtering, and sorting promoted out of the snapshot. The Week's `id` (ISO week string, e.g. `"2026-W03"`) is no longer globally unique — it is unique **per user** — so the primary key is composite. The snapshot is **not** normalized.

```sql
create table weeks (
  id          text not null,                 -- WeekId, e.g. "2026-W03"
  user_id     uuid not null references auth.users(id) on delete cascade,
  start_date  date not null,
  data        jsonb not null,                -- the whole Week snapshot
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  primary key (user_id, id)
);

alter table weeks enable row level security;

create policy "own weeks" on weeks
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

- `updated_at` mirrors the snapshot's `updatedAt` on each write; an auto-update trigger is an optional later refinement, not required.
- **Entity IDs stay client-generated UUIDs** (`crypto.randomUUID()`). Postgres does not assign IDs.

### Persistence adapter

The store's persistence seam keeps the **same interface it already depends on** — the five operations below — re-implemented against Supabase and scoped to the current user. The store's actions, the `withWeek` transition→persist pattern, and all pure logic (Time Model, Scheduling, Role Balance, drop-routing) are untouched.

```ts
getWeek(weekId): Promise<Week | undefined>
saveWeek(week): Promise<WeekId>          // upsert into weeks for the current user
deleteWeek(weekId): Promise<void>
getAllWeeks(limit?, order?): Promise<Week[]>
weekExists(weekId): Promise<boolean>
```

- A **pure mapping module** (`weekToRow` / `rowToWeek`) translates between a `weeks` row (promoted columns + `data` jsonb) and a `Week` object. This is the isolation-testable core; the adapter functions around it are thin Supabase I/O.

### Authentication and session

- **Magic link** (passwordless) via Supabase Auth, wired into Next.js with **`@supabase/ssr`**: browser and server client factories plus a thin **middleware** that refreshes the Session (cookie-based) and **gates routes**, redirecting unauthenticated requests to `/login`.
- A **callback route** exchanges the magic-link code for a Session, then redirects to the originally requested page (or the app root).
- An **AuthProvider** (client) replaces the removed `DatabaseProvider` in the root provider tree, exposing session state to the app.
- **Sessions persist** across visits via refresh tokens; signing in is rare after the first time.

### Auth-gate UX

- `/login` is a dedicated route rendered **outside the authenticated app shell** — no Sidebar, Rail, or WeekView — using a minimal layout that still wears the **Window Chrome** frame for visual continuity.
- The login surface is a small state machine; the look is **composed from the installed shadcn primitives and Dark Workspace tokens** (no new visual language), not specified here:

```
entry  ──submit──▶ sending ──ok───▶ sent ("check your email")
  ▲                    └──error──▶ error ──retry──▶ entry
```

- Middleware preserves the originally requested path so the user returns to it after signing in.

### Logout

- Sign-out lives in the **existing Settings dialog** in Window Chrome (today an empty extension shell), shown alongside the **signed-in email** as an identity indicator.
- The action calls `supabase.auth.signOut()`; the cleared Session causes middleware to redirect to `/login`. **No local data purge is needed** (online-first — nothing cached).
- Multi-tab consistency is handled by `supabase-js` auth-state broadcasting; other tabs drop to `/login` automatically.

### Error surfacing

- Saves can now fail over the network. Failures **reuse the store's existing `error` state** (already used for load failures) — **no toast library is added**.

### Removals and config

- Remove `DatabaseProvider`, the Dexie dependencies, and the Safari `requestPersistentStorage` / `initializeDatabase` machinery; clean up stale Dexie references.
- Provision a Supabase project; supply `NEXT_PUBLIC_SUPABASE_URL` and the anon key via environment variables locally and in Vercel.

## Testing Decisions

A good test here asserts **external behavior**, not implementation details: given inputs, the right output/state — never "which private helper was called."

- **`weekToRow` / `rowToWeek` mapping** (new unit test in `src/lib/__tests__/`): round-trip fidelity (`rowToWeek(weekToRow(w))` reconstructs the Week), correct promotion of `id` / `user_id` / `start_date`, and faithful preservation of the nested snapshot. Prior art: the pure-module suites `scheduling.test.ts`, `time-model.test.ts`, `role-balance.test.ts`, `drop-routing.test.ts`.
- **Week store persistence** (update the existing `weekStore.test.ts`): swap the Dexie mock for a mocked persistence adapter, keep coverage of the optimistic-update → persist contract, and add a case proving a **save failure surfaces through the `error` state** (and does not silently drop the edit). Prior art: the current `src/stores/__tests__/weekStore.test.ts`.
- **Not unit-tested:** auth/middleware wiring, the `/login` UI, and the Settings dialog — verified by running the flow (manual / agent-browser), consistent with how UI and `role-colors` are handled today.

## Out of Scope

- **Offline support** — no local cache or sync engine; the app requires a connection (ADR-0003). The clean adapter seam keeps an offline cache a future option.
- **Sharing, collaboration, teams** — ownership is exclusive; `user_id` leaves the door open but nothing multi-user ships now.
- **Realtime subscriptions.**
- **Normalized schema and cross-week analytics tables** (ADR-0004); stats stay client-side over loaded Weeks and gain no new features here.
- **OAuth and email/password** auth methods — magic link only.
- **Importing existing IndexedDB data** — first sign-in starts fresh.
- **Field-level merge / conflict resolution** — last-write-wins is accepted.

## Further Notes

- The migration is deliberately contained: the only logic that changes is the persistence adapter, the store's persistence calls, the provider tree, and the new auth surfaces. The Time Model, Scheduling, Role Balance, and drop-routing modules are untouched.
- New domain vocabulary (**User**, **Session**, exclusive User→Weeks ownership) is recorded in `CONTEXT.md`; the two lock-in decisions are recorded in ADR-0003 (Supabase backend, client-direct, online-first) and ADR-0004 (Week as a JSONB document).
- Logistics to handle during setup: provisioning the Supabase project, configuring the magic-link email, and adding env vars locally and in Vercel.
