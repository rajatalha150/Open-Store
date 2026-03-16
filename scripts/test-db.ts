
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { sql } from '../lib/db-pool';

async function testConnection() {
  console.log('Attempting to connect to the database...');
  if (!process.env.DATABASE_URL) {
    console.error('FATAL: DATABASE_URL is not defined.');
    return;
  }
  console.log('DATABASE_URL found.');

  try {
    const result = await sql`SELECT NOW()`;
    console.log('✅ SUCCESS: Database connection is working.');
    console.log('Current database time:', result[0].now);
  } catch (error) {
    console.error('❌ FAILED: Could not connect to the database.');
    console.error('Error details:', error);
  }
}

testConnection();
