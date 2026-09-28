# MRI Magnet, RF Coil and Coil-Use Image Artifacts: GE + Siemens Field Guide

**AMT Imaging Solutions** · 2026-09-27

---

## Scope

This guide covers GE MRI systems (Signa HDxt/EXCITE, Optima MR450w, SIGNA Explorer/Creator family, SIGNA Premier, SIGNA Artist Evo) only where the cited documents cover them. It also covers Siemens MAGNETOM systems (Avanto, Espree, Aera, Skyra); Symphony-era documents are used for principles only. No Sola/Vida-class service documents were found (gap logged).

It addresses artifacts from:

- the magnet (shim, drift, cold head)
- RF and gradient hardware
- the room (RF shielding)
- coil use (coil selection, element selection, positioning/padding/isocenter, FOV/wrap, small/pediatric/veterinary patients)

There are 22 entries. Entry 1 is a real AMT veterinary case (GE CTL spine coil, lumbar-only artifacts on small animals) and is the template for all the others.

**Entry layout:**
1. Looks like
2. Root causes
3. How to confirm
4. OEM fix (GE / Siemens notes)
5. Fixable in field / replace / accept
6. Customer explanation

Each entry then has a **Verdict** line (Usage/protocol limit, Real fault, Accept (design limit), or Depends, naming the deciding test), a **Sources** line and a **Field practice (unsourced)** line.

**Rules:**
- Every OEM recommendation is cited by source key in brackets (G = GE, S = Siemens, N = vendor-neutral/non-OEM, A = AMT field note/non-OEM; see the Source key).
- Anything unsourced is labeled Field practice (unsourced).
- No part numbers are given. Parts do not interchange just because they share a family name or prefix; use the specific system's parts documentation.
- Where no OEM document exists, the entry says so and a row is logged in the AMT field gap log.

---

## How to use this guide

1. **Start from what the image looks like.**
2. **Rule out usage/protocol causes first** (coil choice, element selection, positioning, FOV). OEM documents name improper coil use as a major cause of artifacts [G1].
3. **Run the entry's confirm tests on a phantom before replacing hardware.** Note the exceptions: a zipper may not show on a phantom [G7 zippers/zipper_flowchart.pdf], and the GE DWI "wormhole" case could not be reproduced on one [G2].
4. **Use the Verdict line** to decide usage limit vs real fault.
5. **Give the customer the plain-language explanation** (part 6, or the quick table below).

---

## Source key

| Key | Source | Location (library path or URL) |
|---|---|---|
| G1 | GE Healthcare "MR Field Notes" Vol.1 No.2, Spring 2005, "Coil-induced Artifacts" (GE newsletter, third-party hosted) | https://mri-q.com/uploads/3/4/5/7/34572113/ge_fieldnotes_volume1-2_coils.pdf |
| G2 | "GE MR Known Artifacts" (GEHC training deck, R. Boudjella-Meziane & M. Pastouret) | library Manuals/Error codes and Troubleshooting All Systems/GE MR Known Artifacts.pdf |
| G3 | GE SIGNA Creator/Explorer/Star/Aviator Service Manual 5756356-2EN Rev 11 | library Manuals/GE/GE_Explorer_SV25_SM/root/ (page named per item) |
| G4 | GE Optima MR450w 1.5T General Service Manual 5690012-2EN Rev 7 | library Manuals/GE/GE_450W_2/root/ |
| G5 | GE SIGNA Premier 3.0T Service Manual 5777451-3 Rev 7 | library Manuals/GE/Premier/root/ |
| G6 | GE SIGNA Artist Evo System Service Methods | library Manuals/GE/Artist_EVO/Root/ |
| G7 | GE Signa EXCITE/HDxt image-quality troubleshooting database | library Manuals/GE/HDxt 1.5T and 3T/root/data/Signa_EXCITE/content/Troubleshooting/IQ_DB2/troubsht/ (subfolder per item) |
| G8 | GE 1.5T CTL coil troubleshooting (LX 9X platform) | library Manuals/GE/LX 9X Platform/coils/15ctl.pdf |
| G9 | GE Error Message Tool | library Manuals/Error codes and Troubleshooting All Systems/GE_Error_Message_Tool.json |
| S1 | Siemens MAGNETOM Family Operator Manual - MR System, syngo MR E11, Print No. MR-02501G.621.03.02.02 | https://content.doclib.siemens-healthineers.com/rest/v1/view?document-id=580762 |
| S2 | Same manual, syngo MR B19, Print No. MR-01501G.621.01.02.02 | https://content.doclib.siemens-healthineers.com/rest/v1/view?document-id=368903 |
| S3 | Siemens syngo MR E11 Operator Manual - Neuro, Print No. MR-05014.630.11Q.03.02 | https://content.doclib.siemens-healthineers.com/rest/v1/view?document-id=333098 |
| S4 | Siemens MAGNETOM Flash 46 (names the syngo feature "AutoCoilSelect") | https://cdn0.scrvt.com/39b415fb07de4d9656c7b516d8e2d907/1800000000090326/8a27a313f885/magnetom_flash_46-00090326_1800000000090326.pdf |
| S5 | Siemens Healthineers Pediatric MRI page | https://www.siemens-healthineers.com/en-uk/magnetic-resonance-imaging/clinical-specialities/pediatric-mri |
| S6 | Siemens Avanto/Espree RF Troubleshooting Guide M6-020.840.14.10.02 | library Manuals/Siemens/Avanto/Avanto RF TSG  M6-020.840.14.10.02.pdf |
| S7 | Siemens Gradient Troubleshooting Guide M7-000.840.16.07.02 (covers Aera, Skyra, Avanto fit, Skyra fit) | library Manuals/Siemens/Avanto/Avanto Gradient TSG M7-000.840.16.07.02.pdf |
| S8 | Siemens Symphony 3.5 Trouble Shooting Guide M1-010.840.01.03.02, Gradient Image Quality TSG chart 9.1.3.3 (older platform; principles only) | library Manuals/Siemens/Symphony_MRI/Symphony 3.5 Trouble Shooting guide M1-010.840.01.03.02.pdf |
| S9 | Siemens Symphony RF Troubleshooting MR-000.840.14.06.02 (older platform) | library Manuals/Siemens/Symphony_MRI/Symphony RF Troubleshooting MR-000.840.14.06.02.pdf |
| S10 | Siemens Avanto/Espree Magnet Troubleshooting with MSUP commands M6-020.840.17.13.02 | library Manuals/Siemens/Avanto/Avanto Magnet Troubleshooting with MSUP commands  M6-020.840.17.13.02.pdf |
| S11 | Siemens Aera Maintenance Instructions M7-010.831.05.01.02 | library Manuals/Siemens/Aera/Aera Maintenance Instructions M7-010.831.05.01.02.pdf |
| S12 | Siemens AG "Magnets, Flows and Artifacts" (2004 educational book) | library Manuals/Error codes and Troubleshooting All Systems/Magnets_Flows_and_Artifacts.pdf |
| N1 | ACR 2015 MRI Quality Control Manual | https://edge.sitecorecloud.io/americancoldf5f-acrorgf92a-productioncb02-3650/media/ACR/Files/Clinical/Quality-Control-Manuals/MRI-Quality-Control-Manual.pdf |
| N2 | AAPM Report No. 100 (2010), Acceptance Testing and QA Procedures for MRI Facilities | https://www.aapm.org/pubs/reports/RPT_100.pdf |
| N3 | Zhalniarovich Y et al., Pol J Vet Sci 2013;16(1):157-163 (peer-reviewed veterinary, NOT GE/Siemens) | https://journals.pan.pl/Content/99137/PDF/22.pdf |
| A1 | AMT/field-authored library notes (NOT OEM) | library Manuals/Error codes and Troubleshooting All Systems/CTL coil scan.doc; Coil testing.doc; Coldhead troubleshooting.docx |

Library paths are in the AMT Manuals library (repo `Manuals/`; Pages: `https://mikejackson-stack.github.io/AMT-Imaging-Service-App/Manuals/<path>`).

---

## Customer-explanation quick table

