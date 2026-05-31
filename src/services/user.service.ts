// ─────────────────────────────────────────────────────────────────────────────
//  user.service.ts  —  MySQL version (mysql2 + procédures stockées)
//  Aucun changement sur la logique métier (JWT, OTP, bcrypt) :
//  seuls les appels Mongoose → pool.query()
// ─────────────────────────────────────────────────────────────────────────────

import { hash, compare } from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { RowDataPacket, ResultSetHeader } from 'mysql2';  // ← AJOUTER CET IMPORT
import { pool }   from '../config/databaseConnect';       // mysql2 pool
import { newId }  from '../utils/id';        // crypto.randomBytes(8).toString('hex')
import MailService from './sendmail.service';
import { IUser }  from '../interfaces/IUser';

// ─── Type retourné par mysql2 pour les SELECT ────────────────────────────────
// CORRECTION : Étendre RowDataPacket
interface UserRow extends RowDataPacket {
  id:           string;
  username:     string;
  email:        string;
  phone_number: string;
  password:     string;
  role:         'admin' | 'user';
  created_at:   Date;
  updated_at:   Date;
}

export class UserService {
  private JWT_SECRET:     string;
  private JWT_EXPIRES_IN: string;
  // OTP en mémoire (inchangé — pas lié à la DB)
  private otpStore: Record<string, { code: string; expiresAt: number }> = {};

  constructor() {
    this.JWT_SECRET     = process.env.JWT_SECRET     || 'your-secret-key-change-in-production';
    this.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
  }

  // ── REGISTER ───────────────────────────────────────────────────────────────
  async register(user: IUser) {
    // Vérification unicité (email | phone_number | username)
    // CORRECTION : Utiliser RowDataPacket[] au lieu de any[]
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT id FROM users
       WHERE email = ? OR phone_number = ? OR username = ?
       LIMIT 1`,
      [user.email, user.phone_number, user.username]
    );

    if (rows.length > 0) {
      throw new Error('User with provided email, phone number, or username already exists');
    }

    const id             = newId();
    const hashedPassword = await hash(user.password, 12);

    await pool.query(
      'CALL sp_create_user(?,?,?,?,?,?)',
      [id, user.username, user.email, user.phone_number, hashedPassword, user.role ?? 'user']
    );

    return { id, username: user.username, email: user.email, role: user.role ?? 'user' };
  }

  // ── LOGIN ──────────────────────────────────────────────────────────────────
  async login(email: string, password: string) {
    // CORRECTION : Utiliser UserRow[] (qui étend RowDataPacket)
    const [rows] = await pool.query<UserRow[]>(
      'SELECT * FROM users WHERE email = ? LIMIT 1',
      [email]
    );

    if (rows.length === 0) throw new Error('User not found');

    const user            = rows[0];
    const isPasswordValid = await compare(password, user.password);
    if (!isPasswordValid) throw new Error('Invalid password');

    const signOptions: SignOptions = {
      expiresIn: this.JWT_EXPIRES_IN as SignOptions['expiresIn'],
    };

    const token = jwt.sign(
      {
        id:          user.id,
        email:       user.email,
        username:    user.username,
        phone_number: user.phone_number,
        role:        user.role,
      },
      this.JWT_SECRET as jwt.Secret,
      signOptions
    );

    // Extraction correcte des champs
    const safeUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      phone_number: user.phone_number,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at
    };
    
    return { user: safeUser, token };
  }

  // ── SEND PASSWORD RESET OTP ────────────────────────────────────────────────
  async sendPasswordResetOtp(email: string): Promise<void> {
    const [rows] = await pool.query<UserRow[]>(
      'SELECT id, username FROM users WHERE email = ? LIMIT 1',
      [email]
    );
    if (rows.length === 0) throw new Error('User not found');

    const otp = Math.floor(100_000 + Math.random() * 900_000).toString();
    await this.storeOtp(email, otp, Date.now() + 10 * 60 * 1_000);

    await MailService.sendPasswordResetOTP({
      to:        email,
      userName:  rows[0].username || 'Utilisateur',
      otpCode:   otp,
      expiresIn: '10 minutes',
    });
  }

  // ── RESET PASSWORD WITH OTP ────────────────────────────────────────────────
  async resetPasswordWithOtp(email: string, otp: string, newPassword: string): Promise<void> {
    const storedOtp = await this.getStoredOtp(email);

    if (!storedOtp || storedOtp.code !== otp || storedOtp.expiresAt < Date.now()) {
      throw new Error('Invalid or expired OTP');
    }
    if (newPassword.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }

    const hashedPassword = await hash(newPassword, 12);

    // CORRECTION : Pour UPDATE, on peut utiliser ResultSetHeader optionnellement
    await pool.query<ResultSetHeader>(
      'UPDATE users SET password = ?, updated_at = NOW() WHERE email = ?',
      [hashedPassword, email]
    );

    await this.deleteOtp(email);
  }

  // ── OTP STORE (mémoire — inchangé) ────────────────────────────────────────
  private async storeOtp(email: string, otp: string, expiresAt: number): Promise<void> {
    this.otpStore[email] = { code: otp, expiresAt };
  }

  private async getStoredOtp(email: string) {
    return this.otpStore[email] ?? null;
  }

  private async deleteOtp(email: string): Promise<void> {
    delete this.otpStore[email];
  }
}