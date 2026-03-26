export interface User {
  id: number;
  username: string;
  email: string;
  password_hash?: string;
  role: string;
  created_at: Date;
  updated_at: Date;
}

export interface Video {
  id: number;
  external_id: string;
  platform: string;
  title: string;
  description?: string;
  embed_url: string;
  thumbnail_url?: string;
  duration?: number;
  quality?: string;
  views: number;
  likes: number;
  upload_date?: Date;
  source_film?: string;
  status: string;
  created_at: Date;
  updated_at: Date;
  tags?: Tag[];
}

export interface Tag {
  id: number;
  name: string;
  category?: string;
  created_at: Date;
}

export interface Collection {
  id: number;
  user_id: number;
  video_id: number;
  created_at: Date;
  video?: Video;
}

export interface Report {
  id: number;
  user_id?: number;
  video_id: number;
  reason?: string;
  status: string;
  created_at: Date;
}

export interface VideoSearchParams {
  page?: number;
  limit?: number;
  keyword?: string;
  tags?: number[];
  min_duration?: number;
  max_duration?: number;
  platform?: string;
  sort?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  seo?: {
    title: string;
    description: string;
    keywords?: string;
  };
  grouped?: Record<string, Tag[]>;
}
