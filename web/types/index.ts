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

export interface ApiResponse<T = any> {
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

// =============================================
// 提示词相关类型
// =============================================

export interface Prompt {
  id: number
  title: string
  subtitle?: string
  content: string
  preview_images: string[]
  difficulty: 'beginner' | 'intermediate' | 'expert'
  applicable_tools: string[]
  params: Record<string, any>
  required_level: 'free' | 'vip' | 'svip'
  price: number
  copy_count: number
  rating_avg: number
  rating_count: number
  status: string
  sort_order: number
  tags?: Tag[]
  is_favorited?: boolean
  created_at: string
  updated_at: string
}

export interface PromptRating {
  id: number
  user_id: number
  prompt_id: number
  rating: number
  comment?: string
  username?: string
  created_at: string
}

export interface PromptFilterOptions {
  tagsByCategory: Record<string, { id: number; name: string }[]>
  difficulties: { value: string; label: string }[]
  tools: { value: string; label: string }[]
}

// =============================================
// 支付相关类型
// =============================================

export interface Payment {
  id: number
  order_no: string
  user_id: number
  type: 'prompt' | 'membership'
  target_id?: number
  amount: number
  currency: string
  payment_method?: string
  status: 'pending' | 'paid' | 'expired' | 'refunded'
  trade_no?: string
  paid_at?: string
  expire_at?: string
  created_at: string
}

export interface MembershipPlan {
  type: 'monthly' | 'yearly'
  price: number
  duration: number
  label: string
}

export interface MembershipBenefits {
  free: { label: string; features: string[] }
  vip: { label: string; features: string[]; plans: MembershipPlan[] }
  svip: { label: string; features: string[]; plans: MembershipPlan[] }
}
