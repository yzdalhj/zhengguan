import pool from '../config/database';
import type { RefreshToken } from '../types';

export const createRefreshToken = async (
  userId: number,
  token: string,
  userAgent?: string,
  ipAddress?: string,
  expiresAt: Date
): Promise<RefreshToken> => {
  const result = await pool.query(
    'INSERT INTO refresh_tokens (user_id, token, user_agent, ip_address, expires_at) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [userId, token, userAgent || null, ipAddress || null, expiresAt]
  );
  return result.rows[0];
};

export const findRefreshToken = async (token: string): Promise<RefreshToken | null> => {
  const result = await pool.query(
    'SELECT * FROM refresh_tokens WHERE token = $1 AND revoked = false AND expires_at > NOW()',
    [token]
  );
  return result.rows[0] || null;
};

export const revokeRefreshToken = async (token: string): Promise<void> => {
  await pool.query(
    'UPDATE refresh_tokens SET revoked = true WHERE token = $1',
    [token]
  );
};

export const revokeAllUserTokens = async (userId: number): Promise<void> => {
  await pool.query(
    'UPDATE refresh_tokens SET revoked = true WHERE user_id = $1',
    [userId]
  );
};

export const cleanupExpiredTokens = async (): Promise<void> => {
  await pool.query('DELETE FROM refresh_tokens WHERE expires_at < NOW()');
};
