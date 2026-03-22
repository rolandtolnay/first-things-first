# Phase 7: Completion Tracking - Context

**Gathered:** 2026-03-22
**Status:** Ready for planning

<vision>
## How This Should Work

Throughout the day, as you work through your planned schedule, you can mark items complete right where they are. Every goal, time block, priority, and evening block has a small circle/checkbox that's always visible — no hunting for menus or hidden actions. Click the circle, it fills with a checkmark, and the item shifts to a green-tinted, slightly faded appearance. You can immediately see what's done and what's still pending by scanning the calendar.

The key feeling is: your calendar tells you at a glance how your day is going. Completed items recede visually (lower opacity) so your eye naturally lands on what's still ahead. But they stay right where they are — you can review what you accomplished at the end of the week without anything disappearing.

Each instance is independent. Completing a goal in the sidebar doesn't affect the same goal scheduled as a time block on Tuesday. This matches reality — you might set a goal of "exercise" and schedule it three times, completing some but not all.

</vision>

<essential>
## What Must Be Nailed

- **Instant, satisfying toggle** — clicking the checkbox should feel immediate with clear visual feedback. This is the core interaction loop of weekly planning.
- **At-a-glance scanning** — completed vs pending must be distinguishable in under a second when looking at a full day or the whole week.
- **Zero interaction conflicts** — the checkbox must not interfere with drag-and-drop, double-click-to-edit, or hover-reveal delete. Each interaction has its own clear target.

</essential>

<specifics>
## Specific Ideas

- Always-visible circle/checkbox on every completable item (goals in sidebar, time blocks, day priorities, evening blocks)
- Completed state: green-tinted background + ~60% opacity + checkmark replacing the empty circle
- Role-color left border stays even when completed — preserves role scanning value
- Green replaces only the background tint, not the role-color border

</specifics>

<notes>
## Additional Context

The data model is already prepared — `completed` boolean fields exist on Goal, TimeBlock, DayPriority, and EveningBlock. `toggleGoalCompleted` is already in weekStore. The `--success` color token exists in the theme. This phase is primarily about surfacing existing state visually and adding toggle methods for the remaining item types.

</notes>

<decisions>
## Decisions (Locked)

- Always-visible checkbox (circle/checkmark) on all item types — Why: clear affordance with zero conflict with existing drag/edit/delete interactions, each has a distinct click target
- Completed visual: green background + ~60% opacity + checkmark icon — Why: opacity fade naturally draws the eye to pending items while keeping completed items readable for weekly review
- Role-color left border preserved on completed items — Why: user scans by role color throughout the week; losing it on completion would break the scanning workflow
- Independent completion per instance (no cross-instance sync) — Why: matches reality of scheduling the same goal multiple times; simpler to build; smart linking explicitly deferred to v2

### Claude's Discretion

- Exact checkbox size, style, and positioning within each item type
- Specific green shade and opacity values (use `--success` token as starting point)
- Animation/transition details for the toggle interaction
- Whether checkbox is a circle or square (lean toward circle for visual consistency)

</decisions>

<deferred>
## Deferred Ideas

- Smart completion linking (complete once marks all instances) — explicitly deferred to v2 (ACOMP-01)
- Progress indicators or completion percentages per role/day — future analytics work
- Completion history or undo — not in scope for this phase

</deferred>

---

*Phase: 07-completion-tracking*
*Context gathered: 2026-03-22*
