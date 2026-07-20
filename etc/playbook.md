# First Things First playbook

Standing build, verification, mutation, and release method. The goal prompt owns the outcome; `PROJECT.md` owns product intent.

## Default implementation direction

- **Stack:** Next.js 16 App Router, React 19, strict TypeScript, Zustand, dnd-kit, Tailwind CSS 4, shadcn/Radix, Vitest, Firebase Auth + Cloud Firestore, and Vercel.
- **Architecture:** `src/stores/weekStore.ts` orchestrates optimistic domain mutations; pure rules live under `src/lib/`; `src/lib/db.ts` is the client-direct Firestore seam. `week-mapping.ts` and `role-mapping.ts` keep provider data out of domain code. Weeks are whole snapshot documents; Roles are durable defaults with per-Week Role Snapshots.
- **Security:** `firestore.rules` is the data boundary. Firebase browser Auth is synchronized into a verified HttpOnly cookie through `/auth/session`; `src/proxy.ts` gates private requests. UI-only gating is never sufficient.
- **UI:** compose shared components under `src/components/`; Dark Workspace `--ds-*` tokens in `src/app/globals.css` are the design source of truth.
- **Testing:** behavior-focused Vitest covers pure rules/store/mapping; Firebase emulator integration covers adapter and Security Rules; browser verification covers auth, persistence, interaction, and layout.

## Goal-loop method

1. Read `PROJECT.md`, `CONTEXT.md`, `AGENTS.md`, relevant decisions/ADRs, and any named PRD.
2. Capture `git status --short`; preserve unrelated changes and stop on unclear overlap.
3. Append the exact goal, baseline, assumptions, guardrails, and falsifiable rubric to `docs/goal-log.md` before implementation.
4. Build the smallest vertical slice; update directly affected names, docs, tests, and callsites.
5. Run the smallest relevant configured checks, then the applicable full gate.
6. For User-visible, auth/data-safety, persistence, or non-deterministic outcomes, follow `etc/judged-goal-loop.md` with a fresh judge and real local product surface.
7. Fix evidence-backed blockers and cheap aligned polish; log every judge pass.
8. Finish only at `GOAL MET`, or record `[blocked]` with exact evidence and the safest resume step.

## Local setup and product-driving surface

Canonical setup facts live in `docs/firebase-local-development.md`.

```bash
npm install
npm run dev:setup
npm run dev
```

Use a synthetic email. The Auth Emulator UI/log exposes the local email sign-in link; never retain it in evidence. Browser work uses the canonical installed CLI instructions and an ignored session/profile:

```bash
agent-browser skills get core
agent-browser --session ftf-debug open http://localhost:3000
```

Known harness quirks observed 2026-07-19 remain: frozen CSS animations can leave closed Radix layers in the DOM; reload to clear them and never remove React nodes manually. Hover before clicking hover-revealed affordances. Real drag/drop may need manual stepped pointer movement. Screenshots may hang; accessibility snapshots, reads, computed style, and WebKit are valid evidence.

## Verification gate

Run only applicable configured checks and report exact observed results.

```bash
npm run typecheck
npm run test:run
npm run lint
npm run emulators:test
npm run build
git diff --check
```

For Week-id/timezone work, run the full suite under the host timezone, `TZ=UTC`, and `TZ=America/New_York`.

### Auth or proxy changes

With emulators and Next.js running:

```bash
curl -i http://localhost:3000/
```

A cookie-free request must redirect to `/login`. Drive a real local email-link sign-in, reload/new-tab continuity, stale-cookie recovery, sign-out flush, and invalid-token denial. After moving proxy routes, stop dev, move aside only the generated `.next` cache, restart, and repeat the request check.

### Firestore persistence or rules changes

1. Edit checked-in `firestore.rules` and the provider-neutral adapter/mapping seam.
2. Run `npm run emulators:test` for owner, signed-out, cross-User, unexpected-path, Week round-trip, Role uniqueness, and orphan behavior.
3. Run store/mapping tests, full suite, typecheck, lint, and build.
4. Drive the real browser and reload after representative mutations; optimistic UI alone is not persistence evidence.
5. Production rules deploy and disposable cross-User probes require explicit production authority.

## Safety and external effects

- Keep secrets, auth links, tokens, cookies, `.env.local`, and production User data out of tracked files, retained evidence, prompts, and reported command output.
- Use synthetic planning data. Never use production or real User data as a fixture.
- Local emulator clearing is destructive to local synthetic data; production rule/auth/project/deploy changes are external boundaries.
- A build goal does not authorize commit, push, deploy, release, external messages, billing changes, or production mutation unless the explicit goal does.
- Define preconditions, verification, cleanup, recovery, and rollback before any authorized production mutation.

## Deployment and production work

`docs/firebase-production.md` is the canonical non-secret runbook. Use one app-specific Firebase project, current CLI help, the checked-in rules, and Vercel environment names. Do not reuse another app's identifiers or initialize billed Identity Platform to enable passwordless email links. A production smoke uses disposable synthetic Users/data and cleans them up.

## Failure policy

**Recoverable:** test/lint/build failures, local emulator startup, expired browser sessions, synthetic-data failures, and judge findings with a new root-cause path.

**Fatal:** unclear pre-existing overlap; missing authority for required external effects; missing production credentials after safe preflight; inability to prove auth/rules isolation; risk to real User data; destructive ambiguity; or the same blocker surviving three root-cause-driven fixes.

On a fatal condition, leave a recoverable tree and append `[blocked]` plus the exact condition and safest resume step to `docs/goal-log.md`.
