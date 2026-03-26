import { Request, Response, NextFunction } from 'express';
import * as VideoModel from '../models/video';
import * as TagModel from '../models/tag';
import * as UserModel from '../models/user';
import * as ReportModel from '../models/report';
import { AppError } from '../middleware/errorHandler';
import { ApiResponse, Video, Tag, User, Report } from '../types';
import redisClient from '../config/redis';

export const getPendingVideos = async (
  req: Request,
  res: Response<ApiResponse<Video[]>>,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const { videos, total } = await VideoModel.getPendingVideos(page, limit);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: videos,
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

export const approveVideo = async (
  req: Request,
  res: Response<ApiResponse<Video>>,
  next: NextFunction
) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return next(new AppError('Invalid video ID', 400));
    }

    const video = await VideoModel.updateVideoStatus(id, 'approved');
    if (!video) {
      return next(new AppError('Video not found', 404));
    }

    await redisClient.del('videos:*');

    res.json({
      success: true,
      data: video,
      message: 'Video approved successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const rejectVideo = async (
  req: Request,
  res: Response<ApiResponse<Video>>,
  next: NextFunction
) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return next(new AppError('Invalid video ID', 400));
    }

    const video = await VideoModel.updateVideoStatus(id, 'rejected');
    if (!video) {
      return next(new AppError('Video not found', 404));
    }

    await redisClient.del('videos:*');

    res.json({
      success: true,
      data: video,
      message: 'Video rejected',
    });
  } catch (error) {
    next(error);
  }
};

export const createTag = async (
  req: Request,
  res: Response<ApiResponse<Tag>>,
  next: NextFunction
) => {
  try {
    const { name, category } = req.body;
    if (!name) {
      return next(new AppError('Tag name is required', 400));
    }

    const existingTag = await TagModel.getTagByName(name);
    if (existingTag) {
      return next(new AppError('Tag already exists', 400));
    }

    const tag = await TagModel.createTag(name, category);
    await redisClient.del('tags:*');
    await redisClient.del('categories:*');

    res.status(201).json({
      success: true,
      data: tag,
      message: 'Tag created successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const updateTag = async (
  req: Request,
  res: Response<ApiResponse<Tag>>,
  next: NextFunction
) => {
  try {
    const id = parseInt(req.params.id);
    const { name, category } = req.body;
    
    if (isNaN(id)) {
      return next(new AppError('Invalid tag ID', 400));
    }
    
    if (!name) {
      return next(new AppError('Tag name is required', 400));
    }

    const tag = await TagModel.updateTag(id, name, category);
    if (!tag) {
      return next(new AppError('Tag not found', 404));
    }

    await redisClient.del('tags:*');
    await redisClient.del('categories:*');

    res.json({
      success: true,
      data: tag,
      message: 'Tag updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTag = async (
  req: Request,
  res: Response<ApiResponse<void>>,
  next: NextFunction
) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return next(new AppError('Invalid tag ID', 400));
    }

    const success = await TagModel.deleteTag(id);
    if (!success) {
      return next(new AppError('Tag not found', 404));
    }

    await redisClient.del('tags:*');
    await redisClient.del('categories:*');

    res.json({
      success: true,
      message: 'Tag deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getPendingReports = async (
  req: Request,
  res: Response<ApiResponse<Report[]>>,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const { reports, total } = await ReportModel.getPendingReports(page, limit);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: reports,
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

export const resolveReport = async (
  req: Request,
  res: Response<ApiResponse<Report>>,
  next: NextFunction
) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return next(new AppError('Invalid report ID', 400));
    }

    const report = await ReportModel.updateReportStatus(id, 'resolved');
    if (!report) {
      return next(new AppError('Report not found', 404));
    }

    res.json({
      success: true,
      data: report,
      message: 'Report resolved',
    });
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (
  req: Request,
  res: Response<ApiResponse<User[]>>,
  next: NextFunction
) => {
  try {
    const users = await UserModel.getAllUsers();
    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (
  req: Request,
  res: Response<ApiResponse<User>>,
  next: NextFunction
) => {
  try {
    const id = parseInt(req.params.id);
    const { role } = req.body;

    if (isNaN(id)) {
      return next(new AppError('Invalid user ID', 400));
    }

    if (!role) {
      return next(new AppError('Role is required', 400));
    }

    const user = await UserModel.updateUserRole(id, role);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res.json({
      success: true,
      data: user,
      message: 'User role updated',
    });
  } catch (error) {
    next(error);
  }
};

export const updateVideo = async (
  req: Request,
  res: Response<ApiResponse<Video>>,
  next: NextFunction
) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return next(new AppError('Invalid video ID', 400));
    }

    const updates = req.body;
    const { tags } = updates;

    delete updates.tags;

    const video = await VideoModel.updateVideo(id, updates);
    if (!video) {
      return next(new AppError('Video not found', 404));
    }

    if (Array.isArray(tags)) {
      await VideoModel.removeTagsFromVideo(id, []);
      await VideoModel.addTagsToVideo(id, tags);
    }

    await redisClient.del('videos:*');

    res.json({
      success: true,
      data: await VideoModel.getVideoById(id) as Video | undefined,
      message: 'Video updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const createVideo = async (
  req: Request,
  res: Response<ApiResponse<Video>>,
  next: NextFunction
) => {
  try {
    const { external_id, platform, title, description, embed_url, thumbnail_url, duration, quality, upload_date, source_film, status, tags } = req.body;

    if (!external_id || !platform || !title || !embed_url) {
      return next(new AppError('Required fields missing', 400));
    }

    const existing = await VideoModel.getVideoByExternalId(external_id);
    if (existing) {
      return next(new AppError('Video with this external ID already exists', 400));
    }

    const video = await VideoModel.createVideo({
      external_id,
      platform,
      title,
      description,
      embed_url,
      thumbnail_url,
      duration,
      quality,
      upload_date,
      source_film,
      status: status || 'pending',
      views: 0,
      likes: 0,
    });

    if (Array.isArray(tags)) {
      await VideoModel.addTagsToVideo(video.id, tags);
    }

    res.status(201).json({
      success: true,
      data: await VideoModel.getVideoById(video.id) as Video | undefined,
      message: 'Video created successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const deleteVideo = async (
  req: Request,
  res: Response<ApiResponse<void>>,
  next: NextFunction
) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return next(new AppError('Invalid video ID', 400));
    }

    const success = await VideoModel.deleteVideo(id);
    if (!success) {
      return next(new AppError('Video not found', 404));
    }

    await redisClient.del('videos:*');

    res.json({
      success: true,
      message: 'Video deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
