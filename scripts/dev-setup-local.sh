#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

RUNTIME_DIR="$ROOT_DIR/.firebase/runtime"
DATA_DIR="$ROOT_DIR/.firebase/data"
PID_FILE="$RUNTIME_DIR/emulators.pid"
LOG_FILE="$RUNTIME_DIR/emulators.log"
DEMO_PROJECT_ID="demo-first-things-first"

fail() {
  printf '[ERROR] %s\n' "$1" >&2
  exit 1
}

port_ready() {
  nc -z 127.0.0.1 "$1" >/dev/null 2>&1
}

write_local_env() {
  local env_file="$ROOT_DIR/.env.local"
  local filtered
  filtered="$(mktemp)"
  if [[ -f "$env_file" ]]; then
    grep -vE '^NEXT_PUBLIC_FIREBASE_' "$env_file" > "$filtered" || true
  fi
  {
    if [[ -s "$filtered" ]]; then
      sed -n '1,$p' "$filtered"
      printf '\n'
    fi
    printf 'NEXT_PUBLIC_FIREBASE_API_KEY=fake-api-key\n'
    printf 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=%s.firebaseapp.com\n' "$DEMO_PROJECT_ID"
    printf 'NEXT_PUBLIC_FIREBASE_PROJECT_ID=%s\n' "$DEMO_PROJECT_ID"
    printf 'NEXT_PUBLIC_FIREBASE_APP_ID=1:1234567890:web:local\n'
    printf 'NEXT_PUBLIC_FIREBASE_USE_EMULATORS=true\n'
  } > "$env_file"
  mv "$filtered" "$RUNTIME_DIR/previous-env-fragment"
}

printf 'First Things First: Firebase local setup\n'
command -v java >/dev/null 2>&1 || fail "Java is required by the Firestore emulator."
command -v nc >/dev/null 2>&1 || fail "nc is required for emulator readiness checks."

mkdir -p "$RUNTIME_DIR" "$DATA_DIR"
write_local_env

if port_ready 9099 && port_ready 8080; then
  printf '[OK] Firebase Auth and Firestore emulators are already running.\n'
else
  if port_ready 9099 || port_ready 8080; then
    fail "Only one required Firebase emulator port is available; stop the conflicting process first."
  fi

  emulator_args=(
    emulators:start
    --only auth,firestore
    --project "$DEMO_PROJECT_ID"
    --export-on-exit "$DATA_DIR"
  )
  if [[ -f "$DATA_DIR/firebase-export-metadata.json" ]]; then
    emulator_args+=(--import "$DATA_DIR")
  fi

  nohup "$ROOT_DIR/node_modules/.bin/firebase" "${emulator_args[@]}" > "$LOG_FILE" 2>&1 &
  emulator_pid=$!
  printf '%s\n' "$emulator_pid" > "$PID_FILE"

  for _ in {1..90}; do
    if port_ready 9099 && port_ready 8080; then
      break
    fi
    if ! kill -0 "$emulator_pid" >/dev/null 2>&1; then
      sed -n '1,160p' "$LOG_FILE" >&2
      fail "Firebase emulators exited during startup."
    fi
    sleep 1
  done

  port_ready 9099 || fail "Firebase Auth emulator did not become ready. See $LOG_FILE"
  port_ready 8080 || fail "Firestore emulator did not become ready. See $LOG_FILE"
  printf '[OK] Firebase Auth and Firestore emulators started.\n'
fi

printf '[OK] .env.local uses the isolated %s emulator project.\n' "$DEMO_PROJECT_ID"
printf 'Start Next.js with: npm run dev\n'
printf 'Emulator UI: http://127.0.0.1:4000\n'
printf 'Email sign-in links appear in the emulator log and Auth Emulator UI.\n'
