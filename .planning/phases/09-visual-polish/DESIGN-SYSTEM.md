# Design System: First Things First

## Design Direction

**Mood**: Calm, intentional, warm — like a well-organized desk on a Sunday morning.
**Inspiration**: Dashboard UIs with white floating cards on soft tinted backgrounds, generous whitespace, rounded geometry, and warm accent colors.
**Key principle**: Every visual choice should make the user feel organized and in control, not overwhelmed.

---

## 1. Color Palette

### Primary Accent — Soft Teal/Mint

The primary accent shifts from the current "JARVIS teal" to a warmer, softer mint-teal family.

| Token | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| `--primary` | `#14B8A6` (teal-500) | `#2DD4BF` (teal-400) | Primary buttons, active states, focus rings |
| `--primary-hover` | `#0D9488` (teal-600) | `#14B8A6` (teal-500) | Button hover states |
| `--primary-soft` | `#CCFBF1` (teal-100) | `hsl(173 80% 15%)` | Subtle highlights, selected items, badges |
| `--primary-muted` | `#99F6E4` (teal-200) | `hsl(173 60% 20%)` | Secondary accents, progress bars |

### Backgrounds

| Token | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| `--bg-page` | `#F0FDFA` (teal-50) | `#0F1419` | Main page background — soft teal wash |
| `--bg-card` | `#FFFFFF` | `#1A2332` | Card surfaces — pure white to float above page |
| `--bg-sidebar` | `#FFFFFF` | `#141D2B` | Sidebar background |
| `--bg-muted` | `#F5F7FA` | `#1E2A3A` | Subtle section backgrounds within cards |
| `--bg-hover` | `#F0FDFA` | `hsl(173 30% 12%)` | Hover state for interactive elements |

### Text

| Token | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| `--text-primary` | `#0F172A` (slate-900) | `#F1F5F9` (slate-100) | Headings, primary text |
| `--text-secondary` | `#475569` (slate-600) | `#94A3B8` (slate-400) | Body text, descriptions |
| `--text-muted` | `#94A3B8` (slate-400) | `#64748B` (slate-500) | Placeholders, hints, timestamps |
| `--text-on-primary` | `#FFFFFF` | `#FFFFFF` | Text on primary-colored backgrounds |

### Semantic Colors

| Token | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| `--success` | `#10B981` (emerald-500) | `#34D399` (emerald-400) | Completion checkmarks, done states |
| `--success-soft` | `#D1FAE5` (emerald-100) | `hsl(160 60% 12%)` | Completed item backgrounds |
| `--warning` | `#F59E0B` (amber-500) | `#FBBF24` (amber-400) | "Plan this week?" banner, alerts |
| `--warning-soft` | `#FEF3C7` (amber-100) | `hsl(45 60% 12%)` | Warning backgrounds |
| `--destructive` | `#EF4444` (red-500) | `#F87171` (red-400) | Delete buttons, error states |
| `--destructive-soft` | `#FEE2E2` (red-100) | `hsl(0 60% 12%)` | Destructive action backgrounds |

### Borders & Dividers

| Token | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| `--border-subtle` | `#E2E8F0` (slate-200) | `#1E293B` (slate-800) | Card borders, dividers |
| `--border-emphasis` | `#CBD5E1` (slate-300) | `#334155` (slate-700) | Focused inputs, emphasized sections |
| `--ring-focus` | `#14B8A6 / 0.5` | `#2DD4BF / 0.5` | Focus rings (50% opacity of primary) |

### Role Colors (8-color palette)

Keep the existing 8-color system but refine for softer tones that harmonize with the teal primary. Each role gets a color pair: a vibrant version for borders/accents and a soft version (10-15% opacity) for backgrounds.

