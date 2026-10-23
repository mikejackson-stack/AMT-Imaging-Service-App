# MR450w 48V PDU power supply replacement, Condor to Delta (GE 5745311 / Delta DPR3000B-48)

> DRAFT – AMT field notes compiled from GE service documentation. Not a GE document and not GE-certified.
> Follow the current GE procedure for your system and software. **[Inferred]** = not stated in a GE source.

## Part
- **GE FRU 5745311**, "Delta 48V 2500W Power Supply". Fits PS1 and PS2 of the TEAL XGD PDU (GE 5140621) in the PGR cabinet. [DOC1805613 Rev3 Table 3, item 4; GE Service Shop 5745311-R]
- **Unit on hand:** Delta DPR3000B-48 IDA4 "EnergE", Model ESR-48/56C F2 Rev 02.
- Input: 100–164 / 200–240 VAC, 17 A, 50–60 Hz.
- Output: 54 VDC, up to 55.6 A.
- Rear connector: FCI PwrBlade 51939.
- Ships with a yellow "CM-2 / 48V output for GE" label and a small adapter PCB.
- GE shipped this unit as the PS1 replacement with the output already set before shipping; no output adjustment is needed. GE identifies a Delta supply by its **"EnergE" label** [5690015-2EN step 1; DOC1805616 App. A p.57].
- **Brackets:**
- 5140621-10: the original Delta bracket, with a harness connector on the back of each supply (secures PS1/PS2 with spring-loaded latch mounting pins plus 3 side clamping screws).
- 5343114-10 (TEAL 4991419): the blind-mate bracket. The supplies plug straight into a rear connector and lock with spring-loaded latch mounting pins; supersedes 5140621-10 and obsolete 2-piece Condor brackets 0590905 (upper) / 0590902 (lower) [DOC1805613 Rev 3 Table 3 p. 19].
- **Superseded part:** Condor 48V 1000W, GE 5140621-4 (TEAL 4990782).
- **Updated E-Stop contactors (CON1–CON2):** GE 5140621-11 / TEAL 4990781 (updated from 5140621-3 in DOC1805613 Rev 3 Table 3 p. 19).

