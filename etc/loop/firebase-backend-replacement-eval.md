# Firebase backend replacement eval

Fifteen falsifiable cases written **before implementation** on 2026-07-20. They are derived from the explicit Firebase replacement goal, `PROJECT.md`, `CONTEXT.md`, ADR-0003 through ADR-0005, the current `db`/store/auth seams, the shipped table-stakes and daily-execution evals, and the proven Firebase project/emulator wiring in Hanna's Rhythm.

The daily-driver persona is the private owner using First Things First as their only scheduler across desktop and phone. Local cases run through the Firebase Auth and Firestore emulators with synthetic Users. Production cases use disposable synthetic Users and planning state in the single First Things First Firebase project; retained evidence must contain no credentials, sign-in links, tokens, cookies, or User data.

Criticality and surface: **[C]** must pass; **[L]** local emulator/app; **[P]** production smoke; **[I]** deterministic inspection or automated test. A pass requires the persisted source of truth or rules result where relevant—optimistic UI alone is not evidence.

## Auth, session, and environment isolation

1. **FBR1 [C][L][I] — Local means local.** `npm run dev:setup` starts the Auth and Firestore emulators under a non-production demo project id, writes only public local Firebase config, and leaves no path from a normal local app session to production. Browser network traffic and the Emulator UI show that both Auth and Firestore operations stay local; stopping either required emulator produces a visible setup/runtime failure rather than silently falling back to cloud.

2. **FBR2 [C][L][P] — Signed-out server route gate.** A cookie-free request to `/` (and a representative private deep link) receives a server redirect to `/login?redirectTo=...`; public auth/callback routes remain reachable. An attacker cannot bypass this by inventing a cookie: malformed, expired, wrong-project, or emulator tokens are rejected in production.

3. **FBR3 [C][L][P] — Passwordless sign-in and safe return.** Submitting an email sends a Firebase email sign-in link; completing it establishes Firebase Auth plus the server gate Session and returns to the preserved same-origin path. The emulator link is obtainable without real email. A hostile/external `redirectTo` is reduced to `/`, and production completes the same flow through a real disposable mailbox/User without a password.

4. **FBR4 [C][L] — Interrupted, cross-device, and bad links recover honestly.** An invalid/expired/replayed link shows recoverable login copy and creates no Session. When a valid link is opened where the originating email is unavailable, the UI asks for that email and rejects a mismatched address instead of guessing. Retrying with the correct address succeeds once.

5. **FBR5 [C][L][P] — Session continuity and stale-cookie recovery.** Reload, a new tab, and a browser restart preserve the Firebase User and private route access. If the short-lived server token/cookie is missing or stale while Firebase's browser session remains refreshable, `/login` silently resynchronizes it and returns to the requested private path without sending another email or bootstrapping twice.

6. **FBR6 [C][L][P] — Sign-out is lossless and complete.** Sign-out waits for an in-flight optimistic Week save, clears the Firebase client Session and server gate cookie, resets the in-memory store, redirects to `/login`, and causes another open tab to leave the private shell. Reload proves the final pre-sign-out edit was saved; back-navigation or the old cookie cannot reopen private UI.

## Week and durable Role persistence seam

7. **FBR7 [C][L][P] — Fresh Firebase User bootstrap.** A new User with no documents receives exactly one current Week using the default Day Bounds and no Roles. Reload returns that same Week (no duplicate creation). A returning User opens the most relevant saved Week and sees the correct sorted Week navigation.

8. **FBR8 [C][L][I] — Week document round-trip is lossless.** Saving and loading one Week preserves its existing document shape and every shipped field: Role Snapshots, Goals and notes, goal-linked/freestyle priorities, timed/evening blocks, completion, role assignment, recurrence, Import Metadata, Day Bounds, Reflection, timestamps, and id. Legacy priority normalization still occurs only at the mapping boundary. Firestore-specific sentinels or metadata never leak into the domain object.

9. **FBR9 [C][L][I] — Ordered last-write-wins without session bleed.** Several rapid edits to the same Week persist in call order and reload to the last snapshot. Navigation can read the newest pending snapshot. A late read/write from a signed-out User or previous User generation is aborted/ignored and can neither overwrite nor appear in the next User's store.

10. **FBR10 [C][L][I] — Persistence failure is visible and recoverable.** Deny or interrupt a Week write after an optimistic edit: the app surfaces its existing non-silent save error, never reports success, and a clean reload reflects Firestore truth. Restoring the emulator/rules lets a subsequent edit save normally; the persistence queue is not permanently poisoned.

11. **FBR11 [C][L][I] — Durable Role lifecycle and orphan trap.** Create, rename/recolor, reorder, archive, search, and restore Roles through the existing UI/store seam; reload after each representative mutation. Editing or archiving a historical Role Snapshot whose durable document is missing materializes the full durable Role with the same id/name/color/order. Other historical Week snapshots do not drift, and archiving clears only current-Week freestyle assignments as documented.