| Index | Name | Vibrant (Light) | Vibrant (Dark) | Soft BG (Light) | Purpose |
|-------|------|-----------------|----------------|-----------------|---------|
| 1 | Teal | `#14B8A6` | `#2DD4BF` | `rgba(20,184,166,0.12)` | Default / first role |
| 2 | Violet | `#8B5CF6` | `#A78BFA` | `rgba(139,92,246,0.12)` | |
| 3 | Amber | `#F59E0B` | `#FBBF24` | `rgba(245,158,11,0.12)` | |
| 4 | Sky | `#0EA5E9` | `#38BDF8` | `rgba(14,165,233,0.12)` | |
| 5 | Rose | `#F43F5E` | `#FB7185` | `rgba(244,63,94,0.12)` | |
| 6 | Emerald | `#10B981` | `#34D399` | `rgba(16,185,129,0.12)` | |
| 7 | Orange | `#F97316` | `#FB923C` | `rgba(249,115,22,0.12)` | |
| 8 | Slate | `#64748B` | `#94A3B8` | `rgba(100,116,139,0.12)` | Fallback / neutral |

---

## 2. Typography

### Font Family

**Replace Geist Sans with Plus Jakarta Sans** — a geometric, friendly, modern sans-serif with excellent readability at all sizes. Single font family for headings and body (different weights create hierarchy).

```css
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
```

```ts
// next/font/google
import { Plus_Jakarta_Sans } from 'next/font/google';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
});
```

### Type Scale

| Token | Size | Weight | Line Height | Letter Spacing | Usage |
|-------|------|--------|-------------|----------------|-------|
| `--text-h1` | 24px | 700 (bold) | 1.3 | -0.02em | Page title ("First Things First") |
| `--text-h2` | 18px | 600 (semibold) | 1.4 | -0.01em | Section headers ("Roles", week label) |
| `--text-h3` | 15px | 600 (semibold) | 1.4 | 0 | Sub-headers (role names) |
| `--text-body` | 14px | 400 (regular) | 1.5 | 0 | Body text, goal text |
| `--text-caption` | 12px | 500 (medium) | 1.4 | 0.01em | Time labels, day names, hints |
| `--text-micro` | 11px | 500 (medium) | 1.3 | 0.02em | Compact labels, badges |

### Typography Rules

- **No uppercase tracking-wide** for section labels. Use `text-caption` weight 600 in `--text-muted` color instead.
- Day names in column headers: `text-caption` weight 600, `--text-secondary`.
- Date numbers: `text-body` weight 700 for today, weight 400 for other days.
- Time slot labels: `text-caption` in `--text-muted`.

---

## 3. Spacing Scale

Use a consistent 4px base grid. All spacing values are multiples of 4.

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | 4px | Tight gaps (icon-to-text within a button) |
| `--space-2` | 8px | Default inline gap, checkbox-to-label |
| `--space-3` | 12px | Compact padding (priority items, time blocks) |
| `--space-4` | 16px | Standard padding (cards, sections) |
| `--space-5` | 20px | Generous padding (sidebar header, dialog padding) |
| `--space-6` | 24px | Section separators, large gaps |
| `--space-8` | 32px | Major section breaks |

### Key Spacing Conventions

- **Card padding**: `--space-4` (16px) on all sides.
- **Sidebar**: `--space-5` (20px) horizontal padding, `--space-4` (16px) vertical.
- **Between role sections**: `--space-3` (12px).
- **Between goals within a role**: `--space-2` (8px).
- **Day column padding**: `--space-2` (8px) horizontal, `--space-3` (12px) vertical.
- **Time block internal padding**: `--space-2` (8px) horizontal, `--space-1` (4px) vertical.

---

## 4. Border Radius

All elements use a generous, consistent rounding system that creates the soft, approachable feel from the inspiration designs.

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 6px | Small elements: checkboxes, badges, tags |
| `--radius-md` | 10px | Buttons, inputs, time blocks, priority items |
| `--radius-lg` | 14px | Cards, day columns, dialog sections |
| `--radius-xl` | 20px | Dialog container, sidebar panels, large cards |
| `--radius-full` | 9999px | Avatars, role color dots, pills |

### Radius Rules

- **Buttons**: `--radius-md` (10px).
- **Input fields**: `--radius-md` (10px).
- **Time blocks**: `--radius-md` (10px). Not `rounded-sm` — blocks should feel like distinct cards.
- **Priority items**: `--radius-md` (10px).
- **Day column containers**: `--radius-lg` (14px) on outer corners only.
- **CarryoverDialog**: `--radius-xl` (20px).
- **Role color dots**: `--radius-full` (circle).
- **Sidebar**: `--radius-xl` (20px) on the right side (or no radius if full-height).

