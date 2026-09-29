#!/usr/bin/env python3
"""Print the GE MR Excite II checklist payload as JSON for the in-app template."""
from __future__ import annotations

import importlib.util
import json
from pathlib import Path


def load():
    path = Path(__file__).resolve().parent / "pm_exii_content.py"
    spec = importlib.util.spec_from_file_location("pm_exii_content", path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def reading(row):
    rid, label, unit, spec, note, _src_a, _src_b = row
    return {"id": rid, "label": label, "unit": unit, "spec": spec, "note": note}


def payload(mod):
    sections = []
    for _secno, title, groups in mod.flow_tasks():
        out_groups = []
        for gtitle, rows in groups:
            tasks = []
            for no, oid, text, interval, _only, _a, _b, _sname, offline in rows:
                tasks.append({
                    "no": no,
                    "id": oid,
                    "text": text,
                    "interval": interval,
                    "offline": offline,
                })
            out_groups.append({"title": gtitle, "tasks": tasks})
        sections.append({"title": title, "groups": out_groups})
    return {
        "docNo": mod.DOC_NO,
        "rev": mod.REV,
        "docDate": mod.DOC_DATE,
        "title": mod.TITLE,
        "co": mod.CO,
        "coSub": mod.CO_SUB,
        "instructions": list(mod.INSTRUCTIONS),
        "sysinfo": [{"key": key, "label": label} for key, label, _src in mod.SYSINFO],
        "nEquip": mod.N_EQUIP,
        "cal": [reading(row) for row in mod.CAL],
        "mag": [reading(row) for row in mod.MAG],
        "other": [reading(row) for row in mod.OTHER_READ],
        "footnotes": [{"n": n, "text": text} for n, text in mod.FOOTNOTES],
        "sections": sections,
        "interviewN": mod.N_INTERVIEW,
        "actionCodes": mod.ACTION_CODES,
        "condition": [{"key": key, "title": title, "text": text} for key, title, text in mod.CONDITION],
        "appendix": {
            "intro": mod.APPX_INTRO,
            "conflicts": list(mod.REV_NOTES_CONFLICTS),
            "aOnly": list(mod.REV_NOTES_A_ONLY),
            "bOnly": list(mod.REV_NOTES_B_ONLY),
            "added": list(mod.AMT_ADDED),
        },
    }


def main():
    print(json.dumps(payload(load()), ensure_ascii=False, separators=(",", ":")))


if __name__ == "__main__":
    main()
