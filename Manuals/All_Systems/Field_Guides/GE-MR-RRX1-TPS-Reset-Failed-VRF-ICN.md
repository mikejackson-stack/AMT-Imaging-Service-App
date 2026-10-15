# GE MR "Reset/Download TPS was not successful": RRX-1 errors, real fault a failed VRF in the ICN (2272059 / 2270016 / 2267586 / 2267519)

> DRAFT – AMT field notes compiled from GE service documentation. Not a GE document and not GE-certified.
> Follow the current GE procedure for your system and software. **[Inferred]** = not stated in a GE source.

## Field-proven fix (read first)
- **Proven in the field by Mike, Oct 2026, on a GE 3T.** The TPS reset failed with 2272059, 2270016, 2267586 and 2267519.
- The errors point at **RRX-1 and its fiber**, but the **real fault was a failed VRF inside the ICN**. **Replacing the ICN cleared every error.**
- Do not start by swapping the RRX or the fiber. Run the ICN/VRF tests first (see "Fast isolation order").

## Symptoms and error codes
- TPS reset ends with **"Reset/Download TPS was not successful"**.
- **2272059 EM_MR_MX_adc_ads_ADS_ICN_VRF_Mapping**: "VRF in ICN%s is connected to RRX with ID %s." [GE Error Message Tool, ermes_2272000-2272999]
- **2270016 EM_VRF_DEVICE_ID_ERROR**: the VRF did not receive the correct device ID from the RRX. In this case the VRF got **device ID 0**. GE's probable causes, most to least likely: **Img Compute Node**, RRx Module, Scan Room PS, Dual Fiber Cable. GE notes that the VRF is in ICN1 (ICN2) if ADS (ADS1) reports the error. [ermes_2270000-2270999]
- **2267586 EM_IRF3_RFHUB_RRX_VRF_FIBER**: the RF Hub reports that RRX-1 has no active fiber signal to the ICN modules. GE's probable causes: **Img Compute Node**, RRx Module, Dual Fiber Cable, Dual Fiber Module. [ermes_2267000-2267999]
- **2267519 EM_IRF3_RFCAL_RFHUB_ERRORS**: RF calibration was aborted because the RF Hub reported errors. GE says to correct the earlier errors first; this one is a consequence. [ermes_2267000-2267999]
- Note that GE lists the **Img Compute Node first** for both 2270016 and 2267586, which matches the field result.

## Hardware generation
- This GE 3T uses the same receive-chain hardware generation as the Optima MR450w: ICN with VRF, two RRX modules on the magnet, RF Hub and IRF3. The MR450w CD 5670013 diagnostics and procedures below therefore apply.
- Confirm the ICN type (4100 or 4170) from the HART log or the ICN Identification tool (see 1052853).

## Fast isolation order
1. **ICN/VRF first (most likely, per the field fix).**
   - **VRF Hardware Diagnostics** (5670013 / 1052853): Diagnostics → System Function → Recon → VRF Hardware Diagnostics.
     - If the RRX is suspect, fit the **dual fiber-optic service loopback connector** in place of the product cable before running it, so the RRX can't interfere.
     - GE: a failed result does not by itself prove the VRF is bad; follow the error messages.
   - **ICN VRF Manual Loopback Diagnostics** (1052790): Diagnostics → System Function → Recon → VRF Manual Diagnostics.
     - Needs Service Cable Kit **5306523**: dual loopback connector 5306530 and single loopback cable 5309512.
     - Tests: IDEC, IDIC, EDEC, EDIC. GE's results table:
       - IDEC and EDEC pass: the VRF is OK.
       - IDEC passes but EDEC fails: VRF link module. Reseat the loopback connector and retry; if it still fails, **replace the ICN**.
       - IDEC fails but IDIC passes: clock input. Check the clock cable and the Excite clock module.
       - IDEC and IDIC both fail: VRF clock module. Check the clock cable; if it still fails, **replace the ICN**.
   - Identify the right VRF before you move cables. On 4100, use Utilities → Toolbox → VRE → ICN Identification. On 4170, use the HART log ("vrf" BoardType): slot 19 is at the side of the ICN, slot 13 at the center.
2. **ICN RRX to VRF Data Path Diagnostic** (1052812): Diagnostics → System Function → Recon → VRF Communication Diagnostics. If it fails, GE says to check the VRF and RRX clock input and the fiber, then run VRF HW diags, the VRF loopback and RRX BLD.
3. **Fiber.** Inspect and reseat the dual fiber between the VRF (rear of the ICN) and RRX-1. Handle it carefully; it is fragile (1062884).
   - **[Inferred]** With the loopback connector on the ICN end, a passing EDEC shows the ICN side is good and points toward the fiber or the RRX.
