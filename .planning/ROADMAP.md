# Roadmap: First Things First

## Overview

Transform a manual Google Sheets weekly planning workflow into a dedicated web application implementing Stephen Covey's Habit 3 methodology. The journey progresses from data foundation through UI structure, then layer on interactivity (roles, goals, drag-drop, time blocks), add completion tracking and week navigation, and finish with visual polish. Each phase delivers a coherent, verifiable capability building toward a local-first planning tool where users connect life roles to weekly goals to scheduled time.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation & Data Layer** - Project scaffolding, IndexedDB persistence, week snapshot model
- [ ] **Phase 2: Layout & Calendar Grid** - Sidebar/calendar layout, 7-day view with time slots and evening section
- [ ] **Phase 3: Role Management** - Create, edit, delete roles with auto-assigned colors
- [ ] **Phase 4: Goal Management** - Create and manage goals within roles
- [ ] **Phase 5: Drag-Drop Integration** - Schedule goals via drag-drop to priorities and calendar
- [ ] **Phase 6: Time Block Interactions** - Resize, create freestyle blocks, overlap prevention
- [ ] **Phase 7: Completion Tracking** - Mark items complete with independent status per instance
- [ ] **Phase 8: Week Navigation** - Navigate weeks, create new weeks with carryover options
- [ ] **Phase 9: Visual Polish** - JARVIS aesthetic, typography refinement, design system integration

## Phase Details

### Phase 1: Foundation & Data Layer
**Goal**: Data layer works reliably with proper schema, enabling all future persistence
**Depends on**: Nothing (first phase)
**Requirements**: DATA-01, DATA-02, DSGN-01
**Success Criteria** (what must be TRUE):
  1. User opens app and any previously saved data appears (IndexedDB working)
  2. User can switch between light and dark mode with immediate visual change
  3. App survives browser restart without data loss
  4. Week data structure exists with roles array and independent snapshot capability
**Research**: Unlikely (Dexie.js setup well-documented)
**Plans**: TBD

Plans:
- [x] 01-01: Project scaffolding and dependencies
- [x] 01-02: Data layer with Dexie.js and Zustand stores
- [x] 01-03: Theme infrastructure with next-themes

### Phase 2: Layout & Calendar Grid
**Goal**: Calendar structure renders correctly with all time slots visible
**Depends on**: Phase 1
**Requirements**: LAYO-01, CALR-01, CALR-02, CALR-03, CALR-04, CALR-05
**Success Criteria** (what must be TRUE):
  1. User sees sidebar on left (~25%) and calendar on right (~75%)
  2. User sees all 7 days of the week simultaneously on 1440px+ viewport
  3. Each day shows Day Priorities section at top, time grid 8:00-20:00, and evening slot below
  4. Time slots display at 30-minute intervals
**Research**: Unlikely (CSS Grid patterns standard)
**Plans**: TBD

Plans:
- [ ] 02-01: Main layout structure with sidebar and calendar areas
- [ ] 02-02: Calendar grid with day columns and time slots
- [ ] 02-03: Day Priorities section and evening slot

### Phase 3: Role Management
**Goal**: Users can manage their life roles with visual color distinction
**Depends on**: Phase 2
**Requirements**: ROLE-01, ROLE-02, ROLE-03, ROLE-04, ROLE-05, DSGN-02
**Success Criteria** (what must be TRUE):
  1. User can create a new role by entering a name
  2. User can edit an existing role's name
  3. User can delete a role
  4. Each role displays with a distinct color from the palette
  5. Roles in one week do not affect roles in other weeks (snapshot model)
**Research**: Unlikely (standard CRUD operations)
**Plans**: TBD

Plans:
- [ ] 03-01: Role CRUD operations with color assignment
- [ ] 03-02: Role list UI in sidebar

### Phase 4: Goal Management
**Goal**: Users can create and organize goals within their roles
**Depends on**: Phase 3
**Requirements**: GOAL-01, GOAL-02, GOAL-07
**Success Criteria** (what must be TRUE):
  1. User can add multiple goals to any role
  2. Goals display with text and show optional notes when present
  3. User can delete a goal from the role column
**Research**: Unlikely (standard CRUD operations)
**Plans**: TBD

Plans:
- [ ] 04-01: Goal CRUD operations
- [ ] 04-02: Goal list UI within role sections

