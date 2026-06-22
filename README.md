# First Things First

Help users focus on what matters by making the connection between life roles, weekly goals, and scheduled time explicit and actionable.

Built with Next.js, React, Zustand, dnd-kit, and Supabase.

## Getting Started

Prerequisites:

- Node.js/npm
- Supabase CLI
- Docker-compatible container runtime

```bash
npm install
npm run dev:setup
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

Development uses local Supabase only. Production is the only hosted Supabase project. See [`docs/supabase-local-development.md`](docs/supabase-local-development.md) for details.

Local login:

1. Enter `dev@example.com` on the login screen.
2. Open local Inbucket at [http://127.0.0.1:54324](http://127.0.0.1:54324).
3. Click the magic link.

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the Next.js development server |
| `npm run dev:setup` | Start/reset local Supabase, load seed data, and generate local env |
| `npm run build` | Create production build |
| `npm run start` | Serve production build |
| `npm run db:start` | Start local Supabase |
| `npm run db:reset` | Reset local Supabase from migrations and seed data |
| `npm run db:stop` | Stop local Supabase |
| `npm run db:push:prod` | Dry-run, confirm, and apply checked-in migrations to production |
| `npm run lint` | Run ESLint |
| `npm run test:run` | Run tests once |

## Manual Testing Checklist

After making changes, verify the following as relevant:

- **Auth**: Sign in locally with `dev@example.com` through Inbucket
- **Sidebar**: Add, edit (double-click), and delete Roles and Goals
- **Calendar**: Drag Goals to Day Priorities, Time Blocks, and Evening Blocks
- **Calendar**: Drag Time Blocks and Day Priorities between Days
- **Evening**: Drag Evening Blocks between Days
- **Delete**: Delete buttons work on all item types (Roles, Goals, Day Priorities, Time Blocks, Evening Blocks)
- **Dark mode**: Toggle works without visual issues
