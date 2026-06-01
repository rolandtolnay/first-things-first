## Problem Statement

Users can create Roles in the Sidebar, but they cannot choose the order that best matches how they think about the Week. The app already treats Role order as part of the Week, but there is no direct visual interaction for changing it. Users need a simple way to reorder Roles, have that order survive refreshes and new sessions, and have the same order carry forward when they start the next Week.

## Solution

Add pointer drag-and-drop reordering for Roles in the Sidebar’s Roles & Goals section. A user drags a dedicated handle on a Role card to move it above or below other Roles. On drop, the Week’s Role order updates through the existing persistence path. Weekly Handoff carries the Source Week’s Role order into the Target Week when creating or replacing a Week.

This is a visual order change only: Goals remain attached to the same Roles, Role colors do not change, scheduled work does not move, and existing past/future Weeks are not retroactively modified.

## User Stories

1. As a planner, I want to drag a Role to a new position in the Sidebar, so that my Roles appear in the order that matches my current priorities.
2. As a planner, I want the reordered Roles to stay in that order after refresh or sign-in, so that I do not have to reorganize the same Week repeatedly.
3. As a planner, I want a new Week created from Weekly Handoff to keep the Source Week’s Role order, so that my preferred Role structure continues forward.
4. As a planner, I want reordering Roles to leave Goals, Role colors, planned Time Blocks, Day Priorities, and Evening Blocks unchanged, so that reordering is safe and purely visual.
5. As a planner, I want existing Role interactions to keep working while reordering is available, so that editing names, opening menus, adding Goals, checking Goals, deleting Goals, and dragging Goals to the calendar do not become unreliable.

## Implementation Decisions

- Role order remains a per-Week property. Reordering updates the current Week only.
- Other Weeks are not updated immediately. The order carries forward only when Weekly Handoff creates or replaces a Target Week from a Source Week.
- Weekly Handoff should sort carried Roles by Source Week Role order before cloning them into the Target Week, then normalize the Target Week’s Role order to contiguous values starting at zero.
- Role-to-Goal mapping during Weekly Handoff remains based on Role identity, not Role name or display position. Duplicate Role names remain valid.
- Dragging starts from a dedicated Role drag handle, not the whole Role card. This avoids conflicts with nested Goal dragging, Role name editing, checkboxes, menus, and add/delete controls.
- This pass is pointer-only for Role reordering. Keyboard reordering is out of scope.
- The implementation should use the existing drag-and-drop infrastructure and existing Week persistence path where practical, avoiding a separate preference store or global Role-order model.
- The Role reorder operation should receive a complete ordered list of Role identities. If validation/hardening is small, invalid or incomplete reorder payloads should be ignored rather than producing negative or ambiguous order values.
- Weekly Balance is not specially decoupled in this work. If it follows Role order because of existing behavior, that is acceptable until the planned Weekly Balance rework.
- No new ADR is needed. The work follows the existing Week snapshot and JSONB document persistence decisions.

## Testing Decisions

- Automated tests should focus on behavior at stable seams, not on drag implementation details.
- Add or update store tests proving that Role reorder persists the expected Role order and, if hardening is implemented, invalid reorder payloads do not corrupt order values.
- Add or update Weekly Handoff tests proving that Target Weeks inherit Source Week Role order even when the underlying Role array is not already in visual order.
- Weekly Handoff tests should include order gaps and duplicate Role names where useful, proving ordering is by Role order and Goal mapping remains by Role identity.
- Do not require automated component drag tests in this PRD. Drag-and-drop behavior should be verified manually in the browser.
- Manual verification should cover: drag Role above/below another Role, refresh and confirm persistence, create/replace a Target Week through Weekly Handoff and confirm order carries forward, drag a Goal to the calendar, edit a Role name, use Role menus, add a Goal, toggle/delete a Goal, and confirm the dedicated handle does not break hover-revealed menu behavior.

## Out of Scope

- Global Role order across all Weeks.
- Retroactively updating existing past or future Weeks outside Weekly Handoff replacement.
- Keyboard-accessible Role reordering.
- Reordering Goals within a Role.
- Moving Goals between Roles.
- Changing Role colors during reorder.
- Reworking Weekly Balance ordering or presentation.
- Adding a new normalized Role persistence model or user-level preference table.

## Further Notes

The project glossary now records that Roles have user-controlled order within each Week and that Weekly Handoff carries that order into newly created or replaced Target Week snapshots.

The highest implementation risk is interaction overlap in the Sidebar: Role cards already contain editable text, nested draggable Goals, checkboxes, hover-revealed menus, context menus, dialogs, and add controls. The dedicated handle and browser verification are load-bearing for keeping the feature reliable.
