import pool from '../config/database';
import { Prompt, PromptSearchParams } from '../types';

export const searchPrompts = async (
  params: PromptSearchParams
): Promise<{ prompts: Prompt[]; total: number }> => {
  const {
    page = 1,
    limit = 20,
    keyword,
    tags,
    difficulty,
    tool,
    required_level,
    sort = 'created_at_desc',
  } = params;

  const offset = (page - 1) * limit;
  const conditions: string[] = ['p.status = \'approved\''];
  const values: any[] = [];
  let paramIndex = 1;

  if (keyword) {
    conditions.push(`p.search_vector @@ plainto_tsquery($${paramIndex})`);
    values.push(keyword);
    paramIndex++;
  }

  if (difficulty) {
    conditions.push(`p.difficulty = $${paramIndex}`);
    values.push(difficulty);
    paramIndex++;
  }

  if (required_level) {
    conditions.push(`p.required_level = $${paramIndex}`);
    values.push(required_level);
    paramIndex++;
  }

  if (tool) {
    conditions.push(`$${paramIndex} = ANY(p.applicable_tools)`);
    values.push(tool);
    paramIndex++;
  }

  const whereClause = 'WHERE ' + conditions.join(' AND ');

  let orderClause = 'ORDER BY ';
  switch (sort) {
    case 'rating_desc':
      orderClause += 'p.rating_avg DESC';
      break;
    case 'copy_count_desc':
      orderClause += 'p.copy_count DESC';
      break;
    case 'created_at_asc':
      orderClause += 'p.created_at ASC';
      break;
    default:
      orderClause += 'p.sort_order DESC, p.created_at DESC';
  }

  const selectTags = ', array_agg(json_build_object(\'id\', t.id, \'name\', t.name, \'category\', t.category)) as tags';

  if (tags && tags.length > 0) {
    const query = `
      SELECT p.*${selectTags}
      FROM prompts p
      JOIN prompt_tags pt ON p.id = pt.prompt_id
      JOIN tags t ON pt.tag_id = t.id
      ${whereClause}
      AND pt.tag_id IN (${tags.map((_, i) => `$${paramIndex + i}`).join(', ')})
      GROUP BY p.id
      ${orderClause}
      LIMIT $${paramIndex + tags.length} OFFSET $${paramIndex + tags.length + 1}
    `;
    const countQuery = `
      SELECT COUNT(DISTINCT p.id) as total
      FROM prompts p
      JOIN prompt_tags pt ON p.id = pt.prompt_id
      ${whereClause}
      AND pt.tag_id IN (${tags.map((_, i) => `$${paramIndex + i}`).join(', ')})
    `;
    values.push(...tags);
    values.push(limit, offset);
    const [result, countResult] = await Promise.all([
      pool.query(query, values),
      pool.query(countQuery, values.slice(0, -2)),
    ]);
    return {
      prompts: result.rows,
      total: parseInt(countResult.rows[0].total),
    };
  }

  const query = `
    SELECT p.*${selectTags}
    FROM prompts p
    LEFT JOIN prompt_tags pt ON p.id = pt.prompt_id
    LEFT JOIN tags t ON pt.tag_id = t.id
    ${whereClause}
    GROUP BY p.id
    ${orderClause}
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;
  const countQuery = `
    SELECT COUNT(*) as total FROM prompts p ${whereClause}
  `;
  values.push(limit, offset);
  const [result, countResult] = await Promise.all([
    pool.query(query, values),
    pool.query(countQuery, values.slice(0, -2)),
  ]);
  return {
    prompts: result.rows,
    total: parseInt(countResult.rows[0].total),
  };
};

export const getPromptById = async (id: number): Promise<Prompt | null> => {
  const result = await pool.query(
    `SELECT p.*, array_agg(json_build_object('id', t.id, 'name', t.name, 'category', t.category)) as tags
     FROM prompts p
     LEFT JOIN prompt_tags pt ON p.id = pt.prompt_id
     LEFT JOIN tags t ON pt.tag_id = t.id
     WHERE p.id = $1
     GROUP BY p.id`,
    [id]
  );
  return result.rows[0] || null;
};

export const getPromptWithUserFavorite = async (
  promptId: number,
  userId?: number
): Promise<Prompt | null> => {
  const prompt = await getPromptById(promptId);
  if (!prompt || prompt.status !== 'approved') return null;

  if (userId) {
    const favResult = await pool.query(
      'SELECT 1 FROM prompt_favorites WHERE user_id = $1 AND prompt_id = $2',
      [userId, promptId]
    );
    prompt.is_favorited = favResult.rows.length > 0;
  }

  return prompt;
};

export const createPrompt = async (
  prompt: Omit<Prompt, 'id' | 'created_at' | 'updated_at' | 'tags' | 'is_favorited' | 'rating_avg' | 'rating_count' | 'copy_count'>
): Promise<Prompt> => {
  const result = await pool.query(
    `INSERT INTO prompts (title, subtitle, content, preview_images, difficulty, applicable_tools, params, required_level, price, status, sort_order)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     RETURNING *`,
    [
      prompt.title,
      prompt.subtitle || null,
      prompt.content,
      prompt.preview_images || '{}',
      prompt.difficulty || 'beginner',
      prompt.applicable_tools || ['runway', 'pika', 'kling', 'jimeng'],
      prompt.params ? JSON.stringify(prompt.params) : '{}',
      prompt.required_level || 'free',
      prompt.price || 0,
      prompt.status || 'pending',
      prompt.sort_order || 0,
    ]
  );
  return result.rows[0];
};

export const updatePrompt = async (id: number, updates: Partial<Prompt>): Promise<Prompt | null> => {
  const fields: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  Object.entries(updates).forEach(([key, value]) => {
    if (['id', 'created_at', 'updated_at', 'tags', 'is_favorited'].includes(key)) return;
    if (value === undefined) return;

    if (key === 'params') {
      fields.push(`params = $${paramIndex}`);
      values.push(JSON.stringify(value));
    } else if (key === 'preview_images') {
      fields.push(`preview_images = $${paramIndex}`);
      values.push(value);
    } else if (key === 'applicable_tools') {
      fields.push(`applicable_tools = $${paramIndex}`);
      values.push(value);
    } else {
      fields.push(`${key} = $${paramIndex}`);
      values.push(value);
    }
    paramIndex++;
  });

  if (fields.length === 0) return null;

  fields.push('updated_at = NOW()');
  values.push(id);

  const result = await pool.query(
    `UPDATE prompts SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
    values
  );
  return result.rows[0] || null;
};

