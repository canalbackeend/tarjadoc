import { Router } from 'express';
import { 
  findAdminByEmail,
  findAdminById,
  verifyPassword,
  generateAdminToken,
  verifyToken,
  getAllUsers,
  findUserByEmail,
  findUserByUid,
  updateUserProStatus,
  hashPassword,
  createAdmin,
  getAllAdmins,
  updateAdminPassword
} from '../auth';

const router = Router();

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    const admin = await findAdminByEmail(email);
    console.log('Admin found:', admin);
    if (!admin) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const isValid = await verifyPassword(password, admin.password_hash);
    console.log('Password valid:', isValid);
    if (!isValid) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = generateAdminToken(admin);

    res.json({
      token,
      admin: {
        email: admin.email,
        createdAt: admin.created_at
      }
    });
  } catch (error: any) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
});

router.use((req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  const token = authHeader.substring(7);
  try {
    const decoded = verifyToken(token);
    if (!decoded.is_admin) {
      return res.status(403).json({ error: 'Acesso negado' });
    }
    req.body.adminEmail = decoded.email;
    req.body.adminId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
});

router.get('/me', async (req, res) => {
  try {
    const adminId = req.body.adminId;
    const admin = await findAdminById(adminId);
    if (!admin) {
      return res.status(404).json({ error: 'Administrador não encontrado' });
    }
    res.json({
      admin: {
        id: admin.id,
        email: admin.email,
        createdAt: admin.created_at
      }
    });
  } catch (error: any) {
    console.error('Get admin error:', error);
    res.status(500).json({ error: 'Erro ao buscar administrador' });
  }
});

router.get('/users', async (req, res) => {
  try {
    const users = await getAllUsers();
    res.json({
      users: users.map(u => ({
        id: u.id,
        uid: u.uid,
        email: u.email,
        name: u.name,
        isPro: u.is_pro,
        proSource: u.pro_source,
        proSince: u.pro_since,
        grantedBy: u.granted_by,
        createdAt: u.created_at
      }))
    });
  } catch (error: any) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
});

router.post('/grant-pro', async (req, res) => {
  try {
    const { email } = req.body;
    const adminEmail = req.body.adminEmail;

    if (!email) {
      return res.status(400).json({ error: 'Email é obrigatório' });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    await updateUserProStatus(user.id, true, 'manual', adminEmail);

    res.json({ message: 'Acesso PRO concedido com sucesso' });
  } catch (error: any) {
    console.error('Grant pro error:', error);
    res.status(500).json({ error: 'Erro ao conceder acesso PRO' });
  }
});

router.post('/revoke-pro', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email é obrigatório' });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    await updateUserProStatus(user.id, false, null);

    res.json({ message: 'Acesso PRO revogado com sucesso' });
  } catch (error: any) {
    console.error('Revoke pro error:', error);
    res.status(500).json({ error: 'Erro ao revogar acesso PRO' });
  }
});

router.get('/admins', async (req, res) => {
  try {
    const admins = await getAllAdmins();
    res.json({
      admins: admins.map(a => ({
        id: a.id,
        email: a.email,
        createdAt: a.created_at
      }))
    });
  } catch (error: any) {
    console.error('Get admins error:', error);
    res.status(500).json({ error: 'Erro ao buscar administradores' });
  }
});

router.post('/create-admin', async (req, res) => {
  try {
    const { email, password } = req.body;
    const adminEmail = req.body.adminEmail;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Senha deve ter pelo menos 6 caracteres' });
    }

    const existingAdmin = await findAdminByEmail(email);
    if (existingAdmin) {
      return res.status(400).json({ error: 'Administrador já existe' });
    }

    const passwordHash = await hashPassword(password);
    const newAdmin = await createAdmin(email, passwordHash);

    res.json({
      message: 'Administrador criado com sucesso',
      admin: {
        id: newAdmin.id,
        email: newAdmin.email,
        createdAt: newAdmin.created_at
      }
    });
  } catch (error: any) {
    console.error('Create admin error:', error);
    res.status(500).json({ error: 'Erro ao criar administrador' });
  }
});

router.post('/change-password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const adminEmail = req.body.adminEmail;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Senha atual e nova senha são obrigatórias' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Nova senha deve ter pelo menos 6 caracteres' });
    }

    const admin = await findAdminByEmail(adminEmail);
    if (!admin) {
      return res.status(404).json({ error: 'Administrador não encontrado' });
    }

    const isValid = await verifyPassword(currentPassword, admin.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Senha atual incorreta' });
    }

    const newPasswordHash = await hashPassword(newPassword);
    await updateAdminPassword(admin.id, newPasswordHash);

    res.json({ message: 'Senha alterada com sucesso' });
  } catch (error: any) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Erro ao alterar senha' });
  }
});

export default router;
