#!/usr/bin/env python3
"""Sha256 and PDF page checks for the GE loose manual batch.

Missing files are reported as pending so a partial upload can stay green.
A present file with the wrong sha256, or an entry whose open_page is past
the end of a present PDF, fails. When every manifest file is on disk the
check is complete.
"""
from __future__ import annotations

import hashlib
import json
import sys
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET

ROOT = Path(__file__).resolve().parent.parent
MANIFEST = ROOT / "kb" / "ge-loose-file-manifest.json"
ENTRIES = ROOT / "kb" / "ge-loose-kb.json"


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as fh:
        for chunk in iter(lambda: fh.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def pdf_pages(path: Path) -> int:
    from pypdf import PdfReader

    reader = PdfReader(str(path), strict=False)
    return len(reader.pages)


def docx_pages(path: Path) -> int:
    with zipfile.ZipFile(path) as zf:
        xml = zf.read("docProps/app.xml")
    root = ET.fromstring(xml)
    ns = {"ep": "http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"}
    el = root.find("ep:Pages", ns)
    if el is None or not (el.text or "").strip():
        raise RuntimeError("docx has no page count in docProps/app.xml: " + path.name)
    return int(el.text)


def page_count(path: Path) -> int:
    lower = path.suffix.lower()
    if lower == ".pdf":
        return pdf_pages(path)
    if lower == ".docx":
        return docx_pages(path)
    raise RuntimeError("no page counter for " + path.name)


def main() -> int:
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    entries = json.loads(ENTRIES.read_text(encoding="utf-8"))
    failures = []
    pending = []
    present = {}

    for item in manifest:
        rel = item["target_path"]
        path = ROOT / rel
        if not path.is_file():
            pending.append(rel)
            continue
        size = path.stat().st_size
        if size != item["bytes"]:
            failures.append(f"size {rel}: {size} != {item['bytes']}")
            continue
        digest = sha256(path)
        if digest != item["sha256"]:
            failures.append(f"sha256 {rel}")
            continue
        try:
            present[rel] = page_count(path)
        except Exception as exc:  # noqa: BLE001 - report and keep checking
            failures.append(f"pages {rel}: {exc}")

    for entry in entries:
        rel = entry.get("pdf_path") or ""
        if rel not in present:
            continue
        open_page = int(entry.get("open_page") or 0)
        count = present[rel]
        if open_page < 1 or open_page > count:
            failures.append(
                f"open_page {entry.get('id')} p.{open_page} > {count} ({Path(rel).name})"
            )

    print(f"manifest files present {len(present)}/{len(manifest)}")
    print(f"page counts checked for {len(present)} files")
    if failures:
        print("FAIL")
        for line in failures[:40]:
            print(" ", line)
        if len(failures) > 40:
            print(f"  ... {len(failures) - 40} more")
        return 1
    if pending:
        for rel in pending:
            print(" ", rel)
        print(f"PENDING {len(pending)} manifest files not in the repo yet")
        return 0
    print("ALL FILES OK sha256 and open_page")
    return 0


if __name__ == "__main__":
    sys.exit(main())
