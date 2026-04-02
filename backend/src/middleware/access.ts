import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { AppError } from './errorHandler';

/**
 * 检查用户等级是否满足要求
 * 用法：在 controller 中调用，传入 required_level 和用户等级
 */
export const checkUserLevel = (
  userLevel: string,
  requiredLevel: string
): { allowed: boolean; requiredLevel: string } => {
  const levelHierarchy: Record<string, number> = {
    normal: 0,
    vip: 1,
    svip: 2,
    admin: 3,
  };

  const userRank = levelHierarchy[userLevel] ?? 0;
  const requiredRank = levelHierarchy[requiredLevel] ?? 0;

  return {
    allowed: userRank >= requiredRank,
    requiredLevel,
  };
};

/**
 * 获取用户当前有效等级（自动检查过期）
 */
export const getEffectiveLevel = async (
  userId: number
): Promise<string> => {
  const { default: pool } = await import('../config/database');
  const result = await pool.query(
    'SELECT level, level_expires_at FROM users WHERE id = $1',
    [userId]
  );
  if (result.rows.length === 0) return 'normal';

  const { level, level_expires_at } = result.rows[0];

  if (level !== 'normal' && level_expires_at && new Date(level_expires_at) < new Date()) {
    await pool.query(
      "UPDATE users SET level = 'normal', level_expires_at = NULL, updated_at = NOW() WHERE id = $1",
      [userId]
    );
    return 'normal';
  }

  return level;
};

/**
 * Express 中间件：要求VIP权限
 */
export const requireVip = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return next(new AppError('Authentication required', 401));
  }

  const effectiveLevel = await getEffectiveLevel(req.user.id);
  const { allowed } = checkUserLevel(effectiveLevel, 'vip');

  if (!allowed) {
    return res.status(403).json({
      success: false,
      error: '该操作需要VIP会员权限',
      required_level: 'vip',
    });
  }

  next();
};

/**
 * Express 中间件：要求SVIP权限
 */
export const requireSvip = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return next(new AppError('Authentication required', 401));
  }

  const effectiveLevel = await getEffectiveLevel(req.user.id);
  const { allowed } = checkUserLevel(effectiveLevel, 'svip');

  if (!allowed) {
    return res.status(403).json({
      success: false,
      error: '该操作需要SVIP会员权限',
      required_level: 'svip',
    });
  }

  next();
};
