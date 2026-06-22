#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [[ -t 1 && -z "${NO_COLOR:-}" ]]; then
  BOLD="$(printf '\033[1m')"
  DIM="$(printf '\033[2m')"
  GREEN="$(printf '\033[32m')"
  YELLOW="$(printf '\033[33m')"
  BLUE="$(printf '\033[34m')"
  RESET="$(printf '\033[0m')"
else
  BOLD=""
  DIM=""
  GREEN=""
  YELLOW=""
  BLUE=""
  RESET=""
fi

section() {
  printf '\n%s== %s ==%s\n' "$BLUE" "$1" "$RESET"
}

info() {
  printf '%s--%s %s\n' "$DIM" "$RESET" "$1"
}

ok() {
  printf '%s[OK]%s %s\n' "$GREEN" "$RESET" "$1"
}

warn() {
  printf '%s[WARN]%s %s\n' "$YELLOW" "$RESET" "$1"
}

fail() {
  printf '[ERROR] %s\n' "$1" >&2
}

extract_status_var() {
  local name="$1"
  awk -F= -v name="$name" '$1 == name { value = substr($0, index($0, "=") + 1); gsub(/^"|"$/, "", value); print value; exit }'
}

write_next_env() {
  local api_url="$1"
  local anon_key="$2"
  local env_file=".env.local"
  local tmp_file
  tmp_file="$(mktemp)"

  if [[ -f "$env_file" ]]; then
    grep -vE '^(NEXT_PUBLIC_SUPABASE_URL|NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)=' "$env_file" > "$tmp_file" || true
  fi

  {
    if [[ -s "$tmp_file" ]]; then
      cat "$tmp_file"
      printf '\n'
    fi
    printf 'NEXT_PUBLIC_SUPABASE_URL=%s\n' "$api_url"
    printf 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=%s\n' "$anon_key"
  } > "$env_file"

  rm -f "$tmp_file"
}

printf '%s+---------------------------------------+%s\n' "$BOLD" "$RESET"
printf '%s| First Things First: Local Dev Setup |%s\n' "$BOLD" "$RESET"
printf '%s+---------------------------------------+%s\n' "$BOLD" "$RESET"

section "1. Tooling"
if ! command -v supabase >/dev/null 2>&1; then
  fail "Supabase CLI is required. Install it first: https://supabase.com/docs/guides/local-development"
  exit 1
fi
ok "Supabase CLI found: $(supabase --version)"

section "2. Local Supabase"
info "Starting local Supabase containers..."
supabase start
ok "Local Supabase is running."

section "3. Local database reset"
info "Applying migrations and loading supabase/seed.sql..."
supabase db reset
ok "Local database reset complete."

section "4. Next.js local env"
status_env="$(supabase status -o env)"
api_url="$(printf '%s\n' "$status_env" | extract_status_var API_URL)"
anon_key="$(printf '%s\n' "$status_env" | extract_status_var ANON_KEY)"

if [[ -z "$api_url" || -z "$anon_key" ]]; then
  fail "Could not read API_URL/ANON_KEY from 'supabase status -o env'."
  printf '\nRun this command and copy the local API_URL/ANON_KEY into .env.local as:\n' >&2
  printf '  NEXT_PUBLIC_SUPABASE_URL=<API_URL>\n' >&2
  printf '  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<ANON_KEY>\n' >&2
  exit 1
fi

write_next_env "$api_url" "$anon_key"
ok "Updated .env.local with local Supabase public env values."

section "5. Login"
printf 'Start the app with: %snpm run dev%s\n' "$BOLD" "$RESET"
printf 'Sign in locally as: %sdev@example.com%s\n' "$BOLD" "$RESET"
printf 'Read local magic-link emails in Inbucket: %shttp://127.0.0.1:54324%s\n' "$BOLD" "$RESET"
printf 'Open local Supabase Studio: %shttp://127.0.0.1:54323%s\n' "$BOLD" "$RESET"
printf '\n%sDone.%s Local development is ready.\n' "$GREEN$BOLD" "$RESET"
