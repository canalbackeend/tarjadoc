import { query } from './db';
import bcrypt from 'bcrypt';

export async function initDatabaseAuto() {
  console.log('🔧 Verificando banco de dados...');
  
  try {
    // Create extension
    try {
      await query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    } catch (e) {}
    
    // Create users table
    try {
      await query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          uid UUID DEFAULT gen_random_uuid(),
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          name VARCHAR(255),
          is_pro BOOLEAN DEFAULT false,
          pro_source VARCHAR(20),
          stripe_customer_id VARCHAR(255),
          pro_since TIMESTAMP,
          granted_by VARCHAR(255),
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);
      console.log('✅ Tabela users criada');
    } catch (e: any) {
      console.log('⚠️ users:', e.message?.substring(0, 50));
    }
    
    // Create admins table
    try {
      await query(`
        CREATE TABLE IF NOT EXISTS admins (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);
      console.log('✅ Tabela admins criada');
    } catch (e: any) {
      console.log('⚠️ admins:', e.message?.substring(0, 50));
    }
    
    // Create password_resets table
    try {
      await query(`
        CREATE TABLE IF NOT EXISTS password_resets (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) NOT NULL,
          token VARCHAR(255) NOT NULL,
          used BOOLEAN DEFAULT false,
          expires_at TIMESTAMP NOT NULL,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);
      console.log('✅ Tabela password_resets criada');
    } catch (e: any) {
      console.log('⚠️ password_resets:', e.message?.substring(0, 50));
    }
    
    // Create indexes
    try {
      await query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
      await query('CREATE INDEX IF NOT EXISTS idx_users_uid ON users(uid)');
      await query('CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email)');
      console.log('✅ Índices criados');
    } catch (e) {}
    
    console.log('✅ Tabelas verificadas/criadas');

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@tarjadoc.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(adminPassword, salt);

    try {
      const existingAdmin = await query('SELECT * FROM admins WHERE email = $1', [adminEmail]);
      
      if (existingAdmin.rows.length === 0) {
        await query(
          'INSERT INTO admins (email, password_hash) VALUES ($1, $2)',
          [adminEmail, passwordHash]
        );
        console.log(`✅ Admin criado: ${adminEmail}`);
        console.log(`   Senha: ${adminPassword}`);
      } else {
        console.log(`ℹ️  Admin já existe: ${adminEmail}`);
      }
    } catch (e: any) {
      console.log('⚠️ Erro ao criar admin:', e.message?.substring(0, 50));
    }

    console.log('🚀 Banco de dados pronto!');
    return true;
  } catch (error) {
    console.error('❌ Erro ao inicializar banco:', error);
    return false;
  }
}
