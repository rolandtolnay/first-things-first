# Daily-execution milestone eval — "the plan survives contact with the day"

Falsifiable cases written **before** implementation (2026-07-19). Scope chosen by the User from the post-table-stakes proposal: **undo, Goal notes, import refresh, configurable day bounds, weekly reflection, role trends, mobile "today" companion**, plus fixing the pre-existing timezone-sensitive tests. Graded pass/fail against the real running local app (`npm run dev` + local Supabase, seeded `dev@example.com`) through the real auth path.

Criticality: **[C]** critical (must pass), **[N]** nice-to-strong (should pass; failures need a recorded reason).

## Persona

Same daily driver "R." as `etc/loop/table-stakes-eval.md`: 4–6 Roles, the app is their only scheduler, quality bar of a $50–200 product, primary browser Safari (automated verification runs in Chromium; flag Chromium-only reliance). New emphasis this milestone: what happens **inside a day that isn't going to plan** — and away from the desk.

## Verification notes

- Persistence claims require a **page reload** re-check; optimistic UI alone does not pass.
- dnd-limits and harness quirks from the table-stakes eval still apply (frozen CSS animations, `screenshot` may hang — use snapshots/eval).
- Store-level rules must have unit tests; the browser pass verifies the surfaced behavior.

## U. Undo (toast-based)

- **U1 [C]** Deleting a Time Block from its menu shows a toast naming the deletion with an **Undo** action; clicking Undo restores the block with identical id-relevant content: day, slot, duration, title, completion, role/goal link, recurrence, import metadata.
- **U2 [C]** Same for a Day Priority (text/goal link, order, completion, role) and an Evening Block.
- **U3 [C]** Deleting a Goal (after its confirm dialog) is undoable: the Goal **and** its cascaded Day Priorities and goal-linked blocks all return.
- **U4 [C]** Undo is single-level and most-recent-wins: two deletions then one Undo restores only the second; the toast for the first has been replaced or expired.
- **U5 [C]** The undone restore persists across reload (it recommits the Week).
- **U6 [C]** Undo never violates planning integrity: if the freed time span was reoccupied before Undo (create a new block over it first), Undo refuses with a calm visible message instead of overlapping; a Day never gains a second Evening Block via Undo.
- **U7 [C]** Undo is week-scoped: after navigating to a different Week the stale undo does not mutate the newly viewed Week.
- **U8 [N]** Other edits made between delete and Undo survive the Undo (restore re-adds the deleted items; it does not roll the whole Week back).

## G. Goal notes

- **GN1 [C]** A Goal with notes shows a subtle indicator in the Sidebar; opening its details (menu action or indicator) shows the notes.
- **GN2 [C]** Notes are editable in the details surface and persist across reload; clearing notes removes the indicator.
- **GN3 [C]** The details surface also lists where the Goal is placed this week (day priorities, scheduled blocks with day/time, evening) — or an honest empty state when unplaced.
- **GN4 [C]** Notes survive Weekly Handoff carry-forward (already-copied field — verify it shows on the carried Goal in the Target Week).
- **GN5 [N]** Notes UI composes from shared primitives/tokens, both themes, no layout shift on the goal row.

## IR. Import refresh (moved events)

- **IR1 [C]** Re-importing a file where a previously imported timed event **moved time** (same UID, different start/end) classifies that entry as an **update** (not duplicate, not new): the review row shows old → new time and defaults to selected.
- **IR2 [C]** Confirming applies the update in place: the existing Freestyle Block moves to the new day/slot/duration — no second block appears; the block keeps its completion state and any Role assignment; its import metadata refreshes (fingerprint, original times).
- **IR3 [C]** A title-only change also classifies as an update and updates the block's title in place.
- **IR4 [C]** Unchanged events with the same UID still classify as duplicates (skip by default); genuinely new UIDs still classify as importable — refresh never duplicates the plan.
- **IR5 [C]** An update whose new time is occupied by an unrelated block, or falls outside the week's day bounds / off 30-minute alignment, classifies as conflict/unsupported with a reason — the old block stays untouched.
- **IR6 [C]** Recurring events match per instance (UID + recurrence-id): moving one instance updates only that instance's block.
- **IR7 [N]** An update targeting an imported item that was **converted** to another surface (e.g. block → evening) is not silently applied; it is shown skipped with an honest reason.
- **IR8 [N]** All-day imported priorities support the same refresh (day/title change updates in place under the cap rules).

## DB. Configurable day bounds

- **DBo1 [C]** Settings offers "Day starts / Day ends" for the viewed Week (hour steps; sensible range ~5:00–12:00 start, ~16:00–24:00 end; start < end enforced). Default remains 8:00–20:00.
- **DBo2 [C]** Changing bounds re-renders the grid: correct hour labels, correct slot count, current-time line only within bounds, no layout breakage of priorities/evening sections. Existing blocks keep their **wall-clock times** (a 10:00 meeting stays at 10:00 after the day starts at 7:00).
- **DBo3 [C]** Narrowing bounds that would strand an existing block is **refused with a visible explanation** naming the conflict; nothing silently moves or deletes.
- **DBo4 [C]** Bounds persist on the Week snapshot across reload; other existing Weeks are unchanged (historical truth) — a past week still renders 8:00–20:00.
- **DBo5 [C]** Weekly Handoff carries the Source Week's bounds into the Target Week; a brand-new empty week (bootstrap path) uses the default 8:00–20:00.
- **DBo6 [C]** Scheduling honors bounds: draw/resize/move/drop clamp to the configured day; a 7:00 block can exist when the day starts at 7:00 and can't when it starts at 8:00.
- **DBo7 [C]** `.ics` import classifies against the viewed Week's bounds ("Outside the planner day" reason reflects the actual bounds), so a 7:00 gym session imports cleanly into a 7:00-start week.
- **DBo8 [N]** Week Metrics' Unfilled hours and Weekly Balance stay coherent with non-default bounds (no negative/absurd numbers).

