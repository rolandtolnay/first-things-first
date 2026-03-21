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

## Architecture

- **Provider nesting** in `layout.tsx`: `ThemeProvider` > `DndProvider` > `DatabaseProvider` > page content.
- **Page structure**: `Home` renders `MainLayout` with `Sidebar` prop and `WeekView` children.
- **MainLayout**: CSS Grid `grid-cols-[minmax(280px,25%)_1fr]` with `aside` (sidebar) and `main` (calendar).
- **Component organization**: `components/calendar/`, `components/sidebar/`, `components/dnd/`, `components/layout/`, `components/ui/`.
- **Shared patterns**:
  - `useEditableText` hook: manages isEditing/editValue/inputRef state for double-click-to-edit with Enter/Escape/blur handling.
  - `CloseIcon` component: reusable SVG X icon with configurable size.
  - `AddItemInput` (ui): two-state button/input pattern used by AddRoleButton and AddGoalButton.
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
- **Hover patterns**: `hover:bg-secondary/50` for interactive items, `group-hover:opacity-100` for reveal-on-hover buttons.
- **Desktop only**: 1440px+ viewport target for v1.

## Pitfalls

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
- `src/lib/utils.ts` -- `cn()` class merging utility
