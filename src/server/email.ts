import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.hostinger.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
});

export async function sendPasswordResetEmail(email: string, resetToken: string) {
  const resetUrl = `${process.env.APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

  const mailOptions = {
    from: process.env.SMTP_FROM || '"TarjaDOC" <noreply@tarjadoc.beend.tech>',
    to: email,
    subject: 'Recuperação de Senha - TarjaDOC',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; background-color: #f1f5f9; padding: 20px; }
            .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 12px; padding: 30px; }
            .logo { text-align: center; margin-bottom: 20px; }
            .logo span { color: #059669; font-weight: bold; font-size: 24px; }
            h1 { color: #1e293b; text-align: center; margin-bottom: 20px; }
            p { color: #475569; line-height: 1.6; }
            .button { display: inline-block; background: #059669; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #94a3b8; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">
              <span>TarjaDOC</span>
            </div>
            <h1>Recuperação de Senha</h1>
            <p>Você solicitou a recuperação de senha da sua conta TarjaDOC.</p>
            <p>Clique no botão abaixo para criar uma nova senha:</p>
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Alterar Senha</a>
            </div>
            <p>Ou copie e cole este link no seu navegador:</p>
            <p style="word-break: break-all; font-size: 12px; color: #64748b;">${resetUrl}</p>
            <p>Este link expira em 1 hora.</p>
            <p>Se você não solicitou esta recuperação, ignore este email.</p>
            <div class="footer">
              <p>© 2026 TarjaDOC - Todos os direitos reservados</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`[EMAIL] Password reset email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('[EMAIL] Error sending email:', error);
    return false;
  }
}
