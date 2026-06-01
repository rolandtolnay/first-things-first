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
A 30-minute interval on a Day’s time grid from 8:00 to 20:00, where slot `0` is 8:00 and slot `23` is 19:30.
_Avoid_: row, cell, timeslot.

**Role**:
A weekly life area or responsibility that groups Goals and carries the color used for its scheduled work.
_Avoid_: category, project, label.

**Goal**:
A weekly objective belonging to exactly one Role.
_Avoid_: task, todo, item.

**Day Priority**:
A Goal instance placed in a Day’s priorities list.
_Avoid_: priority task, top task, todo.

**Time Block**:
A scheduled block placed on a Day’s Slot grid.
_Avoid_: event, appointment, calendar item.

**Evening Block**:
A single after-hours block attached to a Day outside the Slot grid.
_Avoid_: night slot, evening task, after-hours event.

**Freestyle Block**:
A Time Block or Evening Block with no linked Goal (`type: "freestyle"`, no `goalId`).
_Avoid_: free block, manual block, custom block.

**Source Week**:
The Week used as the starting point for a Weekly Handoff.
_Avoid_: last week, previous board.

**Target Week**:
The Week that will be created or replaced by a Weekly Handoff.
_Avoid_: destination board, output calendar.

**Weekly Handoff**:
The flow for starting a new Week by choosing the Target Week and deciding which unfinished Goals continue forward from the Source Week.
_Avoid_: reset wizard, migration, rollover.

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
The right workspace column containing Week Metrics and Daily Streak, collapsed by default to a 44px metrics dock and expandable to 304px.
_Avoid_: right sidebar, panel, aside.

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

- A **User** owns many **Weeks**; a **Week** belongs to exactly one **User**.
- A **Week** contains seven **Days**, many **Roles**, many **Goals**, many **Day Priorities**, many **Time Blocks**, and up to seven **Evening Blocks**.
- **Roles** have user-controlled order within each **Week**; **Weekly Handoff** carries that order into newly created or replaced **Target Week** snapshots.
- A **Goal** belongs to exactly one **Role**.
- A **Day Priority**, **Time Block**, or **Evening Block** may reference one **Goal**; each instance has completion independent from the Goal and from other instances.
- A **Time Block** occupies one or more contiguous **Slots** on exactly one **Day**.
- A **Day** has at most one **Evening Block**.
- A **Freestyle Block** has no **Goal**, but may still carry a **Role** for color and hour accounting.
- **Weekly Balance** and **Week Metrics** count Time Blocks by slot duration and Evening Blocks as one fixed planned hour.
- A **Daily Streak** Day is complete only when it has at least one Day Priority and all of that Day’s Day Priorities are complete.
- A **Weekly Handoff** considers a **Goal** unfinished when the Goal itself is incomplete; Day Priority, Time Block, and Evening Block completion remain separate instance state.
- A **Weekly Handoff** creates or replaces a **Target Week** snapshot; it does not move Goals out of the **Source Week**.
- A **Weekly Handoff** carries Roles and selected unfinished Goals forward; Day Priorities, Time Blocks, and Evening Blocks start empty in the Target Week.
- The **Sidebar** and expanded **Rail** frame the calendar; the collapsed **Rail** remains as a metrics dock.

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

- “free block” vs “freestyle block” — same concept; **Freestyle Block** is canonical, and code uses `type: "freestyle"`.
- “Donut” vs “PieChart” — same component; **Donut** is canonical, while `PieChart` remains a legacy filename/import name.
- “right sidebar” vs “Rail” — **Rail** is canonical; it is collapsed by default but still the same right-side surface.
- “Slot height” vs “Slot duration” — a **Slot** is always 30 minutes; the current rendering scale is `SLOT_HEIGHT = 24` pixels.
- “Time constants” vs “layout constants” — `src/lib/time-model.ts` owns time-domain constants and conversions; `src/lib/constants.ts` owns layout sizes plus non-time product limits/targets such as `MAX_PRIORITIES_PER_DAY` and `WEEKLY_TARGET_HOURS`.
- “Daily Streak” is not a cross-week habit streak; it is scoped to the viewed Week only.
