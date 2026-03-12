@echo off
echo ========================================
echo PostgreSQL Password Reset Helper
echo ========================================
echo.
echo This script will help you reset your PostgreSQL password.
echo.
echo STEP 1: Find pg_hba.conf file
echo ========================================
echo.

set PG_HBA_15=C:\Program Files\PostgreSQL\15\data\pg_hba.conf
set PG_HBA_12=C:\Program Files\PostgreSQL\12\data\pg_hba.conf
set PG_HBA_14=C:\Program Files\PostgreSQL\14\data\pg_hba.conf

if exist "%PG_HBA_15%" (
    set PG_HBA=%PG_HBA_15%
    set PG_VERSION=15
    goto :found
)

if exist "%PG_HBA_12%" (
    set PG_HBA=%PG_HBA_12%
    set PG_VERSION=12
    goto :found
)

if exist "%PG_HBA_14%" (
    set PG_HBA=%PG_HBA_14%
    set PG_VERSION=14
    goto :found
)

echo ERROR: Could not find PostgreSQL installation!
echo.
echo Please check if PostgreSQL is installed in:
echo - C:\Program Files\PostgreSQL\15
echo - C:\Program Files\PostgreSQL\14
echo - C:\Program Files\PostgreSQL\12
echo.
pause
exit /b 1

:found
echo Found PostgreSQL %PG_VERSION%
echo Config file: %PG_HBA%
echo.
echo STEP 2: Instructions to reset password
echo ========================================
echo.
echo 1. Open Notepad as Administrator:
echo    - Right-click Notepad
echo    - Click "Run as administrator"
echo.
echo 2. Open this file in Notepad:
echo    %PG_HBA%
echo.
echo 3. Find these lines near the bottom:
echo    host    all             all             127.0.0.1/32            scram-sha-256
echo.
echo 4. Change "scram-sha-256" to "trust":
echo    host    all             all             127.0.0.1/32            trust
echo.
echo 5. Save and close Notepad
echo.
echo 6. Restart PostgreSQL service:
echo    - Press Win+R
echo    - Type: services.msc
echo    - Find: postgresql-x64-%PG_VERSION%
echo    - Right-click and Restart
echo.
echo 7. Run this command to change password:
echo    psql -U postgres -c "ALTER USER postgres PASSWORD 'postgres123';"
echo.
echo 8. Change "trust" back to "scram-sha-256" in pg_hba.conf
echo.
echo 9. Restart PostgreSQL service again
echo.
echo 10. Update backend\.env file:
echo     DB_PASSWORD=postgres123
echo.
echo ========================================
echo.
echo Would you like to open the config file now? (Y/N)
set /p OPEN_FILE=
if /i "%OPEN_FILE%"=="Y" (
    echo Opening config file...
    notepad "%PG_HBA%"
)
echo.
echo After following the steps above, run:
echo   npm run test-db
echo.
pause
