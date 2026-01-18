# Requirements: First Things First

**Defined:** 2026-01-18
**Core Value:** Help users focus on what matters by making the connection between life roles, weekly goals, and scheduled time explicit and actionable.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Data & Persistence

- [ ] **DATA-01**: User's data persists in browser database (IndexedDB) — survives restarts, no account required
- [ ] **DATA-02**: Week operates on snapshot model — each week is independent, roles copied forward on new week creation

### Layout

- [ ] **LAYO-01**: Main view displays roles/goals sidebar on left (~25% width) and calendar on right (~75% width)

### Roles

- [ ] **ROLE-01**: User can create a new role with a name
- [ ] **ROLE-02**: User can edit an existing role's name
- [ ] **ROLE-03**: User can delete a role
- [ ] **ROLE-04**: Role receives auto-assigned color from design system palette
- [ ] **ROLE-05**: Roles are editable per-week independently (snapshot, not global)

### Goals

- [ ] **GOAL-01**: User can assign multiple goals to a role for the current week
- [ ] **GOAL-02**: Goals support text content with optional notes
- [ ] **GOAL-03**: User can drag goal from role column to Day Priorities section
- [ ] **GOAL-04**: User can drag goal from role column to Day Schedule (creates 1hr default block)
- [ ] **GOAL-05**: Same goal can appear in multiple places as independent instances
- [ ] **GOAL-06**: User can drag goal blocks between days for reorganizing
- [ ] **GOAL-07**: User can delete a goal instance from any location (role column, priorities, or calendar)

### Calendar

- [ ] **CALR-01**: Weekly view shows all 7 days simultaneously (desktop, 1440px+)
- [ ] **CALR-02**: Each day has a Day Priorities section at top (free-form, not time-bound)
- [ ] **CALR-03**: Time block schedule displays fixed 8:00–20:00 range
- [ ] **CALR-04**: Evening slot appears below schedule (single block/goal capacity)
- [ ] **CALR-05**: All time operations use 30-minute granularity

### Time Blocks

- [ ] **BLCK-01**: Blocks are resizable by dragging edges (30min increments, 30min–8hr range, or until end of day)
- [ ] **BLCK-02**: User can create freestyle blocks directly on calendar (not tied to goals)
- [ ] **BLCK-03**: Blocks cannot overlap — validation prevents placement/resize into occupied time
- [ ] **BLCK-04**: Block data model tracks: type (manual vs goal-based) and role reference (if goal-based)

### Completion

- [ ] **COMP-01**: User can mark any block/goal as completed (background changes to dark green)
- [ ] **COMP-02**: Completion is tracked independently per instance (role column, day priority, and schedule are separate)
- [ ] **COMP-03**: Completed items remain visible in their original location

### Weeks

- [ ] **WEEK-01**: Default view shows current week
- [ ] **WEEK-02**: User can navigate to previous/future weeks using navigation arrows
- [ ] **WEEK-03**: Previous weeks display as user left them (read/write, not read-only)
- [ ] **WEEK-04**: "New Week" button triggers confirmation dialog
- [ ] **WEEK-05**: New week dialog asks whether to carry over uncompleted goals
- [ ] **WEEK-06**: Roles always carry over to new week; scheduled blocks clear

### Design

- [ ] **DSGN-01**: App supports light mode and dark mode from launch
- [ ] **DSGN-02**: Blocks and goals are color-coded by role for quick scanning
- [ ] **DSGN-03**: Visual design follows JARVIS-inspired aesthetic (teal/cyan accents, clean geometric style)
- [ ] **DSGN-04**: Typography-forward, minimal clutter design approach
- [ ] **DSGN-05**: Design system informed by `design-system-example` reference, using `frontend-design` skill during implementation

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Notifications

- **NOTF-01**: User receives in-app notifications for goal deadlines
- **NOTF-02**: User can configure notification preferences

### Mobile

- **MOBL-01**: Responsive layout for tablet/mobile viewports
- **MOBL-02**: Touch-optimized interactions

### Integrations

- **INTG-01**: Read-only calendar overlay showing external events
- **INTG-02**: Optional cloud sync for cross-device access

### Advanced Completion

- **ACOMP-01**: Smart completion linking (complete once -> marks all instances)

### Advanced Time

- **ATIME-01**: Configurable time range (not fixed 8:00-20:00)
- **ATIME-02**: Drag-and-drop between days for existing scheduled blocks

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| User accounts/authentication | Local-only for MVP, privacy differentiator |
| Calendar integrations (Google Calendar sync) | Complex sync logic, bidirectional conflicts |
| Recurring goal templates | Weekly planning should be intentional each week |
| Multi-week analytics/reporting | Future consideration, data model supports it |
| Sharpen the Saw section | Deferred to v1.1 |
| Mobile/tablet experience | Desktop-only for v1 |
| Team collaboration | Solo planning tool, 10x complexity for teams |
| AI auto-scheduling | Removes intentionality central to Covey method |
| Gamification/streaks | Extrinsic motivation undermines habit formation |

## Traceability

Which phases cover which requirements. Updated by create-roadmap.

| Requirement | Phase | Status |
|-------------|-------|--------|
| DATA-01 | Phase 1 | Pending |
| DATA-02 | Phase 1 | Pending |
| DSGN-01 | Phase 1 | Pending |
| LAYO-01 | Phase 2 | Pending |
| CALR-01 | Phase 2 | Pending |
| CALR-02 | Phase 2 | Pending |
| CALR-03 | Phase 2 | Pending |
| CALR-04 | Phase 2 | Pending |
| CALR-05 | Phase 2 | Pending |
| ROLE-01 | Phase 3 | Pending |
| ROLE-02 | Phase 3 | Pending |
| ROLE-03 | Phase 3 | Pending |
| ROLE-04 | Phase 3 | Pending |
| ROLE-05 | Phase 3 | Pending |
| DSGN-02 | Phase 3 | Pending |
| GOAL-01 | Phase 4 | Pending |
| GOAL-02 | Phase 4 | Pending |
| GOAL-07 | Phase 4 | Pending |
| GOAL-03 | Phase 5 | Pending |
| GOAL-04 | Phase 5 | Pending |
| GOAL-05 | Phase 5 | Pending |
| GOAL-06 | Phase 5 | Pending |
| BLCK-04 | Phase 5 | Pending |
| BLCK-01 | Phase 6 | Pending |
| BLCK-02 | Phase 6 | Pending |
| BLCK-03 | Phase 6 | Pending |
| COMP-01 | Phase 7 | Pending |
| COMP-02 | Phase 7 | Pending |
| COMP-03 | Phase 7 | Pending |
| WEEK-01 | Phase 8 | Pending |
| WEEK-02 | Phase 8 | Pending |
| WEEK-03 | Phase 8 | Pending |
| WEEK-04 | Phase 8 | Pending |
| WEEK-05 | Phase 8 | Pending |
| WEEK-06 | Phase 8 | Pending |
| DSGN-03 | Phase 9 | Pending |
| DSGN-04 | Phase 9 | Pending |
| DSGN-05 | Phase 9 | Pending |

**Coverage:**
- v1 requirements: 38 total
- Mapped to phases: 38
- Unmapped: 0

---
*Requirements defined: 2026-01-18*
*Last updated: 2026-01-18 after roadmap creation*
