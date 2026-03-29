# Phase 10: shadcn Redesign — Complete Specification

> **Purpose**: This document contains every decision needed to rewrite the First Things First UI using shadcn components. It is self-contained — an agent with access to the codebase and this file has everything required to execute the work.

## 1. Goals

- Replace hand-built UI with shadcn components for polish, accessibility, and consistency
- Increase information density — reduce wasted space so the weekly planner is functional on a single screen
- Unify the visual treatment of all "block" items across sidebar, priorities, time grid, and evening sections
- Eliminate all JavaScript hover handlers in favor of Tailwind/CSS hover states
- Migrate static inline styles to Tailwind utility classes using shadcn semantic tokens
- Maintain all existing functionality: drag-drop (dnd-kit), resize, click-drag-draw, inline editing, completion tracking, week navigation, carryover

## 2. Tech Stack (Unchanged)

- Next.js 16.1.3, React 19, TypeScript
- Tailwind CSS v4 (CSS-first, `@theme inline`)
- Zustand 5 (state), Dexie 4 (IndexedDB persistence)
- @dnd-kit (drag-drop), pointer events (resize, draw)
- next-themes (dark mode)
- lucide-react (icons)
- shadcn/ui with radix-nova style (configured in `components.json`)

## 3. Layout & Density Decisions

### 3.1 Page Layout

