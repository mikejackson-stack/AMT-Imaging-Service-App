# Contrast Injector Reference — AMT Imaging Solutions

## Top 5 MRI & CT Contrast Injectors in US Clinical Use

| # | Injector | Manufacturer | Application | Manual |
|---|----------|-------------|-------------|--------|
| 1 | Medrad Stellant CT | Bayer Radiology | CT (dual-head) | [Guide](Stellant_CT/Stellant_CT_Guide.html) |
| 2 | Medrad Spectris Solaris EP | Bayer Radiology | MRI | [Guide](Spectris_Solaris_EP/Spectris_Guide.html) |
| 3 | Guerbet OptiVantage DH | Guerbet | CT (dual-head) | [Guide](OptiVantage_DH/OptiVantage_Guide.html) |
| 4 | Bracco EmpowerCTA+ | Bracco Diagnostics | CT | [Guide](EmpowerCTA/EmpowerCTA_Guide.html) |
| 5 | Medrad Mark 7 Arterion | Bayer Radiology | CT/Angio | [Guide](Mark7_Arterion/Mark7_Guide.html) |

## General Injector Safety Tips

- **Always** disconnect patient from injector before cycling power on a Type 3/Critical fault
- **Never** leave an armed injector unattended
- **Log all** pressure limit events — recurring high-pressure faults indicate line occlusion or wrong syringe
- **Warm contrast** to body temperature (37°C) before injection to reduce viscosity and injection pressure
- **Document** syringe lot numbers and contrast agent for every injection per ACR guidelines
- Injector **PM interval**: every 6 months or per OEM recommendation
- **MRI injectors** must use MR-conditional disposables only — verify compatibility before use

## Quick Troubleshooting Decision Tree

```
Injector won't power on?
  └─ Check wall power → Check power cord → Check power supply voltages

Error on screen?
  └─ Note exact error code/symcode → Look up in error code guide → Power cycle first
     └─ If error clears: document, continue
     └─ If error returns: follow repair sequence, call tech support

Syringe not recognized?
  └─ Remove syringe → Inspect syringe sensors and optics → Wipe sensors
  └─ Try a new syringe → If still fails: inspect syringe latch / sensor board

High pressure abort during injection?
  └─ Check IV line for kinks → Check needle gauge (minimum 20G) → Check for thrombosis
  └─ Reduce flow rate → Reduce pressure limit if appropriate for protocol
  └─ Document and report to clinical staff

Communication lost (MRI injectors)?
  └─ Check fiber optic cable connections at both ends → Inspect for damage
  └─ Power cycle both console and head → Check battery level
  └─ Swap fiber optic cable if available

Plunger won't move?
  └─ Check for mechanical obstruction → Check motor fault code
  └─ Try manual advance → Inspect drive belt / motor coupler
  └─ Run motor speed diagnostic
```
