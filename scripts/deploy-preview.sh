#!/bin/bash
# Working-preview deploy -> Cloudflare Pages (mm-african-kitchen-preview.pages.dev).
#
# Ships EVERYTHING tracked, including WIP surfaces production excludes:
#   Chi-keh voice agent lab:  /avatar-agent-lab.html  /anam-avatar-preview.html
#                             /customer-avatar-preview.html
#   À la carte ordering lab:  /mm-ordering-interface-preview-2026-06-03.html
# Preview-only overrides: crawlers blocked, production CSP relaxed so the
# Anam/agent scripts can load.
#
# Usage: TWE_PAID_SPEND_MAX_USD=0 bash scripts/deploy-preview.sh
set -euo pipefail
cd "$(dirname "$0")/.."

: "${TWE_PAID_SPEND_MAX_USD:?declare TWE_PAID_SPEND_MAX_USD (0 for this deploy)}"

STAGE="$(mktemp -d /tmp/mm-preview-deploy.XXXXXX)"
trap 'rm -rf "$STAGE"' EXIT

git archive HEAD | tar -x -C "$STAGE"
rm -rf "$STAGE/.claude" "$STAGE/scripts"

# Preview surface: never indexed, no strict CSP (labs load external agent SDKs).
printf 'User-agent: *\nDisallow: /\n' > "$STAGE/robots.txt"
rm -f "$STAGE/sitemap.xml"
cat > "$STAGE/_headers" <<'EOF'
/*
  X-Robots-Tag: noindex, nofollow
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
EOF

echo "Deploying $(find "$STAGE" -type f | wc -l | tr -d ' ') files to Pages preview..."
TWE_PAID_SPEND_MAX_USD="$TWE_PAID_SPEND_MAX_USD" TWE_CLI_PROFILE_ALLOW_WRITE=yes \
  python3 "/Users/motwe/Control Room/scripts/client_cli_profile.py" cloudflare-nibiashara -- \
  wrangler pages deploy "$STAGE" --project-name=mm-african-kitchen-preview --commit-dirty=true
