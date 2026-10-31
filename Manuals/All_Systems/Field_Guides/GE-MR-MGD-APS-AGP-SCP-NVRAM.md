# GE MGD APS/AGP/SCP NVRAM troubleshooting (CNFG / ENV restore, MCP820)

Applies to: GE Signa Excite HD/HDx (12.x, 15.x HDx, 16.x HDxT) with the MGD or CAM chassis; MCP820 APS/AGP and CPV3060 SCP boards.

> DRAFT – AMT field notes from one GE field-engineer document. Not a GE document. Follow the current GE procedure for your system.
> Source: GE MGD APS SCP Troubleshooting Guide, Lito Condes (GE MRI Advanced Service Engineer), July 2017. Cited by title only. Page numbers are from that guide.

## When to use this
- The system will not reach Applications level because the APS, AGP and/or SCP will not initialize, so CSD diagnostics cannot be reached (p.5).
- If the system comes up via sdc, the guide says the APS, AGP and SCP are almost certainly fine; use the normal service methods instead (p.5).
- The guide says about 80% of MCP820s returned from the field can be fixed by restoring corrupted config (CNFG) and environment (ENV) data (p.2, p.23).

## MGD vs CAM chassis (p.2-3)
- MGD = Multi-Generational Data Acquisition chassis. CAM = Consolidated ASC and MGD chassis. They are functionally equivalent; the CAM integrates the UPM/ASC, the MGD has the UPM/ASC as a separate small chassis (p.3).
- 15.x/16.x MGD and CAM use the Motorola MCP820 (APS, AGP) and CPV3060 (SCP) boards (p.3).
- 11.x/12.x MGDs use MCP750 boards for APS and AGP (p.2).
- APS slot: 1F (slot 1, front) in MGD or CAM (p.3).
- AGP slot: 10F in the MGD, 6F in the CAM (p.3).
- SCP slot: 11, front of the MGD chassis (quoted service note SN67086, p.41).
- APS and AGP are the same board and can be swapped for troubleshooting, except a 2294300-23 board works only as AGP (p.3).
- CPCI-6020 is another designation for the MCP820; you may see it on the extraction tabs (p.3).
- Do not remove the labels and markings on the board. They are entered in NVRAM (VPD) and identify the board to the software (p.3).

## MCP820 part numbers (p.3, p.41)

| P/N | Use per the guide | 128MB memory mini-board (p.41) |
|---|---|---|
| 2294300-14 | First HDx (14.x). Works as APS, not recommended for AGP | 06A |
| 2294300-16 | APS and AGP in 15.x HDx / 16.x HDxT MGDs | 06B |
| 2294300-18 | APS and AGP in 15.x HDx / 16.x HDxT CAM | 07A |
| 2294300-23 | AGP only, not APS (15.x/16.x MGD and CAM) | 27A |

## Serial access: mgd_term (p.5-6, p.34)
1. Bring the system to the login screen and log in as root (credentials per the source guide / site, p.5).
2. Close the Guided Install window. In the command window type mgd_term.
3. Three windows open: APS, AGP and SCP. Each should show "connected" on the first line. If not, fix the Ethernet / Term Server path first (p.6).
4. Cycle MGD power with the switch on the back of the chassis and watch the boot-up data scroll (p.6).

### Service logins (as printed in the source, p.5, p.38)
- root: `operator` (source p.5)
- sdc: `adw2.0` (source p.38)

Appear in: "IV Troubleshooting the MCP820 SBC's" > "1. APS-AGP-SCP Serial Boot-up Data" (root, p.5); sdc in the step 20 reboot/login step just before "VII Related Information" (p.38; also repeated on p.33, where OCR misreads it as "sde").

