#!/usr/bin/env bash
# Repeatable local/dev checks for the AMT Imaging Service App.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

python3 "$ROOT/scripts/syntax_check.py"
node "$ROOT/kb-search-checks.js"

if [[ -d "$ROOT/functions" ]]; then
  if [[ ! -d "$ROOT/functions/node_modules" ]]; then
    echo "Installing functions dependencies (npm ci)…"
    (cd "$ROOT/functions" && npm ci)
  fi
  (cd "$ROOT/functions" && npm run check)
fi

echo "All checks passed."
