import { Request, Response, NextFunction } from 'express';
import * as PromptModel from '../models/prompt';
import * as RatingModel from '../models/promptRating';
import * as FavoriteModel from '../models/promptFavorite';
import * as PaymentModel from '../models/payment';
import * as TagModel from '../models/tag';
import { AppError } from '../middleware/errorHandler';
import { ApiResponse, PromptSearchParams } from '../types';
import redisClient from '../config/redis';
import { AuthRequest } from '../middleware/auth';

export const getPrompts = async (
  req: Request,
  res: Response<ApiResponse<any[]>>,
  next: NextFunction
) => {
  try {
    const { page = 1, limit = 20, keyword, tags, difficulty, tool, required_level, sort } = req.query;

    const parsedTags = tags
      ? (Array.isArray(tags) ? tags : [tags]).map(Number).filter(t => !isNaN(t))
      : undefined;

    const params: PromptSearchParams = {
      page: Number(page),
      limit: Number(limit),
      keyword: keyword as string,
      tags: parsedTags && parsedTags.length > 0 ? parsedTags : undefined,
      difficulty: difficulty as string,
      tool: tool as string,
      required_level: required_level as string,
      sort: sort as string,
    };

    // 检查用户收藏状态
    const userId = (req as AuthRequest).user?.id;
    const { prompts, total } = await PromptModel.searchPrompts(params);
    const totalPages = Math.ceil(total / params.limit!);

    // 批量检查收藏状态
    if (userId) {
      const promptIds = prompts.map((p: any) => p.id);
      if (promptIds.length > 0) {
        const placeholders = promptIds.map((_, i) => `$${i + 2}`).join(', ');
        const favResult = await (
          await import('../config/database')
        ).default.query(
          `SELECT prompt_id FROM prompt_favorites WHERE user_id = $1 AND prompt_id IN (${placeholders})`,
          [userId, ...promptIds]
        );
        const favSet = new Set(favResult.rows.map((r: any) => r.prompt_id));
        prompts.forEach((p: any) => {
          p.is_favorited = favSet.has(p.id);
        });
      }
    }

    res.json({
      success: true,
      data: prompts,
      pagination: { page: params.page!, limit: params.limit!, total, totalPages },
    });
  } catch (error) {
    next(error);
  }
};

export const getPromptById = async (
  req: Request,
  res: Response<ApiResponse<any>>,
  next: NextFunction
) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return next(new AppError('Invalid prompt ID', 400));

    const userId = (req as AuthRequest).user?.id;
    const prompt = await PromptModel.getPromptWithUserFavorite(id, userId);
    if (!prompt) return next(new AppError('Prompt not found', 404));

    res.json({ success: true, data: prompt });
  } catch (error) {
    next(error);
  }
};

export const getRelatedPrompts = async (
  req: Request,
  res: Response<ApiResponse<any[]>>,
  next: NextFunction
) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return next(new AppError('Invalid prompt ID', 400));

    const related = await PromptModel.getRelatedPrompts(id, 6);
    res.json({ success: true, data: related });
  } catch (error) {
    next(error);
  }
};

export const getRatings = async (
  req: Request,
  res: Response<ApiResponse<any[]>>,
  next: NextFunction
) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return next(new AppError('Invalid prompt ID', 400));

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const { ratings, total } = await RatingModel.getRatingsByPromptId(id, page, limit);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: ratings,
      pagination: { page, limit, total, totalPages },
    });
  } catch (error) {
    next(error);
  }
};

export const createRating = async (
  req: AuthRequest,
  res: Response<ApiResponse<any>>,
  next: NextFunction
) => {
  try {
    if (!req.user) return next(new AppError('Authentication required', 401));

    const promptId = parseInt(req.params.id);
    if (isNaN(promptId)) return next(new AppError('Invalid prompt ID', 400));

    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return next(new AppError('Rating must be between 1 and 5', 400));
    }

    // 检查提示词是否存在
    const prompt = await PromptModel.getPromptById(promptId);
    if (!prompt || prompt.status !== 'approved') {
      return next(new AppError('Prompt not found', 404));
    }

    const newRating = await RatingModel.createRating(
      req.user.id,
      promptId,
      rating,
      comment
    );

    // 更新评分统计
    await PromptModel.updateRatingStats(promptId);

    res.json({ success: true, data: newRating, message: '评价成功' });
  } catch (error) {
    next(error);
  }
};

