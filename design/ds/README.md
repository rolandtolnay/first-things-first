# Dark Workspace Kit

A small, opinionated design system: dark workspace window with a warm amber glow, hairline borders, monospaced UPPERCASE micro-labels. Built for HTML/React prototypes in this tool. Three files, no build step.

```
ds/
├── tokens.css      ← All tokens + base CSS for every component class
├── components.jsx  ← React components (load with <script type="text/babel">)
└── tweaks-panel.jsx ← Optional: runtime customization panel (starter component)
```

→ See **`starter.html`** at the project root for a minimal working entry point.
→ See **`design-system.html`** for a live component gallery.

---

## Aesthetic — locked

These are non-negotiable defaults. Override consciously, not by accident.

- **Dark workspace window** on a darker stage. Single, fixed, warm amber glow bleeding from the bottom of the viewport. The glow IS the brand.
- **Hairline borders, no heavy fills.** Buttons are ghost or outlined by default. The accent is the only filled color.
- **One accent at a time.** Amber by default. Other named hues: rose, violet, mint, sky.
- **Type rhythm**: sans body + **monospaced UPPERCASE micro-labels** with 0.12em tracking. Geist + Geist Mono.
- **Numbers are tabular and mono.** Times, hours, counters → add `ds-num ds-mono`.
- **Section headers are flat.** Separated by whitespace and a single hairline. No heavy dividers, no cards-within-cards.

---

## Quick start

1. Copy `ds/` into your project root.
2. Copy `starter.html` and rename if you like.
3. Open it. That's it.

Your HTML head only needs four things — fonts, tokens, React UMD, Babel-standalone:

```html
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="ds/tokens.css">
<script src="https://unpkg.com/react@18.3.1/umd/react.development.js"></script>
<script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js"></script>
<script src="https://unpkg.com/@babel/standalone@7.29.0/babel.min.js"></script>
```

Then load the components, then your app. **Order matters — Babel preserves it.**

```html
<script type="text/babel" src="ds/components.jsx"></script>
<script type="text/babel" src="app.jsx"></script>  <!-- your code -->
```

Every component is on `window` after `components.jsx` runs, so you can use them as bare identifiers in your app code: `<Button>`, `<Card>`, `<Dialog>`, etc.

---

## Tokens

Every visual decision lives in `ds/tokens.css`. Touch this file to change the whole system.

### Surfaces

| Token | Purpose |
| --- | --- |
| `--ds-stage` | Outermost canvas (behind the window) |
| `--ds-window` | The app window background |
| `--ds-panel` | Cards, inputs, nested surfaces |
| `--ds-panel-2` | Hover / raised state |
| `--ds-overlay` | Dropdowns, popovers, toasts |
| `--ds-line` | Default hairline |
| `--ds-line-soft` | Dashed dividers, subtle |
| `--ds-line-strong` | Emphasis borders |

### Text — tuned for WCAG AA

| Token | Contrast vs `--ds-window` | When to use |
| --- | --- | --- |
| `--ds-fg` | ~16:1 (AAA) | Primary text, all sizes |
| `--ds-fg-muted` | ~7:1 (AAA) | Section labels, secondary text |
| `--ds-fg-dim` | ~4.6:1 (AA normal) | Meta lines, captions |
| `--ds-fg-faint` | ~3.1:1 (AA large only) | Decorative meta, hover-revealed icons |

### Accent

`--ds-accent`, `--ds-accent-soft`, `--ds-accent-faint`, `--ds-accent-ink`. Drive the hue by setting `--ds-accent-h` (default `78` for amber). Presets:

| Hue | Value |
| --- | --- |
| amber  | `78` |
| rose   | `25` |
| violet | `295` |
| mint   | `160` |
| sky    | `230` |

### Role palette (secondary, for tagging)

`--ds-c-amber`, `--ds-c-rose`, `--ds-c-violet`, `--ds-c-sky`, `--ds-c-mint`, `--ds-c-sand`. All share lightness + chroma, vary hue only.

### Spacing, radii, motion

```
--ds-s-1 … --ds-s-8     4px → 48px scale
--ds-r-xs … --ds-r-pill  4px → 999px
--ds-dur-fast / --ds-dur / --ds-dur-slow   120 / 180 / 300ms
--ds-ease  cubic-bezier(0.2, 0.6, 0.2, 1)
```

