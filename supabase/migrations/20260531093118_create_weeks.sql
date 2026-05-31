-- weeks: one row per Week, owned by exactly one User.
-- The Week's id (ISO week string, e.g. "2026-W21") is unique PER USER, so the
-- primary key is composite (user_id, id). The whole Week snapshot lives in the
-- `data` jsonb column; only the columns needed for ownership, filtering, and
-- sorting are promoted out of it (ADR-0004).

create table public.weeks (
  id          text not null,                                   -- WeekId, e.g. "2026-W21"
  user_id     uuid not null references auth.users (id) on delete cascade,
  start_date  date not null,
  data        jsonb not null,                                  -- whole Week snapshot
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  primary key (user_id, id)
);

alter table public.weeks enable row level security;

-- Ownership policy: TO authenticated + a (select auth.uid()) ownership predicate
-- in both USING and WITH CHECK. "for all" covers SELECT/INSERT/UPDATE/DELETE;
-- UPDATE needs both clauses (USING to read the row, WITH CHECK so a user can't
-- reassign user_id to someone else). Supabase RLS best practice.
create policy "Users manage their own weeks"
  on public.weeks
  for all
  to authenticated
  using ( (select auth.uid()) = user_id )
  with check ( (select auth.uid()) = user_id );

-- "Automatically expose new tables" was OFF at project creation, so grant the
-- Data API role explicitly. anon is intentionally NOT granted — only signed-in
-- users reach this table, and RLS scopes them to their own rows.
grant select, insert, update, delete on table public.weeks to authenticated;
