# Goal log

Append one entry per autonomous goal. Never rewrite past verdicts. Put product decisions in `PROJECT.md`, domain terms in `CONTEXT.md`, and implementation decisions in `docs/decisions.md` or an ADR.

Retain compact decision-relevant proof under `docs/goal-evidence/<goal-id>/`. Keep secrets, real User data, build caches, browser auth state, and bulky transient logs out of Git; distill relevant facts here.

## 2026-07-16 — Bootstrap the goal-driven project foundation

**Goal and outcome**

Install and adapt a complete repository-local operating system so a cold autonomous run can discover First Things First’s product intent, use its domain language, execute and verify safely, leave durable evidence, and stop only at `GOAL MET` or explicit `[blocked]`.

**Working-tree baseline**

- Initial `git status --short`: clean (no output)
- Pre-existing changes and ownership: none
- Overlap risk: none

**Assumptions and defaults**

- Classified as **Complete**: `CONTEXT.md`, ADRs, PRDs, setup docs, and detailed agent guidance existed; `PROJECT.md`, the run record, evidence policy, playbook, judge contract, and goal-writing guide did not.
- The live code, migrations, and completed ADRs supersede stale technical assumptions in the original `BRIEF.md`.
- Existing hard-won instructions should be preserved but routed to their single owning document instead of duplicated.

**Persona, flow, and guardrails**

- Persona and moment: a cold autonomous coding run entering the repository with only a goal prompt
- Start state: repository root with no prior chat context
- End state: the run can find product intent, domain terms, decisions, setup facts, method, history, evidence policy, and the next safe action
- Confusions to kill: original brief versus live product; intended PRD versus shipped feature; local build versus production authority; transient output versus retained evidence
- Guardrails: preserve domain/ADR knowledge; do not modify product behavior, production state, secrets, or unrelated files; do not commit

**Rubric**

1. Every foundation path exists, has one clear responsibility, and contains no template placeholders.
2. Commands and product-driving surfaces match repository configuration and the local Supabase workflow.
3. Source precedence, working-tree protection, blocker policy, evidence retention, fresh judging, model economy, and external-mutation boundaries are explicit.
4. A fresh cold-start reviewer can follow the route without this conversation and finds no conflicting product terminology or broken links.

**Implementation summary**

- Added `PROJECT.md` as the product-intent authority and marked the original `BRIEF.md` as historical.
- Reconciled `AGENTS.md` into a routing layer with standing safety locks; added the project-specific playbook, judged loop, goal-writing guide, decision log, append-only goal log, and evidence policy.
- Documented current versus planned manual-ICS vocabulary in `CONTEXT.md` and current versus intended feature state in `PROJECT.md`.
- Aligned local Supabase Auth with the documented `http://localhost:3000` app origin while allowing both HTTP loopback aliases and nested redirect paths.
- Added `.agents/goal-work/` as the ignored location for bulky transient evidence and linked the foundation from `README.md`.

**Verification and evidence**

- `git diff --check` — passed.
- Relative Markdown link checker across project docs — all checked links resolve.
- Foundation path and generic-placeholder scan — all required paths exist; no unadapted project-template placeholder found (the goal-log and goal-writing copy/paste skeletons remain intentionally parameterized).
- Package-script check — confirmed `dev`, `dev:setup`, `build`, `db:reset`, `db:push:prod`, `lint`, and `test:run` match `package.json`.
- `npm run test:run` — 19 files and 240 tests passed.
- `npm run lint` — passed with no reported errors.
- `npm run build` — Next.js 16.2.1 production build and TypeScript check passed; `/`, `/login`, `/auth/confirm`, and Proxy output generated.
- Supabase config TOML parse/assertion — `site_url` and both `additional_redirect_urls` match documented local origins.
- `supabase status` — runtime auth smoke check could not run because the local Docker daemon is unavailable; config syntax, CLI command availability, current Supabase docs, and static origin alignment were verified instead.
- Product/fixture truth comparison: code/types, migrations, and tests were compared against `PROJECT.md`/`CONTEXT.md`; planned manual ICS terms are explicitly separated from current behavior.
- Retained evidence: `docs/goal-evidence/2026-07-16-foundation/judge-results.md`
- Transient evidence distilled: exact deterministic check results and judge findings above; no raw logs retained.

