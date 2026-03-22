# Phase 8: Week Navigation - Context

**Gathered:** 2026-03-22
**Status:** Ready for research

<vision>
## How This Should Work

When you open the app, you see the current calendar week — or if you haven't planned this week yet, you land on your most recent week with a gentle nudge to start planning. Browsing through past weeks feels like flipping through a planning journal — every week you've planned is there, exactly as you left it, fully editable.

Navigation is simple: arrows step through existing weeks, a "Today" button brings you back to the current week, and a "New Week" button kicks off the intentional planning ritual. Creating a new week is a deliberate moment — you're presented with uncompleted goals from last week grouped by role, all pre-selected, and you choose which ones to recommit to. Roles always carry over, schedules always start fresh.

The whole thing should feel like the app respects the weekly planning ritual. Starting a new week isn't just clicking "next" — it's opening a new chapter.

</vision>

<essential>
## What Must Be Nailed

- **Intentional week creation** — Creating a new week must feel deliberate, not automatic. The carryover dialog is the planning ritual moment where you consciously decide what carries forward.
- **Effortless navigation** — Arrow buttons between existing weeks + "Today" button to return. Muscle memory from every calendar app should work here.
- **Clear orientation** — When you open the app, you immediately know what week you're looking at and whether you need to start planning the current week.

</essential>

<specifics>
## Specific Ideas

- Navigation header lives above the calendar area only (right 75%), not full-width — sidebar stays independent
- Header contains: left/right arrows, date range label (e.g., "Mar 16–22"), "Today" button, "+New" button
- When current week doesn't exist, a highlighted banner appears below the header: "Plan this week?" with a [Start] button — visible but not blocking the last week's view
- Carryover dialog shows uncompleted goals as a checklist grouped by role with role color indicators, all pre-selected by default
- Two actions in carryover dialog: "Carry over selected" and "Start fresh"
- The dialog should NOT mention roles (they always carry over silently) — only frame the choice around goals

</specifics>

<notes>
## Additional Context

The data layer already supports most of this phase. Week navigation utilities (`getNextWeekId`, `getPreviousWeekId`, `formatWeekId`) exist. `loadWeek` auto-creates empty weeks — but this behavior needs to change since weeks should only be created through the intentional "New Week" flow.

Phase 7 (Completion Tracking) ships before this phase, so completion status will be available for identifying uncompleted goals in the carryover dialog.

Research showed that intentional planning tools (Sunsama, Akiflow) treat new week creation as a ritual, not a passive transition — which aligns perfectly with this product's Covey philosophy.

</notes>

<decisions>
## Decisions (Locked)

- Arrows only navigate between existing weeks (no auto-creation on navigate forward) — Why: keeps week history clean and intentional; every week in the system was deliberately created by the user
- App opens to the most recent existing week + banner prompt when current calendar week doesn't exist — Why: lets the user review last week before committing to a new one; the banner nudges without blocking
- Banner prompt below header ("Plan this week?" + Start button) triggers carryover dialog — Why: visible but non-intrusive; user can still browse last week before starting
- Carryover dialog uses checklist with goals grouped by role, all pre-selected — Why: preserves Covey-aligned intentionality of re-committing to each goal; more granular than binary yes/no without the overhead of a multi-step ritual
- Two actions: "Carry over selected" + "Start fresh" — Why: clean binary paths that respect the user's agency
- Navigation header above calendar area only (not full-width) — Why: sidebar is independent content; week navigation is a calendar concern
- Roles always carry over silently; dialog only mentions goals — Why: WEEK-06 requirement; mentioning roles in the dialog would confuse users into thinking they're optional
- Past weeks are fully editable (read/write) — Why: universal expectation; locking history would block review-and-learn workflows

### Claude's Discretion

- "Today" button behavior when current week doesn't exist (recommend: navigate to latest existing week, where the banner shows)
- First-ever app open with no weeks at all (recommend: auto-create current week without carryover dialog)
- Exact styling and animation of the banner prompt
- Arrow button disabled states at the edges (oldest/newest week)
- "This week" visual indicator when viewing the current week
- Date range format details in the header

</decisions>

<deferred>
## Deferred Ideas

- Date picker for jumping to arbitrary weeks (arrows + Today sufficient for MVP)
- Multi-step planning ritual (Sunsama-style journal + review ceremony)
- Week templates or recurring planning patterns
- Week-over-week analytics or comparison view

</deferred>

---

*Phase: 08-week-navigation*
*Context gathered: 2026-03-22*
