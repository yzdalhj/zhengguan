import pool from '../config/database';
import { PromptFavorite } from '../types';

export const addFavorite = async (userId: number, promptId: number): Promise<void> => {
  await pool.query(
    'INSERT INTO prompt_favorites (user_id, prompt_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
    [userId, promptId]
  );
};

export const removeFavorite = async (userId: number, promptId: number): Promise<boolean> => {
  const result = await pool.query(
    'DELETE FROM prompt_favorites WHERE user_id = $1 AND prompt_id = $2',
    [userId, promptId]
  );
  return (result.rowCount || 0) > 0;
};

export const isFavorited = async (userId: number, promptId: number): Promise<boolean> => {
  const result = await pool.query(
    'SELECT 1 FROM prompt_favorites WHERE user_id = $1 AND prompt_id = $2',
    [userId, promptId]
  );
  return result.rows.length > 0;
};

export const getUserFavorites = async (
  userId: number,
  page: number = 1,
  limit: number = 20
): Promise<{ favorites: any[]; total: number }> => {
  const offset = (page - 1) * limit;
  const [result, countResult] = await Promise.all([
    pool.query(
      `SELECT pf.created_at, p.*,
        array_agg(json_build_object('id', t.id, 'name', t.name, 'category', t.category)) as tags
       FROM prompt_favorites pf
       JOIN prompts p ON pf.prompt_id = p.id
       LEFT JOIN prompt_tags pt ON p.id = pt.prompt_id
       LEFT JOIN tags t ON pt.tag_id = t.id
       WHERE pf.user_id = $1 AND p.status = 'approved'
       GROUP BY p.id, pf.created_at
       ORDER BY pf.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    ),
    pool.query(
      `SELECT COUNT(*) as total
       FROM prompt_favorites pf
       JOIN prompts p ON pf.prompt_id = p.id
       WHERE pf.user_id = $1 AND p.status = 'approved'`,
      [userId]
    ),
  ]);
  return {
    favorites: result.rows,
    total: parseInt(countResult.rows[0].total),
  };
};

export const getFavoriteCount = async (promptId: number): Promise<number> => {
  const result = await pool.query(
    'SELECT COUNT(*) as count FROM prompt_favorites WHERE prompt_id = $1',
    [promptId]
  );
  return parseInt(result.rows[0].count);
};
