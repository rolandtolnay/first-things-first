# CLAUDE.md — Project context for an app built on the Dark Workspace Kit

> Read this before doing any work in this project.
> See `ds/README.md` for the full kit cheat sheet.

## What this project is

A new app built on the **Dark Workspace Kit** — a small, opinionated design system in `ds/`. Tokens drive everything; components compose into a window-shell layout with a signature warm amber glow.

The kit was extracted from a "First Things First" redesign (Habit 3 weekly planner). You may find that demo at `index.html` / `app/` — keep it as a reference, delete it, or repurpose it. The kit is in `ds/`.

## Aesthetic — locked

These are non-negotiable defaults. Do not drift toward generic dark-mode SaaS.

- **Dark workspace window** floating on a darker stage. Single, fixed **warm amber glow** bleeding upward from the bottom of the viewport. The glow IS the brand.
- **Hairline borders, no heavy fills.** Buttons are ghost or outlined by default. The accent is the only filled color.
- **One accent at a time.** Amber by default. Other presets: rose, violet, mint, sky.
- **Type rhythm**: sans body + **monospaced UPPERCASE micro-labels** with 0.12em tracking. Geist + Geist Mono via Google Fonts.
- **Numbers are tabular and mono.** Always.
- **Section headers are flat.** Separated by whitespace and a single hairline, never heavy dividers or cards-within-cards.
- **No emoji.** Use `<Icon>` (26 included) or a placeholder.

## File map

```
/
├── starter.html         # Clean blank-canvas entry — duplicate this for new pages
├── design-system.html   # Component gallery — keep, don't ship
├── ds/
│   ├── README.md        # Full kit cheat sheet (tokens, components, rules)
│   ├── tokens.css       # ALL design tokens. Touch this to change the whole system.
│   ├── components.jsx   # React components exported on window
│   ├── showcase.jsx     # Gallery source (only loaded by design-system.html)
│   ├── showcase.css     # Gallery-only styles
│   └── tweaks-panel.jsx # Optional runtime customization panel
```

## Stack

- **React 18** via UMD `<script>` tags. No build step.
- **Babel-standalone** transpiles JSX at runtime. Script tags use `<script type="text/babel" src="…">`. **Order matters** — Babel preserves it.
- **Cross-script scope**: each `text/babel` script gets its own scope. Kit components are shared by appending to `window` at the bottom of `components.jsx`. Use them as bare identifiers (`<Button>`, `<Dialog>`) — they're globals.
- **Style objects**: never use a generic `const styles =`. Always name-spaced (e.g. `const myThingStyles`).
- No npm. No TypeScript. No bundler.

## Components available

Listed in `ds/README.md` with full props. Quick reference:

- **Layout**: `WindowChrome`, `Card`, `SectionLabel`
- **Inputs**: `Button`, `Checkbox`, `Toggle`, `Chip`, `Segmented`, `EditableText`, `Slider`, `TabPill`
- **Overlays**: `Dialog`, `Tooltip`, `DropdownMenu`, `ToastProvider` + `useToast`
- **Display**: `StatRow`, `Donut`, `StreakGrid`, `Avatar`, `Skeleton`, `EmptyState`, `ListRow`, `Tabs`, `Icon`
- **Theming**: `ThemeToggle` (sun/moon, writes `.ds-light` on `<html>`, persists to localStorage)

## Theming

- **Dark is default.** Don't change that without explicit user direction.
- **Light variant is opt-in** via the `ds-light` class on `<html>`. Every token flips: warm paper white surfaces, darkened accent, softer glow. WCAG AA preserved.
- Use `<ThemeToggle />` to wire the switch — already styled to slot into `WindowChrome`'s right slot.

## When asked to make changes

- **Visual / token changes** → start in `ds/tokens.css`. Resist hardcoded colors elsewhere.
- **New components** → add to `ds/components.jsx`, export via `Object.assign(window, …)`, add a tile to `ds/showcase.jsx`, update `ds/README.md`.
- **App layout / structure** → create a new file like `app.jsx` and load it after `components.jsx`. Static HTML is preferred for content the user may want to edit visually; JSX-generated markup must round-trip through chat.
- **Persistence / state** → there's none built-in. Use React state for prototypes; lift to localStorage or a real store when the app graduates.

## Rules of the system

1. **One accent at a time.** Role chips are tags, not actions.
2. **Hairlines, not slabs.** Borders are 1px and use `--ds-line`.
3. **Labels mono, body sans.** Section labels are UPPERCASE, monospaced, 11px, 0.12em tracking.
4. **Numbers tabular.** Always wrap in `ds-num`.
5. **The glow stays.**
6. **No emoji. No gradients on text. No left-border accent cards. No "AI slop" tropes.**
7. **Compose at the token level.** If you find yourself writing a literal color or radius in a component, stop and add a token.

## Style of work

- Lead with what changed and where, not preamble.
- Use the asset review pane (`register_assets`) when shipping new user-facing pages.
- Verify with `done` + `fork_verifier_agent` after substantial changes.
