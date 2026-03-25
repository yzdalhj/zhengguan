import { Request, Response, NextFunction } from 'express';
import * as TagModel from '../models/tag';
import { ApiResponse, Tag } from '../types';
import redisClient from '../config/redis';

export const getTags = async (
  req: Request,
  res: Response<ApiResponse<Tag[]>>,
  next: NextFunction
) => {
  try {
    const category = req.query.category as string | undefined;
    
    const cacheKey = category ? `tags:${category}` : 'tags:all';
    const cached = await redisClient.get(cacheKey);
    
    if (cached) {
      return res.json({
        success: true,
        data: JSON.parse(cached),
      });
    }

    const tags = await TagModel.getAllTags(category);
    
    const groupedByCategory = tags.reduce((acc: Record<string, Tag[]>, tag) => {
      const cat = tag.category || 'uncategorized';
      if (!acc[cat]) {
        acc[cat] = [];
      }
      acc[cat].push(tag);
      return acc;
    }, {});

    await redisClient.setEx(cacheKey, 3600, JSON.stringify(tags));

    const seoKeywords = tags.map(t => t.name).join(', ');

    res.json({
      success: true,
      data: tags,
      ...{
        seo: {
          title: category ? `${category} - 标签分类 | 影视分镜参考库` : '所有标签 | 影视分镜参考库',
          description: `浏览${category || ''}相关的影视分镜参考标签，找到你需要的动作、镜头、场景参考素材。`,
          keywords: seoKeywords,
        },
        grouped: groupedByCategory,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getCategories = async (
  req: Request,
  res: Response<ApiResponse<string[]>>,
  next: NextFunction
) => {
  try {
    const cacheKey = 'categories:all';
    const cached = await redisClient.get(cacheKey);
    
    if (cached) {
      return res.json({
        success: true,
        data: JSON.parse(cached),
      });
    }

    const categories = await TagModel.getAllCategories();
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(categories));

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};
