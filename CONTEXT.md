# First Things First Context

First Things First is a single-user weekly planner. This context fixes the product language around weeks, roles, goals, calendar slots, progress summaries, and the workspace UI so implementation work uses the same terms as the app.

## Language

### Planning model

**Week**:
A self-contained Monday-through-Sunday planning snapshot persisted as one document.
_Avoid_: board, calendar file, project.

**Day**:
One weekday column inside a Week, indexed Monday `0` through Sunday `6`.
_Avoid_: date cell, column.

**Slot**:
A 30-minute interval on a Day’s time grid, counted from the Week’s Day Bounds start; slot `0` is the day-start hour. Under the default 8:00–20:00 bounds, slot `0` is 8:00 and slot `23` is 19:30.
_Avoid_: row, cell, timeslot.

**Day Bounds**:
A Week’s planning-day window in whole hours (default 8:00–20:00, configurable 5:00–12:00 start and 16:00–24:00 end). Stored on the Week snapshot and carried into the Target Week at Weekly Handoff.
_Avoid_: working hours setting, grid range, office hours.

**Role**:
A durable life area or responsibility defined by a User, with a user-controlled default color and order used when planning Weeks.
_Avoid_: category, project, label.

**Role Snapshot**:
The Week-contained copy of a Role's name, color, and order used to preserve how that Week was planned and displayed historically.
_Avoid_: role instance, week role, role copy.

**Goal**:
A weekly objective belonging to exactly one Role Snapshot.
_Avoid_: task, todo, item.

**Day Priority**:
A priority item placed in a Day’s priorities list and linked to exactly one Goal.
_Avoid_: priority task, top task, todo.

**Time Block**:
A scheduled block placed on a Day’s Slot grid.
_Avoid_: event, appointment, calendar item.

**Evening Block**:
A single after-hours block attached to a Day outside the Slot grid (after the Day Bounds end hour).
_Avoid_: night slot, evening task, after-hours event.

**Freestyle Block**:
A Time Block or Evening Block with no linked Goal (`type: "freestyle"`, no `goalId`). It may carry an optional Role assignment for color coding and Weekly Balance without creating a Goal.
_Avoid_: free block, manual block, custom block.

**Freestyle Day Priority**:
A Day Priority with its own text and no linked Goal (`type: "freestyle"`). It may carry an optional Role assignment, completes independently, and counts toward Daily Streak like any Day Priority.
_Avoid_: loose task, imported goal, unassigned goal.

**Repeating Block**:
A Freestyle Block marked `recurrence: "weekly"`. Weekly Handoff copies Repeating Blocks into the Target Week with completion reset; nothing repeats into existing Weeks.
_Avoid_: recurring event, template block, series.

**Import Metadata**:
Calendar-event provenance and useful event details preserved on an imported Freestyle Day Priority or Freestyle Block (fingerprint, UID, original times, notes, location, URL, meeting link) that are not part of the planner’s visible text/time fields.
_Avoid_: sync state, provider cache, hidden event.

**Import Review**:
The selection screen produced by manual `.ics` import: candidates for the viewed Week classified as importable, update, skipped, conflict, or duplicate. Nothing persists until the User confirms.
_Avoid_: sync preview, staging area.

**Import Update**:
A re-imported entry whose UID (+ recurrence id) matches an already-imported item but whose time or title changed. Confirming it refreshes the planned item in place — completion, Role assignment, and recurrence survive.
_Avoid_: sync, merge, upsert.

**Undo**:
The toast-based restore of the most recent deletion (Day Priority, Time Block, Evening Block, or Goal with its cascade). Single-level, scoped to the Week the deletion happened in, and refused when planning integrity would break.
_Avoid_: rollback, revert, history.

### Weekly transition

**Source Week**:
The Week used as the starting point for a Weekly Handoff.
_Avoid_: last week, previous board.

**Target Week**:
The Week that will be created or replaced by a Weekly Handoff.
_Avoid_: destination board, output calendar.

**Weekly Handoff**:
The flow for starting a new Week: a Reflection step closing out the Source Week, then choosing the Target Week and deciding which unfinished Goals continue forward.
_Avoid_: reset wizard, migration, rollover.

