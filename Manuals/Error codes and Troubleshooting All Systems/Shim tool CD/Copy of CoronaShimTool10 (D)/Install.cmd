@ECHO OFF
Color fc
CLS
::Parameters for the display and installation 
:: Rev Number is for the Disk, and DestDir is the directory name to install
Set BuildNumber=25D240208-10-01
set RevNumber=10
set DestDir=MRshim
set ShimToolVersion=2.5D
echo ***********************************************************
echo              General Electric Healthcare
echo             To Be Used On OS Windows XP ONLY
echo ***********************************************************   
echo     THIS PRODUCT CANNOT BE REPRODUCED IN WHOLE OR IN PART
echo             WITHOUT PRIOR WRITTEN APPROVAL...
echo                   Copyright(c)  1997-2010    
echo ***********************************************************
echo * Property of GE Healthcare
echo *   Florence, South Carolina
echo *  Copyright (c)  1997 - 2010
echo *     All right reserved        
echo *******************************************************************
echo Disk Revision %RevNumber% Shimtool %ShimToolVersion% Build %BuildNumber%
echo *******************************************************************
::get Install Option from user
echo.
echo  ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
echo  +
echo  +    Please select the Operating System 
echo  +        For Installation
echo  +
echo  +    Press C for installation on C: (old Windows 2000 / no D Drive)
echo  +    Press D for installation on D: (Windows XP default)
echo  +
echo  +    Press A for Abort
echo  ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
echo.
:Loop1
echo Please Enter (C,D,A) followed by Enter
echo.
echo C. C Drive Installation
echo D. D Drive Installation
echo A. Abort
echo.
set choice=
set /p Choice=Type the Letter and Press Enter:
IF NOT '%Choice%'=='' SET Choice=%Choice:~0,1%
ECHO.
IF /I '%Choice%'=='C' GOTO Item2
IF /I '%Choice%'=='D' GOTO ItemX
IF /I '%Choice%'=='A' GOTO ItemA
echo.
IF /I '%Choice%'=='A' GOTO End
ECHO "%Choice%" is not valid. Please try again.
ECHO.
GOTO Loop1
:Item2
ECHO  Installation on C Drive...
set InstDrive=C:
set OStype=WCdrive
GOTO WIN2K
:ItemX
ECHO  Installation on D Drive...
set InstDrive=D:
set OStype=WXP
GOTO WIN2k
:ItemA
ECHO Aborting...
GOTO END

::============================== Installation =====================
:WIN2K
Color 5E
IF /I '%OSType%'=='WXP' color CE
CLS
::get install option from user
echo. 
echo  ********************************************************** 
echo  *             %InstDrive% Drive Installation                      *
echo  *                                                        *
echo  *      Install OR Update ShimTool software.              *
echo  *    If this is a 1st [virgin] install,    PRESS F.      *
echo  *    If shimtool already exist,            PRESS R.      *
echo  *      NOTE: Move any folder or files you want to keep,  *
echo  *            ALL folders and files will be deleted.      *  
echo  *    To un-Install ALL files,              PRESS U.      *
echo  *    TO abort this entire process,         PRESS Q.      *
echo  **********************************************************
echo.
Echo   =====================================================================
echo === READ THE INSTALL INSTRUCTIONS, ON THIS CD, PRIOR TO INSTALLIATION ===
Echo   =====================================================================
:LOOP
echo Please Enter (F,R,U,Q) followed by Enter
echo.
ECHO F. First Install
ECHO R. Re-Install of ShimTool
Echo U. Un-Install ShimTool
ECHO Q. Quit
echo.
SET Choice=
SET /P Choice=Type the letter and press Enter: 
IF NOT '%Choice%'=='' SET Choice=%Choice:~0,1%
ECHO.
IF /I '%Choice%'=='F' GOTO ItemF
IF /I '%Choice%'=='R' GOTO ItemR
IF /I '%Choice%'=='U' GOTO ItemU
echo.
IF /I '%Choice%'=='Q' GOTO End
ECHO "%Choice%" is not valid. Please try again.
ECHO.
GOTO Loop
:ItemF
ECHO Performing First Install...
GOTO FIRSTINSTALLW2K
:ItemR
ECHO Performing A Re-Install...
GOTO REINSTALLW2K
:ItemU
ECHO Performing A Un-Install...
GOTO UNINSTALLW2K
:End
goto stop
::========================= First Install ======================================
:FIRSTINSTALLW2K
echo Creating directory structure...

