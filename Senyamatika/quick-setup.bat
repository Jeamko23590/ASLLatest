@echo off
echo ========================================
echo SenyaMatika - Quick Network Setup
echo ========================================
echo.

REM Get local IP address
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address" ^| findstr /r "192\.168\."') do (
    set IP=%%a
    goto :found
)

:found
set IP=%IP: =%

echo Your Local IP: %IP%
echo Backend URL: http://%IP%:3000/api
echo.

REM Add firewall rule
echo Adding firewall rule...
netsh advfirewall firewall delete rule name="SenyaMatika Backend" >nul 2>&1
netsh advfirewall firewall add rule name="SenyaMatika Backend" dir=in action=allow protocol=TCP localport=3000 >nul 2>&1

if %errorlevel% equ 0 (
    echo ✓ Firewall configured
) else (
    echo ! Run as Administrator for firewall access
)

echo.
echo ========================================
echo Configuration Complete!
echo ========================================
echo.
echo Your Backend URL: http://%IP%:3000/api
echo.
echo Update your Flutter app with this URL:
echo   lib/backend/services/api_service.dart
echo   Change baseUrl to: 'http://%IP%:3000/api'
echo.
echo Start backend: cd backend ^&^& npm start
echo.
pause
