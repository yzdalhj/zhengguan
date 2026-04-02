<template>
  <div v-if="prompt" class="max-w-7xl mx-auto px-5 py-6">
    <!-- 面包屑 -->
    <nav class="flex items-center gap-2 text-sm text-(--text-muted) mb-6">
      <NuxtLink to="/prompts" class="hover:text-primary transition-colors">提示词库</NuxtLink>
      <Icon name="heroicons:chevron-right" class="w-4 h-4" />
      <span class="text-(--text-primary) truncate max-w-xs">{{ prompt.title }}</span>
    </nav>

    <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <!-- 左侧：预览图 + 提示词内容 -->
      <div class="lg:col-span-3 space-y-5">
        <!-- 预览图 -->
        <div class="rounded-xl overflow-hidden bg-(--bg-elevated) border border-(--border-color)">
          <div class="relative aspect-video">
            <img
              v-if="prompt.preview_images?.length > 0"
              :src="prompt.preview_images[currentImageIndex]"
              :alt="prompt.title"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full flex items-center justify-center bg-linear-to-br from-purple-900/20 to-indigo-900/20">
              <Icon name="heroicons:sparkles" class="w-16 h-16 text-purple-400/40" />
            </div>

            <!-- 图片切换 -->
            <div v-if="prompt.preview_images?.length > 1" class="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              <button
                v-for="(_, index) in prompt.preview_images"
                :key="index"
                @click="currentImageIndex = index"
                class="w-2 h-2 rounded-full transition-colors"
                :class="index === currentImageIndex ? 'bg-white' : 'bg-white/50'"
              />
            </div>

            <!-- VIP遮罩 -->
            <div
              v-if="prompt.required_level !== 'free' && !isAccessible"
              class="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center"
            >
              <Icon name="heroicons:lock-closed" class="w-12 h-12 text-white/80 mb-3" />
              <p class="text-white font-semibold mb-1">VIP专属内容</p>
              <p class="text-white/70 text-sm mb-4">开通{{ prompt.required_level === 'svip' ? 'SVIP' : 'VIP' }}会员查看完整提示词</p>
              <NuxtLink
                to="/vip"
                class="px-6 py-2 bg-linear-to-r from-purple-500 to-pink-500 text-white rounded-full text-sm font-medium hover:from-purple-600 hover:to-pink-600 transition-colors"
              >
                立即开通
              </NuxtLink>
            </div>
          </div>
        </div>

        <!-- 标题和标签 -->
        <div>
          <div class="flex items-start justify-between gap-4">
            <div>
              <h1 class="text-xl font-bold text-(--text-primary)">{{ prompt.title }}</h1>
              <p v-if="prompt.subtitle" class="text-sm text-(--text-secondary) mt-1">{{ prompt.subtitle }}</p>
            </div>
            <button
              @click="handleFavorite"
              class="shrink-0 p-2 rounded-lg transition-colors"
              :class="prompt.is_favorited ? 'text-red-500 bg-red-500/10' : 'text-(--text-muted) hover:text-red-400 hover:bg-red-500/10'"
            >
              <Icon name="heroicons:heart" class="w-5 h-5" />
            </button>
          </div>

          <!-- 标签 -->
          <div v-if="prompt.tags?.length" class="flex flex-wrap gap-2 mt-3">
            <span
              v-for="tag in prompt.tags"
              :key="tag.id"
              class="px-2.5 py-1 bg-(--bg-elevated) text-(--text-secondary) rounded-full text-xs border border-(--border-color)"
            >
              {{ tag.name }}
            </span>
          </div>
        </div>

        <!-- 提示词内容 -->
        <div class="rounded-xl bg-(--bg-elevated) border border-(--border-color) p-5">
          <div class="flex items-center justify-between mb-3">
            <h2 class="text-sm font-semibold text-(--text-primary) flex items-center gap-2">
              <Icon name="heroicons:document-text" class="w-4 h-4 text-primary" />
              提示词
            </h2>
            <copy-button
              v-if="isAccessible"
              :prompt-id="prompt.id"
              :required-level="prompt.required_level"
              size="sm"
              @need-vip="navigateTo('/vip')"
            />
          </div>
          <div
            class="text-sm text-(--text-primary) leading-relaxed whitespace-pre-wrap font-mono"
            :class="{ 'blur-md select-none': !isAccessible }"
          >
            {{ prompt.content }}
          </div>
        </div>

        <!-- 评价区域 -->
        <div class="rounded-xl bg-(--bg-elevated) border border-(--border-color) p-5">
          <h2 class="text-sm font-semibold text-(--text-primary) flex items-center gap-2 mb-4">
            <Icon name="heroicons:chat-bubble-left-right" class="w-4 h-4 text-primary" />
            评价 ({{ prompt.rating_count }})
          </h2>

          <!-- 提交评价 -->
          <div v-if="userStore.isAuthenticated" class="mb-5 pb-5 border-b border-(--border-color)">
            <div class="flex items-center gap-4">
              <rating-stars v-model="newRating" :readonly="!!userRating" />
              <input
                v-model="newComment"
                type="text"
                placeholder="说点什么..."
                class="flex-1 h-8 px-3 text-sm bg-(--bg-primary) border border-(--border-color) rounded-lg text-(--text-primary) placeholder-(--text-muted) focus:outline-none focus:border-primary"
                @keyup.enter="submitRating"
              />
              <button
                @click="submitRating"
                :disabled="!newRating"
                class="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                提交
              </button>
            </div>
          </div>

          <!-- 评价列表 -->
          <div v-if="ratings.length > 0" class="space-y-4 max-h-80 overflow-y-auto">
            <div v-for="rating in ratings" :key="rating.id" class="flex gap-3">
              <div class="w-8 h-8 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-medium shrink-0">
                {{ (rating.username || 'U').charAt(0).toUpperCase() }}
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <span class="text-sm font-medium text-(--text-primary)">{{ rating.username || '匿名用户' }}</span>
                  <rating-stars :model-value="rating.rating" :readonly="true" :show-count="false" />
                  <span class="text-xs text-(--text-muted)">{{ formatTimeAgo(rating.created_at) }}</span>
                </div>
                <p v-if="rating.comment" class="text-sm text-(--text-secondary) mt-1">{{ rating.comment }}</p>
              </div>
            </div>
          </div>
          <p v-else class="text-sm text-(--text-muted) text-center py-4">暂无评价，快来第一个评价吧</p>
        </div>
      </div>

      <!-- 右侧：信息面板 -->
      <div class="lg:col-span-2 space-y-5">
        <!-- 信息卡片 -->
        <div class="rounded-xl bg-(--bg-elevated) border border-(--border-color) p-5 space-y-4">
          <h3 class="text-sm font-semibold text-(--text-primary)">详细信息</h3>

          <!-- 难度 -->
          <div class="flex items-center justify-between">
            <span class="text-sm text-(--text-secondary)">难度等级</span>
            <span class="text-sm font-medium" :class="difficultyColor">{{ difficultyLabel }}</span>
          </div>

          <!-- 适用工具 -->
          <div class="flex items-center justify-between">
            <span class="text-sm text-(--text-secondary)">适用工具</span>
            <div class="flex gap-1.5">
              <span
                v-for="tool in prompt.applicable_tools"
                :key="tool"
                class="px-2 py-0.5 bg-(--bg-primary) text-(--text-secondary) rounded text-xs"
              >{{ tool }}</span>
            </div>
          </div>

          <!-- 复制次数 -->
          <div class="flex items-center justify-between">
            <span class="text-sm text-(--text-secondary)">复制次数</span>
            <span class="text-sm text-(--text-primary)">{{ formatNumber(prompt.copy_count) }}</span>
          </div>

          <!-- 评分 -->
          <div class="flex items-center justify-between">
            <span class="text-sm text-(--text-secondary)">平均评分</span>
            <div class="flex items-center gap-1">
              <Icon name="heroicons:star" class="w-4 h-4 text-amber-400" />
              <span class="text-sm text-(--text-primary)">{{ Number(prompt.rating_avg || 0).toFixed(1) }}</span>
            </div>
          </div>

          <!-- 参数建议 -->
          <div v-if="prompt.params && Object.keys(prompt.params).length > 0">
            <span class="text-sm text-(--text-secondary) block mb-2">参数建议</span>
            <div class="space-y-1.5">
              <div v-for="(value, key) in prompt.params" :key="key" class="flex items-center justify-between text-xs">
                <span class="text-(--text-muted)">{{ key }}</span>
                <span class="text-(--text-primary) font-mono bg-(--bg-primary) px-2 py-0.5 rounded">{{ value }}</span>
              </div>
            </div>
          </div>

          <!-- 价格（非免费） -->
          <div v-if="prompt.required_level !== 'free' && prompt.price > 0" class="pt-3 border-t border-(--border-color)">
            <div class="flex items-center justify-between">
              <span class="text-sm text-(--text-secondary)">单独购买</span>
              <span class="text-lg font-bold text-primary">&yen;{{ prompt.price }}</span>
            </div>
          </div>
        </div>

        <!-- 相关推荐 -->
        <div v-if="relatedPrompts.length > 0" class="rounded-xl bg-(--bg-elevated) border border-(--border-color) p-5">
          <h3 class="text-sm font-semibold text-(--text-primary) mb-3">相关推荐</h3>
          <div class="space-y-3">
            <NuxtLink
              v-for="rp in relatedPrompts.slice(0, 5)"
              :key="rp.id"
              :to="`/prompt/${rp.id}`"
              class="flex items-center gap-3 group"
            >
              <div class="w-14 h-10 rounded bg-(--bg-secondary) overflow-hidden shrink-0">
                <img
                  v-if="rp.preview_images?.length > 0"
                  :src="rp.preview_images[0]"
                  class="w-full h-full object-cover"
                />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-xs text-(--text-primary) truncate group-hover:text-primary transition-colors">{{ rp.title }}</p>
                <div class="flex items-center gap-1 mt-0.5">
                  <Icon name="heroicons:star" class="w-3 h-3 text-amber-400" />
                  <span class="text-[10px] text-(--text-muted)">{{ rp.rating_avg?.toFixed(1) }}</span>
                </div>
              </div>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 加载中 -->
  <div v-else class="flex items-center justify-center py-40">
    <div class="text-center">
      <div class="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
      <p class="text-sm text-(--text-muted)">加载中...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Prompt, PromptRating } from '~/types'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const promptStore = usePromptStore()