**Judge pass 1**

- Verdict: `BLOCKERS REMAIN`
- Blockers: planned manual-ICS terms appeared current in `CONTEXT.md`; local Supabase redirect origins conflicted; this log still contained pending fields and no retained judge evidence.
- Polish: none
- Fixes: separated planned vocabulary/relationships, aligned local Auth origins, retained the compact judge result, and completed this run record with observed validation.
- Rejected findings: none

**Judge pass 2**

- Verdict: `GOAL MET`
- Blockers: none
- Polish: README manual checks described Role removal as deletion rather than archive/restore.
- Fixes: corrected the README checklist to distinguish Role archive/restore from Goal and planning-item deletion.
- Rejected findings: none

**Completion**

- Final verdict: `GOAL MET`
- Commit/deploy/release: not requested
- Follow-up explicitly left out: product implementation, deployment, and the unavailable Docker-backed local Auth smoke test

---

## Entry template

### <YYYY-MM-DD> — <goal title>

**Goal and outcome**

<Exact outcome-oriented goal and what becomes true.>

**Working-tree baseline**

- Initial `git status --short`: <result>
- Pre-existing changes and ownership: <none or exact paths>
- Overlap risk: <none or blocker>

**Assumptions and defaults**

- <Choice derived from canonical sources and why.>

**Persona, flow, and guardrails**

- Persona and moment: <who, when, and relevant pressure>
- Start state: <where the flow begins>
- End state: <what is true when successful>
- Confusions to kill: <facts that must become obvious>
- Guardrails: <paths, behavior, external effects, or adjacent scope excluded>

**Rubric**

1. <Falsifiable outcome or deterministic check.>
2. <Falsifiable quality, trust, safety, or edge-state check.>

**Implementation summary**

- <What changed and why.>

**Verification and evidence**

- `<command>` — <exact observed result>
- Product/fixture truth comparison: <result or not applicable>
- Retained evidence: `docs/goal-evidence/<goal-id>/` or none
- Transient evidence distilled: <facts or none>

**Judge pass 1**

- Verdict: `GOAL MET` | `BLOCKERS REMAIN`
- Blockers: <findings or none>
- Polish: <findings or none>
- Fixes: <changes after this pass>
- Rejected findings: <item and reason, or none>

<Repeat judge sections after meaningful fixes.>

**Completion**

- Final verdict: `GOAL MET` | `[blocked]`
- If blocked: <exact condition, attempted recovery, current state, safest resume step>
- Commit/deploy/release: <result or not requested>
- Follow-up explicitly left out: <scope>

## 2026-07-19 — Table-stakes completion: freestyle parity, recurrence, and manual `.ics` import

**Goal and outcome**

Round out the existing planning surfaces to commercial completeness so the app serves a daily full-time scheduler: create Freestyle Day Priorities and freestyle Evening Blocks directly in place, assign Roles to freestyle items without touching the Sidebar goal list, mark Freestyle Blocks as repeating weekly (carried at Weekly Handoff), and implement manual `.ics` calendar import per `etc/prd/manual-ics-calendar-import.md`. Author the falsifiable eval set before implementation, validate it in the local browser via a subagent, and finish with a fresh-judge verdict.

**Working-tree baseline**

- Initial `git status --short`: clean (no output)
- Pre-existing changes and ownership: none
- Overlap risk: none

**Assumptions and defaults**

- The User's prompt authorizes updating `PROJECT.md`, docs, and implementing the listed table stakes; production deploy/commit remain unauthorized until requested (commit is expected at the end per usual repo practice only if requested).
- Recurrence is restricted to Freestyle Blocks: goal-linked blocks already carry forward via Goal selection in Weekly Handoff, and cross-week goal identity does not survive `buildTargetWeek`'s goal re-iding.
- Freestyle Day Priorities become draggable/convertible first-class peers (beyond ICS PRD V1 minimum) because the drop-routing architecture supports it cheaply and PROJECT.md now prefers symmetric capability.
- Stored Week JSONB documents predating these fields are normalized at the mapping boundary (missing `type` on Day Priorities means goal-linked).
- agent-browser (Chromium) is the verification surface; Safari-specific locks in `docs/decisions.md` are preserved by construction, not re-verified in Safari.

