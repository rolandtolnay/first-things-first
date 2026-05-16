# FTF Redesign — Migration Plan

> **For the engineer / agent picking this up**: this document is a complete handoff for migrating the redesigned "First Things First" aesthetic from the HTML prototype in this project into the live Next.js repo at [`rolandtolnay/first-things-first`](https://github.com/rolandtolnay/first-things-first).
>
> Read the **Context** section first, then work through **Phases 1–5** in order. Each phase is independently shippable.

---

## Context

### What was built

A high-fidelity HTML prototype of First Things First with a new visual identity:

- **Aesthetic** — Dark workspace window with a warm amber glow underneath. Hairline borders, no heavy fills, monospaced UPPERCASE micro-labels (the "MODEL / SESSION METRICS / HISTORY" rhythm). Single accent (amber) with a curated 6-color secondary palette for role coding.
- **Layout** — Three-column window shell: roles sidebar (296px) · calendar (flex) · metrics rail (304px). Window has top chrome (menu / settings / minimize / maximize / close) and a tab pill for the active week.
- **New surfaces not in the current repo**:
  - Right rail with **Week Metrics** card, **Daily Streak** grid (Habit 1 of the 7-day rolling streak), and **Sharpen the Saw** by category.
  - Window chrome with a "Tweaks" panel for runtime customization (accent hue, glow, density).

### What's in this prototype

```
/
├── index.html                  # Main app entrypoint
├── design-system.html          # Component / token gallery
├── ds/
│   ├── tokens.css              # ALL design tokens (single source of truth)
│   ├── components.jsx          # Reusable React components
│   ├── showcase.jsx            # Design system gallery
│   ├── showcase.css            # Gallery-only styles
│   └── tweaks-panel.jsx        # Tweaks shell (starter component, leave as-is)
├── app/
│   ├── app.jsx                 # Root + tweaks wiring
│   ├── app.css                 # App-specific layout (ftf-* classes)
│   ├── state.jsx               # In-memory state + dummy data
│   ├── sidebar.jsx             # Left rail: Weekly Balance + Roles & Goals
│   ├── calendar.jsx            # Week nav + 7 day columns
│   └── rail.jsx                # Right rail: Metrics + Streak + Sharpen the Saw
```

The prototype uses **React 18 via UMD + Babel-standalone** (no build step). State is in-memory React state with seeded dummy data. Drag-and-drop is native HTML5 (lighter than dnd-kit, kept simple for the visual prototype).

### What's in the target repo

The live app at `rolandtolnay/first-things-first` is a Next.js 15 app:

- **Framework**: Next.js (App Router), React, TypeScript
- **Styling**: Tailwind v4 (CSS-first `@theme inline`) + shadcn tokens, with light + dark themes
- **State**: Zustand (`src/stores/weekStore.ts`) — already implements roles, goals, day priorities, time blocks, evening blocks, week navigation
- **Persistence**: Dexie (IndexedDB) at `src/lib/db.ts`
- **DnD**: dnd-kit (`src/components/dnd/DndProvider.tsx`)
- **UI primitives**: shadcn (`src/components/ui/`) — Button, Input, Dialog, ContextMenu, DropdownMenu, AlertDialog, Tooltip, Popover, ScrollArea, Separator, Progress, Checkbox, Badge

**You are NOT rebuilding the app** — the data layer and interactions all work. You are **re-skinning the UI** and adding three new surfaces (Metrics, Streak, Sharpen the Saw).

---

## Phase 1 — Design tokens (≈ half a day)

Goal: replace `src/app/globals.css` token block with the prototype's tokens, mapped onto the existing shadcn names so nothing else has to change.

### 1.1 Token mapping

| Prototype (`ds/tokens.css`) | Repo (`globals.css` shadcn name)         | Notes                                  |
| --------------------------- | ---------------------------------------- | -------------------------------------- |
| `--ds-stage`                | (new — body bg outside window)           | `oklch(0.13 0.005 70)`                 |
| `--ds-window`               | `--background`                           | The app frame bg                       |
| `--ds-panel`                | `--card`, `--input`, `--muted`           | Same surface for all                   |
| `--ds-panel-2`              | (hover; expose as `--card-hover`)        | Slightly raised                        |
| `--ds-overlay`              | `--popover`                              | Dropdowns                              |
| `--ds-line`                 | `--border`                               | Default hairline                       |
| `--ds-line-soft`            | (expose as `--border-soft`)              | Dashed dividers                        |
| `--ds-line-strong`          | `--border-emphasis`                      | Already exists                         |
| `--ds-fg`                   | `--foreground`, `--card-foreground`      | 0.95 L                                 |
| `--ds-fg-muted`             | `--secondary-foreground`                 | 0.76 L · AAA contrast                  |
| `--ds-fg-dim`               | `--muted-foreground`                     | 0.62 L · AA contrast                   |
| `--ds-fg-faint`             | (new — `--foreground-faint`)             | 0.52 L · AA large only                 |
| `--ds-accent`               | `--primary`, `--ring`                    | The single brand color                 |
| `--ds-accent-soft`          | `--accent`, `--primary-soft`             | Hover bg                               |
| `--ds-accent-faint`         | `--primary-muted`                        | —                                      |
| `--ds-accent-ink`           | `--primary-foreground`                   | Text on accent (dark)                  |
| `--ds-c-amber/rose/violet/sky/mint/sand` | `--role-1` … `--role-8`     | Replace existing role palette          |
| `--ds-success/warning/danger` | `--success`/`--warning`/`--destructive` | Same names                             |
| `--ds-r-xs/sm/md/lg/xl/pill` | `--radius-sm/md/lg/xl/full`             | Map by position                        |
| Font: `Geist` / `Geist Mono` | `--font-sans` / new `--font-mono`        | Load via `next/font/google`            |

### 1.2 Concrete patch for `src/app/globals.css`

Replace the `:root` block (lines 11–95 of the current globals.css) with the dark-default tokens from `ds/tokens.css`. The current file declares `.dark` as a variant on `:root` — flip it so **dark is the default** and `.light` is the alternate (the prototype's aesthetic IS the dark workspace).

```css
:root {
  /* Surfaces */
  --background: oklch(0.165 0.006 70);   /* was --ds-window */
  --card: oklch(0.185 0.006 70);
  --card-foreground: oklch(0.95 0.008 80);
  --muted: oklch(0.185 0.006 70);
  --muted-foreground: oklch(0.62 0.014 75);
  --popover: oklch(0.22 0.008 70);

  /* Text */
  --foreground: oklch(0.95 0.008 80);
  --secondary-foreground: oklch(0.76 0.012 75);
  --foreground-faint: oklch(0.52 0.014 75);  /* NEW */

  /* Accent */
  --primary: oklch(0.78 0.14 78);
  --primary-foreground: oklch(0.16 0.01 78);
  --primary-soft: oklch(0.78 0.14 78 / 0.18);
  --primary-muted: oklch(0.78 0.14 78 / 0.08);
  --accent: oklch(0.78 0.14 78 / 0.18);
  --accent-foreground: oklch(0.95 0.008 80);

  /* Borders */
  --border: oklch(0.255 0.008 70);
  --border-soft: oklch(0.225 0.007 70);     /* NEW */
  --border-emphasis: oklch(0.32 0.01 70);
  --input: oklch(0.185 0.006 70);
  --ring: oklch(0.78 0.14 78 / 0.5);

  /* Roles — vary hue only */
  --role-1: oklch(0.78 0.14 78);    /* amber */
  --role-2: oklch(0.72 0.11 295);   /* violet */
  --role-3: oklch(0.72 0.12 25);    /* rose */
  --role-4: oklch(0.74 0.10 230);   /* sky */
  --role-5: oklch(0.78 0.10 160);   /* mint */
  --role-6: oklch(0.74 0.06 60);    /* sand */
  --role-7: oklch(0.74 0.10 195);   /* teal */
  --role-8: oklch(0.74 0.10 330);   /* magenta */

  /* Glow (NEW — used on body::before) */
  --glow-color: oklch(0.78 0.14 78 / 0.55);
  --glow-size: 520px;

  /* Type */
  --font-sans: "Geist", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "Geist Mono", ui-monospace, "JetBrains Mono", monospace;
  --tracking-wide: 0.12em;

  /* Shadows */
  --shadow-window: 0 30px 90px rgba(0,0,0,0.55);

  /* Radii — keep existing values */
}
```

Keep `--text-label: 10px;`, `--text-caption: 11px;` from the current file.

### 1.3 Glow

Add the signature ambient glow as a `body::before` (or a real `<div>` if the body has constraints):

```css
body::before {
  content: "";
  position: fixed;
  left: 50%; bottom: -180px;
  transform: translateX(-50%);
  width: min(1400px, 95vw);
  height: var(--glow-size);
  background: radial-gradient(60% 55% at 50% 100%, var(--glow-color) 0%, transparent 72%);
  filter: blur(28px);
  pointer-events: none;
  z-index: 0;
}
```

### 1.4 Fonts

In `src/app/layout.tsx`:

```ts
import { Geist, Geist_Mono } from "next/font/google";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });

// <html className={`${geist.variable} ${geistMono.variable}`}>
```

### 1.5 Accessibility

The token text scale is tuned for WCAG AA on the new background:

- `--foreground` ~16:1 (AAA)
- `--secondary-foreground` ~7:1 (AAA)
- `--muted-foreground` ~4.6:1 (AA normal)
- `--foreground-faint` ~3.1:1 (AA large only — use sparingly: hairline borders, decorative meta)

Verify in DevTools with axe before shipping.

---

## Phase 2 — Component ports (≈ 1 day)

### 2.1 What's already in `src/components/ui/`

Keep and **restyle** (don't replace): `button.tsx`, `input.tsx`, `checkbox.tsx`, `badge.tsx`, `dialog.tsx`, `dropdown-menu.tsx`, `context-menu.tsx`, `tooltip.tsx`, `popover.tsx`, `scroll-area.tsx`, `separator.tsx`, `progress.tsx`, `alert-dialog.tsx`, `BlockCard.tsx`, `AddItemInput.tsx`.

These use shadcn class structure — once the tokens above land, they'll already look right. Just verify in the running app.

### 2.2 New components to add

Port these from `ds/components.jsx` into `src/components/ui/` (TypeScript, props typed):

| New component       | Prototype source       | Purpose                                      |
| ------------------- | ---------------------- | -------------------------------------------- |
| `WindowChrome.tsx`  | `WindowChrome`         | Top bar — menu/settings + traffic lights     |
| `SectionLabel.tsx`  | `SectionLabel`         | Mono uppercase label + optional icon         |
| `TabPill.tsx`       | `TabPill`              | Rounded pill with close/add (the week tab)   |
| `StatRow.tsx`       | `StatRow`              | Label · value, accent variant                |
| `Donut.tsx`         | `Donut`                | SVG progress donut (replaces `PieChart`)     |
| `StreakGrid.tsx`    | `StreakGrid`           | 7-cell daily streak                          |
| `Chip.tsx`          | `Chip`                 | Toggleable pill                              |
| `Segmented.tsx`     | `Segmented`            | iOS-style segmented control                  |
| `EditableText.tsx`  | `EditableText`         | Double-click → input → save                  |
| `Icon.tsx`          | `Icon`                 | 26 inline SVG icons (1.4px stroke)           |

The repo already uses `lucide-react` — you can swap the `Icon` component for `lucide-react` icons directly. Names map 1:1 (Menu, Settings, X, Plus, ChevronLeft, etc.). Use stroke width 1.4 to match the prototype's hairline feel.

### 2.3 Port pattern (example)

`ds/components.jsx` is plain JS; convert to TS by:

1. Add prop types: `interface SectionLabelProps { icon?: LucideIcon; children: ReactNode; action?: ReactNode; }`
2. Replace inline classnames with `cn()` from `src/lib/utils.ts`.
3. Replace token literals with Tailwind classes mapped to the tokens (e.g. `text-secondary-foreground`, `border-border`).

---

## Phase 3 — App surface re-skin (≈ 2 days)

You're swapping presentation, not logic. The Zustand store and Dexie schema stay.

### 3.1 Window shell

Create `src/components/layout/AppWindow.tsx`:

```tsx
export function AppWindow({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen p-6">
      <div className="mx-auto max-w-[1680px] rounded-lg border bg-background shadow-[var(--shadow-window)] overflow-hidden">
        <WindowChrome right={<ThemeToggle />} />
        {children}
      </div>
    </div>
  );
}
```

Wrap the existing `MainLayout` in this. The current `MainLayout.tsx` already has the sidebar + week-view split — just wrap.

### 3.2 Sidebar

`src/components/sidebar/Sidebar.tsx` — restructure to match prototype:

1. **Top**: `<WeeklyBalance />` — new component. Renders a `Donut` of `totalHours / 40` + horizontal role bars (one row per role with hours).
2. **Below**: `<SectionLabel icon={Users}>Roles & Goals</SectionLabel>` + existing `<RoleList />`.

In `RoleSection.tsx`:
- Card → background `bg-card`, `border-l-2` colored to role, padding `p-3 pl-2.5`, no rounded-[8px] override needed if tokens are set.
- Header row: `dot · name · {hours}h · {plus button}`.
- Goals: stack with `gap-1`, each row is `[checkbox][text][× on hover]`.

The drag handles are already in the dnd-kit setup — leave them.

### 3.3 Calendar (the big one)

`src/components/calendar/WeekView.tsx`:

1. **Week nav**: replace `WeekNavigation.tsx` with the 3-col layout — `[TabPill][< Today >][Wk N · Month YYYY]`.
2. **Day columns**: replace `DayColumn.tsx` header with the prototype's:
   - Stacked label (day name, date number)
   - Today: date in a filled accent circle (26×26)
   - Right: small donut showing day completion

`src/components/calendar/TimeBlock.tsx` — restyle to `.ftf-block` from the prototype:
- `background: color-mix(in oklab, var(--role-color), transparent 86%)`
- `border-left: 3px solid var(--role-color)`
- Inside: title (1 line) + meta line (`HH:MM · Nh · free?`)
- For blocks of 2 slots (1h) or less, hide the meta line (`ftf-block--short`)

`src/components/calendar/EveningSlot.tsx` — bottom of column, smaller pills, role-colored dot.

`src/components/calendar/DayPriorities.tsx` — top of column, "PRIORITIES" mono uppercase label + add button on hover, checkbox list.

### 3.4 Right rail (new)

Create `src/components/rail/Rail.tsx` with three cards in order:

1. `<MetricsCard />` — uses `StatRow` for Planned, Unfilled, Completed, Saw items.
2. `<StreakCard />` — `SectionLabel` + accent number + `StreakGrid` + M T W T F S S legend.
3. `<SharpenTheSaw />` — `SectionLabel` + 4 categories (Physical, Mental, Spiritual, Social) each with an icon, "X/Y" counter, and a list of items.

Layout it in `MainLayout.tsx`:

```tsx
<main className="grid grid-cols-[296px_1fr_304px] border-t">
  <Sidebar />
  <WeekView />
  <Rail />
</main>
```

Responsive: rail hides below 1280px, sidebar below 1024px (mobile single-day view is Phase 5).

---

## Phase 4 — Sharpen the Saw data model (≈ half a day)

The repo doesn't have this yet. Add to `src/types/index.ts`:

```ts
export type SawCategory = "physical" | "mental" | "spiritual" | "social";

export interface SawItem {
  id: string;
  weekId: string;            // FK to Week
  category: SawCategory;
  text: string;
  done: boolean;
  count?: number;            // optional: progress within a target
  target?: number;
  order: number;
}
```

Add a Dexie table in `src/lib/db.ts`:

```ts
sawItems: '++id, weekId, category, order'
```

Wire CRUD into `src/stores/weekStore.ts` mirroring how `dayPriorities` works (add, update, toggle, delete, reorder).

The four categories are **hardcoded** (Physical / Mental / Spiritual / Social) — don't make them user-editable. Items within a category are user-editable, draggable to reorder, deletable.

---

## Phase 5 — Tweaks & mobile (≈ 1 day)

### 5.1 Tweaks

The prototype's tweaks panel persists into `TWEAK_DEFAULTS` in `app/app.jsx`. **Do NOT port the tweaks panel to production** — it's a design exploration tool, not user-facing. Instead:

- Pick the winning values (`themeAccent: amber`, `glow: true`, `density: comfortable` — or whatever the user landed on) and bake them as the defaults.
- If the user wants accent-color personalization as a real feature, expose it in a Settings dialog (using `<Dialog>` from shadcn) and persist to Dexie under a `userPrefs` table.

### 5.2 Mobile

The brief calls for a single-day view on mobile. Pattern:

- `<1024px`: hide `Sidebar` and `Rail`.
- `<768px`: hide the grid `WeekView`, show `<DayView />` instead — a vertically stacked single-day card:
  - Day header (large date + donut)
  - Priorities list
  - Time blocks as vertical cards (no grid)
  - Evening pills
  - Sharpen the Saw accessible via a bottom sheet (use `<Drawer>` — add `vaul` or `shadcn drawer`)
- Swipe left/right to change day. Day index in URL (`?day=2`).

---

## Code references

When porting, **read the prototype source directly** to lift exact values:

- **Tokens** → `ds/tokens.css`
- **Layout grid + sidebar/rail dimensions** → `app/app.css` (`.ftf-app`, `.ftf-sidebar`, `.ftf-rail`)
- **Calendar layout** → `app/app.css` (`.ftf-day*`, `.ftf-block*`, `.ftf-timelabels*`)
- **Block styling** → `.ftf-block` and `.ftf-block--short` in `app/app.css`
- **Component logic** → `ds/components.jsx`
- **App composition** → `app/sidebar.jsx`, `app/calendar.jsx`, `app/rail.jsx`

Class names in the prototype are flat (`ftf-` prefix for app, `ds-` for design system). In the Next.js port use Tailwind classes — the `ftf-*` classes are mostly translatable to `bg-card border border-border rounded-md p-3` patterns.

---

## Testing checklist

After each phase, run the existing manual-test checklist from the repo's `README.md`:

- [ ] **Sidebar**: Add, edit (double-click), and delete roles and goals
- [ ] **Calendar**: Drag goals to day priorities, time grid, and evening slots
- [ ] **Calendar**: Drag time blocks and priorities between days
- [ ] **Evening**: Drag evening blocks between days
- [ ] **Delete**: Delete buttons work on all item types
- [ ] **Dark mode**: Toggle works (now: light mode toggle — dark is default)

New checks for the redesign:

- [ ] **Window chrome**: menu/settings present; traffic lights are decorative (don't actually close)
- [ ] **Today indicator**: filled accent circle on today; donut updates as items complete
- [ ] **Streak**: shows last 7 days, current streak count
- [ ] **Saw**: add/edit/delete/check items in each of 4 categories
- [ ] **Metrics**: numbers update reactively as items change
- [ ] **Responsive**: rail collapses ≤1280px, sidebar ≤1024px, day view ≤768px
- [ ] **Contrast**: every text token meets AA on the new background

---

## Open questions for the team

These were unanswered in the BRIEF; resolve before shipping:

1. **Goal completion** — Brief says "stretch goal". The redesign assumes goals **can** be checked. Confirm or remove.
2. **Carryover** — The existing `CarryoverDialog` is for week-to-week. Should Sharpen the Saw items also carry over? (Recommendation: yes, marked-done items reset, structure persists.)
3. **Free vs goal-linked blocks** — Visual treatment is distinct (dashed border for free, filled tint for goal-linked). Confirm this reads correctly.
4. **Streak definition** — What counts as a "completed day"? All priorities done? Any priority done? At least one time block?
5. **Mobile-first or desktop-only for v1?** — If shipping desktop only, defer Phase 5.2.

---

## Estimated total

**5–7 focused days**, depending on which Phase 5 items make the cut.

| Phase | Scope                          | Days |
| ----- | ------------------------------ | ---- |
| 1     | Tokens + glow + fonts          | 0.5  |
| 2     | Component ports                | 1    |
| 3     | App surface re-skin            | 2    |
| 4     | Sharpen the Saw model          | 0.5  |
| 5.1   | Bake tweak defaults            | 0.25 |
| 5.2   | Mobile single-day view         | 1    |
| —     | Buffer + polish + a11y         | 0.75 |
