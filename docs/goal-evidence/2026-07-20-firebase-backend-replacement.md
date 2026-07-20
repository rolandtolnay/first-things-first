# Firebase backend replacement evidence

Date: 2026-07-20  
Goal: replace the runtime Supabase auth/persistence backend with Firebase Auth and Firestore without changing the planning domain or Week/Role persistence shapes.

## Production wiring

- Firebase project: `first-things-first-roland` (not shared with Hanna's Rhythm)
- Firestore: `(default)`, Standard edition, `eur3`
- Vercel production: `https://first-things-first-five.vercel.app`
- Passwordless email-link Auth enabled through checked-in CLI configuration plus Identity Toolkit Admin v2
- Checked-in `firestore.rules` deployed successfully
- Vercel production contains the five Firebase public variables and no Supabase variables

## Deterministic verification

- `npm run typecheck`: pass
- `npm run lint`: pass
- `npm run test:run`: 31 files, 29 passed and 2 emulator-only skipped; 345 tests, 338 passed and 7 skipped
- `npm run emulators:test`: 2 files and 7 tests passed
- Full ordinary suite under `TZ=UTC`: pass
- Full ordinary suite under `TZ=America/New_York`: pass
- Full ordinary suite under `TZ=Europe/Bucharest`: pass
- `npm run build`: pass; `/`, `/login`, `/auth/confirm`, `/auth/session`, and the Next.js proxy compiled
- `git diff --check`: pass
- Next.js and `eslint-config-next` were patched from `16.2.1` to `16.2.10`; the published App Router proxy-bypass advisories no longer match the installed version

## Local product drive

Using the real Auth and Firestore emulators under `demo-first-things-first`:

- signed-out route gating and email-link sign-in worked
- invalid-link customer recovery worked without exposing provider error text
- cross-device confirmation prompted for email, rejected the wrong email, and accepted the correct one
- a Week, durable Role, Goal notes, freestyle priority with Role assignment, weekly evening event, custom Day Bounds, imported timed/all-day calendar items, completion, Reflection, and second Week all survived reload
- Weekly Handoff carried the selected Goal and repeating event; Role Trends read both Weeks
- the mobile Today view captured and completed a priority from the same saved Week
- focused regression tests covered drag/drop routing, resize, conversions, import refresh, Undo, notes, recurrence, bounds, reflection, and scheduling boundaries
- final browser console-error check was empty

## Production smoke and rules

Two disposable normal-auth runs completed real delivered email-link sign-in. The critical run created and reload-verified a Role, Goal, priority, and repeating evening event, performed Weekly Handoff, verified the carried Goal/repeat in the Target Week, verified Today against the Source Week, and signed out back to the gated login route.

Production rules probes used two additional disposable authenticated Users:

| Probe | HTTP result |
|---|---:|
| Owner write | 200 |
| Owner read | 200 |
| Cross-User read | 403 |
| Cross-User write | 403 |
| Signed-out read | 403 |
| Owner cleanup | 200 |

Every disposable mailbox was deleted. Every synthetic Auth User was deleted. Every synthetic `users/{uid}` subtree or probe document was deleted and rechecked absent. No credential, ID token, sign-in link, cookie, or synthetic planning payload is retained in this evidence.

## Fresh judge

After independently rerunning the configured checks, emulator integration/rules suite, local real-auth browser slice, persistence reload, route gating, sign-out, invalid-session response, console check, and an actual collection-group denial probe, the fresh judge returned:

```text
BLOCKERS:
none

POLISH:
none

VERDICT: GOAL MET
```

The one interim evidence-polish observation was closed before verdict: `tests/firestore.rules.test.ts` now executes `collectionGroup(db, "weeks")` rather than labeling a root collection query as collection-group coverage, and the corrected test passes.
