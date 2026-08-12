@echo off
echo =======================================
echo     SLD Auto-Updater by Antigravity
echo =======================================
echo.
echo This script will automatically inject the viewer logic (zoom, pan, popup)
echo into your exported SLD.html file.
echo.

set "file=SLD.html"

if not exist "%file%" (
    echo [ERROR] SLD.html not found in this folder!
    echo Please make sure this script is in the same folder as SLD.html.
    echo.
    pause
    exit /b
)

findstr /C:"viewer.js" "%file%" >nul
if %errorlevel% equ 0 (
    echo [INFO] SLD.html already has the viewer.js script attached.
) else (
    echo. >> "%file%"
    echo ^<script src="viewer.js"^>^</script^> >> "%file%"
    echo [SUCCESS] viewer.js successfully added to SLD.html!
)

echo.
echo Press any key to exit...
pause >nul
