# ui

> Next.js 15 app with Tailwind CSS v4 and a hex/RGB CSS token system, floating card layout on teal-50 background, Plus Jakarta Sans, Lucide icons, and feature-based component structure.

## Decisions

| Decision | Rationale | Source |
|----------|-----------|--------|
| Next.js 16.1.3 with App Router | Modern React 19 features | Phase 01-01 |
| Tailwind CSS v4 CSS-first config | No JS config, `@theme inline` in CSS | Phase 01-01 |
| Hex/RGB format for CSS variables (replaced HSL) | Enables `rgba(var(--role-N-rgb), opacity)` modifiers without `hsl()` parsing; HSL aliases kept as shims for remaining Tailwind class consumers | Phase 09-01 |
| next-themes with class attribute | Tailwind dark mode integration | Phase 01-03 |
| System theme as default | Respects OS preference on first visit | Phase 01-03 |
| disableTransitionOnChange | No flash during theme switch | Phase 01-03 |
| Plus Jakarta Sans font (replaced Geist Sans) | Geometric, friendly, modern; warmer feel vs. Geist's utilitarian default | Phase 09-01 |
| lucide-react for icons (replaced inline SVGs) | Consistency across components; custom SVG per icon doesn't scale; CompletionCheckbox retains custom SVG — circle+checkmark has no exact Lucide equivalent | Phase 09-01 |
| Flex row layout (replaced CSS Grid sidebar) | Flex row better accommodates fixed 280px sidebar + fluid board card pairing; original CSS Grid `minmax(280px,25%)` approach replaced | Phase 09-01 |
| cn() utility over clsx package | Reduces bundle for simple use case | Phase 02-02 |
| Resize and draw via raw pointer events, not dnd-kit | dnd-kit has no resize API; pointer events are ~30 lines vs. adapting a generic library | Phase 06-01 |
| Bottom-edge-only resize handle | Universal standard (Google Cal, Notion Cal, Fantastical, Amie); zero learning curve | Phase 06-01 |
| 30-min snap increments for resize | Matches grid granularity and Covey's half-hour planning unit | Phase 06-01 |
| Inline title editing on drawn block (not popover) | Fastest creation path; maintains spatial context; freestyle blocks need only a name | Phase 06-01 |
| vitest over no test runner | First test runner added to project; configured with @/ path alias matching tsconfig | Phase 06-01 |
| CompletionCheckbox stopPropagation on both onClick and onPointerDown | dnd-kit activates on onPointerDown; stopping only onClick leaves drag-start unblocked | Phase 07-01 |
| Native `<dialog>` with showModal() over library modals | Free focus trap, ::backdrop, Esc dismiss, top-layer rendering — no z-index management or portal needed | Phase 08-01 |
| Standard HTML checkboxes in CarryoverDialog, not CompletionCheckbox | Circular SVG checkmark style reads as "mark done", not "select"; confusing in a goal-selection context | Phase 08-01 |
| Amber color tokens for overwrite warning in CarryoverDialog (`bg-amber-500/10`, `border-amber-500/30`) | Differentiates from destructive (red) error states; signals caution without alarm | adhoc-01 |
| Opacity-based completion model: 0.55 opacity + `rgba(0,0,0,0.02)` bg, no green tint (replaced green `hsl(--success/0.15)`) | Green tint competes with role color coding; opacity de-emphasis preserves role→color→goal visual chain; 0.55 chosen as readable-but-clearly-done threshold | Phase 09-01 |
| Completed text opacity-60 suppressed during isDragging | Drag already applies opacity-50; stacking both produces double-dimming to near-invisible | Phase 07-01 |
| Checkbox hidden during isEditing / isInlineEditing | Editing and completion are mutually exclusive states; simultaneous targets create visual clutter | Phase 07-01 |
| Independent completion per instance, no cross-instance sync | Same goal may be scheduled multiple times; marking one instance complete shouldn't affect others | Phase 07-01 |
| Inline styles with `var()` for design token consumption | Tailwind v4 purges dynamic class names at build time; inline `style={{ color: 'var(--text-primary)' }}` is reliable where Tailwind classes would be stripped | Phase 09-01 |
| Hover states via `onMouseEnter`/`onMouseLeave` (not Tailwind hover:) | Token-based colors can't use Tailwind hover: classes for the same reason dynamic classes are purged; JS-driven hover reads from the same CSS variables | Phase 09-01 |

