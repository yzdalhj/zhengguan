import { Request, Response, NextFunction } from 'express';
import * as CollectionModel from '../models/collection';
import * as ReportModel from '../models/report';
import { AppError } from '../middleware/errorHandler';
import { ApiResponse, Collection } from '../types';
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
