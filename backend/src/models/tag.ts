import pool from '../config/database';
import { Tag } from '../types';

export const getAllTags = async (category?: string): Promise<Tag[]> => {
  let query = 'SELECT * FROM tags ORDER BY category, name';
  const values: any[] = [];
  
  if (category) {
    query = 'SELECT * FROM tags WHERE category = $1 ORDER BY name';
    values.push(category);
  }
  
  const result = await pool.query(query, values);
  return result.rows;
};

export const getTagById = async (id: number): Promise<Tag | null> => {
  const result = await pool.query('SELECT * FROM tags WHERE id = $1', [id]);
  return result.rows[0] || null;
};

export const getTagByName = async (name: string): Promise<Tag | null> => {
  const result = await pool.query('SELECT * FROM tags WHERE name = $1', [name]);
  return result.rows[0] || null;
};

export const createTag = async (name: string, category?: string): Promise<Tag> => {
  const result = await pool.query(
    'INSERT INTO tags (name, category) VALUES ($1, $2) RETURNING *',
    [name, category]
  );
  return result.rows[0];
};

export const updateTag = async (id: number, name: string, category?: string): Promise<Tag | null> => {
  const result = await pool.query(
    'UPDATE tags SET name = $1, category = $2 WHERE id = $3 RETURNING *',
    [name, category, id]
  );
  return result.rows[0] || null;
};

export const deleteTag = async (id: number): Promise<boolean> => {
  const result = await pool.query('DELETE FROM tags WHERE id = $1', [id]);
  return (result.rowCount || 0) > 0;
};

export const getTagsByCategory = async (category: string): Promise<Tag[]> => {
  const result = await pool.query(
    'SELECT * FROM tags WHERE category = $1 ORDER BY name',
    [category]
  );
  return result.rows;
};

export const getAllCategories = async (): Promise<string[]> => {
  const result = await pool.query(
    'SELECT DISTINCT category FROM tags WHERE category IS NOT NULL ORDER BY category'
  );
  return result.rows.map((row: any) => row.category);
};
