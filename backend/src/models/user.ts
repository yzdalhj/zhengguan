import pool from '../config/database';
import { User } from '../types';

export const createUser = async (
  username: string,
  email: string,
  passwordHash: string,
  role: string = 'user'
): Promise<User> => {
  const result = await pool.query(
    'INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, username, email, role, created_at, updated_at',
    [username, email, passwordHash, role]
  );
  return result.rows[0];
};

export const findUserByEmail = async (email: string): Promise<User | null> => {
  const result = await pool.query(
    'SELECT id, username, email, password_hash, role, created_at, updated_at FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0] || null;
};

export const findUserByUsername = async (username: string): Promise<User | null> => {
  const result = await pool.query(
    'SELECT id, username, email, password_hash, role, created_at, updated_at FROM users WHERE username = $1',
    [username]
  );
  return result.rows[0] || null;
};

export const findUserById = async (id: number): Promise<User | null> => {
  const result = await pool.query(
    'SELECT id, username, email, role, created_at, updated_at FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
};

export const getAllUsers = async (): Promise<User[]> => {
  const result = await pool.query(
    'SELECT id, username, email, role, created_at, updated_at FROM users ORDER BY created_at DESC'
  );
  return result.rows;
};

export const updateUserRole = async (id: number, role: string): Promise<User | null> => {
  const result = await pool.query(
    'UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2 RETURNING id, username, email, role, created_at, updated_at',
    [role, id]
  );
  return result.rows[0] || null;
};

export const updatePassword = async (id: number, passwordHash: string): Promise<User | null> => {
  const result = await pool.query(
    'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2 RETURNING id, username, email, role, created_at, updated_at',
    [passwordHash, id]
  );
  return result.rows[0] || null;
};

export const deleteUser = async (id: number): Promise<boolean> => {
  const result = await pool.query('DELETE FROM users WHERE id = $1', [id]);
  return (result.rowCount || 0) > 0;
};