**Reflection**:
The short free-text closing note written during Weekly Handoff (or edited later from the Rail), stored on the Source Week and never copied forward.
_Avoid_: journal, retro, review notes.

### Progress and summaries

**Weekly Balance**:
The Sidebar summary of planned hours by Role against the 40-hour weekly target.
_Avoid_: workload chart, capacity panel.

**Week Metrics**:
The Rail summary of planned hours, unfilled hours, and completed planning items for the current Week.
_Avoid_: stats, analytics, dashboard.

**Daily Streak**:
The Rail indicator for consecutive complete Days within the viewed Week.
_Avoid_: habit streak, rolling streak.

**Role Trends**:
The Rail’s small recent-weeks sparkline of planned hours per active Role, grouped by durable Role identity and shown with current Role display values.
_Avoid_: analytics dashboard, reports, insights.

**Donut**:
The SVG progress ring showing completed-of-total progress.
_Avoid_: PieChart, progress ring.

### Ownership and persistence

**User**:
An authenticated person who exclusively owns their Weeks.
_Avoid_: account, profile, tenant.

**Session**:
The authenticated browser state that proves the current User.
_Avoid_: login, token.

### Workspace UI

**Sidebar**:
The left workspace column containing Weekly Balance and Roles & Goals.
_Avoid_: left panel, nav, drawer.

**Rail**:
The right workspace column containing Week Metrics, Daily Streak, Role Trends, and the Week’s Reflection, collapsed by default to a 44px metrics dock and expandable to 304px.
_Avoid_: right sidebar, panel, aside.

**Today View**:
The phone-width companion surface: one Day’s priorities, schedule, and evening plan with completion toggles and quick freestyle-priority capture. It executes the plan; the seven-Day desktop workspace remains the planning surface.
_Avoid_: mobile app, day mode, agenda view.

**Section Label**:
A monospaced uppercase micro-label that names a workspace section.
_Avoid_: heading, title, header.

**App Actions**:
The compact global controls for theme and settings/session mounted in the week toolbar.
_Avoid_: window chrome, title bar controls.

**Accent**:
The single brand color used for filled emphasis, currently amber and driven by `--ds-accent-h`.
_Avoid_: primary color palette, highlight color.

## Relationships

- A **User** owns many **Roles** and many **Weeks**; each **Role** and **Week** belongs to exactly one **User**.
- A **Week** contains seven **Days**, many **Role Snapshots**, many **Goals**, many **Day Priorities**, many **Time Blocks**, up to seven **Evening Blocks**, its **Day Bounds**, and optionally a **Reflection**.
- A **Role Snapshot** belongs to exactly one **Role** and preserves that Role's planning display values for one **Week**.
- A newly created **Week** starts with Role Snapshots for the User's active Roles.
- **Roles** have user-controlled default order; **Role Snapshots** preserve the order used within each **Week**.
- A **User** cannot have two active Roles with the same name.
- Editing a **Role** while planning a **Week** updates that Role's defaults and the current **Week's** Role Snapshot; other existing Week snapshots remain historically unchanged.
- Deleting a **Role** while planning a **Week** archives the Role for future planning and removes that Role's Snapshot from the current Week; other existing Week snapshots remain historically unchanged.
- Restoring an archived **Role** reactivates the Role for future planning and adds a Role Snapshot to the current Week; if its name conflicts with an active Role, the restored Role receives a distinct name.
- A **Goal** belongs to exactly one **Role Snapshot**.
- A **Day Priority** is either goal-linked (references one **Goal**) or a **Freestyle Day Priority** (own text, optional **Role**); completion is independent from the Goal and from other instances.
- A **Time Block** or **Evening Block** may reference one **Goal**; each instance has completion independent from the Goal and from other instances.
- A **Time Block** occupies one or more contiguous **Slots** on exactly one **Day**.
- A **Day** cannot have overlapping **Time Blocks** on the same **Slots**.
- A **Day** has at most one **Evening Block**.
- A **Freestyle Block** or **Freestyle Day Priority** has no **Goal**; it may carry an optional **Role** assignment that affects color coding and **Weekly Balance** but never adds anything to the Sidebar goal list.
- Archiving a **Role** clears that Role's assignment from freestyle items in the current Week instead of deleting them.
- A **Repeating Block** must be a **Freestyle Block**; goal-linked blocks carry forward only through Goal selection in **Weekly Handoff**.
- **Weekly Balance** and **Week Metrics** count Time Blocks by slot duration and Evening Blocks as one fixed planned hour.
- Cross-week Role analytics group historical work by durable **Role** identity and use the Role's current display values for aggregate presentation; individual Week details may show historical Role Snapshots.
- A **Daily Streak** Day is complete only when it has at least one **Day Priority** and all of that Day’s Day Priorities are complete.
- A **Weekly Handoff** considers a **Goal** unfinished when the Goal itself is incomplete; Day Priority, Time Block, and Evening Block completion remain separate instance state.
- A **Weekly Handoff** creates or replaces a **Target Week** snapshot; it does not move Goals out of the **Source Week**.
- A **Weekly Handoff** carries the Source Week’s **Day Bounds** into the **Target Week**; the **Reflection** stays on the Source Week.
- Changing a Week’s **Day Bounds** re-indexes its Time Block Slots so wall-clock times are preserved, and is refused when a Time Block would fall outside the new window.
- A **Weekly Handoff** creates the Target Week's Role Snapshots from active Role defaults and carries selected unfinished Goals forward by Role identity; Goals under archived Roles are not carried forward. Day Priorities start empty; Time Blocks and Evening Blocks start empty except for **Repeating Blocks**, which are copied with completion reset (Role assignments survive only for still-active Roles).
- The **Sidebar** and expanded **Rail** frame the calendar; the collapsed **Rail** remains as a metrics dock.