## Reading the boot-up data
Good-boot marker messages (p.23):
- "There are no errors in the OS Error Log Buffer" – the board passed self-test and initialization (APS, AGP or SCP).
- "Auto start of Tardis done" – APS only; image data path (Infiniband, VRE/ICN, DRF, RRF, RF/DIF) is OK.
- "Network is OK" – the board reached the other hosts and servers (the guide's marker list says "Network OK"; the boot lists say "Network is OK", p.7, p.12, p.17).
- "Start-up Complete" – the board and its devices initialized; TPS Reset would succeed.
- SCP also shows "SCP application startup OK" (p.17).

Each board downloads its program from the host (p.7, p.12, p.17, p.39):
- APS: /usr/g/bin/aps_system_820
- AGP: /usr/g/bin/agp_system_820
- SCP: /usr/g/bin/scp_system

Board stops (p.22, p.25):
- APS/AGP stop at MCP820-Bug> or MCP820-Diag> on self-test, NVRAM checksum or config errors; Board Fail LED stays on.
- SCP stops at EPPC-Bug>; Fault LED stays on.
- Generally MCP820-Bug> = config/env issue; MCP820-Diag> = other issues (p.25).
- Network issues can hang the MGD with no error and no Fail/Fault LED (p.23).

## Symptoms of CNFG / ENV corruption (p.23-24)
- A. "NVRAM checksum error", then stop at MCP820-Bug> or MCP820-Diag>; Board Fail LED on.
- B. "Board Configuration verification failure", then stop at MCP820-Bug> or MCP820-Diag>; Board Fail LED on.
- C. Board hangs after the PPCBUG header (during Self-Test or Autoboot) with no error and no Fail LED. Usually after CNFG/ENV were re-entered but ENV is still wrong. Move the board to the AGP slot so it stops at the prompt, or try a Double-Button Reset. Minor CNFG/ENV issues often work at APS but not at AGP.
- D. The board never reaches "There are no errors in the OS Error Log Buffer": the guide calls this an internal CPU board problem.
- For A and B: run ST (MCP820-Diag>) first; replace the board if it fails. Run VER to check the VPD, ENV;D for ENV, CNFG then CNFG;M for the Board Information Block.
- CNFG data with question marks (?) = corrupted Board Information Block (p.34, Fig. 12).

AMT field observation (not in the guide): on one field system, this failure also showed up as ARP failures to 10.0.0.5 / 10.0.0.6, "Invalid board configuration" and a Communications Manager init failure. Treat these as pointers to check the serial boot-up data, not as guide content.

## Section VI: CNFG / ENV restore (p.33-38)
The guide's example uses a bad MCP820 in the AGP slot; the steps apply to APS too (p.33).

1. Power up the system; log in as sdc. With a bad AGP the system will not come up; after ~15 min a "TPS Reset was not successful" type message appears (p.33).
2. Open a command window and run endsession; click yes. Repeat 2 or 3 times until the login screen returns (p.33).
3. Log in as root and run mgd_term. Watch the AGP window (black background) (p.34).
4. Turn off MGD power at the back of the chassis, count 10 s, turn it on. AGP stops at MCP820-Bug>; APS and SCP stop with an error waiting for the VRE (p.34).
5. In the AGP window, check the Board Information Block. Any ? marks = corrupted (p.34):
```
CNFG
```
6. Turn off MGD power. Leave the system on and the console at mgd_term (p.34).
7. Remove the AGP, lay it on a flat non-metallic surface, pull the Timekeeper chip. Check the built-in lithium battery reads at least 3 VDC with a DVM; below 3 VDC, replace the Timekeeper (p.34).
8. Refit the Timekeeper. List the CNFG data from the board's own labels (Board PWA serial, Board Identifier, Artwork ID on the back, lower of the 2 Ethernet addresses). See the example table below (p.35).
9. Refit the AGP, power the MGD, wait for MCP820-Bug>, then enter the data (p.36):
```
CNFG;M
```
10. Check and set date/time. Get the main system time from a C-shell with date (p.31, p.36):
```
TIME
SET MMDDYYHHMM
```
Example from the guide: SET 0707171943 (p.31).
11. Switch to diagnostics and run self-test; all must pass (p.36):
```
SD
ST
```
12. Switch back to the debugger and restore the environment from ROM (p.36):
```
SD
ENV;D
```
13. Cycle MGD power (off ~10 s). When the AGP shows MCP820-Bug>, quickly ROMboot. If it shows MCP820-Diag>, type SD first (p.36):
```
RB
```
14. AGP should boot to the same level as the APS: both stop with "CM will not be ready until the VRE is ready" or similar. The board is OK (p.36-37).
15. Last step: turn off MGD power, wait 10 s, turn on. When the AGP stops at MCP820-Diag>, switch and edit the environment (p.37-38):
```
SD
ENV
```
16. In ENV, change the Autoboot and ROMBoot settings as in the guide's Fig. 15. Until this is done the AGP keeps stopping at MCP820-Diag> even though it is fixed (the "non-error", p.26, p.38). Values readable in Fig. 15: Auto Boot Enable = Y; ROM Boot Enable = Y; ROM Boot at power-up only = N [confirm on screen; small screenshot, p.37]. Answer Y to "Update Non-Volatile RAM" and N to "Reset Local System" (p.37).
17. Cycle MGD power; confirm the MGD comes up normally (p.38).
18. Shut down and reboot the whole MRI system. Log in as sdc; it should reach Applications level (p.38).
19. Perform a TPS Reset, then head and body scans (p.38).

### Example Board Information Block (p.35, Table 1, MCP820 p/n 2294300-16)
Use your own board's labels. Example values only.

| Field | Example |
|---|---|
| Board (PWA) Serial Number | 7657874 |
| Board Identifier | SCPGEDAQ2X-016 (2294300-16/-18/-23); SCPGEDAQ2X-015 (2294300-14) |
| Artwork (PWA) Identifier | 01-W3938F05A (back of board) |
| MPU Clock Speed | 500 |
| BUS Clock Speed | 100 |
| Ethernet Address | 0001AF1898F5 (lower of the 2 on the board) |
| Primary SCSI Identifier | 07 |
| System Serial Number | 0 |
| System Identifier | 0 |
| License Identifier | same as Board PWA S/N |
| PEC Code | 0 |
| CLEI Code | 0 |

## Timekeeper battery (p.34-35, p.40)
- A Timekeeper chip with a dead lithium battery makes the board lose the Board Information Block (CNFG) data (p.35, Fig. 13).
- Check the battery is at least 3 VDC; replace the Timekeeper if lower (p.34).
- The Motorola manual says replace it with power applied; the author laid the board on a flat non-metallic surface, swapped the chip, then did the Section VI restore (p.40).
- Removing the Timekeeper resets NVRAM and forces the board to the debugger on next power-up (p.40).

## Double-Button Reset (p.40)
- Press RESET and ABORT together, release RESET, wait 7 s, release ABORT. Per Motorola it starts the debugger as if ENV;D were run.
- The author could not get it to work on the MCP820.

## SCP NVRAM reflash (SN67086, quoted p.41-42)
Effectivity in the note: 10.0 Excite SCP boards (P/N 2294300-2), slot 11 front of the MGD. A corrupted SCP NVRAM prevents a successful TPS Reset (p.41).
1. Open a C-shell and connect to the SCP:
```
cu scp
```
2. Press Enter. If EPPC-Bug> appears, the SCP NVRAM is corrupted; continue. If not, the SCP is likely not the problem and the reflash will not help (p.41).
3. Make these entries (p.42). Press Enter to accept other defaults:
```
EPPC-Bug>ENV;D
Update Non-Volatile Memory (Y/N)? Y
Reset Local System (CPU) (Y/N)? N
EPPC-Bug>ENV
Firmware Command Buffer ['NULL' terminates entry]? GO FC000100
SD
SE;AEM;QST;PCIB;FECETH
GO FC00017C
NULL
Update Non-Volatile Memory (Y/N)? Y
Reset Local System (CPU) (Y/N)? N
```
Defaults shown in the note (Enter to accept): PIRQ0/1/2/3 = 0A0B0E0F, Firmware Command Buffer Offset = 000002C8, Size = 00000200, Delay = 5000, Program Intermediate Load Address = 00200000, Binary Program Load Address = 00080000, Execution Offset = 00000100, Primary Network Controller LUN = 20, Device LUN = 00 (p.42).
4. Cycle MGD power to leave debug mode: switch at the left rear of the MGD chassis near the incoming AC (p.42).

## Useful PPCBUG commands (p.25, p.28-29)
- SD – switch between MCP820-Bug> and MCP820-Diag>.
- HE – list commands.
- CNFG – show Board Information Block; CNFG;M modifies it.
- ENV – set debugger/OS environment; ENV;D rewrites NVRAM environment from ROM defaults.
- RESET – reset the SBC.
- SET – set date and time; TIME – show it.
- VER – debugger version and VPD info.
- RB – ROMboot (Section VI step, p.36).
- DE / DEM – display errors / error messages (Diag).
- HEX – extended help (Diag).
- ST – run self-test (Diag).

## Variations: check your site
- The guide's system uses the 10.0.1.x MGD subnet (e.g. 10.0.1.1 DS, 10.0.1.2 AQ, 10.0.1.3 PS, 10.0.1.4 SC, 10.0.1.100 DP), and the guide itself notes your system may be different (p.7, p.12, p.17).
- The field system AMT saw uses 10.0.0.x. Check the site's own configuration; do not copy addresses from the guide.
- STIF is a separate topic and is not covered here.

## Source
GE MGD APS SCP Troubleshooting Guide, Lito Condes (GE MRI Advanced Service Engineer), July 2017 (Rev.2, 21 July 2017; 43 pages). Motorola references cited there: MCP820A/IH, MCP820A/PG, PPCBUGA1/UM, PPCBUGA2/UM, PPCDIAA/UM.

Keywords: Signa Excite HD, HDx, HDxT, MGD, CAM, MCP820, CPCI-6020, CPV3060, APS, AGP, SCP, NVRAM, CNFG, ENV, ENV;D, CNFG;M, PPCBUG, MCP820-Bug, MCP820-Diag, EPPC-Bug, mgd_term, Timekeeper, SN67086, 2294300-16, 2294300-18, 2294300-23, 2294300-14, TPS Reset, Board Information Block
