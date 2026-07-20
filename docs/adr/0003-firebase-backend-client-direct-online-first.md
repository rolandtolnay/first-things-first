# Firebase backend: client-direct with Security Rules, online-first

Firebase Auth and Cloud Firestore are the single source of truth. The browser talks directly to Firestore through the Lite Web SDK; ownership is enforced by `firestore.rules` at `users/{uid}/...`, not by a data API relay. The app remains online-first with no offline cache or queued-offline writes because the single-User product accepts last-write-wins and the existing optimistic store keeps interactions responsive.

Firebase Auth's durable browser Session is not visible to a Next.js server request. The app therefore synchronizes the current Firebase ID token to a Secure, HttpOnly, SameSite=Lax cookie through `/auth/session`. `src/proxy.ts` verifies that cookie against the Firebase project's issuer/audience/signing keys before serving private routes. Local emulator tokens are verified only by the local Auth emulator, and emulator mode requires a `demo-*` project id.

## Consequences

- Security Rules are the data privacy boundary; a wrong rule is a data-exposure bug and must be emulator-tested plus production-probed.
- Firestore Lite is deliberate: network failures reject instead of silently queuing a stale whole-Week write that could land later.
- A short-lived server cookie can expire before Firebase's browser Session. `/login` resynchronizes a refreshable browser Session without sending another email.
- Concurrent edits to the same Week remain ordered by `weekPersistence` and resolve last-write-wins on the whole snapshot.
- Firestore has no unique constraint for active Role names. A transactional per-User `roleNames` claim document preserves that invariant; conflicts expose the existing provider-neutral `23505` code so snapshot behavior stays unchanged.
- Firebase is both auth provider and datastore. Replacing it is a meaningful seam migration, but domain/store APIs remain provider-neutral.
