# Project Research Summary

**Project:** First Things First
**Domain:** Weekly planning/productivity web app (Covey Habit 3 methodology)
**Researched:** 2026-01-18
**Confidence:** HIGH

## Executive Summary

Building a weekly planning app that implements Stephen Covey's Habit 3 methodology requires a modern React stack with specialized libraries for drag-drop interactions and local-first data persistence. The recommended approach centers on **Next.js 15 with React 19**, **dnd-kit** for drag-drop scheduling, **Dexie.js** for IndexedDB persistence, and **Zustand** for state management. This stack is production-proven, well-documented, and optimized for the interactive, data-heavy nature of a planning application.

The role-based planning niche is underserved digitally. While competitors like Week Plan implement Covey methodology, reviews cite UX issues and dated interfaces. The key differentiators are: (1) superior UX with a JARVIS-inspired aesthetic, (2) local-first architecture eliminating account friction, and (3) opinionated design that bakes in the methodology rather than offering endless customization. The core feature loop (roles -> goals -> time blocks) directly maps to Covey's methodology and should be the MVP focus.

Critical risks center on Safari compatibility (IndexedDB data eviction after 7 days of inactivity), drag-drop performance with many drop targets (336 slots in a week view), and the complexity of time block collision detection. Mitigation strategies are well-documented: use `navigator.storage.persist()`, implement aggressive memoization, and validate collisions on both preview and commit. The recommended build order starts with the data layer to avoid Safari issues early, followed by the calendar grid, then sidebar with drag-drop integration.

## Key Findings

### Recommended Stack

The 2026 standard stack for desktop-first web apps with complex interactions is Next.js 15 + React 19 + Tailwind CSS v4 + shadcn/ui. For this project's specific needs (drag-drop scheduling, local persistence), dnd-kit and Dexie.js are the clear choices based on community adoption and documentation quality.

**Core technologies:**
- **Next.js 15.5.9**: App Router, Server Components, Turbopack. Gold standard for React apps.
- **dnd-kit 6.3.1**: Modern drag-drop with 60fps performance, 10KB gzipped, no HTML5 DnD API limitations.
- **Dexie.js 4.2.1**: Best-in-class IndexedDB wrapper with reactive queries and schema migrations.
- **Zustand 5.0.10**: 3KB state management with no boilerplate, handles concurrent updates correctly.
- **Tailwind CSS 4.1.18**: CSS-first config, zero-runtime styling, perfect for custom theming.
- **shadcn/ui**: Copy-paste accessible components, full control over styling.
- **next-themes 0.4.6**: Zero-flicker dark mode with system preference support.

### Expected Features

**Must have (table stakes):**
- Role management with colors (CRUD operations)
- Goal creation organized by roles
- Weekly calendar view (7-day grid with time slots)
- Drag-and-drop scheduling (goals to calendar)
- Time block manipulation (move, resize, delete)
- Week navigation (previous/next, current week)
- Data persistence (IndexedDB, no data loss)
- JARVIS-inspired dark theme aesthetic

**Should have (differentiators):**
- Role-based organization (core Covey methodology)
- "Big Rocks First" guided planning flow
- Weekly review/reflection prompts
- Independent week snapshots (no guilt carryover)
- Local-first/no account (privacy differentiator)
- Quadrant II focus indicators (Important vs Urgent)

**Defer (v2+):**
- Read-only external calendar overlay
- Optional cloud sync
- Mobile companion app
- Quarterly/annual goal hierarchy
- Calendar integrations (avoid bidirectional sync complexity)

### Architecture Approach

The architecture follows a feature-based component structure with centralized drag-drop context (single DndContext wrapping the app), Zustand for UI state with optimistic updates, and Dexie.js for persistence. The calendar grid is built from scratch using CSS Grid rather than using calendar libraries like FullCalendar, because those are optimized for event viewing rather than goal-to-block planning workflows.

