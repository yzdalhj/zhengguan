import { Request, Response, NextFunction } from 'express';
import * as VideoModel from '../models/video';
import { AppError } from '../middleware/errorHandler';
import { ApiResponse, Video, VideoSearchParams } from '../types';
import redisClient from '../config/redis';

export const getVideos = async (
  req: Request,
  res: Response<ApiResponse<Video[]>>,
  next: NextFunction
) => {
  try {
    const {
      page = 1,
      limit = 20,
      keyword,
      tags,
      min_duration,
      max_duration,
      platform,
      sort,
    } = req.query;

    const parsedTags = tags
      ? (Array.isArray(tags) ? tags : [tags]).map(Number).filter(t => !isNaN(t))
      : undefined;

    const params: VideoSearchParams = {
      page: Number(page),
      limit: Number(limit),
      keyword: keyword as string,
      tags: parsedTags && parsedTags.length > 0 ? parsedTags : undefined,
      min_duration: min_duration ? Number(min_duration) : undefined,
      max_duration: max_duration ? Number(max_duration) : undefined,
      platform: platform as string,
      sort: sort as string,
    };

    const cacheKey = `videos:${JSON.stringify(params)}`;
    
    const cachedResult = await redisClient.get(cacheKey);
    if (cachedResult && !keyword) {
      return res.json({
        success: true,
        data: JSON.parse(cachedResult).videos,
        pagination: JSON.parse(cachedResult).pagination,
      });
    }

    const { videos, total } = await VideoModel.searchVideos(params);

    const totalPages = Math.ceil(total / params.limit!);

    if (!keyword) {
      await redisClient.setEx(cacheKey, 300, JSON.stringify({
        videos,
        pagination: {
          page: params.page!,
          limit: params.limit!,
          total,
          totalPages,
        },
      }));
    }

    const metadata = generateSEOMetadata(videos);

    res.json({
      success: true,
      data: videos,
      pagination: {
        page: params.page!,
        limit: params.limit!,
        total,
        totalPages,
      },
      ...metadata,
    });
  } catch (error) {
    next(error);
  }
};

export const getVideoById = async (
  req: Request,
  res: Response<ApiResponse<Video>>,
  next: NextFunction
) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return next(new AppError('Invalid video ID', 400));
    }

    const video = await VideoModel.getVideoById(id);
    if (!video || video.status !== 'approved') {
      return next(new AppError('Video not found', 404));
    }

    await VideoModel.incrementViews(id);

    const seoMetadata = {
      title: `${video.title} | 影视分镜参考库`,
      description: video.description || `${video.title} - 优质影视分镜参考片段，适用于视频创作参考`,
      openGraph: {
        title: `${video.title} | 影视分镜参考库`,
        description: video.description || `${video.title} - 优质影视分镜参考片段`,
        image: video.thumbnail_url,
        type: 'video' as const,
        video: video.embed_url,
      },
    };

    res.json({
      success: true,
      data: video,
      message: undefined,
      ...{ seo: seoMetadata },
    });
  } catch (error) {
    next(error);
  }
};

export const getSuggestions = async (
  req: Request,
  res: Response<ApiResponse<string[]>>,
  next: NextFunction
) => {
  try {
    const q = (req.query.q as string) || '';
    if (q.length < 2) {
      return res.json({ success: true, data: [] });
    }

    const cacheKey = `suggestions:${q.toLowerCase()}`;
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return res.json({ success: true, data: JSON.parse(cached) });
    }

    const result = await VideoModel.searchVideos({
      keyword: q,
      page: 1,
      limit: 10,
    });

    const suggestions = result.videos.slice(0, 5).map(v => v.title);
    
    await redisClient.setEx(cacheKey, 86400, JSON.stringify(suggestions));

    res.json({
      success: true,
      data: suggestions,
    });
  } catch (error) {
    next(error);
  }
};

const generateSEOMetadata = (videos: Video[]) => {
  const keywords = videos
    .flatMap(v => v.tags?.map(t => t.name) || [])
    .slice(0, 10)
    .join(', ');

  return {
    seo: {
      title: keywords ? `影视分镜参考 - ${keywords}` : '影视分镜参考库',
      description: '搜索优质影视分镜、动作场面、打斗镜头参考，为视频创作提供灵感。所有内容均通过第三方平台外链展示，供创作参考。',
      keywords: keywords || '影视分镜,动作参考,视频创作,镜头参考',
    },
  };
};