**Persona, flow, and guardrails**

- Persona and moment: the owner using the app as their only weekly scheduler, planning and adjusting every day
- Start state: signed-in local dev workspace on the current Week
- End state: every everyday planning action (create, edit, assign, repeat, import) works from the surface where the user expects it
- Confusions to kill: freestyle items as second-class dead ends; recurrence that silently mutates history; import that creates Goals or bypasses review
- Guardrails: no schema migration (JSONB additive fields only), no production mutation, no live calendar sync, goal list never shows role-assigned freestyle items

**Rubric**

1. Every case in `etc/loop/table-stakes-eval.md` marked [C] passes against the running local app.
2. Full test suite, lint, and production build pass; new pure logic (import engine, recurrence carry, priority normalization) has behavior tests.
3. A fresh judge assuming the PROJECT.md persona issues `GOAL MET`.

**Implementation summary**

- Extended the Day Priority model with a `type: "goal" | "freestyle"` discriminant (own `text`, optional `roleId`, optional `importMeta`); legacy documents normalize at the mapping boundary (`normalizeWeek`). Blocks gained optional `recurrence: "weekly"` and `importMeta` — all additive JSONB fields, no migration.
- In-place creation: hover-revealed "Add priority" / "Add evening" affordances create freestyle items with inline titling (commit on Enter, abandon on empty/Escape), mirroring block draw.
- Role assignment: shared `AssignRoleMenuItems`/`RepeatMenuItem` menu extras on Freestyle Blocks, freestyle Evening Blocks, and Freestyle Day Priorities (dropdown + context menu). Role affects color and Weekly Balance only; archiving a Role clears assignments from freestyle items instead of deleting them.
- Recurrence: "Repeat weekly" on Freestyle Blocks with a meta indicator; `buildTargetWeek` copies repeating freestyle blocks (fresh ids, completion reset, inactive-role assignments dropped); Weekly Handoff dialog discloses the count.
- Freestyle conversion symmetry: block↔priority↔evening conversions now support freestyle items, carrying text/role/import metadata; `convertBlockToPriority`/`convertEveningToPriority` no longer dead-end on freestyle.
- Manual `.ics` import: `src/lib/ics-import.ts` (ical.js; VTIMEZONE registration, recurrence expansion with exceptions, week filtering, timed/all-day classification, out-of-grid/misalignment/overlap/cap/duplicate handling, safe Import Metadata + meeting-link extraction), `ImportCalendarDialog` review UI from the Week toolbar, and single-commit `importWeekItems`. Fixture generator: `scripts/make-import-fixtures.mjs`.
- Rail Week Metrics now count unassigned freestyle hours (`computePlannedHours`); per-surface inline placeholders; local magic-link template mirrored into `supabase/config.toml` + `supabase/templates/magic-link.html`; seeded auth user gained GoTrue-compatible empty token columns (local `/otp` 500 fix).

**Verification and evidence**

- `npm run test:run` — 23 files, 281 tests passed (includes new ics-import, priorities, recurrence, and freestyle store suites).
- `npm run lint` — clean. `npm run build` — production build and type check passed.
- Browser validation (agent-browser, local Supabase, magic-link auth via Mailpit): fresh-context Sonnet subagent graded `etc/loop/table-stakes-eval.md` — 45/52 PASS initially; the four import failures traced to a startDate timezone skew (fixed via `parseWeekId` windowing + regression test) and re-verified in-browser (correct day mapping, duplicate detection, all skip/conflict reasons incl. the all-day cap). F2 proved a harness hit-testing artifact (opacity-0 frozen animations); ref-dispatched click assigns roles correctly.
- Retained evidence: `.agents/goal-work/eval-results.md` (transient, ignored) distilled here; key findings recorded in `docs/decisions.md` and the AGENTS.md week-id lock.
- Known limitation: `agent-browser screenshot` hangs on this host — visual checks used accessibility snapshots and computed-style evals; Safari not exercised (Chromium only), Safari-specific locks preserved by construction.
**Judge pass 1 (validation subagent, fresh context)**

