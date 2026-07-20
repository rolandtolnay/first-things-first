# Firebase production operations

This file records non-secret production wiring and the authorized deployment method. Never store API tokens, ID tokens, email sign-in links, browser cookies, service-account material, or synthetic User data here.

## Architecture

- One First Things First Firebase project provides Firebase Auth and the `(default)` Firestore database.
- `firestore.rules` is the source of truth and scopes every Week, Role, and active-name claim to `request.auth.uid` through the `users/{uid}/...` path.
- The Firebase Web App config is public client identification stored in ignored `.env.local` and Vercel environment variables.
- Production is passwordless email-link only. Firebase CLI auth provisioning enables the email provider; the Identity Toolkit project config sets `signIn.email.passwordRequired=false` without initializing the billed Identity Platform product.
- Vercel hosts the Next.js app. `/auth/session` stores a verified Firebase ID token in an HttpOnly, Secure, SameSite=Lax cookie; `src/proxy.ts` verifies it before serving private routes.

## Current production facts

- Firebase project id: `first-things-first-roland`
- Firebase Web App: `First Things First Web`
- Firestore database: `(default)`, Standard edition, `eur3`
- Canonical Vercel host: `first-things-first-five.vercel.app`
- Auth authorized domain: `first-things-first-five.vercel.app`

These are non-secret identifiers. The Web App API key and app id stay in Vercel environment variables and ignored local environment files rather than documentation.

## Required public environment names

```text
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_APP_ID
NEXT_PUBLIC_FIREBASE_USE_EMULATORS=false
```

## Provision/deploy sequence

Use current CLI help and official Firebase/Identity Toolkit documentation; compatibility is volatile.

1. Confirm the intended Google account and choose a project id not used by any other app.
2. Create the Firebase project and Web App, then create Firestore `(default)` in the documented region.
3. Run `scripts/configure-firebase-auth.sh <id> <production-domain>` from this repository. It deploys the Firebase CLI `auth` block, then uses an ephemeral `gcloud auth print-access-token` to set `signIn.email.enabled=true`, `signIn.email.passwordRequired=false`, and preserve/add the production authorized domain through Identity Toolkit Admin v2. It never writes the access token.
4. Re-read the project config and verify email is enabled, `passwordRequired` is false, and the exact production domain is present.
5. Deploy `firestore.rules` with `firebase deploy --only firestore:rules --project <id>`.
6. Set the five public environment values in Vercel, deploy the working tree only when explicitly authorized, and run the production smoke below.

## Production smoke and cleanup

Use disposable synthetic Users only:

1. Signed-out `/` redirects to `/login`; malformed cookies are rejected.
2. Complete a normal delivered email-link sign-in.
3. Create a Role, Goal, scheduled block, and freestyle item; reload and verify all persist.
4. Run a Weekly Handoff; verify the Target Week and Today view read the same state.
5. Probe the deployed rules as a second disposable User: owner access succeeds, cross-User get/list/write and signed-out access fail.
6. Sign out, confirm the private route gate, then delete all synthetic Auth Users and their `users/{uid}` documents.

Rollback the Vercel deployment independently if needed. Rules rollback is an explicit deploy of the prior reviewed `firestore.rules`; never switch to test mode.