| # | Situation | Verdict | What to tell the customer |
|---|---|---|---|
| 1 | GE CTL spine array: small animals, lumbar only | Usage/protocol limit (moderate confidence, about 70%) | The spine coil is built for human patients, so a small animal fills only part of it; we test the coil first, then adjust positioning and settings. |
| 2 | GE: small or pediatric patients, large coils | Usage/protocol limit | Larger coils are built for larger bodies, so small patients produce grainy or uneven pictures. |
| 3 | GE: wrong coil configuration / element selection | Usage/protocol limit | These marks come from a mismatch between scan settings and the coil section that is switched on. |
| 4 | GE: positioning, padding and isocenter | Usage/protocol limit | The scanner gives the most even picture when the body part is centered in both scanner and coil. |
| 5 | GE: FOV and wrap | Usage/protocol limit | The coil picks up a wider area than the picture shows, so part of the body folds over. |
| 6 | Siemens: small, pediatric and veterinary patients | Usage/protocol limit | The adult-sized coil sits far from a small patient's body and picks up less signal, making grainy pictures. |
| 7 | Siemens: coil element selection, AutoCoilSelect, iPAT | Depends | Uneven brightness usually means the active coil part doesn't fully cover the area being scanned. |
| 8 | Siemens: positioning and isocenter | Usage/protocol limit | The magnet gives its most accurate picture at its exact center; images naturally stretch or fade toward edges. |
| 9 | Siemens: FOV and wrap-around | Usage/protocol limit | Part of the body outside the picture area is folding over onto the image. |
| 10 | B0 inhomogeneity / poor shim | Depends | Fat suppression and sharp geometry depend on the magnet's field being very even. |
| 11 | Metal in bore or on patient | Usage/site condition (not a system fault) | A small piece of metal bends the magnetic field and leaves a dark or distorted spot. |
| 12 | B0 / center-frequency drift | Depends | Magnet strength drifts slightly over time; we track it and re-tune when needed to keep images even. |
| 13 | Cold head / compressor / vibration ghosting | Depends | We test with each vibration source switched off to find the cause, then fix or isolate it. |
| 14 | RF interference / zipper / RF leak | Real fault (room/site or third-party device) | Outside radio signals leak in through door seals or room devices; we find and seal the source. |
| 15 | Hardware ghosting not caused by motion | Real fault | A scanner part isn't holding steady; we test to find which one, then repair it. |
| 16 | Spikes / white pixels / corduroy | Real fault | Electrical sparks from loose connections cause the specks; we find, tighten, and retest them. |
| 17 | Receive coil element failure | Real fault | Part of the coil may not pick up signal; we test each section and replace if needed. |
| 18 | Coil cable / connector / Coil ID faults | Real fault | A loose or damaged connection causes image dropout; we reseat, test, and repair or replace. |
| 19 | Eddy currents (EPI/DWI) | Depends | Fast scans are sensitive to leftover currents; we re-tune corrections and check scan settings. |
| 20 | Gradient coil / bore mechanical looseness | Real fault (mechanical) | Vibrations can loosen internal mounts; tightening them usually fixes the odd stripes or holes. |
| 21 | Gradient non-linearity / edge distortion | Accept (design limit) | Image edges naturally bend a little; software correction and centering handle this normal behavior. |
| 22 | RF transmit / B1 problems | Depends | Uneven radio waves cause shading or ghosts; tests show whether parts need repair or settings adjustment. |

---

## Entries

### 1. GE CTL spine array: artifacts only in the lumbar section, only on small animals (veterinary customer)
**Category:** coil_use · **OEM:** GE
1. **Looks like:** Shading, reduced signal, bands of cancellation, bright spots, wrap, or smeared ribbon-like ghosts in the lumbar section on small-animal spine images, while larger subjects and the other CTL sections look normal.
2. **Root causes:** Improper coil use: wrong coil configuration, improper positioning, or poor FOV selection is a major cause of image artifacts [G1]. Signal falls off with distance from the coil [G1]; veterinary literature (non-OEM) notes the same and says phased-array coils suit medium and large dogs for spine in dorsal recumbency [N3]. Other causes: FOV not matched to or centered on the active lumbar elements, which causes aliasing or Annefact/Star artifact [G1, G2]; direct coil contact causing bright spots [G1]. Less commonly: a faulty lumbar element or a poor quick-disconnect connection [G1, G2, G7].
3. **How to confirm:** Check landmark, scan locations, FOV offsets and the Currently Connected coils [G3 r_ts_1-5T-8-Channel-CTL-Troubleshooting_3090421.html]. Check each lumbar element with manual prescan [G1]. Run coil QA (MCQA) / the SNR test with phantoms on the same lumbar configuration [G3 r_ts_HD-8-Channel-CTL-Coil-Troubleshooting_3241217.html, G3 r_ts_1-5T-8-Channel-CTL-Troubleshooting_3090421.html]. Do a substitute-coil scan, then try another coil of the same type [G3 r_ts_HD-8-Channel-CTL-Coil-Troubleshooting_3241217.html]. Reseat the quick disconnect and rescan [G2, G7]. Differential: a real element fault shows on any subject in that section (phantom or larger animal) and in per-element prescan/MCQA. A usage limit shows only with small subjects.
4. **OEM fix:**
   - **GE:** Put the anatomy in the center of the magnetic field, the center of the coil and the group of sections acquired; landmark on the coil marker [G1]. Select the number of elements for the area to be covered, center them over the region of interest, and match the FOV to the elements (each CTL segment covers about 12 cm: FOV about 24 cm for 2 segments, 36 cm for 3, >42 cm for 4; center the S/I FOV over the middle of the used elements) [G1, G2]. Pick receive coils that match the FOV and do not swap phase/frequency, to avoid Star/Annefact [G1]. If the coil is larger than the FOV, use No Phase Wrap to remove aliasing (it does not improve SNR) [G1]. Pad or fold a sheet between patient and coil [G1]. Use PURE or SCIC for surface-coil intensity non-uniformity [G1]. An ASSET calibration that does not match the coil, patient position, patient entry or landmark raises EM_mrMSA_NOT_ASSET_COIL [G9]. If anatomy makes the coil hard to use, an alternative coil (such as a Flexcoil) may be needed; image quality may suffer [G1]. If an element is faulty, stop using the coil and call service [G1]. No GE document found for veterinary or small-animal CTL use; the CTL coil operator manual is not in the AMT library (gap logged).
5. **Fixable in field / replace / accept:** Usually fixable in the field by repositioning, choosing a different element group or FOV, padding, No Phase Wrap and PURE/SCIC [G1, G2]. Reseat the quick disconnect if the fault is a connection [G2, G7]. Replace the coil only if an element fails prescan/MCQA on a phantom; on the 1.5T CTL (LX platform) PIN diodes are not field replaceable [G8].
6. **Customer explanation:** "The spine coil on your MRI was designed around human patients, so a small animal fills only part of the lower (lumbar) section, and that part of the image can look uneven or show ghost-like marks. We'll check the coil with a test object first. If it passes, better positioning and matched scan settings should clear this up; if it fails, the coil needs repair or replacement."

**Verdict:** Usage/protocol limit (moderate confidence, about 70%): it becomes a real fault only if a phantom/MCQA in the same lumbar configuration fails or a larger subject shows the same artifact.
**Sources:** G1, G2, G3, G4, G7, G8, G9, N3
**Field practice (unsourced):** A small animal in sternal (ventral) recumbency puts the spine farthest from the table coil; keep the FOV centered on the active lumbar elements and pick the smallest element group that covers the animal; add No Phase Wrap when the animal is narrower than the active elements; human knee/extremity coils for small dogs and cats come from veterinary literature [N3], not from GE.

---

### 2. GE: small or pediatric patients on large array coils (coil selection and alternate coil)
**Category:** coil_use · **OEM:** GE
1. **Looks like:** Low SNR or uneven signal (bright near the coil surface, darker away from it), with image quality lower than expected when the anatomy is much smaller than the coil.
2. **Root causes:** Coil too large for the anatomy: the larger a coil, the less sensitive it is (lower SNR) [G1]. Surface-coil signal non-uniformity [G1]. With light subjects such as children and babies, table vibration from aging table mechanics can add phase ghosting (AAPM, non-OEM) [N2].
3. **How to confirm:** Review the coil choice against the anatomy and FOV [G1]. Check each element with manual prescan to rule out a faulty element [G1].
4. **OEM fix:**
   - **GE:** Match the coil to the anatomy and choose the coil most appropriate for the anatomy and required FOV; smaller coils cover less but raise SNR [G1]. If anatomy makes the appropriate coil difficult, use an alternative coil (such as a Flexcoil); image quality may suffer [G1]. For non-uniform signal, try a different coil or STIR, or use PURE/SCIC [G1]. Use the supplied coil pads; the coil should never touch the patient; do not loop or cross cables [G1]. If an element is faulty, stop using the coil and call service [G1]. No GE pediatric-specific coil-use document found (gap logged).
5. **Fixable in field / replace / accept:** A coil-size limit is accepted or worked around with coil choice and protocol [G1]. If an element fails manual prescan, stop using the coil and call service [G1].
6. **Customer explanation:** "Larger coils are built for larger bodies, so on a small patient they pick up less signal and the picture can look grainy or uneven. A coil that better fits the patient's size usually gives a cleaner image, though it may cover a smaller area."

**Verdict:** Usage/protocol limit (coil too large for the patient): it is a real fault only if an element fails per-element manual prescan.
**Sources:** G1, N2
**Field practice (unsourced):** None

---

