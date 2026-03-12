@echo off
echo ========================================
echo Starting SenyaMatika Backend Server
echo ========================================
echo.

cd backend

echo Checking if Node.js is installed...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js version:
node --version
echo.

echo Checking if dependencies are installed...
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
    echo.
)

echo Starting backend server...
echo Server will run on http://localhost:3000
echo Press Ctrl+C to stop the server
echo.

node server.js

pause
