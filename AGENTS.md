# First Things First

## Maintaining this file

Keep `AGENTS.md` focused on guidance that prevents future regressions or preserves hard-won project context. Update it autonomously when you discover a load-bearing convention, non-obvious gotcha, cross-browser interaction trap, validation requirement, or shared-component rule that a future agent is likely to miss.

Good updates are concise and outcome-oriented: state the invariant to preserve, when it applies, and the failure it prevents. Prefer documenting durable lessons over session history, easy-to-spot mistakes, or one-off implementation details. If a lesson is surprising but not clearly durable, flag it to the user instead of expanding this file.

## Browser Verification

You have access to the `agent-browser` skill. Load it (via the Skill tool) whenever you need to visually verify UI changes, test interactions, or confirm that functionality works correctly in the browser. Don't rely solely on reading code to judge whether something looks or behaves right — launch the browser and check. This is especially important after layout, styling, or interaction changes.

For localhost auth debugging, reuse the canonical project-local browser profile at `.agents/browser-state/ftf-debug-profile`: `agent-browser --session ftf-debug --profile .agents/browser-state/ftf-debug-profile open http://localhost:3000`. The profile path is gitignored and persists the Supabase Session across browser restarts; never commit saved auth state.

If browser verification lands on `/login` or otherwise shows a logged-out session, automatically switch to the headed-login flow: close the current session, reopen the same canonical profile headed with `agent-browser --session ftf-debug --profile .agents/browser-state/ftf-debug-profile --headed open http://localhost:3000`, then ask the user to complete magic-link auth manually. After the user confirms login, close that headed session and reopen the same profile headless with `agent-browser --session ftf-debug --profile .agents/browser-state/ftf-debug-profile open http://localhost:3000` before verifying feature behavior. Do not keep using the headed browser for routine verification once auth state has been saved.

## UI Components (shadcn/ui)

This project uses **shadcn/ui** components (style: `radix-nova`, base color: `neutral`). Existing components live in `src/components/ui/`. The project is configured via `components.json`.

When working with UI components — adding new ones, debugging styling, composing layouts, or looking up component APIs — load the `shadcn` skill (via the Skill tool) for project-aware guidance and component documentation.

Always check `src/components/ui/` first to see what's already installed before adding a new component. When a feature needs a UI primitive not already present, add it with `npx shadcn@latest add <component-name>`. Prefer composing existing shadcn primitives over building custom components from scratch.

**Shared components over inline styling**: Never create one-off styled elements (e.g. raw `<input>` with inline classes) when a shared component exists in `src/components/ui/` or elsewhere under `src/components/`. Before writing or editing JSX/Tailwind markup, scan for an existing primitive or composed component that fits the need, including `Button`, `TextActionButton`, `Input`, `Dialog`, `AlertDialog`, `DropdownMenu`, `ContextMenu`, `SectionLabel`, `BlockCard`, and existing sidebar/calendar/layout components. If one exists, use it.

If no component exists but the pattern is likely to repeat, define a new shared component in the right `src/components/` area and compose it from lower-level primitives. Keep genuinely one-off UI local, but still build it from existing primitives instead of raw styled elements. When adding or changing a shared component API, update this section so future agents know to reuse it.

If an existing component is close but missing an option, prefer extending that shared component and migrating relevant call sites in the same change. If extending it could cause regressions, flag it and ask — we may make a local exception or create a new shared variant. The goal is consistency: all UI flows through shared components so the app looks and behaves uniformly.

### Load-bearing dropdown/menu interaction notes

Hover-revealed card menus are fragile across Chrome/Safari and easy to regress. When working on role/goal/block card overflow menus:

- Prefer a simple fixed trailing slot (`relative` container + positioned trigger) over clever grid overlays or absolute controls that overlap other content. Safari exposed layout/focus bugs in the grid-overlay approach.
- Do not let menu triggers overlap labels such as role duration. Swap duration/menu within one reserved slot instead.
- Keep touch targets larger than the visible icon. A `32px` trigger worked well for the role-card menu while preserving the compact visual design.
- For Radix dropdowns whose trigger is hover-revealed, handle `onCloseAutoFocus`: prevent default focus restoration and blur the trigger after pointer/touch dismissal. Otherwise Safari/Chrome can leave a visible focus ring around the hidden trigger or the duration slot after the menu closes.
- Verify the full loop, not just the open state: rest → hover/tap → open menu → dismiss with Escape/outside click → move pointer away. Also check Safari when this interaction changes.
- Avoid hover-revealed in-flow rows inside cards, such as showing `+ ADD GOAL` only while hovering a non-empty role. Safari can keep these visible after pointer exit. Prefer always-visible empty-state actions, menu actions, or fixed/absolute hover controls that do not change the card's layout.

## Tailwind v4 Custom Theme Tokens

When adding custom values to `@theme inline` in `globals.css`, use the **same prefix as the built-in utilities** you want to extend:

- `--text-*` → `text-*` (font sizes)
- `--color-*` → color utilities
- `--radius-*` → `rounded-*`
- `--shadow-*` → `shadow-*`

**Wrong:** `--font-size-label: 10px` (unrecognized namespace, generates nothing)
**Right:** `--text-label: 10px` (generates `.text-label { font-size: 10px }`)

Tailwind v4 silently ignores unknown class names — the build won't warn you. If a new utility class doesn't seem to work, check the compiled CSS output to confirm it exists.

