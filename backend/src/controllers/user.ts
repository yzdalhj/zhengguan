import { Request, Response, NextFunction } from 'express';
import * as CollectionModel from '../models/collection';
import * as ReportModel from '../models/report';
import * as WatchHistoryModel from '../models/watchHistory';
import { AppError } from '../middleware/errorHandler';
import { ApiResponse, Collection, WatchHistory } from '../types';
import { AuthRequest } from '../middleware/auth';

export const getCollections = async (
  req: AuthRequest,
  res: Response<ApiResponse<Collection[]>>,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return next(new AppError('Not authenticated', 401));
    }

    const page = parseInt((req.query as any).page as string) || 1;
    const limit = parseInt((req.query as any).limit as string) || 20;

    const { collections, total } = await CollectionModel.getUserCollections(
      req.user.id,
      page,
      limit
    );

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: collections,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
      seo: {
        title: '我的收藏 | 影视分镜参考库',
        description: '查看你收藏的影视分镜参考素材',
      },
    });
  } catch (error) {
    next(error);
  }
};

export const addCollection = async (
  req: AuthRequest,
  res: Response<ApiResponse<void>>,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return next(new AppError('Not authenticated', 401));
    }

    const videoId = parseInt((req.params as any).videoId);
    if (isNaN(videoId)) {
      return next(new AppError('Invalid video ID', 400));
    }

    await CollectionModel.addCollection(req.user.id, videoId);

    res.json({
      success: true,
      message: 'Video added to collections',
    });
  } catch (error) {
    next(error);
  }
};

export const removeCollection = async (
  req: AuthRequest,
  res: Response<ApiResponse<void>>,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return next(new AppError('Not authenticated', 401));
    }

    const videoId = parseInt((req.params as any).videoId);
    if (isNaN(videoId)) {
      return next(new AppError('Invalid video ID', 400));
    }

    const success = await CollectionModel.removeCollection(req.user.id, videoId);

    if (!success) {
      return next(new AppError('Collection not found', 404));
    }

    res.json({
      success: true,
      message: 'Video removed from collections',
    });
  } catch (error) {
    next(error);
  }
};

// 检查视频是否已收藏
export const checkCollection = async (
  req: AuthRequest,
  res: Response<ApiResponse<{ isCollected: boolean }>>,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.json({
        success: true,
        data: { isCollected: false },
      });
    }

    const videoId = parseInt((req.params as any).videoId);
    if (isNaN(videoId)) {
      return next(new AppError('Invalid video ID', 400));
    }

    const isCollected = await CollectionModel.isVideoCollected(req.user.id, videoId);

    res.json({
      success: true,
      data: { isCollected },
    });
  } catch (error) {
    next(error);
  }
};

export const exportCollections = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return next(new AppError('Not authenticated', 401));
    }

    const collections = await CollectionModel.exportUserCollections(req.user.id);
    const exportData = collections.map(c => ({
      id: c.video?.id,
      title: c.video?.title,
      description: c.video?.description,
      embed_url: c.video?.embed_url,
      thumbnail_url: c.video?.thumbnail_url,
      duration: c.video?.duration,
      platform: c.video?.platform,
      source_film: c.video?.source_film,
      added_at: c.created_at,
    }));

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=my-collections.json`);
    res.send(JSON.stringify(exportData, null, 2));
  } catch (error) {
    next(error);
  }
};

export const reportVideo = async (
  req: AuthRequest,
  res: Response<ApiResponse<void>>,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return next(new AppError('Not authenticated', 401));
    }

    const { videoId, reason } = (req.body as any);
    if (!videoId) {
      return next(new AppError('Video ID is required', 400));
    }

    await ReportModel.createReport(req.user.id, videoId, reason);

    res.json({
      success: true,
      message: 'Report submitted successfully, we will review it soon',
    });
  } catch (error) {
    next(error);
  }
};

// 获取观看历史
export const getWatchHistory = async (
  req: AuthRequest,
  res: Response<ApiResponse<WatchHistory[]>>,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return next(new AppError('Not authenticated', 401));
    }

    const page = parseInt((req.query as any).page as string) || 1;
    const limit = parseInt((req.query as any).limit as string) || 100;

    const { history, total } = await WatchHistoryModel.getUserWatchHistory(
      req.user.id,
      page,
      limit
    );

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: history,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 添加观看记录
export const addWatchHistory = async (
  req: AuthRequest,
  res: Response<ApiResponse<WatchHistory>>,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return next(new AppError('Not authenticated', 401));
    }

    const { video_id, progress } = req.body;
    if (!video_id) {
      return next(new AppError('Video ID is required', 400));
    }

    const history = await WatchHistoryModel.addOrUpdateWatchHistory(
      req.user.id,
      video_id,
      progress
    );

    res.json({
      success: true,
      data: history,
      message: 'Watch history added',
    });
  } catch (error) {
    next(error);
  }
};

// 同步本地历史到服务器
export const syncWatchHistory = async (
  req: AuthRequest,
  res: Response<ApiResponse<void>>,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return next(new AppError('Not authenticated', 401));
    }

    const { items } = req.body;
    if (!Array.isArray(items)) {
      return next(new AppError('Items array is required', 400));
    }

    await WatchHistoryModel.syncWatchHistory(req.user.id, items);

    res.json({
      success: true,
      message: 'Watch history synced',
    });
  } catch (error) {
    next(error);
  }
};

// 删除单条观看记录
export const removeWatchHistory = async (
  req: AuthRequest,
  res: Response<ApiResponse<void>>,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return next(new AppError('Not authenticated', 401));
    }

    const videoId = parseInt((req.params as any).videoId);
    if (isNaN(videoId)) {
      return next(new AppError('Invalid video ID', 400));
    }

    const success = await WatchHistoryModel.removeFromWatchHistory(req.user.id, videoId);

    if (!success) {
      return next(new AppError('History record not found', 404));
    }

    res.json({
      success: true,
      message: 'History record removed',
    });
  } catch (error) {
    next(error);
  }
};

// 清空观看历史
export const clearWatchHistory = async (
  req: AuthRequest,
  res: Response<ApiResponse<void>>,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return next(new AppError('Not authenticated', 401));
    }

    await WatchHistoryModel.clearUserWatchHistory(req.user.id);

    res.json({
      success: true,
      message: 'Watch history cleared',
    });
  } catch (error) {
    next(error);
  }
};
