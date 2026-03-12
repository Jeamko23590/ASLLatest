// Pre-deployment verification script
const fs = require('fs');
const path = require('path');

console.log('🔍 Running pre-deployment checks...\n');

let errors = [];
let warnings = [];
let passed = 0;

// Check 1: Required files exist
console.log('📁 Checking file structure...');
const requiredFiles = [
  'server.js',
  'package.json',
  '.env.example',
  'config/database.js',
  'middleware/auth.js',
  'routes/auth.js',
  'routes/users.js',
  'routes/progress.js',
  'routes/admin.js'
];

requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`  ✅ ${file}`);
    passed++;
  } else {
    console.log(`  ❌ ${file} - MISSING`);
    errors.push(`Missing file: ${file}`);
  }
});

// Check 2: package.json dependencies
console.log('\n📦 Checking dependencies...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const requiredDeps = [
    'express',
    'pg',
    'bcryptjs',
    'jsonwebtoken',
    'cors',
    'dotenv',
    'express-validator'
  ];
  
  requiredDeps.forEach(dep => {
    if (packageJson.dependencies[dep]) {
      console.log(`  ✅ ${dep}`);
      passed++;
    } else {
      console.log(`  ❌ ${dep} - MISSING`);
      errors.push(`Missing dependency: ${dep}`);
    }
  });
} catch (error) {
  console.log('  ❌ Error reading package.json');
  errors.push('Cannot read package.json');
}

// Check 3: .env.example has required variables
console.log('\n🔐 Checking environment variables template...');
try {
  const envExample = fs.readFileSync('.env.example', 'utf8');
  const requiredVars = [
    'DATABASE_URL',
    'JWT_SECRET',
    'PORT',
    'NODE_ENV',
    'ALLOWED_ORIGINS'
  ];
  
  requiredVars.forEach(varName => {
    if (envExample.includes(varName)) {
      console.log(`  ✅ ${varName}`);
      passed++;
    } else {
      console.log(`  ❌ ${varName} - MISSING`);
      errors.push(`Missing env var in .env.example: ${varName}`);
    }
  });
} catch (error) {
  console.log('  ❌ Error reading .env.example');
  errors.push('Cannot read .env.example');
}

// Check 4: Verify server.js structure
console.log('\n🖥️  Checking server.js...');
try {
  const serverJs = fs.readFileSync('server.js', 'utf8');
  
  const checks = [
    { name: 'Express import', pattern: /require\(['"]express['"]\)/ },
    { name: 'Database init', pattern: /initDatabase/ },
    { name: 'Routes setup', pattern: /app\.use\(['"]\/api/ },
    { name: 'Health endpoint', pattern: /\/health/ },
    { name: 'Error handling', pattern: /app\.use\(\(err/ }
  ];
  
  checks.forEach(check => {
    if (check.pattern.test(serverJs)) {
      console.log(`  ✅ ${check.name}`);
      passed++;
    } else {
      console.log(`  ❌ ${check.name} - MISSING`);
      errors.push(`Server.js missing: ${check.name}`);
    }
  });
} catch (error) {
  console.log('  ❌ Error reading server.js');
  errors.push('Cannot read server.js');
}

// Check 5: Verify database.js
console.log('\n🗄️  Checking database.js...');
try {
  const databaseJs = fs.readFileSync('config/database.js', 'utf8');
  
  const checks = [
    { name: 'Pool creation', pattern: /new Pool/ },
    { name: 'Query function', pattern: /const query = / },
    { name: 'initDatabase function', pattern: /const initDatabase = / },
    { name: 'Users table', pattern: /CREATE TABLE IF NOT EXISTS users/ },
    { name: 'Progress table', pattern: /CREATE TABLE IF NOT EXISTS user_progress/ },
    { name: 'Admins table', pattern: /CREATE TABLE IF NOT EXISTS admins/ }
  ];
  
  checks.forEach(check => {
    if (check.pattern.test(databaseJs)) {
      console.log(`  ✅ ${check.name}`);
      passed++;
    } else {
      console.log(`  ❌ ${check.name} - MISSING`);
      errors.push(`Database.js missing: ${check.name}`);
    }
  });
} catch (error) {
  console.log('  ❌ Error reading database.js');
  errors.push('Cannot read database.js');
}

// Check 6: Verify routes
console.log('\n🛣️  Checking routes...');
const routes = ['auth', 'users', 'progress', 'admin'];
routes.forEach(route => {
  try {
    const routeFile = fs.readFileSync(`routes/${route}.js`, 'utf8');
    if (routeFile.includes('router.') && routeFile.includes('module.exports')) {
      console.log(`  ✅ ${route}.js`);
      passed++;
    } else {
      console.log(`  ⚠️  ${route}.js - Structure issue`);
      warnings.push(`${route}.js may have structure issues`);
    }
  } catch (error) {
    console.log(`  ❌ ${route}.js - ERROR`);
    errors.push(`Cannot read routes/${route}.js`);
  }
});

// Check 7: Verify middleware
console.log('\n🔒 Checking middleware...');
try {
  const authMiddleware = fs.readFileSync('middleware/auth.js', 'utf8');
  
  const checks = [
    { name: 'authenticateToken', pattern: /authenticateToken/ },
    { name: 'isAdmin', pattern: /isAdmin/ },
    { name: 'JWT verify', pattern: /jwt\.verify/ }
  ];
  
  checks.forEach(check => {
    if (check.pattern.test(authMiddleware)) {
      console.log(`  ✅ ${check.name}`);
      passed++;
    } else {
      console.log(`  ❌ ${check.name} - MISSING`);
      errors.push(`Middleware missing: ${check.name}`);
    }
  });
} catch (error) {
  console.log('  ❌ Error reading middleware/auth.js');
  errors.push('Cannot read middleware/auth.js');
}

// Check 8: node_modules
console.log('\n📚 Checking installation...');
if (fs.existsSync('node_modules')) {
  console.log('  ✅ node_modules exists');
  passed++;
} else {
  console.log('  ⚠️  node_modules not found - Run npm install');
  warnings.push('Dependencies not installed - run npm install');
}

// Check 9: .env file
console.log('\n⚙️  Checking configuration...');
if (fs.existsSync('.env')) {
  console.log('  ✅ .env file exists');
  passed++;
} else {
  console.log('  ⚠️  .env file not found - Create from .env.example');
  warnings.push('.env file not created - copy from .env.example');
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('📊 VERIFICATION SUMMARY');
console.log('='.repeat(50));
console.log(`✅ Passed: ${passed}`);
console.log(`⚠️  Warnings: ${warnings.length}`);
console.log(`❌ Errors: ${errors.length}`);

if (warnings.length > 0) {
  console.log('\n⚠️  WARNINGS:');
  warnings.forEach((w, i) => console.log(`  ${i + 1}. ${w}`));
}

if (errors.length > 0) {
  console.log('\n❌ ERRORS:');
  errors.forEach((e, i) => console.log(`  ${i + 1}. ${e}`));
  console.log('\n🚫 DEPLOYMENT BLOCKED - Fix errors before deploying');
  process.exit(1);
} else if (warnings.length > 0) {
  console.log('\n⚠️  You can deploy, but address warnings for best results');
  console.log('🟡 CONDITIONAL GREEN LIGHT');
  process.exit(0);
} else {
  console.log('\n✅ ALL CHECKS PASSED!');
  console.log('🟢 GREEN LIGHT TO DEPLOY! 🚀');
  process.exit(0);
}
