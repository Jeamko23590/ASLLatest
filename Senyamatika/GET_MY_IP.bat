@echo off
echo ========================================
echo Getting Your Computer's IP Address
echo ========================================
echo.

echo Your WiFi IP Address:
echo.

for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address"') do (
    set IP=%%a
    set IP=!IP:~1!
    echo    %%a
)

echo.
echo ========================================
echo Copy one of the IP addresses above
echo (Usually starts with 192.168.x.x)
echo ========================================
echo.
echo Next steps:
echo 1. Copy your WiFi IP address
echo 2. Update lib/backend/services/api_service.dart
echo 3. Change _localIP to your IP address
echo 4. Rebuild APK: flutter build apk --release
echo.
pause
