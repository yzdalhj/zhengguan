import pool from '../config/database';
import type { QrcodeLogin } from '../types';

export const createQrcodeLogin = async (
  code: string,
  expiresAt: Date
): Promise<QrcodeLogin> => {
  const result = await pool.query(
    'INSERT INTO qrcode_login (code, expires_at) VALUES ($1, $2) RETURNING *',
    [code, expiresAt]
  );
  return result.rows[0];
};

export const findQrcodeByCode = async (code: string): Promise<QrcodeLogin | null> => {
  const result = await pool.query(
    'SELECT * FROM qrcode_login WHERE code = $1 AND status = \'pending\' AND expires_at > NOW()',
    [code]
  );
  return result.rows[0] || null;
};

export const updateQrcodeScanned = async (
  code: string,
  userId: number
): Promise<QrcodeLogin | null> => {
  const result = await pool.query(
    'UPDATE qrcode_login SET status = \'scanned\', user_id = $1, scanned_at = NOW() WHERE code = $2 AND status = \'pending\' RETURNING *',
    [userId, code]
  );
  return result.rows[0] || null;
};

export const updateQrcodeConfirmed = async (code: string): Promise<QrcodeLogin | null> => {
  const result = await pool.query(
    'UPDATE qrcode_login SET status = \'confirmed\', confirmed_at = NOW() WHERE code = $1 AND status = \'scanned\' RETURNING *',
    [code]
  );
  return result.rows[0] || null;
};

export const cancelQrcode = async (code: string): Promise<void> => {
  await pool.query(
    'UPDATE qrcode_login SET status = \'cancelled\' WHERE code = $1',
    [code]
  );
};

export const cleanupExpiredQrcodes = async (): Promise<void> => {
  await pool.query('DELETE FROM qrcode_login WHERE expires_at < NOW()');
};
