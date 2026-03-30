import pool from '../config/database';
import type { UserPointsHistory } from '../types';

export const createPointsRecord = async (
  userId: number,
  pointsChange: number,
  pointsBalance: number,
  reason: string,
  description?: string
): Promise<UserPointsHistory> => {
  const result = await pool.query(
    'INSERT INTO user_points_history (user_id, points_change, points_balance, reason, description) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [userId, pointsChange, pointsBalance, reason, description || null]
  );
  return result.rows[0];
};

export const getUserPointsHistory = async (
  userId: number,
  limit: number = 20,
  offset: number = 0
): Promise<UserPointsHistory[]> => {
  const result = await pool.query(
    'SELECT * FROM user_points_history WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
    [userId, limit, offset]
  );
  return result.rows;
};

export const countUserPointsHistory = async (userId: number): Promise<number> => {
  const result = await pool.query(
    'SELECT COUNT(*) FROM user_points_history WHERE user_id = $1',
    [userId]
  );
  return parseInt(result.rows[0].count, 10);
};
