-- roles: durable user-owned Role defaults.
-- Weeks still store Role Snapshots inside their JSONB document; this table owns
-- stable Role identity, default name/color/order, and archive state.

create table public.roles (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default (auth.uid()) references auth.users (id) on delete cascade,
  name        text not null,
  color       text not null,
  order_index integer not null,
  archived_at timestamptz null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint roles_color_check check (
    color in ('teal', 'amber', 'rose', 'violet', 'emerald', 'orange', 'sky', 'fuchsia', 'blue')
  )
);

alter table public.roles enable row level security;

create policy "Users manage their own roles"
  on public.roles
  for all
  to authenticated
  using ( (select auth.uid()) = user_id )
  with check ( (select auth.uid()) = user_id );

-- Active Role names are unique per User after trimming/case normalization.
create unique index roles_active_name_unique
  on public.roles (user_id, lower(btrim(name)))
  where archived_at is null;

create index roles_active_order_idx
  on public.roles (user_id, order_index)
  where archived_at is null;

-- Explicit Data API exposure for signed-in users only; RLS scopes rows.
grant select, insert, update, delete on table public.roles to authenticated;