## Known Interaction Gotcha

Radix `DropdownMenuItem` and `ContextMenuItem` actions should use `onSelect`, not `onClick`, when the menu is layered over the calendar grid. `onClick` can miss touch/pointer selection timing and let the underlying draw handler create an accidental freestyle block.

## Request gating lives in `src/proxy.ts` (Next 16, not `middleware.ts`)

Next.js 16 renamed the `middleware` file convention to **`proxy`** (function `proxy`, Node.js runtime). Two traps bit us here:

- The convention file must sit **next to `app/`** — since this is a `src/` project, that means **`src/proxy.ts`**, not the repo root. A root-level `middleware.ts`/`proxy.ts` is silently ignored in dev (no gating, no error), so always verify with a real request: an unauthenticated `curl -i http://localhost:3000/` must return a 307 to `/login`.
- `middleware.ts` still "works" enough to appear in `next build` output (`ƒ Proxy (Middleware)`) while doing nothing at request time. Don't trust the build label — test the redirect.

`src/proxy.ts` is the thin entry; the session-refresh + route-gating logic lives in `src/lib/supabase/middleware.ts` (`updateSession`). After moving/renaming a proxy file, `rm -rf .next` before restarting `next dev` — Turbopack caches a stale module path and 500s otherwise.

## Canonical terms in code, friendly terms in UI

Domain terms in `CONTEXT.md`, the PRDs, code, and types stay canonical (**Source Week**, **Target Week**, **Weekly Handoff**, capitalized **Roles/Goals**, etc.). **Visible UI strings use customer-friendly equivalents** instead — a customer doesn't know what a "Source Week" is. Current mapping in the Weekly Handoff dialog (`CarryoverDialog.tsx`, CTA copy in `weekly-handoff.ts`): Source Week → "this week", Target Week → "next week", and domain nouns are lowercased in running prose (roles, goals, day priorities…).

`etc/prd/weekly-handoff-dialog.md` documents this split under Implementation Decisions (canonical concepts, friendly UI copy). Do not "correct" the dialog copy back to canonical terms.

## Auth & persistence (Supabase)

Auth is passwordless magic link via `@supabase/ssr`; Weeks persist to Supabase Postgres (`public.weeks`, one JSONB document per week, RLS-scoped to `auth.uid()`). The browser talks to Supabase directly — RLS is the security boundary, there is no API layer. The persistence seam is `src/lib/db.ts` (+ the pure `src/lib/week-mapping.ts`); the store's `bootstrap()` / `reset()` are driven by `AuthProvider`. See `etc/prd/supabase-auth-cloud-persistence.md` and ADR-0003 / ADR-0004.

The Magic Link email template in `docs/supabase-magic-link-email.md` builds callback links from Supabase `{{ .SiteURL }}`. For production, Supabase Dashboard → Authentication → URL Configuration must set Site URL to the canonical Vercel/custom domain and include every app origin used by `emailRedirectTo` in Redirect URLs. If Site URL remains localhost, production emails will contain localhost links even though the Vercel app sent the OTP request.

Supabase CLI is intentionally linked to the dev project (`debzwdzhkcbsvgkhucsa`, `FTF Dev`) so default `--linked` reads/writes hit dev, not prod. Prod operations must be explicit: apply migrations with `npm run db:push:prod`, which prompts for the prod DB password, dry-runs prod, asks for confirmation, then pushes the same checked-in migrations. Direct DB connections may fail on IPv4-only networks with `no route to host`; use the dashboard **Session pooler** string instead. Do not guess pooler hosts — this dev project worked via `aws-1-eu-central-1.pooler.supabase.com`, while `aws-0` produced `ENOTFOUND tenant/user ... not found`.

For prod DB debugging, do not relink or use privileged prod credentials unless a mutation is explicitly intended. Prod has a read-only role `ftf_prod_readonly` with `BYPASSRLS` and only `SELECT` on app tables (plus migration metadata for verification); inspect via `supabase db query --db-url "$FTF_PROD_READONLY_DB_URL" "select ..."` using the user's private shell/secrets. It was verified to read `public.weeks` while `INSERT`/`UPDATE`/`DELETE`/`TRUNCATE` privileges are false.

## Durable Roles vs. Role Snapshots — the orphan trap

A role exists in two places: the durable `public.roles` table (`store.activeRoles`) and a per-week **Role Snapshot** inside `weeks.data->'roles'`. The sidebar renders and edits snapshots from `currentWeek.roles`, but durable role mutations write `public.roles` by `snapshot.id`. There is no backfill, so any snapshot id from a pre-durable-role Week may have **no durable row**.

Invariant to preserve: durable writes reached from a Role Snapshot must materialize missing rows instead of assuming the row exists. Never use `UPDATE … .eq("id", id).single()` for snapshot-driven role mutations; use a full upsert-on-`id` payload with snapshot name/color/order so inserts satisfy every NOT NULL column. `updateRole` may hit active-name `23505` and should keep the snapshot edit while skipping the durable write; archive rows are outside the active-name unique index.

Bootstrap must not make `public.roles` availability a prerequisite for loading `public.weeks`: Weeks remain the primary saved plan, while durable Roles are defaults for future Weeks. If `getActiveRoles()` fails, keep loading the Week list/current Week and fall back to `activeRoles: []` with a non-fatal error banner.
