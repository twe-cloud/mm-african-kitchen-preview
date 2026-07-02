#!/bin/bash
# Production deploy for mmafricankitchen.com (Netlify, manual — site is NOT git-connected).
#
# Ships git-tracked files ONLY (git archive), then strips WIP/internal surfaces.
# WIP product work (Chi-keh voice agent, à la carte ordering lab) STAYS in git —
# it just doesn't ship to the public production domain until it's ready.
# Preview those surfaces on Cloudflare Pages instead (deploy-preview.sh).
#
# Usage: TWE_PAID_SPEND_MAX_USD=0 bash scripts/deploy-prod.sh
set -euo pipefail
cd "$(dirname "$0")/.."

: "${TWE_PAID_SPEND_MAX_USD:?declare TWE_PAID_SPEND_MAX_USD (0 for this deploy)}"

SITE_ID="70d44bc3-21f2-4813-8208-3a342d8d3888"   # mm-african-kitchen-frisco-preview -> mmafricankitchen.com
STAGE="$(mktemp -d "${TMPDIR:-/tmp}/mm-prod-deploy.XXXXXX")"
trap 'rm -rf "$STAGE"' EXIT

git archive HEAD | tar -x -C "$STAGE"

# --- production exclusions (WIP + internal; keep in git, never on the public domain) ---
rm -rf "$STAGE/.claude" "$STAGE/scripts" "$STAGE/assets/assistant"
rm -f  "$STAGE"/avatar-agent-lab.html \
       "$STAGE"/anam-avatar-preview.html \
       "$STAGE"/customer-avatar-preview.html \
       "$STAGE"/mm-ordering-interface-preview-*.html \
       "$STAGE"/order-config.js "$STAGE"/order-runtime.js \
       "$STAGE"/assets/chikeh-*.js

echo "Deploying $(find "$STAGE" -type f | wc -l | tr -d ' ') files to production..."
netlify deploy --prod --dir "$STAGE" --site "$SITE_ID" --message "${1:-Manual production deploy $(date +%Y-%m-%d)}"

echo "Verifying..."
sleep 3
curl -s -o /dev/null -w "homepage: %{http_code}\n" "https://mmafricankitchen.com/?v=$(date +%s)"
curl -s -o /dev/null -w "wip page excluded (want 404): %{http_code}\n" "https://mmafricankitchen.com/avatar-agent-lab.html"
