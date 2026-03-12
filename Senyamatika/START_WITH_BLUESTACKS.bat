@echo off
echo ========================================
echo SenyaMatika - BlueStacks Quick Start
echo ========================================
echo.

echo Step 1: Starting Backend Server...
echo.
cd backend
start "SenyaMatika Backend" cmd /k "node server.js"
cd ..

timeout /t 3 /nobreak >nul

echo.
echo Step 2: Checking Backend...
echo.
curl -s http://localhost:3000/health
echo.
echo.

echo ========================================
echo Backend is Running!
echo ========================================
echo.
echo Backend URL: http://localhost:3000
echo BlueStacks URL: http://10.0.2.2:3000
echo.
echo Next Steps:
echo 1. Open BlueStacks
echo 2. Drag and drop this file into BlueStacks:
echo    build\app\outputs\flutter-apk\app-release.apk
echo 3. Open SenyaMatika app
echo 4. Test registration/login
echo.
echo Backend console is running in a separate window
echo Press Ctrl+C in that window to stop the backend
echo.
pause
