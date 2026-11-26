@echo off
title PloyWeb - Acceptance Test & Exfiltration Prevention Verification
color 0A
cls
echo =======================================================================
echo   PLOYWEB CYBER INVESTIGATION PLATFORM - ACCEPTANCE TEST RUNNER
echo   Testing: Realistic Adversary Data Theft & Verified Prevention
echo =======================================================================
echo.
python "%~dp0verify_acceptance_test.py"
echo.
pause
