# Shared content for AMT GE MR Excite II PM checklist (PDF, DOCX, SOURCES_MAP)
DOC_NO = "AMT-PM-GE-MR-EXII"
REV = "Rev 0 (DRAFT 2)"
DOC_DATE = "2026-09-28"
TITLE = "AMT Imaging Solutions - GE MR Excite II and Later - Preventive Maintenance Checklist"
CO = "AMT Imaging Solutions LLC"
CO_SUB = "MRI & CT Field Service  |  Palm Bay, FL  |  Houston, TX"
BASE = "AMT-PM-GE-MR-ExciteII-and-later_Rev0-DRAFT"

INSTRUCTIONS = [
    "Use this form as the record of a planned maintenance (PM) visit. Perform PM at the interval shown for each task and record the results here.",
    "Follow the GE service manual and the GE MR planned-maintenance data sheets for Excite II and later systems for every procedure on this form.",
    "Some items are also listed in the GE Operator's Manual as daily or weekly user tasks. Confirm the site has done them; if not, cover them during the PM visit.",
    "Watch for sharps, blood, contrast, high voltage, moving parts, radiation exposure, and cover safety latches. Take the right precautions to avoid injury or equipment damage.",
    "Work through the sections in order: 1 data collection, 2 technologist interview, 3 cleaning and visual/physical checks, 4 scanning and measurement, 5 sign-off.",
    "Fill in every field; enter N/A where a field does not apply. Enter the system S/N and date in the header of each page. Sign Section 5 when done.",
]

# (key, label, source tag) - site & system info
SYSINFO = [
    ("customer", "Customer / site", "A2,B2"),
    ("address", "Site address", "AMT"),
    ("room", "Room / suite", "AMT"),
    ("model", "System model", "A2,B2"),
    ("sw", "Software version", "AMT"),
    ("sys_sn", "System S/N", "A2,B2"),
    ("sys_id", "System ID", "A2,B2"),
    ("oem_id", "OEM system ID", "B2"),
    ("mag_sn", "Magnet serial #", "AMT"),
    ("pm_date", "PM date", "A,B hdr"),
    ("tech", "AMT field engineer", "A9,B6"),
]
N_EQUIP = 4  # Rev B has 4 rows (Rev A had 13)

