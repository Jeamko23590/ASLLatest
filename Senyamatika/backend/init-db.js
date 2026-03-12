// Database initialization script
// Run this after deploying to create tables
const { initDatabase } = require('./config/database');

console.log('🔄 Initializing database...');

initDatabase()
  .then(() => {
    console.log('✅ Database initialized successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  });