### 3. GE: wrong coil configuration / element selection (CTL, spine arrays) and calibration mismatch
**Category:** coil_use · **OEM:** GE
1. **Looks like:** Shading at the top of the image; a bright star-like spot (Star artifact) or a smeared ribbon of signal in the phase direction (Annefact); zipper-like lines in TwinSpeed Zoom mode; a band-shaped signal void; ASSET/coil messages such as EM_mrMSA_NOT_ASSET_COIL, EM_mrMSA_ASSET_IMAGE_QUALITY or EM_mrSrx_COIL_ID_MISMATCH [G1, G2, G9].
2. **Root causes:** Too many or wrong elements selected, or elements not centered on the region of interest; FOV not matched to the active elements; phase/frequency swapped [G1]. The CTLMID configuration turns off the top coils, which causes shading at the top [G2]. A sat band carried over by "RX Scan" (copy of the previous series) [G2]. Calibration missing, or a mismatch in coil, patient position, patient entry or landmark [G9].
3. **How to confirm:** Compare the selected configuration and FOV with the area scanned [G1, G2]. Look for a carried-over sat band on the prescription [G2]. Check the ASSET/coil messages [G9]. The artifact should clear with a matched element group, a matched FOV, no phase/frequency swap and a matching calibration.
4. **OEM fix:**
   - **GE:** Select the number of elements for the area, center them on the region of interest and match the FOV to them. Examples: a 38 cm swapped CTLMID scan → 3-coil USCTS234 with no swap; a 24 cm swapped scan → 2-coil CS12; matched groups such as LS45, LS56, CS12 [G1]. Use CTLTOP instead of CTLMID when top coverage is needed [G2]. For Startifact, use the recommended coil selection for the FOV [G2]. For TwinSpeed Zoom zippers with CTL LS456/CS123: narrow the SAT band (30 mm), pick coils inside the zoom limit, or use Whole mode [G2]; or use Whole mode or 2-coil CS12 [G1]. Remove sat bands carried over by RX Scan [G2]. Use a calibration that matches the current coil, patient position, entry and landmark [G9].
5. **Fixable in field / replace / accept:** Fixable in the field with protocol and selection changes; no hardware action is needed [G1, G2]. Note that a 2-coil CTL selection gives about 27% more SNR than 3 coils [G2].
6. **Customer explanation:** "These marks come from a mismatch between the scan settings and the part of the coil that is switched on. Matching the coil section and scan area to the body part, and redoing the setup scan, should clear it without any repair."

**Verdict:** Usage/protocol limit: confirmed when the artifact clears with a matched element selection/FOV and a matching calibration.
**Sources:** G1, G2, G9
**Field practice (unsourced):** None

---

### 4. GE: positioning, padding and isocenter (shading, bright spots, fat-sat loss off-center)
**Category:** coil_use · **OEM:** GE
1. **Looks like:** Shading (reduced signal or bands of signal cancellation); patchy bright spots or a local drop in coil signal; fat saturation that fails toward the edges when the anatomy sits far from isocenter [G1, G7 shading/FATSAT.pdf].
2. **Root causes:** Improper coil or patient positioning: anatomy not centered in the magnetic field, the coil, or the group of sections [G1]. Patient touching the coil directly [G1]. Landmark set on the anatomy instead of the coil marker [G1]. Off-center positioning loads the coil unevenly (asymmetric coil loading) [G7 shading/shading_theory.htm]. Anatomy outside the region where the shim is uniform (about a 40 cm DSV) [G7 shading/FATSAT.pdf]. Abnormal shading can also come from B0 (shim, metal) or RF homogeneity [G7 shading/shading_theory.htm].
3. **How to confirm:** Verify the coil is properly positioned; verify landmark, scan locations and FOV offsets [G3]. Check that a pad or folded sheet separates the patient from the coil [G1]. Rescan with the anatomy recentered at isocenter and landmarked on the coil marker [G1]. If shading or fat-sat loss persists, check shim, then B1, then the coils [G7 shading/FATSAT.pdf].
4. **OEM fix:**
   - **GE:** Reposition the coil and/or patient so the anatomy is in the center of the magnetic field, the center of the coil and the group of sections acquired. Put a pad or folded sheet between patient and coil. Landmark on the coil marker, not the anatomy; coils work most accurately at isocenter [G1]. For off-center fat-sat loss, keep the anatomy near isocenter, inside the uniform-shim volume [G7 shading/FATSAT.pdf].
5. **Fixable in field / replace / accept:** Fixable at the console by correcting positioning, padding, landmarking and centering [G1]. Hardware checks are needed only if the artifact persists once the setup is correct [G7 shading/FATSAT.pdf].
6. **Customer explanation:** "The scanner and coil give their most even picture when the body part is centered in both. Re-centering the patient, landmarking on the coil and adding a thin pad between the patient and the coil usually removes these dark or bright patches."

**Verdict:** Usage/protocol limit: confirmed when the artifact clears after re-landmarking, recentering and padding; if it persists, move to shim/B1/coil checks.
**Sources:** G1, G3, G7
**Field practice (unsourced):** None

---

### 5. GE: FOV and wrap (aliasing, No Phase Wrap)
**Category:** coil_use · **OEM:** GE
1. **Looks like:** Anatomy from outside the FOV folds into the opposite side of the image in the phase direction (wrap/aliasing). On sagittal spines it can show as a bright Star artifact or a smeared Annefact ribbon; in TwinSpeed Zoom mode it can show as a zipper [G1].
2. **Root causes:** A receiver coil larger than the FOV picks up tissue outside the FOV, which aliases into the image [G1]. Phase and frequency swapped on sagittal spine scans [G1]. In TwinSpeed Zoom mode, tissue excited by an anterior SAT pulse outside the FOV wraps in the phase direction [G1].
3. **How to confirm:** Compare the FOV with the active coil coverage: each CTL segment covers about 12 cm, so about 24 cm FOV for 2 segments, 36 cm for 3 and >42 cm for 4 [G2]. Check whether phase/frequency were swapped [G1]. The wrap should clear with a matched FOV or No Phase Wrap [G1].
4. **OEM fix:**
   - **GE:** Match the FOV to the coil size or number of elements selected, and consult the coil manual for FOV coverage [G1]. Use No Phase Wrap, which oversamples in the phase direction; it removes the aliased signal but does not improve SNR [G1]. Do not swap phase/frequency on sagittal spines; use coils matched to the FOV [G1]. For TwinSpeed Zoom wrap, use Whole mode or 2-coil CS12 [G1]. Note that an ASSET frequency-direction warning (EM_mrSrx_ASSET_FREQ_DIR_WARN) exists [G9].
5. **Fixable in field / replace / accept:** Fixable at the console with protocol changes; no hardware fault is involved [G1].
6. **Customer explanation:** "The coil is picking up signal from a wider area than the picture is set to show, so part of the body folds over onto the image. Matching the picture size to the coil, or turning on a setting that stops the fold-over, fixes this without any repair."

**Verdict:** Usage/protocol limit: confirmed when the wrap clears with a matched FOV or No Phase Wrap.
**Sources:** G1, G2, G9
**Field practice (unsourced):** None

---

### 6. Siemens: small, pediatric and veterinary patients (coil choice)
**Category:** coil_use · **OEM:** Siemens
1. **Looks like:** Grainy (low-SNR) or unevenly bright images of an infant, a child or a small animal scanned in a coil much larger than the body part.
2. **Root causes:** Coil too large or too far from the anatomy: Siemens states that small, high-density coils close to the body are needed for high SNR in pediatric imaging [S5]. Local variation in local-coil sensitivity causes brightness variation [S1]. Veterinary literature (non-OEM) notes signal falls with distance from the coil [N3].
3. **How to confirm:** Review the coil against the patient's size and the FOV [S1, S5]. The image should improve with a smaller coil placed closer to the anatomy; if it does not, run the coil checks in entry 7.
4. **OEM fix:**
   - **Siemens:** For pediatric patients, use small, high-density coils close to the body (Siemens names Coil Pediatric 16, Ultra-Flex and Special Purpose coils; availability depends on the system and configuration) [S5]. Whenever possible, use a local coil more suitable for the desired FOV, and use the normalization filter for brightness variation [S1]. For children, a two-stage scout may cover the whole spine, with no more than 210 mm table movement between stages [S3]. No Siemens document found on using human local coils on animals (gap logged); veterinary literature (non-OEM) describes human knee/extremity coils for the spine of small dogs and cats [N3].
5. **Fixable in field / replace / accept:** A usage limit: fix it with coil choice and protocol. Treat it as hardware only if the coil fails QA (entry 7).
6. **Customer explanation:** "The coil used is sized for an adult, so on a small patient much of it sits far from the body and picks up less signal, which makes the picture grainy. A smaller coil that fits closer usually gives a clearer image."

**Verdict:** Usage/protocol limit: confirmed when the image improves with a smaller, closer-fitting coil; a coil QA failure would mean a fault instead.
**Sources:** S1, S3, S5, N3
**Field practice (unsourced):** None

---

### 7. Siemens: coil element selection, AutoCoilSelect and iPAT coverage
**Category:** coil_use · **OEM:** Siemens
1. **Looks like:** Brightness that varies across the image, contrast asymmetry, or poor parallel-imaging (iPAT) results in spine scans; sometimes blinking coil icons on the table display [S1, S2, S3].
2. **Root causes:** Not enough coil elements covering the FoV including phase oversampling, especially with phase H>>F and iPAT [S3]. Local-coil sensitivity variation, or an inhomogeneous RF field [S1]. Coil malfunction or incomplete coil assembly [S2]. A fault on the system side (plug-dependent) or in the coil (plug-independent) [S6].
3. **How to confirm:** Check that the FoV, including phase oversampling, covers enough elements (e.g. iPAT factor 3 → at least 3 coil elements) [S3]. Look for blinking coil icons [S2]. Run TestTools RCCS/RFIS and QA/Coil Check on different coil plugs: a plug-dependent result points to the system, a plug-independent result points to the coil [S6]. For sporadic loss of elements, read out the PIN-diode settings at RCCS/RFIS with the fMOB test tool [S6].
4. **OEM fix:**
   - **Siemens:** Cover the FoV (with phase oversampling) with enough coil elements for the iPAT factor [S3]. Whenever possible, use a local coil more suitable for the desired FOV, and use the normalization filter for brightness variation [S1]. For contrast asymmetry, use a local coil with more suitable transmit characteristics [S1]. The syngo feature "AutoCoilSelect" exists [S4]; its behavior isn't documented in the AMT library. For a plug-independent fault, check the local coil or use another coil; for a plug-dependent fault, follow the RCCS/RFIS procedures [S6].
