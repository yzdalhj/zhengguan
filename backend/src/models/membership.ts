import pool from '../config/database';
import { Membership } from '../types';

export const createMembership = async (
  userId: number,
  level: 'vip' | 'svip',
  startDate: Date,
  endDate: Date,
  autoRenew: boolean = false,
  paymentId?: number
): Promise<Membership> => {
  const result = await pool.query(
    `INSERT INTO memberships (user_id, level, start_date, end_date, auto_renew, payment_id)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [userId, level, startDate, endDate, autoRenew, paymentId || null]
  );
  return result.rows[0];
};

export const getActiveMembership = async (userId: number): Promise<Membership | null> => {
  const result = await pool.query(
    `SELECT * FROM memberships
     WHERE user_id = $1 AND end_date > NOW()
     ORDER BY end_date DESC
     LIMIT 1`,
    [userId]
  );
  return result.rows[0] || null;
};

export const getMembershipById = async (id: number): Promise<Membership | null> => {
  const result = await pool.query('SELECT * FROM memberships WHERE id = $1', [id]);
  return result.rows[0] || null;
};

export const getUserMemberships = async (
  userId: number,
  page: number = 1,
  limit: number = 20
): Promise<{ memberships: Membership[]; total: number }> => {
  const offset = (page - 1) * limit;
  const [result, countResult] = await Promise.all([
    pool.query(
      `SELECT * FROM memberships WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    ),
    pool.query(
      'SELECT COUNT(*) as total FROM memberships WHERE user_id = $1',
      [userId]
    ),
  ]);
  return {
    memberships: result.rows,
    total: parseInt(countResult.rows[0].total),
  };
};

/**
 * 激活会员：更新 users 表的 level 和过期时间
 */
export const activateUserMembership = async (
  userId: number,
  level: 'vip' | 'svip',
  endDate: Date
): Promise<void> => {
  await pool.query(
    `UPDATE users SET level = $1, level_expires_at = $2, updated_at = NOW() WHERE id = $3`,
    [level, endDate, userId]
  );
};

/**
 * 检查并处理过期会员（定时任务调用）
 */
export const expireOverdueMemberships = async (): Promise<number> => {
  // 找出所有已过期但 users.level 仍为会员的用户
  const result = await pool.query(
    `UPDATE users SET level = 'normal', level_expires_at = NULL, updated_at = NOW()
     WHERE level IN ('vip', 'svip')
     AND level_expires_at IS NOT NULL
     AND level_expires_at < NOW()`
  );
  return result.rowCount || 0;
};

/**
 * 会员权益配置
 */
export const MEMBERSHIP_PLANS = {
  vip: {
    monthly: {
      level: 'vip' as const,
      duration: 30, // 天
      price: 29,
      label: 'VIP月度会员',
    },
    yearly: {
      level: 'vip' as const,
      duration: 365,
      price: 249,
      label: 'VIP年度会员',
    },
  },
  svip: {
    monthly: {
      level: 'svip' as const,
      duration: 30,
      price: 59,
      label: 'SVIP月度会员',
    },
    yearly: {
      level: 'svip' as const,
      duration: 365,
      price: 499,
      label: 'SVIP年度会员',
    },
  },
};
