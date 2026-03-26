import axios from 'axios';
import { demoVideos, demoTags } from '@/mock/demoData';
import type { ApiResponse } from '@/types';

const useMock = import.meta.env.MODE === 'development' && !import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
});

// Mock response for development without backend
const mockResponse = (url: string, params?: any): any => {
  if (url === '/api/videos') {
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    return {
      success: true,
      data: demoVideos.slice((page - 1) * limit, page * limit),
      pagination: {
        page,
        limit,
        total: demoVideos.length,
        totalPages: Math.ceil(demoVideos.length / limit),
      },
    };
  }

  if (url === '/api/tags') {
    const category = params?.category;
    let tags = demoTags;
    if (category) {
      tags = demoTags.filter(t => t.category === category);
    }
    return {
      success: true,
      data: tags,
    };
  }

  if (url.startsWith('/api/videos/') && url.endsWith('/ai-prompt')) {
    // Mock AI prompt generation
    return {
      success: true,
      data: {
        prompt: 'Sample prompt for this video',
        prompts: [
          'Sample prompt for Sora',
          'Sample prompt for Runway',
          'Sample prompt for Pika',
          '中文示例提示词',
        ],
      },
    };
  }

  if (url.startsWith('/api/videos/')) {
    const id = parseInt(url.split('/')[2]);
    const video = demoVideos.find(v => v.id === id);
    return {
      success: true,
      data: video,
    };
  }

  if (url === '/api/user/collections') {
    return {
      success: true,
      data: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
    };
  }

  return { success: true, data: [] };
};

api.interceptors.response.use(
  response => response.data,
  error => {
    console.error('API Error:', error);
    return Promise.reject(error.response?.data || error);
  }
);

export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

const get = async (url: string, params?: any): Promise<any> => {
  if (useMock) {
    return mockResponse(url, params);
  }
  return api.get(url, { params });
};

const post = async (url: string, data?: any): Promise<any> => {
  if (useMock && url === '/api/auth/login') {
    return {
      success: true,
      data: {
        token: 'mock-token',
        user: { id: 1, username: 'demo', email: 'demo@example.com', role: 'user' },
      },
    };
  }
  if (useMock && url === '/api/auth/register') {
    return { success: true, message: 'Registration successful' };
  }
  return api.post(url, data);
};

const put = async (url: string, data?: any): Promise<any> => {
  if (useMock) {
    return { success: true };
  }
  return api.put(url, data);
};

const del = async (url: string): Promise<any> => {
  if (useMock) {
    return { success: true };
  }
  return api.delete(url);
};

export default {
  get,
  post,
  put,
  delete: del,
  setAuthToken,
};
