# Local Supabase Development

Development uses a local Supabase stack. Production is the only hosted Supabase project.

## First-time setup

Prerequisites:

- Node dependencies installed with `npm install`
- Supabase CLI installed
- Docker-compatible container runtime running

Run:

```bash
npm run dev:setup
npm run dev
```

`npm run dev:setup` starts Supabase, resets the local database from checked-in migrations, loads `supabase/seed.sql`, and writes local public Supabase values to `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=<local API URL>
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<local anon key>
```

The app intentionally does not fall back to local defaults when env vars are missing. Missing Supabase env should fail loudly.

## Local services

| Service | URL |
|---------|-----|
| App | http://localhost:3000 |
| Supabase API | http://127.0.0.1:54321 |
| Supabase Studio | http://127.0.0.1:54323 |
| Inbucket email | http://127.0.0.1:54324 |

## Local login

Seeded local user:

```text
dev@example.com
```

Sign in through the app with that email. Supabase local Auth sends the magic link to Inbucket, not a real inbox. Open Inbucket, click the latest magic link, and the app should load the seeded Weeks and Roles.

## Resetting local data

```bash
npm run db:reset
```

This reapplies migrations and reloads `supabase/seed.sql`. Local edits are intentionally disposable.

## Making schema changes

1. Create or edit migrations under `supabase/migrations/`.
2. Run `npm run db:reset` to apply migrations locally from scratch.
3. Regenerate database types if schema changed:

   ```bash
   supabase gen types --local --lang=typescript --schema public > src/lib/supabase/database.types.ts
   ```

4. Run:

   ```bash
   npm run test:run
   npm run lint
   ```

## Pushing production migrations

```bash
npm run db:push:prod
```

The production script no longer checks a hosted dev project. It uses local Supabase as the rehearsal target, then performs a production dry-run and asks for explicit confirmation before applying migrations.

Do not relink the Supabase CLI to production for routine work. Production inspection should use the read-only production URL when available:

```bash
supabase migration list --db-url "$FTF_PROD_READONLY_DB_URL"
```

## Non-goals

- No hosted dev Supabase project.
- No shared prod/dev data in one hosted project.
- No production data cloning into local development.
- No self-hosted Supabase for this app.
