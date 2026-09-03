#!/usr/bin/env python3
"""Extract the largest inline <script> from the app HTML and run node --check.

Also verifies #panel-manuals stays inside #contentArea (div-depth == 1).
"""
from __future__ import annotations

import re
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TARGETS = ("index.html", "AMT-Imaging-App-standalone.html")


def largest_inline_script(html: str) -> str:
    best = ""
    for match in re.finditer(r"<script(?![^>]*\bsrc=)[^>]*>(.*?)</script>", html, re.I | re.S):
        body = match.group(1)
        if len(body) > len(best):
            best = body
    if not best.strip():
        raise SystemExit("No inline <script> block found")
    return best


def check_div_depth(html: str, label: str) -> int:
    idx_ca = html.find('<div id="contentArea">')
    idx_pm = html.find('<div id="panel-manuals"')
    if idx_ca < 0 or idx_pm < 0:
        print(f"FAIL {label}: contentArea or panel-manuals not found")
        return 1
    seg = html[idx_ca:idx_pm]
    net = len(re.findall(r"<div[^>]*>", seg)) - len(re.findall(r"</div>", seg))
    if net != 1:
        print(f"FAIL {label}: contentArea→panel-manuals net depth {net} (must be 1)")
        return 1
    print(f"OK   {label}: panel-manuals is inside contentArea (net depth 1)")
    return 0


def main() -> None:
    fail = 0
    tmp = Path(tempfile.gettempdir())
    for name in TARGETS:
        path = ROOT / name
        if not path.is_file():
            print(f"skip missing {name}")
            continue
        html = path.read_text(encoding="utf-8")
        fail |= check_div_depth(html, name)
        js = largest_inline_script(html)
        out = tmp / f"amt-{path.stem}-check.js"
        out.write_text(js, encoding="utf-8")
        print(f"OK   {name}: extracted {len(js)} chars → {out}")
        result = subprocess.run(["node", "--check", str(out)], capture_output=True, text=True)
        if result.returncode != 0:
            print(f"FAIL {name}: node --check")
            sys.stderr.write(result.stderr or result.stdout or "")
            fail = 1
        else:
            print(f"OK   {name}: node --check passed")
    sys.exit(fail)


if __name__ == "__main__":
    main()
