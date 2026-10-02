#!/usr/bin/env bash
# Repeatable local/dev checks for the AMT Imaging Service App.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

python3 "$ROOT/scripts/syntax_check.py"

# The internal note block from the PM agreement draft must never ship (repo is public).
# Patterns are split so this script does not contain the forbidden phrases.
MIKE_NOTE="NOTE FOR ""MIKE"
NOT_PART="NOT PART OF THE ""AGREEMENT"
if grep -rIn --exclude-dir=.git --exclude-dir=node_modules -e "$MIKE_NOTE" -e "$NOT_PART" . ; then
  echo "FAIL: internal PM agreement note text found in the repo." >&2
  exit 1
fi
echo "OK: no internal PM agreement note text in the repo"
node "$ROOT/kb-search-checks.js"
node "$ROOT/scripts/pm_checklist_checks.js"
node "$ROOT/scripts/access_checks.js"
node "$ROOT/scripts/local_date_checks.js"
node "$ROOT/scripts/gis_boot_checks.js"
node "$ROOT/scripts/sync_merge_checks.js"

PW_DIR="${TMPDIR:-/tmp}/amt-playwright-core"
if [[ ! -d "$PW_DIR/node_modules/playwright" || ! -d "$PW_DIR/node_modules/playwright-core" ]]; then
  echo "Installing Playwright for the sign-in sync test and draft_checks.js…"
  mkdir -p "$PW_DIR"
  # npm init writes package.json in the current directory, so run it inside PW_DIR.
  # System Chrome is used via CHROME_PATH, so the browser download is skipped.
  (cd "$PW_DIR" && npm init -y >/dev/null && PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm install playwright --no-fund --no-audit)
fi
export NODE_PATH="$PW_DIR/node_modules${NODE_PATH:+:$NODE_PATH}"
node "$ROOT/scripts/sync_signin_playwright.js"
node "$ROOT/scripts/draft_checks.js"
node "$ROOT/scripts/library_cache_checks.js"

if [[ -d "$ROOT/functions" ]]; then
  if [[ ! -d "$ROOT/functions/node_modules" ]]; then
    echo "Installing functions dependencies (npm ci)…"
    (cd "$ROOT/functions" && npm ci)
  fi
  (cd "$ROOT/functions" && npm run check)
fi

echo "All checks passed."
