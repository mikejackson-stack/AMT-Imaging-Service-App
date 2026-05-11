***********************************************************************************
*                                                                                 *
*                         Field Service Shim Camera Software                      *
*                                   CD Revision 10                                *
*                                Build 25D240208-10-01                            *
*                                                                                 *
*                          THIS DISC CONTAIN SHIMTOOL  V2.5D                      * 
*                                                                                 *
*                    (c) GEMERAL ELECTRIC COMPANY 1997-2010                       *
*                                All rights reserved                              *
*                                                                                 *
*                                                                                 *
***********************************************************************************


           
           - RELEASE NOTES -


THIS APPLICATION IS NOT SUPPORTED BY THE LAPTOP HELP DESK. 


MrShim tool is installed via the autoinstall on this disk. It is a windows 
application and required the array camera to perform scans.

This install assumes that the OS is windows XP and that the install drive 
is D: drive which also contains the Docuemnts and Settings Folder.  An option
to install on the C: drive is also given.


==============
How to Install:
==============

Insert the CD ROM into the CD ROM drive of your laptop.  
Autorun should start 
  Choose your Operating System Drive--C: or D:.
  Choose type of installation.
All required software will be installed, including icons on your desktop and 
links in your start\program list.

IF for some reason autorun does not start, you may manually start the install 
process by clicking on install.cmd.

When C: drive is selected:
   All software will be install on C: drive.
   The following directories and subdirectories will be created. 
 
   C:\mrShim\ShimTool\

When D: drive is selected:
   All software will be install on D: drive.
   The following directories and subdirectories will be created. 

   D:\mrShim\ShimTool\

If you receive any "Directory already exists" messages, this is okay - the 
install script was just trying to create a parent directory that already exists.

NOTE:  if you need to save any files in these directories, they must
be copied to another directory prior to installation!

If you receive the prompt:

"All files in directory will be deleted!"
"Are you sure (Y/N)?"

Answer "Y" and press <ENTER>.


Note that the \mrshim structure below exist in dupicate and only the appropriate 
version of the system to be installed on will be copied to the laptop.
======================
WHAT THIS CD CONTAINS:   (note: Typical, Can vary)
======================
|   Install.cmd
|   Pre-Install Intructions.doc
|   README.TXT <------------------------------ (THIS FILE)
|   AUTORUN.INF
|   
+---WCdrive
|   \---mrShim
|       \---ShimTool
|               BatchST.exe
|               Corona ShimTool.lnk
|               Corona-SpecVols.fmt
|               Cylindrical_Corona_field_2K.si
|               G3Unified5V.fmt
|               G3UnifiedTarget.fmt
|               G3UnifiedTarget.tol
|               libCmd.dll
|               libIO.dll
|               libShim.dll
|               libUtil.dll
|               libWinShim.dll
|               libWinUtil.dll
|               mfc71.dll
|               MSVCP71.DLL
|               msvcr71.dll
|               OpenSpeed.si
|               ShimTool Validation Release Letter.pdf
|               ShimTool.cfg
|               ShimTool.pwd
|               ShimTool25C.exe
|               WB_CoronaSC_MarkIII.cal
|               W_CoronaCamera50dsv.fmt
|               W_CoronaP.cal
|               W_CoronaP41.cal
|               W_CoronaSC.cal
|               W_CoronaSC_MarkII.cal
|		XRMB_0_25mm.cal
|               LCC-393Unified.fmt
|               LCC-Camera.fmt
|               LCC-4vol-393-SpecVols.fmt
|               LCC-4vol-393Unified.fmt
|               RS393B.tol
|               rs393sc.cal
|               RB_SC.cal
|               DVw.tol
|               DVw-45fov-unified.fmt
|               DVw_PassiveSiFe.cal
\---WXp
    \---mrShim
        \---ShimTool
                BatchST.exe
                Corona ShimTool.lnk
                Corona-SpecVols.fmt
                Cylindrical_Corona_field_xp.si
                G3Unified5V.fmt
                G3UnifiedTarget.fmt
                G3UnifiedTarget.tol
                libCmd.dll
                libIO.dll
                libShim.dll
                libUtil.dll
                libWinShim.dll
                libWinUtil.dll
                mfc71.dll
                MSVCP71.DLL
                msvcr71.dll
                OpenSpeed.si
                ShimTool Validation Release Letter.pdf
                ShimTool.cfg
                ShimTool.pwd
                ShimTool25C.exe
                WB_CoronaSC_MarkIII.cal
                W_CoronaCamera50dsv.fmt
                W_CoronaP.cal
                W_CoronaP41.cal
                W_CoronaSC.cal
                W_CoronaSC_MarkII.cal
		XRMB_0_25mm.cal
                LCC-393Unified.fmt
                LCC-Camera.fmt
                LCC-4vol-393-SpecVols.fmt
                LCC-4vol-393Unified.fmt
                RS393B.tol
                rs393sc.cal
                RB_SC.cal
|               DVw.tol
|               DVw-45fov-unified.fmt
|               DVw_PassiveSiFe.cal

========
Overview:
========
============
Requirements:
============
   Camera kit

============
Availability:
============
The hardware is currently available; contact your regional engineer.
                
