@echo off
echo ========================================
echo Testing BlueStacks Connection
echo ========================================
echo.

echo Step 1: Checking if backend is running...
echo.
curl -s http://localhost:3000/health >nul 2>&1
if %errorLevel% equ 0 (
    echo ✅ Backend is running
    echo.
    echo Response:
    curl http://localhost:3000/health
    echo.
) else (
    echo ❌ Backend is NOT running
    echo    Please run START_BACKEND.bat first
    echo.
    pause
    exit /b 1
)

echo.
echo Step 2: Checking if port 3000 is listening...
echo.
netstat -an | findstr ":3000" | findstr "LISTENING" >nul 2>&1
if %errorLevel% equ 0 (
    echo ✅ Port 3000 is listening
) else (
    echo ❌ Port 3000 is not listening
)
echo.

echo Step 3: Checking APK file...
echo.
if exist "build\app\outputs\flutter-apk\app-release.apk" (
    echo ✅ APK file exists
    echo    Location: build\app\outputs\flutter-apk\app-release.apk
    for %%A in ("build\app\outputs\flutter-apk\app-release.apk") do echo    Size: %%~zA bytes
) else (
    echo ❌ APK file not found
    echo    Run: flutter build apk --release
)
echo.

echo ========================================
echo Connection Test Complete!
echo ========================================
echo.
echo For BlueStacks:
echo - Backend URL: http://localhost:3000 (on your computer)
echo - App will use: http://10.0.2.2:3000/api (in BlueStacks)
echo.
echo Next Steps:
echo 1. Make sure BlueStacks is running
echo 2. Drag app-release.apk into BlueStacks
echo 3. Open the app and test
echo.
echo To test in BlueStacks browser:
echo - Open Chrome in BlueStacks
echo - Go to: http://10.0.2.2:3000/health
echo - Should see JSON response
echo.
pause
