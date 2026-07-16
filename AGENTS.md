# First Things First

Standing routing and safety guidance for autonomous work. The task-specific outcome comes from the explicit goal.

## Canonical sources

- Product identity, priorities, scope, exclusions, and default judgments → `PROJECT.md`.
- Domain vocabulary and relationships → `CONTEXT.md`.
- Lightweight implementation decisions → `docs/decisions.md`; hard-to-reverse architecture → `docs/adr/`.
- Feature-specific intended behavior → `etc/prd/`. A PRD is not evidence that a feature is implemented; confirm in source/tests.
- Non-secret local Supabase facts → `docs/supabase-local-development.md`; magic-link template operations → `docs/supabase-magic-link-email.md`.
- Goal history/evidence → `docs/goal-log.md` and `docs/goal-evidence/`.
- Full build, verification, mutation, blocker, and release method → `etc/playbook.md`.
- Fresh judging and goal-writing guidance → `etc/judged-goal-loop.md` and `etc/writing-goals.md`.

When guidance conflicts: explicit User goal > `PROJECT.md` > ADRs and recorded decisions > playbook/these defaults > inference. Current official documentation and observed behavior beat memory for volatile compatibility facts.

## Cold-start goal route

```text
goal prompt
  -> PROJECT.md / CONTEXT.md / decisions and relevant PRD
  -> etc/playbook.md
  -> docs/goal-log.md + compact evidence
  -> fresh judge when required
  -> GOAL MET or explicit [blocked]
```

Record the initial working-tree baseline and protect unrelated changes. Build the smallest vertical slice. The method lives in the playbook; do not invent a parallel process.

## Standing locks

### Shared UI and design system

This project uses shadcn/ui (`radix-nova`, neutral) and Dark Workspace tokens. Check `src/components/ui/` and the rest of `src/components/` before writing JSX/Tailwind. Reuse or extend shared components such as `Button`, `TextActionButton`, `Input`, `Dialog`, `AlertDialog`, menus, `SectionLabel`, and `BlockCard`; do not substitute one-off styled raw elements when a shared primitive fits. Add missing shadcn primitives with `npx shadcn@latest add <component>`.

`src/app/globals.css` `--ds-*` values are the visual source of truth and bridge into Tailwind/shadcn. Follow ADR-0001 and the Tailwind v4 namespace decision in `docs/decisions.md`.

### Menu and calendar interactions

Preserve the menu/focus rules in `docs/decisions.md`, especially reserved trailing slots for hover menus and Radix `onSelect` over the calendar grid. These prevent Safari/Chrome focus artifacts and accidental Freestyle Block creation. Browser-verify the full interaction loop when changing them.

### Auth and request gating

Next.js 16 request gating lives in `src/proxy.ts`, next to `src/app/`; the session logic lives in `src/lib/supabase/middleware.ts`. A root proxy or legacy `middleware.ts` can appear to build while doing nothing at runtime. Verify an actual unauthenticated redirect as specified in the playbook.

Supabase Auth/Postgres is the online source of truth. The browser talks directly to Supabase and RLS is the security boundary; do not add an API relay by default or weaken policies for test convenience. Development uses local Supabase only; production is the only hosted project. Never relink or mutate production without explicit authority.

### Canonical terms and customer copy

Use `CONTEXT.md` terms in code and technical docs: Week, Role, Role Snapshot, Goal, Day Priority, Time Block, Weekly Handoff, Source Week, and Target Week. Visible prose should be customer-friendly: for example, Weekly Handoff says “this week” and “next week,” and lowercases roles/goals in running text. Do not expose internal jargon merely to match code names.

### Durable Roles and the orphan trap

A durable Role lives in `public.roles`; each Week contains Role Snapshots. Historical snapshots can predate the durable row. Snapshot-driven durable writes must materialize missing rows with a full upsert-on-`id` payload containing name, color, and order; never assume `UPDATE ... .single()` will find a row. An active-name `23505` during `updateRole` keeps the snapshot edit and skips the conflicting durable write.

Weeks are the primary saved plan. Failure to load durable Role defaults must not block existing Week bootstrap: retain the Week list/current Week, use `activeRoles: []`, and surface a non-fatal error.

## Stack and boundaries

Next.js 16 + React 19 + TypeScript render the app; Zustand owns optimistic Week state; pure planning rules live under `src/lib/`; `src/lib/db.ts` is the Supabase seam; dnd-kit owns scheduling interactions. Weeks remain JSONB snapshots (ADR-0004); Roles are the deliberate selective normalization (ADR-0005).

Do not add adjacent features, abstractions, infrastructure, or release work without outcome pressure.

## Verify and external effects

Use only applicable configured checks and real product surfaces from `etc/playbook.md`; report exact results. User-visible, trust-sensitive, auth/data-safety, and non-deterministic outcomes require the fresh-judge path in `etc/judged-goal-loop.md`.

Commit only when requested. A build goal does not authorize commit, push, deploy, release, production database mutation, external messages, or security/billing changes. On a fatal blocker, preserve a recoverable tree and record the exact `[blocked]` condition and resume step in `docs/goal-log.md`.

## Maintaining this file

Keep this as a concise routing layer plus load-bearing locks. Put product choices in `PROJECT.md`, terms in `CONTEXT.md`, operating detail in the playbook, and newly discovered lightweight implementation choices in `docs/decisions.md`.
