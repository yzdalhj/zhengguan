import pool from '../config/database';
import { Report } from '../types';

export const createReport = async (
  userId: number | undefined,
  videoId: number,
  reason?: string
): Promise<Report> => {
  const result = await pool.query(
    'INSERT INTO reports (user_id, video_id, reason) VALUES ($1, $2, $3) RETURNING *',
    [userId, videoId, reason]
  );
  return result.rows[0];
};

export const getPendingReports = async (
  page: number = 1,
  limit: number = 20
): Promise<{ reports: Report[]; total: number }> => {
  const offset = (page - 1) * limit;
  
  const result = await pool.query(
    'SELECT * FROM reports WHERE status = \'pending\' ORDER BY created_at DESC LIMIT $1 OFFSET $2',
    [limit, offset]
  );

  const countResult = await pool.query('SELECT COUNT(*) as total FROM reports WHERE status = \'pending\'');

  return {
    reports: result.rows,
    total: parseInt(countResult.rows[0].total),
  };
};

export const updateReportStatus = async (
  id: number,
  status: string
): Promise<Report | null> => {
  const result = await pool.query(
    'UPDATE reports SET status = $1 WHERE id = $2 RETURNING *',
    [status, id]
  );
  return result.rows[0] || null;
};

export const getAllReports = async (
  page: number = 1,
  limit: number = 20
): Promise<{ reports: Report[]; total: number }> => {
  const offset = (page - 1) * limit;
  
  const result = await pool.query(
    'SELECT * FROM reports ORDER BY created_at DESC LIMIT $1 OFFSET $2',
    [limit, offset]
  );

  const countResult = await pool.query('SELECT COUNT(*) as total FROM reports');

  return {
    reports: result.rows,
    total: parseInt(countResult.rows[0].total),
  };
};

export const getReportById = async (id: number): Promise<Report | null> => {
  const result = await pool.query('SELECT * FROM reports WHERE id = $1', [id]);
  return result.rows[0] || null;
};