12. **FBR12 [C][L][I] — Active-name uniqueness survives Firestore races.** Two active Roles for one User cannot end with the same normalized name, including concurrent create/rename attempts from separate tabs. Restoring an archived conflicting Role receives the existing distinct-name behavior. A conflict while updating durable defaults preserves the already-saved current Week snapshot behavior documented for the Supabase `23505` case, translated to a provider-neutral conflict contract rather than raw Firebase text.

13. **FBR13 [C][L][I] — Cross-week reads and degraded bootstrap.** `getAllWeeks` and `getAllWeekIds` return only the signed-in User's Weeks in chronological order so Role Trends and navigation agree after reload. If durable Role loading fails while saved Weeks load, bootstrap retains the Week list/current Week, uses `activeRoles: []`, and surfaces the non-fatal error exactly as the standing orphan-trap lock requires.

## Security and shipped-flow regression

14. **FBR14 [C][L][P][I] — Auth-scoped Firestore rules are the data boundary.** Rules tests/probes prove: the owner can read/write only their own Week and Role documents; signed-out requests are denied; User B cannot get, list, create, overwrite, reorder, archive, or delete User A's data even with known ids or forged owner fields; collection-group or unexpected-path access is denied. Production deploys the checked-in rules (never test mode), and disposable cross-User probes reproduce the denial before cleanup.

15. **FBR15 [C][L][P] — Every shipped planning flow survives the seam replacement.** In one local end-to-end pass, use the real auth path to exercise and reload-check: Role/Goal creation; priority/block/evening scheduling and completion; drag/resize/conversion; Weekly Handoff with selected Goal carry, Repeating Blocks, Day Bounds, and Source-Week Reflection; freestyle priority/evening creation and Role assignment; initial `.ics` import plus refresh; delete Undo; Goal notes; Role Trends; and Today-view quick capture/completion. The production smoke repeats the critical normal-auth slice with disposable state: sign in, create Role + Goal + scheduled/freestyle work, reload, hand off to a Target Week, verify Today reflects the same saved state, sign out, and confirm route/rules denial. No regression, console error, or unexplained friction remains in a final pass.

## Completion gate

- All 15 cases pass with compact sanitized evidence and no production smoke residue.
- Configured typecheck (or an explicitly added `typecheck` script), lint, full tests in the repository's three timezone checks, production build, and `git diff --check` pass.
- Repository/runtime/config/documentation searches find no Supabase package, import, environment key, directory, migration, script, hosted-project instruction, or Supabase-named canonical guidance. Historical goal/evidence records may retain truthful past references.
- A fresh judge drives the local product and reviews the production/rules evidence, then returns exactly `BLOCKERS: none` and `VERDICT: GOAL MET`.

## Driven result — 2026-07-20

All fifteen cases passed. Compact evidence is retained in `docs/goal-evidence/2026-07-20-firebase-backend-replacement.md`; credentials, tokens, sign-in links, cookies, mailbox contents, and synthetic planning documents were not retained.

| Case | Result | Evidence surface |
|---|---|---|
| FBR1 | PASS | Demo-project guard, Auth/Firestore emulator traffic, and visible emulator-down timeout |
| FBR2 | PASS | Local `307` plus production signed-out redirect and malformed/unauthenticated denial |
| FBR3 | PASS | Local emulator link and delivered production email-link returned through `/auth/confirm` |
| FBR4 | PASS | Invalid code, cross-device email prompt, wrong-email rejection, then correct-email completion |
| FBR5 | PASS | Reload/session-cookie resynchronization through the normal client/server Session path |
| FBR6 | PASS | Reloaded final edits, signed out, and confirmed the private route redirected to login |
| FBR7 | PASS | Fresh Users received one Week; reload did not duplicate it |
| FBR8 | PASS | Firestore integration round-trip plus mapping tests cover the complete Week shape |
| FBR9 | PASS | Ordered persistence/session-generation store tests and emulator integration tests |
| FBR10 | PASS | Rejected-write store tests, Firestore Lite failure semantics, and emulator recovery |
| FBR11 | PASS | Durable Role lifecycle/orphan materialization integration tests plus UI reload |
| FBR12 | PASS | Concurrent normalized-name claim integration test returned one success and one `23505` compatibility conflict |
| FBR13 | PASS | Sorted cross-Week reads, Role Trends in UI, and degraded-bootstrap tests |
| FBR14 | PASS | Emulator rules suite and production probes: owner `200`; cross-User/signed-out `403` |
| FBR15 | PASS | Local shipped-flow pass, focused interaction/store regression suite, and production handoff/Today/reload slice |
