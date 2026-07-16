# Judged goal loop for First Things First

Use this when correctness includes planner usability, interaction quality, accessibility, trust, auth/data safety, or behavior that deterministic tests cannot fully establish. A fresh-context judge evaluates the built result and evidence; the builder remains responsible for changes.

## Core loop

1. Derive a short falsifiable rubric from the goal, `PROJECT.md`, `CONTEXT.md`, and relevant decisions/PRDs.
2. Build the smallest vertical slice that can satisfy it.
3. Run applicable deterministic checks from `etc/playbook.md`.
4. Have a fresh judge drive or inspect the real product against representative local seeded or synthetic data. Never use production or real User data for judging.
5. Fix evidence-backed blockers and cheap aligned polish.
6. Re-run affected checks and re-judge after meaningful changes.
7. Stop at `GOAL MET` or an explicit `[blocked]` condition from the playbook.

Successful completion requires:

```text
BLOCKERS: none
VERDICT: GOAL MET
```

Documentation/foundation goals may use a fresh cold-start repository review instead of the browser. Pure internal refactors do not need judge ceremony when deterministic checks fully prove the outcome.

## Rubric shape

```text
# <Flow> judging rubric

Judge as <planner persona> using <local planner URL or repository surface> against <seeded/synthetic state>.

Outcome and quality:
1. <Primary planning outcome>
2. <Clarity, interaction, accessibility, responsiveness, or design-system fit>
3. <Important empty, loading, error, interrupted, or boundary state>

Correctness and trust:
4. <Rendered state agrees with Week/Role source truth>
5. <Persistence, recovery, replacement, or rollback agrees when mutation is involved>
6. <Nothing essential is missing and nothing present expands the requested scope>

Guardrails:
- Grade only <requested scope>.
- Do not touch production, real User data, auth secrets, or off-limits paths.
- Empty blockers is valid.
```

## Judge prompt

```text
You are the fresh judge for a First Things First goal. Do not edit code.

Read PROJECT.md, CONTEXT.md, relevant decisions/PRDs, and this persisted rubric:
<RUBRIC>

Grade the built result as <PERSONA> using:
- Product/build: <LOCAL URL, ARTIFACT, OR PATH>
- Representative state: <SEEDED/SYNTHETIC DESCRIPTION>
- Drive method: <COMMAND OR STEPS>
- Evidence: <PATHS>

Walk the primary flow, important interactions, and boundary states. Compare UI and persistence claims with source truth. If mutation is in scope, compare preview, effect, persistence, recovery, and final state. Cite concrete evidence.

Return exactly:

BLOCKERS:
- <location> — <evidence-backed problem> — <concrete fix>
(or "none")

POLISH:
- <location> — <smaller friction> — <concrete fix>
(or "none")

VERDICT: GOAL MET | BLOCKERS REMAIN

Rules:
- GOAL MET only when blockers are empty.
- Do not invent findings to fill a quota.
- Stay within scope and safety boundaries.
- Prefer removing, clarifying, and simplifying before adding features.
```

## Builder rules

- Fix blockers unless they conflict with the explicit goal, canonical product intent, a recorded decision, or a safety boundary.
- Log every pass, fix, and rejected finding in `docs/goal-log.md`.
- Do not weaken a valid rubric to manufacture success.
- If the same blocker survives three attempted fixes, diagnose the root cause and either fix it or record `[blocked]`.
- Retain only compact decision-relevant evidence under `docs/goal-evidence/`.