5. **Fixable in field / replace / accept:** Selection and coverage problems are fixed at the console [S1, S3]. A QA/Coil Check failure is a hardware fault: system-side if plug-dependent, coil if plug-independent [S6].
6. **Customer explanation:** "Uneven brightness here usually means the active part of the coil doesn't fully cover the area being scanned. Changing the coil selection or scan area normally fixes it; if our coil test fails, we'll track down the faulty part."

**Verdict:** Depends: QA/Coil Check decides. A pass means a selection/coverage (usage) problem; a fail means a real fault, system-side if plug-dependent and coil-side if plug-independent.
**Sources:** S1, S2, S3, S4, S6
**Field practice (unsourced):** None

---

### 8. Siemens: positioning and isocenter (edge distortion, signal loss at margins)
**Category:** coil_use · **OEM:** Siemens
1. **Looks like:** Pin-cushion or barrel-shaped distortion, signal loss at the image margins, or distorted slice edges at the margins ("potato chip" artifact) [S1].
2. **Root causes:** Spatial non-linearity of the gradient field and inhomogeneity of the static magnetic field, which grow with distance from isocenter [S1]. The region measured is not at the magnet isocenter (center position) [S1, S2].
3. **How to confirm:** Check that the region of interest was scanned at the center position (table position 0000 mm puts the slice in isocenter) [S2]. Use phantoms for control measurements [S1]. In service testing, "Signal too low" with a phantom means: reposition the phantom if it isn't centered, and reshim if field homogeneity is out of spec [S6].
4. **OEM fix:**
   - **Siemens:** Position the region to be examined as close to isocenter as possible; the center position is "a prerequisite for obtaining optimal image quality" [S1, S2]. Apply a distortion correction [S1]. Take slice distortion at the margins into account when planning, including graphic slice positioning [S1]. If a centered phantom still shows the problem, check homogeneity and reshim [S6]. No Siemens document found on padding (gap logged).
5. **Fixable in field / replace / accept:** Edge distortion away from isocenter is expected: accept it and correct by positioning and distortion correction [S1]. Service (reshim) is indicated only if a centered phantom fails [S6].
6. **Customer explanation:** "The magnet gives its most accurate picture at its exact center, and images naturally stretch or fade a little toward the edges. Placing the body part at the center and turning on distortion correction usually takes care of it; we check the magnet only if a centered test object also looks wrong."

**Verdict:** Usage/protocol limit (physics at the edge of the field): a centered phantom at isocenter decides it; if the phantom also fails, it's a real fault needing a reshim.
**Sources:** S1, S2, S6
**Field practice (unsourced):** None

---

### 9. Siemens: FOV and wrap-around (phase oversampling)
**Category:** coil_use · **OEM:** Siemens
1. **Looks like:** Anatomy from outside the FOV folds over onto the opposite side of the image, in most cases in the phase-encoding direction [S12].
2. **Root causes:** The FOV is smaller than the object. Tissue excited outside the coil's sensitive volume is misplaced during Fourier transformation (undersampling) [S12].
3. **How to confirm:** Compare the FOV with the object and the excited/coil volume in the phase direction [S12]. For spine iPAT with phase H>>F, check that the FoV including phase oversampling is covered by enough coil elements (e.g. iPAT 3 → at least 3 elements) [S3]. The wrap should clear with phase oversampling.
4. **OEM fix:**
   - **Siemens:** Use oversampling: doubling the sampling points (e.g. 512 instead of 256) avoids wrap-around. Readout oversampling is automatic; more phase-direction sampling points are recommended, though measurement time grows accordingly [S12]. Depending on the object, swapping the spatial encoding may help [S12]. With iPAT, keep the oversampled FoV covered by enough coil elements [S3].
5. **Fixable in field / replace / accept:** Fixable at the console with protocol changes; the trade-off is longer scan time with phase oversampling [S12].
6. **Customer explanation:** "Part of the body outside the picture area is folding over onto the image. A small scan-setting change stops the fold-over, at the cost of a slightly longer scan; nothing is broken."

**Verdict:** Usage/protocol limit: confirmed when the wrap clears with phase oversampling or an FOV that covers the object.
**Sources:** S12, S3
**Field practice (unsourced):** None

---

### 10. B0 inhomogeneity / poor shim → fat-sat failure, distortion, EPI wormholes
**Category:** magnet · **OEM:** GE + Siemens
1. **Looks like:** Patchy or failed fat saturation; shading on fat-sat images; geometric distortion, warped slices or "wormholes" on EPI; poor uniformity; GE autoshim messages (EM_mrSrx_SAT_REQUIRES_AUTOSHIM, EM_PSC_BAD_ASHIM) [G2, G9, S8]. Poor homogeneity commonly shows as non-uniform fat suppression, worse in EPI (AAPM, non-OEM) [N2].
2. **Root causes:** Poor magnet shim [G2, S8]; possible reasons named by Siemens are a magnet quench or magnetic materials in the bore [S8]. Changed gradient offset currents [S8]. Center frequency off (about 100 Hz) with fat sat [G2]. Anatomy too far from isocenter (shim uniform within about a 40 cm DSV), susceptibility, and eddy compensation [G7 shading/FATSAT.pdf, S8]. Autoshim off or not completed [G9].
3. **How to confirm:** Confirm autoshim ran and completed [G9]. Check the center frequency / water peak in Manual Prescan [G2]. Retest at isocenter [G7 shading/FATSAT.pdf]. GE order: shim first, then B1, then coils (substitute a coil; find a bad element with a saline bag) [G7 shading/FATSAT.pdf]. Siemens: Shim Check and Phantom Shim on a centered phantom; ECC/CTC Check to rule out eddy currents [S8]. In service testing, "Signal too low" with homogeneity out of spec means reshim [S6]. ACR geometric failures can come from B0 inhomogeneity, eddy compensation, gradient calibration or low bandwidth (non-OEM) [N1].
4. **OEM fix:**
   - **GE:** Turn on Autoshim for Chem SAT [G9]. Readjust the water peak in Manual Prescan [G2]. Use high-order shim for fat-sat failure; use a superconducting shim for poor magnet shim that causes EPI distortion/wormholes [G2]. Model procedures: Premier high-order shim calibration and HOS functional check [G5 t_CalibratingHighOrderShim.html, G5 t_DoingTheHighOrderShimHOSFunctionalCheck.html]; Artist Evo LVShim calibration and LVShim Auto [G6 t_CalibratingLVShim.html, G6 t_RunningLVShimAuto.html]; 450w shading goes to the B0 B1 Map Troubleshooting Guide [G4 c_Troubleshooting_ImageQualitySubsystem_Parent.html].
   - **Siemens:** Shim Check, Phantom Shim, reshim the magnet (Tune-up Shim/Phantom Shim) [S8, S6]. For uncompensated eddy currents, ECC Check/adjustment and CTC Check/adjustment [S8]. For margin distortion, use distortion correction and position near isocenter [S1].
   - *Note:* S8 is a Symphony-era Siemens chart (principles only); use the current platform's tune-up procedures.
5. **Fixable in field / replace / accept:** Usually fixable in the field with prescan/autoshim, shim calibration or reshim [G2, G9, S8]. A superconducting shim is an OEM-level procedure [G2]. Accept off-center/large-FOV fall-off when a centered phantom passes [G7 shading/FATSAT.pdf].
6. **Customer explanation:** "Fat suppression and sharp geometry depend on the magnet's field being very even. We'll test it with a centered test object; if the field has drifted out of shape we re-tune it, and if the test passes the fix is in the scan setup."

**Verdict:** Depends: a real fault if Shim Check / phantom shim (or GE shim checks) fails on a centered phantom; a usage/protocol limit if only off-center or large-FOV anatomy is affected, or autoshim/prescan was skipped.
**Sources:** G2, G4, G5, G6, G7, G9, S1, S6, S8, N1, N2
**Field practice (unsourced):** None

---

### 11. Ferromagnetic debris in the bore / metal on the patient (susceptibility voids)
**Category:** site · **OEM:** GE + Siemens
1. **Looks like:** Local signal voids, black lines, signal drop-out, shading or local geometric distortion near one spot [G1, G3, G7 distortion/geom_dist_theory.htm]. If magnetic material sits in the bore, fat saturation can also fail [S8].
2. **Root causes:** Ferromagnetic material on or in the patient [G1, S12]. Metal causing local B0 disturbance (abnormal shading) [G7 shading/shading_theory.htm]. Magnetic materials in the magnet bore [S8]. Differential: intensity variation can also mean a failed coil element [G1]. Global (not local) distortion points instead to gradient failure/miscalibration [G7 distortion/geom_dist_theory.htm].
3. **How to confirm:** Check with the patient that nothing on or in them is causing the artifact [G1]. For black line/void artifacts, check for metal [G3]. Localized distortion points to the patient or foreign objects [G7 distortion/geom_dist_theory.htm]. Siemens: if fat sat or shim is affected, run Shim Check / Phantom Shim [S8].
4. **OEM fix:**
   - **GE:** Remove the metal source (patient or bore) and rescan; if the artifact persists without metal, check coil elements (entry 17) [G1, G3].
   - **Siemens:** Remove magnetic materials from the bore; if shim or fat sat stays degraded, run Shim Check, Phantom Shim and reshim [S8].
