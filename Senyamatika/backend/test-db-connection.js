// Simple script to test PostgreSQL connection
require('dotenv').config();
const { Pool } = require('pg');

console.log('\n========================================');
console.log('Testing PostgreSQL Connection');
console.log('========================================\n');

// Show what we're trying to connect to (hide password)
if (process.env.DATABASE_URL) {
  const url = process.env.DATABASE_URL.replace(/:([^@]+)@/, ':****@');
  console.log('Using DATABASE_URL:', url);
} else {
  console.log('Using individual parameters:');
  console.log('  DB_USER:', process.env.DB_USER || 'postgres');
  console.log('  DB_HOST:', process.env.DB_HOST || 'localhost');
  console.log('  DB_PORT:', process.env.DB_PORT || '5432');
  console.log('  DB_NAME:', process.env.DB_NAME || 'senyamatika');
  console.log('  DB_PASSWORD:', process.env.DB_PASSWORD ? '****' : 'NOT SET');
}

console.log('\nAttempting connection...\n');

// Create pool with same logic as database.js
const poolConfig = process.env.DATABASE_URL 
  ? { connectionString: process.env.DATABASE_URL }
  : {
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'senyamatika',
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT || 5432,
    };

const pool = new Pool(poolConfig);

// Test connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.log('❌ Connection FAILED!\n');
    console.log('Error:', err.message);
    console.log('\nCommon fixes:');
    console.log('1. Check your password in .env file');
    console.log('2. Make sure PostgreSQL is running');
    console.log('3. Verify database "senyamatika" exists');
    console.log('4. Try using individual DB_* parameters instead of DATABASE_URL');
    console.log('\nSee backend/TROUBLESHOOTING.md for detailed help\n');
    process.exit(1);
  } else {
    console.log('✅ Connection SUCCESSFUL!\n');
    console.log('Server time:', res.rows[0].now);
    console.log('\nYour database connection is working correctly!');
    console.log('You can now run: npm start\n');
    process.exit(0);
  }
});

// Handle connection errors
pool.on('error', (err) => {
  console.error('❌ Unexpected error:', err);
  process.exit(1);
});