export const toggleFavorite = async (
  req: AuthRequest,
  res: Response<ApiResponse<any>>,
  next: NextFunction
) => {
  try {
    if (!req.user) return next(new AppError('Authentication required', 401));

    const promptId = parseInt(req.params.id);
    if (isNaN(promptId)) return next(new AppError('Invalid prompt ID', 400));

    // 检查提示词是否存在
    const prompt = await PromptModel.getPromptById(promptId);
    if (!prompt || prompt.status !== 'approved') {
      return next(new AppError('Prompt not found', 404));
    }

    const currentlyFavorited = await FavoriteModel.isFavorited(req.user.id, promptId);

    if (currentlyFavorited) {
      await FavoriteModel.removeFavorite(req.user.id, promptId);
      res.json({ success: true, data: { is_favorited: false }, message: '已取消收藏' });
    } else {
      await FavoriteModel.addFavorite(req.user.id, promptId);
      res.json({ success: true, data: { is_favorited: true }, message: '收藏成功' });
    }
  } catch (error) {
    next(error);
  }
};

export const copyPrompt = async (
  req: AuthRequest,
  res: Response<ApiResponse<{ content: string }>>,
  next: NextFunction
) => {
  try {
    if (!req.user) return next(new AppError('Authentication required', 401));

    const promptId = parseInt(req.params.id);
    if (isNaN(promptId)) return next(new AppError('Invalid prompt ID', 400));

    const prompt = await PromptModel.getPromptById(promptId);
    if (!prompt || prompt.status !== 'approved') {
      return next(new AppError('Prompt not found', 404));
    }

    // 检查权限：VIP内容需要会员权限或单独购买
    if (prompt.required_level !== 'free') {
      const userLevel = req.user.role === 'admin' ? 'svip' : (await getUserLevel(req.user.id));

      // 检查是否拥有会员权限
      const hasMembershipAccess =
        (prompt.required_level === 'vip' && ['vip', 'svip'].includes(userLevel)) ||
        (prompt.required_level === 'svip' && userLevel === 'svip');

      // 如果没有会员权限，检查是否已单独购买该提示词
      if (!hasMembershipAccess) {
        const hasPurchased = await PaymentModel.hasUserPurchasedPrompt(req.user.id, promptId);
        if (!hasPurchased) {
          return res.status(403).json({
            success: false,
            error: `该提示词需要${prompt.required_level.toUpperCase()}会员权限或单独购买`,
            required_level: prompt.required_level,
          });
        }
      }
    }

    // 增加复制计数
    await PromptModel.incrementCopyCount(promptId);

    res.json({ success: true, data: { content: prompt.content }, message: '复制成功' });
  } catch (error) {
    next(error);
  }
};

export const getUserFavorites = async (
  req: AuthRequest,
  res: Response<ApiResponse<any[]>>,
  next: NextFunction
) => {
  try {
    if (!req.user) return next(new AppError('Authentication required', 401));

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const { favorites, total } = await FavoriteModel.getUserFavorites(req.user.id, page, limit);
    const totalPages = Math.ceil(total / limit);

    // 标记全部为已收藏
    favorites.forEach((f: any) => { f.is_favorited = true; });

    res.json({
      success: true,
      data: favorites,
      pagination: { page, limit, total, totalPages },
    });
  } catch (error) {
    next(error);
  }
};

export const getPromptFilterOptions = async (
  req: Request,
  res: Response<ApiResponse<any>>,
  next: NextFunction
) => {
  try {
    const cacheKey = 'prompt_filter_options';
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return res.json({ success: true, data: JSON.parse(cached) });
    }

    const [categories, difficulties] = await Promise.all([
      TagModel.getAllCategories(),
      Promise.resolve([
        { value: 'beginner', label: '新手' },
        { value: 'intermediate', label: '进阶' },
        { value: 'expert', label: '专业' },
      ]),
    ]);

    const tagsByCategory: Record<string, any[]> = {};
    for (const category of categories) {
      const tags = await TagModel.getTagsByCategory(category);
      tagsByCategory[category] = tags.map(t => ({ id: t.id, name: t.name }));
    }

    const tools = [
      { value: 'runway', label: 'Runway' },
      { value: 'pika', label: 'Pika' },
      { value: 'kling', label: '可灵' },
      { value: 'jimeng', label: '即梦' },
      { value: 'sora', label: 'Sora' },
    ];

    const data = { tagsByCategory, difficulties, tools };
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(data));

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// 辅助函数：获取用户当前等级
async function getUserLevel(userId: number): Promise<string> {
  const { default: pool } = await import('../config/database');
  const result = await pool.query(
    `SELECT level, level_expires_at FROM users WHERE id = $1`,
    [userId]
  );
  if (result.rows.length === 0) return 'normal';

  const { level, level_expires_at } = result.rows[0];
  // 检查是否过期
  if (level !== 'normal' && level_expires_at && new Date(level_expires_at) < new Date()) {
    await pool.query(
      'UPDATE users SET level = \'normal\', level_expires_at = NULL, updated_at = NOW() WHERE id = $1',
      [userId]
    );
    return 'normal';
  }
  return level;
}
