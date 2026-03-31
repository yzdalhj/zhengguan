import pool from '../config/database';
import { WatchHistory } from '../types';

export const getUserWatchHistory = async (
  userId: number,
  page: number = 1,
  limit: number = 100
): Promise<{ history: WatchHistory[]; total: number }> => {
  const offset = (page - 1) * limit;

  const result = await pool.query(
    `
    SELECT h.*, json_build_object(
      'id', v.id,
      'external_id', v.external_id,
      'platform', v.platform,
      'title', v.title,
      'description', v.description,
      'embed_url', v.embed_url,
      'thumbnail_url', v.thumbnail_url,
      'duration', v.duration,
      'quality', v.quality,
      'views', v.views,
      'likes', v.likes,
      'upload_date', v.upload_date,
      'source_film', v.source_film,
      'status', v.status,
      'created_at', v.created_at,
      'updated_at', v.updated_at
    ) as video
    FROM watch_history h
    JOIN videos v ON h.video_id = v.id
    WHERE h.user_id = $1 AND v.status = 'approved'
    ORDER BY h.watched_at DESC
    LIMIT $2 OFFSET $3
    `,
    [userId, limit, offset]
  );

  const countResult = await pool.query(
    'SELECT COUNT(*) as total FROM watch_history WHERE user_id = $1',
    [userId]
  );

  return {
    history: result.rows,
    total: parseInt(countResult.rows[0].total),
  };
};

export const addOrUpdateWatchHistory = async (
  userId: number,
  videoId: number,
  progress?: number
): Promise<WatchHistory> => {
  const result = await pool.query(
    `
    INSERT INTO watch_history (user_id, video_id, progress, watched_at, updated_at)
    VALUES ($1, $2, $3, NOW(), NOW())
    ON CONFLICT (user_id, video_id)
    DO UPDATE SET
      progress = EXCLUDED.progress,
      watched_at = EXCLUDED.watched_at,
      updated_at = NOW()
    RETURNING *
    `,
    [userId, videoId, progress || 0]
  );

  return result.rows[0];
};

export const removeFromWatchHistory = async (
  userId: number,
  videoId: number
): Promise<boolean> => {
  const result = await pool.query(
    'DELETE FROM watch_history WHERE user_id = $1 AND video_id = $2',
    [userId, videoId]
  );
  return (result.rowCount || 0) > 0;
};

export const clearUserWatchHistory = async (userId: number): Promise<boolean> => {
  const result = await pool.query(
    'DELETE FROM watch_history WHERE user_id = $1',
    [userId]
  );
  return (result.rowCount || 0) > 0;
};

export const syncWatchHistory = async (
  userId: number,
  items: { video_id: number; watched_at: string; progress?: number }[]
): Promise<void> => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    for (const item of items) {
      await client.query(
        `
        INSERT INTO watch_history (user_id, video_id, progress, watched_at, updated_at)
        VALUES ($1, $2, $3, $4, NOW())
        ON CONFLICT (user_id, video_id)
        DO UPDATE SET
          progress = CASE
            WHEN EXCLUDED.watched_at > watch_history.watched_at THEN EXCLUDED.progress
            ELSE watch_history.progress
          END,
          watched_at = CASE
            WHEN EXCLUDED.watched_at > watch_history.watched_at THEN EXCLUDED.watched_at
            ELSE watch_history.watched_at
          END,
          updated_at = NOW()
        `,
        [userId, item.video_id, item.progress || 0, item.watched_at]
      );
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};