# Readings. (id, label, unit, spec, footnote-key, srcA, srcB)
NOSPEC = "per OEM spec"
CAL = [
    ("inhom", "Inhomogeneity (shim)", "Hz", "Std dev, 45 cm DSV: 1.5T <80 Hz whole, <64 Hz zoom; 3T <127 Hz whole, 45 Hz zoom. 22 cm gradient shim: <6 Hz (CX/LCC magnets), <12 Hz (other).", "1", "p8", "p5 (1st)"),
    ("xgc", "X Gradcal", "mm", "Final measurement 99 to 101 mm. CV value: no spec.", "2", "p8", "p5"),
    ("ygc", "Y Gradcal", "mm", "Final measurement 99 to 101 mm. CV value: no spec.", "2", "p8", "p5"),
    ("zgc", "Z Gradcal", "mm", "Final measurement 99 to 101 mm. CV value: no spec.", "2", "p8", "p5"),
    ("hsnr", "Head SNR", "none (ratio)", "1.5T: 76 to 102. 1.0T: 57 to 65. 3T: per OEM spec.", "3", "p8", "p5"),
    ("bsnr", "Body SNR", "none (ratio)", "1.5T: 74 to 79. 1.0T: 39 to 53. 3T: per OEM spec.", "3", "p8", "p5"),
    ("shimtg", "Shim phantom TG", "", "130 to 160 (LVShim phantom, 1.5T and 3T).", "4", "p8", "p5"),
    ("dqatg", "DQA isocenter TG", "", NOSPEC, "", "p8", "p5"),
]
MAG = [
    ("magp", "Magnet pressure", "psi", "Recondensing (zero boil-off) magnets with Magnet Monitor pressure control: 4.0 +/- 0.1 psi (cycles 3.9 to 4.1). Other magnets: per OEM spec.", "5", "p8", "p5"),
    ("lhe", "LHe (helium) level", "%", "Emergency fill at 60%. Do not operate the magnet below 40%.", "6", "p8", "p5"),
    ("compp", "Compressor pressure", "MPa (static: psig)", "Dynamic 2.1 to 2.3 MPa (HC-10, CSW-71). Static at 70 F: 217 +/- 3 psig (HC-10), 236 +/- 3 psig (CSW-71).", "7", "p8", "p5"),
    ("comphrs", "Compressor run hours", "hours", "No limit. Adsorber due at: HC-10 13,000 h; Leybold 18,000 h; CSW-71 / CSA-71A 20,000 h; Balzers 26,000 h; F-50 30,000 h.", "8", "p8", "p5"),
    ("hrstime", "Time run hours logged", "clock time", "n/a", "", "p8", "p5"),
    ("losthrs", "Lost hours", "hours", NOSPEC, "", "p8", "p5"),
]
OTHER_READ = [
    ("rfpwr", "RF power output", "W", "1.5T: body 16 kW (72 dBm), head 2 kW (63 dBm). 3T 35 kW amp: body 34,500 to 35,300 W, head 4,000 to 4,100 W. 3T 25 kW amp: body 24,500 to 25,300 W.", "9", "p5 (task *)", "p3 (task *)"),
]
SM15 = "GE Signa EXCITE HD 1.5T Service Methods (Direction 5133315-3 Rev 14)"
SM3 = "GE Signa EXCITE HD 3.0T Service Methods (Direction 5133330-3 Rev 14)"
SMHD = "GE Signa HDxt Service Methods (Direction 5440001-3 Rev 6)"
FOOTNOTES = [
    ("1", f"{SM15}, 'LVShim Specs' (BRM/TRM whole-body and CRM/TRM zoom tables, 11.x and later) and the gradient-shim table; same values in the 3.0T and HDxt manuals. Limits shown are customer acceptance (shim-to goals are tighter): 1.5T whole-body 45 cm DSV, 200 Hz BW, <80 Hz (1.25 ppm), Oxford magnets 80 Hz; 1.5T zoom <64 Hz (1.00 ppm); 3T LCC 45 cm DSV, 400 Hz BW, <127 Hz (1.00 ppm); 3T zoom 40 cm DSV, 45 Hz (0.35 ppm). If acceptance is exceeded, a main LVShim is required."),
    ("2", f"{SM15}, 'Gradient Calibration Image Analysis', Gradcal data sheet (also in the 3.0T and HDxt manuals). Record the final measurement (mm) and the final CV value; spec applies to the measurement only. TwinSpeed: complete for both Whole and Zoom modes."),
    ("3", f"{SM15}, 'SNR Data Sheets' (same text in the 3.0T and HDxt manuals). Range covers axial, sagittal and coronal. Applies to the GE SNR check: body SNR sphere in the body loader; head SNR sphere in the head loader with the quad head coil; phantom at 22 +/- 2 C; same gradient mode throughout (TwinSpeed: one set per mode). The manual gives no 3T values."),
    ("4", f"{SM15} and {SM3}, LVShim procedures ('Main LVShim', 'Gradient LVShim', 'Rough LVShim', 'LVShim Analysis'): TG should be between 130 and 160. No unit stated."),
    ("5", f"{SM15}, 'Main LVShim Procedure' (helium vessel pressure 4.0 +/- 0.1 psi) and 'Inspecting Cryocooler Systems' (vessel pressure cycling 3.9 to 4.1 psi on Magnet Monitor, zero boil-off systems); {SMHD}, 'Shimming' (3.9 to 4.1 psig)."),
    ("6", f"{SMHD}, 'Liquid Helium Fill', Minimum Cryogen Levels table (percent on the cryogen monitor). Magnets with out-of-spec boil-off may need a fill at higher levels."),
    ("7", f"{SM15}, 'Inspecting Cryocooler Systems': Sumitomo HC-10 shield cooler and CSW-71 4K (zero boil-off) compressors. F-50 tolerance is given only as a gauge illustration; other compressors: per OEM spec."),
    ("8", f"{SM15}, 'Inspecting Cryocooler Systems' (adsorber replacement interval by compressor type). Compare run hours with the date of the last adsorber change."),
    ("9", f"{SM15}, 'Body and Head Maximum Power RF Output Check' (meets and does not exceed); {SM3}, 35 kW and 25kW/35kW Eclipse 2 amplifier maximum power setup. The 3T Eclipse 2 head setup gives both 4,000-4,100 W and 3,300-3,400 W, so use per OEM spec for that head value."),
]
# Checklist sections in source order. Task: (id, text, interval, only, srcA, srcB)
BM, SIX = "Bi-monthly", "6 months"
SECTIONS = [
  ("Safety and Regulatory", [
    ("S1", "Oxygen (O2) monitor: confirm correct operation, where installed.", BM, "", "p5 #1", "p3 #1"),
    ("S2", "Peripheral pulse gating cable: inspect.", BM, "", "p5 #2", "p3 #2"),
    ("S3", "Patient pneumatic alert system: confirm it works.", BM, "A", "p5 #3", "-"),
    ("S4", "RF power output: check and record in Section 1F.", BM, "", "p5 #4", "p3 #3"),
    ("S5", "Cradle emergency release: confirm it works.", BM, "", "p5 #5", "p3 #4"),
    ("S6", "Patient transport emergency release: confirm it works.", BM, "", "p5 #6", "p3 #5"),
    ("S7", "Patient transport casters: inspect.", BM, "", "p5 #7", "p3 #6"),
    ("S8", "Patient armboard setscrews: check.", BM, "", "p5 #8", "p3 #7"),
    ("S9", "Confirm the table cannot be lowered unless the cradle is at home.", BM, "", "p5 #9", "p3 #8"),
    ("S10", "Cradle longitudinal drive clutch: check.", BM, "", "p5 #10", "p3 #9"),
    ("S11", "Cradle and carriage wheels: check all.", BM, "", "p5 #11", "p3 #10"),
    ("S12", "Emergency off circuits: check.", BM, "", "p5 #12", "p3 #11"),
    ("S13", "Power monitor: perform functional test.", SIX, "", "p5 #13", "p3 #12"),
    ("S14", "Magnet run-down unit (ERU, MRU): check.", BM, "", "p5 #14", "p3 #13"),
  ]),
  ("Image Quality", [
    ("IQ1", "X gradient calibration: check; record X Gradcal in 1D.", BM, "", "p6 #1", "p3 #14"),
    ("IQ2", "Y gradient calibration: check; record Y Gradcal in 1D.", BM, "", "p6 #2", "p3 #15"),
    ("IQ3", "Z gradient calibration: check; record Z Gradcal in 1D.", BM, "", "p6 #3", "p3 #16"),
    ("IQ4", "Shim: check; record inhomogeneity in 1D.", BM, "", "p6 #4", "p3 #17"),
    ("IQ5", "Head SNR: check; record in 1D.", BM, "", "p6 #5", "p3 #18"),
    ("IQ6", "Body SNR: check; record in 1D.", BM, "", "p6 #6", "p3 #19"),
    ("IQ7", "Receive path: confirm all receive paths function.", BM, "", "p6 #7", "p3 #20"),
  ]),
  ("Other (Available During Patient Scanning)", [
    ("OA1", "RF cabinet filters: check and clean, if equipped.", BM, "", "p6 #8+#9", "p4 #1"),
    ("OA2", "ACGD/HGD cabinet filters: check and clean.", BM, "", "p6 #10+#11 (ACGD/HFD)", "p4 #2"),
    ("OA3", "Host fans and vents: check and clean.", BM, "B", "-", "p4 #3"),
    ("OA4", "TAC cabinet filters: check and clean, if equipped.", BM, "", "p6 #12+#13", "p4 #4"),
    ("OA5", "Excite/system cabinet fans: check.", BM, "A", "p6 #14", "-"),
    ("OA6", "Excite/system cabinet filters: check and clean.", BM, "", "p6 #15", "p4 #5"),
    ("OA7", "GOC/system clock: confirm it is accurate.", BM, "", "p6 #16", "p4 #6"),
    ("OA8", "Computer room air temperature: check.", BM, "", "p6 #17", "p4 #7"),
  ]),
  ("Other (Not Available During Patient Scanning)", [
    ("ON1", "RF shielding and door seals: check.", BM, "", "p7 #1", "p4 #8"),
    ("ON2", "Patient fans/blowers: check; clean the filter.", BM, "", "p7 #2", "p4 #9"),
    ("ON3", "Gradient coil cooling unit: check.", BM, "", "p7 #3", "p4 #10"),
    ("ON4", "Patient table: clean.", BM, "", "p7 #4", "p4 #11"),
    ("ON5", "Dock pedal springs: check.", SIX, "", "p7 #5", "p4 #12"),
    ("ON6", "Run AGP, APS and SCP diagnostics.", BM, "", "p7 #6", "p4 #13"),
    ("ON7", "GOC and HP computer fans and air intake: clean.", BM, "", "p7 #7", "p4 #14"),
    ("ON8", "GOC mouse: check and clean.", BM, "", "p7 #8", "p4 #15"),
    ("ON9", "Error log: check, then delete.", BM, "", "p7 #9", "p4 #16"),
    ("ON10", "Excess \"core\" files: remove.", BM, "", "p7 #10", "p4 #17"),
    ("ON11", "Gradient cable connections and supports: check.", SIX, "", "p7 #11", "p4 #18"),
    ("ON12", "Magnet room RF cables and connections: check.", SIX, "", "p7 #12", "p4 #19"),
    ("ON13", "Patient transport hydraulic fluid: check level.", SIX, "", "p7 #13", "p4 #20"),
    ("ON14", "PDU power connection: inspect.", SIX, "", "p7 #14", "p4 #21"),
    ("ON15", "Patient alignment lights: check.", BM, "", "p7 #15", "p4 #22"),
    ("ON16", "ISO Z table movement: check.", BM, "", "p7 #16", "p4 #23"),
    ("ON17", "Magnet pressure: record in 1E.", BM, "", "p7 #17", "p5 #1"),
    ("ON18", "Shield cooler hours: record in 1E.", BM, "", "p7 #18", "p5 #2"),
    ("ON19", "Shield cooler lost hours: calculate; record in 1E.", BM, "", "p7 #19", "p5 #3"),
    ("ON20", "Helium level: record in 1E.", BM, "", "p7 #20", "p5 #4"),
    ("ON21", "Static shield cooler compressor pressure: record in 1E.", BM, "A", "p7 #21", "- (value field only, p5 table)"),
    ("ON22", "System-level information: back up.", BM, "", "p7 #22", "p5 #5"),
    ("ON23", "Customer protocols: back up.", BM, "", "p7 #23", "p5 #6"),
  ]),
]


