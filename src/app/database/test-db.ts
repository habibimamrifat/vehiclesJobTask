import db from './knex.js';

async function testConnection(): Promise<void> {
  try {
    await db.raw('SELECT 1');
    console.log('PostgreSQL connected successfully');
  } catch (error) {
    console.error('PostgreSQL connection failed:', error);
  } finally {
    await db.destroy();
  }
}

testConnection();