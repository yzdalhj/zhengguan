export interface User {
  id: number;
  username: string;
  email: string;
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

export interface SEOMetadata {
  title: string;
  description: string;
  keywords?: string;
  openGraph?: {
    title: string;
    description: string;
    image?: string;
    type: 'website' | 'video';
    video?: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  seo?: SEOMetadata;
}
