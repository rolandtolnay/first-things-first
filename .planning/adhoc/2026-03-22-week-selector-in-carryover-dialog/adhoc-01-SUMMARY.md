---
phase: adhoc
plan: 01
subsystem: [ui, weeks]
tags: [react, dexie, dropdown, week-selector, dialog, tailwind]

requires:
  - phase: 08-week-navigation
    provides: WeekNavigation patterns, useLiveQuery for week index, formatWeekId utility
provides:
  - Custom WeekSelector dropdown component for target week selection
  - getWeekNumber and getWeekIdRange utility functions
  - CarryoverDialog with user-selectable target week and overwrite warning
affects: [visual-polish, future-carryover-enhancements]

tech-stack:
  added: []
  patterns: [custom-dropdown-with-outside-click, smart-default-selection-scan]

key-files:
  created:
    - src/components/calendar/WeekSelector.tsx
  modified:
    - src/lib/utils.ts
    - src/components/calendar/CarryoverDialog.tsx
    - src/components/calendar/WeekView.tsx

key-decisions:
  - "Custom dropdown instead of native <input type='week'> for cross-browser consistency"
  - "Default target scans forward from viewed week to find first unplanned week, wraps around if needed"
  - "Dexie .put() upsert means no persistence changes needed for overwriting existing weeks"
  - "Amber color tokens for overwrite warning to distinguish from error states"

patterns-established:
  - "WeekSelector: reusable custom dropdown with outside-click and Escape close, Planned badge marking"
  - "getWeekIdRange: utility for generating consecutive WeekId arrays without component-level loop logic"
  - "Smart default scan: scan from next-after-viewed through range, wrap to beginning if needed"

mock_hints:
  transient_states:
    - state: "Dropdown open/close toggle"
      component: "src/components/calendar/WeekSelector.tsx"
      trigger: "click toggle"
    - state: "Overwrite warning appears/disappears based on selection"
      component: "src/components/calendar/CarryoverDialog.tsx"
      trigger: "onChange from WeekSelector"
  external_data:
    - source: "Dexie IndexedDB weeks table"
      data_type: "WeekId[] (existing week primary keys)"
      components: ["src/components/calendar/CarryoverDialog.tsx"]

duration: 3min
completed: 2026-03-22
---

# Adhoc Plan 01: Week Selector in Carryover Dialog Summary

**Custom week selector dropdown in CarryoverDialog with smart default (next unplanned week), planned-week badges, and amber overwrite warning**

## Performance
- **Duration:** 3 min
- **Started:** 2026-03-22T13:04:32Z
- **Completed:** 2026-03-22T13:07:48Z
- **Tasks:** 4
- **Files modified:** 4

## Accomplishments
- CarryoverDialog now lets users choose which week to create via a custom dropdown instead of hardcoding getCurrentWeekId()
- Smart default selection scans forward from the currently viewed week to find the first unplanned week
- Already-planned weeks are visually marked with a "Planned" badge in the dropdown
- Selecting an already-planned week shows an amber overwrite warning before the user commits

## Task Commits
1. **Task 1: Add getWeekNumber and getWeekIdRange utilities** - `f0f7c5a` (feat)
2. **Task 2: Create WeekSelector component** - `9d0ef90` (feat)
3. **Task 3: Add week selector and overwrite warning to CarryoverDialog** - `fe036ad` (feat)
4. **Task 4: Pass viewedWeekId from WeekView to CarryoverDialog** - `285351f` (feat)

## Files Created/Modified
- `src/lib/utils.ts` - Added getWeekNumber(weekId) and getWeekIdRange(startWeekId, count) utilities
- `src/components/calendar/WeekSelector.tsx` - New custom dropdown component with "Wxx -- date range" format, Planned badges, outside-click/Escape close
- `src/components/calendar/CarryoverDialog.tsx` - Added viewedWeekId prop, WeekSelector integration, useLiveQuery for existing weeks, smart default computation, amber overwrite warning
- `src/components/calendar/WeekView.tsx` - Passes selectedWeekId as viewedWeekId prop to CarryoverDialog

## Decisions Made
- Used custom dropdown instead of native `<input type="week">` because native week inputs render inconsistently across browsers
- Default target week scans forward from getNextWeekId(viewedWeekId) through the range, wraps around to beginning if all remaining are planned, falls back to first in range if all planned
- Overwrite warning uses amber color tokens (bg-amber-500/10, border-amber-500/30) to differentiate from error states
- Dropdown range is 11 weeks (current calendar week + 10 future) to give reasonable planning horizon without overwhelming

## Deviations from Plan
None -- plan executed exactly as written.

## Issues Encountered
None

## User Actions Required
None -- no manual steps needed.

## Next Step
Ready for UAT testing of the week selector flow.
