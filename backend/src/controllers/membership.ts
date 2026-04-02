import { Request, Response, NextFunction } from 'express';
import * as MembershipModel from '../models/membership';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { ApiResponse, Membership } from '../types';

/**
 * 获取当前会员状态
 */
export const getMembershipStatus = async (
  req: AuthRequest,
  res: Response<ApiResponse<any>>,
  next: NextFunction
) => {
  try {
    if (!req.user) return next(new AppError('Authentication required', 401));

    const { default: pool } = await import('../config/database');
    const userResult = await pool.query(
      'SELECT level, level_expires_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (userResult.rows.length === 0) {
      return next(new AppError('User not found', 404));
    }

    const { level, level_expires_at } = userResult.rows[0];

    // 检查是否过期
    let isExpired = false;
    let effectiveLevel = level;
    if (level !== 'normal' && level_expires_at && new Date(level_expires_at) < new Date()) {
      isExpired = true;
      effectiveLevel = 'normal';
      await pool.query(
        "UPDATE users SET level = 'normal', level_expires_at = NULL, updated_at = NOW() WHERE id = $1",
        [req.user.id]
      );
    }

    const activeMembership = await MembershipModel.getActiveMembership(req.user.id);

    res.json({
      success: true,
      data: {
        level: effectiveLevel,
        is_expired: isExpired,
        expires_at: level_expires_at,
        has_active_membership: !!activeMembership,
        membership: activeMembership,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 获取会员权益说明
 */
export const getBenefits = async (
  req: Request,
  res: Response<ApiResponse<any>>,
  next: NextFunction
) => {
  try {
    const benefits = {
      free: {
        label: '免费用户',
        features: [
          '浏览所有免费提示词',
          '复制免费提示词',
          '收藏提示词',
          '提交评价',
        ],
      },
      vip: {
        label: 'VIP会员',
        features: [
          '所有免费权益',
          '复制所有VIP提示词',
          '专属VIP标识',
          '优先查看新内容',
        ],
        plans: [
          { type: 'monthly', price: 29, duration: 30, label: '月度会员' },
          { type: 'yearly', price: 249, duration: 365, label: '年度会员（省99元）' },
        ],
      },
      svip: {
        label: 'SVIP会员',
        features: [
          '所有VIP权益',
          '复制所有SVIP专属提示词',
          'SVIP专属标识',
          '定制推荐服务',
        ],
        plans: [
          { type: 'monthly', price: 59, duration: 30, label: '月度会员' },
          { type: 'yearly', price: 499, duration: 365, label: '年度会员（省209元）' },
        ],
      },
    };

    res.json({ success: true, data: benefits });
  } catch (error) {
    next(error);
  }
};

/**
 * 获取会员历史记录
 */
export const getMembershipHistory = async (
  req: AuthRequest,
  res: Response<ApiResponse<Membership[]>>,
  next: NextFunction
) => {
  try {
    if (!req.user) return next(new AppError('Authentication required', 401));

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const { memberships, total } = await MembershipModel.getUserMemberships(req.user.id, page, limit);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: memberships,
      pagination: { page, limit, total, totalPages },
    });
  } catch (error) {
    next(error);
  }
};
