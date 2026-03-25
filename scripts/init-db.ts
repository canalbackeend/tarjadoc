import pg from 'pg';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

dotenv.config();

const { Pool } = pg;

async function initDatabase() {
  console.log('Inicializando banco de dados tarjaDOC...\n');

  const pool = new Pool({
    host: '127.0.0.1',
    port: 5432,
    user: 'marciocristiano',
    database: 'postgres',
  });

  try {
    const client = await pool.connect();

    const checkDb = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = 'tarjadoc'"
    );
    
    if (checkDb.rows.length === 0) {
      await client.query('CREATE DATABASE tarjadoc');
      console.log('✓ Banco de dados criado');
    }
    
    client.release();
    await pool.end();

    const appPool = new Pool({
      host: '127.0.0.1',
      port: 5432,
      user: 'marciocristiano',
      database: 'tarjadoc',
    });

    const appClient = await appPool.connect();

    const sql = readFileSync(path.join(process.cwd(), 'scripts', 'sql', 'init.sql'), 'utf-8');
    await appClient.query(sql);
    console.log('✓ Tabelas criadas com sucesso');

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@tarjadoc.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(adminPassword, salt);

    const existingAdmin = await appClient.query(
      'SELECT * FROM admins WHERE email = $1',
      [adminEmail]
    );

    if (existingAdmin.rows.length === 0) {
      await appClient.query(
        'INSERT INTO admins (email, password_hash) VALUES ($1, $2)',
        [adminEmail, passwordHash]
      );
      console.log(`✓ Admin criado: ${adminEmail}`);
      console.log(`  Senha: ${adminPassword}\n`);
    } else {
      console.log(`✓ Admin já existe: ${adminEmail}\n`);
    }

    appClient.release();
    await appPool.end();

    console.log('Banco de dados inicializado com sucesso!');
  } catch (error) {
    console.error('Erro ao inicializar banco de dados:', error);
  }
}

initDatabase();