### Phase 5: Drag-Drop Integration
**Goal**: Goals can be scheduled via drag-drop from sidebar to calendar
**Depends on**: Phase 4
**Requirements**: GOAL-03, GOAL-04, GOAL-05, GOAL-06, BLCK-04
**Success Criteria** (what must be TRUE):
  1. User can drag a goal from role column and drop onto Day Priorities section
  2. User can drag a goal from role column and drop onto calendar, creating a 1-hour block
  3. Same goal can exist in role column, Day Priorities, and calendar simultaneously as independent instances
  4. User can drag a goal block from one day to another day
  5. Dropped blocks store their type (goal-based) and originating role reference
**Research**: Likely (complex dnd-kit patterns for goal-to-calendar and block-to-block moves)
**Research topics**: dnd-kit collision detection, multiple drop zones, data-driven drop handling
**Plans**: TBD

Plans:
- [ ] 05-01: DndContext provider and drag infrastructure
- [ ] 05-02: Drag from sidebar to Day Priorities
- [ ] 05-03: Drag from sidebar to calendar (block creation)
- [ ] 05-04: Drag blocks between days

### Phase 6: Time Block Interactions
**Goal**: Time blocks are fully interactive with resize and create capabilities
**Depends on**: Phase 5
**Requirements**: BLCK-01, BLCK-02, BLCK-03
**Success Criteria** (what must be TRUE):
  1. User can resize a block by dragging its edges in 30-minute increments
  2. User can create a freestyle block directly on calendar (not from a goal)
  3. System prevents placing or resizing blocks into occupied time slots
  4. Blocks respect minimum (30min) and maximum (8hr or end-of-day) duration limits
**Research**: Likely (resize handle implementation and collision detection edge cases)
**Research topics**: Pointer-based resize, collision validation on preview and commit
**Plans**: TBD

Plans:
- [ ] 06-01: Block resize functionality
- [ ] 06-02: Freestyle block creation
- [ ] 06-03: Overlap prevention and collision detection

### Phase 7: Completion Tracking
**Goal**: Users can track task completion with visual feedback
**Depends on**: Phase 6
**Requirements**: COMP-01, COMP-02, COMP-03
**Success Criteria** (what must be TRUE):
  1. User can mark any goal or block as completed
  2. Completed items show dark green background
  3. Completing a goal in role column does not affect same goal in calendar (independent)
  4. Completed items stay in their original location (not moved or hidden)
**Research**: Unlikely (UI state management patterns)
**Plans**: TBD

Plans:
- [ ] 07-01: Completion state and UI feedback
- [ ] 07-02: Independent completion per instance

### Phase 8: Week Navigation
**Goal**: Multi-week workflow is operational with navigation and week creation
**Depends on**: Phase 7
**Requirements**: WEEK-01, WEEK-02, WEEK-03, WEEK-04, WEEK-05, WEEK-06
**Success Criteria** (what must be TRUE):
  1. App opens to the current calendar week by default
  2. User can navigate to previous and future weeks using navigation arrows
  3. Previous weeks retain their data and remain editable
  4. User can create a new week via button with confirmation dialog
  5. New week dialog offers choice to carry over uncompleted goals or start fresh
  6. New week inherits roles but starts with empty schedule
**Research**: Likely (week transition carryover semantics)
**Research topics**: Week transition data flow, carryover decision handling
**Plans**: TBD

Plans:
- [ ] 08-01: Week navigation and current week display
- [ ] 08-02: New week creation with carryover dialog

### Phase 9: Visual Polish
**Goal**: App achieves distinctive JARVIS-inspired aesthetic with professional finish
**Depends on**: Phase 8
**Requirements**: DSGN-03, DSGN-04, DSGN-05
**Success Criteria** (what must be TRUE):
  1. App displays JARVIS-inspired aesthetic with teal/cyan accents and clean geometry
  2. Typography is prominent and readable with minimal visual clutter
  3. Design system is applied consistently across all components
  4. Both light and dark modes look polished and intentional
**Research**: Unlikely (design application, not architecture)
**Plans**: TBD

Plans:
- [ ] 09-01: Design system finalization with frontend-design skill
- [ ] 09-02: Component styling pass
- [ ] 09-03: Final polish and consistency audit

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7 -> 8 -> 9

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Data Layer | 3/3 | Complete | 2026-01-18 |
| 2. Layout & Calendar Grid | 0/3 | Not started | - |
| 3. Role Management | 0/2 | Not started | - |
| 4. Goal Management | 0/2 | Not started | - |
| 5. Drag-Drop Integration | 0/4 | Not started | - |
| 6. Time Block Interactions | 0/3 | Not started | - |
| 7. Completion Tracking | 0/2 | Not started | - |
| 8. Week Navigation | 0/2 | Not started | - |
| 9. Visual Polish | 0/3 | Not started | - |