**Major components:**
1. **DndContext Provider** - Single drag-drop orchestration wrapping sidebar and calendar
2. **Sidebar (Roles/Goals)** - Source for drag operations, displays role hierarchy with draggable goals
3. **Calendar Grid** - 7 day columns x 24+ time slots, CSS Grid layout
4. **Time Blocks** - Draggable + resizable scheduled items positioned within grid
5. **Week Store (Zustand)** - Manages roles, goals, time blocks with optimistic updates
6. **UI Store (Zustand)** - Transient state (drag state, selection, theme) - not persisted
7. **Dexie Database** - IndexedDB with schema versioning and reactive hooks

### Critical Pitfalls

1. **Safari IndexedDB Data Eviction** - Safari deletes all browser storage after 7 days of inactivity. Call `navigator.storage.persist()` on first use, display persistence status to users, implement export/backup functionality.

2. **Drag-Drop Performance Collapse** - With 336 drop targets (48 slots x 7 days), drag operations become sluggish. Use `React.memo` aggressively, create stable references, consider single droppable with coordinate-based detection.

3. **Snap-to-Grid Inconsistency** - Blocks may snap to relative positions instead of absolute grid. Always snap to absolute positions (00, 30 minutes), test with blocks starting at various times.

4. **Theme Flash on Load (FOUC)** - Page loads with wrong theme then flashes. Use next-themes which handles inline script injection before body renders.

5. **No Undo for Destructive Actions** - Users accidentally delete blocks with no recovery. Plan state history architecture from start, use immutable patterns, implement at minimum single-level undo.

## Implications for Roadmap

Based on research, the following phase structure addresses dependencies and avoids critical pitfalls:

