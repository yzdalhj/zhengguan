import pool from '../config/database';
import type { SmsCode } from '../types';

export const createSmsCode = async (
  phone: string,
  code: string,
  purpose: string,
  expiresAt: Date
): Promise<SmsCode> => {
  const result = await pool.query(
    'INSERT INTO sms_codes (phone, code, purpose, expires_at) VALUES ($1, $2, $3, $4) RETURNING *',
    [phone, code, purpose, expiresAt]
  );
  return result.rows[0];
};

export const findValidCode = async (
  phone: string,
  code: string,
  purpose: string
): Promise<SmsCode | null> => {
  const result = await pool.query(
    'SELECT * FROM sms_codes WHERE phone = $1 AND code = $2 AND purpose = $3 AND used = false AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
    [phone, code, purpose]
  );
  return result.rows[0] || null;
};

export const markCodeAsUsed = async (id: number): Promise<void> => {
  await pool.query(
    'UPDATE sms_codes SET used = true WHERE id = $1',
    [id]
  );
};

export const cleanupExpiredCodes = async (): Promise<void> => {
  await pool.query('DELETE FROM sms_codes WHERE expires_at < NOW()');
};
