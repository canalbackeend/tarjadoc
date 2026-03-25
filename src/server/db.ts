import pg from 'pg';

const { Pool } = pg;

console.log('🔧 Initializing database connection...');
console.log('📋 Environment variables:');
console.log('  DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
console.log('  PGHOST:', process.env.PGHOST || 'NOT SET');
console.log('  PGPORT:', process.env.PGPORT || 'NOT SET');
console.log('  PGUSER:', process.env.PGUSER || 'NOT SET');
console.log('  PGDATABASE:', process.env.PGDATABASE || 'NOT SET');

function getPoolConfig() {
  const url = process.env.DATABASE_URL;
  
  if (url) {
    console.log('🔗 Using DATABASE_URL from environment');
    return { connectionString: url, ssl: { rejectUnauthorized: false } };
  }
  
  console.log('⚠️  DATABASE_URL not found, using individual config');
  return {
    host: process.env.PGHOST || 'localhost',
    port: parseInt(process.env.PGPORT || '5432'),
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || '',
    database: process.env.PGDATABASE || 'tarjadoc',
    ssl: { rejectUnauthorized: false }
  };
}

export const pool = new Pool(getPoolConfig());

export async function query(text: string, params?: any[]) {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}

export async function getClient() {
  return pool.connect();
}
