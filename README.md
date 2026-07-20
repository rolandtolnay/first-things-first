# First Things First

Help users focus on what matters by making the connection between life Roles, weekly Goals, and scheduled time explicit and actionable.

Built with Next.js, React, Zustand, dnd-kit, Firebase Auth, and Cloud Firestore.

Product intent and autonomous-run guidance live in [`PROJECT.md`](PROJECT.md) and [`AGENTS.md`](AGENTS.md). The complete build and verification method is in [`etc/playbook.md`](etc/playbook.md).

## Getting started

Prerequisites:

- Node.js/npm
- Java (required by the Firestore emulator)

```bash
npm install
npm run dev:setup
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Local development uses the isolated Firebase Auth and Firestore emulators under the `demo-first-things-first` id; it never falls back to production. See [`docs/firebase-local-development.md`](docs/firebase-local-development.md).

Enter a synthetic email on `/login`, then open the generated email sign-in link from the Auth Emulator UI at [http://127.0.0.1:4000/auth](http://127.0.0.1:4000/auth) or the emulator terminal output.

## Available scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Next.js development server |
| `npm run dev:setup` | Configure isolated local Firebase and start the emulators |
| `npm run emulators:start` | Run Auth + Firestore emulators in the foreground |
| `npm run emulators:stop` | Stop emulators started by the setup script |
| `npm run emulators:test` | Run adapter integration and Firestore rules tests against emulators |
| `npm run typecheck` | Run strict TypeScript checking |
| `npm run lint` | Run ESLint |
| `npm run test:run` | Run deterministic tests once |
| `npm run build` | Create the production build |
| `npm run start` | Serve the production build |

## Manual testing checklist

- **Auth:** email-link sign-in, reload/new-tab continuity, sign-out, and signed-out server redirect
- **Sidebar:** add/edit/reorder/archive/restore Roles; add/edit/delete Goals
- **Calendar:** priorities, block draw/drag/resize/conversion, evenings, repeat, and `.ics` import/refresh
- **Weekly Handoff:** reflection, selected Goal carry, repeating blocks, and Day Bounds
- **Trust:** deletion Undo, save-error visibility, reload persistence, cross-User rules denial
- **Today:** phone-width quick capture and completion reflect the same saved Week
