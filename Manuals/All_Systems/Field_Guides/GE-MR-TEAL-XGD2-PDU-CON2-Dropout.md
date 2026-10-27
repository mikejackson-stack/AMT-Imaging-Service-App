# GE MRI TEAL PDU (XGD2 cabinet): low voltage / CON2 contactor drops out after ~6 s

Applies to: GE MR750w and MR450w with the TEAL XGD/XGD2 PDU (the reference doc sits in the Discovery MR750w and Discovery 450 manual sets).

> DRAFT – AMT field notes. Not a GE or TEAL document. Follow the current GE procedure for your system.
> GE/TEAL doc cited by title only: TEAL PDU Module in XGD2 Cabinet (GE PN 5343114 / TEAL Manual 1060117_A2).
> **Status: In progress, fix not yet confirmed (AMT field case, 27 Oct 2026).**

## Symptoms techs will see
- No power to the RF amp
- No power to the PEN cabinet
- Power would come on for a few seconds, then drop out

These match the CON2 pattern: CON2 pulls in, then drops out after ~6 s.

## Field case summary (AMT field session 27 Oct 2026)
- System: GE MRI TEAL PDU Module in XGD2 Cabinet (GE PN 5343114 / TEAL Manual 1060117_A2).
- Low voltage: ~3.19 V on the 100:1 test points (expected ~4.80 V).
- Very low, ~24 VAC, at PEN Cabinet CB4 and RF-MNS.
- CON2 has power on one side and none on the other; it pulls in, then drops out after ~6 seconds.
- Action: replacing CON2. Fix not yet confirmed.

## Safety first (LOTO)
- Before work: turn off PDU CB1, lock and tag, and confirm no voltage at the Main Input Terminal Board (5343114 §4.1.1). Turn off main CB1 and apply LOTO at the MDP (5343114 §4.1.2).
- Zero-energy check: do not trust the MDP "Power On" light. Measure each input-phase TP to GND and each phase pair, and confirm all read below 1 V (TEAL PDU Module in XGD Cabinet, 5140621, §3.1.1).
- Do NOT turn off the HEC circuit. It feeds the HEC, cryocooler compressor and Magnet Monitor; losing it can boil off cryogens (GE 5760891 Rev 7 §4.1).
- The 100:1 test-point readings below are live measurements. Use your organization's meter, PPE and live-work rules.

## 100:1 test points (A1-PCB1)
A/B/C INPUT and OUTPUT columns are 100:1 (TP reading x 100 = actual voltage).

| Measurement | Nominal at TP | Actual | Source |
|---|---|---|---|
| Phase-to-phase | ~4.80 V | 480 V | AMT field session 27 Oct 2026 |
| Phase-to-GND | ~2.77 V | 277.1 V | Derived: 480 / sqrt(3) / 100 |
| INPUT vs OUTPUT, contactor closed | Should match | – | AMT field session 27 Oct 2026 |
| Fault case | ~3.19 V | – | AMT field session 27 Oct 2026 |

Tolerance: not documented. These are nominal values, not a pass/fail tolerance.

## CON2 check
1. Read the 100:1 INPUT and OUTPUT test points on A1-PCB1. With the contactor closed they should match.
2. If OUTPUT is low or missing while INPUT is normal, check CON2: power on the line side but none on the load side points at CON2.
3. Watch CON2 at power-on. In this case it pulled in, then dropped out after ~6 seconds.
4. Downstream symptom check: ~24 VAC at PEN Cabinet CB4 and RF-MNS instead of normal supply.
5. Field action in this case: replace CON2 (see the contactor replacement section in 5343114).

## Breakers involved
- CB4 = PEN CABINET 208V/20A.
- The gradient section labeled 420V/90A is a separate breaker.

## References
- TEAL PDU Module in XGD2 Cabinet (GE PN 5343114 / TEAL Manual 1060117_A2), title only.
- [Reference used in field: 1051587-1112335.pdf](https://raw.githack.com/mikejackson-stack/AMT-Imaging-Service-App/main/Manuals/GE/Discovery%20750w/root/data/Signa_EXCITE/media/1051587-1112335.pdf) (GE Discovery MR750w GEM Service Methods 5670006, topic 1051587 "Teal PDU Installation and Maintenance": installation guide for the XGD2 Teal PDU, P/N 5343114; also in the Discovery 450 and Discovery_750 folders)

## Related
- 48V PDU supplies in the same TEAL XGD/XGD2 PDU: guide dg_mr450w_48v_pdu_ps_condor_delta.

## Status
In progress, fix not yet confirmed (AMT field case, 27 Oct 2026). Update this guide when the CON2 replacement result is known.

Keywords: MR750w, MR450w, Discovery MR750w, Optima MR450w, XGD, 1051587, 1051587-1112335, CON2, contactor, TEAL, XGD2, PDU, 5343114, 1060117_A2, CB4, pen cabinet, RF-MNS, RF amp, no power, drops out, low voltage, 100:1, test points, A1-PCB1
