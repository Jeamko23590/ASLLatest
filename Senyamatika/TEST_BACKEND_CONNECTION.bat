@echo off
echo ========================================
echo Testing Backend Connection
echo ========================================
echo.

cd backend

echo Testing database connection...
node test-db-connection.js

echo.
echo Testing API endpoints...
node test-setup.js

echo.
echo ========================================
echo Test Complete!
echo ========================================
pause
