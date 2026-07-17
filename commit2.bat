@echo off
cd /d C:\Users\MICHA\Documents\AMT-Imaging-Service-App
copy /Y index.html AMT-Imaging-App-standalone.html
git add index.html AMT-Imaging-App-standalone.html
git commit -m "Visual refinements v3: gold topbar accent, color-coded quick actions, improved guide and KB cards"
git push origin main
echo DONE.