## WR. Weekly reflection

- **WR1 [C]** Weekly Handoff opens with a reflection step: per-role recap of the Source Week (goals completed/total per role) plus a free-text field, customer-friendly copy, skippable without friction.
- **WR2 [C]** Continuing saves the reflection onto the **Source Week**; the handoff then proceeds through the existing carry-forward step unchanged (target selector, replace-week copy, repeat disclosure all intact).
- **WR3 [C]** The saved reflection is visible when viewing that week later (expanded Rail) and remains editable; it persists across reload; it is not copied onto the Target Week.
- **WR4 [C]** Cancelling the handoff at the carry step does not lose an entered reflection silently (it was saved at the step transition, or is preserved on reopen).
- **WR5 [N]** A week with no reflection shows no empty reflection chrome (intentional resting state).

## RT. Role trends

- **RT1 [C]** The expanded Rail shows a "Role trends" section: per active Role, a small recent-weeks trend of planned hours (blocks by slot duration + evening = 1h, matching Weekly Balance semantics), grouped by durable Role identity and labeled with the Role's current name/color.
- **RT2 [C]** The trend reflects reality: adding/removing an hour-long block in a viewed week changes that week's point after the data refreshes; weeks where the role has no hours read as zero, not gaps that shift the axis.
- **RT3 [C]** Trends are read-only planning support: no click-through analytics surface, no effect on the Week document.
- **RT4 [N]** Loading is lazy (fetch on Rail expand) and calm: no layout jank, an honest state when there's only one week of history.
- **RT5 [N]** A role archived mid-history doesn't crash trends; only active Roles are listed.

## MT. Mobile "today" companion

- **MT1 [C]** At a phone viewport (~390×844) the workspace becomes a single-day "Today" view (no 7-column grid, no horizontal overflow, no hidden-sidebar dead space); at ≥1025px the desktop workspace is unchanged.
- **MT2 [C]** The Today view shows the current day's priorities (with checkboxes), scheduled blocks in time order (with times and completion toggles), and the evening block; role colors carry over; empty sections read intentionally.
- **MT3 [C]** Completion toggles work and persist (verify via reload and via the desktop view showing the same state).
- **MT4 [C]** Day navigation: switch between the week's seven days (today highlighted); week navigation to prev/next week works or is deliberately scoped out with no broken affordance.
- **MT5 [C]** A freestyle Day Priority can be added from the Today view (respecting the 2-per-day cap with visible feedback at cap).
- **MT6 [C]** Auth works on mobile viewport: login page usable, magic-link flow lands on the Today view.
- **MT7 [N]** Touch targets ≥ ~44px for toggles/nav; both themes; no desktop hover-only affordances required to operate.
- **MT8 [N]** The Today view respects the week's configured day bounds and shows blocks with correct wall-clock labels.

## TZ. Timezone-sensitive tests

- **TZ1 [C]** The full suite passes under `TZ=America/New_York` (negative offset), `TZ=UTC`, and the host default (`Europe/…` positive offset).
- **TZ2 [C]** The fixes address root causes (deriving calendar days from `week.id` via `parseWeekId` or equivalent), not test-only assertions loosened to pass.

## X. Cross-cutting / regression

- **X1 [C]** Full test suite, lint, and production build pass.
- **X2 [C]** All new copy is customer-friendly (no "freestyle", "slot", "snapshot", "bounds" jargon in visible text); all new surfaces compose Dark Workspace tokens + shared primitives, verified in dark and light theme.
- **X3 [C]** Existing critical flows still work: goal → priority/block placement, block draw/resize, role assignment menus, weekly handoff carry + repeat disclosure, `.ics` first import (table-stakes eval A–J spot-check).
- **X4 [C]** Safari: the app loads and the highest-risk interactions work in real Safari — menus open/dismiss without stuck focus (including the Sunday-column role submenu spot-check left over from the last run), undo toast, reflection step, today view at narrow width.
- **X5 [N]** No new console errors during a normal planning session.

## How the tricky parts are demonstrated

- U6/IR5/DBo3: build the conflicting state first, then attempt the action, assert refusal copy and unchanged data (store tests + browser).
- IR1–IR6: committed fixture pairs (original + moved/renamed variants) generated relative to the viewed week via `scripts/make-import-fixtures.mjs`-style generation.
- DBo2/DBo6: unit tests on the parameterized time-model/scheduling; browser check of labels, draw floor at the first slot, and clamping at the last.
- MT1–MT6: agent-browser with mobile viewport emulation; Safari responsive-design mode for X4.
- RT1/RT2: seed at least three weeks with differing hours (handoff twice), then assert trend ordering/values.
