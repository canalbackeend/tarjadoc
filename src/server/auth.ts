import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'tarjadoc-secret-change-in-production';

export interface User {
  id: number;
  uid: string;
  email: string;
  password_hash?: string;
  name: string | null;
  is_pro: boolean;
  pro_source: string | null;
  stripe_customer_id: string | null;
  pro_since: Date | null;
  granted_by: string | null;
  created_at: Date;
}

export interface Admin {
  id: number;
  email: string;
  password_hash: string;
  created_at: Date;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(user: { id: number; uid: string; email: string; is_pro: boolean }): string {
  return jwt.sign(
    { id: user.id, uid: user.uid, email: user.email, is_pro: user.is_pro },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function generateAdminToken(admin: { id: number; email: string }): string {
  return jwt.sign(
    { id: admin.id, email: admin.email, is_admin: true },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token: string): any {
  return jwt.verify(token, JWT_SECRET);
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const result = await query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0] || null;
}

export async function findUserByUid(uid: string): Promise<User | null> {
  const result = await query('SELECT * FROM users WHERE uid = $1', [uid]);
  return result.rows[0] || null;
}

export async function findUserById(id: number): Promise<User | null> {
  const result = await query('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows[0] || null;
}

export async function createUser(email: string, passwordHash: string, name?: string): Promise<User> {
  const result = await query(
    'INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING *',
    [email, passwordHash, name || null]
  );
  return result.rows[0];
}

export async function updateUserProStatus(
  userId: number,
  isPro: boolean,
  source: string,
  grantedBy?: string
): Promise<void> {
  await query(
    `UPDATE users SET 
      is_pro = $1, 
      pro_source = $2, 
      pro_since = $3,
      granted_by = $4
    WHERE id = $5`,
    [isPro, source, isPro ? new Date() : null, grantedBy || null, userId]
  );
}

export async function findAdminByEmail(email: string): Promise<Admin | null> {
  const result = await query('SELECT * FROM admins WHERE email = $1', [email]);
  return result.rows[0] || null;
}

export async function findAdminById(id: number): Promise<Admin | null> {
  const result = await query('SELECT * FROM admins WHERE id = $1', [id]);
  return result.rows[0] || null;
}

export async function getAllUsers(): Promise<User[]> {
  const result = await query('SELECT * FROM users ORDER BY created_at DESC');
  return result.rows;
}

export async function createAdmin(email: string, passwordHash: string): Promise<Admin> {
  const result = await query(
    'INSERT INTO admins (email, password_hash) VALUES ($1, $2) RETURNING *',
    [email, passwordHash]
  );
  return result.rows[0];
}

export async function getAllAdmins(): Promise<Admin[]> {
  const result = await query('SELECT id, email, created_at FROM admins ORDER BY created_at DESC');
  return result.rows;
}

export async function updateAdminPassword(adminId: number, passwordHash: string): Promise<void> {
  await query('UPDATE admins SET password_hash = $1 WHERE id = $2', [passwordHash, adminId]);
}

export async function findUserByStripeCustomerId(stripeCustomerId: string): Promise<User | null> {
  const result = await query('SELECT * FROM users WHERE stripe_customer_id = $1', [stripeCustomerId]);
  return result.rows[0] || null;
}

export async function updateUserStripeCustomerId(userId: number, customerId: string): Promise<void> {
  await query('UPDATE users SET stripe_customer_id = $1 WHERE id = $2', [customerId, userId]);
}

export async function syncStripeSubscription(user: User): Promise<User> {
  if (!user.stripe_customer_id) {
    return user;
  }

  try {
    const Stripe = await import('stripe');
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) return user;

    const stripe = new Stripe.default(stripeKey);
    
    const subscriptions = await stripe.subscriptions.list({
      customer: user.stripe_customer_id,
      status: 'active',
      limit: 1
    });

    const hasActiveSubscription = subscriptions.data.length > 0;

    if (hasActiveSubscription && !user.is_pro) {
      await query(
        'UPDATE users SET is_pro = true, pro_source = $1, pro_since = NOW() WHERE id = $2',
        ['stripe', user.id]
      );
      return { ...user, is_pro: true, pro_source: 'stripe', pro_since: new Date() };
    } else if (!hasActiveSubscription && user.is_pro && user.pro_source === 'stripe') {
      await query(
        'UPDATE users SET is_pro = false, pro_source = NULL, pro_since = NULL WHERE id = $1',
        [user.id]
      );
      return { ...user, is_pro: false, pro_source: null, pro_since: null };
    }
  } catch (error) {
    console.error('Error syncing Stripe subscription:', error);
  }

  return user;
}