### Type scale

```
--ds-t-micro     10px   tiny mono labels
--ds-t-label     11px   UPPERCASE section labels
--ds-t-caption   12px   secondary meta
--ds-t-body      13px   default
--ds-t-body-l    14px   emphasis body
--ds-t-h6 … h1   15 → 36px
```

### The glow

Add `<div class="ds-glow" />` once, inside `.ds-stage`. It's `position: fixed`, anchored to the bottom of the viewport. Customize via:

```
--ds-glow-color    color (default: amber at 55% alpha)
--ds-glow-size     height in px (default: 520px)
```

To disable: add class `ds-no-glow` to the body or the stage.

### Light theme (opt-in)

Add the `ds-light` class to `<html>` (or `<body>`) to flip every surface, text, border, and accent token to a warm paper-white variant. The amber glow softens into a faint golden wash; the accent darkens slightly to maintain contrast on light surfaces.

```html
<html class="ds-light"> … </html>
```

The bundled `<ThemeToggle />` component handles this — drop it into your chrome:

```jsx
<WindowChrome right={<ThemeToggle />} />
```

It persists choice in `localStorage` under the `ds-theme` key (override via `<ThemeToggle storageKey="…" />`). The light variant preserves WCAG AA contrast on every text token. Dark is still the default — don't change `<html>` unless you mean to.

---

## Components

All components are React functions, exported on `window` by `ds/components.jsx`. Class names are prefixed `ds-` and live in `tokens.css`.

### Layout

| Component | Purpose | Key props |
| --- | --- | --- |
| `<WindowChrome>` | Top bar: menu + settings + traffic lights | `left`, `right` (slot ReactNode) |
| `<Card>` | Bordered panel | `inset`, `ghost` (variants) |
| `<SectionLabel>` | Mono UPPERCASE label + optional icon | `icon`, `children`, `action` |

### Inputs

| Component | Purpose | Key props |
| --- | --- | --- |
| `<Button>` | Outlined by default | `variant` = `default \| accent \| ghost`; `size` = `sm \| icon \| icon-sm`; `icon` |
| `<Checkbox>` | 14×14 check, accent on | `checked`, `onChange` |
| `<Toggle>` | iOS-style on/off | `checked`, `onChange`, `label` |
| `<Chip>` | Toggleable pill | `on`, `icon`, `onClick` |
| `<Segmented>` | Inline tab pill (single line) | `value`, `onChange`, `options[]` |
| `<EditableText>` | Double-click → input | `value`, `onSave`, `as` |
| `<Slider>` | Range input | `value`, `onChange`, `min`, `max`, `step`, `label` |
| `<TabPill>` | Workspace / session tab | `icon`, `label`, `onClose`, `onAdd` |

### Overlays

| Component | Purpose | Key props |
| --- | --- | --- |
| `<Dialog>` | Modal overlay | `open`, `onClose`, `title`, `footer`, `width` |
| `<Tooltip>` | Hover label | `label`, `side` = `top \| bottom \| left \| right`, `delay` |
| `<DropdownMenu>` | Trigger + menu | `trigger` (ReactNode), `items[]`, `align` = `start \| end` |
| `<ToastProvider>` + `useToast()` | Notifications | Wrap your app; call `toast(msg)` or `toast({title, message, kind})` |

`DropdownMenu` items: `{ label, icon?, kbd?, onClick?, danger?, kind: 'separator' }`.
Toast `kind`: `info` (default) · `success` · `warning` · `error` · `accent`.

### Display

| Component | Purpose | Key props |
| --- | --- | --- |
| `<StatRow>` | Label · value row | `label`, `value`, `accent` |
| `<Donut>` | Progress arc | `completed`, `total`, `size`, `color` |
| `<StreakGrid>` | 7-day cells | `days[]` where each is 0 / 1 / 2 |
| `<Avatar>` | Initials or image | `name`, `src`, `size` = `sm \| md \| lg`, `accent` |
| `<Skeleton>` | Shimmer placeholder | `width`, `height`, `radius` |
| `<EmptyState>` | Zero-data fallback | `icon`, `title`, `action`; children = subtitle |
| `<ListRow>` | Checkbox + title + meta row | `checked`, `onCheck`, `title`, `meta`, `color`, `action` |
| `<Tabs>` | Multi-panel tabs | `value`, `onChange`, `tabs[]` |
| `<Icon>` | Stroke icon | `name` (26 included), `size` |
| `<ThemeToggle>` | Sun/moon button (writes `.ds-light` on html) | `storageKey` |

