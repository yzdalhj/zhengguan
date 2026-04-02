export interface User {
  id: number;
  username: string;
  email: string;
  phone?: string;
  phone_verified?: boolean;
  password_hash?: string;
  role: string;
  points: number;
  level: string;
  level_expires_at?: Date;
  total_points_earned: number;
  created_at: Date;
  updated_at: Date;
}

export interface SmsCode {
  id: number;
  phone: string;
  code: string;
  purpose: string;
  created_at: Date;
  expires_at: Date;
  used: boolean;
}

export interface RefreshToken {
  id: number;
  user_id: number;
  token: string;
  user_agent?: string;
  ip_address?: string;
  created_at: Date;
  expires_at: Date;
  revoked: boolean;
}

export interface QrcodeLogin {
  id: number;
  code: string;
  user_id?: number;
  status: string;
  created_at: Date;
  expires_at: Date;
  scanned_at?: Date;
  confirmed_at?: Date;
}

export interface UserPointsHistory {
  id: number;
  user_id: number;
  points_change: number;
  points_balance: number;
  reason: string;
  description?: string;
  created_at: Date;
}

export type LoginType = 'password' | 'sms' | 'qrcode';

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

export interface WatchHistory {
  id: number;
  user_id: number;
  video_id: number;
  progress: number;
  watched_at: Date;
  created_at: Date;
  updated_at: Date;
  video?: Video;
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

// =============================================
// 提示词相关类型
// =============================================

export interface Prompt {
  id: number;
  title: string;
  subtitle?: string;
  content: string;
  preview_images: string[];
  difficulty: 'beginner' | 'intermediate' | 'expert';
  applicable_tools: string[];
  params: Record<string, any>;
  required_level: 'free' | 'vip' | 'svip';
  price: number;
  copy_count: number;
  rating_avg: number;
  rating_count: number;
  status: string;
  sort_order: number;
  tags?: Tag[];
  is_favorited?: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface PromptRating {
  id: number;
  user_id: number;
  prompt_id: number;
  rating: number;
  comment?: string;
  user?: { username: string };
  created_at: Date;
}

export interface PromptFavorite {
  user_id: number;
  prompt_id: number;
  created_at: Date;
}

export interface PromptSearchParams {
  page?: number;
  limit?: number;
  keyword?: string;
  tags?: number[];
  difficulty?: string;
  tool?: string;
  required_level?: string;
  sort?: string;
}

// =============================================
// 支付相关类型
// =============================================

export interface Payment {
  id: number;
  order_no: string;
  user_id: number;
  type: 'prompt' | 'membership';
  target_id?: number;
  amount: number;
  currency: string;
  payment_method?: string;
  status: 'pending' | 'paid' | 'expired' | 'refunded';
  trade_no?: string;
  paid_at?: Date;
  expire_at?: Date;
  created_at: Date;
}

export interface Membership {
  id: number;
  user_id: number;
  level: 'vip' | 'svip';
  start_date: Date;
  end_date: Date;
  auto_renew: boolean;
  payment_id?: number;
  created_at: Date;
  updated_at: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  required_level?: string;
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
