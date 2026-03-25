import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

function getPoolConfig() {
  const url = process.env.DATABASE_URL;
  
  if (url) {
    return { connectionString: url };
  }
  
  return {
    host: process.env.PGHOST || '127.0.0.1',
    port: parseInt(process.env.PGPORT || '5432'),
    user: process.env.PGUSER || 'marciocristiano',
    password: process.env.PGPASSWORD || '',
    database: process.env.PGDATABASE || 'tarjadoc',
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
