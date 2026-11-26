@echo off
title PloyWeb Endpoint Telemetry Agent
color 0B
echo ======================================================================
echo           PLOYWEB AUTONOMOUS ENDPOINT INVESTIGATION AGENT
echo ======================================================================
echo  Initializing safe endpoint telemetry and test sandbox...
echo.

cd /d "%~dp0"
python ployweb_agent.py

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [!] Python not found in PATH or error occurred.
    echo Please make sure Python 3.10+ is installed.
    pause
)