## Architecture

- **Provider nesting** in `layout.tsx`: `ThemeProvider` > `DndProvider` > `DatabaseProvider` > page content.
- **Page structure**: `Home` renders `MainLayout` with `Sidebar` prop and `WeekView` children.
- **MainLayout**: Flex row with 24px gap and 24px page padding on teal-50 (`#F0FDFA`) background. Sidebar is `flex-shrink-0 w-[280px]`; board card is `flex-1 min-w-0`. Both are floating white cards with `shadow-card` and `radius-xl`. Previously CSS Grid `grid-cols-[minmax(280px,25%)_1fr]`.
- **Component organization**: `components/calendar/`, `components/sidebar/`, `components/dnd/`, `components/layout/`, `components/ui/`.
- **Shared patterns**:
  - `useEditableText` hook: manages isEditing/editValue/inputRef state for double-click-to-edit with Enter/Escape/blur handling.
  - `AddItemInput` (ui): two-state button/input pattern used by AddRoleButton and AddGoalButton; accepts an icon prop for Lucide icon prefix.
  - `CompletionCheckbox` component: 16px custom SVG circle/checkmark (32px touch target) with `stopPropagation` on both `onPointerDown` and `onClick`, safe in any dnd-kit draggable context.
  - `CloseIcon` component: deleted — all sites migrated to `<X />` from lucide-react.
- **Pointer event hooks**: `useBlockResize` — pointer capture on bottom-edge handle, local state during drag, single store commit on `pointerup`. `useBlockDraw` — container-level pointer events on TimeGrid for click-drag-draw creation gesture.
- **dnd-kit coexistence**: The resize handle calls `e.stopPropagation()` on `onPointerDown` to prevent dnd-kit's PointerSensor from activating. Click-drag-draw operates on the TimeGrid container (not on block elements) so it never intersects dnd-kit. The two systems share DOM elements but never share state.
- **Custom dropdown pattern (WeekSelector)**: State owns `isOpen` boolean; toggle on button click; close on outside click via `useEffect` with `mousedown` listener on `document`; close on `keydown` Escape. Options rendered as `<ul>` overlay. Badge markup (`Planned`) co-located in option row. See `src/components/calendar/WeekSelector.tsx`.
- **Native dialog controlled pattern**: Parent owns `isDialogOpen` boolean. Dialog syncs to imperative API via `useEffect` (`if (open && !dialog.open) dialog.showModal()` / `dialog.close()`). `cancel` event listener (Esc key) calls `preventDefault()` then `onClose()` so React state stays in sync. React 19 eliminates `forwardRef` — pass ref as regular prop.
- **Interaction state machine**: Each pointer interaction (idle / resizing / drawing / editing) uses local state, not global. Container rect cached on `pointerdown` — not re-queried on `pointermove` to avoid layout reflows. Absolute position calculation, never cumulative deltas.
- **Data attributes for interaction guards**: `data-block` marks existing TimeBlocks so click-drag-draw ignores pointer starts on occupied slots. `data-slots-column` marks the TimeGrid container so resize hook can locate its parent via `closest('[data-slots-column]')`.
- **TDD for utilities**: Pure utility functions (`src/lib/`) tested with vitest. Path aliases resolved in `vitest.config.ts` to match tsconfig `@/` mapping.
- **Theming**: CSS variables in `:root` (light) and `.dark` (dark) in `globals.css`. Tailwind maps via `@theme inline` block. Token system uses hex/RGB values (phase 09 replaced the earlier HSL-based approach). See Design section for token names.
- **ThemeProvider**: wraps `next-themes` NextThemesProvider with `attribute="class"`, `enableSystem`, `disableTransitionOnChange`.
- **ThemeToggle**: client component with Lucide `Sun`/`Moon` icons, `useMounted` pattern for hydration safety.
- **Role color helpers** (`src/lib/role-colors.ts`): `getRoleColorStyleWithOpacity(color, opacity)` returns inline style with `rgba(var(--role-N-rgb), opacity)`. Requires paired `--role-N` (hex) and `--role-N-rgb` (space-separated R G B) CSS variables in globals.css.
- **Daily progress bars**: rendered in `DayColumn` as a standalone `<div>` with inner fill div; width is `completed/total` as CSS percentage; hidden when `total === 0`; smooth `transition-[width] duration-300`.

