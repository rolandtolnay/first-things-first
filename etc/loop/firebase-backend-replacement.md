/goal Replace Supabase in First Things First’s auth and persistence layers with Firebase so I can use every existing planning flow with the same behavior and saved state in local development and the single production deployment.

Success: passwordless sign-in, session/route gating, authenticated Week and durable Role persistence, reloads, and Weekly Handoff work end to end; existing typecheck, lint, tests, and build stay green; Supabase runtime/config dependencies are removed; production passes a normal-auth browser smoke test with auth-scoped Firestore rules.

Match the existing domain model, UI, store/db seams, and documented behavior. Follow `../llm-toolkit/hobby-bundle/playbook.md`, its judged goal loop, and assisting skills.

Use one production Firebase setup and Firebase emulators for all local development. Don’t redesign the product or persistence model, add backend infrastructure beyond Firebase, weaken the bundle’s baseline security rules, or migrate production data.

Before building, derive about 15 realistic and edge cases into `etc/loop/firebase-backend-replacement-eval.md`. After building, drive them locally and smoke-test the critical flows in production; fix regressions and friction until a full pass finds none.
