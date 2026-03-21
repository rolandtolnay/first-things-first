# First Things First

## What This Is

A personal life dashboard that starts with Covey-style role-based weekly planning. Users organize their life into roles, set weekly goals for each role, and schedule those goals as time blocks on a calendar. Currently replacing a manual Google Sheets workflow with a dedicated, interactive tool — with a longer-term vision of becoming a comprehensive personal control center for tasks, schedules, finances, deliveries, and email-driven action items.

## Core Value

Be the single place to answer "what do I do next?" by making the connection between life roles, weekly goals, and scheduled time explicit and actionable.

## Who It's For

Primarily the developer — someone who actively plans weeks around Stephen Covey's life roles and currently does it in Google Sheets. Finds that generic calendars and task apps don't model role-based planning. Wants one app to open multiple times a day on both desktop and phone to organize priorities, schedules, and responsibilities. Secondarily, other intentional planners who follow similar Covey-style frameworks.

## Core Problem

No single tool connects life roles to weekly goals to scheduled time in an interactive, purposeful way. Generic calendars organize by time, task apps organize by lists — neither models the role → goal → time block workflow that Covey's methodology requires. Google Sheets is functional but lacks interactivity, visual feedback, and the polish of a purpose-built tool.

## How It's Different

- Built around Covey's role-based planning model — not a generic calendar or task list
- Designed as a personal control center, not a team productivity tool
- Forces intentional weekly planning by design — no recurring templates, no AI auto-scheduling
- Local-first MVP with a path to cloud sync, not a SaaS product requiring signup to try

## Key User Flows

- Define life roles → set weekly goals per role → drag goals onto the calendar as time blocks
- Throughout the week, check priorities and scheduled blocks → mark items complete
- Create new week → optionally carry over uncompleted goals → start fresh planning cycle

## Out of Scope

- Team collaboration — solo planning tool, 10x complexity for teams
- AI auto-scheduling — removes intentionality central to Covey method
- Gamification/streaks — extrinsic motivation undermines habit formation
- Recurring goal templates — weekly planning should be intentional each week

## Deferred

- Mobile/tablet experience — deferred from v1, desktop-only for MVP
- Authentication (Google/Apple providers) and cloud persistence (Supabase) — deferred from v1, MVP uses IndexedDB
- Calendar integrations (Google/Apple Calendar sync and overlay) — deferred from v1
- Smart completion linking (complete once → marks all instances) — deferred from v1
- Configurable time range — deferred from v1, fixed 8:00–20:00
- Sharpen the Saw section — deferred from v1
- Multi-week analytics/reporting — deferred from v1, data model supports it
- In-app notifications for goal deadlines — deferred from v1
- Cross-device sync — requires auth + backend first
- Package delivery tracking module — future dashboard module
- Financial subscription calendar (LLM-parsed bank statements) — future dashboard module
- Email insights and action items module — future dashboard module

## Constraints

- **Tech stack**: Next.js 15 (React 19), TypeScript, Tailwind CSS v4
- **Deployment**: Vercel via vercel-cli
- **Platform**: Desktop only (1440px+ viewport) for v1
- **Persistence**: Browser-local only (IndexedDB via Dexie.js) for v1
- **Time range**: Fixed 8:00–20:00 + evening slot (not configurable in v1)

## Technical Context

**Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS v4, shadcn/ui components, Radix UI primitives, lucide-react icons.

**State management:** Zustand for global state (week data, UI state). Dexie.js with dexie-react-hooks for IndexedDB persistence. Optimistic updates in Zustand, async sync to IndexedDB.

**Drag-drop:** dnd-kit (core + sortable + utilities). Single DndContext at app root with data-driven drop handling. PointerSensor with 8px activation distance. Goals drag from sidebar to priorities/calendar/evening; blocks drag between all sections.

**Calendar:** Custom CSS Grid — not a calendar library. 30-minute slot granularity, 32px slot height. Absolute positioning for time blocks within day columns.

**Theming:** next-themes with attribute="class" for Tailwind dark mode. Light and dark mode from day one. JARVIS-inspired aesthetic (teal/cyan accents, clean geometry) planned for visual polish phase.

**Architecture:** Feature-based component structure under `src/components/`. Zustand stores in `src/lib/store/`. Database layer in `src/lib/db/`. Types in `src/types/`.

**Utilities:** date-fns for dates, nanoid for ID generation, cn() helper (clsx + tailwind-merge).

**Design direction:** Inspired by "Trigona JARVIS" design system — dark luxury aesthetic with teal/cyan accents, clean geometry, and HUD-style corner brackets. Will use `frontend-design` skill during Phase 9.

**Data model note:** Blocks track lineage (manual vs goal-based, originating role) to enable future analytics on role-based goal completion rates. Week snapshot model — each week is independent with its own roles and goals.

## Validated

- ✓ IndexedDB persistence with Dexie.js — Phase 1
- ✓ Week snapshot model (independent role/goal snapshots per week) — Phase 1
- ✓ Light/dark mode with next-themes — Phase 1
- ✓ Sidebar/calendar layout (25%/75% split) — Phase 2
- ✓ 7-day calendar grid with 30-min time slots (8:00–20:00) — Phase 2
- ✓ Day Priorities section and Evening slot — Phase 2
- ✓ Role CRUD with auto-assigned colors (8-color palette) — Phase 3
- ✓ Per-week independent role editing (snapshot model) — Phase 3
- ✓ Role color coding for visual scanning — Phase 3
- ✓ Goal CRUD within roles — Phase 4
- ✓ Goals with text and optional notes — Phase 4
- ✓ Drag goal from sidebar to Day Priorities — Phase 5
- ✓ Drag goal from sidebar to calendar (1hr default block) — Phase 5
- ✓ Same goal in multiple places as independent instances — Phase 5
- ✓ Drag blocks between days — Phase 5
- ✓ Block data model tracks type and role reference — Phase 5
- ✓ Cross-section drag-drop (calendar ↔ priorities ↔ evening) — Phase 5.1

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Independent completion model | Simpler to build, no sync logic between instances | — Pending |
| Week snapshot model (not global roles) | Matches Google Sheets mental model, allows historical accuracy | ✓ Good |
| No overlapping blocks | Reflects reality — you can only do one thing at a time | — Pending |
| Fixed time range (8:00–20:00 + evening) | Simplifies UI, evening slot handles late-day without extending grid | ✓ Good |
| Light + dark mode from start | Easier than retrofitting, matches design system philosophy | ✓ Good |
| Block stores role reference | Enables future analytics without schema migration | ✓ Good |
| Custom CSS Grid over calendar library | Calendar libraries built for events, not goal-to-block workflows | ✓ Good |
| Single DndContext with data-driven drops | Avoids nested context complexity, all drag logic centralized | ✓ Good |
| Zustand + Dexie (not Zustand persist) | Optimistic UI updates with durable IndexedDB persistence | ✓ Good |
| IndexedDB for v1 (not Supabase) | Ship faster, no backend dependency; auth + cloud sync deferred | — Pending |
| Personal dashboard vision | Role-based planning is first module; architecture should anticipate expansion | — Pending |

---
*Last updated: 2026-03-21 after template migration*
