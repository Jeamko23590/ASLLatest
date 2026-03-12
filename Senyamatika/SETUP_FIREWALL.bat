@echo off
echo ========================================
echo Setting Up Firewall for Backend
echo ========================================
echo.
echo This will allow your phone to connect to the backend
echo Running on port 3000
echo.

echo Checking for administrator privileges...
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo.
    echo ERROR: This script requires administrator privileges!
    echo Please right-click and select "Run as administrator"
    echo.
    pause
    exit /b 1
)

echo Administrator privileges confirmed!
echo.

echo Adding firewall rule for port 3000...
netsh advfirewall firewall delete rule name="SenyaMatika Backend" >nul 2>&1
netsh advfirewall firewall add rule name="SenyaMatika Backend" dir=in action=allow protocol=TCP localport=3000

if %errorLevel% equ 0 (
    echo.
    echo ========================================
    echo SUCCESS! Firewall configured
    echo ========================================
    echo.
    echo Port 3000 is now open for connections
    echo Your phone can now connect to the backend
    echo.
    echo Next steps:
    echo 1. Start backend: START_BACKEND.bat
    echo 2. Install APK on phone
    echo 3. Make sure both on same WiFi
    echo 4. Test connection in app
    echo.
) else (
    echo.
    echo ERROR: Failed to add firewall rule
    echo Please check Windows Firewall settings manually
    echo.
)

pause
