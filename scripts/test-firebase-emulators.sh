#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FIREBASE_CLI="$ROOT_DIR/node_modules/.bin/firebase"
cd "$ROOT_DIR"

[[ -x "$FIREBASE_CLI" ]] || {
  printf '[ERROR] Install dependencies first so the repository Firebase CLI is available.\n' >&2
  exit 1
}

export NEXT_PUBLIC_FIREBASE_API_KEY="fake-api-key"
export NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="demo-first-things-first.firebaseapp.com"
export NEXT_PUBLIC_FIREBASE_PROJECT_ID="demo-first-things-first"
export NEXT_PUBLIC_FIREBASE_APP_ID="1:1234567890:web:test"
export NEXT_PUBLIC_FIREBASE_USE_EMULATORS="true"

"$FIREBASE_CLI" emulators:exec \
  --only auth,firestore \
  --project demo-first-things-first \
  "vitest run --fileParallelism=false tests/firebase.integration.test.ts tests/firestore.rules.test.ts"