---

## 5. Shadows

Replace the current near-zero shadow approach with soft, layered shadows that create depth hierarchy. Shadows are the main way cards "float" above the tinted background.

| Token | Value (Light) | Value (Dark) | Usage |
|-------|--------------|--------------|-------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.04)` | `0 1px 2px rgba(0,0,0,0.2)` | Subtle lift (buttons, inputs) |
| `--shadow-md` | `0 2px 8px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)` | `0 2px 8px rgba(0,0,0,0.3)` | Card elevation (day columns, sidebar) |
| `--shadow-lg` | `0 4px 16px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)` | `0 4px 16px rgba(0,0,0,0.4)` | Elevated elements (dialog, drag preview) |
| `--shadow-xl` | `0 8px 32px rgba(0,0,0,0.10), 0 4px 8px rgba(0,0,0,0.04)` | `0 8px 32px rgba(0,0,0,0.5)` | Modals, popovers |

### Shadow Rules

- **Sidebar**: `--shadow-md` (no border-right, shadow creates separation).
- **Day columns**: No individual shadows. The entire calendar area is one card with `--shadow-md`.
- **Time blocks**: `--shadow-sm` at rest, `--shadow-lg` when dragging.
- **Drag preview**: `--shadow-lg`.
- **Dialog**: `--shadow-xl`.
- **Buttons**: `--shadow-sm` for secondary buttons. Primary buttons use no shadow (color is enough).

---

## 6. Component Reskinning Guide

### 6.1 MainLayout (`src/components/layout/MainLayout.tsx`)

**Current**: `grid-cols-[minmax(280px,25%)_1fr]` with `border-r` separating sidebar.

**New design**:
- Page background: `--bg-page` (soft teal-50 wash).
- Remove `border-r` between sidebar and main.
- Add `--space-4` (16px) padding around the entire layout (page margin).
- Sidebar: `--bg-card` (white) with `--shadow-md`, `--radius-xl` (20px) on all corners. Sits as a floating card.
- Main content area: `--bg-card` (white) with `--shadow-md`, `--radius-xl` (20px) on all corners. Also a floating card.
- Gap between sidebar card and main card: `--space-4` (16px).
- Overall feel: Two white rounded cards floating on a minty background.

```
┌─────────────────────────────────────────────────┐
│  bg: teal-50 (#F0FDFA)                         │
│                                                 │
│  ╭──────────╮  ╭───────────────────────────╮    │
│  │          │  │                           │    │
│  │ Sidebar  │  │   Calendar / Main         │    │
│  │  (white  │  │   (white card,            │    │
│  │   card)  │  │    rounded corners)       │    │
│  │          │  │                           │    │
│  ╰──────────╯  ╰───────────────────────────╯    │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 6.2 Sidebar (`src/components/sidebar/Sidebar.tsx`)

**Current**: Header with title + ThemeToggle, then role list with `border-b` separator.

**New design**:
- Background: `--bg-card` (white), `--radius-xl` (20px), `--shadow-md`.
- Header section: `--space-5` (20px) padding. Title "First Things First" in `--text-h1` (24px, bold 700). Teal color for "First" and `--text-primary` for "Things First" — or fully `--text-primary`. ThemeToggle button top-right.
- Remove `border-b` under header. Use `--space-6` (24px) gap between header and role list.
- "Roles" label: Remove uppercase/tracking-wide. Use `text-caption` weight 600, `--text-muted` color. Optionally prefix with a subtle icon.
- Role list: `--space-3` (12px) gap between role sections.
- Overflow: `overflow-y-auto` with smooth scroll, subtle scrollbar styling.

### 6.3 RoleSection (`src/components/sidebar/RoleSection.tsx`)

**Current**: Color dot + name + delete button with `hover:bg-secondary/50`.

**New design**:
- Role header: `--space-3` padding, `--radius-md` (10px) corners, `--bg-hover` on hover.
- Color indicator: Change from 3x3px circle to a 4px left border on the entire role section container. The role section gets a subtle left accent border in the role color.
- Role name: `--text-h3` (15px, semibold 600).
- Delete button: `--text-muted` color, `--radius-sm`, appears on hover with opacity transition (200ms).
- Goal list: Indented with `--space-4` (16px) left padding (not `ml-5`).

### 6.4 GoalItem (`src/components/sidebar/GoalItem.tsx`)

**Current**: 3px left border, `hover:bg-secondary/50`, `cursor-grab`.

**New design**:
- Container: `--radius-md` (10px), `--space-2` (8px) vertical / `--space-3` (12px) horizontal padding.
- Left accent: Keep 3px left border in role color, but now with `--radius-md` corners the border blends into the rounded shape.
- Hover: `--bg-hover` with smooth transition (200ms).
- Completed state: `--success-soft` background, text gets `opacity-60` and `line-through` (subtle, not heavy strikethrough).
- Text: `--text-body` (14px, regular 400).
- Drag cursor: `cursor-grab`, `active:cursor-grabbing`.
- Notes icon: Keep but use `--text-muted` color, size 14px.

### 6.5 WeekNavigation (`src/components/calendar/WeekNavigation.tsx`)

**Current**: Arrow buttons, week label, "Today" button, "+ New" button, banner.

**New design**:
- Container: Part of the main card. `--space-4` padding, no separate background.
- Navigation arrows: 36x36px, `--radius-md` (10px), `--bg-muted` background, `--shadow-sm`. Hover: `--bg-hover`. Use `--text-secondary` for arrow icon.
- Week label: `--text-h2` (18px, semibold 600), `--text-primary`.
- "This week" badge: `--primary-soft` background, `--primary` text, `--radius-full`, `--text-micro`, `--space-1` vertical / `--space-2` horizontal padding.
- "Today" button: Ghost style — `--text-secondary`, `--radius-md`, hover: `--bg-hover`.
- "+ New" button: Primary filled — `--primary` background, `--text-on-primary`, `--radius-md`, `--shadow-sm`. Hover: `--primary-hover`.
- "Plan this week?" banner: `--warning-soft` background, `--warning` left border (3px), `--radius-md`, `--text-secondary` text with `--warning` accent for emphasis.

### 6.6 DayColumn (`src/components/calendar/DayColumn.tsx`)

**Current**: `border-r`, sticky header with day name/date.

**New design**:
- Remove hard `border-r` between columns. Use `--border-subtle` with 50% opacity or remove entirely — the whitespace and alignment of the grid create visual separation.
- Day header: `--space-3` padding, bottom border `--border-subtle`.
- Day name: `--text-caption` (12px, medium 500), `--text-muted`.
- Date number: `--text-body` (14px), `--text-secondary`. Today: `--primary` color, `font-weight: 700`, with a `--primary-soft` circular background (28x28px).
- Today column: Very subtle `--primary-soft` (5% opacity) background wash on the entire column, not just the header.

### 6.7 DayPriorities (`src/components/calendar/DayPriorities.tsx`)

**Current**: `min-h-[80px]`, `bg-muted/10`, `border-b`.

**New design**:
- Container: `min-h-[80px]`, `--bg-muted` background (very subtle), `--radius-lg` (14px) corners (top of the day area).
- Drop hover: `--primary-soft` background with `--primary` dashed border (1px).
- Empty state: `--text-muted`, italic, "Drop goals here" text centered.
- Bottom separator: `--border-subtle` (keep but lighter).
- Item spacing: `--space-2` (8px) gap between priority items.

### 6.8 PriorityItem (`src/components/calendar/PriorityItem.tsx`)

**Current**: 3px left border, `hover:bg-secondary/50`.

**New design**:
- Container: `--radius-md` (10px), `--space-2` (8px) padding.
- Background: Role color at 10% opacity (`--role-N / 0.10`).
- Left border: 3px solid in role color (keep).
- Hover: Role color at 18% opacity.
- Checkbox: `CompletionCheckbox` with `--success` color when complete.
- Text: `--text-caption` (12px), `--text-secondary`.
- Completed: `--success-soft` background, text strikethrough with `opacity-60`.

### 6.9 TimeGrid (`src/components/calendar/TimeGrid.tsx`)

**Current**: CSS Grid `grid-cols-[3rem_1fr]`, 30-min slots.

**New design**:
- Time labels column: `3rem` wide, `--text-caption`, `--text-muted`. Right-aligned. Use `tabular-nums` for even spacing.
- Slot height: Keep `32px` (functional, works well).
- Hour lines: `--border-subtle` at full hours. Half-hour lines: `--border-subtle` at 30% opacity (barely visible).
- Remove alternating slot backgrounds. Use uniform `--bg-card` with only hour/half-hour border differentiation.

### 6.10 TimeBlock (`src/components/calendar/TimeBlock.tsx`)

**Current**: Absolute positioned, role color 20% opacity background, 3px left border.

**New design**:
- Container: `--radius-md` (10px), `--shadow-sm`.
- Background: Role color at 12% opacity. Freestyle (no role): `--bg-muted`.
- Left border: 3px solid in role color (keep — this is a strong brand pattern).
- Hover: `--shadow-md` (elevates slightly). Subtle scale `1.005` (barely perceptible).
- Dragging state: `--shadow-lg`, `opacity-90` (not 50% — keep it visible).
- Completed: `--success-soft` background, text `opacity-60`, `line-through`.
- Title text: `--text-caption` (12px), `font-weight: 500`, `--text-primary`.
- Checkbox: `CompletionCheckbox`, 14px.
- Delete button: `--text-muted`, appears on hover top-right corner with `--radius-sm` (6px), `--bg-hover` background.
- Resize handle: Bottom edge, height 6px, cursor `row-resize`. On hover: show a subtle `--border-emphasis` line at bottom.
- Inline edit input: `--text-caption`, `--border-emphasis` border, `--radius-sm`.

### 6.11 EveningSlot (`src/components/calendar/EveningSlot.tsx`)

**Current**: `min-h-[48px]`, `bg-muted/10`, `border-t`.

**New design**:
- Container: `--bg-muted` (very subtle), `--radius-lg` (14px) corners (bottom of day area).
- Top separator: `--border-subtle`.
- Drop hover: `--primary-soft` with `--primary` dashed border.
- Empty state: "Evening" text in `--text-muted`, italic, `--text-caption`.
- Contains: `DraggableEveningBlock` styled same as `TimeBlock` but without time positioning.

### 6.12 CarryoverDialog (`src/components/calendar/CarryoverDialog.tsx`)

**Current**: Native `<dialog>`, `rounded-xl`, `border border-border`.

**New design**:
- Backdrop: `rgba(0, 0, 0, 0.4)` with `backdrop-filter: blur(4px)`.
- Dialog: `--bg-card`, `--radius-xl` (20px), `--shadow-xl`, `max-width: 480px`.
- Header: `--text-h2`, `--text-primary`, `--space-5` padding.
- Description: `--text-body`, `--text-secondary`.
- WeekSelector dropdown: `--radius-md`, `--border-subtle`, `--shadow-md` on dropdown panel.
- Overwrite warning: `--warning-soft` background, `--warning` left border (3px), `--radius-md`.
- Goal checkboxes: Styled with `accent-color: var(--primary)` or custom checkbox with `--primary`.
- Cancel button: Ghost — `--text-secondary`, `--radius-md`, hover: `--bg-hover`.
- Primary action button: `--primary` background, `--text-on-primary`, `--radius-md`, `--shadow-sm`.
- Button group: Right-aligned, `--space-3` gap.

### 6.13 DragPreview (`src/components/dnd/DragPreview.tsx`)

**Current**: Card with 3px left border, `bg-card border border-border shadow-lg`.

**New design**:
- Container: `--bg-card`, `--radius-md` (10px), `--shadow-lg`.
- Left border: 3px solid in role color.
- Background: Role color at 10% opacity fill (entire card).
- Text: `--text-body` for default, `--text-caption` for compact/evening.
- No outer `border` — shadow alone creates definition.

### 6.14 CompletionCheckbox (`src/components/ui/CompletionCheckbox.tsx`)

**Current**: SVG circle outline / filled circle with checkmark.

**New design**:
- Unchecked: `--border-emphasis` stroke (2px), `--bg-card` fill, `--radius-sm` (rounded square, not circle) — OR keep circle but with softer stroke.
- Checked: `--success` fill with white checkmark. Subtle scale animation (0.9 → 1.0, 200ms) on toggle.
- Size: 16px default (up from 14px for better touch target).
- Hover (unchecked): `--primary-soft` fill hint.

### 6.15 AddItemInput (`src/components/ui/AddItemInput.tsx`)

**Current**: Text button that expands to input.

**New design**:
- Button state: `--text-muted`, `--text-caption`. "+" icon in `--primary` color. Hover: `--bg-hover`, `--radius-md`.
- Input state: `--radius-md`, `--border-emphasis` border, `--bg-card` background, `--shadow-sm` (inset). Focus: `--ring-focus` (2px ring in primary/50%).
- Transition: Smooth expand/collapse (150ms).

### 6.16 ThemeToggle (`src/components/ThemeToggle.tsx`)

**Current**: 36x36px button with sun/moon icon.

**New design**:
- Container: 36x36px, `--radius-md` (10px), `--bg-muted` background. No border.
- Icon: 16px, `--text-secondary`. Smooth rotation transition (300ms) on toggle.
- Hover: `--bg-hover`, `--shadow-sm`.

### 6.17 Buttons (General)

| Variant | Background | Text | Border | Shadow | Hover |
|---------|-----------|------|--------|--------|-------|
| Primary | `--primary` | `--text-on-primary` | none | `--shadow-sm` | `--primary-hover`, `--shadow-md` |
| Secondary | `--bg-muted` | `--text-secondary` | `--border-subtle` | none | `--bg-hover` |
| Ghost | transparent | `--text-secondary` | none | none | `--bg-hover` |
| Destructive | `--destructive` | white | none | none | darken 10% |
| Icon | transparent | `--text-muted` | none | none | `--bg-hover`, `--radius-md` |

All buttons: `--radius-md` (10px), `font-weight: 500`, transition `150ms`.

---

## 7. Animations & Transitions

### Timing

| Token | Duration | Easing | Usage |
|-------|----------|--------|-------|
| `--duration-fast` | 100ms | `ease-out` | Hover color changes |
| `--duration-normal` | 200ms | `ease-in-out` | State transitions, opacity changes |
| `--duration-slow` | 300ms | `ease-in-out` | Theme toggle rotation, dialog open |
| `--duration-drag` | 200ms | `ease` | Drag snap-back animations |

### Motion Principles

- **Hover states**: Color/opacity change only. No scale transforms that cause layout shift.
- **Drag operations**: Keep existing dnd-kit animation behavior (200ms ease for moves).
- **Dialog open**: Fade in (opacity 0→1, 200ms) + subtle scale (0.96→1.0, 200ms).
- **Checkbox toggle**: Scale pulse (1.0→0.9→1.0, 200ms) on state change.
- **Respect `prefers-reduced-motion`**: Disable all transitions/animations when set.

---

## 8. Icons

**Keep lucide-react** as the icon library (already in the project). All custom inline SVGs for close/checkmark/notes should be replaced with or matched to Lucide equivalents for consistency.

| Element | Current | New (Lucide) |
|---------|---------|--------------|
| Close/Delete | Custom SVG X | `X` from lucide-react |
| Notes indicator | Custom SVG file icon | `FileText` from lucide-react |
| Nav arrows | Custom SVG chevrons | `ChevronLeft` / `ChevronRight` |
| Sun/Moon | Custom SVG | `Sun` / `Moon` from lucide-react |
| Add item | Text "+" | `Plus` from lucide-react |
| Dropdown chevron | Custom SVG | `ChevronDown` from lucide-react |

Icon sizing: 16px default, 14px compact, 20px for navigation.
Icon color: Inherit from parent text color (`currentColor`).
Stroke width: 2px (Lucide default).

---

## 9. Dark Mode Considerations

The dark mode should feel equally polished. Key differences:

- **Page background**: Deep blue-black (`#0F1419`) — NOT pure black.
- **Card surfaces**: Dark blue-grey (`#1A2332`) — slightly lighter than page.
- **Sidebar**: Even slightly darker (`#141D2B`) for hierarchy.
- **Shadows**: More pronounced (higher opacity) since they fight against dark backgrounds.
- **Primary accent**: Brighten teal by one step (`#2DD4BF` instead of `#14B8A6`) for visibility.
- **Role colors**: All role colors brighten by one step in dark mode.
- **Borders**: Very subtle (`--border-subtle` at `#1E293B`). Borders are less necessary when shadow + color difference creates card separation.
- **Text contrast**: Ensure minimum 7:1 for primary text, 4.5:1 for secondary text.

---

## 10. Implementation Approach

### Step 1: Update CSS Variables

Update `src/app/globals.css` with all new color tokens, replacing the existing HSL-based system. Add shadow, radius, and spacing tokens.

### Step 2: Update Font

Replace Geist Sans import in `src/app/layout.tsx` with Plus Jakarta Sans via `next/font/google`. Update `--font-sans` CSS variable.

### Step 3: Update MainLayout

Restructure to floating card layout with page-level tinted background and gap between sidebar and main content.

### Step 4: Reskin Components (order of visual impact)

1. **MainLayout** → Floating cards on tinted bg (biggest visual change)
2. **Sidebar** → Rounded, shadowed, new typography
3. **WeekNavigation** → New button styles, badge design
4. **DayColumn + headers** → Remove hard borders, today highlighting
5. **TimeBlock** → Rounded, shadowed, refined colors
6. **PriorityItem** → Rounded, softer backgrounds
7. **TimeGrid** → Cleaner hour/half-hour lines
8. **CarryoverDialog** → Backdrop blur, rounded, refined
9. **DragPreview** → Match new block style
10. **Small components** → Checkboxes, inputs, buttons, icons

### Step 5: Replace Inline SVGs with Lucide

Swap all custom SVG icons for Lucide equivalents. Remove CloseIcon component, use Lucide `X` directly.

### Step 6: Final Polish

- Scrollbar styling (thin, teal-tinted track).
- Selection color (`::selection` with `--primary-soft`).
- Focus-visible styling consistency audit.
- prefers-reduced-motion audit.
- Dark mode audit — verify all tokens have dark counterparts.

---

## 11. What NOT to Change

- **Drag-drop behavior** — all interactions remain identical.
- **Layout structure** — sidebar + 7-day calendar grid stays.
- **Data model** — no schema changes.
- **Component architecture** — no new components, no restructuring.
- **Time slot height** (32px) — functional, works well.
- **Sidebar width** (25%) — good proportion.
- **Role color assignment logic** — stays the same, just refined colors.
- **Week navigation flow** — arrows, today button, "+ New" button stay.
- **CarryoverDialog flow** — same UX, just reskinned.

---

## 12. Pre-Delivery Checklist

Before considering the reskin complete:

- [ ] No emojis used as icons (all Lucide SVGs)
- [ ] All clickable elements have `cursor-pointer`
- [ ] All hover states use smooth transitions (150-200ms)
- [ ] Light mode text contrast meets WCAG AA (4.5:1 minimum)
- [ ] Dark mode text contrast meets WCAG AA (4.5:1 minimum)
- [ ] Focus-visible states on all interactive elements
- [ ] `prefers-reduced-motion` respected (disable transitions)
- [ ] Consistent border-radius across all components
- [ ] Consistent shadow usage across all components
- [ ] Plus Jakarta Sans renders at all weights used
- [ ] Tinted page background visible in both light and dark modes
- [ ] Cards float visually above page background
- [ ] Role colors harmonize with new teal primary
- [ ] No layout shift from hover effects (no scale transforms on cards)
- [ ] Dialog backdrop blur works (with fallback)
- [ ] Scrollbars styled consistently