# ---------------- DRAFT 2 flow (Mike, 2026-09-28) ----------------
# Tasks keep their source wording and interval. Only order/number change.
# Section-1 cross references are renumbered because 1C (reported problems) moved to Section 2:
# old 1D -> 1C, old 1E -> 1D, old 1F -> 1E.
XREF = [("in Section 1F", "in Section 1E"), ("in 1D", "in 1C"), ("in 1E", "in 1D")]
FLOW = [
  (3, "SECTION 3 - CLEANING AND VISUAL / PHYSICAL CHECKS", [
    ("3A  Safety and emergency functions", ["S1", "S3", "S5", "S6", "S12", "S13", "S14"]),
    ("3B  Patient table and transport", ["ON4", "S7", "S8", "S9", "S10", "S11", "ON5", "ON13", "ON15", "ON16"]),
    ("3C  Magnet room, RF shielding and cables", ["ON1", "ON2", "S2", "ON11", "ON12"]),
    ("3D  Equipment room: cabinets, filters, fans, power and cooling", ["OA1", "OA2", "OA4", "OA5", "OA6", "ON3", "ON14", "OA8"]),
    ("3E  Operator console and host computer", ["OA3", "ON7", "ON8"]),
  ]),
  (4, "SECTION 4 - SCANNING AND MEASUREMENT", [
    ("4A  Calibration and image quality", ["IQ1", "IQ2", "IQ3", "IQ4", "IQ5", "IQ6", "IQ7"]),
    ("4B  RF power", ["S4"]),
    ("4C  Magnet and cryogen data", ["ON17", "ON18", "ON19", "ON20", "ON21"]),
    ("4D  Diagnostics, system software and backups", ["ON6", "OA7", "ON9", "ON10", "ON22", "ON23"]),
  ]),
]
# Placements that could have gone in Section 3 or Section 4 (reported to Mike)
AMBIGUOUS = {
    "ON15": "Patient alignment lights: put in 3B (table/visual check), not 4.",
    "ON16": "ISO Z table movement: put in 3B (mechanical table check), not 4.",
    "OA7": "GOC/system clock: put in 4D with the software checks, not 3.",
    "OA8": "Computer room air temperature: put in 3D (room check), not 4.",
    "ON9": "Error log check/delete: put in 4D next to diagnostics, not 3 (not a cleaning task).",
    "ON10": "Excess core files: put in 4D next to diagnostics, not 3 (not a cleaning task).",
    "ON22": "System-level backup: put at the end of 4D, after all scanning.",
    "ON23": "Customer protocol backup: put at the end of 4D, after all scanning.",
    "IQ7": "Receive path function: put in 4A (needs scanning), not 3.",
    "S3": "Patient pneumatic alert: put in 3A (safety function test, no scan needed).",
    "S13": "Power monitor functional test: put in 3A (safety), not 4.",
    "ON17": "Record magnet pressure/cooler/helium values (ON17-ON21): put in 4C with magnet data, not 3.",
}
OLD = {tid: (tid, text, iv, only, a, b, sname) for sname, tasks in SECTIONS for tid, text, iv, only, a, b in tasks}
AVAIL = {"Other (Available During Patient Scanning)": "No", "Other (Not Available During Patient Scanning)": "Yes"}