mkdir %InstDrive%\%DestDir%
mkdir %InstDrive%\%DestDir%\shimtool

echo Changing Folder Attributes...
   attrib -r %InstDrive%\%DestDir%\*.* /S /D
   attrib -r %InstDrive%\%DestDir%\shimtool\*.* /S /D
echo Attribute Change completed...

echo Decompressing .....
echo ****** INSTALLATION OF SOFTWARE ****** 
echo ****** %BuildNumber% SOFTWARE REVISION %RevNumber% COMPLETED****
echo.
echo.
echo ****** INSTALLATION Shimtool SOFTWARE ****** 
Xcopy %OStype%\%DestDir% %InstDrive%\%DestDir% /S

echo ****** SHimtool software REVISION %ShimToolVersion% COMPLETED****
echo ****** start Setting attributes *******
attrib -r -a %InstDrive%\%DestDir%
attrib +r -a %InstDrive%\%DestDir%\shimtool\*.*
attrib +r -a %InstDrive%\%DestDir%\shimtool
Echo Done...
echo ****** end attribute set ****** 
echo ****** start copy Icons to Desktop ******
copy "%InstDrive%\%DestDir%\ShimTool\Corona ShimTool.lnk" "%InstDrive%\Documents and Settings\All Users\Desktop"
Echo Done...
echo ****** start copy Icons to programs ******
copy "%InstDrive%\%DestDir%\ShimTool\Corona ShimTool.lnk" "%InstDrive%\Documents and Settings\All users\Start menu\programs
echo ****** end copy Icons *****
goto STOP
::========================= Re-Install========================================
:REINSTALLW2K
echo ****** Standby while some cleanup is performed ******
echo.
echo WARNING!!!
Echo All Files in Folder %DestDir%
Echo and \%DestDir%\Shimtool will be removed...
echo.
echo If you wish to abort this process, Press ctrl-C
echo.
pause 
echo.
echo ****** Changing Attributes ******
echo.
attrib -r %InstDrive%\%DestDir%\*.* /S /D
attrib -r %InstDrive%\%DestDir%\shimtool\*.* /S /D
Echo Done...
echo ****** Removing Previous Installed Files ****** 
echo.
erase /S /Q %InstDrive%\%DestDir%\shimtool\*.*
echo ****** REmove Icons from desktop ******
DEL /Q "%InstDrive%\Documents and Settings\All users\Desktop\Corona ShimTool.lnk"
echo ****** REmove Icons from Program Menu ******
DEL /Q "%InstDrive%\Documents and Settings\All users\Start Menu\Programs\Corona ShimTool.lnk"
echo.
Echo Done...
echo ****** Ready for Re-Install *****
echo.
goto FirstINSTALLW2K
::==========================UN-INSTALL =======================================
:UNINSTALLW2K
echo.
echo.
echo WARNING!!!
Echo All Files in Folder %DestDir%
Echo and \%DestDir%\Shimtool will be removed...
echo.
echo If you wish to abort this process, Press ctrl-C
echo.
pause 
echo.
echo ****** Changing Attributes ******
echo.
attrib -r %InstDrive%\%DestDir%\*.* /S /D
attrib -r %InstDrive%\%DestDir%\shimtool\*.* /S /D
Echo Done...
echo ****** Removing Previous Installed Files ****** 
echo
erase /S /Q %InstDrive%\%DestDir%\shimtool\*.*
echo All files from shimtool directory removed
RD /s /Q %InstDrive%\%DestDir%\Shimtool
echo Shimtool directory removed
echo.
echo ****** REmove Icons from desktop ******
DEL /Q "%InstDrive%\Documents and Settings\All users\Desktop\Corona ShimTool.lnk
echo ****** REmove Icons from Program Menu ******
DEL /Q "%InstDrive%\Documents and settings\All Users\Start Menu\Programs\Corona Shimtool.lnk"
echo.
Echo Done...
echo.
goto STOP
::========================== end of UN-INSTALL ===================================

:error
  echo ***************** ERROR **********************
  echo **** Could NOT CREATE DIRECTORY STRUCTURE ****
  echo **********************************************
  goto end
:end

:stop