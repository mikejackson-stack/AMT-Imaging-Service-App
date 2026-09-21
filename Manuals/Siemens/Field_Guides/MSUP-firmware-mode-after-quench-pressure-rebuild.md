# MSUP firmware mode after quench — pressure rebuild / mode reset

**OEM:** Siemens MRI  
**Type:** AMT field procedure (not OEM SM verbatim)  
**Source:** Field note — Mike / site tech walkthrough with Little / Rich cleared  
**FRU:** Unchanged — no part numbers or FRU interchange claimed

---

## Situation

MSUP went into firmware mode after a quench. Site tried to build pressure. Little walked the reset. Magnet pressure returned to normal **15.5 psia**. Rich headed home. **No MSUP dispatch needed** once pressure was normal.

---

## To reset the mode

1. Power off MSUP
2. Power up MSUP → **System Control** → restart the MARS
3. After MARS reboot completes → **Magnet and Cooling** → **Magnet Status**
4. **Pressure heater control:** change from Off or Automatic to **Manual** (builds pressure quickly). Do an update after 2 minutes. Once it reaches **15.4 psia**, change back to **Automatic**.
5. Monitor **≥30 minutes** to confirm stable. **PHAP** will read higher because it was at 100% duty cycle; should average out after a couple hours.

---

## Monitoring note

- Confirm magnet pressure holds near normal (~15.5 psia observed on this call).
- Expect elevated PHAP briefly after Manual rebuild at 100% duty; average out over ~2 hours.
- If pressure will not rebuild or mode will not clear after this reset, escalate — this note does not invent further OEM recovery steps.

---

## Source attribution

| Field | Value |
|-------|-------|
| Source type | AMT field note |
| Walkthrough | Little (site tech) |
| Cleared by | Rich |
| Filed by | Mike (AMT Imaging Solutions) |
| Outcome on call | Pressure normal; no MSUP needed at that time |

Do not treat this as an OEM Siemens SM claim beyond what was observed and walked on site.