### Tweaks panel (optional)

Use the `TweaksPanel` shell + `useTweaks` hook from `ds/tweaks-panel.jsx` to expose runtime knobs (accent, glow, density, custom feature flags). Persistence is automatic — the host rewrites your defaults block on disk.

```jsx
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{ "accent": "amber" }/*EDITMODE-END*/;
const [t, setT] = useTweaks(TWEAK_DEFAULTS);
// <TweaksPanel> ... <TweakRadio value={t.accent} onChange={v => setT('accent', v)} ... /> </TweaksPanel>
```

The Tweaks panel is a **design exploration tool, not a user feature**. Bake winning values as defaults before shipping; expose only meaningful user prefs through a real settings dialog.

---

## Patterns

### Window shell

```jsx
<div className="ds-stage">
  <div className="ds-glow" />
  <div className="ds-window">
    <WindowChrome right={<a>Help</a>} />
    <main>{/* your app */}</main>
  </div>
</div>
```

### Section composition (the rhythm)

```jsx
<SectionLabel icon="target">Week metrics</SectionLabel>
<Card>
  <StatRow label="Planned"  value="29.5h" />
  <StatRow label="Unfilled" value="10.5h" accent />
</Card>
```

The mono UPPERCASE label is the bridge between sections. Don't put a section title inside a Card — keep the label outside, the Card inside.

### Number rendering

Always wrap numerical values in `ds-num` (tabular) + `ds-mono` if they should look monospaced:

```jsx
<span className="ds-num ds-mono">29.5</span>
<span className="ds-dim ds-mono" style={{fontSize: 11}}>h</span>
```

### Inline editable text

Anywhere you'd put plain copy that the user might rename, use `<EditableText>`. Double-click to edit, Enter to save, Escape to cancel. Zero footprint when not editing.

---

## Rules of the system

1. **One accent at a time.** Don't paint with two filled colors. Role chips are an exception (they're tags, not actions).
2. **Hairlines, not slabs.** Borders are 1px and use `--ds-line`. If something looks too quiet, you're probably right — that's the system.
3. **Labels mono, body sans.** Section labels are always UPPERCASE, monospaced, 11px, 0.12em tracking. Body text is sans.
4. **Numbers tabular.** Always.
5. **The glow stays.** It is the most identifiable thing about the kit.
6. **No emoji.** Use the `<Icon>` set or a placeholder.
7. **No gradients on text.** No drop shadows on text. No rounded-corner ribbons. No "AI slop tropes" (left-bordered cards, gradient accent blobs).
8. **Compose at the token level.** If you find yourself writing a literal color or hardcoded radius in a component, stop and add a token.

---

## When to extend the kit

Add to `ds/components.jsx` when:
- A pattern appears in 3+ places in your app.
- An accessibility requirement (focus trap, ARIA pattern) needs a single owner.

Don't add when:
- It's a one-off for a single screen — keep it in your app code.
- It's "almost like X but different" — generalize X instead.

When adding:
- Class names prefix `ds-`. CSS goes in `tokens.css`.
- Component goes in `components.jsx`, exported on `window` at the bottom.
- Add a demo tile in `ds/showcase.jsx`.
- Update this README's component table.

---

## Architecture notes

- **No build step.** This is intentional — the kit ships as readable source. Babel-standalone transpiles JSX at runtime; React UMD provides the runtime.
- **Cross-script scope**: each `<script type="text/babel">` gets its own scope. Components are shared globally via `Object.assign(window, { Foo, Bar })`.
- **Style objects**: if you use inline-style objects, name them after the component (`const cardStyles = …`), not just `styles`. Multiple `styles` constants in different files collide globally.
- **Static HTML where possible.** This tool supports direct-manipulation edits on static HTML elements; JSX-generated markup must round-trip through chat. Use static markup for content that the user might want to edit visually.

---

## License / reuse

This kit is yours to copy into other projects. Versioning is informal — pin a snapshot, edit freely.

If you change a token, change it for all consumers at once. If you add a component, document it here.
