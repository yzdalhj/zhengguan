export interface User {
  id: number
  username: string
  email: string
  phone?: string
  phone_verified?: boolean
  role: string
  points: number
  level: string
  level_expires_at?: string
  total_points_earned: number
  created_at: string
  updated_at: string
}

export interface Video {
  id: number
  external_id?: string
  platform: 'bilibili' | 'youtube'
  title: string
  description?: string
  embed_url?: string
  external_url?: string
  thumbnail_url?: string
  duration?: number
  quality?: string
  views: number
  likes: number
  upload_date?: string
  source_film?: string
  status?: string
  created_at: string
  updated_at: string
  author?: string
  tags?: Tag[]
}

export interface Tag {
  id: number
  name: string
  category?: string
  created_at?: string
}

export interface Collection {
  id: number
  user_id?: number
  video_id?: number
  created_at?: string
  video?: Video
}

export interface SEOMetadata {
  title: string
  description: string
  keywords?: string
  openGraph?: {
    title: string
    description: string
    image?: string
    type: 'website' | 'video'
    video?: string
  }
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  error?: string
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