const prompt = ref<Prompt | null>(null)
const ratings = ref<PromptRating[]>([])
const relatedPrompts = ref<Prompt[]>([])
const currentImageIndex = ref(0)
const newRating = ref(0)
const newComment = ref('')
const userRating = ref<PromptRating | null>(null)

const isAccessible = computed(() => {
  if (!prompt.value) return false
  if (prompt.value.required_level === 'free') return true
  const level = userStore.user?.level
  if (!level || level === 'normal') return false
  if (prompt.value.required_level === 'vip') return true
  if (prompt.value.required_level === 'svip') return level === 'svip'
  return false
})

const difficultyLabel = computed(() => {
  const map: Record<string, string> = { beginner: '新手', intermediate: '进阶', expert: '专业' }
  return map[prompt.value?.difficulty || 'beginner'] || '新手'
})

const difficultyColor = computed(() => {
  const map: Record<string, string> = { beginner: 'text-green-400', intermediate: 'text-amber-400', expert: 'text-red-400' }
  return map[prompt.value?.difficulty || 'beginner'] || 'text-green-400'
})

const handleFavorite = async () => {
  if (!userStore.isAuthenticated) {
    return
  }
  await promptStore.toggleFavorite(prompt.value!.id)
  if (prompt.value) {
    prompt.value.is_favorited = !prompt.value.is_favorited
  }
}

