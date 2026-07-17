@echo off
cd /d C:\Users\MICHA\Documents\AMT-Imaging-Service-App
git add index.html
git commit -m "Add system specs guide: magnet weight, LHe capacity, room/water temp, power — GE & Siemens all systems"
git push origin main
echo EXIT_CODE=%ERRORLEVEL%
