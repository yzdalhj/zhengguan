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

export const generateAIPrompt = async (
  req: Request,
  res: Response<ApiResponse<{ prompt: string; prompts: string[] }>>,
  next: NextFunction
) => {
  try {
    const videoId = parseInt(req.params.id);
    if (isNaN(videoId)) {
      return next(new AppError('Invalid video ID', 400));
    }

    const video = await VideoModel.getVideoById(videoId);
    if (!video || video.status !== 'approved') {
      return next(new AppError('Video not found', 404));
    }

    const tags = video.tags || [];
    const actionTags = tags.filter(t => t.category === '动作风格').map(t => t.name);
    const cameraTags = tags.filter(t => t.category === '镜头语言').map(t => t.name);
    const sceneTags = tags.filter(t => t.category === '场景').map(t => t.name);
    const moodTags = tags.filter(t => t.category === '情绪').map(t => t.name);
    
    // 生成不同风格的提示词
    const prompts = generatePrompts(video, actionTags, cameraTags, sceneTags, moodTags);
    
    // 主提示词
    const mainPrompt = prompts[0];

    res.json({
      success: true,
      data: {
        prompt: mainPrompt,
        prompts: prompts,
      },
    });
  } catch (error) {
    next(error);
  }
};

const generatePrompts = (
  video: Video,
  actionTags: string[],
  cameraTags: string[],
  sceneTags: string[],
  moodTags: string[]
): string[] => {
  const title = video.title;
  const description = video.description || '';
  
  // 组合所有标签
  const allTags = [...actionTags, ...cameraTags, ...sceneTags, ...moodTags];
  const tagsText = allTags.join(', ');

  // Sora 风格提示词
  const soraPrompt = [
    `${title || ''}`,
    description,
    tagsText,
    'cinematic, high quality, 4k, 60fps',
    'professional cinematography',
  ].filter(Boolean).join('. ');

  // Runway 风格提示词
  const runwayPrompt = [
    `Create a video: ${title || ''}`,
    description,
    `Style and techniques: ${tagsText}`,
    'High quality video, smooth motion, cinematic lighting',
    'Professional film production quality',
  ].filter(Boolean).join('\n');

  // Pika 风格提示词
  const pikaPrompt = [
    `${tagsText}`,
    title,
    description,
    '--ar 16:9',
    '--motion 2',
  ].filter(Boolean).join(' ');

  // 中文详细提示词（适合中文 AI 模型）
  const chinesePrompt = [
    `视频标题：${title}`,
    description ? `描述：${description}` : null,
    actionTags.length > 0 ? `动作风格：${actionTags.join('，')}` : null,
    cameraTags.length > 0 ? `镜头语言：${cameraTags.join('，')}` : null,
    sceneTags.length > 0 ? `场景：${sceneTags.join('，')}` : null,
    moodTags.length > 0 ? `情绪氛围：${moodTags.join('，')}` : null,
    '高质量电影级画质，流畅动作，专业影视拍摄',
  ].filter(Boolean).join('\n');

  return [soraPrompt, runwayPrompt, pikaPrompt, chinesePrompt];
};
