import pg from 'pg';

const { Pool } = pg;

console.log('🔧 Checking environment variables...');
const envKeys = Object.keys(process.env).filter(k => k.includes('DATABASE') || k.includes('PG') || k.includes('POSTGRES'));
console.log('📋 Database-related vars:', envKeys);

console.log('🔗 DATABASE_URL:', process.env.DATABASE_URL ? 'SET (' + process.env.DATABASE_URL.substring(0, 30) + '...)' : 'NOT SET');

function getPoolConfig() {
  const url = process.env.DATABASE_URL;
  
  if (url) {
    console.log('✅ Using DATABASE_URL from environment');
    return { connectionString: url, ssl: { rejectUnauthorized: false } };
  }
  
  console.log('⚠️  DATABASE_URL not found, using default config');
  console.log('📋 Fallback - PGHOST:', process.env.PGHOST || 'localhost');
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
