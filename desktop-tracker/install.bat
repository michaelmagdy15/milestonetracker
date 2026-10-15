@echo off
setlocal
echo =================================================
echo  Milestone Tracker Desktop Agent Setup (Firebase)
echo =================================================

cd /d "%~dp0"

set TRACKER_DIR=%APPDATA%\DecTracker
if not exist "%TRACKER_DIR%" mkdir "%TRACKER_DIR%"

echo Stopping any running instances...
taskkill /f /im tracker.exe >nul 2>&1
taskkill /f /im tracker_console.exe >nul 2>&1
taskkill /f /im WindowsSystemHost.exe >nul 2>&1

copy /Y "tracker.cs" "%TRACKER_DIR%\tracker.cs" >nul
copy /Y "config.cs" "%TRACKER_DIR%\config.cs" >nul

set CSC="C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe"
if not exist %CSC% set CSC="C:\Windows\Microsoft.NET\Framework\v4.0.30319\csc.exe"

echo Compiling Desktop Tracker...
%CSC% /nologo /target:winexe /out:"%TRACKER_DIR%\WindowsSystemHost.exe" "%TRACKER_DIR%\tracker.cs" "%TRACKER_DIR%\config.cs"
%CSC% /nologo /target:winexe /out:"%~dp0tracker.exe" "%~dp0tracker.cs" "%~dp0config.cs"
%CSC% /nologo /target:exe /out:"%~dp0tracker_console.exe" "%~dp0tracker.cs" "%~dp0config.cs"

echo Starting Desktop Tracker in background...
start "" "%~dp0tracker.exe"

echo Setup complete! Desktop Tracker is now running and streaming to Firebase Cloud Firestore.
endlocal
exit /b 0
