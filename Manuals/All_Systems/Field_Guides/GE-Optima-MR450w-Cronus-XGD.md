# GE Optima MR450w Cronus / XGD Gradient Chassis (XPS LINK FLT, GMC heartbeat, OCT LEDs)

**Type:** AMT field guide. The steps, part numbers, and error codes below are the 8 Oct 2026 field notes, which cite GE manuals. This is not a substitute for those manuals.
**Source:** Field Knowledge Base notes, 8 Oct 2026 (Mike on site, GE Optima MR450w 1.5T, PGR cabinet Cronus).
**System:** GE Optima MR450w 1.5T. MR450w gradient. Cronus is first-generation XGD gradients only.

## Safety — PGR cabinet lockout

The Cronus chassis is in the PGR (Power/Gradient/RF) cabinet, not the console. Replacement steps start with lockout of the PGR gradient subsystem.

The in-repo replacement module starts each Cronus board, power supply, fan, and chassis procedure with lockout / tagout of the PGR PDU gradient subsystem: [LOTO for the PGR PDU/Gradient Subsystem (910100.htm)](https://raw.githack.com/mikejackson-stack/AMT-Imaging-Service-App/main/Manuals/GE/Optima%20450w/root/data/Signa_EXCITE/content/910100.htm).

In-repo path: `Manuals/GE/Optima 450w/root/data/Signa_EXCITE/content/910100.htm`

## Field case

- XPS Control Board LINK FLT was lit. It stayed lit when the XPS-CB was moved to the XGA slot, and it stayed lit with a new XPS-CB.
- XPS-CB heartbeat was flashing. 48V supplies were green. Cronus power supply PWR GOOD was green. TEAL gradient 420V phase LEDs were green.
- Gradient Master Control (GMC) had no LEDs before the issue. After a reseat it showed heartbeat only, and no READY, including after a full system shutdown.
- The left XPS axis unit OCT STATUS and OCT POWER LEDs (J7/J8) looked dark compared with the other two units. That was a photo, and it was unconfirmed.

Moving an XPS-CB into the XGA slot is not a valid test. See the next section. LINK FLT, the GMC READY LED, and the OCT STATUS / OCT POWER LEDs are not defined in the manuals. Those gaps are repeated under Known gaps.

## References

The source notes cite service methods CD 5670013, Direction 5670013-3 Rev 1, module filenames under `content/`. This repo has no `CD 5670013` folder. The same filenames are in `Manuals/GE/Optima 450w/root/data/Signa_EXCITE/content/`. Those copies are titled Optima MR450w 1.5T Service Methods, Direction 5670000 Rev 1. Links below are those files.

- [XGD Cronus Chassis Replacements (1061853.htm)](https://raw.githack.com/mikejackson-stack/AMT-Imaging-Service-App/main/Manuals/GE/Optima%20450w/root/data/Signa_EXCITE/content/1061853.htm) — notes cite §3.2, §4.2, §4.3, and §5. In this copy: [§4.1 GMC](https://raw.githack.com/mikejackson-stack/AMT-Imaging-Service-App/main/Manuals/GE/Optima%20450w/root/data/Signa_EXCITE/content/1061853.htm#SL2002731-1061853_1), [§4.2 XGA Controller Board](https://raw.githack.com/mikejackson-stack/AMT-Imaging-Service-App/main/Manuals/GE/Optima%20450w/root/data/Signa_EXCITE/content/1061853.htm#SL2002738-1061853_1), [§4.3 XPS Controller Board](https://raw.githack.com/mikejackson-stack/AMT-Imaging-Service-App/main/Manuals/GE/Optima%20450w/root/data/Signa_EXCITE/content/1061853.htm#SL2002745-1061853_1). §5 is Finalization and says there are no finalization steps.
- [PGR Cabinet Component Locations (1063629.htm)](https://raw.githack.com/mikejackson-stack/AMT-Imaging-Service-App/main/Manuals/GE/Optima%20450w/root/data/Signa_EXCITE/content/1063629.htm) — notes cite §9, Illustrations 11/12. This copy does not contain section 9 or illustrations 11/12. Cronus is [§7 Gradient Master Control (Cronus Chassis) and PDM, Illustration 7](https://raw.githack.com/mikejackson-stack/AMT-Imaging-Service-App/main/Manuals/GE/Optima%20450w/root/data/Signa_EXCITE/content/1063629.htm#SL2090005-1063629).
- [Resetting TPS and Results (1048803.htm)](https://raw.githack.com/mikejackson-stack/AMT-Imaging-Service-App/main/Manuals/GE/Optima%20450w/root/data/Signa_EXCITE/content/1048803.htm) — notes cite §3–4. TPS reset.
- [CAM Cabinet Troubleshooting and Theory (1060990.htm)](https://raw.githack.com/mikejackson-stack/AMT-Imaging-Service-App/main/Manuals/GE/Optima%20450w/root/data/Signa_EXCITE/content/1060990.htm) — notes cite §3.2 Table 1. In this copy: [§3.2 IRF3 Board](https://raw.githack.com/mikejackson-stack/AMT-Imaging-Service-App/main/Manuals/GE/Optima%20450w/root/data/Signa_EXCITE/content/1060990.htm#SL1973544-1060990).
- [IRF3 Fiber Loopback Diagnostic (1052794.htm)](https://raw.githack.com/mikejackson-stack/AMT-Imaging-Service-App/main/Manuals/GE/Optima%20450w/root/data/Signa_EXCITE/content/1052794.htm).

In-repo paths:

- `Manuals/GE/Optima 450w/root/data/Signa_EXCITE/content/1061853.htm`
- `Manuals/GE/Optima 450w/root/data/Signa_EXCITE/content/1063629.htm`
- `Manuals/GE/Optima 450w/root/data/Signa_EXCITE/content/1048803.htm`
- `Manuals/GE/Optima 450w/root/data/Signa_EXCITE/content/1060990.htm`
- `Manuals/GE/Optima 450w/root/data/Signa_EXCITE/content/1052794.htm`
- `Manuals/GE/Optima 450w/root/data/Signa_EXCITE/content/910100.htm`

Parts book and notes in this repo:

- [Parts book Direction 5670005 Rev 4 (Parts_450w_750w.pdf)](https://raw.githack.com/mikejackson-stack/AMT-Imaging-Service-App/main/Manuals/Error%20codes%20and%20Troubleshooting%20All%20Systems/Parts_450w_750w.pdf). Notes cite PGR Cabinet / Cronus Module, printed page 52 (PDF page 54). In-repo path: `Manuals/Error codes and Troubleshooting All Systems/Parts_450w_750w.pdf`. A same-size copy is also at `Manuals/Parts/Parts_450w_750w.pdf`.
- [450w_750w Communication Links.doc](https://view.officeapps.live.com/op/view.aspx?src=https%3A%2F%2Fraw.githack.com%2Fmikejackson-stack%2FAMT-Imaging-Service-App%2Fmain%2FManuals%2FError%2520codes%2520and%2520Troubleshooting%2520All%2520Systems%2F450w_750w%2520Communication%2520Links.doc) (same viewer the manuals tab uses). In-repo path: `Manuals/Error codes and Troubleshooting All Systems/450w_750w Communication Links.doc`. The notes also place a copy on OneDrive at `/Work Docs/GE/Extra & Notes/`. That OneDrive path is not a file in this repo, so it is not linked.

GE Error Message Tool, AMT-GE-Manuals (same text is in `kb/ge-error-tool-kb.json`):

- [ermes_2267000-2267999.html](https://raw.githack.com/mikejackson-stack/AMT-GE-Manuals/main/GE%20Error%20Message%20Tool/root/ermes_2267000-2267999.html)
- [ermes_2268000-2268999.html](https://raw.githack.com/mikejackson-stack/AMT-GE-Manuals/main/GE%20Error%20Message%20Tool/root/ermes_2268000-2268999.html)
- [ermes_2269000-2269999.html](https://raw.githack.com/mikejackson-stack/AMT-GE-Manuals/main/GE%20Error%20Message%20Tool/root/ermes_2269000-2269999.html)

Not linked, because the file is not in this repo or in AMT-GE-Manuals: Optima 450W GEM, Direction 5690015-2EN Rev 5, cited from OneDrive `/Work Docs/GE/Manuals/Optima 450W GEM` (Gradient FRU compatibility guidance, and the gradient troubleshooting flowchart). The library also lacks the flowchart sections named under Known gaps.

## 1. XPS and XGA control boards, and LINK FLT

These two boards are not interchangeable:

- XGA Control Board 5250122
- XPS Control Board 5250122-2

The system checks the slot by board type: [2267920](https://raw.githack.com/mikejackson-stack/AMT-GE-Manuals/main/GE%20Error%20Message%20Tool/root/ermes_2267000-2267999.html#BM2267920) (XGA-CB not present) and [2267921](https://raw.githack.com/mikejackson-stack/AMT-GE-Manuals/main/GE%20Error%20Message%20Tool/root/ermes_2267000-2267999.html#BM2267921) (XPS-CB not present). GEM says control board generations cannot be mixed. There is no explicit slot-compatibility statement (see Known gaps). A slot-swap test is not valid. The documented swap test moves fibers and leads between axes, not boards ([2268212](https://raw.githack.com/mikejackson-stack/AMT-GE-Manuals/main/GE%20Error%20Message%20Tool/root/ermes_2268000-2268999.html#BM2268212)).

Each XPS-CB has X, Y, and Z transceivers. On each axis, a hotlink fiber and a clock fiber go to the XPS power supply board (XPS-SB) in that axis's XPS cabinet unit.

Octavius cable: XGA to XPS is [2267938](https://raw.githack.com/mikejackson-stack/AMT-GE-Manuals/main/GE%20Error%20Message%20Tool/root/ermes_2267000-2267999.html#BM2267938). XGA to Cronus is [2267937](https://raw.githack.com/mikejackson-stack/AMT-GE-Manuals/main/GE%20Error%20Message%20Tool/root/ermes_2267000-2267999.html#BM2267937).

The LINK FLT LED label itself is not defined in the manuals.

Isolation order. The notes cite [2267774](https://raw.githack.com/mikejackson-stack/AMT-GE-Manuals/main/GE%20Error%20Message%20Tool/root/ermes_2267000-2267999.html#BM2267774), [2267957](https://raw.githack.com/mikejackson-stack/AMT-GE-Manuals/main/GE%20Error%20Message%20Tool/root/ermes_2267000-2267999.html#BM2267957) / [2267959](https://raw.githack.com/mikejackson-stack/AMT-GE-Manuals/main/GE%20Error%20Message%20Tool/root/ermes_2267000-2267999.html#BM2267959) / [2267961](https://raw.githack.com/mikejackson-stack/AMT-GE-Manuals/main/GE%20Error%20Message%20Tool/root/ermes_2267000-2267999.html#BM2267961), [2267843](https://raw.githack.com/mikejackson-stack/AMT-GE-Manuals/main/GE%20Error%20Message%20Tool/root/ermes_2267000-2267999.html#BM2267843), [2267955](https://raw.githack.com/mikejackson-stack/AMT-GE-Manuals/main/GE%20Error%20Message%20Tool/root/ermes_2267000-2267999.html#BM2267955), and [2267809](https://raw.githack.com/mikejackson-stack/AMT-GE-Manuals/main/GE%20Error%20Message%20Tool/root/ermes_2267000-2267999.html#BM2267809):

1. Gradient power on, no E-stop. EMO reset if needed.
2. Octavius cable at the XPS.
3. Reseat the fibers at both ends (the XPS unit and the XPS-CB) and inspect them.
4. Fiber transceivers (SFPs) are a separate part, 5183329-2. If they were moved from the old board, they are not ruled out. Swap them.
5. Replace the fiber (internal fiber kit 5304386). If the fault persists, swap the XPS unit or its power supply board, then TPS reset.
6. Is the XPS heartbeat LED flashing? If it is not, check the 48V cable and the 48V supply in the gradient PDU.
7. On a new board, check the error log for a firmware revision mismatch. XPS firmware files (PIFF) on the host must be intact and must match the software release. Then TPS reset. The Cronus replacement procedure lists no DIP, jumper, or calibration steps.

Diagnostics named in the notes: GEM gradient diagnostics (Static Unpowered, Static, Power and Cooling, Fidelity), and the extended error comments in the error log. The GEM file is not in this library (see References).

Other Cronus FRUs (parts book Direction 5670005 Rev 4, PGR Cabinet / Cronus Module, printed page 52; also 1061853.htm §3.2):

| Item | Part number |
| --- | --- |
| Gradient Master Control (GMC) | 5250128 |
| XGA Control Board | 5250122 |
| XPS Control Board | 5250122-2 |
| Cronus power supply | 5159513 |
| Fan | 5183573 |
| Chassis | 2384411 |

## 2. GMC shows heartbeat but no READY

No document in these notes defines the GMC READY LED, or says that XPS LINK FLT clears once the GMC is ready. A full power cycle does not show why startup failed. A TPS reset plus the error log does.

GMC startup chain (Error Message Tool):

1. 48V from the PDU through the Gradient 48V Control breaker ([2268225](https://raw.githack.com/mikejackson-stack/AMT-GE-Manuals/main/GE%20Error%20Message%20Tool/root/ermes_2268000-2268999.html#BM2268225), [2269060](https://raw.githack.com/mikejackson-stack/AMT-GE-Manuals/main/GE%20Error%20Message%20Tool/root/ermes_2269000-2269999.html#BM2269060)).
2. Ethernet from the GMC to the PGR switch to the SCP. The GMC Ethernet port top LED is link ([2267768](https://raw.githack.com/mikejackson-stack/AMT-GE-Manuals/main/GE%20Error%20Message%20Tool/root/ermes_2267000-2267999.html#BM2267768), [2267777](https://raw.githack.com/mikejackson-stack/AMT-GE-Manuals/main/GE%20Error%20Message%20Tool/root/ermes_2267000-2267999.html#BM2267777)).
3. Firmware (PIFF) loads during TPS reset, safe mode then application mode. Host GMC firmware files must be good and the right revision ([2267789](https://raw.githack.com/mikejackson-stack/AMT-GE-Manuals/main/GE%20Error%20Message%20Tool/root/ermes_2267000-2267999.html#BM2267789), [2267790](https://raw.githack.com/mikejackson-stack/AMT-GE-Manuals/main/GE%20Error%20Message%20Tool/root/ermes_2267000-2267999.html#BM2267790), [2267791](https://raw.githack.com/mikejackson-stack/AMT-GE-Manuals/main/GE%20Error%20Message%20Tool/root/ermes_2267000-2267999.html#BM2267791)).
4. DVMR dual fiber from IRF3 (CAM chassis) to the GMC, plus the clock fiber from the exciter (DTX1) to the GMC ([2267848](https://raw.githack.com/mikejackson-stack/AMT-GE-Manuals/main/GE%20Error%20Message%20Tool/root/ermes_2267000-2267999.html#BM2267848), [2267849](https://raw.githack.com/mikejackson-stack/AMT-GE-Manuals/main/GE%20Error%20Message%20Tool/root/ermes_2267000-2267999.html#BM2267849), [2267924](https://raw.githack.com/mikejackson-stack/AMT-GE-Manuals/main/GE%20Error%20Message%20Tool/root/ermes_2267000-2267999.html#BM2267924)). [2269061](https://raw.githack.com/mikejackson-stack/AMT-GE-Manuals/main/GE%20Error%20Message%20Tool/root/ermes_2269000-2269999.html#BM2269061): "A successful TPS Reset is required for the DVMR Fiber Optic Links to be up."
5. The GMC links to the XGA-CB and the XPS-CB on the backplane ([2267850](https://raw.githack.com/mikejackson-stack/AMT-GE-Manuals/main/GE%20Error%20Message%20Tool/root/ermes_2267000-2267999.html#BM2267850), [2267851](https://raw.githack.com/mikejackson-stack/AMT-GE-Manuals/main/GE%20Error%20Message%20Tool/root/ermes_2267000-2267999.html#BM2267851), [2267917](https://raw.githack.com/mikejackson-stack/AMT-GE-Manuals/main/GE%20Error%20Message%20Tool/root/ermes_2267000-2267999.html#BM2267917), [2267918](https://raw.githack.com/mikejackson-stack/AMT-GE-Manuals/main/GE%20Error%20Message%20Tool/root/ermes_2267000-2267999.html#BM2267918)).

Fix order:

1. TPS reset with output on. In a C shell, type `mgd_term`. Then Common Services Desktop > Utilities > TPS Reset > [Reset]. Look for "Reset/Download TPS in progress... was successful" or a failure. Service method: [Resetting TPS and Results (1048803.htm)](https://raw.githack.com/mikejackson-stack/AMT-Imaging-Service-App/main/Manuals/GE/Optima%20450w/root/data/Signa_EXCITE/content/1048803.htm), §3–4.
2. Error log codes:
   - [2267768](https://raw.githack.com/mikejackson-stack/AMT-GE-Manuals/main/GE%20Error%20Message%20Tool/root/ermes_2267000-2267999.html#BM2267768) / [2267790](https://raw.githack.com/mikejackson-stack/AMT-GE-Manuals/main/GE%20Error%20Message%20Tool/root/ermes_2267000-2267999.html#BM2267790) — PIFF load failed
   - [2267789](https://raw.githack.com/mikejackson-stack/AMT-GE-Manuals/main/GE%20Error%20Message%20Tool/root/ermes_2267000-2267999.html#BM2267789) / [2267791](https://raw.githack.com/mikejackson-stack/AMT-GE-Manuals/main/GE%20Error%20Message%20Tool/root/ermes_2267000-2267999.html#BM2267791) — boot failure in safe mode or application mode. 2267791 means check revision mismatches.
   - [2267777](https://raw.githack.com/mikejackson-stack/AMT-GE-Manuals/main/GE%20Error%20Message%20Tool/root/ermes_2267000-2267999.html#BM2267777) / [2267728](https://raw.githack.com/mikejackson-stack/AMT-GE-Manuals/main/GE%20Error%20Message%20Tool/root/ermes_2267000-2267999.html#BM2267728) — Ethernet / socket failure
   - [2267778](https://raw.githack.com/mikejackson-stack/AMT-GE-Manuals/main/GE%20Error%20Message%20Tool/root/ermes_2267000-2267999.html#BM2267778) — XGD startup fault
   - [2267848](https://raw.githack.com/mikejackson-stack/AMT-GE-Manuals/main/GE%20Error%20Message%20Tool/root/ermes_2267000-2267999.html#BM2267848) / [2267849](https://raw.githack.com/mikejackson-stack/AMT-GE-Manuals/main/GE%20Error%20Message%20Tool/root/ermes_2267000-2267999.html#BM2267849) / [2267924](https://raw.githack.com/mikejackson-stack/AMT-GE-Manuals/main/GE%20Error%20Message%20Tool/root/ermes_2267000-2267999.html#BM2267924) — DVMR or clock fault
   - [2267851](https://raw.githack.com/mikejackson-stack/AMT-GE-Manuals/main/GE%20Error%20Message%20Tool/root/ermes_2267000-2267999.html#BM2267851) / [2267918](https://raw.githack.com/mikejackson-stack/AMT-GE-Manuals/main/GE%20Error%20Message%20Tool/root/ermes_2267000-2267999.html#BM2267918) — GMC cannot talk to the XPS-CB
   - [2267925](https://raw.githack.com/mikejackson-stack/AMT-GE-Manuals/main/GE%20Error%20Message%20Tool/root/ermes_2267000-2267999.html#BM2267925) — GMC onboard power fault
3. Ethernet: GMC top link LED, the cable to the switch, and the SCP link LED. Reseat the GMC and the SCP.
4. [2267778](https://raw.githack.com/mikejackson-stack/AMT-GE-Manuals/main/GE%20Error%20Message%20Tool/root/ermes_2267000-2267999.html#BM2267778) checklist: 420V breaker on. DVMR fiber from IRF3 to the GMC connected, transceivers good. Clock fiber from the exciter to the GMC. Reseat the GMC, the XGA-CB, and the XPS-CB. Reseat IRF3. TPS reset.
5. IRF3 front LEDs J10–J14 are labeled "RDY Link-n" and "REF OK" ([1060990.htm §3.2 Table 1](https://raw.githack.com/mikejackson-stack/AMT-Imaging-Service-App/main/Manuals/GE/Optima%20450w/root/data/Signa_EXCITE/content/1060990.htm#SL1973544-1060990)). IRF3 Fiber Loopback Diagnostic with the loopback adapter at the XGD end ([1052794.htm](https://raw.githack.com/mikejackson-stack/AMT-Imaging-Service-App/main/Manuals/GE/Optima%20450w/root/data/Signa_EXCITE/content/1052794.htm)). Once the GMC is up, Gradient Hammer Diagnostic ([2268203](https://raw.githack.com/mikejackson-stack/AMT-GE-Manuals/main/GE%20Error%20Message%20Tool/root/ermes_2268000-2268999.html#BM2268203) through [2268209](https://raw.githack.com/mikejackson-stack/AMT-GE-Manuals/main/GE%20Error%20Message%20Tool/root/ermes_2268000-2268999.html#BM2268209)).
6. If XPS-CB faults persist after a reseat, [2267795](https://raw.githack.com/mikejackson-stack/AMT-GE-Manuals/main/GE%20Error%20Message%20Tool/root/ermes_2267000-2267999.html#BM2267795) says remove the GMC, the XGA-CB, and the XPS-CB and replace the chassis backplane.
7. Last resort: replace the GMC, part 5250128 (parts book 5670005 Rev 4, printed page 52), then TPS reset. No finalization steps ([1061853.htm §4.1](https://raw.githack.com/mikejackson-stack/AMT-Imaging-Service-App/main/Manuals/GE/Optima%20450w/root/data/Signa_EXCITE/content/1061853.htm#SL2002731-1061853_1) and §5). There is no manual GMC firmware download step. Firmware loads during TPS reset.

## 3. Dark OCT STATUS / OCT POWER LEDs on an XPS axis unit

The OCT STATUS and OCT POWER LEDs at J7/J8 on an XPS unit are not defined in the manuals.

The Octavius copper cable carries status between the Cronus / XGA and the XPS units ([2267938](https://raw.githack.com/mikejackson-stack/AMT-GE-Manuals/main/GE%20Error%20Message%20Tool/root/ermes_2267000-2267999.html#BM2267938)).

For an XPS power-off or Octavius fault ([2267944](https://raw.githack.com/mikejackson-stack/AMT-GE-Manuals/main/GE%20Error%20Message%20Tool/root/ermes_2267000-2267999.html#BM2267944), [2267946](https://raw.githack.com/mikejackson-stack/AMT-GE-Manuals/main/GE%20Error%20Message%20Tool/root/ermes_2267000-2267999.html#BM2267946), [2267948](https://raw.githack.com/mikejackson-stack/AMT-GE-Manuals/main/GE%20Error%20Message%20Tool/root/ermes_2267000-2267999.html#BM2267948)):

1. EMO reset.
2. Check the 48V input cable at that XPS.
3. Check the Octavius cable.
4. Swap Octavius cables between axes.
5. If the fault follows the XPS, replace the XPS.
6. If the fault does not follow the XPS, the manual says replace the GMC.

XG2 Octavius fuse codes do not apply.

## Known gaps

The manuals cited above do not close these. Do not fill them in from the LED names.

- There is no Cronus LED table.
- The LINK FLT LED meaning is not defined in the manuals.
- The GMC READY LED meaning is not defined. Nothing in these notes says LINK FLT clears once the GMC shows READY.
- There is no explicit slot-compatibility statement. A board moved from the XPS slot into the XGA slot is not a documented test. The documented swap ([2268212](https://raw.githack.com/mikejackson-stack/AMT-GE-Manuals/main/GE%20Error%20Message%20Tool/root/ermes_2268000-2268999.html#BM2268212)) moves fibers and leads between axes, not boards. The part numbers still differ (XGA Control Board 5250122, XPS Control Board 5250122-2), and the system checks the slot by board type ([2267920](https://raw.githack.com/mikejackson-stack/AMT-GE-Manuals/main/GE%20Error%20Message%20Tool/root/ermes_2267000-2267999.html#BM2267920), [2267921](https://raw.githack.com/mikejackson-stack/AMT-GE-Manuals/main/GE%20Error%20Message%20Tool/root/ermes_2267000-2267999.html#BM2267921)). GEM says control board generations cannot be mixed. That GEM file is not in this library.
- The library lacks the flowchart sections "Clock synchronization data fibers" and "Auxiliary board fiber link – XGD only".
- OCT STATUS and OCT POWER LED meanings are not defined.
- The left-axis OCT LEDs looking dark was a photo and was unconfirmed.

## Search aliases

LINK FLT, Cronus, GMC, XPS, XGA, XPS-CB, XGA-CB, MR450w gradient, Optima MR450w, TPS reset, Gradient Master Control, 5250122, 5250122-2, 5250128, 5159513, 5183573, 2384411, 5183329-2, 5304386, 2267778, 2267920, 2267921, 2268212, OCT STATUS, OCT POWER, PGR lockout

Manuals path: All_Systems/Field_Guides/GE-Optima-MR450w-Cronus-XGD.md
