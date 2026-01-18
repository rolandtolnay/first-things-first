# First Things First

## What This Is

A web-based weekly planning tool implementing Stephen Covey's Habit 3 ("Put First Things First") from *The 7 Habits of Highly Effective People*. Users organize their life into roles, set weekly goals for each role, and schedule those goals as time blocks on a calendar. Replaces a manual Google Sheets workflow with a dedicated, interactive tool.

## Core Value

Help users focus on what matters by making the connection between life roles, weekly goals, and scheduled time explicit and actionable.

## Requirements

### Validated

(None yet — ship to validate)

### Active

**Data & Persistence**
- [ ] Persist all data in browser database (IndexedDB) — survives restarts, no account required
- [ ] Week snapshot model — each week is independent, roles copied forward on new week creation

**Roles**
- [ ] Create, edit, delete roles (user-defined, ~7 typical)
- [ ] Auto-assigned colors from design system palette
- [ ] Roles editable per-week independently (snapshot, not global)

**Goals**
- [ ] Assign multiple goals per role per week
- [ ] Goals are text-based with optional notes
- [ ] Drag goal from role column to Day Priorities section (top area)
- [ ] Drag goal from role column to Day Schedule (creates 1hr default block)
- [ ] Same goal can appear in multiple places as independent instances

**Calendar View**
- [ ] Weekly view showing all 7 days simultaneously (desktop, 1440px+)
- [ ] Day Priorities section at top of each day (free-form, not time-bound)
- [ ] Time block schedule: fixed 8:00–20:00 range
- [ ] Evening slot below schedule (single block/goal capacity)
- [ ] 30-minute granularity for all blocks

**Time Blocks**
- [ ] Blocks resizable by dragging edges (30min increments, 30min–8hr range, or until end of day)
- [ ] Create freestyle blocks directly on calendar (not tied to goals)
- [ ] Blocks cannot overlap — validation on place/resize
- [ ] Block data model tracks: type (manual vs goal), role reference (if goal)

**Completion**
- [ ] Mark any block/goal as completed (background changes to dark green)
- [ ] Independent completion per instance (Role column, Day Priority, Day Schedule are separate)
- [ ] Completed items remain visible in place

**Week Management**
- [ ] Default view shows current week
- [ ] Week navigation arrows to view previous/future weeks
- [ ] Previous weeks display as user left them (read/write, not read-only)
- [ ] "New Week" button with confirmation dialog
- [ ] Dialog asks whether to carry over uncompleted goals
- [ ] Roles always carry over; scheduled blocks clear

**Visual Design**
- [ ] Light mode and dark mode from day one
- [ ] Design inspired by JARVIS dark tech aesthetic (teal/cyan accents, clean geometric style)
- [ ] Color coding by role for quick scanning
- [ ] Typography-forward, minimal clutter

### Out of Scope

- Mobile/tablet experience — desktop only for v1, revisit in v1.1
- Sharpen the Saw section — deferred to v1.1
- User accounts and authentication — local-only for MVP
- Calendar integrations (Google Calendar, etc.) — future consideration
- Recurring goal templates — future consideration
- Multi-week analytics/reporting — future (data model supports it)
- Smart completion linking (complete once → marks all instances) — v1.1
- Configurable time range — fixed 8:00–20:00 for v1
- Drag-and-drop between days (only role → day for v1)

## Context

**Origin**: User currently plans weeks in Google Sheets. Functional but lacks interactivity, dedicated UX, and the polish of a purpose-built tool.

**Methodology**: Based on Stephen Covey's time management matrix. Quadrant II (important but not urgent) activities drive long-term effectiveness. Roles represent areas of responsibility; goals are weekly commitments within those roles.

**Design direction**: Inspired by the "Trigona JARVIS" design system — dark luxury aesthetic with teal/cyan accents, clean geometry, and HUD-style corner brackets. Will use a `frontend-design` skill during planning to finalize the actual design system with both light and dark mode support.

**Data model note**: Blocks must track their lineage (manual vs goal, and which role) to enable future analytics on role-based goal completion rates.

## Constraints

- **Tech stack**: Next.js (React framework)
- **Deployment**: Vercel via vercel-cli
- **Platform**: Desktop only (1440px+ viewport), no mobile for v1
- **Persistence**: Browser-local only (IndexedDB), no backend/database
- **Time range**: Fixed 8:00–20:00 + evening slot (not configurable in v1)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Independent completion model | Simpler to build, no sync logic between instances | — Pending |
| Week snapshot model (not global roles) | Matches Google Sheets mental model, allows historical accuracy | — Pending |
| No overlapping blocks | Reflects reality — you can only do one thing at a time | — Pending |
| Fixed time range (8:00–20:00 + evening) | Simplifies UI, evening slot handles late-day without extending grid | — Pending |
| Light + dark mode from start | Easier than retrofitting, matches design system philosophy | — Pending |
| Block stores role reference | Enables future analytics without schema migration | — Pending |

---
*Last updated: 2026-01-18 after initialization*