4. **Power.** Check the RRX power indicator light (per 2270016). The RRX is powered from the Scan Room Power Supply (SRPS) in the Penetration Cabinet (1062884).
5. **RRX.** Run **RRX Board Level Diagnostics** (1052813): Diagnostics → System Function → RF → Receiver Diagnostics. Logs go to /usr/g/service/log, e.g. RRX-1_loopback_*.log.
   - GE: this BLD tests the RRX and its fiber link to the IRF3. It does **not** test the fiber link between the RRX and the ICNs, so a passing RRX BLD does not clear the RRX-to-ICN fiber or the VRF.
   - Replace the RRX (FRU **5174169**) only after the steps above (1062884).
6. **RF Hub.** The RRX modules are enumerated through a cable to the RF Hub, and the RF Hub must be powered for that to work (2267424). Check that cable and the RF Hub power.

## RRX ID 1 vs 2 notes
- There are two (32-channel) RRX modules on the side of the magnet (1052813).
- The RRX ID is enumerated through the cable to the RF Hub, and the RF Hub must be powered up (2267424 EM_IRF3_DRVR_CLONED_RRX). Two RRX reporting the same ID gives 2267424; the probable causes are the RRx Module and the RF Hub Backplane.
- 2272059 logs which ICN's VRF is connected to which RRX ID. Use it to see which VRF/ICN pairs with RRX-1. [ermes_2272000-2272999]
- **[Inferred]** A device ID of 0 in 2270016 means the VRF received no valid ID at all over the fiber. That fits a dead VRF receive path as well as a dead RRX or fiber, which is why the VRF tests come first.
- **[Inferred]** Swapping the RRX-1 and RRX-2 fibers at the ICN end can show whether the fault follows the VRF or the RRX/fiber. Return them to product configuration afterwards.

## After the fix
- Run a TPS reset; it should complete without 2272059, 2270016, 2267586 or 2267519.
- Re-run the ICN RRX to VRF Data Path and RRX BLD diagnostics, then RF calibration (2267519 should clear).
- **[Inferred]** Run a check scan.

## Sources (450w CD 5670013-3 Rev 1, same hardware generation)
- [1052790 ICN VRF Manual Loopback Diagnostics](https://raw.githack.com/mikejackson-stack/AMT-Imaging-Service-App/main/Manuals/Error%20codes%20and%20Troubleshooting%20All%20Systems/1.5T%2021x%20Optima%20450w/CD%205670013%20Rev1%201.5T%2021xOptima%20MR450/root/data/Signa_EXCITE/content/1052790.htm)
- [1052812 ICN RRX to VRF Data Path Diagnostic](https://raw.githack.com/mikejackson-stack/AMT-Imaging-Service-App/main/Manuals/Error%20codes%20and%20Troubleshooting%20All%20Systems/1.5T%2021x%20Optima%20450w/CD%205670013%20Rev1%201.5T%2021xOptima%20MR450/root/data/Signa_EXCITE/content/1052812.htm)
- [1052813 RRX Board Level Diagnostics](https://raw.githack.com/mikejackson-stack/AMT-Imaging-Service-App/main/Manuals/Error%20codes%20and%20Troubleshooting%20All%20Systems/1.5T%2021x%20Optima%20450w/CD%205670013%20Rev1%201.5T%2021xOptima%20MR450/root/data/Signa_EXCITE/content/1052813.htm)
- [1052853 VRF Hardware Diagnostics](https://raw.githack.com/mikejackson-stack/AMT-Imaging-Service-App/main/Manuals/Error%20codes%20and%20Troubleshooting%20All%20Systems/1.5T%2021x%20Optima%20450w/CD%205670013%20Rev1%201.5T%2021xOptima%20MR450/root/data/Signa_EXCITE/content/1052853.htm)
- [1062884 RRx Receiver Replacement](https://raw.githack.com/mikejackson-stack/AMT-Imaging-Service-App/main/Manuals/Error%20codes%20and%20Troubleshooting%20All%20Systems/1.5T%2021x%20Optima%20450w/CD%205670013%20Rev1%201.5T%2021xOptima%20MR450/root/data/Signa_EXCITE/content/1062884.htm)
- GE Error Message Tool: [ermes 2267xxx](https://raw.githack.com/mikejackson-stack/AMT-GE-Manuals/main/GE%20Error%20Message%20Tool/root/ermes_2267000-2267999.html), [ermes 2270xxx](https://raw.githack.com/mikejackson-stack/AMT-GE-Manuals/main/GE%20Error%20Message%20Tool/root/ermes_2270000-2270999.html), [ermes 2272xxx](https://raw.githack.com/mikejackson-stack/AMT-GE-Manuals/main/GE%20Error%20Message%20Tool/root/ermes_2272000-2272999.html)

Keywords: TPS reset, Reset/Download TPS was not successful, RRX, RRX-1, VRF, ICN, RF Hub, IRF3, fiber, 2272059, 2270016, 2267586, 2267519, 2267424
