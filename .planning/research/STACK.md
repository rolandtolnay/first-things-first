# Stack Research: Weekly Planning/Productivity Web App

**Domain:** Weekly planning/productivity web app (Covey Habit 3 methodology)
**Researched:** 2026-01-18
**Confidence:** HIGH

## Executive Summary

For a desktop-only weekly planner with drag-drop scheduling, IndexedDB persistence, and JARVIS-inspired theming, the 2026 standard stack centers on **Next.js 15** with the App Router, **React 19**, **Tailwind CSS v4**, and **shadcn/ui** components. This stack is production-proven, well-documented, and optimized for interactive applications.

**Key choices:**
- **dnd-kit** for drag-drop (lightweight, accessible, 60fps performance)
- **Dexie.js** for IndexedDB (reactive queries, excellent React integration)
- **Zustand** for state management (simple, performant, minimal boilerplate)
- **next-themes** for dark/light mode (zero-flicker, battle-tested)

---

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Next.js | 15.5.9 | Framework | App Router, Server Components, Turbopack. Production-ready, security-patched. Gold standard for React apps in 2025-2026. |
| React | 19.2.3 | UI Library | Latest stable with Server Components, improved performance, Activity API. |
| TypeScript | 5.9.3 | Type Safety | Full type inference, better DX, required for modern React development. |
| Tailwind CSS | 4.1.18 | Styling | CSS-first config, 5x faster builds, cascade layers. Zero-runtime styling. |

### UI & Components

| Library | Version | Purpose | Why Recommended |
|---------|---------|---------|-----------------|
| shadcn/ui | latest | Component Library | Copy-paste components, Radix primitives, full accessibility. Works perfectly with Next.js App Router. Not a dependency - own your code. |
| Radix UI | (via shadcn) | Primitives | Accessible, unstyled components. Focus management, keyboard navigation handled. |
| lucide-react | latest | Icons | Tree-shakeable, consistent style, default for shadcn/ui. 1,655 icons. |
| clsx | 2.x | Class Composition | 239 bytes, conditional className construction. Faster than classnames. |
| tailwind-merge | 3.4.0 | Class Merging | Resolves Tailwind class conflicts intelligently. Required for component composition. |

### Drag and Drop

| Library | Version | Purpose | Why Recommended |
|---------|---------|---------|-----------------|
| @dnd-kit/core | 6.3.1 | Drag-Drop Core | Modern, accessible, 10KB gzipped. 60fps even with hundreds of items. No HTML5 DnD API limitations. |
| @dnd-kit/sortable | 10.0.0 | Sortable Preset | Built for reorderable lists/grids. Optimized for sortable interfaces like time blocks. |
| @dnd-kit/utilities | latest | Utilities | CSS transforms, sensor utilities. |

### State Management

| Library | Version | Purpose | Why Recommended |
|---------|---------|---------|-----------------|
| Zustand | 5.0.10 | Global State | 3KB, no boilerplate, no Provider needed. Perfect for complex UI with interconnected state. Handles zombie child problem, React concurrency correctly. |

### Data Persistence

| Library | Version | Purpose | Why Recommended |
|---------|---------|---------|-----------------|
| Dexie.js | 4.2.1 | IndexedDB Wrapper | Best-in-class DX for IndexedDB. Schema versioning, migrations, reactive queries built-in. |
| dexie-react-hooks | 4.2.0 | React Integration | `useLiveQuery()` for real-time data binding. Components re-render when IndexedDB changes. |

### Theming

| Library | Version | Purpose | Why Recommended |
|---------|---------|---------|-----------------|
| next-themes | 0.4.6 | Theme Management | Zero-flicker dark mode. System preference support. Works with App Router since v0.3.0. |

### Utilities

| Library | Version | Purpose | Why Recommended |
|---------|---------|---------|-----------------|
| date-fns | 4.x | Date Manipulation | Tree-shakeable, functional API. Better for bundle size than dayjs when using many functions. |
| nanoid | 5.1.6 | ID Generation | 118 bytes, URL-safe, secure. 21 chars vs UUID's 36. Perfect for local entity IDs. |

---

## Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Turbopack | Dev Server | Default in Next.js 15. 100x faster incremental builds. |
| ESLint | Linting | Use Next.js default config with strict TypeScript rules. |
| Prettier | Formatting | Pair with prettier-plugin-tailwindcss for class sorting. |
| @tailwindcss/vite | Build | Tailwind v4 Vite plugin (if using Turbopack, not needed). |

---

## Installation

### Initial Setup

```bash
# Create Next.js 15 project with TypeScript and Tailwind
npx create-next-app@latest first-things-first --typescript --tailwind --eslint --app --src-dir

# Core dependencies
npm install zustand dexie dexie-react-hooks next-themes

# Drag and drop
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities

# Utilities
npm install clsx tailwind-merge date-fns nanoid

# Icons (installed with shadcn/ui init)
npm install lucide-react
```

### shadcn/ui Setup

```bash
# Initialize shadcn/ui (interactive)
npx shadcn@latest init

# Add commonly needed components
npx shadcn@latest add button card dialog dropdown-menu input label separator tabs tooltip
```

---

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout with providers
│   ├── page.tsx            # Main planner view
│   └── globals.css         # Tailwind imports, theme variables
├── components/
│   ├── ui/                 # shadcn/ui components (auto-generated)
│   ├── planner/            # Planner-specific components
│   │   ├── week-grid.tsx
│   │   ├── time-block.tsx
│   │   └── role-sidebar.tsx
│   └── providers/          # Context providers
│       └── theme-provider.tsx
├── lib/
│   ├── db/                 # Dexie database setup
│   │   ├── index.ts        # Database instance
│   │   └── schema.ts       # Table definitions
│   ├── store/              # Zustand stores
│   │   ├── planner-store.ts
│   │   └── ui-store.ts
│   └── utils.ts            # cn() helper, date utils
└── types/                  # TypeScript types
    └── planner.ts
```

---

## Alternatives Considered

### Drag and Drop

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| dnd-kit | react-dnd | react-dnd supports HTML5 backend for desktop file drag. Not needed for this app. More complex API. |
| dnd-kit | react-beautiful-dnd | **AVOID** - Maintenance mode since 2023. No active development. |
| dnd-kit | pragmatic-drag-and-drop | Atlassian's new library. Less React-specific, more verbose. dnd-kit more established. |

### State Management

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Zustand | Jotai | Jotai better for atomic, fine-grained state. Zustand better for interconnected planner state (selected block, drag state, view mode all related). |
| Zustand | Redux Toolkit | Overkill for this app size. More boilerplate. |
| Zustand | React Context | Performance issues with frequent updates (drag operations). |

### IndexedDB

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Dexie | idb | idb is closer to raw IndexedDB. Less abstraction, no built-in React hooks, manual migrations. |
| Dexie | localForage | Simpler but less powerful. No reactive queries, weaker TypeScript support. |

### Date Library

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| date-fns | dayjs | dayjs smaller initial bundle (6KB vs 18KB). But date-fns tree-shakes better when using many functions. Planner will use many date operations. |
| date-fns | Temporal API | Not yet stable in all browsers. Use date-fns until Temporal ships. |

### Theming

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| next-themes | Manual implementation | Reinventing wheel. Flash of unstyled content issues. System preference detection complex. |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| react-beautiful-dnd | Maintenance mode since 2023, no updates | dnd-kit |
| Moment.js | Deprecated, massive bundle (329KB) | date-fns |
| styled-components/Emotion | Runtime CSS-in-JS adds overhead, conflicts with RSC | Tailwind CSS |
| localStorage for complex data | No querying, no transactions, 5MB limit | IndexedDB via Dexie |
| Redux for small/medium apps | Excessive boilerplate for this use case | Zustand |
| classnames | Larger and slower than clsx | clsx |
| uuid | Larger than needed, 36-char IDs | nanoid |
| Custom theme implementation | Hydration issues, flash of wrong theme | next-themes |
| CSS Modules | More verbose, harder to maintain than Tailwind | Tailwind CSS |
| Material UI / Chakra UI | Heavy, opinionated styling conflicts with custom JARVIS aesthetic | shadcn/ui + custom styling |

---

## Configuration Patterns

### Tailwind v4 Theme (globals.css)

```css
@import "tailwindcss";

