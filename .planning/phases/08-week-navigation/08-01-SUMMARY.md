---
phase: 08-week-navigation
plan: 01
subsystem: none
tags: [zustand, dexie, useLiveQuery, navigation, dialog, carryover, week-management]

requires:
  - phase: 07-completion-tracking
    provides: Goal completion state (completed boolean) used to filter uncompleted goals for carryover
provides:
  - Multi-week navigation with arrow buttons between existing weeks
  - Carryover dialog for intentional week creation with goal selection
  - Store-driven week lifecycle (separate load, navigate, create)
  - Banner prompt when current calendar week is unplanned
affects: [09-polish, future week templates, data export]

tech-stack:
  added: []
  patterns:
    - useLiveQuery reactive week index for auto-updating navigation
    - Native dialog element with showModal() for modal UX
    - Stale-request guard pattern for async navigation
    - Goal carryover with role name matching and fresh IDs

key-files:
  created:
    - src/components/calendar/WeekNavigation.tsx
    - src/components/calendar/CarryoverDialog.tsx
  modified:
    - src/stores/weekStore.ts
    - src/components/calendar/WeekView.tsx

key-decisions:
  - "Use useLiveQuery for reactive week ID list instead of manual cache invalidation"
  - "Native <dialog> with showModal() for carryover dialog (free focus trap, backdrop, Esc)"
  - "Stale-request guard in loadWeek checks selectedWeekId after async DB read"
  - "Goal carryover maps by role name match (source role -> new role with same name)"
  - "Standard HTML checkboxes in dialog instead of CompletionCheckbox (circular style is confusing for selection)"

patterns-established:
  - "Native dialog pattern: useRef + useEffect sync for controlled open/close, cancel event handler for Esc"
  - "Store-driven navigation: selectedWeekId in Zustand, loadWeek as pure data loader, navigateToWeek as coordinator"

mock_hints:
  transient_states:
    - state: "Loading state while navigating between weeks"
      component: "src/components/calendar/WeekView.tsx"
      trigger: "async call (db.weeks.get after navigateToWeek)"
    - state: "Dialog open/close animation"
      component: "src/components/calendar/CarryoverDialog.tsx"
      trigger: "dialog.showModal() / dialog.close()"
  external_data:
    - source: "IndexedDB weeks table"
      data_type: "Week IDs list for navigation, week data for carryover"
      components: ["src/components/calendar/WeekNavigation.tsx", "src/components/calendar/CarryoverDialog.tsx"]

duration: 3min
completed: 2026-03-22
---

# Phase 08 Plan 01: Week Navigation and Creation Summary

**Multi-week navigation with arrow buttons, carryover dialog, and store-driven week lifecycle using Zustand + useLiveQuery hybrid**

## Performance
- **Duration:** 3 min
- **Started:** 2026-03-22T12:15:24Z
- **Completed:** 2026-03-22T12:18:26Z
- **Tasks:** 4
- **Files modified:** 4

## Accomplishments
- Refactored weekStore to separate loading from creation, enabling navigation without auto-creating weeks
- Built complete multi-week workflow: arrow navigation, Today button, +New button, carryover dialog, and "Plan this week?" banner
- Implemented goal carryover with role name matching and fresh UUIDs to prevent cross-week references
- WeekView now auto-creates current week on first-ever use, or navigates to latest existing week on subsequent loads

## Task Commits
1. **Task 1: Refactor weekStore** - `dabba19` (refactor)
2. **Task 2: Create WeekNavigation** - `9af47af` (feat)
3. **Task 3: Create CarryoverDialog** - `46d9a13` (feat)
4. **Task 4: Integrate into WeekView** - `84c1332` (feat)

## Files Created/Modified
- `src/stores/weekStore.ts` - Added selectedWeekId, navigateToWeek with stale-request guard, createNewWeek with goal carryover
- `src/components/calendar/WeekNavigation.tsx` - Navigation header with arrows, Today, +New, and banner
- `src/components/calendar/CarryoverDialog.tsx` - Native dialog with grouped goal checkboxes and carry over/start fresh actions
- `src/components/calendar/WeekView.tsx` - Removed weekId prop, wired navigation and dialog, added initialization logic

## Decisions Made
- Used for-loop instead of map+filter for goal carryover to avoid TypeScript inference issues with optional `notes` field
- Standard HTML checkboxes used in CarryoverDialog instead of CompletionCheckbox (circular completion style is confusing in a selection context)
- Banner and +New button both trigger the same carryover dialog flow

## Deviations from Plan
None -- plan executed exactly as written.

## Issues Encountered
None

## User Actions Required
None -- no manual steps needed.

## Next Step
Ready for next plan or phase complete, ready for transition.
