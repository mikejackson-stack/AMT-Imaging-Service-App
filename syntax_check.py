#!/usr/bin/env python3
"""Back-compat wrapper. Prefer scripts/syntax_check.py (works on Linux/macOS/Windows)."""
from pathlib import Path
import runpy
import sys

target = Path(__file__).resolve().parent / "scripts" / "syntax_check.py"
if not target.is_file():
    sys.exit("scripts/syntax_check.py is missing")
runpy.run_path(str(target), run_name="__main__")
