@echo off
echo ========================================
echo SenyaMatika Backend - Local Setup
echo ========================================
echo.

echo Step 1: Checking Node.js...
node --version
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install from: https://nodejs.org/
    pause
    exit /b 1
)
echo ✓ Node.js is installed
echo.

echo Step 2: Checking PostgreSQL...
psql --version
if %errorlevel% neq 0 (
    echo WARNING: PostgreSQL is not installed or not in PATH!
    echo.
    echo Please install PostgreSQL:
    echo 1. Download from: https://www.postgresql.org/download/windows/
    echo 2. Install with default settings
    echo 3. Remember your postgres password!
    echo 4. Reopen this terminal after installation
    echo.
    pause
    exit /b 1
)
echo ✓ PostgreSQL is installed
echo.

echo Step 3: Checking .env file...
if not exist .env (
    echo WARNING: .env file not found!
    echo.
    echo Please create .env file with:
    echo DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/senyamatika
    echo JWT_SECRET=your_random_secret_key_here
    echo PORT=3000
    echo NODE_ENV=development
    echo ALLOWED_ORIGINS=http://localhost:*
    echo.
    pause
    exit /b 1
)
echo ✓ .env file exists
echo.

echo Step 4: Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies!
    pause
    exit /b 1
)
echo ✓ Dependencies installed
echo.

echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Make sure PostgreSQL is running
echo 2. Create database: psql -U postgres -c "CREATE DATABASE senyamatika;"
echo 3. Update .env file with your PostgreSQL password
echo 4. Run: npm start
echo.
echo For detailed instructions, see: LOCAL_TESTING_GUIDE.md
echo.
pause
