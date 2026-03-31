<template>
  <div class="px-6 py-6">
    <div v-if="loading" class="text-center py-20 text-(--text-secondary)">加载中...</div>

    <template v-else-if="video">
      <!-- 平台来源标识栏 -->
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-2">
          <Icon 
            v-if="video.platform === 'bilibili'" 
            name="simple-icons:bilibili" 
            class="w-5 h-5"
            style="color: #00A1D6;"
          />
          <Icon 
            v-else-if="video.platform === 'youtube'" 
            name="simple-icons:youtube" 
            class="w-5 h-5"
            style="color: #FF0000;"
          />
          <span class="text-sm text-(--text-secondary)">
            来自 {{ video.platform === 'bilibili' ? '哔哩哔哩' : 'YouTube' }}
          </span>
        </div>
        <a
          v-if="video.external_url"
          :href="video.external_url"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors"
          :class="video.platform === 'bilibili' 
            ? 'text-[#00A1D6] hover:bg-[#00A1D6]/10' 
            : 'text-[#FF0000] hover:bg-[#FF0000]/10'"
        >
          <span>在 {{ video.platform === 'bilibili' ? 'B站' : 'YouTube' }} 打开</span>
          <Icon name="heroicons:arrow-top-right-on-square" class="w-4 h-4" />
        </a>
      </div>

      <!-- 视频播放器 -->
      <div class="bg-(--bg-elevated) rounded-lg shadow overflow-hidden mb-4 border border-(--border-color)">
        <div class="aspect-video w-full">
          <iframe
            :src="embedUrl"
            frameborder="0"
            allowfullscreen
            class="w-full h-full"
            :title="video.title"
          ></iframe>
        </div>
      </div>

      <!-- 版权声明 -->
      <div class="mb-6 p-4 bg-(--bg-secondary) rounded-lg border border-(--border-color)">
        <div class="flex items-start gap-3">
          <Icon name="heroicons:information-circle" class="w-5 h-5" />
          <div>
            <p class="text-sm text-(--text-secondary)">
              <span class="font-medium text-(--text-primary)">版权说明：</span>
              本视频来自第三方平台公开链接，版权归原平台及上传者所有。本站仅提供索引服务，不存储任何视频文件。
            </p>
            <button 
              @click="openReportModal" 
              class="mt-2 text-sm text-(--text-muted) hover:text-red-500 transition-colors"
            >
              认为内容侵权？点击举报
            </button>
          </div>
        </div>
      </div>

      <!-- 视频信息 -->
      <div class="bg-(--bg-elevated) rounded-lg shadow overflow-hidden mb-6 border border-(--border-color)">
        <div class="p-6">
          <div class="flex justify-between items-start mb-4">
            <h1 class="text-2xl md:text-3xl font-bold text-(--text-primary)">{{ video.title }}</h1>
            <button
              v-if="isAuthenticated"
              @click="toggleCollection(videoId)"
              :class="[
                'px-4 py-2 rounded-md transition-colors flex items-center gap-2',
                isCollected
                  ? 'bg-red-100 text-red-600 hover:bg-red-200'
                  : 'bg-primary text-white hover:bg-primary-hover'
              ]"
            >
              <Icon :name="isCollected ? 'heroicons:heart' : 'heroicons:heart-solid'" class="w-5 h-5" />
              {{ isCollected ? '已收藏' : '收藏' }}
            </button>
          </div>

          <div v-if="video.source_film" class="mb-4 text-(--text-secondary)">
            <span>来源影片：</span>
            <span class="font-medium text-(--text-primary)">{{ video.source_film }}</span>
          </div>

          <div v-if="video.description" class="mb-6 text-(--text-secondary) leading-relaxed">
            {{ video.description }}
          </div>

          <div class="flex flex-wrap gap-2 mb-4">
            <span
              v-for="tag in video.tags"
              :key="tag.id"
              class="px-3 py-1 bg-(--bg-secondary) text-(--text-secondary) rounded-full text-sm hover:bg-(--bg-tertiary) hover:text-(--text-primary) transition-colors cursor-pointer"
              @click="router.push(`/search?tag=${tag.name}`)"
            >
              {{ tag.name }}
            </span>
          </div>

          <div class="flex items-center gap-6 text-sm text-(--text-muted) border-t border-(--border-color) pt-4">
            <span class="flex items-center gap-1">
              <Icon name="heroicons:eye" class="w-4 h-4" />
              {{ formatNumber(video.views) }} 观看
            </span>
            <span class="flex items-center gap-1">
              <Icon name="heroicons:thumb-up" class="w-4 h-4" />
              {{ formatNumber(video.likes) }} 点赞
            </span>
            <span v-if="video.duration" class="flex items-center gap-1">
              <Icon name="heroicons:clock" class="w-5 h-5" />
              {{ formatDuration(video.duration) }}
            </span>
            <span v-if="video.author" class="flex items-center gap-1">
              <Icon name="heroicons:user" class="w-4 h-4" />
              {{ video.author }}
            </span>
          </div>
        </div>
      </div>

      <!-- AI 提示词生成 -->
      <div class="bg-(--bg-elevated) rounded-lg shadow overflow-hidden mb-6 border border-(--border-color)">
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-bold text-(--text-primary)">AI 提示词生成</h2>
            <button
              @click="generateAIPrompt"
              :disabled="generatingPrompt"
              class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover disabled:opacity-50 flex items-center gap-2"
            >
              <Icon name="heroicons:sparkles" class="w-4 h-4" />
              {{ generatingPrompt ? '生成中...' : '生成提示词' }}
            </button>
          </div>
          <div v-if="aiPrompts.length > 0" class="space-y-4">
            <div v-for="(prompt, index) in aiPrompts" :key="index" class="relative">
              <div class="mb-1 text-sm font-medium text-(--text-secondary)">
                {{ getPromptName(index) }}
              </div>
              <div class="relative">
                <textarea
                  :value="prompt"
                  readonly
                  class="w-full px-3 py-2 bg-(--bg-secondary) border border-(--border-color) rounded-md text-sm h-32 text-(--text-primary) focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                ></textarea>
                <button
                  @click="copyPrompt(prompt)"
                  class="absolute top-2 right-2 px-2 py-1 bg-(--bg-elevated) border border-(--border-color) rounded text-xs text-(--text-secondary) hover:bg-(--bg-secondary) flex items-center gap-1"
                >
                  <Icon name="heroicons:document-duplicate" class="w-3 h-3" />
                  复制
                </button>
              </div>
            </div>
          </div>
          <div v-else class="text-(--text-muted) text-center py-8">
            <Icon name="heroicons:sparkles" class="w-4 h-4 inline" />
            <p>点击上方按钮生成适配不同 AI 视频生成平台的提示词</p>
          </div>
        </div>
      </div>

      <!-- 相关推荐 -->
      <div v-if="relatedVideos.length > 0" class="mt-8">
        <h2 class="text-2xl font-bold mb-4 text-(--text-primary)">相关推荐</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <video-card v-for="v in relatedVideos" :key="v.id" :video="v" />
        </div>
      </div>
    </template>

    <!-- 视频不存在 -->
    <div v-else class="text-center py-20">
      <Icon name="heroicons:video-camera-slash" class="w-16 h-16 mx-auto text-(--text-muted) mb-4" />
      <h3 class="text-xl font-medium text-(--text-primary) mb-2">视频不存在</h3>
      <p class="text-(--text-secondary) mb-6">该视频可能已被删除或下架</p>
      <NuxtLink
        to="/"
        class="px-6 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors"
      >
        返回首页
      </NuxtLink>
    </div>

    <!-- 举报弹窗 -->
    <div v-if="reportModalOpen" class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-(--bg-elevated) rounded-lg p-6 max-w-md w-full border border-(--border-color)">
        <h3 class="text-xl font-bold mb-4 text-(--text-primary)">举报视频</h3>
        <div class="space-y-3 mb-6">
          <label
            v-for="reason in reportReasons"
            :key="reason.value"
            class="flex items-center gap-3 p-3 rounded-lg border border-(--border-color) cursor-pointer hover:bg-(--bg-secondary) transition-colors"
            :class="{ 'border-primary bg-primary/5': selectedReportReason === reason.value }"
          >
            <input
              v-model="selectedReportReason"
              type="radio"
              :value="reason.value"
              class="w-4 h-4 text-primary"
            />
            <span class="text-(--text-secondary)">{{ reason.label }}</span>
          </label>
        </div>
        <div class="flex gap-3">
          <button
            @click="reportModalOpen = false"
            class="flex-1 px-4 py-2 text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--bg-secondary) rounded-lg transition-colors"
          >
            取消
          </button>
          <button
            @click="submitReport"
            :disabled="!selectedReportReason || submittingReport"
            class="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {{ submittingReport ? '提交中...' : '提交举报' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Video } from '~/types'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const isAuthenticated = computed(() => userStore.isAuthenticated)
