import pool from '../config/database';
import { Collection } from '../types';

export const getUserCollections = async (
  userId: number,
  page: number = 1,
  limit: number = 20
): Promise<{ collections: Collection[]; total: number }> => {
  const offset = (page - 1) * limit;
  
  const result = await pool.query(
    `
    SELECT c.*, json_build_object(
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
    FROM collections c
    JOIN videos v ON c.video_id = v.id
    WHERE c.user_id = $1 AND v.status = 'approved'
    ORDER BY c.created_at DESC
    LIMIT $2 OFFSET $3
    `,
    [userId, limit, offset]
  );

  const countResult = await pool.query(
    'SELECT COUNT(*) as total FROM collections WHERE user_id = $1',
    [userId]
  );

  return {
    collections: result.rows,
    total: parseInt(countResult.rows[0].total),
  };
};

export const addCollection = async (userId: number, videoId: number): Promise<Collection> => {
  const result = await pool.query(
    'INSERT INTO collections (user_id, video_id) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING *',
    [userId, videoId]
  );
  
  if (result.rows.length === 0) {
    const existing = await pool.query(
      'SELECT * FROM collections WHERE user_id = $1 AND video_id = $2',
      [userId, videoId]
    );
    return existing.rows[0];
  }
  
  return result.rows[0];
};

export const removeCollection = async (userId: number, videoId: number): Promise<boolean> => {
  const result = await pool.query(
    'DELETE FROM collections WHERE user_id = $1 AND video_id = $2',
    [userId, videoId]
  );
  return (result.rowCount || 0) > 0;
};

export const isVideoCollected = async (userId: number, videoId: number): Promise<boolean> => {
  const result = await pool.query(
    'SELECT 1 FROM collections WHERE user_id = $1 AND video_id = $2',
    [userId, videoId]
  );
  return result.rows.length > 0;
};

export const exportUserCollections = async (userId: number): Promise<Collection[]> => {
  const result = await pool.query(
    `
    SELECT c.*, json_build_object(
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
    FROM collections c
    JOIN videos v ON c.video_id = v.id
    WHERE c.user_id = $1 AND v.status = 'approved'
    ORDER BY c.created_at DESC
    `,
    [userId]
  );

  return result.rows;
};
