# Ellis & Watts LTL-4 Heat Exchanger (GE MR mobiles, gradient coil cooling)

**Type:** AMT field guide (Mike's field note, formatted only; not OEM SM verbatim)
**Source:** Field note, Mike Jackson, 1 Oct 2026
**System:** GE MR mobiles (gradient coil cooling)

## Manual

- **AMT library PDF (primary):** [Ellis & Watts LTL-4 Gradient Water Heat Exchanger manual, ENG-457 Rev 9 (GE DOC1738330)](https://raw.githack.com/mikejackson-stack/AMT-GE-Manuals/main/Ellis%20Watts%20LTL-4/Ellis_Watts_LTL-4_Gradient_Water_Heat_Exchanger_Manual_ENG-457_Rev9.pdf)
- **Backup:** [Scribd: Gradient Water Heat Exchanger Technical Manual](https://www.scribd.com/document/366769606/Gradient-Water-Heat-Exchanger-Technical-Manual)
- **Backup:** [GE Common Document Library](https://customer-doc.cloud.gehealthcare.com/#/cdp/dashboard) (search DOC1738330)

---

## Field note

GE MR Team,

The Ellis & Watts LTL-4 Heat Exchanger is used on most GE MR mobiles for gradient coil cooling.  It is a high failure item but also gets replaced more often than it probably needs to.  At 100 lbs with 4 coolant lines attached it is not the most pleasant thing to swap out.  Here are the things to know before pulling the trigger and ordering one.

The Ellis & Watts installation, operation and maintenance manual is available at [https://www.scribd.com/document/366769606/Gradient-Water-Heat-Exchanger-Technical-Manual](https://www.scribd.com/document/366769606/Gradient-Water-Heat-Exchanger-Technical-Manual).  If this link stops working it can also be found in the GE Common Document Library ([https://customer-doc.cloud.gehealthcare.com/#/cdp/dashboard](https://customer-doc.cloud.gehealthcare.com/#/cdp/dashboard)) by searching for DOC1738330.

The most common faults that point to LTL-4 issues are unexplained coolant loss, coolant puddling around the unit, or Patient Comfort Warmer Than Normal error messages on the MR system.  If a customer reports a patient comfort message that clears by the time you get on site, type the below command in a shell window to see the historical temperature data.  31 C (88 F) triggers the warmer than normal error.  36 C (97 F) will inhibit scanning.

`gedit /usr/g/service/log/pcft.log`            (note the space between gedit and the first /)

The command `/usr/g/service/bin/startBoreViewer` will allow you to plot the data on a graph on some systems as well.  It works on 16.x and above for sure.  It does not work on 11.x and below.  Not tested on 12.x-15.x yet.

- There is a cover interlock switch.  This needs to be taped or zip tied down to troubleshoot with the cover off.  It can also be used to cycle power at the unit when purging air from the gradient coil loop.
- It requires 110VAC +/- 10% single phase power.  Current draw is 12.5A running with a max 75A start-up draw.  It is supposed to be fed by the MR PDU, but in some cases, it is fed by a breaker in the main panel of the mobile.  If power is in doubt, make your own extension cord to get power from elsewhere.  Make sure it's at least 12-3 wire and preferably connected to a 20A circuit.
- Coolant from the primary chiller should be 50/50 glycol and maximum 52 F (11 C)
- It can operate in an ambient temp up to 113 F.  Heat in the belly of the mobile is rarely a problem.
- It should flow 3.3 GPM +/- 0.3 GPM to the gradient coil.
- Gradient coil coolant temp is controlled by a temperature controller that adjusts a flow valve/regulator on the PRIMARY side.  More heat coming back from gradient coil = more flow allowed on the primary side to draw the heat away.
- Gradient coil coolant should be 35% Ethylyne glycol, 65% distilled water.  It's fine if we go over on the distilled water concentration.
- If the gradient coil side sucks in air it can take 10-50 restarts of the LTL-4 to push the air back to the reservoir.  Ordering a new LTL-4 does not fix this!  Maximum outlet pressure is 60 PSI.  Over 60 PSI = air bubbles or other flow restriction to hunt down.  The unit may only operate 30 seconds before the next reset is required.

#### If the pump/motor are not turning:

- Make sure cover interlock switch is working with DVM.  Cover on = short.  Cover off = open.
- Make sure the low level switch in the reservoir is working properly with DVM.  OK level = short.  Low level = open.
- Make sure there is flow on the primary side.  Ensure all valves are open.
- Make sure the return temp of gradient coolant is below 100 F (37 C).  The LTL-4 shuts off at this temp to protect the motor and will not reset until the temp gets below 80 F (27 C) or the unit is reset AND water temp is below 100F.
- If the pump/motor stops 30 seconds after startup check for flow restriction on the gradient coil loop.  Flow under 1GPM will cause the pump to shut off.  Cycling power resets the time delay.

---

Manuals path: All_Systems/Field_Guides/Ellis-Watts-LTL-4-heat-exchanger.md
