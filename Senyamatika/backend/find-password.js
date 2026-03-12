// Script to test common PostgreSQL passwords
const { Pool } = require('pg');

const commonPasswords = [
  '',           // Empty password
  'postgres',   // Default
  'admin',      // Common
  'root',       // Common
  'password',   // Common
  '123456',     // Common
  'postgres123' // Common
];

console.log('\n========================================');
console.log('PostgreSQL Password Finder');
console.log('========================================\n');
console.log('Testing common passwords...\n');

let found = false;
let tested = 0;

async function testPassword(password) {
  const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres', // Connect to default database
    password: password,
    port: 5432,
  });

  try {
    await pool.query('SELECT 1');
    return true;
  } catch (err) {
    return false;
  } finally {
    await pool.end();
  }
}

async function findPassword() {
  for (const password of commonPasswords) {
    tested++;
    const displayPassword = password === '' ? '(empty)' : password;
    process.stdout.write(`Testing: ${displayPassword}...`);
    
    const works = await testPassword(password);
    
    if (works) {
      console.log(' ✅ SUCCESS!\n');
      console.log('========================================');
      console.log('Found working password!');
      console.log('========================================\n');
      console.log('Update your .env file with:');
      console.log(`DB_PASSWORD=${password}\n`);
      console.log('Then run: npm start\n');
      found = true;
      return;
    } else {
      console.log(' ❌');
    }
  }

  if (!found) {
    console.log('\n========================================');
    console.log('No common password worked');
    console.log('========================================\n');
    console.log('You need to reset your PostgreSQL password.');
    console.log('See: backend/reset-postgres-password.md\n');
    console.log('Or try connecting with pgAdmin 4 to find the password.\n');
  }
}

findPassword().catch(err => {
  console.error('\n❌ Error:', err.message);
  console.log('\nMake sure PostgreSQL is installed and running.\n');
  process.exit(1);
});
