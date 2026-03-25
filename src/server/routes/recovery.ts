import { Router } from 'express';
import crypto from 'crypto';
import { query } from '../db';
import { sendPasswordResetEmail } from '../email';

const router = Router();

function generateResetToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email é obrigatório' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Email inválido' });
    }

    const userResult = await query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (userResult.rows.length > 0) {
      const resetToken = generateResetToken();
      const expiresAt = new Date(Date.now() + 3600000);
      
      await query(
        'INSERT INTO password_resets (email, token, expires_at) VALUES ($1, $2, $3)',
        [email, resetToken, expiresAt]
      );

      await sendPasswordResetEmail(email, resetToken);
    }

    res.json({ 
      message: 'Se o email estiver cadastrado, você receberá instruções para redefinir sua senha.' 
    });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Erro ao processar solicitação' });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;

    if (!email || !token || !newPassword) {
      return res.status(400).json({ error: 'Email, token e nova senha são obrigatórios' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Senha deve ter pelo menos 6 caracteres' });
    }

    const resetResult = await query(
      'SELECT * FROM password_resets WHERE email = $1 AND token = $2 AND used = false AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
      [email, token]
    );

    if (resetResult.rows.length === 0) {
      return res.status(400).json({ error: 'Token inválido ou expirado' });
    }

    const bcrypt = await import('bcrypt');
    const passwordHash = await bcrypt.hash(newPassword, 10);

    await query('UPDATE users SET password_hash = $1 WHERE email = $2', [passwordHash, email]);
    await query('UPDATE password_resets SET used = true WHERE email = $1 AND token = $2', [email, token]);

    console.log(`[PASSWORD RESET] Password updated for ${email}`);

    res.json({ message: 'Senha alterada com sucesso' });
  } catch (error: any) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Erro ao redefinir senha' });
  }
});

export default router;