## Design

- **Color palette**: Calm teal primary (`#14B8A6` light, `#2DD4BF` dark) on teal-50 page background (`#F0FDFA`). Card surfaces are white (`#FFFFFF`) in light and warm dark blue (`#1A2332`) in dark. The earlier JARVIS-inspired `hsl(173 80% 40%)` approach is superseded.
- **Semantic tokens**: hex/RGB values in `:root` (light) and `.dark` (dark). Key tokens: `--bg-page`, `--bg-card`, `--bg-muted`, `--text-primary`, `--text-secondary`, `--text-muted`, `--primary`, `--primary-hover`, `--primary-soft`, `--primary-muted`, `--success`, `--warning`, `--destructive`, `--border-subtle`, `--border-emphasis`, `--completed-opacity`, `--completed-bg`. Legacy HSL aliases retained as shims.
- **8 role colors**: teal, violet, amber, sky, rose, emerald, orange, slate — each has a vibrant hex and a dark-mode vibrant hex. Used at 8% opacity for card backgrounds (10% in dark mode for visibility), 100% for 3px left borders. RGB components stored as `--role-N-rgb` for `rgba()` mixing.
- **Border radius**: `--radius: 0.5rem` with sm/md/lg/xl computed variants.
- **Focus**: `2px solid hsl(var(--ring))` with 2px offset on `:focus-visible`.
- **Selection**: primary color at 20% opacity background.
- **Hover patterns**: JS `onMouseEnter`/`onMouseLeave` for token-driven color changes (Tailwind hover: classes purge dynamic tokens). `group-hover:opacity-100` still used where the hover state doesn't require token values (e.g., reveal-on-hover opacity transitions on delete button and resize handle).
- **Resize handle**: hover-revealed (`opacity-0 group-hover:opacity-100`), compact strip at block bottom edge, `cursor-ns-resize`. Compact rather than always-visible to keep the planning-focused UI clean.
- **Draw preview**: Dashed-border forming block appears immediately during click-drag on empty grid slots. Minimum 1 slot enforced during drag. Inline title input (`<input autoFocus />`) replaces title span after release — Enter saves, Escape or blur-with-empty-title cancels and deletes the block.
- **Completion styling**: Completed items use `opacity: 0.55` on the full card container + `rgba(0,0,0,0.02)` background. Role-color left border stays at full saturation. No strikethrough. In dark mode, completed-bg inverts to `rgba(255,255,255,0.02)`.
- **CarryoverDialog enhancement**: Shows a completion summary section at the top (count of completed vs. total goals from source week, with progress bar) before presenting uncompleted goal checkboxes. Section only rendered when source week has goals.
- **Dialog backdrop**: `dialog::backdrop { background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); }` for CarryoverDialog.
- **Desktop only**: 1440px+ viewport target for v1.

## Pitfalls

