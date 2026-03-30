import pool from '../config/database';
import { User } from '../types';

export const createUser = async (
  username: string,
  email: string,
  passwordHash: string,
  role: string = 'user',
  phone?: string
): Promise<User> => {
  const result = await pool.query(
    'INSERT INTO users (username, email, phone, password_hash, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, username, email, phone, phone_verified, role, points, level, level_expires_at, total_points_earned, created_at, updated_at',
    [username, email, phone || null, passwordHash, role]
  );
  return result.rows[0];
};

export const findUserByEmail = async (email: string): Promise<User | null> => {
  const result = await pool.query(
    'SELECT id, username, email, phone, phone_verified, password_hash, role, points, level, level_expires_at, total_points_earned, created_at, updated_at FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0] || null;
};

export const findUserByUsername = async (username: string): Promise<User | null> => {
  const result = await pool.query(
    'SELECT id, username, email, phone, phone_verified, password_hash, role, points, level, level_expires_at, total_points_earned, created_at, updated_at FROM users WHERE username = $1',
    [username]
  );
  return result.rows[0] || null;
};

export const findUserByPhone = async (phone: string): Promise<User | null> => {
  const result = await pool.query(
    'SELECT id, username, email, phone, phone_verified, password_hash, role, points, level, level_expires_at, total_points_earned, created_at, updated_at FROM users WHERE phone = $1',
    [phone]
  );
  return result.rows[0] || null;
};

export const findUserById = async (id: number): Promise<User | null> => {
  const result = await pool.query(
    'SELECT id, username, email, phone, phone_verified, role, points, level, level_expires_at, total_points_earned, created_at, updated_at FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
};

export const getAllUsers = async (): Promise<User[]> => {
  const result = await pool.query(
    'SELECT id, username, email, phone, phone_verified, role, points, level, level_expires_at, total_points_earned, created_at, updated_at FROM users ORDER BY created_at DESC'
  );
  return result.rows;
};

export const updateUserRole = async (id: number, role: string): Promise<User | null> => {
  const result = await pool.query(
    'UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2 RETURNING id, username, email, phone, phone_verified, role, points, level, level_expires_at, total_points_earned, created_at, updated_at',
    [role, id]
  );
  return result.rows[0] || null;
};

export const updateUserPhone = async (id: number, phone: string, verified: boolean): Promise<User | null> => {
  const result = await pool.query(
    'UPDATE users SET phone = $1, phone_verified = $2, updated_at = NOW() WHERE id = $3 RETURNING id, username, email, phone, phone_verified, role, points, level, level_expires_at, total_points_earned, created_at, updated_at',
    [phone, verified, id]
  );
  return result.rows[0] || null;
};

export const updateUserPoints = async (id: number, points: number, totalPointsEarned: number): Promise<User | null> => {
  const result = await pool.query(
    'UPDATE users SET points = $1, total_points_earned = $2, updated_at = NOW() WHERE id = $3 RETURNING id, username, email, phone, phone_verified, role, points, level, level_expires_at, total_points_earned, created_at, updated_at',
    [points, totalPointsEarned, id]
  );
  return result.rows[0] || null;
};

export const updateUserLevel = async (id: number, level: string, expiresAt?: Date): Promise<User | null> => {
  const result = await pool.query(
    'UPDATE users SET level = $1, level_expires_at = $2, updated_at = NOW() WHERE id = $3 RETURNING id, username, email, phone, phone_verified, role, points, level, level_expires_at, total_points_earned, created_at, updated_at',
    [level, expiresAt || null, id]
  );
  return result.rows[0] || null;
};

export const updatePassword = async (id: number, passwordHash: string): Promise<User | null> => {
  const result = await pool.query(
    'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2 RETURNING id, username, email, phone, phone_verified, role, points, level, level_expires_at, total_points_earned, created_at, updated_at',
    [passwordHash, id]
  );
  return result.rows[0] || null;
};

export const deleteUser = async (id: number): Promise<boolean> => {
  const result = await pool.query('DELETE FROM users WHERE id = $1', [id]);
  return (result.rowCount || 0) > 0;
};
