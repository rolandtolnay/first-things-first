# Local Firebase development

Development uses Firebase Auth and Cloud Firestore emulators under the non-production `demo-first-things-first` project id. Production is the only real Firebase project. The app refuses emulator mode unless the configured project id starts with `demo-`, so a missing local service cannot silently send planning data to cloud.

## First-time setup

Prerequisites:

- dependencies installed with `npm install`
- Java available for the Firestore emulator

```bash
npm run dev:setup
npm run dev
```

`npm run dev:setup` writes non-secret emulator config to ignored `.env.local`, starts Auth + Firestore, and preserves exported emulator state under ignored `.firebase/data` when the managed process stops cleanly. A normal clone contains no local User or planning data.

| Service | URL |
|---|---|
| App | http://localhost:3000 |
| Emulator UI | http://127.0.0.1:4000 |
| Firestore | http://127.0.0.1:8080 |
| Authentication | http://127.0.0.1:9099 |

## Passwordless local sign-in

1. Enter a synthetic email on `/login`.
2. Open the newest sign-in link from the Auth Emulator UI or the foreground emulator log.
3. The link returns to `/auth/confirm`, establishes Firebase Auth plus the verified server Session cookie, and opens the requested private route.

The emulator never sends real email. For non-interactive test setup, its local REST endpoint exposes generated out-of-band codes; do not retain those links in evidence.

## Tests

```bash
npm run emulators:test
npm run typecheck
npm run test:run
npm run lint
npm run build
```

`emulators:test` starts disposable Auth + Firestore instances, runs adapter integration tests and `firestore.rules` ownership tests, then stops them. The ordinary Vitest suite skips those files when emulator hosts are absent.

## State and stopping

`npm run emulators:start` runs the services in the foreground. `npm run emulators:stop` stops a process created by `dev:setup`. Local emulator state is synthetic and disposable; never import production exports.

## Non-goals

- no hosted development Firebase project
- no cloud fallback from local emulator mode
- no production data clone or migration
- no offline cache or conflict-resolution engine
- no backend service beyond Firebase and the existing Next.js server Session gate
