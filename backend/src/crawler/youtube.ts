import axios from 'axios';
import dotenv from 'dotenv';
import * as VideoModel from '../models/video';
import * as TagModel from '../models/tag';
import { Video } from '../types';

dotenv.config();

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

export interface YouTubeSearchOptions {
  keyword: string;
  maxResults?: number;
  pageToken?: string;
}

export const searchYouTube = async (options: YouTubeSearchOptions) => {
  if (!YOUTUBE_API_KEY) {
    throw new Error('YouTube API key not configured');
  }

  const { keyword, maxResults = 50, pageToken } = options;

  try {
    const response = await axios.get(`${YOUTUBE_API_BASE}/search`, {
      params: {
        key: YOUTUBE_API_KEY,
        q: keyword,
        part: 'id,snippet',
        type: 'video',
        maxResults,
        pageToken,
        videoEmbeddable: 'true',
      },
    });

    return {
      items: response.data.items,
      nextPageToken: response.data.nextPageToken,
      totalResults: response.data.pageInfo.totalResults,
    };
  } catch (error) {
    console.error('YouTube search error:', error);
    throw error;
  }
};

export const getVideoDetails = async (videoId: string) => {
  if (!YOUTUBE_API_KEY) {
    throw new Error('YouTube API key not configured');
  }

  try {
    const response = await axios.get(`${YOUTUBE_API_BASE}/videos`, {
      params: {
        key: YOUTUBE_API_KEY,
        id: videoId,
        part: 'contentDetails,statistics,snippet',
      },
    });

    return response.data.items[0];
  } catch (error) {
    console.error('YouTube get video details error:', error);
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

export const importYouTubeVideo = async (
  videoId: string,
  sourceFilm?: string,
  startTime?: number
): Promise<Video> => {
  const existing = await VideoModel.getVideoByExternalId(videoId);
  if (existing) {
    throw new Error('Video already exists');
  }

  const details = await getVideoDetails(videoId);
  if (!details) {
    throw new Error('Video not found');
  }

  const duration = parseISO8601Duration(details.contentDetails.duration);
  if (duration < 15 || duration > 600) {
    throw new Error(`Video duration ${duration}s is outside acceptable range (15s - 10min)`);
  }

  const viewCount = parseInt(details.statistics.viewCount) || 0;
  if (viewCount < 1000) {
    throw new Error(`Video has only ${viewCount} views, minimum is 1000`);
  }

  const title = details.snippet.title;
  const description = details.snippet.description;
  const thumbnailUrl = details.snippet.thumbnails.high?.url || details.snippet.thumbnails.default?.url;
  const uploadDate = new Date(details.snippet.publishedAt);
  const likes = parseInt(details.statistics.likeCount) || 0;

  let embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`;
  if (startTime) {
    embedUrl += `&start=${startTime}`;
  }

  const quality = estimateQuality(duration, details.contentDetails);

  const video = await VideoModel.createVideo({
    external_id: videoId,
    platform: 'youtube',
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

  return VideoModel.getVideoById(video.id) as Promise<Video>;
};

const parseISO8601Duration = (duration: string): number => {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;

  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');

  return hours * 3600 + minutes * 60 + seconds;
};

const estimateQuality = (duration: number, contentDetails: any): string => {
  return '1080p';
};

export default {
  searchYouTube,
  getVideoDetails,
  importYouTubeVideo,
  autoTagVideo,
};
