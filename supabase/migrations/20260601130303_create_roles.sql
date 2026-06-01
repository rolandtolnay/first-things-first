-- roles: durable user-owned Role defaults.
-- Weeks still store Role Snapshots inside their JSONB document; this table owns
-- stable Role identity, default name/color/order, and archive state.

create type public.role_color as enum (
  'teal',
  'amber',
  'rose',
  'violet',
  'emerald',
  'orange',
  'sky',
  'fuchsia',
  'blue'
);

create table public.roles (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default (auth.uid()) references auth.users (id) on delete cascade,
  name        text not null,
  color       public.role_color not null,
  order_index integer not null,
  archived_at timestamptz null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint roles_name_not_blank_check check (btrim(name) <> ''),
  constraint roles_order_non_negative_check check (order_index >= 0)
);

alter table public.roles enable row level security;

create policy "Users can read their own roles"
  on public.roles
  for select
  to authenticated
  using ( (select auth.uid()) = user_id );

create policy "Users can create their own roles"
  on public.roles
  for insert
  to authenticated
  with check ( (select auth.uid()) = user_id );

create policy "Users can update their own roles"
  on public.roles
  for update
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

create or replace function public.reorder_roles(role_ids uuid[])
returns setof public.roles
language plpgsql
security invoker
set search_path = public
as $$
declare
  requested_count integer;
  distinct_count integer;
  active_count integer;
  updated_count integer;
begin
  select count(*), count(distinct requested.role_id)
    into requested_count, distinct_count
  from unnest(role_ids) as requested(role_id);

  if requested_count <> distinct_count then
    raise exception 'Role reorder ids must be unique';
  end if;

  select count(*)
    into active_count
  from public.roles as roles_row
  where roles_row.user_id = (select auth.uid())
    and roles_row.archived_at is null;

  if requested_count <> active_count then
    raise exception 'Role reorder ids must include every active role exactly once';
  end if;

  with requested as (
    select requested.role_id, requested.ordinality - 1 as order_index
    from unnest(role_ids) with ordinality as requested(role_id, ordinality)
  )
  update public.roles as roles_row
  set order_index = requested.order_index,
      updated_at = now()
  from requested
  where roles_row.id = requested.role_id
    and roles_row.user_id = (select auth.uid())
    and roles_row.archived_at is null;

  get diagnostics updated_count = row_count;
  if updated_count <> requested_count then
    raise exception 'Role reorder ids must all be active roles owned by the current user';
  end if;

  return query
  select roles_row.*
  from unnest(role_ids) with ordinality as requested(role_id, ordinality)
  join public.roles as roles_row on roles_row.id = requested.role_id
  where roles_row.user_id = (select auth.uid())
    and roles_row.archived_at is null
  order by requested.ordinality;
end;
$$;

-- Explicit Data API exposure for signed-in users only; RLS scopes rows.
grant select, insert, update on table public.roles to authenticated;
grant execute on function public.reorder_roles(uuid[]) to authenticated;
