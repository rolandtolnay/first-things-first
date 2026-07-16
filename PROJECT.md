# First Things First

> **For future runs:** when a product choice is not answered here, favor the Core Value for the people in Who It’s For, within Constraints, then record the decision here. A feature PRD describes intended scoped work; it does not prove that the feature ships.

## What This Is

First Things First is a private, single-user weekly planner inspired by Stephen Covey’s Habit 3, “Put First Things First.” It connects durable life Roles to weekly Goals, Day Priorities, and scheduled Time Blocks so a User can turn stated priorities into a realistic Week.

## Core Value

Make the relationship between what matters, what the User intends to accomplish this Week, and where their time will go unmistakable and actionable.

When requirements conflict, protect deliberate weekly planning over task volume, automation, analytics, or feature breadth.

## Who It’s For

An individual who plans across several life responsibilities—often in a spreadsheet or calendar—and wants a focused weekly ritual rather than another general-purpose task manager. They value seeing the whole Week, balancing Roles, and deciding explicitly what deserves time.

## Core Problem

Spreadsheets expose the whole Week but are cumbersome to edit and use across devices. Calendars show commitments but not why they matter. Task managers collect work but rarely connect life Roles, weekly outcomes, and allocated time in one planning surface.

## How It’s Different

- **Roles → Goals → time:** the product keeps purpose, weekly outcomes, and scheduled effort visible together.
- **A Week is a plan snapshot:** historical Weeks preserve how they were planned instead of drifting with current defaults.
- **Planning stays explicit:** Weekly Handoff, scheduling, and any future import flow keep the User in control rather than silently carrying, assigning, or moving work.
- **One focused workspace:** the primary experience is a dense seven-Day desktop view, not a generic project hierarchy or analytics dashboard.

## Key User Flows

- Sign in by magic link and open the most relevant saved Week.
- Create, rename, reorder, archive, and restore durable Roles from the Sidebar.
- Define weekly Goals under Role Snapshots.
- Place Goals into Day Priorities, Time Blocks, or Evening Blocks and add Freestyle Blocks when needed.
- Review Weekly Balance, Week Metrics, and the current Week’s Daily Streak while planning.
- Start a Target Week through Weekly Handoff, deliberately carrying selected unfinished Goals from the viewed Source Week.
- Return on another device and continue from the same private cloud-backed plan.

## Scope Boundaries

### Current product baseline

- Passwordless User authentication and private cloud persistence.
- Durable Roles with historical Role Snapshots in each Week.
- Weekly Goals, Day Priorities, Time Blocks, Evening Blocks, completion state, drag-and-drop scheduling, and Weekly Handoff.
- Desktop-first seven-Day workspace with Sidebar, calendar, and collapsible Rail.

### Not part of the current shipped baseline

- Manual ICS import and Freestyle Day Priorities are designed in `etc/prd/manual-ics-calendar-import.md` but are not implemented.
- Sharpen the Saw and a dedicated mobile single-Day experience appear in the original brief but are not implemented. They require an explicit goal and current product decision before work begins.

## Out of Scope by Default

- Collaboration, sharing, teams, or multiple Users editing one plan—the product is privately owned by one User.
- A generic inbox, project manager, or unbounded task system—Goals stay weekly and Role-based.
- Live calendar-provider connections, background sync, or provider credentials—calendar ingestion, if pursued, starts as explicit reviewed import.
- Offline-first synchronization or conflict resolution—the current product is online-first and last-write-wins.
- Automatic stale-Goal scoring, smart carryover, or silent schedule changes—planning decisions remain visible and reversible.
- Cross-week analytics as a primary product surface—summaries should support planning, not turn the product into a reporting tool.

## Constraints

- **Planning integrity:** a Day cannot contain overlapping Time Blocks, and a Day has at most one Evening Block.
- **Historical truth:** edits to durable Role defaults affect the current Week and future Week creation, not unrelated historical Role Snapshots.
- **Privacy:** Supabase Row Level Security is the data boundary; a User must only see their own Roles and Weeks.
- **Fast interaction:** optimistic updates should keep editing and scheduling responsive; persistence failures must never be silent.
- **Desktop first:** preserve the legibility of all seven Days on the primary wide-screen workspace. Narrower layouts may reduce surrounding surfaces before redesigning the planning model.
- **Design coherence:** use the Dark Workspace token system and shared shadcn/Radix primitives rather than one-off visual or interaction languages.
- **Explicit external effects:** building or verifying locally does not authorize production mutation, deployment, release, messaging, or commits.

## Default Judgments

- Prefer a smaller complete weekly-planning flow over an adjacent feature or speculative abstraction.
- Prefer explicit User review over automatic import, carryover, assignment, or conflict resolution.
- Prefer preserving a Week’s historical snapshot over propagating current defaults backward.
- Prefer customer-friendly UI copy over internal domain jargon; keep canonical domain terms in code and technical docs.
- Prefer behavior tests around pure rules and persistence boundaries; verify interaction and visual quality in the real browser.
- Prefer graceful recovery and visible errors over silently dropping or “fixing” User planning data.

## Technical Context

- Next.js 16, React 19, TypeScript, Zustand, dnd-kit, Tailwind CSS 4, and shadcn/Radix UI.
- Supabase Auth and Postgres are the online source of truth. The browser accesses Supabase directly under RLS.
- Weeks persist as JSONB documents; durable Roles are selectively normalized. See ADR-0003 through ADR-0005.
- Vercel is the production hosting environment; local development uses the local Supabase stack only.

## Key Product Decisions

| Decision | Rationale | Outcome |
|---|---|---|
| Goals and their placed instances have independent completion | Planning an outcome, scheduling it, and completing a specific placement are distinct facts | Implemented |
| Weekly Handoff carries only explicitly selected unfinished Goals into active Roles | Keeps weekly transition intentional and avoids hidden lineage or stale-work heuristics | Implemented |
| Existing Target Weeks may be replaced only with clear outcome copy | Replacement is useful but must not be surprising | Implemented |
| Role identity is durable while each Week preserves Role display snapshots | Supports stable defaults and future aggregation without rewriting history | Implemented |
| The primary experience is the seven-Day desktop workspace | Whole-Week visibility is the product’s main advantage over mobile/task-list tools | Implemented |
| Dark Workspace is the default visual language, with light mode available | Provides a focused, coherent planning environment without replacing accessible primitives | Implemented |
| Calendar import, if built, begins as local `.ics` review rather than live sync | Preserves privacy and explicit planning control while avoiding provider complexity | Planned; not implemented |

---
*Last updated: 2026-07-16 — goal-driven project foundation established from the live code, ADRs, PRDs, and original brief.*