const submitRating = async () => {
  if (!newRating.value || !prompt.value) return
  try {
    await promptStore.ratePrompt(prompt.value.id, newRating.value, newComment.value || undefined)
    // 刷新评价列表
    await fetchRatings()
    newRating.value = 0
    newComment.value = ''
  } catch (error) {
    console.error('Failed to submit rating:', error)
  }
}

const fetchRatings = async () => {
  if (!prompt.value) return
  const { $api } = useNuxtApp()
  try {
    const response = await $api.get(`/prompts/${prompt.value.id}/ratings`, { params: { limit: 50 } })
    ratings.value = response.data
  } catch (error) {
    console.error('Failed to fetch ratings:', error)
  }
}

const formatNumber = (num: number): string => {
  if (!num) return '0'
  if (num >= 10000) return (num / 10000).toFixed(1) + '万'
  return num.toString()
}

const formatTimeAgo = (date: string): string => {
  const now = new Date()
  const past = new Date(date)
  const diffMs = now.getTime() - past.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays > 0) return `${diffDays}天前`
  if (diffHours > 0) return `${diffHours}小时前`
  if (diffMins > 0) return `${diffMins}分钟前`
  return '刚刚'
}

onMounted(async () => {
  const id = parseInt(route.params.id as string)
  if (isNaN(id)) {
    router.push('/prompts')
    return
  }

  try {
    const data = await promptStore.fetchPromptById(id)
    prompt.value = data

    // 设置页面标题
    if (data) {
      useHead({
        title: `${data.title} | 帧观 AI`,
        meta: [
          { name: 'description', content: data.subtitle || `AI视频提示词：${data.title}` }
        ]
      })
    }

    // 并行加载评价和相关推荐
    await Promise.all([
      fetchRatings(),
      promptStore.fetchRelatedPrompts(id).then(res => { relatedPrompts.value = res }),
    ])
  } catch (error) {
    router.push('/prompts')
  }
})
</script>