- Verdict: `BLOCKERS REMAIN` (45/52 PASS)
- Blockers: `.ics` import shifted every event one day forward and dropped the week's Sunday (H2, cascading to H4/H5/H6).
- Polish: Week Metrics excluded unassigned freestyle hours; shared "Block title..." placeholder on priority creation; F2 submenu hit-test question.
- Fixes: import window now derives from `week.id` via `parseWeekId` (+ regression test); `computePlannedHours` for Week Metrics; per-surface placeholders. F2 reproduced as a harness hit-testing artifact (opacity-0 frozen animations); ref-dispatched clicks assign correctly.
- Rejected findings: none.

**Judge pass 2 (fresh Opus judge, daily-driver persona, real product surface)**

- Verdict: `GOAL MET`
- Blockers: none. Independently re-verified the import day-mapping fix (UI + DB `dayIndex`), classification/cap/duplicates, freestyle creation and role assignment persistence, goal-list isolation, Weekly Balance vs Week Metrics distinction, and repeating-block handoff carry with disclosure.
- Polish: (1) Sunday-column role submenu could not be coordinate-clicked in the harness (ref-dispatch works; inconclusive on rendered position — spot-check once in Safari); (2) same-day all-day cap rejection sorted by title rather than file order — fixed after the pass (stable sort, 281 tests/lint/build green); (3) no visual "from calendar" hint on imported blocks — intentional PRD V1 scope.

**Completion**

- Final verdict: `GOAL MET`
- Commit/deploy/release: not requested; working tree left uncommitted for User review. Production Supabase remains paused/untouched; local Supabase + dev server left running for User testing.
- Follow-up explicitly left out: manual Safari spot-check of the rightmost-column role submenu; pre-existing timezone-sensitive utils/weekly-handoff tests (fail under negative-UTC-offset TZs on the old baseline too); Import Metadata display popover and imported-item indicator (PRD V1 exclusions); Sharpen the Saw and mobile single-Day experience (unchanged).

## 2026-07-19 — Daily-execution milestone: undo, goal notes, import refresh, day bounds, reflection, trends, mobile today

**Goal and outcome**

User-selected scope from the post-table-stakes proposal: toast-based undo for destructive actions; surface Goal notes (editable + placement summary); `.ics` import refresh (moved/renamed events update in place by UID + recurrence-id); configurable day bounds per Week; weekly reflection step in Weekly Handoff stored on the Source Week; cross-week role trends in the Rail; a mobile single-day "Today" companion at phone viewports; and fixing the pre-existing timezone-sensitive tests. Eval set: `etc/loop/daily-execution-eval.md` (written before implementation). Everything verified against the real local app including Safari.

**Working-tree baseline**

- Initial `git status --short`: the uncommitted table-stakes milestone (see 2026-07-19 entry above) — many modified/new files across src, docs, supabase.
- Pre-existing changes and ownership: previous run's shipped, judged work left uncommitted for User review; the User explicitly instructed building on it ("same as previous work").
- Overlap risk: none blocking — this milestone extends that baseline deliberately.

**Assumptions and defaults**

- Day bounds live on the Week snapshot (`dayBounds`, default 8–20), carried forward at Weekly Handoff; no durable settings table/migration. Changing bounds re-indexes block slots to preserve wall-clock times and refuses narrowing that would strand a block (explicit over automatic).
- Undo is single-level, most-recent-wins, week-scoped, and restores deleted entities (not a whole-week rollback); restore refuses when planning integrity would break.
- Import refresh defaults updates to selected in review (a moved meeting is the point of a refresh) but still requires explicit confirmation of the review as a whole.
- Reflection is optional and skippable; it saves to the Source Week at the step transition and is never copied to the Target Week.
- The mobile Today view is a companion for executing the plan (complete, review, quick-add priority), not a planning surface; the desktop seven-Day workspace stays primary.
- Role trends group by durable Role identity with current display values (per CONTEXT.md), lazy-loaded, planning-support-sized.