### Phase 1: Foundation & Data Layer
**Rationale:** Data layer must be correct from day one to avoid Safari eviction issues. Types and schema define the entire application's structure.
**Delivers:** Working IndexedDB persistence with Dexie, TypeScript types, Zustand stores, project scaffolding
**Addresses:** Data persistence (table stakes), local-first architecture
**Avoids:** Safari IndexedDB eviction (#1), Transaction auto-close (#4), Schema migration failures (#10)

### Phase 2: Calendar Grid (UI Only)
**Rationale:** Calendar is the most complex visual component. Building it before sidebar ensures drop targets exist for drag integration.
**Delivers:** 7-day calendar view with time slots, CSS Grid layout, theme foundation
**Uses:** Tailwind CSS, CSS variables, next-themes
**Implements:** CalendarGrid, DayColumn, TimeSlot components (display only)
**Avoids:** Theme flash (#7), performance foundation for many elements

### Phase 3: Role & Goal Management
**Rationale:** Roles and goals are the source of drags. Need to exist before drag-drop integration.
**Delivers:** Sidebar with role list, CRUD for roles and goals, role colors
**Addresses:** Role management, goal creation (table stakes)
**Implements:** Sidebar, RoleList, RoleItem, GoalItem components

### Phase 4: Drag-Drop Integration
**Rationale:** Connect sidebar (drag source) to calendar (drop target). Core interaction of the app.
**Delivers:** Goals draggable to calendar, time block creation from drops
**Uses:** dnd-kit core and sortable
**Avoids:** DnD performance (#2), Snap inconsistency (#3), Collision detection (#5)
**Implements:** DndContext provider, data-driven drop handling

### Phase 5: Time Block Interactions
**Rationale:** Extends drag-drop to existing blocks. Adds resize and delete functionality.
**Delivers:** Block movement, resize handles, delete capability, undo
**Addresses:** Block manipulation (table stakes)
**Avoids:** Resize handle size (#8), No undo (#9)
**Implements:** Block drag/move, pointer-based resize, state history

### Phase 6: Week Navigation & Workflow
**Rationale:** Multi-week support enables actual usage. Week transitions are complex and need solid foundation.
**Delivers:** Week navigation, week creation, goal carryover decisions
**Addresses:** Week navigation (table stakes), independent week snapshots
**Avoids:** Week transition data loss (#6)

### Phase 7: Polish & Launch Prep
**Rationale:** Refinement layer on working foundation. Accessibility and UX polish.
**Delivers:** Keyboard shortcuts, JARVIS aesthetic, accessibility audit, performance optimization
**Addresses:** Keyboard shortcuts (table stakes), distinctive visual identity

### Phase Ordering Rationale

- **Data before UI:** Safari eviction and IndexedDB issues must be addressed in foundation, not retrofitted
- **Calendar before Sidebar:** Drop targets must exist before drag sources to test integration properly
- **Drag-drop after both:** Requires both source (sidebar) and target (calendar) components
- **Resize after basic drag:** Resize adds complexity; get basic movement working first
- **Week navigation late:** Easier to perfect single-week behavior before multi-week
- **Polish last:** Cannot optimize what does not yet exist

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 4 (Drag-Drop):** Complex dnd-kit patterns for goal-to-calendar and block-to-block moves
- **Phase 5 (Time Blocks):** Resize handle implementation and collision detection edge cases
- **Phase 6 (Week Navigation):** Week transition carryover semantics need explicit specification

Phases with standard patterns (skip research-phase):
- **Phase 1 (Foundation):** Dexie and Zustand setup well-documented
- **Phase 2 (Calendar Grid):** CSS Grid patterns standard
- **Phase 3 (Role/Goal):** Standard CRUD operations
- **Phase 7 (Polish):** Established accessibility and performance patterns

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All technologies verified against official docs and npm, industry standard choices |
| Features | HIGH | Consistent patterns across competitor analysis, clear methodology alignment |
| Architecture | HIGH | Patterns verified against dnd-kit, Zustand, Dexie official documentation |
| Pitfalls | HIGH | Safari issues verified via WebKit blog, DnD issues via GitHub issues and community reports |

**Overall confidence:** HIGH

### Gaps to Address

- **Week transition semantics:** Research did not specify whether goals should auto-carry or require explicit action. Recommend: explicit user action aligned with Covey's weekly planning philosophy.

- **Multi-tab conflict resolution:** Identified as pitfall but no specific pattern researched. Recommend: investigate Web Locks API during Phase 6 planning.

- **Freestyle vs goal blocks:** Architecture shows both types but feature research focused on goal blocks. Recommend: clarify freestyle block requirements during Phase 5.

- **Role deletion with existing blocks:** Pitfall identified (orphaned blocks) but no pattern specified. Recommend: address in Phase 3 design.

## Sources

### Primary (HIGH confidence)
- [Next.js Documentation](https://nextjs.org/docs) - App Router, production patterns
- [dnd-kit Documentation](https://docs.dndkit.com) - Drag-drop architecture, hooks, collision detection
- [Dexie.js Documentation](https://dexie.org/) - IndexedDB wrapper, React hooks, schema versioning
- [Zustand Documentation](https://zustand.docs.pmnd.rs/) - State management patterns
- [WebKit Blog](https://webkit.org/blog/14403/updates-to-storage-policy/) - Safari storage eviction policy
- [MDN IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB) - API and limitations
- [WCAG 2.5.8](https://w3c.github.io/wcag/understanding/target-size-minimum.html) - Touch target requirements

### Secondary (MEDIUM confidence)
- [Sunsama Features](https://www.sunsama.com/features/guided-planning-and-reviews) - Competitor analysis
- [Week Plan](https://weekplan.net/) - Direct Covey competitor analysis
- [dnd-kit GitHub Discussions](https://github.com/clauderic/dnd-kit/discussions/809) - Complex patterns
- Community articles on IndexedDB pain points and Safari issues

### Tertiary (LOW confidence - needs validation)
- Week transition carryover patterns (aggregated from user forums)
- Role health visualization patterns (no direct competitor reference)

---
*Research completed: 2026-01-18*
*Ready for roadmap: yes*
