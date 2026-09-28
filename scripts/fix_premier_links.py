#!/usr/bin/env python3
"""Rewrite GE Signa Premier landing-page links that omit the root/ prefix.

Manuals/GE/Premier/index.htm is opened from a URL whose directory is
Manuals/GE/Premier/, but the HTML manual pages live under
Manuals/GE/Premier/root/. Relative href/src values that miss there and
hit a real file under root/ are rewritten to root/<original>.

Fragments and queries stay on the link. Absolute URLs, mailto links, and
targets that already exist next to index.htm are left unchanged. Nothing
else in the file is modified, and missing files are not invented.
"""
from __future__ import annotations

import sys
from html import unescape
from html.parser import HTMLParser, attrfind_tolerant, tagfind_tolerant
from pathlib import Path
from urllib.parse import unquote

ROOT = Path(__file__).resolve().parent.parent
INDEX = ROOT / "Manuals" / "GE" / "Premier" / "index.htm"
PAGE_DIR = INDEX.parent
MANUAL_ROOT = PAGE_DIR / "root"


class LinkParser(HTMLParser):
    """Collect href/src attribute spans without rewriting the document."""

    def __init__(self) -> None:
        super().__init__(convert_charrefs=False)
        self.links: list[dict] = []

    def parse_starttag(self, i: int):
        endpos = super().parse_starttag(i)
        if isinstance(endpos, int) and endpos >= 0:
            raw = self.get_starttag_text()
            if raw:
                self._collect(i, raw)
        return endpos

    def _collect(self, abs_start: int, tag: str) -> None:
        name_match = tagfind_tolerant.match(tag, 1)
        if not name_match:
            return
        k = name_match.end()
        end = len(tag)
        while k < end:
            attr = attrfind_tolerant.match(tag, k)
            if not attr:
                break
            attr_name = attr.group(1) or ""
            token = attr.group(3)
            if token and attr_name.lower() in {"href", "src"}:
                if token[:1] in {"'", '"'} and token[-1:] == token[:1]:
                    value_start = attr.start(3) + 1
                    value_end = attr.end(3) - 1
                else:
                    value_start = attr.start(3)
                    value_end = attr.end(3)
                self.links.append(
                    {
                        "name": attr_name.lower(),
                        "value": tag[value_start:value_end],
                        "start": abs_start + value_start,
                        "end": abs_start + value_end,
                    }
                )
            k = attr.end()


def _has_scheme(value: str) -> bool:
    """True for absolute URLs, mailto, and any other URI scheme."""
    stripped = value.strip()
    if stripped.startswith("//"):
        return True
    head = stripped.split("/", 1)[0]
    if ":" not in head:
        return False
    scheme = head.split(":", 1)[0]
    return bool(scheme) and all(ch.isalnum() or ch in "+-." for ch in scheme)


def _path_part(value: str) -> str:
    """URL path with the query and fragment removed, still percent-encoded."""
    cut = len(value)
    for sep in ("?", "#"):
        idx = value.find(sep)
        if idx != -1:
            cut = min(cut, idx)
    return value[:cut]


def _inside(base: Path, rel: str) -> Path | None:
    """Resolve rel under base, or None when it escapes base."""
    if rel.startswith(("/", "\\")):
        return None
    candidate = (base / rel).resolve()
    try:
        candidate.relative_to(base.resolve())
    except ValueError:
        return None
    return candidate


def classify(value: str) -> str:
    """Return 'skip', 'ok', 'fix', or 'broken' for one attribute value."""
    if value.strip() == "" or _has_scheme(value):
        return "skip"
    path = unquote(unescape(_path_part(value.strip())))
    if path == "":
        return "ok"
    current = _inside(PAGE_DIR, path)
    if current is not None and current.exists():
        return "ok"
    rewritten = _inside(MANUAL_ROOT, path)
    if rewritten is not None and rewritten.exists():
        return "fix"
    return "broken"


def rewritten_value(value: str) -> str:
    """Prefix root/ while keeping surrounding whitespace, query, and fragment."""
    lead = len(value) - len(value.lstrip())
    trail = len(value) - len(value.rstrip())
    core = value[lead : len(value) - trail] if trail else value[lead:]
    return f"{value[:lead]}root/{core}{value[len(value) - trail :] if trail else ''}"


def parse_links(text: str) -> list[dict]:
    parser = LinkParser()
    parser.feed(text)
    parser.close()
    for link in parser.links:
        found = text[link["start"] : link["end"]]
        if found != link["value"]:
            raise RuntimeError(
                f"attribute span mismatch for {link['name']}={link['value']!r}"
            )
    return parser.links


def apply_fixes(text: str, links: list[dict]) -> tuple[str, int]:
    """Rewrite fixable links from the end so earlier spans stay valid."""
    fixed = 0
    for link in reversed(links):
        if classify(link["value"]) != "fix":
            continue
        new_value = rewritten_value(link["value"])
        text = text[: link["start"]] + new_value + text[link["end"] :]
        fixed += 1
    return text, fixed


def still_broken(text: str) -> list[str]:
    broken = []
    for link in parse_links(text):
        if classify(link["value"]) == "broken":
            broken.append(link["value"])
    return broken


def report(total: int, broken_before: int, fixed: int, broken: list[str]) -> None:
    print(f"total links: {total}")
    print(f"broken before: {broken_before}")
    print(f"fixed: {fixed}")
    print(f"still broken after: {len(broken)}")
    if broken:
        print("still broken:")
        seen: dict[str, int] = {}
        order: list[str] = []
        for value in broken:
            if value not in seen:
                order.append(value)
                seen[value] = 0
            seen[value] += 1
        for value in order:
            count = seen[value]
            suffix = f" (x{count})" if count > 1 else ""
            print(f"  {value}{suffix}")
    else:
        print("still broken: none")


def main() -> int:
    if not INDEX.is_file():
        print(f"missing {INDEX}", file=sys.stderr)
        return 1
    original = INDEX.read_text(encoding="utf-8")
    links = parse_links(original)
    statuses = [classify(link["value"]) for link in links]
    broken_before = statuses.count("broken") + statuses.count("fix")
    updated, fixed = apply_fixes(original, links)
    if updated != original:
        INDEX.write_text(updated, encoding="utf-8", newline="")
    broken = still_broken(updated)
    report(len(links), broken_before, fixed, broken)
    # A second classification of the written text must agree with the rewrite.
    if statuses.count("fix") != fixed:
        print("fix count did not match classified links", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
