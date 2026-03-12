# SenyaMatika Integration Verification Script
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host "     SENYAMATIKA - INTEGRATION VERIFICATION TEST" -ForegroundColor Cyan
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host ""

$allPassed = $true

# 1. Check Node.js
Write-Host "[1/8] Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node -v
    Write-Host "OK Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "FAIL Node.js not found!" -ForegroundColor Red
    $allPassed = $false
}

# 2. Check npm
Write-Host "[2/8] Checking npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm -v
    Write-Host "OK npm: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "FAIL npm not found!" -ForegroundColor Red
    $allPassed = $false
}

# 3. Check backend files
Write-Host "[3/8] Checking backend files..." -ForegroundColor Yellow
$backendFiles = @(
    "backend\server.js",
    "backend\package.json",
    "backend\.env",
    "backend\config\database.js",
    "backend\routes\auth.js",
    "backend\routes\users.js",
    "backend\routes\progress.js"
)

foreach ($file in $backendFiles) {
    if (Test-Path $file) {
        Write-Host "  OK $file" -ForegroundColor Green
    } else {
        Write-Host "  FAIL $file NOT FOUND" -ForegroundColor Red
        $allPassed = $false
    }
}

# 4. Check database
Write-Host "[4/8] Checking database..." -ForegroundColor Yellow
if (Test-Path "backend\senyamatika.db") {
    $dbSize = (Get-Item "backend\senyamatika.db").Length
    Write-Host "OK Database exists (Size: $dbSize bytes)" -ForegroundColor Green
} else {
    Write-Host "WARN Database will be created on first run" -ForegroundColor Yellow
}

# 5. Check node_modules
Write-Host "[5/8] Checking node_modules..." -ForegroundColor Yellow
if (Test-Path "backend\node_modules") {
    Write-Host "OK node_modules exists" -ForegroundColor Green
} else {
    Write-Host "WARN node_modules not found - run: cd backend; npm install" -ForegroundColor Yellow
}

# 6. Check Flutter API service
Write-Host "[6/8] Checking Flutter integration..." -ForegroundColor Yellow
if (Test-Path "lib\backend\services\api_service.dart") {
    Write-Host "OK api_service.dart exists" -ForegroundColor Green
    
    # Check for API integration in main.dart
    $mainContent = Get-Content "lib\main.dart" -Raw
    if ($mainContent -match "import.*api_service\.dart") {
        Write-Host "OK ApiService imported in main.dart" -ForegroundColor Green
    } else {
        Write-Host "FAIL ApiService NOT imported in main.dart" -ForegroundColor Red
        $allPassed = $false
    }
    
    if ($mainContent -match "ApiService\.register") {
        Write-Host "OK Registration integrated with backend" -ForegroundColor Green
    } else {
        Write-Host "FAIL Registration NOT integrated" -ForegroundColor Red
        $allPassed = $false
    }
    
    if ($mainContent -match "ApiService\.login") {
        Write-Host "OK Login integrated with backend" -ForegroundColor Green
    } else {
        Write-Host "FAIL Login NOT integrated" -ForegroundColor Red
        $allPassed = $false
    }
    
    if ($mainContent -match "ApiService\.saveProgress") {
        Write-Host "OK Progress tracking integrated with backend" -ForegroundColor Green
    } else {
        Write-Host "FAIL Progress tracking NOT integrated" -ForegroundColor Red
        $allPassed = $false
    }
} else {
    Write-Host "FAIL api_service.dart NOT FOUND" -ForegroundColor Red
    $allPassed = $false
}

# 7. Check APK
Write-Host "[7/8] Checking APK..." -ForegroundColor Yellow
if (Test-Path "build\app\outputs\flutter-apk\app-release.apk") {
    $apkSize = (Get-Item "build\app\outputs\flutter-apk\app-release.apk").Length / 1MB
    Write-Host "OK APK exists (Size: $([math]::Round($apkSize, 1)) MB)" -ForegroundColor Green
} else {
    Write-Host "WARN APK not found - run: flutter build apk --release" -ForegroundColor Yellow
}

# 8. Check network configuration
Write-Host "[8/8] Checking network configuration..." -ForegroundColor Yellow
$apiContent = Get-Content "lib\backend\services\api_service.dart" -Raw
if ($apiContent -match "192\.168\.\d+\.\d+") {
    $configuredIP = $matches[0]
    Write-Host "OK API configured for IP: $configuredIP" -ForegroundColor Green
} else {
    Write-Host "FAIL Could not find IP configuration" -ForegroundColor Red
    $allPassed = $false
}

Write-Host ""
Write-Host "Current computer IP addresses:" -ForegroundColor Cyan
Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -notlike "127.*"} | Select-Object IPAddress, InterfaceAlias | Format-Table

# Summary
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host ""

if ($allPassed) {
    Write-Host "ALL CHECKS PASSED!" -ForegroundColor Green
    Write-Host ""
    Write-Host "READY TO TEST!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "  1. Start backend: cd backend; npm start" -ForegroundColor White
    Write-Host "  2. Install APK on phone" -ForegroundColor White
    Write-Host "  3. Test registration, login, and progress sync" -ForegroundColor White
} else {
    Write-Host "SOME CHECKS FAILED!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please fix the issues above before testing." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "===============================================================" -ForegroundColor Cyan
