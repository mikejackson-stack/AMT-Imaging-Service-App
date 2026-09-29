#!/usr/bin/env bash
# Repeatable local/dev checks for the AMT Imaging Service App.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

python3 "$ROOT/scripts/syntax_check.py"
node "$ROOT/kb-search-checks.js"
node "$ROOT/scripts/pm_checklist_checks.js"
node "$ROOT/scripts/access_checks.js"
node "$ROOT/scripts/local_date_checks.js"
node "$ROOT/scripts/gis_boot_checks.js"
node "$ROOT/scripts/sync_merge_checks.js"

PW_DIR="${TMPDIR:-/tmp}/amt-playwright-core"
if [[ ! -d "$PW_DIR/node_modules/playwright-core" ]]; then
  echo "Installing playwright-core for the sign-in sync test…"
  mkdir -p "$PW_DIR"
  # npm --prefix init writes package.json in the current directory, so run it inside PW_DIR.
  (cd "$PW_DIR" && npm init -y >/dev/null && npm install playwright-core --no-fund --no-audit)
fi
NODE_PATH="$PW_DIR/node_modules${NODE_PATH:+:$NODE_PATH}" node "$ROOT/scripts/sync_signin_playwright.js"

if node -e "require('playwright')" >/dev/null 2>&1; then
  node "$ROOT/scripts/draft_checks.js"
else
  echo "Playwright not installed; skipping scripts/draft_checks.js"
fi

if [[ -d "$ROOT/functions" ]]; then
  if [[ ! -d "$ROOT/functions/node_modules" ]]; then
    echo "Installing functions dependencies (npm ci)…"
    (cd "$ROOT/functions" && npm ci)
  fi
  (cd "$ROOT/functions" && npm run check)
fi

echo "All checks passed."
