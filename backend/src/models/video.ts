import pool from '../config/database';
import { Video, VideoSearchParams } from '../types';

export const searchVideos = async (
  params: VideoSearchParams
): Promise<{ videos: Video[]; total: number }> => {
  const {
    page = 1,
    limit = 20,
    keyword,
    tags,
    min_duration,
    max_duration,
    platform,
    sort = 'created_at_desc',
  } = params;
  
  const offset = (page - 1) * limit;
  let conditions: string[] = ['v.status = \'approved\''];
  const values: any[] = [];
  let paramIndex = 1;

  if (keyword) {
    conditions.push(`v.search_vector @@ plainto_tsquery($${paramIndex})`);
    values.push(keyword);
    paramIndex++;
  }

  if (platform) {
    conditions.push(`v.platform = $${paramIndex}`);
    values.push(platform);
    paramIndex++;
  }

  if (min_duration !== undefined) {
    conditions.push(`v.duration >= $${paramIndex}`);
    values.push(min_duration);
    paramIndex++;
  }

  if (max_duration !== undefined) {
    conditions.push(`v.duration <= $${paramIndex}`);
    values.push(max_duration);
    paramIndex++;
  }

  let whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

  let orderClause = 'ORDER BY ';
  switch (sort) {
    case 'views_desc':
      orderClause += 'v.views DESC';
      break;
    case 'likes_desc':
      orderClause += 'v.likes DESC';
      break;
    case 'upload_date_desc':
      orderClause += 'v.upload_date DESC';
      break;
    default:
      orderClause += 'v.created_at DESC';
  }

  if (tags && tags.length > 0) {
    const query = `
      SELECT v.*, array_agg(json_build_object('id', t.id, 'name', t.name, 'category', t.category)) as tags
      FROM videos v
      JOIN video_tags vt ON v.id = vt.video_id
      JOIN tags t ON vt.tag_id = t.id
      ${whereClause}
      AND vt.tag_id IN (${tags.map((_, i) => `$${paramIndex + i}`).join(', ')})
      GROUP BY v.id
      ${orderClause}
      LIMIT $${paramIndex + tags.length} OFFSET $${paramIndex + tags.length + 1}
    `;
    const countQuery = `
      SELECT COUNT(DISTINCT v.id) as total
      FROM videos v
      JOIN video_tags vt ON v.id = vt.video_id
      ${whereClause}
      AND vt.tag_id IN (${tags.map((_, i) => `$${paramIndex + i}`).join(', ')})
    `;

    values.push(...tags);
    values.push(limit, offset);

    const [result, countResult] = await Promise.all([
      pool.query(query, values),
      pool.query(countQuery, values.slice(0, -2)),
    ]);

    return {
      videos: result.rows,
      total: parseInt(countResult.rows[0].total),
    };
  }

  const query = `
    SELECT v.*, array_agg(json_build_object('id', t.id, 'name', t.name, 'category', t.category)) as tags
    FROM videos v
    LEFT JOIN video_tags vt ON v.id = vt.video_id
    LEFT JOIN tags t ON vt.tag_id = t.id
    ${whereClause}
    GROUP BY v.id
    ${orderClause}
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;

  const countQuery = `
    SELECT COUNT(*) as total
    FROM videos v
    ${whereClause}
  `;

  values.push(limit, offset);

  const [result, countResult] = await Promise.all([
    pool.query(query, values),
    pool.query(countQuery, values.slice(0, -2)),
  ]);

  return {
    videos: result.rows,
    total: parseInt(countResult.rows[0].total),
  };
};

export const getVideoById = async (id: number): Promise<Video | null> => {
  const result = await pool.query(
    `
    SELECT v.*, array_agg(json_build_object('id', t.id, 'name', t.name, 'category', t.category)) as tags
    FROM videos v
    LEFT JOIN video_tags vt ON v.id = vt.video_id
    LEFT JOIN tags t ON vt.tag_id = t.id
    WHERE v.id = $1
    GROUP BY v.id
    `,
    [id]
  );
  return result.rows[0] || null;
};

export const getVideoByExternalId = async (externalId: string): Promise<Video | null> => {
  const result = await pool.query(
    'SELECT * FROM videos WHERE external_id = $1',
    [externalId]
  );
  return result.rows[0] || null;
};

export const createVideo = async (video: Omit<Video, 'id' | 'created_at' | 'updated_at'>): Promise<Video> => {
  const result = await pool.query(
    `
    INSERT INTO videos (external_id, platform, title, description, embed_url, thumbnail_url, duration, quality, views, likes, upload_date, source_film, status)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    RETURNING *
    `,
    [
      video.external_id,
      video.platform,
      video.title,
      video.description,
      video.embed_url,
      video.thumbnail_url,
      video.duration,
      video.quality,
      video.views || 0,
      video.likes || 0,
      video.upload_date,
      video.source_film,
      video.status || 'pending',
    ]
  );
  return result.rows[0];
};

export const updateVideoStatus = async (id: number, status: string): Promise<Video | null> => {
  const result = await pool.query(
    'UPDATE videos SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
    [status, id]
  );
  return result.rows[0] || null;
};

export const updateVideo = async (id: number, updates: Partial<Video>): Promise<Video | null> => {
  const fields: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  Object.entries(updates).forEach(([key, value]) => {
    if (key !== 'id' && key !== 'created_at' && key !== 'updated_at' && value !== undefined) {
      fields.push(`${key} = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    }
  });

  fields.push('updated_at = NOW()');
  values.push(id);

  const query = `UPDATE videos SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
  const result = await pool.query(query, values);
  return result.rows[0] || null;
};

export const deleteVideo = async (id: number): Promise<boolean> => {
  const result = await pool.query('DELETE FROM videos WHERE id = $1', [id]);
  return (result.rowCount || 0) > 0;
};

export const addTagsToVideo = async (videoId: number, tagIds: number[]): Promise<void> => {
  for (const tagId of tagIds) {
    await pool.query(
      'INSERT INTO video_tags (video_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [videoId, tagId]
    );
  }
};

export const removeTagsFromVideo = async (videoId: number, tagIds: number[]): Promise<void> => {
  if (tagIds.length === 0) return;
  const placeholders = tagIds.map((_, i) => `$${i + 2}`).join(', ');
  await pool.query(
    `DELETE FROM video_tags WHERE video_id = $1 AND tag_id IN (${placeholders})`,
    [videoId, ...tagIds]
  );
};

export const getPendingVideos = async (page: number = 1, limit: number = 20): Promise<{ videos: Video[]; total: number }> => {
  const offset = (page - 1) * limit;
  
  const result = await pool.query(
    `
    SELECT v.*, array_agg(json_build_object('id', t.id, 'name', t.name, 'category', t.category)) as tags
    FROM videos v
    LEFT JOIN video_tags vt ON v.id = vt.video_id
    LEFT JOIN tags t ON vt.tag_id = t.id
    WHERE v.status = 'pending'
    GROUP BY v.id
    ORDER BY v.created_at DESC
    LIMIT $1 OFFSET $2
    `,
    [limit, offset]
  );

  const countResult = await pool.query('SELECT COUNT(*) as total FROM videos WHERE status = \'pending\'');
  
  return {
    videos: result.rows,
    total: parseInt(countResult.rows[0].total),
  };
};

export const incrementViews = async (id: number): Promise<void> => {
  await pool.query('UPDATE videos SET views = views + 1 WHERE id = $1', [id]);
};