5. **Fixable in field / replace / accept:** A site/patient condition: remove the object. Reshim only if homogeneity stays out after removal [S8].
6. **Customer explanation:** "A small piece of metal, either on the patient or left inside the scanner opening, bends the magnetic field and leaves a dark or distorted spot. Once it's removed the images should return to normal; the scanner itself isn't damaged."

**Verdict:** Usage/site condition (not a system fault): the artifact follows the patient/object, and a phantom scan in an empty, debris-free bore is clean.
**Sources:** G1, G3, G7, S8, S12
**Field practice (unsourced):** Typical culprits are hairpins, clips, coins or tools in the bore and metal fasteners on the patient; inspect the bore and table visually before scanning a phantom.

---

### 12. B0 / center-frequency drift (including after ramp, re-shim or quench)
**Category:** magnet · **OEM:** GE + Siemens
1. **Looks like:** The center frequency moves from week to week or from day to day. Once it is off by roughly 100 Hz, fat-sat images show shading [G2]. On Siemens tune-up, the frequency adjustment can report "Frequency out of range" [S6]. After a quench, shim and fat saturation can degrade [S8].
2. **Root causes:** B0 changes from superconductor run-down (typically under 1 ppm/day), thermal or mechanical effects, shim-coil changes or external ferromagnetic material (ACR, non-OEM) [N1]. A GE "low-level drifting magnet" shows a steady frequency drop of 2–5 Hz/day [G3 c_LVShim-for-Sites-with-Low-Level-Drifting-Magnets_314447.html]. Drift is higher at acceptance and settles over weeks to months; re-shimming with superconducting shim coils temporarily raises it again (AAPM, non-OEM) [N2]. Magnet quench [S8].
3. **How to confirm:**
   - **GE:** Run the B0 Drift functional check with the B0 Drift tool after a 2-hour scan-free cool-down [G3 t_B0-Drift-Functional-Check_15415421.html; also G4 t_UsingTheB0DriftTool.html, G5 t_CheckingB0Drift.html, G6 t_B0-Drift-Functional-Check_14563399.html]. Check whether fat-sat shading clears after Manual Prescan readjusts the water peak [G2].
   - **Siemens:** Check the frequency from the shim result against the upper limit (Avanto/Espree 63.7 MHz, tolerance +0/−5 kHz) [S6]. After a quench, run Shim Check / Phantom Shim [S8].
   - **Both:** Trend the weekly center frequency; an example action limit is 2 ppm/week (128 Hz at 1.5T, 256 Hz at 3T) (ACR, non-OEM) [N1].
4. **OEM fix:**
   - **GE:** Readjust the water peak in Manual Prescan for frequency-related fat-sat shading [G2]. For a low-level drifting magnet, shim to spec and set the Z2 harmonic positive (target +40 Hz ±5 Hz) to lengthen the time between re-shims [G3 c_LVShim-for-Sites-with-Low-Level-Drifting-Magnets_314447.html].
   - **Siemens:** For "Frequency out of range", adjust (ramp up) the magnet current using Jnew = Jactual × (fupper limit / factual) [S6]. After a quench-related shim loss: Shim Check, Phantom Shim, reshim [S8]. On Espree only, run the superconducting shim Z-2 procedure after a ramp without the Array Shim Device [S10].
5. **Fixable in field / replace / accept:** Accept normal drift that is within spec and settling after a ramp or re-shim [N2]. Fix in the field with prescan, re-shim/LVShim or a magnet current adjustment when the frequency leaves range or the drift check fails [G2, G3, S6]. Magnet ramping is a trained, OEM-procedure task [S6].
6. **Customer explanation:** "A superconducting magnet's strength changes very slightly over time, and more so for a while after it has been ramped or re-tuned. We track that and re-tune when it moves outside its normal range, which keeps fat-suppressed images even."

**Verdict:** Depends: accept if the drift rate is in spec and settling after a recent ramp/re-shim; a real fault if the B0 Drift functional check fails or the frequency leaves the allowed range.
**Sources:** G2, G3, G4, G5, G6, S6, S8, S10, N1, N2
**Field practice (unsourced):** None

---

### 13. Cold head / cryocooler / compressor and other mechanical vibration → cyclic phase ghosting
**Category:** magnet · **OEM:** GE + Siemens
1. **Looks like:** Cyclical ghosting in the phase direction, including EPI ghosts, with high phase instability on GE SPT/HSS stability scans [G2, G7 shading/StabilityRules.pdf].
2. **Root causes:** Vibration from the cold head, fans, air handlers or other rotating machinery; bridge vibration [G2]. Magnetic instability sources: gradient, shim supplies, shield coolers, thermal acoustic oscillation, vibration [G7 ghost/ghosting_theory.pdf]. Vibration artifacts can appear well after installation, e.g. from an unbalanced ventilation fan (AAPM, non-OEM) [N2].
3. **How to confirm:**
   - **GE:** Don't troubleshoot from clinical images; use SPT [G7 ghost/ghosting_theory.pdf]. By the SPT rules, high FSE phase instability means a magnetic/vibration problem: turn off the cold head / air conditioners and use HSS [G7 shading/StabilityRules.pdf, G3 c_EPI-Ghosting-Checks_4552975.html]. If the ghost drops with the cold head off, the cold head is implicated [G2]. Compressor pressure check procedures are in G4 and G5.
   - **Siemens:** No Siemens document found linking the cold head/compressor to image artifacts (gap logged). Check the event log for refrigerator or water-cooling errors [S10].
   - **Both:** If phase ghosting persists after vendor recalibration or part replacement, repeat the vibration analysis (AAPM, non-OEM) [N2].
4. **OEM fix:**
   - **GE:** Remove or isolate the vibration source; tighten bridge bolts for bridge vibration [G2]. Cold head replacement and compressor pressure check procedures exist for Premier/Artist Evo/450w [G5 t_ReplacingTheColdhead.html, G6 t_ReplacingTheColdhead.html, G4, G5].
   - **Siemens:** The cold head must be replaced at the latest every 24 months unless daily remote monitoring allows condition-based exchange; special training is required [S11]. For abnormal cold head noise (contaminated helium gas), contact MR Magnet Technology HSC [S10].
5. **Fixable in field / replace / accept:** Real fault or site issue. Mechanical fixes (bolts, isolating machinery) can be done in the field [G2]; cold head work needs OEM-trained staff [S11, G5, G6].
6. **Customer explanation:** "Some ghosting comes from vibration, either from the magnet's own cooling pump or from nearby equipment such as fans or air handlers. We run stability tests with each source switched off to find which one it is, then fix or isolate it."

**Verdict:** Depends: a real fault (cryo/mechanical) if GE SPT/HSS phase instability drops with the cold head off; a site issue if external machinery is the source.
**Sources:** G2, G3, G4, G5, G6, G7, S10, S11, N2, A1
**Field practice (unsourced):** High shield temperature points to the compressor (AMT field note, non-OEM [A1]); on Siemens, apply the same on/off isolation logic, since no Siemens procedure was found.

---

### 14. RF interference / zipper / RF leak (door, penetration panel, in-room devices)
**Category:** site · **OEM:** GE + Siemens
1. **Looks like:** A zipper: a single-frequency dashed or dotted line perpendicular to the frequency axis [G7 zippers/zippers_theory.pdf]. Also streaks and bright spots (stripe artifacts) [S1], hot pixel clusters [G3 t_System-Level-Correlated-Noise-Check_3324646.html], or criss-cross zipper lines on PROPELLER with the scan room door open [G2]. A phantom may not show it, because the patient acts as an antenna [G7 zippers/zipper_flowchart.pdf].
2. **Root causes:** RF shield breakdown, usually at doors/hatchways [G7 zippers/zippers_theory.pdf], e.g. floor wax at the door base [G7 zippers/rf_leak.htm]. Door-frame contact springs with residue [S1]. Poor screen-room integrity or grounding [G3 t_System-Level-Correlated-Noise-Check_3324646.html]. Shielding broken by construction changes such as holes drilled for cables [S12]; nails or screws shorting the shield (AAPM, non-OEM) [N2]. In-room devices: patient monitoring, gating, fans, music [G7 zippers/zipper_flowchart.pdf, S1]; a monitor needing filters [G7 zippers/invivo_rf_noise.htm]. A broadband spectroscopy amp, or crosstalk from another MR [G2]. On Siemens, streaks/dots from RF noise during rapid gradient switching mean the room is not RF-tight [S8].
3. **How to confirm:**
   - **GE:** Swap phase/frequency; use a radio test (caution at 3T) or an RF sniffer; switch off fans, patient monitoring, gating and music; use a 50-ohm termination [G7 zippers/zipper_flowchart.pdf]. Terminate the receive chain to rule out the transceiver [G7 zippers/zippers_theory.pdf]. Run the Coherent Noise test (SPT on DV26 and earlier; Normal/Extended mode on DV27+) [G4 t_DoingTheCoherentNoiseTest.html]. This test uses the head coil outside the rear of the bore with no-RF scans; extra hits only at R1=7 may suggest an internal system noise issue [G5 c_Coherent-Noise-Theory_13414873.html]. Run the System-Level Correlated Noise Check [G3 t_System-Level-Correlated-Noise-Check_3324646.html]. Check the RF screen room door [G4].
   - **Siemens:** Confirm the door is properly closed and the contact springs are clean [S1, S12]. Vary the bandwidth [S1]. Check RF-room shielding, filter plate and RF filters [S8].
   - **Both (AAPM, non-OEM) [N2]:** A battery FM radio should get no reception with the door closed (keep it away from the bore). Take a baseline SNR with peripheral equipment off, then switch each item on. A post-install shield test typically reads lower than the original (e.g. 100 dB → about 85 dB).