@theme {
  /* JARVIS-inspired color palette */
  --color-jarvis-blue: oklch(0.65 0.15 230);
  --color-jarvis-cyan: oklch(0.75 0.12 195);
  --color-jarvis-dark: oklch(0.15 0.02 250);
  --color-jarvis-glow: oklch(0.8 0.18 200);

  /* Light mode overrides defined via CSS variables */
}

@custom-variant dark (&:where(.dark, .dark *));
```

### cn() Utility (lib/utils.ts)

```typescript
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### Dexie Database Setup (lib/db/index.ts)

```typescript
import Dexie, { type EntityTable } from 'dexie';
import type { Role, Goal, TimeBlock, WeekPlan } from '@/types/planner';

const db = new Dexie('FirstThingsFirst') as Dexie & {
  roles: EntityTable<Role, 'id'>;
  goals: EntityTable<Goal, 'id'>;
  timeBlocks: EntityTable<TimeBlock, 'id'>;
  weekPlans: EntityTable<WeekPlan, 'id'>;
};

db.version(1).stores({
  roles: '++id, name, order',
  goals: '++id, roleId, weekId, text, isComplete',
  timeBlocks: '++id, weekId, day, startTime, duration, goalId',
  weekPlans: '++id, weekStart, bigRocks',
});

export { db };
```

### Zustand Store Pattern (lib/store/planner-store.ts)

```typescript
import { create } from 'zustand';

interface PlannerState {
  selectedBlockId: string | null;
  isDragging: boolean;
  viewMode: 'week' | 'day';
  // Actions
  selectBlock: (id: string | null) => void;
  setDragging: (dragging: boolean) => void;
  setViewMode: (mode: 'week' | 'day') => void;
}

export const usePlannerStore = create<PlannerState>((set) => ({
  selectedBlockId: null,
  isDragging: false,
  viewMode: 'week',
  selectBlock: (id) => set({ selectedBlockId: id }),
  setDragging: (dragging) => set({ isDragging: dragging }),
  setViewMode: (mode) => set({ viewMode: mode }),
}));
```

---

## Sources

### Primary (HIGH confidence)
- [Next.js Official Documentation](https://nextjs.org/docs) - App Router, production checklist
- [Tailwind CSS v4 Release](https://tailwindcss.com/blog/tailwindcss-v4) - CSS-first configuration
- [dnd-kit Documentation](https://docs.dndkit.com) - Installation, sortable preset
- [Dexie.js Documentation](https://dexie.org/) - React hooks, useLiveQuery
- [Zustand Documentation](https://zustand.docs.pmnd.rs/) - Comparison with alternatives
- [shadcn/ui Documentation](https://ui.shadcn.com/docs) - Next.js installation
- [next-themes GitHub](https://github.com/pacocoursey/next-themes) - App Router support

### Secondary (MEDIUM confidence)
- [npm package pages](https://www.npmjs.com/) - Version numbers verified 2026-01-18
- [React 19.2 Release Notes](https://react.dev/blog/2025/10/01/react-19-2)
- [Puck Editor: Top 5 DnD Libraries 2026](https://puckeditor.com/blog/top-5-drag-and-drop-libraries-for-react)
- [State Management in 2025 - DEV Community](https://dev.to/hijazi313/state-management-in-2025-when-to-use-context-redux-zustand-or-jotai-2d2k)

### Tertiary (verified against primary)
- Various Medium/DEV Community articles on Next.js 15, Tailwind v4, dnd-kit patterns

---

## Confidence Assessment

| Area | Confidence | Reason |
|------|------------|--------|
| Core Stack (Next.js, React, Tailwind) | HIGH | Official docs, npm verified, industry standard |
| Drag-Drop (dnd-kit) | HIGH | Official docs, extensive community adoption, verified current |
| IndexedDB (Dexie) | HIGH | Official docs, React hooks documented, npm verified |
| State Management (Zustand) | HIGH | Official docs, npm verified, 15M+ weekly downloads |
| Theming (next-themes) | HIGH | GitHub verified, standard for Next.js dark mode |
| Component Library (shadcn/ui) | HIGH | Official Next.js integration docs, widely adopted |
| Version Numbers | HIGH | All verified via npm 2026-01-18 |

---

## Research Valid Until

**Estimated validity:** 60 days (stable ecosystem, established patterns)

**Watch for:**
- Next.js 16.x adoption (currently in canary)
- Tailwind CSS v4.2+ changes
- dnd-kit major version updates
