# CLAUDE.md — Project context for FTF Redesign

> Read this before doing any work in this project.

## What this project is

A high-fidelity HTML/React prototype redesigning the **First Things First** weekly-planning webapp (Stephen Covey's Habit 3) with a new visual identity. The target production codebase is the Next.js repo at [`rolandtolnay/first-things-first`](https://github.com/rolandtolnay/first-things-first). This project is **not** the production app — it's a design exploration whose output will be ported. See `MIGRATION.md` for the full handoff plan.

## Aesthetic — locked

Treat this as a fixed brand, not open for reinvention without explicit user request:

- **Dark workspace window** floating on an even darker stage, with a **warm amber glow** bleeding upward from the bottom of the viewport (the signature — keep it).
- **Hairline borders, no heavy fills.** Buttons are ghost or outlined by default. The accent is the only filled color.
- **One accent at a time** — amber by default. Five named accent presets in `ds/tokens.css` (`amber`, `rose`, `violet`, `mint`, `sky`).
- **Type rhythm**: sans body + **monospaced UPPERCASE micro-labels** (`MODEL` · `SESSION METRICS` · `HISTORY` pattern). Geist + Geist Mono, loaded from Google Fonts.
- **Numbers are tabular and mono.** Times, hours, counters, dates → `ds-num` + `ds-mono`.
- **Section headers are flat** — separated by whitespace and a single hairline, never heavy dividers or cards-within-cards.
- **Window chrome**: top-left = menu + settings, top-right = minimize / maximize / close. The traffic-light buttons are decorative.
- **Light theme is available** as an opt-in via the `.ds-light` class on `<html>`. Dark is still the default; only switch when the user explicitly asks.

Inspirations came from the user's uploaded screenshots (the "oh-the-things-you-can-build" set) — same dark workspace + amber glow vocabulary. Do not converge on generic dark-mode SaaS look.

## File map

```
/
├── index.html                  # Redesigned FTF app (entrypoint)
├── design-system.html          # Component / token gallery
├── MIGRATION.md                # Production handoff plan ← single source of truth for porting
├── ds/
│   ├── tokens.css              # ALL design tokens. Touch this to change the whole system.
│   ├── components.jsx          # Reusable React components (Window, Card, Button, Donut, etc.)
│   ├── tweaks-panel.jsx        # Tweaks shell (starter component — don't modify)
│   ├── showcase.jsx            # Design system gallery
│   └── showcase.css            # Gallery-only styles
└── app/
    ├── app.jsx                 # Root + tweaks wiring + TWEAK_DEFAULTS block
    ├── app.css                 # App layout (ftf-* classes)
    ├── state.jsx               # In-memory state + seeded data
    ├── sidebar.jsx             # Left rail: Weekly Balance + Roles & Goals
    ├── calendar.jsx            # 7-day week view: priorities + time grid + evening
    └── rail.jsx                # Right rail: Week Metrics + Daily Streak + Sharpen the Saw
```

## Stack

- **React 18** via UMD `<script>` tags (no build step).
- **Babel-standalone** transpiles JSX at runtime. Script tags use `<script type="text/babel" src="…">`. Order matters — Babel preserves it.
- **No bundler.** No npm. No TypeScript. This is a prototype.
- **Cross-script scope**: each `text/babel` script gets its own scope. Components are shared by appending to `window` at the bottom of each file (`Object.assign(window, { Foo, Bar })`).
- **Style objects**: never use a generic `const styles =`. Always name-spaced (e.g. `const sidebarStyles`).
- **State**: in-memory React state with seeded dummy data. **No persistence.** The production app uses Dexie/IndexedDB — that lives in the target repo, not here.

## Token system

Single source of truth: `ds/tokens.css`. Every color, radius, shadow, space, and type token is here. Components and app CSS use these via `var(--ds-*)`. Do not introduce raw colors elsewhere — extend the token set instead.

Text contrast is tuned for WCAG AA on the window background:
- `--ds-fg` ~16:1 (AAA)
- `--ds-fg-muted` ~7:1 (AAA)
- `--ds-fg-dim` ~4.6:1 (AA normal)
- `--ds-fg-faint` ~3.1:1 (AA large only — use sparingly)

Role colors share chroma and lightness; only hue varies.

## Tweaks

The Tweaks panel persists into `TWEAK_DEFAULTS` at the top of `app/app.jsx` between `/*EDITMODE-BEGIN*/` and `/*EDITMODE-END*/` markers. The block must remain valid JSON. When the user changes a tweak in the panel, the host rewrites this block on disk.

The Tweaks panel is a design exploration tool, **not user-facing**. Per `MIGRATION.md`, bake the winning values as defaults when porting; expose only meaningful user prefs through a real Settings dialog.

## When asked to make changes

- **Visual changes** → start in `ds/tokens.css`. If a per-component override is needed, add it to the relevant CSS file (`app/app.css` or `ds/showcase.css`). Resist hardcoding.
- **New components** → add to `ds/components.jsx`, export via `Object.assign(window, …)`, and add a tile in `ds/showcase.jsx`.
- **App layout / structure** → `app/sidebar.jsx`, `app/calendar.jsx`, `app/rail.jsx`. Use `useFTF()` to read/mutate state.
- **Data model changes** → `app/state.jsx`. Keep mutators colocated with their data.

## When asked to ship / migrate / port to the real repo

Read `MIGRATION.md`. It contains:
- Phase-by-phase plan (Tokens → Components → Re-skin → Saw model → Tweaks/Mobile)
- Concrete token mapping onto existing shadcn names
- File-by-file port instructions referencing repo paths
- Testing checklist
- Open questions to resolve with the team

Do not start porting without reading it.

## What's NOT done

- **Mobile single-day view** — placeholder responsive collapse only (rail hides ≤1280, sidebar ≤1024).
- **Carryover dialog** — the existing repo has one; not re-designed here.
- **Settings dialog** — Tweaks panel stands in.
- **Real drag for priorities** — native HTML5 DnD wires goals → time grid and blocks → grid. Goal → priorities and block → evening aren't wired in this prototype (production uses dnd-kit which handles all of these already).
- **Persistence** — none. Refreshing resets state.

## Style of work in this project

- The user (Roland — mindsystemsolutions.com) is hands-on and reviews via screenshots + teammate comments.
- He values: a single committed aesthetic direction, contrast/legibility, and a clear migration path to production.
- Keep summaries brief. Lead with what changed and where, not preamble.
- Use the asset review pane (`register_assets`) when shipping new versions of `index.html` or `design-system.html`.
