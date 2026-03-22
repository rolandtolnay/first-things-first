# ui

> Next.js 15 app with Tailwind CSS v4 theming, JARVIS-inspired teal/cyan palette, light/dark mode via next-themes, and feature-based component structure.

## Decisions

| Decision | Rationale | Source |
|----------|-----------|--------|
| Next.js 16.1.3 with App Router | Modern React 19 features | Phase 01-01 |
| Tailwind CSS v4 CSS-first config | No JS config, `@theme inline` in CSS | Phase 01-01 |
| HSL format for CSS variables | Enables Tailwind opacity modifiers | Phase 01-01 |
| next-themes with class attribute | Tailwind dark mode integration | Phase 01-03 |
| System theme as default | Respects OS preference on first visit | Phase 01-03 |
| disableTransitionOnChange | No flash during theme switch | Phase 01-03 |
| Geist Sans/Mono fonts | Clean aesthetic, Next.js default | Phase 01-01 |
| Inline SVGs, not icon library | Fewer dependencies for simple icons | Phase 05-03 |
| CSS Grid sidebar layout | `minmax(280px,25%)` responsive split | Phase 02-01 |
| cn() utility over clsx package | Reduces bundle for simple use case | Phase 02-02 |
| Resize and draw via raw pointer events, not dnd-kit | dnd-kit has no resize API; pointer events are ~30 lines vs. adapting a generic library | Phase 06-01 |
| Bottom-edge-only resize handle | Universal standard (Google Cal, Notion Cal, Fantastical, Amie); zero learning curve | Phase 06-01 |
| 30-min snap increments for resize | Matches grid granularity and Covey's half-hour planning unit | Phase 06-01 |
| Inline title editing on drawn block (not popover) | Fastest creation path; maintains spatial context; freestyle blocks need only a name | Phase 06-01 |
| vitest over no test runner | First test runner added to project; configured with @/ path alias matching tsconfig | Phase 06-01 |
| CompletionCheckbox stopPropagation on both onClick and onPointerDown | dnd-kit activates on onPointerDown; stopping only onClick leaves drag-start unblocked | Phase 07-01 |
| Native `<dialog>` with showModal() over library modals | Free focus trap, ::backdrop, Esc dismiss, top-layer rendering — no z-index management or portal needed | Phase 08-01 |
| Standard HTML checkboxes in CarryoverDialog, not CompletionCheckbox | Circular SVG checkmark style reads as "mark done", not "select"; confusing in a goal-selection context | Phase 08-01 |
| Completed background replaces role-color background (not layered) | Layering green over role color produces muddy mixed hues; role-color left border preserved for scanning | Phase 07-01 |
| Completed text opacity-60 suppressed during isDragging | Drag already applies opacity-50; stacking both produces double-dimming to near-invisible | Phase 07-01 |
| Checkbox hidden during isEditing / isInlineEditing | Editing and completion are mutually exclusive states; simultaneous targets create visual clutter | Phase 07-01 |
| Independent completion per instance, no cross-instance sync | Same goal may be scheduled multiple times; marking one instance complete shouldn't affect others | Phase 07-01 |

## Architecture

- **Provider nesting** in `layout.tsx`: `ThemeProvider` > `DndProvider` > `DatabaseProvider` > page content.
- **Page structure**: `Home` renders `MainLayout` with `Sidebar` prop and `WeekView` children.
- **MainLayout**: CSS Grid `grid-cols-[minmax(280px,25%)_1fr]` with `aside` (sidebar) and `main` (calendar).
- **Component organization**: `components/calendar/`, `components/sidebar/`, `components/dnd/`, `components/layout/`, `components/ui/`.
- **Shared patterns**:
  - `useEditableText` hook: manages isEditing/editValue/inputRef state for double-click-to-edit with Enter/Escape/blur handling.
  - `CloseIcon` component: reusable SVG X icon with configurable size.
  - `AddItemInput` (ui): two-state button/input pattern used by AddRoleButton and AddGoalButton.
  - `CompletionCheckbox` component: inline SVG circle/checkmark button with `stopPropagation` on both `onPointerDown` and `onClick`, safe to embed in any dnd-kit draggable context.
