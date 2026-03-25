import { Router } from 'express';
import { 
  findUserByEmail, 
  createUser, 
  hashPassword, 
  verifyPassword, 
  generateToken,
  verifyToken,
  findUserByUid,
  syncStripeSubscription
} from '../auth';

const router = Router();

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Email inválido' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Senha deve ter pelo menos 6 caracteres' });
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    const passwordHash = await hashPassword(password);
    const user = await createUser(email, passwordHash, name);

    const token = generateToken(user);

    res.json({
      token,
      user: {
        uid: user.uid,
        email: user.email,
        name: user.name,
        isPro: user.is_pro,
        proSource: user.pro_source,
        proSince: user.pro_since,
        createdAt: user.created_at
      }
    });
  } catch (error: any) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Erro ao criar conta' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Email inválido' });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }

    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }

    const userWithStripe = await syncStripeSubscription(user);

    const token = generateToken(userWithStripe);

    res.json({
      token,
      user: {
        uid: userWithStripe.uid,
        email: userWithStripe.email,
        name: userWithStripe.name,
        isPro: userWithStripe.is_pro,
        proSource: userWithStripe.pro_source,
        proSince: userWithStripe.pro_since,
        createdAt: userWithStripe.created_at
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
});

router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    console.log('Decoded token:', decoded);

    const user = await findUserByUid(decoded.uid);
    if (!user) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    res.json({
      user: {
        uid: user.uid,
        email: user.email,
        name: user.name,
        isPro: user.is_pro,
        proSource: user.pro_source,
        proSince: user.pro_since,
        createdAt: user.created_at
      }
    });
  } catch (error: any) {
    console.error('Me error:', error);
    res.status(401).json({ error: 'Token inválido' });
  }
});

router.post('/logout', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = verifyToken(token);
      console.log(`[LOGOUT] User ${decoded.email} logged out. IP: ${req.ip}`);
    }
    res.json({ message: 'Logout realizado com sucesso' });
  } catch (error) {
    res.json({ message: 'Logout realizado com sucesso' });
  }
});

export default router;
