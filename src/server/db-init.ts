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
      if (statement.trim()) {
        try {
          await query(statement + ';');
        } catch (e) {
          // Ignora erros de tabelas já existentes
        }
      }
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