| Property | Old | New |
|---|---|---|
| Page padding | 24px all sides | **0px** (full-bleed) |
| Gap between panels | 24px | **0px** (1px border separator) |
| Panel border-radius | 20px (radius-xl) | **0px** (flat rectangles) |
| Panel separation | Floating cards on teal bg | **1px `border-right` on sidebar** |
| Sidebar width | 280px | **280px** (unchanged) |
| Dark mode panels | Subtle color difference (sidebar #141D2B, calendar #1A2332) | **Keep** subtle color difference |

The teal `--background` color is still visible as the page background but with full-bleed panels it is only seen if the viewport is larger than the content. The 1px border between panels uses `--border`.

Inner elements (goal cards, time blocks, buttons, dialogs) **keep their existing border-radius** values (radius-sm through radius-xl).

### 3.2 Calendar Density

| Property | Old | New |
|---|---|---|
| Time slot height | 32px | **28px** |
| Time labels column width | ~48px | **40px** |
| Day column min-width | 140px | **140px** (unchanged) |
| Day header | Two lines (day name + "Mar 16") ~60px | **Single line** ("Mon 16") ~35px |
| Today highlight | 28px teal circle around date number | **Bold/primary-colored number** on same line |
| Progress indicator | 3px bar under header (80% max-width) | **24px pie chart** left of day label |
| Priorities section height | 80px min, grows with content | **136px fixed** (fits exactly 2 items) |
| Max priorities per day | Unlimited | **2** (silently reject drops when full) |
| Evening section height | 48px min, grows | **56px fixed** (fits exactly 1 item) |

### 3.3 Sidebar Density

| Property | Old | New |
|---|---|---|
| Title | "First Things First" at 24px/700, 24px 20px padding | **18px/700**, **12px 12px** padding |
| "Roles" section label | 12px muted text, ~25px height | **Removed entirely** |
| Role section margin-bottom | 12px | **8px** |
| Role section padding | 12px | **12px** (unchanged) |
| Goal item padding | 10px 12px | **6px 10px** |
| Goal item height | ~36px (varies) | **56px fixed** |

### 3.4 Navigation Bar

| Element | Old | New |
|---|---|---|
| Prev/Next arrows | Custom `<button>` with JS hover | shadcn `Button variant="ghost" size="icon"` |
| Week label | 15px/600 `<h2>` | Unchanged |
| "This week" indicator | Styled `<span>` pill | shadcn `Badge variant="secondary"` |
| "Today" button | Custom `<button>` with border | shadcn `Button variant="outline"` |
| "+New" button | Custom `<button>` with bg-primary | shadcn `Button variant="default"` |
| "Plan this week?" | Full-width yellow banner ~50px | **Inline**: replaces "Today" button position with `Button variant="link"` reading "Plan this week?" when current week unplanned |

## 4. Unified BlockCard Component

### 4.1 Concept

All items in the system — sidebar goals, priority items, time blocks, evening blocks — are conceptually the same thing: a "block" representing a goal or activity. They share the same visual treatment everywhere.

**Create `src/components/ui/BlockCard.tsx`** — a single pure visual component used in all contexts.

### 4.2 Props

```typescript
interface BlockCardProps {
  text: string;
  roleColor?: RoleColor;
  completed?: boolean;
  editable?: boolean;        // enables double-click to edit
  compact?: boolean;         // true = 12px font (calendar), false = 14px font (sidebar)
  height?: number;           // explicit height in px (for time blocks: duration * 28)
  className?: string;        // for layout (positioning, etc.)
  style?: React.CSSProperties; // for dynamic values (absolute positioning)
  onToggle?: () => void;     // checkbox callback; if undefined, no checkbox
  onDelete?: () => void;     // delete callback; if undefined, no delete button
  onEdit?: (newText: string) => void; // edit callback; if undefined, not editable
}
```

### 4.3 Visual Specification

- **Height**: `height` prop when provided, otherwise `56px` (default)
- **Background**: `rgba(var(--role-N-rgb), 0.08)` when role color present, `bg-muted` otherwise. When completed: `--completed-bg`
- **Left border**: `3px solid var(--role-N)` when role color present
- **Border radius**: `rounded-md` (10px)
- **Shadow**: `shadow-sm`, `shadow-md` on hover
- **Completed state**: `opacity: 0.55` on entire card, checkbox shows checked
- **Padding**: `4px 8px` (compact) or `6px 10px` (default)

**Internal layout** (left to right):
1. **Checkbox** (shadcn `Checkbox`, teal primary fill when checked) — only if `onToggle` provided
2. **Text** — 2-line wrapping (`-webkit-line-clamp: 2`), or 1-line clamp if height < 56px (single-slot time blocks). When `editable` and double-clicked, switches to shadcn `Input`.
3. **Delete button** (shadcn `Button variant="ghost" size="icon-xs"`, Lucide `X`) — only if `onDelete` provided, `opacity-0 group-hover:opacity-100`, `text-muted-foreground hover:text-destructive`

**Checkbox dnd-kit coexistence**: The checkbox wrapper must call `e.stopPropagation()` on `onPointerDown` to prevent dnd-kit's PointerSensor from activating.

### 4.4 Context-Specific Usage

| Context | height | compact | editable | checkbox | delete | Additional wrapper behavior |
|---|---|---|---|---|---|---|
| Sidebar goal | 56px | false (14px) | true (updates goal) | yes | yes (AlertDialog confirm) | Draggable via dnd-kit |
| Priority item | 56px | true (12px) | false (read-only, goal-linked) | yes | yes (direct delete) | Draggable, inside fixed-height container |
| Time block (goal) | duration * 28px | true (12px) | false (read-only, goal-linked) | yes | yes | Draggable, absolute positioned, resizable (bottom edge) |
| Time block (freestyle) | duration * 28px | true (12px) | true (updates block title) | yes | yes | Draggable, absolute positioned, resizable, inline editing on creation |
| Evening block | 56px | true (12px) | false (read-only) | yes | yes | Draggable, inside fixed-height container |
| Drag preview | 56px | true (12px) | false | no | no | No interaction — pure visual |

### 4.5 Line Clamping Logic

BlockCard calculates line clamp from its rendered height:
- Height < 56px (single 28px slot): `line-clamp: 1`
- Height >= 56px: `line-clamp: 2`

This replaces the current `displayDuration >= 2 ? 2 : 1` logic in TimeBlock. The BlockCard doesn't know about slots or durations — it derives clamping from pixel height.

### 4.6 Components Replaced

BlockCard replaces these existing components:
- `src/components/sidebar/GoalItem.tsx` — wrapper becomes thin: reads goal from store, passes props to BlockCard, wraps in draggable
- `src/components/calendar/PriorityItem.tsx` — same pattern
- `src/components/calendar/TimeBlock.tsx` — wrapper adds absolute positioning, resize hook, inline editing for freestyle
- `src/components/calendar/EveningSlot.tsx` (inner `DraggableEveningBlock`) — same pattern
- `src/components/dnd/DragPreview.tsx` — collapses to a single BlockCard with no interactions

`DragOverlayContent.tsx` simplifies: all four overlay types render the same `<BlockCard text={...} roleColor={...} compact height={56} />`.

## 5. Pie Chart Progress Indicator

### 5.1 Specification

Replace the 3px progress bar under each day header with a 24px SVG pie chart to the left of the day label.

**Implementation**: SVG circle with `stroke-dasharray` and `stroke-dashoffset` for the fill arc.

- **Size**: 24px diameter
- **Stroke**: 3px width
- **Fill color**: `--primary` (teal)
- **Track color**: `--border` (subtle ring when empty)
- **Empty state** (0 items): Show outline circle in `--border` color. All 7 days always show the circle for consistent alignment.
- **Partial fill**: Arc fills clockwise from top
- **Complete** (100%): Full teal circle
- **Animation**: `transition: stroke-dashoffset 300ms ease` (matches `--duration-slow`)

**Data source**: Same computation as current progress bar — count completed vs total across dayPriorities + timeBlocks + eveningBlocks for that day.

### 5.2 Day Header Layout

Single line: `[24px pie] [6px gap] [day label]`

Day label format: `"Mon 16"` — three-letter day abbreviation + date number. No month (month is in the week navigation header).

Today's date number uses `text-primary font-bold`. Other days use `text-secondary`.

Total header height: ~35px (8px padding top + 24px content + 3px padding bottom).

## 6. Drop Zone Behavior

### 6.1 Empty State

When not actively dragging, empty priorities and evening sections show **nothing** — no placeholder text, no dashed borders. Clean empty space.

### 6.2 During Active Drag

When a goal or block is being dragged (dnd-kit `isDragging` from DndContext), empty drop zones show:
- `border: 1px dashed var(--primary)` outline
- `background: var(--primary-soft)` subtle tint

This requires lifting drag-active state from DndContext to the drop zone components. The `DndProvider` already tracks `activeDragData` — pass an `isDragging` boolean via context or prop.

### 6.3 Priority Section Limit

The priorities drop zone silently rejects drops when it already contains 2 items. Guard in `DndProvider.tsx` drop handler:
```typescript
if (zone === "priorities") {
  const existing = dayPriorities.filter(p => p.dayIndex === targetDay);
  if (existing.length >= 2) return; // silent rejection
}
```

## 7. Section Labels & Backgrounds

### 7.1 Time Labels Column

The shared left-side time labels column (currently `TimeLabelsColumn.tsx`) adds two new labels:

| Label | Position | Style |
|---|---|---|
| `TOP` | Aligned with priorities section | 11px, muted, uppercase |
| `8:00` - `19:30` | Aligned with time grid slots | 11px, muted (existing) |
| `EVE` | Aligned with evening section | 11px, muted, uppercase |

### 7.2 Section Backgrounds

| Section | Background |
|---|---|
| Priorities container | `bg-muted` |
| Time grid | `bg-card` (transparent — inherits panel background) |
| Evening container | `bg-muted` |

The background differentiation creates implicit visual boundaries between the three sections without needing explicit dividers.

## 8. shadcn Components to Install

Run: `npx shadcn@latest add checkbox dialog alert-dialog badge separator popover scroll-area input tooltip progress`

### 8.1 Component Usage Map

| shadcn Component | Where Used |
|---|---|
| `Checkbox` | BlockCard completion toggle (all instances) |
| `Dialog` + `DialogContent` + `DialogHeader` + `DialogTitle` + `DialogDescription` + `DialogFooter` | CarryoverDialog |
| `AlertDialog` + `AlertDialogAction` + `AlertDialogCancel` + `AlertDialogContent` + `AlertDialogDescription` + `AlertDialogTitle` + `AlertDialogTrigger` | Delete role confirmation, delete goal confirmation |
| `Badge` | "This week" indicator, "Planned" badge in WeekSelector |
| `Separator` | Sidebar header divider |
| `Popover` + `PopoverTrigger` + `PopoverContent` | WeekSelector dropdown |
| `ScrollArea` | Sidebar role list scrolling |
| `Input` | AddItemInput replacement, BlockCard inline editing |
| `Tooltip` + `TooltipTrigger` + `TooltipContent` | Icon-only buttons (nav arrows, theme toggle, delete), sidebar goal text hover |
| `Progress` | CarryoverDialog completion summary bar |
| `Button` | All buttons (see Section 4 of Navigation Bar and throughout) |

### 8.2 Post-Install Verification

After adding components, verify:
1. All components landed in `src/components/ui/`
2. Imports resolve correctly with `@/components/ui/` alias
3. No icon library mismatches (project uses `lucide-react`)

### 8.3 Checkbox dnd-kit Integration

shadcn's `Checkbox` (Radix Checkbox) fires on pointer events. Wrap with `onPointerDown={e => e.stopPropagation()}` in BlockCard to prevent dnd-kit activation:

```tsx
<div onPointerDown={(e) => e.stopPropagation()}>
  <Checkbox checked={completed} onCheckedChange={onToggle} />
</div>
```

## 9. CSS Token Unification

### 9.1 Strategy

Make shadcn tokens the **single source of truth**. Remove all custom `--bg-*`, `--text-*` tokens. Convert all values from oklch to **hex**. Remove "Legacy aliases" comment — these ARE the system now.

### 9.2 Light Mode Token Mapping

```css
:root {
  /* Backgrounds */
  --background: #F0FDFA;           /* page bg (was --bg-page) */
  --card: #FFFFFF;                  /* panel surfaces (was --bg-card) */
  --card-foreground: #0F172A;      /* text on cards */
  --muted: #F5F7FA;                /* subtle section bg (was --bg-muted) */
  --muted-foreground: #94A3B8;     /* captions, placeholders (was --text-muted) */

  /* Text */
  --foreground: #0F172A;           /* default text (was --text-primary) */
  --secondary-foreground: #475569; /* secondary text (was --text-secondary) */

  /* Primary (Teal) */
  --primary: #14B8A6;
  --primary-foreground: #FFFFFF;

  /* Custom primary variants (no shadcn equivalent) */
  --primary-hover: #0D9488;
  --primary-soft: #CCFBF1;
  --primary-muted: #99F6E4;

  /* Semantic */
  --secondary: #F5F7FA;
  --destructive: #EF4444;
  --destructive-foreground: #FFFFFF;
  --success: #10B981;
  --success-foreground: #FFFFFF;
  --warning: #F59E0B;
  --warning-soft: #FEF3C7;

  /* Borders */
  --border: #E2E8F0;              /* default border (was --border-subtle) */
  --border-emphasis: #CBD5E1;     /* stronger borders */
  --input: #E2E8F0;              /* input borders */
  --ring: rgba(20, 184, 166, 0.5); /* focus rings (was --ring-focus) */

  /* Accent (hover backgrounds) */
  --accent: #F0FDFA;              /* hover bg (was --bg-hover) */
  --accent-foreground: #0F172A;

  /* Completion */
  --completed-opacity: 0.55;
  --completed-bg: rgba(0, 0, 0, 0.02);

  /* Sidebar (subtle difference for panel separation) */
  --sidebar: #FFFFFF;
  --sidebar-foreground: #0F172A;

  /* Today */
  --today: rgba(20, 184, 166, 0.04);

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.04);
  --shadow-card: 0 2px 8px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04);
  --shadow-md: 0 2px 8px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04);
  --shadow-drag: 0 4px 16px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04);
  --shadow-dialog: 0 8px 32px rgba(0, 0, 0, 0.10), 0 4px 8px rgba(0, 0, 0, 0.04);

  /* Radii */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --radius-xl: 20px;
  --radius-full: 9999px;

  /* Role colors — vibrant */
  --role-1: #14B8A6;
  --role-2: #8B5CF6;
  --role-3: #F59E0B;
  --role-4: #0EA5E9;
  --role-5: #F43F5E;
  --role-6: #10B981;
  --role-7: #F97316;
  --role-8: #64748B;

  /* Role colors — RGB components for rgba() usage */
  --role-1-rgb: 20, 184, 166;
  --role-2-rgb: 139, 92, 246;
  --role-3-rgb: 245, 158, 11;
  --role-4-rgb: 14, 165, 233;
  --role-5-rgb: 244, 63, 94;
  --role-6-rgb: 16, 185, 129;
  --role-7-rgb: 249, 115, 22;
  --role-8-rgb: 100, 116, 139;
}
```

### 9.3 Dark Mode Token Mapping

```css
.dark {
  --background: #0F1419;
  --card: #1A2332;
  --card-foreground: #F1F5F9;
  --muted: #1E2A3A;
  --muted-foreground: #64748B;
  --foreground: #F1F5F9;
  --secondary-foreground: #94A3B8;
  --primary: #2DD4BF;
  --primary-foreground: #0F172A;
  --primary-hover: #14B8A6;
  --primary-soft: hsl(173 80% 15%);
  --primary-muted: hsl(173 60% 20%);
  --secondary: #1E2A3A;
  --destructive: #F87171;
  --destructive-foreground: #FFFFFF;
  --success: #34D399;
  --warning: #FBBF24;
  --warning-soft: hsl(45 60% 12%);
  --border: #1E293B;
  --border-emphasis: #334155;
  --input: #1E293B;
  --ring: rgba(45, 212, 191, 0.5);
  --accent: hsl(173 30% 12%);
  --accent-foreground: #F1F5F9;
  --completed-bg: rgba(255, 255, 255, 0.02);
  --sidebar: #141D2B;
  --sidebar-foreground: #F1F5F9;
  --today: rgba(45, 212, 191, 0.05);
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.2);
  --shadow-card: 0 2px 8px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 2px 8px rgba(0, 0, 0, 0.3);
  --shadow-drag: 0 4px 16px rgba(0, 0, 0, 0.4);
  --shadow-dialog: 0 8px 32px rgba(0, 0, 0, 0.5);

  /* Role colors — brighter for dark */
  --role-1: #2DD4BF;
  --role-2: #A78BFA;
  --role-3: #FBBF24;
  --role-4: #38BDF8;
  --role-5: #FB7185;
  --role-6: #34D399;
  --role-7: #FB923C;
  --role-8: #94A3B8;
  --role-1-rgb: 45, 212, 191;
  --role-2-rgb: 167, 139, 250;
  --role-3-rgb: 251, 191, 36;
  --role-4-rgb: 56, 189, 248;
  --role-5-rgb: 251, 113, 133;
  --role-6-rgb: 52, 211, 153;
  --role-7-rgb: 251, 146, 60;
  --role-8-rgb: 148, 163, 184;
}
```

### 9.4 @theme inline Block

Update the `@theme inline` block to map only the shadcn token names. Remove all `--color-bg-*`, `--color-text-*` custom mappings. The block should map:

```css
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);

  /* Custom tokens exposed to Tailwind */
  --color-primary-hover: var(--primary-hover);
  --color-primary-soft: var(--primary-soft);
  --color-primary-muted: var(--primary-muted);
  --color-success: var(--success);
  --color-warning: var(--warning);
  --color-border-emphasis: var(--border-emphasis);
  --color-today: var(--today);

  /* Role colors */
  --color-role-1: var(--role-1);
  --color-role-2: var(--role-2);
  --color-role-3: var(--role-3);
  --color-role-4: var(--role-4);
  --color-role-5: var(--role-5);
  --color-role-6: var(--role-6);
  --color-role-7: var(--role-7);
  --color-role-8: var(--role-8);

  /* Radii */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --radius-xl: 20px;

  /* Typography */
  --font-sans: var(--font-plus-jakarta), ui-sans-serif, system-ui, sans-serif;

  /* Shadows - keep existing */
  --shadow-sm: var(--shadow-sm);
  --shadow-md: var(--shadow-md);
  --shadow-lg: 0 4px 16px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04);
  --shadow-xl: 0 8px 32px rgba(0, 0, 0, 0.10), 0 4px 8px rgba(0, 0, 0, 0.04);
}
```

### 9.5 Inline Styles — What Stays

Only these cases use inline `style={{}}`:

1. **Role color backgrounds**: `rgba(var(--role-N-rgb), 0.08)` — dynamic per role
2. **Role color borders**: `var(--role-N)` — dynamic per role
3. **Time block positioning**: `top: ${startSlot * 28}px`, `height: ${duration * 28}px`
4. **Completed opacity**: `opacity: var(--completed-opacity)` — applied conditionally

Everything else (padding, font sizes, radii, shadows, static colors, hover states) uses Tailwind classes with shadcn semantic tokens (e.g., `bg-card`, `text-muted-foreground`, `hover:bg-accent`, `rounded-md`, `shadow-sm`).

### 9.6 Hover State Migration

All JS `onMouseEnter`/`onMouseLeave` handlers are removed. Replace with Tailwind hover classes:

| Old | New |
|---|---|
| `onMouseEnter: bg = 'var(--bg-hover)'` | `hover:bg-accent` |
| `onMouseEnter: color = 'var(--destructive)'` | `hover:text-destructive` |
| `onMouseEnter: shadow = 'var(--shadow-md)'` | `hover:shadow-md` |
| `onMouseEnter: bg = roleColorOpacity(0.12)` | Keep inline (dynamic role color) |

The **only** hover state that stays as inline JS is role-color-dependent hover backgrounds (e.g., BlockCard hover changing from 8% to 12% opacity). All other hover states use Tailwind.

## 10. Sidebar Specification

### 10.1 Header

```
[Title: "First Things First" 18px/700]  [ThemeToggle: Button ghost icon 28px]
[Separator]
```

- Padding: `12px`
- ThemeToggle: shadcn `Button variant="ghost" size="icon"` with `Tooltip` ("Toggle theme")
- Below header: shadcn `Separator`

### 10.2 Role List

Wrapped in shadcn `ScrollArea` for styled scrollbar.

Each `RoleSection`:
- **Padding**: 12px
- **Margin-bottom**: 8px
- **Background**: `rgba(var(--role-N-rgb), 0.08)` role-color tint
- **Border-radius**: `rounded-md`
- **Header row**: `[8px role dot] [role name 15px/600] [delete button hover-reveal]`
- **Role name**: double-click to edit (useEditableText, switches to shadcn `Input`)
- **Delete button**: shadcn `Button variant="ghost" size="icon-xs"`, triggers shadcn `AlertDialog` for confirmation
- **Goal list**: `flex flex-col gap-2` containing BlockCard instances
- **Add goal button**: shadcn `Button variant="link" size="sm"` — "+ Add goal"

### 10.3 Add Role Button

At bottom of role list: shadcn `Button variant="link" size="sm"` — "+ Add role"

Both add buttons toggle into shadcn `Input` on click (existing AddItemInput pattern, restyled).

## 11. Calendar Specification

### 11.1 Week Navigation

Single row, no wrapping:
```
[< ghost icon] [> ghost icon] [gap-3] [Week label h2] [Badge "This week" if current] [flex spacer] [Today outline btn OR "Plan this week?" link btn] [+New default btn]
```

- All buttons: shadcn `Button` with appropriate variants
- Nav arrows: `Tooltip` wrapping each ("Previous week", "Next week")
- "Plan this week?" replaces "Today" button position when current calendar week is unplanned
- "This week" badge: shadcn `Badge variant="secondary"`
- Padding: `14px 20px`, `border-bottom: 1px solid var(--border)`

### 11.2 Day Columns

Each column structure (top to bottom):
1. **Header** (35px): `[24px pie chart] [6px gap] ["Mon 16"]` — sticky top
2. **Priorities section** (136px fixed): `bg-muted`, holds max 2 BlockCard instances
3. **Time grid** (28px * 24 = 672px): slots with absolute-positioned time blocks
4. **Evening section** (56px fixed): `bg-muted`, holds max 1 BlockCard instance

**Today column**: full-height `bg-today` background tint.

**Column borders**: `border-right: 1px solid` with reduced opacity — `rgba(--border-rgb, 0.5)` or similar subtle separator between days.

### 11.3 Time Labels Column (40px)

```
[TOP]           ← aligned with priorities section
[8:00]          ← aligned with time grid slots
[8:30]
[9:00]
...
[19:30]
[EVE]           ← aligned with evening section
```

- All labels: 11px, `text-muted-foreground`
- TOP and EVE: uppercase, same font weight as time labels
- Width: 40px

### 11.4 Time Blocks

Wrapper component reads from store, computes position, attaches dnd-kit draggable + resize hook. Renders BlockCard inside:

- `position: absolute`
- `top: ${startSlot * 28}px` (inline style — computed)
- `height: ${duration * 28}px` (inline style — computed)
- `left: 0; right: 0; z-index: 10`
- Resize handle at bottom edge: `opacity-0 group-hover:opacity-100`, `cursor-ns-resize`, `h-2`, `border-bottom: 2px solid var(--border-emphasis)`

### 11.5 Priorities Container

- **Fixed height**: 136px
- **Background**: `bg-muted`
- **Border-radius**: `rounded-lg` (on relevant corners)
- **Padding**: 8px
- **Layout**: `flex flex-col gap-2` — items stack vertically
- **When empty + not dragging**: nothing visible
- **When empty + dragging**: dashed border `border border-dashed border-primary bg-primary-soft`
- **Max items**: 2 — drop handler silently rejects when full

### 11.6 Evening Container

- **Fixed height**: 56px
- **Background**: `bg-muted`
- **Padding**: 8px
- **Max items**: 1 (unchanged from current behavior)
- **When empty + not dragging**: nothing visible
- **When empty + dragging**: dashed border (same as priorities)

## 12. Dialog Replacements

### 12.1 CarryoverDialog → shadcn Dialog

Replace native `<dialog>` + `showModal()` pattern with shadcn `Dialog`.

Structure:
```tsx
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Carry over goals</DialogTitle>
      <DialogDescription>
        Select uncompleted goals to carry to next week
      </DialogDescription>
    </DialogHeader>

    {/* Completion summary */}
    <div>
      <Progress value={completionPercent} />
      <p>{completed} of {total} goals completed</p>
    </div>

    {/* Goal checkboxes grouped by role */}
    {roles.map(role => (
      <div key={role.id}>
        <h3>{role.name}</h3>
        {uncompletedGoals.map(goal => (
          <label>
            <Checkbox checked={selected} onCheckedChange={toggle} />
            {goal.text}
          </label>
        ))}
      </div>
    ))}

    {/* Week selector */}
    <Popover>...</Popover>

    <DialogFooter>
      <Button variant="outline" onClick={cancel}>Cancel</Button>
      <Button variant="outline" onClick={startFresh}>Start fresh</Button>
      <Button onClick={carryOver}>Carry over selected</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

The week selector inside the dialog uses the same shadcn `Popover` + custom list as the main WeekSelector.

### 12.2 Delete Confirmations → shadcn AlertDialog

Replace `window.confirm()` calls in GoalItem and RoleSection:

```tsx
<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="ghost" size="icon-xs">
      <X />
    </Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogTitle>Delete goal</AlertDialogTitle>
    <AlertDialogDescription>
      Delete "{goalText}"? This cannot be undone.
    </AlertDialogDescription>
    <AlertDialogCancel>Cancel</AlertDialogCancel>
    <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
  </AlertDialogContent>
</AlertDialog>
```

### 12.3 WeekSelector → shadcn Popover

Replace custom dropdown (`isOpen` state + mousedown listener + keydown Escape):

```tsx
<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline">Select week</Button>
  </PopoverTrigger>
  <PopoverContent>
    {/* Custom week list with Badge "Planned" indicators */}
    <ul>
      {weekIds.map(id => (
        <li onClick={() => select(id)}>
          {formatWeekId(id)}
          {isPlanned(id) && <Badge variant="secondary">Planned</Badge>}
        </li>
      ))}
    </ul>
  </PopoverContent>
</Popover>
```

## 13. Tooltip Usage

Tooltips are used **sparingly** — only on these elements:

1. **Icon-only buttons**: Navigation arrows ("Previous week", "Next week"), theme toggle ("Toggle theme"), delete buttons ("Delete goal", "Delete role")
2. **Sidebar goal text**: When goal text is long enough to potentially truncate in the 56px fixed-height card, tooltip shows full text on hover

**Not used on**: Calendar items (priority items, time blocks, evening blocks). These have 2-line wrapping and can be double-clicked to see full text (freestyle) or found in the sidebar (goal-linked).

Wrap with shadcn `Tooltip`:
```tsx
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button variant="ghost" size="icon">
        <ChevronLeft />
      </Button>
    </TooltipTrigger>
    <TooltipContent>Previous week</TooltipContent>
  </Tooltip>
</TooltipProvider>
```

Note: `TooltipProvider` should wrap the app once (in layout or a provider), not per-tooltip.

## 14. Execution Order

The work must follow this dependency chain. Each step is independently testable and committable.

### Step 1: Token Unification

**Files**: `src/app/globals.css`
**Action**: Replace the dual token system with the unified shadcn-as-source mapping (Section 9). Convert all oklch to hex. Remove custom `--bg-*`, `--text-*` tokens. Update `@theme inline` block.
**Test**: App renders identically in both light and dark mode. No visual change.

### Step 2: Install shadcn Components

**Action**: Run `npx shadcn@latest add checkbox dialog alert-dialog badge separator popover scroll-area input tooltip progress`
**Files**: New files in `src/components/ui/`
**Test**: Components exist and import without error.

### Step 3: Shared Constants Update

**Files**: All components using slot height, time label width
**Action**:
- Slot height: 32 → 28 (affects TimeBlock, TimeGrid, TimeSlot, useBlockResize, useBlockDraw)
- Time labels column: 48 → 40
- Priority max count: add constant `MAX_PRIORITIES_PER_DAY = 2`
- Priority section fixed height: `136px`
- Evening section fixed height: `56px`
- Block default height: `56px` (= 2 slots * 28px, used for sidebar goals, priorities, evening, drag preview)
**Test**: Calendar renders with denser grid. Drag-drop, resize, draw still work.

### Step 4: Layout Refactor

**Files**: `MainLayout.tsx`, `Sidebar.tsx`
**Action**:
- MainLayout: Remove padding, remove gap, remove border-radius. Add 1px border-right on sidebar.
- Sidebar header: 18px title, 12px padding, remove "Roles" label, add Separator.
- Sidebar body: Wrap role list in ScrollArea.
**Test**: Full-bleed layout renders. Sidebar scrolls with many roles.

### Step 5: BlockCard Component

**Files**: New `src/components/ui/BlockCard.tsx`
**Action**: Build the unified visual component per Section 4 specification. Include shadcn Checkbox with dnd-kit stopPropagation wrapper, hover-revealed delete button (shadcn ghost Button), inline editing with shadcn Input, 2-line text wrapping.
**Test**: Render BlockCard in isolation with various prop combinations.

### Step 6: Leaf Component Migration

**Files**: `ThemeToggle.tsx`, `WeekNavigation.tsx`, `AddGoalButton.tsx`, `AddRoleButton.tsx`, `AddItemInput.tsx`
**Action**:
- All buttons → shadcn Button with appropriate variants
- Theme toggle → shadcn ghost icon Button with Tooltip
- Nav arrows → shadcn ghost icon Buttons with Tooltips
- "This week" → shadcn Badge
- "Today" / "Plan this week?" → shadcn outline / link Buttons
- "+New" → shadcn default Button
- Add buttons → shadcn link Buttons, toggle to shadcn Input
- Remove all JS hover handlers
**Test**: All buttons render with proper hover/focus/active/disabled states.

### Step 7: Sidebar Component Migration

**Files**: `GoalItem.tsx`, `GoalList.tsx`, `RoleSection.tsx`, `RoleList.tsx`
**Action**:
- GoalItem → thin wrapper rendering BlockCard (56px, 14px font, checkbox left, editable)
- RoleSection → delete uses AlertDialog, role name edits use shadcn Input
- GoalList → gap-2 layout
- RoleList → reduced spacing (8px margin between sections)
- Add Tooltips on sidebar goal text and delete buttons
**Test**: Goals display, edit, complete, delete, drag. AlertDialog appears on delete.

### Step 8: Calendar Component Migration

**Files**: `DayColumn.tsx`, `DayPriorities.tsx`, `PriorityItem.tsx`, `TimeBlock.tsx`, `TimeGrid.tsx`, `TimeSlot.tsx`, `EveningSlot.tsx`, `TimeLabelsColumn.tsx`
**Action**:
- DayColumn: Single-line header with 24px pie chart, fixed-height sections
- DayPriorities: 136px fixed, empty-when-idle, dashed-on-drag, 2-item limit, renders BlockCard
- PriorityItem → thin wrapper rendering BlockCard (56px, 12px font, not editable)
- TimeBlock → wrapper with positioning + resize hook, renders BlockCard
- TimeGrid: Update slot height to 28px, update draw preview calculations
- TimeSlot: Update height to 28px
- EveningSlot: 56px fixed, empty-when-idle, dashed-on-drag, renders BlockCard
- TimeLabelsColumn: 40px width, add TOP and EVE labels, add section backgrounds
**Test**: Full calendar renders. Drag-drop across all sections. Resize. Click-drag-draw. Completion. Progress pie charts animate.

### Step 9: Complex Component Migration

**Files**: `CarryoverDialog.tsx`, `WeekSelector.tsx`, `DndProvider.tsx`
**Action**:
- CarryoverDialog → shadcn Dialog with Progress bar (Section 12.1)
- WeekSelector → shadcn Popover with Badge (Section 12.3)
- DndProvider: Add priority count guard (Section 6.3), update DragOverlay to use BlockCard
- DragPreview.tsx → simplify to single BlockCard variant
- DragOverlayContent.tsx → all four types render same BlockCard
**Test**: Carryover dialog opens/closes, selects goals, carries over. Week selector works. Drag previews render. Priority limit enforced.

### Step 10: Inline Style Cleanup

**Files**: All component files
**Action**: Final pass replacing any remaining static inline styles with Tailwind classes. Verify only the four allowed inline style cases remain (role colors, positioning, completed opacity, role-color hover).
**Test**: Full regression test of all interactions in light and dark mode.

## 15. Risks & Mitigations

| Risk | Severity | Mitigation |
|---|---|---|
| **dnd-kit breakage from DOM changes** | High | Keep dnd-kit refs/listeners on the same DOM elements. BlockCard is rendered inside the draggable wrapper, not replacing it. Test drag-drop after every component change. |
| **Pointer event conflicts with shadcn Checkbox** | Medium | Wrap checkbox in `onPointerDown={e => e.stopPropagation()}` div. This is the same pattern as the current CompletionCheckbox. |
| **Token rename breaks components mid-migration** | Medium | Step 1 (token unification) must maintain visual parity. Use find-and-replace for token references. Test before proceeding. |
| **Resize/draw broken by slot height change** | Medium | Step 3 updates the constant in one place. All calculations derive from it. Test resize and draw immediately after. |
| **CarryoverDialog Radix Dialog vs dnd-kit** | Low | Dialog is modal — it blocks background interaction entirely. No conflict possible. |
| **Role-color hover states still need inline JS** | Low | Accepted trade-off. Only BlockCard's role-color hover (8% → 12% opacity) uses JS. All other hover states are Tailwind. |

## 16. Verification Checklist

After all steps are complete, verify:

- [ ] App renders full-bleed with 1px sidebar border
- [ ] All buttons use shadcn Button variants with proper hover/focus/active states
- [ ] All checkboxes are square (shadcn Checkbox), positioned left, teal when checked
- [ ] No JS `onMouseEnter`/`onMouseLeave` handlers remain (except role-color hover on BlockCard)
- [ ] Sidebar goals, priority items, time blocks, evening blocks all render as BlockCard
- [ ] BlockCard height is 56px everywhere except time blocks (which are duration * 28px)
- [ ] Priority section is 136px fixed, max 2 items, silently rejects third drop
- [ ] Evening section is 56px fixed, max 1 item
- [ ] Day headers are single-line with 24px pie chart progress indicator
- [ ] Pie chart animates fill on completion toggle (300ms)
- [ ] Empty pie chart shows muted outline ring
- [ ] Drop zones are empty when idle, show dashed border during drag
- [ ] TOP and EVE labels appear in time labels column
- [ ] Priorities and evening sections have bg-muted background
- [ ] CarryoverDialog uses shadcn Dialog with Progress bar
- [ ] Delete confirmations use shadcn AlertDialog (no window.confirm)
- [ ] WeekSelector uses shadcn Popover
- [ ] "Plan this week?" appears as inline link replacing Today button
- [ ] Tooltips on icon-only buttons and sidebar goal text
- [ ] CSS tokens are unified (one system, hex format, no duplicates)
- [ ] All inline styles are limited to: role colors, positioning, completed opacity
- [ ] Light mode renders correctly
- [ ] Dark mode renders correctly
- [ ] Drag-drop works: sidebar → priorities, sidebar → timegrid, sidebar → evening
- [ ] Cross-section drag works: priorities ↔ timegrid ↔ evening
- [ ] Block resize works with 28px snap increments
- [ ] Click-drag-draw creates freestyle blocks with inline title editing
- [ ] Double-click editing works on sidebar goals and freestyle time blocks
- [ ] Goal-linked blocks are read-only (not editable via double-click)
- [ ] Completion toggle works on all item types
- [ ] Week navigation (prev/next/today) works
- [ ] Carryover dialog carries goals correctly
- [ ] New week creation works
- [ ] ScrollArea in sidebar works with many roles