**Persona, flow, and guardrails**

- Persona and moment: the daily driver mid-week, inside a day that isn't going to plan, sometimes away from the desk.
- Start state: signed-in workspace on the current Week (desktop) or phone viewport (today view).
- End state: destructive actions are trustworthy (undo), moved meetings refresh cleanly, early/late real life fits the grid, the weekly ritual closes with reflection, and the plan is executable from a phone.
- Confusions to kill: "deleted means gone forever", "re-import duplicates my calendar", "my 7:00 gym can't exist", "reflection lives nowhere".
- Guardrails: no schema migration (additive JSONB fields only), no live calendar sync, no production mutation/commit/deploy, historical Weeks render unchanged.

**Rubric**

1. Every [C] case in `etc/loop/daily-execution-eval.md` passes against the running local app.
2. Full test suite (in three timezones), lint, and production build pass; new pure logic has behavior tests.
3. A fresh browser-driving subagent (Pareto sweep) finds no blocker; Safari spot-checks pass including the leftover Sunday-column submenu check.

**Implementation summary**

- **Timezone fixes:** `getWeekId` is now UTC-pure (round-trips `parseWeekId` in any zone); `getCurrentWeekId` anchors explicitly to the local calendar day; `buildWeekShell` derives `startDate` from the week id's UTC Monday at local midnight (was a real one-week-early bug in negative offsets). Suite passes under `TZ=America/New_York`, `UTC`, and positive offsets.
- **Day Bounds:** `Week.dayBounds` snapshot field (default 8:00–20:00; start 5–12, end 16–24); `TimeSlotIndex` widened to `number`; time-model/scheduling/overlap parameterized by bounds; grid, labels, current-time line, draw/resize hooks, drop preview, and `.ics` classification all read `weekDayBounds(week)`; `updateDayBounds` re-indexes slots to preserve wall-clock times and refuses stranding narrows; Settings "Planning day" UI; handoff carries bounds.
- **Undo:** single-level, week-scoped, entity-restore undo (`lastUndo` + `undoLastDelete`) for priority/block/evening/goal-cascade deletions; sonner toast surface (`UndoToasts`); integrity-checked restore with honest partial messages; expires on navigation and bounds changes; stale-toast ids can't undo newer deletions.
- **Goal notes:** `GoalNotesPopover` (notes textarea + this-week placement list) in the goal row's reserved trailing slot; indicator stays visible when notes exist; goal-delete confirm copy now mentions cascade + undo.
- **Import refresh:** `.ics` re-import matches UID + recurrence-id; moved/resized events classify as preselected updates, title-only renames as unselected updates positioned from the planned item; converted items and cross-type changes are honestly skipped; conservative span/cap reservation; `importWeekItems` applies in-place updates preserving completion/role/recurrence in the same single commit.
- **Reflection:** Weekly Handoff opens with a close-out step (per-role recap via `buildRoleRecaps` + optional textarea) saved to the Source Week at the step transition; `ReflectionCard` in the Rail displays/edits it; never copied to the Target Week.
- **Role trends:** `getAllWeeks` + `buildRoleTrends` (Weekly Balance weighting, durable Role identity, current display values, last 8 weeks); lazy `RoleTrendsCard` sparklines in the expanded Rail with live overlay of the viewed week.
- **Mobile Today view:** CSS-swapped at ≤768px (`TodayView`): day strip, priorities with toggles + capped quick capture, time-ordered schedule, evening; bounds-aware labels; desktop workspace unchanged at ≥769px.
- **Trust fixes from browser findings:** `weekPersistence.flush()` awaited before sign-out (in-flight saves were aborted — observed data loss from the mobile flow); undo hardened against the navigate-while-loading race (selected-id check + expiry on navigation) with regression tests.

**Verification and evidence**

