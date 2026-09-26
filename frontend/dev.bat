@echo off
title Finovo Frontend Development Server (Port 5173)
cd /d "%~dp0"
echo Starting Finovo Frontend in dev mode on http://localhost:5173...
call npm.cmd run dev
pause