4. **OEM fix:**
   - **GE:** Clean the door base [G7 zippers/rf_leak.htm]. Repair shield breaches at doors/hatchways or the penetration panel; rooms are specified at about 100 dB attenuation before the panel and about 60–80 dB after [G7 zippers/zippers_theory.pdf]. Add filters to the patient monitor [G7 zippers/invivo_rf_noise.htm]. For another MR's crosstalk, fix the room shield or separate the frequencies [G2]. Correct screen-room integrity or grounding problems [G3 t_System-Level-Correlated-Noise-Check_3324646.html].
   - **Siemens:** Use only accessories tested and approved for the system; keep the door closed; vary the sequence bandwidth; use local coils when possible; keep the door contact springs free of cleaning agents, oil, grease and paint [S1]. Check and repair RF-room shielding, filter plate and RF filters [S8]. After construction changes, locate the new interference source carefully [S12].
5. **Fixable in field / replace / accept:** Often fixable in the field: clean door contacts, remove or filter devices, fix the door seal [G7 zippers/rf_leak.htm, S1]. Hidden shield damage may need the shielding vendor.
6. **Customer explanation:** "The thin lines come from outside radio signals getting into the scan room, often through the door seal or from a device in the room. We track down where the signal is coming from and seal or remove it; this is usually a room or accessory issue rather than the scanner itself."

**Verdict:** Real fault (room/site or a third-party device, usually not the MR system): the coherent/correlated noise tests plus receive-chain termination separate site interference from a transceiver problem.
**Sources:** G2, G3, G4, G5, G7, S1, S8, S12, N2
**Field practice (unsourced):** Shield damage inside walls or at the penetration panel usually needs the RF shielding vendor to test and repair it.

---

### 15. Hardware ghosting not caused by motion (RF/gradient instability)
**Category:** rf_coil · **OEM:** GE + Siemens
1. **Looks like:** Ghosts across the entire anatomy, not only the moving part [G2]; ghosting in the phase direction, either independent of or dependent on slice orientation [S6, S8]; ghosts on a stationary phantom (ACR, non-OEM) [N1].
2. **Root causes:** GE documented cases: a bad RF amplifier (SPT stability failed), an APM board plus body directional coupler, X/Y/Z gradient amplifier faults [G2]. Instability types: magnetic, RF transmit, RF receive [G7 ghost/ghosting_theory.pdf]. Siemens: RF modulation/receive instability [S6]; defective (nonlinear) GPA current sensors [S7]; a broken LC-TX cable in the table energy chain, giving ghosting with local transmit coils [S6].
3. **How to confirm:** Rule out phantom motion first (ACR, non-OEM) [N1].
   - **GE:** Don't troubleshoot from clinical images; use SST/SPT [G7 ghost/ghosting_theory.pdf]. Follow the Ghosting Stability Flowchart: SPT, Gradient Stability, RF Stability, Vibration Test [G2, G7 ghost/ghosting_flowchart_rev2.pdf]. SPT patterns: FSE high phase = magnetic/vibration; FGRE = moving metal/EMI; phase+magnitude = RF transmit; magnitude only = RF receive [G7 shading/StabilityRules.pdf].
   - **Siemens:** Orientation-independent phase ghosting → TestTools RF MOD/REC and the stability evaluation [S6]. Orientation-dependent ghosting → gradient system (Stability Check/CalcAr) [S8]. Run calcar and calcar_lemshift on a 240 mm spherical phantom to find nonlinear GPA current sensors [S7]. With local TX coils, check for a broken LC-TX cable [S6].
4. **OEM fix:**
   - **GE:** Repair the subsystem the stability flowchart isolates (the RF amplifier, APM board/directional coupler and gradient amplifier cases are documented) [G2].
   - **Siemens:** Swap gradient cables at the GPA to localize orientation-dependent disturbances [S8]. Replace the faulty current sensor or LC-TX cable as the TSG procedures direct [S6, S7]. After work on current sensors, gradient filters, the gradient coil or gradient cables, run the Image Orientation Check [S7].
5. **Fixable in field / replace / accept:** A real hardware fault. It's fixed by repairing or replacing the component the tests isolate [G2, S6, S7]; use part numbers from the specific system's parts documentation only.
6. **Customer explanation:** "These ghosts aren't caused by patient movement; they come from a part of the scanner that isn't holding steady. We run stability tests on a still test object to find which part is responsible, then repair it."

**Verdict:** Real fault: confirmed when patient/phantom motion is ruled out and the stability tests fail (GE SPT/stability flowchart; Siemens RF MOD/REC, orientation dependence and calcar).
**Sources:** G2, G7, S6, S7, S8, N1
**Field practice (unsourced):** None

---

### 16. Spikes / white pixels / herringbone / corduroy (arcing, loose hardware)
**Category:** gradient · **OEM:** GE + Siemens
1. **Looks like:** Scattered bright "white pixels" or a striped herringbone/corduroy pattern across the image, especially on EPI and ultrafast scans; low SNR [G2, G7 cord/excite_epi_wp_theory/what_is_white_pixel.htm, S8, N2].
2. **Root causes:** Transient broadband spikes from electrical discharge/arcing, or static in low humidity; a common source is loose metallic (even non-magnetic) hardware moving with vibration [G7 cord/excite_epi_wp_theory/what_is_white_pixel.htm]. Loose gradient coil bolts or gradient cables, e.g. a loose X gradient drive cable at the penetration panel [G2]. Gradient cables routed wrongly at the back of the table [G7 noise/goal_posts/spike_noise_cables_are_routed.htm]. Coil preamp oscillation in 8+ channel coils [G7 cord/coil_preamp/8_channel_coil_preamp_oscillatio.htm]. On Siemens: a loose RF amplifier output cable / PA tube clamp arcing [S9], or mechanical vibration during gradient switching [S8]. Gradient vibration loosens gradient, RF and other connections over time (AAPM, non-OEM) [N2].
3. **How to confirm:**
   - **GE:** EPI white pixel test [G2], with TDM disabled [G3 c_EPI-Ghosting-Checks_4552975.html]. Scope-based Spike Noise Check with an empty bore [G3 t_Spike-Noise-Check_4847111.html, G4 t_CheckingForSpikeNoise.html]. The Spike Noise Triangulator tool (training required) [G3 c_Spike-Noise-Triangulator-Tool_14717315.html]. If white pixel/corduroy appears only on the first series with an 8+ channel coil, suspect preamp oscillation [G7 cord/coil_preamp/8_channel_coil_preamp_oscillatio.htm].
   - **Siemens:** QA>Spike Check [S7, S9, S8].
4. **OEM fix:**
   - **GE:** Tighten loose gradient coil bolts and gradient cables, including drive cables at the penetration panel [G2]. Route gradient cables on TOP of the bar at the back of the table [G7 noise/goal_posts/spike_noise_cables_are_routed.htm]. Replace the coil for preamp oscillation [G7 cord/coil_preamp/8_channel_coil_preamp_oscillatio.htm].
   - **Siemens:** After gradient work, run QA>Spike Check at least three times; if spikes are found, check the gradient connections again [S7]. The follow-on Spike Troubleshooting document is not in the AMT library (gap logged). Fix loose RF amp output cable / PA tube clamp arcing [S9]. For vibration-related spikes: Graddelay, ECC Check, Spike Check [S8]. For low S/N, eliminate possible spike sources [S6].
5. **Fixable in field / replace / accept:** A real fault that's usually fixable in the field by tightening or re-dressing connections [G2, S7]. Replace the coil only if the artifact follows a coil with preamp oscillation [G7 cord/coil_preamp/8_channel_coil_preamp_oscillatio.htm].
6. **Customer explanation:** "The white specks or stripes come from tiny electrical sparks, usually from a connection that has worked loose from the scanner's vibration. We find it with a spike test, tighten or re-route it, and retest."

**Verdict:** Real fault: confirmed by the empty-bore spike noise check (GE) or QA>Spike Check (Siemens); a first-series-only pattern on an 8+ channel coil points to the coil preamp instead.
**Sources:** G2, G3, G4, G7, S6, S7, S8, S9, N2
**Field practice (unsourced):** Check cable routing and connection torque during scheduled PM.