export const incrementCopyCount = async (id: number): Promise<void> => {
  await pool.query('UPDATE prompts SET copy_count = copy_count + 1, updated_at = NOW() WHERE id = $1', [id]);
};

export const updateRatingStats = async (promptId: number): Promise<void> => {
  await pool.query(
    `UPDATE prompts SET
      rating_avg = (SELECT AVG(rating) FROM prompt_ratings WHERE prompt_id = $1),
      rating_count = (SELECT COUNT(*) FROM prompt_ratings WHERE prompt_id = $1),
      updated_at = NOW()
    WHERE id = $1`,
    [promptId]
  );
};

export const getRelatedPrompts = async (promptId: number, limit: number = 6): Promise<Prompt[]> => {
  // 获取当前提示词的标签ID
  const tagResult = await pool.query('SELECT tag_id FROM prompt_tags WHERE prompt_id = $1', [promptId]);
  if (tagResult.rows.length === 0) return [];

  const tagIds = tagResult.rows.map((r: any) => r.tag_id);
  const placeholders = tagIds.map((_, i) => `$${i + 2}`).join(', ');

  const result = await pool.query(
    `SELECT p.*, array_agg(json_build_object('id', t.id, 'name', t.name, 'category', t.category)) as tags
     FROM prompts p
     LEFT JOIN prompt_tags pt ON p.id = pt.prompt_id
     LEFT JOIN tags t ON pt.tag_id = t.id
     WHERE p.status = 'approved' AND p.id != $1 AND pt.tag_id IN (${placeholders})
     GROUP BY p.id
     ORDER BY p.rating_avg DESC, p.copy_count DESC
     LIMIT $${tagIds.length + 2}`,
    [promptId, ...tagIds, limit]
  );
  return result.rows;
};