- **Pointer event hooks**: `useBlockResize` — pointer capture on bottom-edge handle, local state during drag, single store commit on `pointerup`. `useBlockDraw` — container-level pointer events on TimeGrid for click-drag-draw creation gesture.
- **dnd-kit coexistence**: The resize handle calls `e.stopPropagation()` on `onPointerDown` to prevent dnd-kit's PointerSensor from activating. Click-drag-draw operates on the TimeGrid container (not on block elements) so it never intersects dnd-kit. The two systems share DOM elements but never share state.
- **Native dialog controlled pattern**: Parent owns `isDialogOpen` boolean. Dialog syncs to imperative API via `useEffect` (`if (open && !dialog.open) dialog.showModal()` / `dialog.close()`). `cancel` event listener (Esc key) calls `preventDefault()` then `onClose()` so React state stays in sync. React 19 eliminates `forwardRef` — pass ref as regular prop.
- **Interaction state machine**: Each pointer interaction (idle / resizing / drawing / editing) uses local state, not global. Container rect cached on `pointerdown` — not re-queried on `pointermove` to avoid layout reflows. Absolute position calculation, never cumulative deltas.
- **Data attributes for interaction guards**: `data-block` marks existing TimeBlocks so click-drag-draw ignores pointer starts on occupied slots. `data-slots-column` marks the TimeGrid container so resize hook can locate its parent via `closest('[data-slots-column]')`.
- **TDD for utilities**: Pure utility functions (`src/lib/`) tested with vitest. Path aliases resolved in `vitest.config.ts` to match tsconfig `@/` mapping.
- **Theming**: CSS variables in `:root` (light) and `.dark` (dark) in `globals.css`. Tailwind maps via `@theme inline` block. Semantic tokens: background, foreground, primary, secondary, muted, border, destructive, success, accent, ring.
- **ThemeProvider**: wraps `next-themes` NextThemesProvider with `attribute="class"`, `enableSystem`, `disableTransitionOnChange`.
- **ThemeToggle**: client component with sun/moon inline SVGs, `useMounted` pattern for hydration safety.

## Design

- **Color palette**: JARVIS-inspired teal/cyan primary (`173 80% 40%` light, `173 80% 50%` dark). Dark mode uses near-black with blue tint (`240 10% 4%`).
- **Semantic tokens**: `--primary`, `--secondary`, `--muted`, `--destructive`, `--success`, `--accent` plus foreground variants.
- **8 role colors**: teal, violet, orange, cyan, rose, green, amber, slate -- adjusted per mode.
- **Border radius**: `--radius: 0.5rem` with sm/md/lg/xl computed variants.
- **Focus**: `2px solid hsl(var(--ring))` with 2px offset on `:focus-visible`.
- **Selection**: primary color at 20% opacity background.
- **Hover patterns**: `hover:bg-secondary/50` for interactive items, `group-hover:opacity-100` for reveal-on-hover buttons (used on delete button and resize handle).
- **Resize handle**: hover-revealed (`opacity-0 group-hover:opacity-100`), compact strip at block bottom edge, `cursor-ns-resize`. Compact rather than always-visible to keep the planning-focused UI clean.
- **Draw preview**: Dashed-border forming block appears immediately during click-drag on empty grid slots. Minimum 1 slot enforced during drag. Inline title input (`<input autoFocus />`) replaces title span after release — Enter saves, Escape or blur-with-empty-title cancels and deletes the block.
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
- **Tailwind v4 CSS-first**: Theme customization happens in CSS via `@theme inline`, not in `tailwind.config.ts`. Dynamic class names are purged at build time.
- **suppressHydrationWarning**: Required on `<html>` tag for next-themes `class` attribute injection.

## Key Files

- `src/app/globals.css` -- CSS variables (light/dark), `@theme inline` Tailwind config, base styles
- `src/app/layout.tsx` -- Root layout with provider nesting, font config, metadata
- `src/app/page.tsx` -- Home page composing MainLayout + Sidebar + WeekView
- `src/components/layout/MainLayout.tsx` -- CSS Grid sidebar/calendar split
- `src/providers/ThemeProvider.tsx` -- next-themes wrapper with class-based dark mode
- `src/components/ThemeToggle.tsx` -- Theme switch with sun/moon icons
- `src/hooks/useEditableText.ts` -- Shared double-click-to-edit hook
- `src/components/ui/CloseIcon.tsx` -- Reusable X icon component
- `src/components/ui/CompletionCheckbox.tsx` -- dnd-kit-safe checkbox with SVG circle/checkmark and green completion state
- `src/lib/utils.ts` -- `cn()` class merging utility, `slotToTime()`, `generateId()`
- `src/hooks/useBlockResize.ts` -- Pointer-event hook for bottom-edge block resize with overlap clamping
- `src/hooks/useBlockDraw.ts` -- Pointer-event hook for click-drag-draw freestyle block creation
- `vitest.config.ts` -- Vitest config with @/ path alias resolution matching tsconfig
- `src/components/calendar/TimeGrid.tsx` -- TimeGrid container with data-slots-column, draw preview, useBlockDraw integration
- `src/components/calendar/TimeBlock.tsx` -- Resize handle, inline title editing, data-block attribute
- `src/components/calendar/WeekNavigation.tsx` -- Navigation header (arrows, Today, +New, banner); week index via useLiveQuery
- `src/components/calendar/CarryoverDialog.tsx` -- Native dialog with goal checkboxes grouped by role
