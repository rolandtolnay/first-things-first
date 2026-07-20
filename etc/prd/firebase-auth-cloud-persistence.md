# Firebase Auth and cloud persistence

## Outcome

A User signs in by passwordless email link and sees the same private saved Weeks and durable Roles on every device. Editing remains optimistic and fast; reloads, Weekly Handoff, Role Trends, and Today all read the same online source of truth.

## Product behavior

- Firebase Auth email links preserve the requested same-origin route. Opening a link on another device asks for the receiving email rather than putting it in the URL.
- A Session survives reloads and new tabs. Sign-out flushes queued Week saves, clears browser/server auth, resets private state, and gates the route.
- First sign-in creates one current Week with default Day Bounds and active Role defaults (empty for a new User).
- Persistence failures are visible. Weeks remain whole snapshot documents; durable Roles remain separately stored defaults with per-Week Role Snapshots.
- There is no migrated legacy-provider data: Firebase starts fresh.

## Technical boundary

- The browser uses the Firebase Web SDK directly. `firestore.rules` scopes `users/{uid}/weeks`, `roles`, and `roleNames` to the authenticated uid.
- The store-facing `src/lib/db.ts` interface and `weekPersistence` ordering remain unchanged.
- Weeks live at `users/{uid}/weeks/{weekId}` with the domain object as the document. Roles live at `users/{uid}/roles/{roleId}`. Transactional active-name claims preserve uniqueness.
- Firebase browser Auth is bridged to a verified HttpOnly ID-token cookie for the Next.js proxy. This server gate is auth plumbing, not a data API/backend relay.
- Development uses Auth + Firestore emulators under a `demo-*` id. Production uses one distinct Firebase project and Vercel.

## Out of scope

- data migration from the former provider
- offline-first caching or conflict resolution
- collaboration, sharing, admin roles, or an API relay
- Cloud Functions or other backend infrastructure
- weakening Security Rules for fixtures or smoke tests