- **showModal() throws if already open**: Calling `showModal()` on an open dialog throws `InvalidStateError`. Always guard: `if (!dialog.open) dialog.showModal()`. The `cancel` event from Esc must also be intercepted and routed through React state — native Esc close bypasses React's `open` prop, leaving state desynchronized.
- **onPointerDown not onMouseDown for stopPropagation**: dnd-kit's PointerSensor fires on `onPointerDown`, which precedes `onMouseDown`. Calling `stopPropagation()` on `onMouseDown` does not prevent dnd-kit activation.
- **setPointerCapture required for resize/draw**: Without it, fast pointer movement off the handle element causes events to stop firing. `setPointerCapture(e.pointerId)` guarantees `pointermove`/`pointerup` continue on the capturing element regardless of pointer position.
- **Cumulative delta drift**: Using `movementY` deltas across frames causes floating-point drift. Always calculate slot position from absolute coordinates: `Math.round((clientY - containerTop) / 32)`.
- **Missing CSS touch-action / user-select on drag surfaces**: Without `touch-action: none`, browsers interpret drag gestures as scroll. Without `user-select: none`, text selection triggers during pointer drag.
- **Click-drag-draw on existing block**: Guard at pointer-down with `if ((e.target as HTMLElement).closest('[data-block]')) return` — without it, dragging from an existing block starts a draw gesture instead of dnd-kit drag.
- **TimeSlotIndex casting**: `TimeSlotIndex` is a literal union `0 | 1 | ... | 23`. Any computed slot value must be cast with `as TimeSlotIndex`. Out-of-range values are TypeScript errors.
- **Hydration mismatch**: Client-only state (theme, mounted) requires `useMounted` hook pattern. Components using `useTheme` must guard rendering.
- **ESLint set-state-in-effect**: Standard hydration hook pattern triggers this rule. Disabled in `eslint.config.mjs`.
- **Tailwind v4 CSS-first**: Theme customization happens in CSS via `@theme inline`, not in `tailwind.config.ts`. Dynamic class names (e.g., `bg-[${colorVar}]` or classes built from JS strings) are purged at build time — use inline `style={{ ... }}` with `var()` references instead for design-token-driven colors.
- **suppressHydrationWarning**: Required on `<html>` tag for next-themes `class` attribute injection.

## Key Files

- `src/app/globals.css` -- CSS variables (light/dark), `@theme inline` Tailwind config, base styles
- `src/app/layout.tsx` -- Root layout with provider nesting, font config, metadata
- `src/app/page.tsx` -- Home page composing MainLayout + Sidebar + WeekView
- `src/components/layout/MainLayout.tsx` -- Floating card layout: flex row, teal-50 page bg, sidebar + board as white shadow-card radius-xl cards
- `src/providers/ThemeProvider.tsx` -- next-themes wrapper with class-based dark mode
- `src/components/ThemeToggle.tsx` -- Theme switch with sun/moon icons
- `src/hooks/useEditableText.ts` -- Shared double-click-to-edit hook
- `src/lib/role-colors.ts` -- Role color helpers including `getRoleColorStyleWithOpacity()` using RGB component variables for rgba() mixing
- `src/components/ui/CompletionCheckbox.tsx` -- dnd-kit-safe 16px custom SVG circle/checkmark (32px touch target); opacity-based completion state (no green tint)
- `src/lib/utils.ts` -- `cn()` class merging utility, `slotToTime()`, `generateId()`
- `src/hooks/useBlockResize.ts` -- Pointer-event hook for bottom-edge block resize with overlap clamping
- `src/hooks/useBlockDraw.ts` -- Pointer-event hook for click-drag-draw freestyle block creation
- `vitest.config.ts` -- Vitest config with @/ path alias resolution matching tsconfig
- `src/components/calendar/TimeGrid.tsx` -- TimeGrid container with data-slots-column, draw preview, useBlockDraw integration
- `src/components/calendar/TimeBlock.tsx` -- Resize handle, inline title editing, data-block attribute
- `src/components/calendar/WeekNavigation.tsx` -- Navigation header (arrows, Today, +New, banner); week index via useLiveQuery
- `src/components/calendar/WeekSelector.tsx` -- Custom week dropdown with Planned badges, outside-click/Escape close (see weeks for data/default logic)
- `src/components/calendar/CarryoverDialog.tsx` -- Native dialog with goal checkboxes grouped by role; amber overwrite warning when planned week selected
