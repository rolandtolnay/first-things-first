# First Things First playbook

Standing build, verification, mutation, and release method. The goal prompt owns the outcome; `PROJECT.md` owns product intent.

## Default implementation direction

- **Stack:** Next.js 16 App Router, React 19, strict TypeScript, Zustand, dnd-kit, Tailwind CSS 4, shadcn/Radix primitives, Vitest, Supabase Auth/Postgres, and Vercel hosting.
- **Architecture:** `src/stores/weekStore.ts` orchestrates optimistic domain mutations; pure rules live in `src/lib/`; `src/lib/db.ts` is the client-direct Supabase seam; `src/lib/week-mapping.ts` and `role-mapping.ts` own row translation. Weeks are JSONB snapshots and Roles are durable defaults with per-Week Role Snapshots.
- **Security:** RLS is the data boundary. `src/proxy.ts` and `src/lib/supabase/middleware.ts` refresh Sessions and gate requests. Never replace these with UI-only gating.
- **UI:** compose existing shared components under `src/components/` before adding primitives. Dark Workspace `--ds-*` tokens in `src/app/globals.css` are the design source of truth.
- **Testing:** behavior-focused Vitest suites cover pure rules, mapping, and store orchestration. Browser verification covers layout, accessibility, drag/drop, menus, auth, and other interaction behavior.

## Goal-loop method

1. Read `PROJECT.md`, `CONTEXT.md`, `AGENTS.md`, relevant `docs/decisions.md`/ADRs, and any PRD named by the goal. A PRD is intent, not proof of shipped behavior.
2. Capture `git status --short`. Preserve unrelated changes; stop if the goal overlaps pre-existing edits whose ownership is unclear.
3. Append the exact goal, baseline, assumptions, guardrails, and a short falsifiable rubric to `docs/goal-log.md` before implementation.
4. Build the smallest vertical slice that meets the outcome. Update directly affected names, docs, tests, and callsites.
5. Run the smallest relevant configured checks, then the applicable full gate below.
6. For user-visible, trust-sensitive, auth/data-safety, or non-deterministic outcomes, follow `etc/judged-goal-loop.md` with a fresh judge and the real local product surface.
7. Fix evidence-backed blockers and cheap aligned polish; log each judge pass.
8. Finish only at `GOAL MET`, or record `[blocked]` with exact evidence, current state, and safest resume step.

## Subagent model economy

The goal owner keeps product judgment, architecture, safety boundaries, integration, and final synthesis. Delegate bounded verifiable work to the least costly currently available model that remains comfortably capable.

- Use a lower-tier model for repository exploration, fixture enumeration, routine research, mechanical edits, and targeted checks with objective acceptance criteria.
- Use one tier below the owner for substantial but well-scoped implementation or review.
- Keep ambiguous product choices, cross-cutting architecture, destructive/external mutation, and hard-to-detect failure modes with the owner or a peer-capability model.
- Brief each child with minimum sufficient context, explicit scope boundaries, a concrete deliverable, and a verification contract. Review and integrate its output in the owner context.
- Escalate after an uncertain or failed pass. Resolve the available model ladder at run time rather than encoding model aliases here.

## Local setup and product-driving surfaces

Canonical setup facts live in `docs/supabase-local-development.md`.

```bash
npm install
npm run dev:setup
npm run dev
```

`npm run dev:setup` and `npm run db:reset` reset the disposable local Supabase database and reload `supabase/seed.sql`; do not run either when unpreserved local data matters. The seeded login is `dev@example.com`, with magic-link email in local Inbucket at `http://127.0.0.1:54324`.

For browser work, load the installed CLI instructions first:

```bash
agent-browser skills get core
agent-browser --session ftf-debug --profile .agents/browser-state/ftf-debug-profile open http://localhost:3000
```

The profile is ignored and may contain auth state; never retain it as goal evidence. If verification lands on `/login`, close the session and reopen the same profile headed:

```bash
agent-browser --session ftf-debug close
agent-browser --session ftf-debug --profile .agents/browser-state/ftf-debug-profile --headed open http://localhost:3000
```

Ask the User to complete magic-link auth. Once confirmed, close the headed session and reopen the same profile headless for routine verification.

## Verification gate

Choose checks by risk; report only commands actually run and their exact observed results.

### Targeted and deterministic checks

```bash
npm run test:run -- <test-file-or-pattern>
npm run test:run
npm run lint
```

Use targeted tests while iterating. Run the full test suite and lint for shared domain, store, mapping, database, or cross-surface changes.

### Production compilation

```bash
npm run build
```

Run the build for Next.js routing/layout/provider changes, production-facing config, broad UI work, or before an explicitly authorized deployment. The build is the configured TypeScript/Next production check.

### UI and interaction changes

Drive the affected flow in the browser using the canonical profile. Verify the complete interaction loop and relevant empty/loading/error state, not only the initial render. For hover-revealed menus, verify rest → hover/tap → open → Escape/outside dismiss → pointer exit; check keyboard behavior and Safari when menu/focus behavior changes.

### Auth or proxy changes

With local Supabase and Next.js running, verify both browser auth behavior and the server redirect. An unauthenticated request must return a redirect to `/login`:

```bash
curl -i http://localhost:3000/
```

Do not trust the `next build` “Proxy (Middleware)” label alone. After moving or renaming the proxy convention file, stop dev, remove only the generated `.next` cache, restart, and repeat the request check.

### Schema or persistence changes

1. Add/edit checked-in migrations under `supabase/migrations/`.
2. Confirm local data is disposable, then run `npm run db:reset`.
3. Regenerate types when schema changes:

   ```bash
   supabase gen types --local --lang=typescript --schema public > src/lib/supabase/database.types.ts
   ```

4. Inspect the generated diff, run mapping/store tests, the full test suite, lint, and applicable browser flow.
5. Smoke-check RLS ownership behavior against local seeded/synthetic Users when policies change.

## Safety and external effects

- Keep secrets out of tracked files, retained evidence, prompts, and reported command output. Never inspect or publish `.env.local`, browser cookies, magic links, or production credentials.
- Use local seeded/synthetic planning data for mutation tests. Never use production or real User data as a fixture.
- Local database reset is destructive to local data; production migration is an external irreversible boundary.
- Do not infer authority to commit, push, deploy, release, message people, change billing/security settings, or mutate production from a build/implementation goal.
- Production inspection should use the documented read-only role when available. Do not relink the CLI or use privileged production credentials for routine debugging.

## Deployment and production database work

A verified local build is the default completion state.

- **Vercel deploy/release:** execute only when the explicit goal authorizes it; use the repository’s deployment skill/workflow, capture the resulting URL, and smoke-test the deployed primary flow and auth redirect.
- **Production migrations:** execute `npm run db:push:prod` only when the explicit goal authorizes production mutation. Its local reset, tests/lint, dry-run, password prompt, and confirmation are mandatory gates; do not bypass the dirty-artifact guard except on explicit User instruction.
- Define recovery/rollback before any risky production change. A successful local build or migration rehearsal does not authorize either operation.

## Failure policy

**Recoverable:** test/lint/build failures, local seeded-data failures, transient local service startup, and browser-session expiry. Diagnose, minimize, fix, and rerun the affected gate.

**Fatal for the current run:** unclear overlap with pre-existing edits; missing authority for production/deployment/commit; unavailable required secret or local runtime after a safe retry; inability to verify an RLS/auth boundary; risk to production or real User data; destructive ambiguity; or a judge blocker that survives three root-cause-driven attempts.

For a fatal condition, leave the tree recoverable, append `[blocked]` with the exact condition and safest resume step to `docs/goal-log.md`, and stop.
