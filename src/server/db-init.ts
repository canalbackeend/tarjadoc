import { query } from './db';
import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';

export async function initDatabaseAuto() {
  console.log('🔧 Verificando banco de dados...');
  
  try {
    const sql = fs.readFileSync(path.join(process.cwd(), 'scripts', 'sql', 'init.sql'), 'utf-8');
    const statements = sql.split(';').filter(s => s.trim() && !s.trim().startsWith('--'));
    
    for (const statement of statements) {
      if (statement.trim() && !statement.trim().startsWith('CREATE EXTENSION')) {
        try {
          await query(statement + ';');
          console.log('  ✅ Created:', statement.substring(0, 50).replace(/\s+/g, ' '));
        } catch (e: any) {
          if (e.code !== '42P07') { // table already exists
            console.log('  ⚠️ Error:', e.message?.substring(0, 80));
          }
        }
      }
    }

    // Create extension separately
    try {
      await query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    } catch (e) {
      // ignore
    }
    
    console.log('✅ Tabelas verificadas/criadas');

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@tarjadoc.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(adminPassword, salt);

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

    console.log('🚀 Banco de dados pronto!');
    return true;
  } catch (error) {
    console.error('❌ Erro ao inicializar banco:', error);
    return false;
  }
}
