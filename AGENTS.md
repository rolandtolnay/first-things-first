# First Things First

If something in the project surprises you, flag it to the user and note it in AGENTS.md to help future agents.

## Browser Verification

You have access to the `agent-browser` skill. Load it (via the Skill tool) whenever you need to visually verify UI changes, test interactions, or confirm that functionality works correctly in the browser. Don't rely solely on reading code to judge whether something looks or behaves right — launch the browser and check. This is especially important after layout, styling, or interaction changes.

For localhost auth debugging, reuse the canonical project-local browser state at `.agents/browser-state/ftf-debug-auth.json` when it exists: `agent-browser --session ftf-debug --state .agents/browser-state/ftf-debug-auth.json open http://localhost:3000`. If sign-in is needed, the user may complete magic-link auth in a headed browser; if `agent-browser --headed` is ignored because a daemon is already running, close that session first, then reopen with `agent-browser --session ftf-debug --headed open http://localhost:3000`. After sign-in, refresh the canonical state with `agent-browser --session ftf-debug state save .agents/browser-state/ftf-debug-auth.json`. This path is gitignored; never commit saved auth state.

## UI Components (shadcn/ui)

This project uses **shadcn/ui** components (style: `radix-nova`, base color: `neutral`). Existing components live in `src/components/ui/`. The project is configured via `components.json`.

When working with UI components — adding new ones, debugging styling, composing layouts, or looking up component APIs — load the `shadcn` skill (via the Skill tool) for project-aware guidance and component documentation.

Always check `src/components/ui/` first to see what's already installed before adding a new component. When a feature needs a UI primitive not already present, add it with `npx shadcn@latest add <component-name>`. Prefer composing existing shadcn primitives over building custom components from scratch.

**Shared components over inline styling**: Never create one-off styled elements (e.g. raw `<input>` with inline classes) when a shared component exists in `src/components/ui/`. Instead:
1. Modify the existing shared component so the change is reflected app-wide.
2. If modifying would cause regressions elsewhere, flag it and ask — we may make a local exception or create a new shared variant.
The goal is consistency: all UI flows through shared components so the app looks and behaves uniformly.

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

## Auth & persistence (Supabase)

Auth is passwordless magic link via `@supabase/ssr`; Weeks persist to Supabase Postgres (`public.weeks`, one JSONB document per week, RLS-scoped to `auth.uid()`). The browser talks to Supabase directly — RLS is the security boundary, there is no API layer. The persistence seam is `src/lib/db.ts` (+ the pure `src/lib/week-mapping.ts`); the store's `bootstrap()` / `reset()` are driven by `AuthProvider`. See `etc/prd/supabase-auth-cloud-persistence.md` and ADR-0003 / ADR-0004.
