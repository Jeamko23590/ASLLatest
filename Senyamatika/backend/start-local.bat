@echo off
REM Quick start script for local development (Windows)

echo Starting SenyaMatika Backend...

REM Check if .env exists
if not exist .env (
    echo .env file not found!
    echo Creating .env from .env.example...
    copy .env.example .env
    echo .env created. Please update it with your database credentials.
    echo.
    echo Required variables:
    echo   - DATABASE_URL
    echo   - JWT_SECRET
    echo.
    pause
    exit /b 1
)

REM Check if node_modules exists
if not exist node_modules (
    echo Installing dependencies...
    call npm install
)

REM Start the server
echo Starting server...
call npm start
