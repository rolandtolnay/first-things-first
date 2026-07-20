#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PID_FILE="$ROOT_DIR/.firebase/runtime/emulators.pid"

if [[ ! -f "$PID_FILE" ]]; then
  printf 'No managed Firebase emulator process is recorded.\n'
  exit 0
fi

emulator_pid="$(sed -n '1p' "$PID_FILE")"
if [[ "$emulator_pid" =~ ^[0-9]+$ ]] && kill -0 "$emulator_pid" >/dev/null 2>&1; then
  kill "$emulator_pid"
  printf 'Stopped Firebase emulators (pid %s).\n' "$emulator_pid"
else
  printf 'Recorded Firebase emulator process is no longer running.\n'
fi

mv "$PID_FILE" "$PID_FILE.stopped"
