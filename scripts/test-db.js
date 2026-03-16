
require('dotenv').config({ path: '.env.local' });
const { sql } = require('@neondatabase/serverless');

async function testConnection() {
  console.log('Attempting to connect to the database...');
  console.log('Using DATABASE_URL:', process.env.DATABASE_URL ? 'Found' : 'NOT FOUND');

  if (!process.env.DATABASE_URL) {
    console.error('FATAL: DATABASE_URL is not defined in your .env.local file.');
    return;
  }

  try {
    const result = await sql.query(`SELECT NOW()`);
    console.log('✅ SUCCESS: Database connection is working.');
    console.log('Current database time:', result[0].now);
  } catch (error) {
    console.error('❌ FAILED: Could not connect to the database.');
    console.error('Error details:', error);
  }
}

testConnection();
