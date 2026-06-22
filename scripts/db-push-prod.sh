#!/usr/bin/env bash
set -euo pipefail

PROD_REF="oftgmjfgaycavrurnfsk"
PROD_POOLER_HOST="aws-1-eu-central-1.pooler.supabase.com"

if [[ -t 1 && -z "${NO_COLOR:-}" ]]; then
  BOLD="$(printf '\033[1m')"
  DIM="$(printf '\033[2m')"
  RED="$(printf '\033[31m')"
  GREEN="$(printf '\033[32m')"
  YELLOW="$(printf '\033[33m')"
  BLUE="$(printf '\033[34m')"
  RESET="$(printf '\033[0m')"
else
  BOLD=""
  DIM=""
  RED=""
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
  printf '%s[ERROR]%s %s\n' "$RED" "$RESET" "$1" >&2
}

print_output() {
  sed 's/^/  /' <<<"$1"
}

printf '%s+--------------------------------------+%s\n' "$BOLD" "$RESET"
printf '%s| First Things First: Prod DB Push |%s\n' "$BOLD" "$RESET"
printf '%s+--------------------------------------+%s\n' "$BOLD" "$RESET"
printf '%sLocal Supabase is the dev rehearsal target. Prod requires password + confirmation.%s\n' "$DIM" "$RESET"

section "1. Artifact check"
if [[ "${ALLOW_DIRTY_PROD_DB_PUSH:-}" != "1" ]]; then
  artifact_status="$(git status --porcelain --untracked-files=all -- \
    supabase/migrations \
    supabase/seed.sql \
    src/lib/supabase/database.types.ts \
    scripts/db-push-prod.sh \
    scripts/dev-setup-local.sh)"
  if [[ -n "$artifact_status" ]]; then
    fail "Prod DB pushes must promote checked-in migration workflow artifacts."
    printf '  Commit or stash changes under migrations, generated DB types, seed, and DB scripts first.\n' >&2
    print_output "$artifact_status" >&2
    printf '  Exceptional override: %sALLOW_DIRTY_PROD_DB_PUSH=1 npm run db:push:prod%s\n' "$BOLD" "$RESET" >&2
    exit 1
  fi
  ok "Migration workflow artifacts are clean."
else
  warn "ALLOW_DIRTY_PROD_DB_PUSH=1 set; dirty migration artifact gate bypassed."
fi

section "2. Local migration preflight"
info "Resetting local Supabase with checked-in migrations and supabase/seed.sql..."
supabase db reset
ok "Local database reset succeeded."

info "Running tests against the checked-in app code..."
npm run test:run
ok "Tests passed."

info "Running lint..."
npm run lint
ok "Lint passed."

section "3. Prod credentials"
printf '%sProd Supabase DB password:%s ' "$BOLD" "$RESET"
read -rs PROD_DB_PASSWORD
echo
ENCODED_PASSWORD="$(python3 -c 'import sys, urllib.parse; print(urllib.parse.quote(sys.argv[1], safe=""))' "$PROD_DB_PASSWORD")"
PROD_DB_URL="postgresql://postgres.${PROD_REF}:${ENCODED_PASSWORD}@${PROD_POOLER_HOST}:5432/postgres"

cleanup() {
  unset PROD_DB_PASSWORD ENCODED_PASSWORD PROD_DB_URL
}
trap cleanup EXIT

section "4. Prod dry-run"
info "No changes are applied in this step. Review the output before confirming."
supabase db push --db-url "$PROD_DB_URL" --dry-run

printf '\n%sApply these migrations to PRODUCTION (%s)?%s [y/N] ' "$YELLOW$BOLD" "$PROD_REF" "$RESET"
read -r confirm
case "$confirm" in
  [yY]|[yY][eE][sS]) ok "Confirmation received." ;;
  *)
    warn "Aborted before touching production."
    exit 0
    ;;
esac

section "5. Apply prod migrations"
supabase db push --db-url "$PROD_DB_URL"
ok "Prod migration push finished."

section "6. Read-only verification"
if [[ -n "${FTF_PROD_READONLY_DB_URL:-}" ]]; then
  supabase migration list --db-url "$FTF_PROD_READONLY_DB_URL"
  ok "Verified migration history via read-only prod role."
else
  warn "Skipped: FTF_PROD_READONLY_DB_URL is not set in this shell."
  printf '  Verify manually: %ssupabase migration list --db-url "$FTF_PROD_READONLY_DB_URL"%s\n' "$BOLD" "$RESET"
fi

printf '\n%sDone.%s Production migration workflow complete.\n' "$GREEN$BOLD" "$RESET"
