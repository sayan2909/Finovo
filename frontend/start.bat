@echo off
title Finovo Frontend Production Server (Port 5173)
cd /d "%~dp0"
echo Starting Finovo Frontend Production Preview on http://localhost:5173...
call npm.cmd run start
pause
