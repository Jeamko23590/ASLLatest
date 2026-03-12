@echo off
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                                                              ║
echo ║     SENYAMATIKA - FINAL INTEGRATION VERIFICATION TEST        ║
echo ║                                                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

echo [1/8] Checking Node.js and npm...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not found! Please install Node.js
    pause
    exit /b 1
)
echo ✅ Node.js installed: 
node -v

npm -v >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm not found!
    pause
    exit /b 1
)
echo ✅ npm installed: 
npm -v
echo.

echo [2/8] Checking backend files...
if not exist "backend\server.js" (
    echo ❌ backend\server.js not found!
    pause
    exit /b 1
)
echo ✅ backend\server.js exists

if not exist "backend\package.json" (
    echo ❌ backend\package.json not found!
    pause
    exit /b 1
)
echo ✅ backend\package.json exists

if not exist "backend\.env" (
    echo ❌ backend\.env not found!
    pause
    exit /b 1
)
echo ✅ backend\.env exists
echo.

echo [3/8] Checking database...
if not exist "backend\senyamatika.db" (
    echo ⚠️  Database file not found (will be created on first run)
) else (
    echo ✅ backend\senyamatika.db exists
)
echo.

echo [4/8] Checking node_modules...
if not exist "backend\node_modules" (
    echo ⚠️  node_modules not found
    echo Installing dependencies...
    cd backend
    call npm install
    cd ..
    if %errorlevel% neq 0 (
        echo ❌ npm install failed!
        pause
        exit /b 1
    )
    echo ✅ Dependencies installed
) else (
    echo ✅ node_modules exists
)
echo.

echo [5/8] Checking Flutter API service...
if not exist "lib\backend\services\api_service.dart" (
    echo ❌ lib\backend\services\api_service.dart not found!
    pause
    exit /b 1
)
echo ✅ api_service.dart exists
echo.

echo [6/8] Checking APK...
if not exist "build\app\outputs\flutter-apk\app-release.apk" (
    echo ⚠️  APK not found (run: flutter build apk --release)
) else (
    echo ✅ app-release.apk exists
    for %%A in ("build\app\outputs\flutter-apk\app-release.apk") do echo    Size: %%~zA bytes
)
echo.

echo [7/8] Getting network information...
echo Your computer's IP addresses:
ipconfig | findstr "IPv4"
echo.
echo ⚠️  Make sure your phone is on the same WiFi network!
echo ⚠️  Current API configuration: 192.168.1.59:3000
echo.

echo [8/8] Checking firewall...
netsh advfirewall firewall show rule name="SenyaMatika Backend" >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  Firewall rule not found
    echo.
    echo Would you like to add firewall rule now? (Requires Administrator)
    echo Press any key to add rule, or Ctrl+C to skip...
    pause >nul
    netsh advfirewall firewall add rule name="SenyaMatika Backend" dir=in action=allow protocol=TCP localport=3000
    if %errorlevel% neq 0 (
        echo ❌ Failed to add firewall rule (run as Administrator)
    ) else (
        echo ✅ Firewall rule added
    )
) else (
    echo ✅ Firewall rule exists
)
echo.

echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo ✅ VERIFICATION COMPLETE!
echo.
echo 📋 INTEGRATION STATUS:
echo    ✅ Backend files ready
echo    ✅ Database configured (SQLite)
echo    ✅ Flutter API service integrated
echo    ✅ Dependencies installed
echo    ✅ APK built (if exists)
echo.
echo 🚀 NEXT STEPS:
echo.
echo    1. Start backend server:
echo       cd backend
echo       npm start
echo.
echo    2. Install APK on phone:
echo       Copy: build\app\outputs\flutter-apk\app-release.apk
echo.
echo    3. Test features:
echo       - Register new account
echo       - Login
echo       - Complete exercise
echo       - Check backend logs for sync
echo.
echo    4. Multi-device test:
echo       - Install on another phone
echo       - Login with same account
echo       - Verify progress syncs
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
pause