- `npm run test:run` — 27 files, 329 tests passed; also green under `TZ=America/New_York` and `TZ=UTC`. `npm run lint` — clean. `npm run build` — production build passed.
- Browser pass 1 (fresh Sonnet subagent, agent-browser/Chromium, real magic-link auth): graded `etc/loop/daily-execution-eval.md` — U/GN/IR/DBo/WR/RT/MT criticals PASS (details in the judge section); zero console errors.
- Browser pass 2 (fresh Sonnet subagent, Playwright WebKit = Safari engine): 10/10 checks PASS, including the leftover Sunday-column role-submenu spot-check (submenu fully visible, role assign works, clean Escape/focus).
- Retained evidence: this log; transient scripts/screenshots in the session scratchpad (not retained).

**Judge pass 1 (Chromium sweep subagent)**

- Verdict: blockers found → fixed. 40+ eval cases PASS.
- Blockers: (1) undo could restore into the prior week if clicked during the navigation loading window — fixed (expire on navigate + selected-id guard, regression tests); (2) sign-out shortly after mobile edits silently lost them — fixed (`flush()` before sign-out); (3) one non-reproducible stray empty block after an import update — rejected as an import bug: the update path structurally cannot create blocks (updates map existing ids; appends always carry candidate titles); signature matches an accidental harness click-drag draw (1h default, empty title, unassigned).
- Not covered: IR7/IR8/DBo8/RT5 in-browser (all covered by unit tests except DBo8 metrics audit, which is arithmetic-safe by construction).

**Judge pass 2 (WebKit subagent)**

- Verdict: PASS (10/10).
- Flagged: intermittent headless-WebKit render flake where a loaded column briefly rendered empty on some fresh loads (data confirmed intact via direct DB reads; not reproduced in Chromium; screenshot-timing suspected). Left as a real-Safari watch item. Minor: on minimum-height blocks the resize handle can cover the dropdown trigger's hit area (right-click context menu works) — pre-existing, logged as polish.

**Completion**

