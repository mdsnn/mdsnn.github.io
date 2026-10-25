@echo off
title Mwiko Git Watcher
cd /d "%~dp0"
echo ==========================================================
echo Starting MwikoOS Git Auto-Commit Watcher
echo ==========================================================
echo.
echo Choose execution mode:
echo   [1] Auto-commit local only (Default)
echo   [2] Auto-commit AND push to GitHub
echo.
set /p choice="Enter choice (1 or 2, default 1): "

if "%choice%"=="2" (
    echo Starting watcher WITH auto-push enabled...
    powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0git-watcher.ps1" -Push
) else (
    echo Starting watcher in local-commit mode...
    powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0git-watcher.ps1"
)

pause