## Sources
1. GE **Optima MR450w GEM service manual 5690015-2EN Rev 5**, topic "Replacing the 48V power supply" (id_2022137, v1.13, Mar 2023). [Open the 450w manual page](https://raw.githack.com/mikejackson-stack/AMT-GE-Manuals/main/Optima%20450W%20GEM/root/t_ReplacingThe48VPowerSupply_DV.html). **This is the 450w procedure.**
2. GE SIGNA PET/MR 5490579-3 Rev 12, the same topic (v1.14, Dec 2024). Location: AMT-GE-Manuals `Signa PET_MRI/root/t_ReplacingThe48VPowerSupply_DV.html`.
3. DOC1805613 Rev 3 (07/2021), "TEAL PDU Module (5140621) in XGD Cabinet": §3.1 LOTO, Table 3 (p. 19), §4.2.6 (p. 44), §4.2.14 troubleshooting, Appendix A (pp. 61–71). Revision history (p. viii) confirms §4.2.6 and Appendix A absorbed GE Service Note **DOC2175961** ("48V PDU Power Supply Replacement (Condor to Delta)").
4. DOC1805616 Rev 3 (12/2019), "TEAL PDU Module in XGD2 Cabinet (5343114)": **Appendix A, "GE FIELD NOTIFICATION: Instructions to replace Condor 48V PS Assy. with Delta 48V PS assembly"**, pp. 56–79 (covers both XGD `5140621` and XGD2 `5343114`).
5. TEAL **TSB102109-1 Rev A0** (10/21/2009 — saved in OneDrive/Drive/App under the filename `48v ps Teal replacement.pdf`): 2009 screw rework (**Kit 4990913**) **ONLY for obsolete 2-piece Condor brackets (`0590905` upper / `0590902` lower)** on 25 early XGD PDUs (`TEAL 6600003` / `GE 5140621`, S/Ns `97679–115507`, built `12/14/2007–8/7/2008`). **Superseded by the Delta conversion; NEVER use 8-32 screws in Delta power supply casings.**
6. DOC2766902 Rev 1 (09/2022), "TEAL PDU Module in XGD3 Cabinet (5890114)" (Signa Artist Evo / Premier 48VDC tray architecture `5890114-2` / TEAL `4991731`).
7. Delta DPR3000B fact sheet (web).

## Before you start
- **Confirm the failed supply** [DOC1805613 §4.2.14 / App. A]:
- A supply has failed if its green OK LED is off with power applied and the PDU not in ESTOP, or if the LED is lit but there is no 48 V out.
- With CB9 on, J4 A1–A2 on the PTC board should read +48 VDC.
- LED states [DOC1805616 p.64]: OK green = operating; off = shutdown; blinking = standby. NL yellow = output current under 5% of nominal.
- **Error codes pointing here:**
- 2268225 EM_PDU_INT_FAIL: 48V under- or overvoltage, PS1 degraded.
- 2267825: E-stop, possibly a low 48V supply.
- 2267941: AUX 48V fault.
- **Condor or Delta now fitted?** Check the maintenance sticker 5661793 on the front of the PDU, or look through the PDU vent holes with a flashlight for the "EnergE" label [5690015-2EN].
- **Condor fitted:** replace **both** PS1 and PS2 with two 5745311 supplies plus a Delta bracket. This is the first-time conversion.
- **Delta fitted:** replace only the failed supply.
- **Tools:** nonmagnetic titanium tool kit 5112581 or 5113258, maintenance sticker 5661793, masking tape and marker.

## Procedure (summary; per 5690015-2EN)
1. **Lock out the PDU.**
- DOC1805613 §3.1.1: shut down the host. Turn off the blower and pumps at the PLC keypad (^+F1/F2/F3). Press System Off on the MDP and turn the main input switch off.
- Put the magnet monitor in Service mode.
- Building power is disconnected (customer electrician), then apply LOTO.
- Verify less than 1 V phase-to-ground and phase-to-phase at the MDP test points.
2. **Open the PDU.**
- Remove the 4 × 6-32 x 3/8 screws on the circuit-breaker guard, then the 10-32 x 1/2 front-panel screws. Lower the panel away from the unit without damaging the leak-sensor strip.
- Disconnect SW1 and SW2 by turning the tabs counter-clockwise.
- Separate P8/J8, the 15-pin connectors.
3. **Remove the receptacle assembly** on the bottom of the unit (3 × 10-32 x 1/2 screws).
- Not needed when swapping one supply in a blind-mate bracket.
- If wires on CB2 are in the way, label and disconnect them or unscrew the breaker.
4. **Pull the supply assembly.**
- Remove 2 Keps nuts and washers on the bracket and 2 on the ground wires. Cut the harness tie if needed.
- Lift the assembly over the studs and draw it forward. Keep the **RF cable** clear of the housing.
5. **First-time Condor-to-Delta conversion only:** label each Condor terminal-block wire and move it to the Delta bracket terminal block. Pin 1 is on the left.

| Wire run | Function | Delta TB |
|---|---|---|
| 89 | L AC in | 1 |
| 90 | N AC in | 2 |
| 91, 99 | Ground | 3 |
| — | No connection | 4 |
| 93, 107 | PS1 − return | 5, 6 |
| 108, 94 | PS1 +48V | 7, 8 |
| 95 | PS2 − return | 9 |
| 96 | PS2 +48V | 10 |
| 97 / 98 | B1 Common / C1 Inhibit | 11 / 12 |

Wires 97/98 per the 450w manual (5690015-2EN Rev 5): **97 = B1 Common, terminal 11; 98 = C1 Inhibit, terminal 12.**
6. **Swap the supply.**
- **5140621-10 bracket:**
- Loosen the 3 bottom screws on one side of the bracket.
- Unplug the rear harness connector. PS1 is the top supply and PS2 the bottom; each harness reaches only its own slot.
- Press the slide buttons on both sides to retract the mounting pins, and pull the supply out.
- Insert the new supply part way, connect its harness, and push it home.
- Extend the pins with the slide buttons and tighten the 3 screws.
- **5343114-10 blind-mate bracket:** retract the pins, pull the supply, push the new supply in until it seats in the rear blind-mate connector, then extend the pins. DOC1805616 calls this "a critical step for functional operation".
7. **Reinstall the assembly.**
- Tilt it so the terminal block clears the CB2 bracket. Keep the RF cable clear.
- Refit the Keps nuts and washers, the grounds, CB2 and its wiring, and the receptacle assembly.
- **CAUTION — Do NOT use `8-32` casing screws on Delta supplies (`TSB102109-1` applies ONLY to obsolete Condor brackets):** Delta brackets (`5140621-10` existing harness or `5343114-10` / TEAL `4991419` blind-mate) use **spring-loaded latch mounting pins** (plus the 3 side clamping screws on `5140621-10`) and **NEVER use `8-32` screws into the Delta power supply casing**. TEAL **`TSB102109-1` (`Rev A0`, 10/21/2009 — saved in OneDrive/Drive/App under the filename `48v ps Teal replacement.pdf`)** was a 2009 rework **ONLY** for the **obsolete 2-piece Condor brackets (`0590905` upper / `0590902` lower)** on 25 early XGD PDUs (`TEAL 6600003` / `GE 5140621`, S/Ns `97679–115507`, built `12/14/2007–8/7/2008`), where `8-32x3/8"` casing screws bottomed out and shorted `PS1`/`PS2` to ground (replaced by Kit `4990913`: eight `8-32x1/4"` 100° countersink Phillips screws `0110091` at `16 in-lbs` with Loctite #242 + two torque labels `1181431`). When upgrading an early PDU from Condor to Delta, discard the 2-piece Condor brackets and `8-32` screws and install the Delta bracket.
8. **First-time conversion only: rewire CON1's AUX contact.**
- Move wire 97 from terminal 21 (NC) to 13 (NO).
- Move wire 98 from terminal 22 (NC) to 14 (NO).
- GE says this is **required to activate the Delta supplies** [DOC1805616 App. A].
- Click the AUX switch back onto CON1.
9. **Close up.**
- Reconnect P8/J8 and SW1/SW2.
- Check the control-board toggle switch above the supplies: on XGD it should be **left (green LED)**; on XGD2, right (yellow LED).
- Refit the front panel and breaker guard.
- First-time conversion: fill in sticker 5661793 ("This PDU is equipped with Delta 48V PS (5745311)", date, employee ID) and fix it to the bottom of the breaker guard.
10. **Restore power.**
- Remove LOTO (DOC1805613 §3.1.2). Reset the MDP breaker if it sits mid-position. Switch on the main input, then System On.
- **Do a check scan** [5690015-2EN Finalization].

## Post-checks (GE plus [Inferred] field checks)
- **GE:** run a check scan.
- **[Inferred]** Both supplies show the green OK LED.
- **[Inferred]** +48 VDC at J4 A1–A2 with CB9 on.
- **[Inferred]** After an EMO reset, the power and heartbeat LEDs are on for the Cronus GMC, AUX, XGA and XPS.
- **[Inferred]** No 2268225 and no XGD PWR or FPGA faults.
- GE lists **no voltage trim and no calibration** for this swap.

## Side-by-Side Revision & Part Cross-Reference
| Document / Revision | Date | PDU / Cabinet Scope | 48V PS & Bracket Hardware | Status & Key Changes |
|---|---|---|---|---|
| **TEAL `TSB102109-1 Rev A0`** (`48v ps Teal replacement.pdf`) | 10/21/2009 | 25 early XGD PDUs (`TEAL 6600003` / `GE 5140621`, S/Ns `97679–115507`, built `12/14/2007–8/7/2008`) | Condor `5140621-4` (`TEAL 4990782`) + 2-piece Condor brackets (`0590905` upper / `0590902` lower) + **Kit `4990913`** (`8-32x1/4"` screws `0110091`, `16 in-lbs`, Loctite #242, labels `1181431`) | **Obsolete Condor-only screw rework.** Replaced `8-32x3/8"` screws that bottomed out and shorted PS1/PS2 to ground. Superseded by Delta conversion (`DOC1805613 Rev 3`). |
| **`5140621 Rev 14`** (`M5140621r14.pdf`) | 06/29/2009 | XGD PDU (`GE 5140621` / `TEAL 6600003`) | Condor `5140621-4` (`TEAL 4990782`); 2-piece brackets `0590905`/`0590902` or 1-piece `5140621-10`; `CON1–CON2` `5140621-3` | **Superseded.** Covered legacy Condor 48.00 VDC trim pot adjustment (`4.2.6.1`) and `CON1` NC (`21`/`22`). |
| **`DOC1805616 Rev 3` Appendix A** (Vendor Rev 09) | 12/09/2019 | Both **XGD (`5140621`)** and **XGD2 (`5343114`)** PDUs | Delta `5745311` (2x for Condor conversion); existing `5140621-10` or blind-mate `5343114-10` bracket; sticker `5661793` | **Active GE Field Notification** (pp. 56–79): full Condor-to-Delta conversion, `CON1` AUX `21 -> 13` / `22 -> 14` (NO), and terminal block `97`/`98` wiring. |
| **`DOC1805613 Rev 3`** (absorbs **`DOC2175961`**) | 07/2021 | XGD PDU (`GE 5140621` / `TEAL 6600003`) | `PS1–PS2`: **`5745311`** (Delta 48V 2500W, replaces `5140621-4` / `4990782`); Bracket: **`5343114-10`** / TEAL **`4991419`** (supersedes `5140621-10` & `0590905`/`0590902`); `CON1–CON2`: **`5140621-11`** / TEAL **`4990781`** (updated from `5140621-3`) | **Current XGD PDU manual.** Absorbs GE Service Note `DOC2175961` into §4.2.6 (p. 44) & Appendix A (pp. 61–71); removes Condor voltage trim calibration. |
| **`DOC2766902 Rev 1`** | 09/02/2022 | XGD3 PDU (`GE 5890114`, Signa Artist Evo / Premier) | 48VDC power supply tray `5890114-2` / TEAL `4991731` | **Current XGD3 manual.** Different 48VDC tray architecture; does not use XGD/XGD2 Condor-to-Delta bracket kits. |

- **`5745311` Delta 48V 2500W PS (`DPR3000B-48`):** Replaces obsolete Condor 48V 1000W `5140621-4` / TEAL `4990782` (`DOC1805613 Rev 3` Table 3, p. 19).
- **`5343114-10` / TEAL `4991419` blind-mate bracket:** Supersedes `5140621-10` existing harness bracket and obsolete 2-piece Condor brackets `0590905` (upper) / `0590902` (lower) (`DOC1805613 Rev 3` Table 3, p. 19).
- **`5140621-11` / TEAL `4990781` E-stop contactors (`CON1`–`CON2`):** Updated 3-pole 30A contactor FRU replacing `5140621-3` (`DOC1805613 Rev 3` Table 3, p. 19).
- **`DOC2766902 Rev 1` (09/2022) for XGD3 PDU `5890114`:** Uses 48VDC tray `5890114-2` / TEAL `4991731`; XGD/XGD2 Condor-to-Delta bracket kits do not apply.

## What this draft cannot confirm (gaps)
- **Adapter PCB** (8-pin Mini-Fit housing plus a 2-pin header). It does not appear in any GE source found. **[Inferred]** It most likely adapts the rectifier's signal pins to the bracket harness: B1 Common / C1 Inhibit switched by CON1's NO contact, and perhaps a present/enable link. Placement and orientation are not documented.
- **GE kit part.** The GE docs call 5745311 "2500W"; the unit is a 3000 W DPR3000B. This most likely reflects a later Delta revision under the same FRU **[Inferred]**. Confirm against the kit's GE label and packing slip.
- **DOC2175961 standalone PDF:** While standalone `DOC2175961` is not a separate PDF in the library, `DOC1805613 Rev 3` revision history (p. viii) confirms `DOC2175961` ("48V PDU Power Supply Replacement (Condor to Delta)") was absorbed verbatim into Section 4.2.6 (p. 44) and Appendix A (pp. 61–71) (and mirrors `DOC1805616 Rev 3` Appendix A, pp. 56–79).

## Photo
[Label photo (serial blurred)](https://raw.githack.com/mikejackson-stack/AMT-Imaging-Service-App/main/Manuals/All_Systems/Field_Guides/mr450w-48v-delta-label.jpg)

Keywords: 48V power supply, PDU, Delta, Condor, 5745311, DPR3000B-48, PS1, PS2, TEAL, MR450w, TSB102109-1, DOC1805613, DOC1805616, DOC2175961, 4991419, 4990913, 4990782, 4990781, 5140621-11