def _xref(t):
    for a, b in XREF:
        t = t.replace(a, b)
    return t

def flow_tasks():
    """Returns [(secno, sectitle, [(grouptitle, [(newno, oldid, text, iv, only, a, b, oldsec, down)])])]"""
    out = []
    used = []
    for secno, stitle, groups in FLOW:
        n = 0; gl = []
        for gtitle, ids in groups:
            rows = []
            for oid in ids:
                n += 1; used.append(oid)
                tid, text, iv, only, a, b, sname = OLD[oid]
                rows.append((f"{secno}.{n}", oid, _xref(text), iv, only, a, b, sname, AVAIL.get(sname, "")))
            gl.append((gtitle, rows))
        out.append((secno, stitle, gl))
    assert sorted(used) == sorted(OLD), (set(OLD) - set(used), [u for u in used if used.count(u) > 1])
    return out

NEWNO = {r[1]: r[0] for _, _, gl in flow_tasks() for _, rows in gl for r in rows}
N_INTERVIEW = 5

ACTION_CODES = "Action codes (use in the Action column): CL = cleaned, AD = adjusted, RP = repaired, RL = replaced, NAD = needs adjustment, NRP = needs repair, NRL = needs replacement."

CONDITION = [
    ("none", "No deficiencies.", "Image quality testing showed no deviation from the required reference values."),
    ("slight", "Minor deficiencies.", "Operation is not affected, but they should be corrected as preventive work. Image quality testing showed no deviation from the required reference values."),
    ("serious", "Serious deficiencies.", "These must be corrected before the system is released for use."),
]