- Final verdict: `GOAL MET`
- Commit/deploy/release: not requested; working tree left uncommitted for User review (builds on the also-uncommitted table-stakes milestone). Local Supabase + dev server left running.
- Follow-up explicitly left out: real-Safari (non-WebKit-proxy) spot-check by the User; the headless-WebKit render-flake watch item; min-height-block menu-trigger hit area polish; morning sweep / quick capture ⌘K / extended import surfaces (not in this milestone's chosen scope).

## 2026-07-20 — Firebase backend replacement

**Exact goal**

> /goal Replace Supabase with Firebase Auth + Firestore in First Things First’s auth and persistence seams so I can use every shipped planning flow with the same private saved state in local emulators and one production Firebase project.
>
> Success: sign-in, session/route gating, Week + durable Role persistence across reload, and the full shipped baseline (core scheduling + Weekly Handoff + table-stakes freestyle/repeat/import + daily-execution undo/notes/bounds/reflection/trends/Today) work end to end; existing typecheck/lint/test/build stay green; Supabase is gone from runtime and config; production passes a normal-auth smoke with auth-scoped Firestore rules.
>
> Match the existing domain model, UI, store/`db` seam, and documented behavior. Use the Firebase wiring pattern proven in `/Users/rolandtolnay/Documents/Development/hannas-rythm` (Auth enabled independently of the console; emulators locally; one production project).
>
> Don’t redesign the product or Week/Role persistence shape; don’t migrate existing Supabase data (Firebase starts fresh); don’t add backend infrastructure beyond Firebase; don’t weaken security rules or reuse Hanna’s project IDs.
>
> Before building, derive ~15 Firebase-seam realistic and edge cases into `etc/loop/firebase-backend-replacement-eval.md`. After building, drive them locally and smoke the critical flows in production; fix regressions and friction until a full pass finds none.

**Working-tree baseline**

- Initial `git status --short --branch`: `main...origin/main [ahead 6]` with only `M etc/loop/firebase-backend-replacement.md`.
- Pre-existing change and ownership: the modified loop file is the User's current goal wording, supplied with this run; preserve it as the scope source.
- Overlap risk: intentional only. No implementation files were dirty at the baseline.

**Assumptions and guardrails**

- Firebase starts with no migrated Supabase data. The stored Week document and durable Role shapes remain unchanged at the domain and `db` seam.
- Local development uses Firebase emulators. Production uses one new First Things First Firebase project; Hanna's identifiers, data, and credentials are reference-only and must never be reused.
- The explicit requirement for a production normal-auth smoke authorizes the minimum Firebase/Vercel production configuration and deployment needed to prove the result, but not unrelated billing, messaging, or infrastructure changes.
- Auth and Firestore ownership rules are trust boundaries. Verification must prove signed-out denial and cross-user isolation, not merely that an owner can read and write.
- Existing UI/domain behavior remains in scope only as regression surface. No product redesign, Supabase data migration, or new backend tier is permitted.
- Secrets, auth links, tokens, browser profiles, and production User data must not enter tracked files or retained evidence. Use synthetic accounts and planning state.

**Falsifiable rubric**

1. The pre-authored cases in `etc/loop/firebase-backend-replacement-eval.md` all pass against the local emulators and running app, including persistence, failure recovery, and ownership boundaries.
2. Every shipped planning flow remains usable after reload through the unchanged Week/Role domain seam; full tests, lint, typecheck when configured, and production build pass.
3. Supabase has no runtime/config/dependency residue; local setup documentation and commands operate only Firebase emulators.
4. A deployed production build completes normal passwordless auth and persists/reloads synthetic Week + durable Role state under auth-scoped Firestore rules; unauthenticated and cross-user access are denied.
5. A fresh judge finds `BLOCKERS: none` and returns `VERDICT: GOAL MET` after the final local and production evidence pass.

**Implementation summary**

- Replaced the Supabase client, middleware, Auth provider, and persistence implementation with Firebase Auth, an HttpOnly verified-session cookie, and Firestore while preserving the existing Week/Role domain objects and public `db` seam.
- Added local Auth/Firestore emulator configuration, demo-project safety guards, passwordless email-link Auth configuration, owner-scoped Firestore rules, and emulator integration/rules tests.
- Preserved ordered optimistic persistence, lossless sign-out, durable Role materialization and active-name conflict behavior, degraded Role bootstrap, Week sorting, and every shipped planning flow without adding a backend tier or migrating Supabase data.
- Removed Supabase runtime packages, environment/configuration, migrations, scripts, source modules, and canonical setup guidance. Firebase starts fresh in the dedicated production project `first-things-first-roland`.

**Verification and production evidence**

- All 15 pre-authored cases in `etc/loop/firebase-backend-replacement-eval.md`: PASS.
- `npm run typecheck`: PASS. `npm run lint`: PASS. `npm run build`: PASS.
- `npm run test:run`: 31 files, 29 passed and 2 emulator-only skipped; 345 tests, 338 passed and 7 skipped. The full ordinary suite also passed under `TZ=UTC`, `TZ=America/New_York`, and `TZ=Europe/Bucharest`.
- `npm run emulators:test`: 2 files and 7 tests passed. The retained rules test explicitly executes and denies a real `collectionGroup(db, "weeks")` query.
- `git diff --check`: PASS. Non-historical runtime/config/package/path scanning found no Supabase residue.
- Local real-browser drive passed route gating, email-link Auth and recovery, reload/session continuity, Week/Role persistence, the complete shipped-flow regression surface, sign-out, and clean console checks.
- Production `https://first-things-first-five.vercel.app` passed two delivered email-link Auth runs, reload persistence, Weekly Handoff, Today, sign-out/gating, and owner/cross-User/signed-out Firestore probes (`200`/`403` as expected). All disposable mailboxes, Auth Users, and synthetic Firestore data were deleted and rechecked absent.

**Fresh judge**

```text
BLOCKERS:
none

POLISH:
none

VERDICT: GOAL MET
```

**Completion**

- Final verdict: `GOAL MET`.
- Commit/push: not requested; the working tree remains uncommitted for User review.
- Production configuration/deploy: completed only to the extent authorized by the explicit production smoke requirement.
