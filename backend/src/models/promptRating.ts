import pool from '../config/database';
import { PromptRating } from '../types';

export const createRating = async (
  userId: number,
  promptId: number,
  rating: number,
  comment?: string
): Promise<PromptRating> => {
  const result = await pool.query(
    `INSERT INTO prompt_ratings (user_id, prompt_id, rating, comment)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (user_id, prompt_id) DO UPDATE SET rating = $3, comment = $4
     RETURNING *`,
    [userId, promptId, rating, comment || null]
  );
  return result.rows[0];
};

export const getRatingsByPromptId = async (
  promptId: number,
  page: number = 1,
  limit: number = 20
): Promise<{ ratings: (PromptRating & { username?: string })[]; total: number }> => {
  const offset = (page - 1) * limit;
  const [result, countResult] = await Promise.all([
    pool.query(
      `SELECT pr.*, u.username
       FROM prompt_ratings pr
       JOIN users u ON pr.user_id = u.id
       WHERE pr.prompt_id = $1
       ORDER BY pr.created_at DESC
       LIMIT $2 OFFSET $3`,
      [promptId, limit, offset]
    ),
    pool.query(
      'SELECT COUNT(*) as total FROM prompt_ratings WHERE prompt_id = $1',
      [promptId]
    ),
  ]);
  return {
    ratings: result.rows,
    total: parseInt(countResult.rows[0].total),
  };
};

export const getUserRating = async (
  userId: number,
  promptId: number
): Promise<PromptRating | null> => {
  const result = await pool.query(
    'SELECT * FROM prompt_ratings WHERE user_id = $1 AND prompt_id = $2',
    [userId, promptId]
  );
  return result.rows[0] || null;
};

export const deleteRating = async (userId: number, promptId: number): Promise<boolean> => {
  const result = await pool.query(
    'DELETE FROM prompt_ratings WHERE user_id = $1 AND prompt_id = $2',
    [userId, promptId]
  );
  return (result.rowCount || 0) > 0;
};
