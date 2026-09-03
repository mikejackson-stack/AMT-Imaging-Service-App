#!/usr/bin/env python3
"""Serve the GitHub Pages app files only — not the multi-GB Manuals/ tree.

Matches production Pages content: index.html, rates.json, sw.js.
Default local/dev talks to hosted Firebase (amt-imaging-service-app).
"""
from __future__ import annotations

import argparse
import os
import shutil
import socketserver
import sys
import tempfile
from http.server import SimpleHTTPRequestHandler
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PAGES_FILES = ("index.html", "rates.json", "sw.js")
OPTIONAL_FILES = (".nojekyll",)


class ReuseTCPServer(socketserver.TCPServer):
    allow_reuse_address = True


def stage_pages(dest: Path) -> None:
    dest.mkdir(parents=True, exist_ok=True)
    missing = [name for name in PAGES_FILES if not (ROOT / name).is_file()]
    if missing:
        sys.exit("Missing required app files: " + ", ".join(missing))
    for name in PAGES_FILES:
        shutil.copy2(ROOT / name, dest / name)
    for name in OPTIONAL_FILES:
        src = ROOT / name
        if src.is_file():
            shutil.copy2(src, dest / name)


def main() -> None:
    parser = argparse.ArgumentParser(description="Serve AMT Imaging Service App (Pages files only)")
    parser.add_argument("--port", type=int, default=int(os.environ.get("PORT", "8080")))
    parser.add_argument("--bind", default=os.environ.get("AMT_BIND", "0.0.0.0"))
    args = parser.parse_args()

    staging = Path(tempfile.mkdtemp(prefix="amt-devsite-"))
    stage_pages(staging)
    os.chdir(staging)

    handler = SimpleHTTPRequestHandler
    try:
        httpd = ReuseTCPServer((args.bind, args.port), handler)
    except OSError as err:
        sys.exit(f"Could not bind {args.bind}:{args.port}: {err}")

    print(f"AMT Imaging Service App", flush=True)
    print(f"  http://127.0.0.1:{args.port}/", flush=True)
    print(f"  serving {staging} (index.html, rates.json, sw.js)", flush=True)
    print("  Hosted Firebase: amt-imaging-service-app (Auth / Firestore / Ask Grok)", flush=True)
    print("  PIN login works here. Ask Grok still requires Google sign-in (PIN cannot call it).", flush=True)
    print("  Optional functions emulator: add ?functionsEmulator=1 on localhost after starting emulators.", flush=True)
    print("  Never put XAI_API_KEY or service-account JSON in this tree.", flush=True)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")
    finally:
        httpd.server_close()


if __name__ == "__main__":
    main()
