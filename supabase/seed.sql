-- Local-only seed data for `supabase db reset`.
-- Production is never seeded from this file by the app's prod migration workflow.

-- Deterministic local User used by README/docs: dev@example.com.
insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  is_sso_user
)
values (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-4000-8000-000000000001',
  'authenticated',
  'authenticated',
  'dev@example.com',
  null,
  '2026-06-15T08:00:00Z',
  '2026-06-15T08:00:00Z',
  '2026-06-15T08:00:00Z',
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"Local Developer"}'::jsonb,
  false,
  false
)
on conflict (id) do update set
  email = excluded.email,
  email_confirmed_at = excluded.email_confirmed_at,
  raw_app_meta_data = excluded.raw_app_meta_data,
  raw_user_meta_data = excluded.raw_user_meta_data,
  updated_at = excluded.updated_at;

insert into auth.identities (
  provider_id,
  user_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
)
values (
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000001',
  '{"sub":"00000000-0000-4000-8000-000000000001","email":"dev@example.com","email_verified":true,"phone_verified":false}'::jsonb,
  'email',
  '2026-06-15T08:00:00Z',
  '2026-06-15T08:00:00Z',
  '2026-06-15T08:00:00Z'
)
on conflict (provider, provider_id) do update set
  user_id = excluded.user_id,
  identity_data = excluded.identity_data,
  updated_at = excluded.updated_at;

insert into public.roles (id, user_id, name, color, order_index, archived_at, created_at, updated_at)
values
  ('11111111-1111-4111-8111-111111111111', '00000000-0000-4000-8000-000000000001', 'Craft', 'amber', 0, null, '2026-06-15T08:00:00Z', '2026-06-15T08:00:00Z'),
  ('22222222-2222-4222-8222-222222222222', '00000000-0000-4000-8000-000000000001', 'Health', 'emerald', 1, null, '2026-06-15T08:00:00Z', '2026-06-15T08:00:00Z'),
  ('33333333-3333-4333-8333-333333333333', '00000000-0000-4000-8000-000000000001', 'Home', 'sky', 2, null, '2026-06-15T08:00:00Z', '2026-06-15T08:00:00Z')
on conflict (id) do update set
  name = excluded.name,
  color = excluded.color,
  order_index = excluded.order_index,
  archived_at = excluded.archived_at,
  updated_at = excluded.updated_at;

insert into public.weeks (id, user_id, start_date, data, created_at, updated_at)
values
  (
    '2026-W25',
    '00000000-0000-4000-8000-000000000001',
    '2026-06-15',
    '{
      "id":"2026-W25",
      "startDate":"2026-06-15T00:00:00.000Z",
      "roles":[
        {"id":"11111111-1111-4111-8111-111111111111","name":"Craft","color":"amber","order":0},
        {"id":"22222222-2222-4222-8222-222222222222","name":"Health","color":"emerald","order":1},
        {"id":"33333333-3333-4333-8333-333333333333","name":"Home","color":"sky","order":2}
      ],
      "goals":[
        {"id":"goal-ship-local-dev","roleId":"11111111-1111-4111-8111-111111111111","text":"Make local Supabase the default dev backend","notes":"Keep production as the only hosted Supabase project.","completed":false},
        {"id":"goal-morning-run","roleId":"22222222-2222-4222-8222-222222222222","text":"Run three mornings","completed":false},
        {"id":"goal-dinner-plan","roleId":"33333333-3333-4333-8333-333333333333","text":"Plan dinners for the week","completed":true}
      ],
      "dayPriorities":[
        {"id":"priority-local-dev","goalId":"goal-ship-local-dev","dayIndex":0,"order":0,"completed":false},
        {"id":"priority-run","goalId":"goal-morning-run","dayIndex":1,"order":0,"completed":false},
        {"id":"priority-dinner","goalId":"goal-dinner-plan","dayIndex":2,"order":0,"completed":true}
      ],
      "timeBlocks":[
        {"id":"block-local-dev","type":"goal","goalId":"goal-ship-local-dev","roleId":"11111111-1111-4111-8111-111111111111","dayIndex":0,"startSlot":2,"duration":4,"title":"Local Supabase setup","completed":false},
        {"id":"block-focus","type":"freestyle","dayIndex":3,"startSlot":4,"duration":2,"title":"Deep work","completed":false}
      ],
      "eveningBlocks":[
        {"id":"evening-read","type":"freestyle","dayIndex":0,"title":"Read and unwind","completed":false}
      ],
      "createdAt":"2026-06-15T08:00:00.000Z",
      "updatedAt":"2026-06-15T08:00:00.000Z"
    }'::jsonb,
    '2026-06-15T08:00:00Z',
    '2026-06-15T08:00:00Z'
  ),
  (
    '2026-W26',
    '00000000-0000-4000-8000-000000000001',
    '2026-06-22',
    '{
      "id":"2026-W26",
      "startDate":"2026-06-22T00:00:00.000Z",
      "roles":[
        {"id":"11111111-1111-4111-8111-111111111111","name":"Craft","color":"amber","order":0},
        {"id":"22222222-2222-4222-8222-222222222222","name":"Health","color":"emerald","order":1},
        {"id":"33333333-3333-4333-8333-333333333333","name":"Home","color":"sky","order":2}
      ],
      "goals":[],
      "dayPriorities":[],
      "timeBlocks":[],
      "eveningBlocks":[],
      "createdAt":"2026-06-15T08:00:00.000Z",
      "updatedAt":"2026-06-15T08:00:00.000Z"
    }'::jsonb,
    '2026-06-15T08:00:00Z',
    '2026-06-15T08:00:00Z'
  )
on conflict (user_id, id) do update set
  start_date = excluded.start_date,
  data = excluded.data,
  updated_at = excluded.updated_at;
