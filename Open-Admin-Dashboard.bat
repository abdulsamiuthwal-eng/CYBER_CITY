@echo off
title CyberCity 2050 — Admin Telemetry Launcher
cd /d "%~dp0"
cls

echo ========================================================
echo   CYBERCITY 2050 -- ADMIN TELEMETRY PORTAL LAUNCHER
echo ========================================================
echo.

:: 1. Check if port 5500 is already active
netstat -ano | findstr /R ":5500.*LISTENING" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] Local Server is already active on Port 5500.
) else (
    echo [INFO] Starting CyberCity Local Server on Port 5500...
    start /B "" node "config\server.js" >nul 2>&1
    ping 127.0.0.1 -n 2 >nul
)

echo.
echo [LAUNCH] Opening Protected Admin Portal in your default browser...
start "" "http://localhost:5500/admin/index.html"

echo [SUCCESS] Admin Portal launched successfully!
ping 127.0.0.1 -n 2 >nul
exit
