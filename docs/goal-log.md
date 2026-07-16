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
