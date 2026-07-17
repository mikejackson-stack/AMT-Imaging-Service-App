@echo off
cd /d C:\Users\MICHA\Documents\AMT-Imaging-Service-App
git add index.html AMT-Imaging-App-standalone.html Manuals/Injectors/
git commit -m "Add MedcoBlue as injector parts supplier — all 9 injector HTML guides updated; dg_seed_068 parts reference updated"
git push origin main
echo EXIT_CODE=%ERRORLEVEL%
