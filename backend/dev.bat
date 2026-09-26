@echo off
title Finovo Backend Development Server (Port 5000)
cd /d "%~dp0"
echo Starting Finovo Backend Server in dev mode on http://localhost:5000...
call npm.cmd run dev
pause
