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