---

### 17. Receive coil element failure / dead channel / low SNR from one coil
**Category:** rf_coil · **OEM:** GE + Siemens
1. **Looks like:** A dark or low-signal region, or intensity variation, tied to one part of a coil; low SNR with one coil; on Siemens, sometimes a blinking coil icon [G1, S2, S6].
2. **Root causes:** A failed coil element [G1]; decoupling malfunction [G1]; coil detuning, preamp faults or loss of quadrature [G7 low_snr/lowsnr_theory.htm]; a poor connection at the quick disconnect [G2]; PIN-diode failure (1.5T CTL, LX platform) [G8]; a system-side receive fault when the problem depends on the plug [S6]. Caution: system SNR problems are often first noticed on C-spine/lumbar axials, so don't prematurely blame one coil [G7 low_snr/lowsnr_theory.htm].
3. **How to confirm:**
   - **GE:** Check each element with manual prescan [G1]. Then work through: cable continuity, no loops, no metal, coil positioning, center frequency, R1/R2/TG, coil QA (MCQA), a substitute-coil scan, then another coil of the same type [G3 r_ts_HD-8-Channel-CTL-Coil-Troubleshooting_3241217.html]. SRI Coil ID test [G3 r_ts_1-5-HD-8Ch-CTL-Coil-Troubleshooting-Tips_572636.html]. Saline-bag element check [G7 shading/FATSAT.pdf]. Model coil SNR tests, e.g. [G6 r_ts_1-5T-GP-Flex-Coil-SNR-Test-and-Troubleshooting_4301109.html].
   - **Siemens:** QA/Coil Check; try another local coil (same type if available); Coil Check on different plugs to split coil from system; fMOB PIN-diode readout for sporadic element loss [S6].
   - **Both:** The ACR annual test measures SNR per element (non-OEM) [N1]. AMT field note: phantom scans per CTL section comparing receivers in manual prescan (non-OEM) [A1].
4. **OEM fix:**
   - **GE:** Reseat the quick disconnect for connection voids [G2]. If an element is faulty, stop using the coil and call service [G1]. Replace the coil for a bad array [G2]; on the 1.5T CTL (LX), PIN diodes are not field replaceable, so the coil is replaced [G8].
   - **Siemens:** Plug-independent fault: check the local coil / use another coil. Plug-dependent fault: follow the RCCS/RFIS procedures [S6]. After maintenance, run Quality Assurance; if out of tolerance, Tune-Up or troubleshoot and repeat QA [S11].
5. **Fixable in field / replace / accept:** Reseating connections is a field fix [G2]. An element failure that follows the coil means coil replacement; no field element repair is documented in these sources [G1, G8, S6].
6. **Customer explanation:** "Part of the receiving coil may not be picking up signal, which leaves a darker patch in that area. We test each section of the coil on a test object; if the problem stays with the coil, it gets replaced, and if not, we look at the scanner side instead."

**Verdict:** Real fault: confirmed when per-element SNR/coil QA fails on a phantom and the failure follows the coil rather than the port.
**Sources:** G1, G2, G3, G6, G7, G8, S2, S6, S11, N1, A1
**Field practice (unsourced):** None

---

### 18. Coil cable / connector / Coil ID faults
**Category:** rf_coil · **OEM:** GE + Siemens
1. **Looks like:** A signal void that looks like a dead channel; intermittent poor-quality images; coil ID/connector mismatch messages (GE); blinking coil icons (Siemens); ghosting or measurement aborts with local transmit coils (Siemens) [G2, G1, G9, S2, S6].
2. **Root causes:** A poor connection at the quick disconnect [G2, G7 shading/shading_quick_disconnect_large.htm]. Cable continuity faults; cable loops [G3 r_ts_HD-8-Channel-CTL-Coil-Troubleshooting_3241217.html, G1]. Coil ID problems [G3 r_ts_1-5-HD-8Ch-CTL-Coil-Troubleshooting-Tips_572636.html, G9]. Damaged pins or conducting particles in the coil plug [S6]. A broken LC-TX cable in the table energy chain, which is under mechanical stress [S6]. Incomplete coil assembly [S2].
3. **How to confirm:**
   - **GE:** Reseat the quick disconnect and rescan [G2]. Output cable continuity check (by a GE-authorized engineer); check for cable loops [G3 r_ts_HD-8-Channel-CTL-Coil-Troubleshooting_3241217.html]. SRI Coil ID test [G3 r_ts_1-5-HD-8Ch-CTL-Coil-Troubleshooting-Tips_572636.html]. Note which of EM_mrSrx_COIL_ID_MISMATCH, EM_mrSrx_COIL_MISMATCH_WARN or EM_mrSrx_CALIB_SCAN_COIL_CONNECTOR_MISMATCH_OPR appears [G9]. 1.5T CTL cable check [G8].
   - **Siemens:** Test the coil plug with the Service Plug. Check connectors for damaged pins or conducting particles. Try to reproduce the error by plugging the coil into the same and other plug assemblies and gently jiggling the plug. Run RCCS/RFIS tests per plug. Run the LC-TX cable check [S6].
4. **OEM fix:**
   - **GE:** Reseat the quick disconnect [G2]. Don't loop or cross cables; inspect coils for damage and wear; don't use a coil with tuning problems or intermittent poor images [G1]. Escalate to coil replacement if the cable/ID tests fail inside the coil [G3, G8].
   - **Siemens:** Clear damaged pins or particles, or replace the coil plug assembly per the referenced RF coil plug procedure. Replace a broken LC-TX cable [S6]. Complete the coil assembly if the icons blink [S2].
5. **Fixable in field / replace / accept:** A real fault. It's fixable in the field if reseating, cleaning or a table-side cable/plug repair resolves it [G2, S6]. If the fault is inside the coil, replace the coil [G1, G3].
6. **Customer explanation:** "A loose or damaged connection between the coil and the scanner can make part of the image drop out or come and go. We reseat and test the connection first; if the fault is inside the coil itself, the coil needs repair or replacement."

**Verdict:** Real fault: the reseat / plug-swap / continuity tests show whether it's a connector (field fix), the table-side cabling, or the coil.
**Sources:** G1, G2, G3, G7, G8, G9, S2, S6
**Field practice (unsourced):** None

---

### 19. Eddy currents (EPI/DWI ghosting and distortion, fat-sat and slice-profile problems)
**Category:** gradient · **OEM:** GE + Siemens
1. **Looks like:** EPI/DWI ghosting (including N/2 ghosts) and geometric distortion; uneven fat saturation; broadened slice profiles; non-uniform phantom images [G2, G3 c_EPI-Ghosting-Checks_4552975.html, G7 distortion/dist_uncomp_eddy_large.htm, S8].
2. **Root causes:** Uncompensated eddy currents, including missing short-term compensation and cross terms [G2, G7 distortion/dist_uncomp_eddy_large.htm, S8]. A shorted RF shield in the GE gradient coil (BRM), which causes B0 dither offsets [G2]. A very narrow receive bandwidth (a 16 kHz case) [G2]. On Siemens, N/2 EPI ghosts may also come from unstable or low line voltage (down to −10%) [S8]. Poor eddy compensation is a common cause of artifacts in fast imaging and spectroscopy (AAPM, non-OEM) [N2].
3. **How to confirm:**
   - **GE:** Run the EPI ghosting checks: white pixel check, swap phase/frequency, Grafidy short/long/very long plus cross terms, SPT Coherent Noise, HSS [G3 c_EPI-Ghosting-Checks_4552975.html]; EPT isn't required on SW 30+ [G3 r_ts_Troubleshooting-EPI-Ghosting-Problems_4558041.html]. EPI ghosting checklist [G7 ghost/EPI_Ghosting_Service_Info.pdf]. Premier eddy current check [G5 t_DoingTheEddyCurrentCheck.html].
   - **Siemens:** ECC Check; CTC Check [S8]. For N/2 ghosts, record line voltage with a recorder and look for a correlation [S8].
   - **Both:** ACR geometric failures can come from poor ECC (non-OEM) [N1].
4. **OEM fix:**
   - **GE:** Run Grafidy for short-term eddy compensation and Grafidy3 for cross terms [G2, G7 distortion/dist_uncomp_eddy_large.htm]. HOEC and Grafidy-3 calibrations [G3]. Premier: eddy current compensation and HOEC calibration [G5 t_RunningEddyCurrentCompensation.html, G5 t_CalibratingHighOrderEddyCurrentHOEC.html]. Artist Evo: eddy current comp tools and HOEC [G6 t_WorkingWithEddyCurrentCompTools.html, G6 t_CalibratingHighOrderEddyCurrentHOEC.html]. Replace the BRM/shield for a shorted RF shield [G2]. Use 125 kHz instead of the narrow 16 kHz bandwidth [G2].
   - **Siemens:** ECC Check/adjustment and CTC Check/adjustment [S8]. For line-voltage N/2 ghosts, the ultimate remedy is a UPS [S8]. (S8 is a Symphony-era chart; principles only.)