REV_NOTES_CONFLICTS = [
    "Filter tasks (RF cabinet, ACGD gradient cabinet, TAC cabinet): Rev A lists separate 'check' and 'clean' rows for each; Rev B combines each pair into one 'check and clean' row. Used Rev B (one row each: " + ", ".join(NEWNO[k] for k in ("OA1", "OA2", "OA4")) + ").",
    "Gradient cabinet name: Rev A says 'ACGD/HFD'; Rev B says 'ACGD/HGD'. Used Rev B wording per the merge rule. Note: the GE service manuals use 'HFD' (for example 'HFD/ACGD Installation Input Voltage Selection') and never 'HGD', so Rev A's name matches GE. Wording left as in Rev B; flagged for review.",
    "Excite/system cabinet: Rev A has 'check fans' plus 'clean filters'; Rev B has 'check and clean filters' only. Used Rev B for the filters (" + NEWNO["OA6"] + ") and kept Rev A's fan check as a separate Rev A-only row (" + NEWNO["OA5"] + ").",
    "Head/Body SNR: Rev A marks both as 'record value'; Rev B drops the record marker, but both data tables still have Head SNR and Body SNR fields. Kept Rev B task wording and kept the data fields (1C).",
    "Data table order: Rev A lists Magnet Data, then Calibration Data; Rev B places Calibration Data (left) beside Magnet Data (right). Used Rev B order (1C Calibration, then 1D Magnet).",
    "Measuring equipment table: Rev A has 13 rows; Rev B has 4. Used Rev B (4 rows).",
    "Result columns: Rev A has Passed, Cleaned, Adjusted, Replaced, Repaired, Needs Adjustment, Needs Replacement, Needs Repair, Failed, N/A. Rev B has the same without N/A, in a different order. AMT uses Pass / Fail / N/A check boxes plus an Action code column that covers the other statuses, which is AMT's layout.",
    "Interval notation: Rev A writes the interval on each row; Rev B uses codes (A = bi-monthly, B = 6 months). The intervals match on every shared task, so there is no interval conflict. AMT writes the interval out in full.",
    "System Condition: Rev A uses check boxes; Rev B uses radio buttons. AMT uses a radio group (only one choice can be selected).",
]
REV_NOTES_A_ONLY = [
    NEWNO["S3"] + " Patient pneumatic alert system (Rev A p5).",
    NEWNO["OA5"] + " Excite/system cabinet fans check (Rev A p6).",
    NEWNO["ON21"] + " Record static shield cooler compressor pressure (Rev A p7). Rev B keeps the Compressor Pressure data field but has no task row for it.",
    "Safety caution in the instructions (sharps, blood, contrast, high voltage, moving parts, radiation exposure, cover safety latches) (Rev A p3).",
    "Customer name/date sign-off block (Rev A p9). Rev B p6 has two unlabeled boxes at the bottom instead.",
]
REV_NOTES_B_ONLY = [
    NEWNO["OA3"] + " Host fans and vents check and clean (Rev B p4).",
    "OEM system ID field (Rev B p2).",
    "Customer/operator-reported problems and FSE-reported problems boxes (Rev B p2). Now in Section 2 (Technologist Interview) and Section 5 (Sign-off).",
    "Instruction note that some items are daily/weekly operator tasks in the GE Operator's Manual (Rev B p1).",
]
AMT_ADDED = [
    "DRAFT 2 flow: data collection first, then the technologist interview, then all cleaning and visual/physical checks, then scanning and measurement, then sign-off. Task wording and intervals are unchanged; tasks were renumbered 3.x and 4.x. Section 1 references in task text were renumbered to match (old 1D/1E/1F are now 1C/1D/1E).",
    "Section 2 Technologist Interview table (issue reported, follow-up, resolved yes/no, 5 rows) plus technologist name and a box for other customer/operator-reported problems.",
    "Off-line column: 'Yes' = source listed the task under 'Not Available During Patient Scanning'; 'No' = 'Available During Patient Scanning'; blank = the source did not say.",
    "Spec / acceptance values, units and footnotes for the Section 1 readings, taken from the GE Signa Excite / HDxt service manuals (see footnotes).",
    "Site address, room/suite, software version, magnet serial #, PM interval selector, and AMT field engineer fields in 1A (AMT additions; not in either source).",
    "Comment column on every task and signature lines for engineer and customer.",
    "Section 1E RF power output value row (task " + NEWNO["S4"] + " is marked 'record' in both revisions, but neither source data table has a field for it).",
]

APPX_INTRO = ("This checklist combines two earlier revisions of the same procedure. Where the revisions disagree, Rev B was used. "
              "DRAFT 2 changes the order to match how a PM visit runs: data collection first, then the technologist interview, "
              "then cleaning and visual/physical checks, then scanning and measurement, then sign-off. Task wording and intervals "
              "are unchanged; only the order and numbers changed. SOURCES_MAP.md lists each task's DRAFT 1 ID and Rev A/Rev B origin.")
