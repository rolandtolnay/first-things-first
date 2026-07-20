/goal Replace Supabase with Firebase Auth + Firestore in First Things First’s auth and persistence seams so I can use every shipped planning flow with the same private saved state in local emulators and one production Firebase project.

Success: sign-in, session/route gating, Week + durable Role persistence across reload, and the full shipped baseline (core scheduling + Weekly Handoff + table-stakes freestyle/repeat/import + daily-execution undo/notes/bounds/reflection/trends/Today) work end to end; existing typecheck/lint/test/build stay green; Supabase is gone from runtime and config; production passes a normal-auth smoke with auth-scoped Firestore rules.

Match the existing domain model, UI, store/`db` seam, and documented behavior. Use the Firebase wiring pattern proven in `/Users/rolandtolnay/Documents/Development/hannas-rythm` (Auth enabled independently of the console; emulators locally; one production project).

Don’t redesign the product or Week/Role persistence shape; don’t migrate existing Supabase data (Firebase starts fresh); don’t add backend infrastructure beyond Firebase; don’t weaken security rules or reuse Hanna’s project IDs.

Before building, derive ~15 Firebase-seam realistic and edge cases into `etc/loop/firebase-backend-replacement-eval.md`. After building, drive them locally and smoke the critical flows in production; fix regressions and friction until a full pass finds none.