### Manual calendar import relationships

- Manual `.ics` import targets only the currently viewed **Week** and persists nothing until the User confirms the **Import Review**.
- An **Import Update** matches by UID + recurrence id: a moved/resized event refreshes the planned item’s day and time; a title-only change defaults to unselected because it may collide with the User’s own rename; items converted to another surface are never auto-updated.
- Imported timed entries become unassigned **Freestyle Blocks** on the Slot grid; imported all-day entries become **Freestyle Day Priorities**.
- **Import Metadata** belongs only to imported **Freestyle Day Priorities** and imported **Freestyle Blocks**, and follows the item through conversions between planner surfaces.

## Example dialogue

> **Dev:** “If a User drags a Goal onto Tuesday at 10:30, are we moving the Goal?”
> **Domain expert:** “No — the Goal stays under its Role, and we create a Time Block instance for Tuesday’s Slot grid.”
>
> **Dev:** “If they complete that Time Block, should the Goal and Day Priority complete too?”
> **Domain expert:** “No — each Goal instance has independent completion; Daily Streak only looks at Day Priorities.”
>
> **Dev:** “Can Tuesday have two Evening Blocks?”
> **Domain expert:** “No — a Day has at most one Evening Block, so a second drop should snap back.”

## Flagged ambiguities

- “free block” vs “freestyle block” — same concept for scheduled blocks; **Freestyle Block** is canonical, and code uses `type: "freestyle"`.
- “freestyle priority” means **Freestyle Day Priority**, not a **Freestyle Block**; both are implemented, and Day Priority documents persisted before the split normalize to goal-linked on load.
- “Donut” vs “PieChart” — same component; **Donut** is canonical, while `PieChart` remains a legacy filename/import name.
- “right sidebar” vs “Rail” — **Rail** is canonical; it is collapsed by default but still the same right-side surface.
- “Slot height” vs “Slot duration” — a **Slot** is always 30 minutes; the current rendering scale is `SLOT_HEIGHT = 24` pixels.
- “Time constants” vs “layout constants” — `src/lib/time-model.ts` owns time-domain constants and conversions; `src/lib/constants.ts` owns layout sizes plus non-time product limits/targets such as `MAX_PRIORITIES_PER_DAY` and `WEEKLY_TARGET_HOURS`.
- “Daily Streak” is not a cross-week habit streak; it is scoped to the viewed Week only.