const { isCollected, checkCollection, toggleCollection } = useCollection()

const video = ref<Video | null>(null)
const loading = ref(true)
const relatedVideos = ref<Video[]>([])

// AI 提示词
const aiPrompts = ref<string[]>([])
const generatingPrompt = ref(false)

// 举报
const reportModalOpen = ref(false)
const selectedReportReason = ref('')
const submittingReport = ref(false)
const reportReasons = [
  { value: 'copyright', label: '侵犯版权' },
  { value: 'inappropriate', label: '内容不当' },
  { value: 'misleading', label: '误导性内容' },
  { value: 'other', label: '其他原因' },
]

const videoId = computed(() => Number(route.params.id))

const embedUrl = computed(() => {
  if (!video.value) return ''
  return video.value.embed_url || ''
})

const formatNumber = (num: number): string => {
  if (!num) return '0'
  if (num >= 100000000) return (num / 100000000).toFixed(1) + '亿'
  if (num >= 10000) return (num / 10000).toFixed(1) + '万'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}

const formatDuration = (seconds: number): string => {
  if (!seconds) return '00:00'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const getPromptName = (index: number): string => {
  const names = ['即梦提示词', '可灵提示词', 'Runway提示词', 'Pika提示词']
  return names[index] || `提示词 ${index + 1}`
}

const copyPrompt = async (prompt: string) => {
  try {
    await navigator.clipboard.writeText(prompt)
    // 可以在这里添加复制成功的提示
  } catch (err) {
    console.error('复制失败:', err)
  }
}

const generateAIPrompt = async () => {
  if (!video.value) return
  generatingPrompt.value = true
  try {
    const { $api } = useNuxtApp()
    const res = await $api.post('/ai/generate-prompt', {
      video_id: video.value.id,
    })
    aiPrompts.value = res.data?.prompts || []
  } catch (err) {
    console.error('生成提示词失败:', err)
  } finally {
    generatingPrompt.value = false
  }
}

const openReportModal = () => {
  reportModalOpen.value = true
}

const submitReport = async () => {
  if (!selectedReportReason.value || !video.value) return
  submittingReport.value = true
  try {
    const { $api } = useNuxtApp()
    await $api.post('/reports', {
      video_id: video.value.id,
      reason: selectedReportReason.value,
    })
    reportModalOpen.value = false
    selectedReportReason.value = ''
    // 可以在这里添加提交成功的提示
  } catch (err) {
    console.error('举报失败:', err)
  } finally {
    submittingReport.value = false
  }
}

const { addToHistory } = useWatchHistory()

const fetchVideo = async () => {
  loading.value = true
  try {
    const { $api } = useNuxtApp()
    const res = await $api.get(`/videos/${videoId.value}`)
    video.value = res.data
    // 检查收藏状态
    if (isAuthenticated.value) {
      checkCollection(videoId.value)
    }
    // 添加到观看历史
    await addToHistory(res.data)
  } catch (err) {
    console.error('获取视频失败:', err)
    video.value = null
  } finally {
    loading.value = false
  }
}

const fetchRelatedVideos = async () => {
  if (!video.value) return
  try {
    const { $api } = useNuxtApp()
    const res = await $api.get('/videos', {
      params: {
        tag: video.value.tags?.[0]?.name,
        limit: 6,
      },
    })
    relatedVideos.value = res.data?.videos?.filter((v: Video) => v.id !== video.value?.id) || []
  } catch (err) {
    console.error('获取相关视频失败:', err)
  }
}

onMounted(async () => {
  await fetchVideo()
  await fetchRelatedVideos()
})

// SEO
useHead(() => ({
  title: video.value?.title || '视频详情',
  meta: [
    { name: 'description', content: video.value?.description?.slice(0, 200) || '视频详情页面' },
  ],
}))
</script>
