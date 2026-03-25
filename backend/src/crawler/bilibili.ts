import axios from 'axios';
import dotenv from 'dotenv';
import * as VideoModel from '../models/video';
import * as TagModel from '../models/tag';
import { Video } from '../types';

dotenv.config();

const BILIBILI_APP_KEY = process.env.BILIBILI_APP_KEY;
const BILIBILI_APP_SECRET = process.env.BILIBILI_APP_SECRET;
const BILIBILI_API_BASE = 'https://api.bilibili.com';

export interface BilibiliSearchOptions {
  keyword: string;
  page?: number;
  pageSize?: number;
}

export const searchBilibili = async (options: BilibiliSearchOptions) => {
  if (!BILIBILI_APP_KEY) {
    throw new Error('Bilibili API key not configured');
  }

  const { keyword, page = 1, pageSize = 50 } = options;

  try {
    const response = await axios.get(`${BILIBILI_API_BASE}/x/web-interface/search/all/v2`, {
      params: {
        keyword,
        page,
        pagesize: pageSize,
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    const items = response.data.data?.result?.filter((item: any) => item.result_type === 'video') || [];
    return {
      items: items.length > 0 ? items[0].data : [],
      page,
      total: response.data.data?.page?.count || 0,
    };
  } catch (error) {
    console.error('Bilibili search error:', error);
    throw error;
  }
};

export const getVideoInfo = async (bvid: string) => {
  try {
    const response = await axios.get(`${BILIBILI_API_BASE}/x/web-interface/view`, {
      params: { bvid },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (response.data.code !== 0) {
      throw new Error(response.data.message || 'Failed to get video info');
    }

    return response.data.data;
  } catch (error) {
    console.error('Bilibili get video info error:', error);
    throw error;
  }
};

export const autoTagVideo = (title: string, description: string): Promise<number[]> => {
  return new Promise(async (resolve) => {
    const tags = await TagModel.getAllTags();
    const matchedTagIds: number[] = [];

    const text = `${title.toLowerCase()} ${description.toLowerCase()}`;

    tags.forEach(tag => {
      const tagName = tag.name.toLowerCase();
      if (text.includes(tagName)) {
        matchedTagIds.push(tag.id);
      }
    });

    resolve(matchedTagIds);
  });
};

export const importBilibiliVideo = async (
  bvid: string,
  sourceFilm?: string,
  startTime?: number
): Promise<Video> => {
  const existing = await VideoModel.getVideoByExternalId(bvid);
  if (existing) {
    throw new Error('Video already exists');
  }

  const info = await getVideoInfo(bvid);
  if (!info) {
    throw new Error('Video not found');
  }

  const duration = info.duration;
  if (duration < 15 || duration > 600) {
    throw new Error(`Video duration ${duration}s is outside acceptable range (15s - 10min)`);
  }

  const viewCount = info.stat?.view || 0;
  if (viewCount < 1000) {
    throw new Error(`Video has only ${viewCount} views, minimum is 1000`);
  }

  const title = info.title;
  const description = info.desc;
  const thumbnailUrl = info.pic;
  const uploadDate = new Date(info.created * 1000);
  const likes = info.stat?.like || 0;

  let embedUrl = `//player.bilibili.com/player.html?bvid=${bvid}&page=1`;
  if (startTime) {
    embedUrl += `&t=${startTime}`;
  }

  const quality = '1080p';

  const video = await VideoModel.createVideo({
    external_id: bvid,
    platform: 'bilibili',
    title,
    description,
    embed_url: embedUrl,
    thumbnail_url: thumbnailUrl,
    duration,
    quality,
    views: viewCount,
    likes,
    upload_date: uploadDate,
    source_film: sourceFilm,
    status: 'pending',
  });

  const tagIds = await autoTagVideo(title, description);
  await VideoModel.addTagsToVideo(video.id, tagIds);

  if (info.tags && Array.isArray(info.tags)) {
    for (const tag of info.tags.slice(0, 5)) {
      const existingTag = await TagModel.getTagByName(tag);
      if (!existingTag) {
        await TagModel.createTag(tag, 'user');
      }
    }
  }

  return VideoModel.getVideoById(video.id) as Promise<Video>;
};

export default {
  searchBilibili,
  getVideoInfo,
  importBilibiliVideo,
  autoTagVideo,
};
