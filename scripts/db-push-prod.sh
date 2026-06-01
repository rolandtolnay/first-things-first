#!/usr/bin/env bash
set -euo pipefail

DEV_REF="debzwdzhkcbsvgkhucsa"
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
printf '%sDev is the default target. Prod requires password + confirmation.%s\n' "$DIM" "$RESET"

section "1. Safety check"
linked_ref="$(cat supabase/.temp/project-ref 2>/dev/null || true)"
if [[ "$linked_ref" != "$DEV_REF" ]]; then
  fail "Supabase CLI must be linked to dev before prod migrations."
  printf '  expected: %s\n' "$DEV_REF" >&2
  printf '  current:  %s\n' "${linked_ref:-none}" >&2
  printf '  fix:      supabase link --project-ref %s\n' "$DEV_REF" >&2
  exit 1
fi
ok "Supabase CLI is linked to dev ($DEV_REF)."

section "2. Dev migration preflight"
info "Checking that dev has already received all local migrations..."
dev_dry_run_output="$(supabase db push --linked --dry-run 2>&1)"
print_output "$dev_dry_run_output"

if ! grep -q "Remote database is up to date" <<<"$dev_dry_run_output"; then
  fail "Dev is not up to date with local migrations."
  printf '  Run and verify dev first: %ssupabase db push --linked%s\n' "$BOLD" "$RESET" >&2
  exit 1
fi
ok "Dev is up to date."

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

section "5. Read-only verification grants"
info "Allowing ftf_prod_readonly to inspect Supabase migration history."
supabase db query --db-url "$PROD_DB_URL" \
  "grant usage on schema supabase_migrations to ftf_prod_readonly;" >/dev/null
supabase db query --db-url "$PROD_DB_URL" \
  "grant select on table supabase_migrations.schema_migrations to ftf_prod_readonly;" >/dev/null
ok "Read-only migration metadata access is in place."

section "6. Apply prod migrations"
supabase db push --db-url "$PROD_DB_URL"
ok "Prod migration push finished."

section "7. Read-only verification"
if [[ -n "${FTF_PROD_READONLY_DB_URL:-}" ]]; then
  supabase migration list --db-url "$FTF_PROD_READONLY_DB_URL"
  ok "Verified migration history via read-only prod role."
else
  warn "Skipped: FTF_PROD_READONLY_DB_URL is not set in this shell."
  printf '  Verify manually: %ssupabase migration list --db-url "$FTF_PROD_READONLY_DB_URL"%s\n' "$BOLD" "$RESET"
fi

printf '\n%sDone.%s Production migration workflow complete.\n' "$GREEN$BOLD" "$RESET"
