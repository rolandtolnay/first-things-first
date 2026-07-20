#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FIREBASE_CLI="$ROOT_DIR/node_modules/.bin/firebase"
cd "$ROOT_DIR"

if [[ $# -ne 2 ]]; then
  printf 'Usage: %s <firebase-project-id> <authorized-domain>\n' "$0" >&2
  exit 2
fi

project_id="$1"
authorized_domain="$2"

if [[ "$project_id" == demo-* || "$project_id" == "hannas-rhythm" ]]; then
  printf '[ERROR] Refusing a demo or another application project id.\n' >&2
  exit 1
fi
if [[ "$authorized_domain" == *'/'* || -z "$authorized_domain" ]]; then
  printf '[ERROR] Authorized domain must be a bare host name.\n' >&2
  exit 1
fi

[[ -x "$FIREBASE_CLI" ]] || {
  printf '[ERROR] Install dependencies first so the repository Firebase CLI is available.\n' >&2
  exit 1
}
command -v gcloud >/dev/null 2>&1 || {
  printf '[ERROR] gcloud CLI is required for passwordless auth configuration.\n' >&2
  exit 1
}
command -v jq >/dev/null 2>&1 || {
  printf '[ERROR] jq is required.\n' >&2
  exit 1
}

"$FIREBASE_CLI" deploy --only auth --project "$project_id"

access_token="$(gcloud auth print-access-token)"
config_file="$(mktemp)"
payload_file="$(mktemp)"
trap 'rm -f "$config_file" "$payload_file"' EXIT

curl --fail --silent --show-error \
  -H "Authorization: Bearer $access_token" \
  -H "x-goog-user-project: $project_id" \
  "https://identitytoolkit.googleapis.com/admin/v2/projects/$project_id/config" \
  > "$config_file"

jq --arg domain "$authorized_domain" '
  {
    signIn: {
      email: {
        enabled: true,
        passwordRequired: false
      }
    },
    authorizedDomains: ((.authorizedDomains // []) + [$domain] | unique)
  }
' "$config_file" > "$payload_file"

curl --fail --silent --show-error \
  -X PATCH \
  -H "Authorization: Bearer $access_token" \
  -H "x-goog-user-project: $project_id" \
  -H 'Content-Type: application/json' \
  --data-binary "@$payload_file" \
  "https://identitytoolkit.googleapis.com/admin/v2/projects/$project_id/config?updateMask=signIn.email,authorizedDomains" \
  >/dev/null

printf '[OK] Passwordless email-link auth is enabled for %s and %s is authorized.\n' \
  "$project_id" "$authorized_domain"
