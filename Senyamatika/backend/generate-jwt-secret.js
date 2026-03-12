// Quick script to generate a secure JWT secret
const crypto = require('crypto');

console.log('\n========================================');
console.log('JWT Secret Generator');
console.log('========================================\n');

const secret = crypto.randomBytes(32).toString('hex');

console.log('Your secure JWT secret:');
console.log('');
console.log(secret);
console.log('');
console.log('Copy this to your .env file:');
console.log(`JWT_SECRET=${secret}`);
console.log('');
console.log('========================================\n');