5. **Fixable in field / replace / accept:** Usually fixable in the field by calibration (Grafidy/HOEC/ECC/CTC) [G2, G3, S8]. The BRM/shield case is a major hardware repair [G2]. A narrow-bandwidth case is a protocol fix [G2]. Keep the ECC settings report for future comparison (AAPM, non-OEM) [N2].
6. **Customer explanation:** "Fast scans like diffusion are very sensitive to tiny leftover electrical currents in the scanner's metal structure, which can cause ghosts or stretching. We measure and re-tune the scanner's correction for those currents, and check the scan settings and building power if needed."

**Verdict:** Depends: a real fault/calibration issue if the ECC/Grafidy checks fail (or the BRM RF shield is shorted); a protocol limit if the artifact appears only at an extreme narrow-bandwidth setting.
**Sources:** G2, G3, G5, G6, G7, S8, N1, N2
**Field practice (unsourced):** None

---

### 20. Gradient coil / bore mechanical looseness (DWI wormholes, vibration artifacts)
**Category:** gradient · **OEM:** GE + Siemens
1. **Looks like:** "Wormholes" on DWI, EPI artifacts or a corduroy pattern [G2]; low SNR and/or spikes during gradient switching [S8]. The GE wormhole case could not be reproduced on a phantom [G2].
2. **Root causes:** Loose BRM (gradient coil) upper radial supports; bridge vibration; loose gradient coil bolts [G2]. Mechanical vibration during gradient switching [S8]. Gradient pulsing gradually loosens gradient, RF and other connections (AAPM, non-OEM) [N2].
3. **How to confirm:**
   - **GE:** Match the symptom to the documented cases (DWI wormholes → radial supports; EPI artifacts → bridge bolts; corduroy → gradient coil bolts). A clean phantom does not rule out the radial-support case [G2].
   - **Siemens:** Graddelay, ECC Check, Spike Check [S8]. No Siemens document specific to gradient-coil support looseness was found.
4. **OEM fix:**
   - **GE:** Tighten the BRM upper radial supports, the bridge bolts or the gradient coil bolts, according to the case [G2].
   - **Siemens:** Run Graddelay / ECC Check / Spike Check and correct what they find [S8]; for spikes after gradient work, recheck the gradient connections (entry 16).
5. **Fixable in field / replace / accept:** A real mechanical fault, fixable in the field by tightening per the OEM procedure [G2]. Scheduled vendor maintenance helps prevent it (AAPM, non-OEM) [N2].
6. **Customer explanation:** "The scanner's strong vibrations during fast scans can slowly loosen internal mounting hardware, which shows up as odd holes or stripes in some images. Tightening those mounts usually cures it, and we retest on patient-type scans because a test object doesn't always show this problem."

**Verdict:** Real fault (mechanical): decided by matching the documented symptom and confirming the artifact clears after tightening; a passing phantom does not exclude it.
**Sources:** G2, S8, N2
**Field practice (unsourced):** Inspect gradient coil supports, bridge and mounting hardware for looseness, and retest with DWI/EPI sequences after tightening.

---

### 21. Gradient non-linearity / edge distortion at large FOV (normal)
**Category:** gradient · **OEM:** GE + Siemens
1. **Looks like:** Pin-cushion, barrel or hourglass-shaped distortion and signal loss toward the image edges; distorted slice edges at the margins ("potato chip"); anatomy stretched or compressed near the edge of a large FOV [G7 distortion/dist_gradwarp_large.htm, S1, S12]. Signals from far outside isocenter can also produce Star/Annefact artifacts [G1].
2. **Root causes:** Gradient non-linearity from the gradient coil design, plus static-field inhomogeneity at the margins [S1, S8, S12]. The gradients are non-linear far from isocenter [G1]. Global (not edge-only) distortion is a different problem: most often gradient failure/miscalibration [G7 distortion/geom_dist_theory.htm]. Siemens can also show distortion from misadjusted gradient sensitivity [S8].
3. **How to confirm:** Use phantoms for control measurements [S1]. Distortion confined to the edges or large offsets, with good geometry near isocenter, is expected [S1, G7 distortion/dist_gradwarp_large.htm]. Distortion across the whole image points to gradient failure/miscalibration [G7 distortion/geom_dist_theory.htm].
4. **OEM fix:**
   - **GE:** An hourglass-shaped edge from gradwarp is normal; no service action [G7 distortion/dist_gradwarp_large.htm]. Investigate the gradients only for global distortion [G7 distortion/geom_dist_theory.htm].
   - **Siemens:** Apply a distortion correction; position the region close to isocenter [S1]. A large-FOV filter is available [S12]. Take localization errors and margin slice distortion into account when planning interventions/biopsies [S1]. Warped slices from gradient coil design: "No improvement" possible. Misadjusted gradient sensitivity: Gradsens [S8].
5. **Fixable in field / replace / accept:** Accept edge distortion as a design limit and manage it with distortion correction and centering [S1, G7 distortion/dist_gradwarp_large.htm]. Only failed geometry near isocenter / global distortion is a service (calibration) issue [G7 distortion/geom_dist_theory.htm, S8].
6. **Customer explanation:** "Every MRI is most geometrically accurate at the center of the magnet, and the edges of a very wide image naturally bend a little. Software correction and centering the body part handle this; it isn't a fault unless the center of the image is also distorted."

**Verdict:** Accept (design limit): decided by a phantom check; good geometry near isocenter with edge-only distortion is normal, while global or central distortion is a real fault (gradient calibration).
**Sources:** G1, G7, S1, S8, S12
**Field practice (unsourced):** None

---

### 22. RF transmit / B1 problems (amp clipping, coupler, shading; transmit vs receive)
**Category:** rf_coil · **OEM:** GE + Siemens
1. **Looks like:** Abnormal shading or asymmetric contrast; slice wrap; phase-direction ghosting independent of orientation; broadened slice profiles; RF noise/spikes [G2, G7 shading/shading_theory.htm, S1, S6, S9].
2. **Root causes:** GE documented cases: body RF amplifier clipping; a bad RF amplifier (SPT stability failed); an APM board plus body directional coupler causing slice wrap [G2]. RF (B1) inhomogeneity [G7 shading/shading_theory.htm, S1]. Siemens RF chain linearity/modulator or stability problems [S6]. A loose RF amplifier output cable / PA tube clamp arcing [S9].
3. **How to confirm:**
   - **GE:** SPT stability. Phase+magnitude instability means RF transmit; magnitude only means RF receive [G7 shading/StabilityRules.pdf, G2]. For shading on the 450w, use the B0 B1 Map Troubleshooting Guide [G4 c_Troubleshooting_ImageQualitySubsystem_Parent.html].
   - **Siemens:** For slice profile broadening, run the TestTools RF tests, check the linearity evaluation, and check the modulator [S6]. For orientation-independent phase ghosting, run the RF tests MOD/REC and check stability [S6]. For RF noise/spikes, check the RF amp output cable and PA tube clamp for arcing [S9].
4. **OEM fix:**
   - **GE:** Repair the RF amplifier, APM board or directional coupler that the tests isolate (documented cases) [G2].
   - **Siemens:** Correct the RF-chain fault the TestTools isolate [S6]. Secure the loose RF amp output cable / PA clamp [S9]. For RF-field inhomogeneity with good test results, use a local coil with transmit characteristics more suitable for the FOV [S1].
5. **Fixable in field / replace / accept:** A real fault if the RF stability/linearity tests fail; the repair depends on the part isolated [G2, S6, S9]. If the tests pass and the shading follows the anatomy or coil choice, it's a usage/physics limit handled by coil choice [S1].
6. **Customer explanation:** "The scanner sends out radio waves to create the image, and if that signal is uneven or unstable, parts of the picture can look shaded or ghosted. Our transmitter tests show whether a part needs repair or whether a different coil or setting is the better fix."

**Verdict:** Depends: a real fault if the RF stability/linearity tests fail; a usage/protocol limit if they pass and the shading follows the anatomy or coil choice.
**Sources:** G2, G4, G7, S1, S6, S9
**Field practice (unsourced):** None

---

## Documentation gaps (logged in amt-field-gap-log.md, 2026-09-27)

- **GE MRI, CTL spine array coil:** no GE guidance on small-patient/veterinary CTL use. The 3.0T HD 8-Ch CTL Operator Manual (named in SM 5756356) isn't in the library.
- **GE MRI, spine/body arrays:** no GE coil operator manuals and no pediatric coil-use guidance in the library.
- **Siemens MRI, local/spine coils (Aera/Skyra/Avanto/Espree):** no Siemens Coil Operator Manual and no guidance on human coils for animals.
- **Siemens MRI magnets:** no Siemens document links the cold head/compressor to image artifacts.
- **Siemens Aera/Skyra (fit):** the Spike Troubleshooting document referenced by the Gradient TSG isn't in the library.
- **Siemens Aera-class and Sola/Vida-class:** no current-platform image-quality troubleshooting guide; only a Symphony-era chart was found.

## Library pages needing review (not used as OEM sources)

`Manuals/GE/RF_Shield_Service.htm`, `Manuals/GE/Shim_Service.htm`, `Manuals/Siemens/Gradient.htm` and `Manuals/Siemens/RF_Amp_Service.htm` are AMT-authored quick references. They contain OEM claims (error codes, menu paths) that could not be verified against OEM documents.
