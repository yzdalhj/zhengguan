<template>
  <div class="container mx-auto px-4 py-6">
    <div v-if="loading" class="text-center py-20">加载中...</div>

    <template v-else-if="video">
      <div class="bg-white rounded-lg shadow overflow-hidden mb-6">
        <div class="aspect-video w-full">
          <iframe
            :src="embedUrl"
            frameborder="0"
            allowfullscreen
            class="w-full h-full"
            :title="video.title"
          ></iframe>
        </div>
        <div class="p-6">
          <div class="flex justify-between items-start mb-4">
            <h1 class="text-2xl md:text-3xl font-bold">{{ video.title }}</h1>
            <button
              v-if="isAuthenticated"
              @click="toggleCollection"
              :class="[
                'px-4 py-2 rounded-md',
                isCollected
                  ? 'bg-red-100 text-red-600 hover:bg-red-200'
                  : 'bg-primary text-white hover:bg-primary/90'
              ]"
            >
              {{ isCollected ? '取消收藏' : '收藏' }}
            </button>
          </div>

          <div v-if="video.source_film" class="mb-4">
            <span class="text-gray-500">来源影片：</span>
            <span class="font-medium">{{ video.source_film }}</span>
          </div>

          <div v-if="video.description" class="mb-6 text-gray-600 leading-relaxed">
            {{ video.description }}
          </div>

          <div class="flex flex-wrap gap-2 mb-4">
            <span
              v-for="tag in video.tags"
              :key="tag.id"
              class="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm"
            >
              {{ tag.name }}
            </span>
          </div>

          <div class="flex items-center gap-6 text-sm text-gray-500 border-t pt-4">
            <span>{{ video.views }} 观看</span>
            <span>{{ video.likes }} 点赞</span>
            <span v-if="video.duration">时长：{{ formatDuration(video.duration) }}</span>
            <span>平台：{{ video.platform }}</span>
          </div>
        </div>
      </div>

      <!-- AI 提示词生成 -->
      <div class="bg-white rounded-lg shadow overflow-hidden mb-6">
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-bold">AI 提示词生成</h2>
            <button
              @click="generateAIPrompt"
              :disabled="generatingPrompt"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {{ generatingPrompt ? '生成中...' : '生成提示词' }}
            </button>
          </div>
          <div v-if="aiPrompts.length > 0" class="space-y-4">
            <div v-for="(prompt, index) in aiPrompts" :key="index" class="relative">
              <div class="mb-1 text-sm font-medium text-gray-600">
                {{ getPromptName(index) }}
              </div>
              <div class="relative">
                <textarea
                  :value="prompt"
                  readonly
                  class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm h-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
                <button
                  @click="copyPrompt(prompt)"
                  class="absolute top-2 right-2 px-2 py-1 bg-white border border-gray-300 rounded text-xs hover:bg-gray-50"
                >
                  复制
                </button>
              </div>
            </div>
          </div>
          <div v-else class="text-gray-500 text-center py-8">
            点击上方按钮生成适配不同 AI 视频生成平台的提示词
          </div>
        </div>
      </div>

      <div class="mt-8" v-if="relatedVideos.length > 0">
        <h2 class="text-2xl font-bold mb-4">相关推荐</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <video-card v-for="v in relatedVideos" :key="v.id" :video="v" />
        </div>
      </div>

      <div class="mt-8 border-t pt-6">
        <button @click="openReportModal" class="text-gray-500 hover:text-red-500 text-sm">
          举报这个视频
        </button>
      </div>
    </template>

    <div v-else class="text-center py-20 text-gray-500">
      视频不存在
    </div>

    <!-- 举报弹窗 -->
    <div v-if="reportModalOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 class="text-xl font-bold mb-4">举报视频</h3>
        <textarea
          v-model="reportReason"
          placeholder="请说明举报原因..."
          class="w-full px-3 py-2 border border-gray-300 rounded-md mb-4 h-32"
        ></textarea>
        <div class="flex gap-2 justify-end">
          <button @click="reportModalOpen = false" class="px-4 py-2 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200">
            取消
          </button>
          <button @click="submitReport" :disabled="submitting" class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50">
            提交举报
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
const videoStore = useVideoStore()
const { $api } = useNuxtApp()

const id = parseInt(route.params.id as string)
const loading = ref(true)
const video = ref<Video | null>(null)
const relatedVideos = ref<Video[]>([])
const reportModalOpen = ref(false)
const reportReason = ref('')
const submitting = ref(false)
const isCollected = ref(false)
const generatingPrompt = ref(false)
const aiPrompts = ref<string[]>([])

const isAuthenticated = computed(() => userStore.isAuthenticated)

// SEO
useHead(() => ({
  title: video.value ? `${video.value.title} - 帧观` : '视频不存在',
  meta: [
    { name: 'description', content: video.value?.description || '优质影视分镜参考片段' }
  ]
}))

const getPromptName = (index: number): string => {
  const names = ['OpenAI Sora', 'Runway ML', 'Pika Labs', '中文详细提示词']
  return names[index] || `提示词 ${index + 1}`
}

const generateAIPrompt = async () => {
  if (!video.value) return
  
  generatingPrompt.value = true
  try {
    const response = await $api.get(`/videos/${id}/ai-prompt`)
    aiPrompts.value = response.data.prompts
  } catch (error) {
    console.error('Failed to generate AI prompt:', error)
    alert('生成失败，请重试')
  } finally {
    generatingPrompt.value = false
  }
}

const copyPrompt = async (prompt: string) => {
  try {
    await navigator.clipboard.writeText(prompt)
    alert('已复制到剪贴板')
  } catch (error) {
    console.error('Failed to copy:', error)
    const textarea = document.createElement('textarea')
    textarea.value = prompt
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    alert('已复制到剪贴板')
  }
}

const embedUrl = computed(() => {
  if (!video.value) return ''
  if (video.value.platform === 'youtube' && !video.value.embed_url?.startsWith('https:')) {
    return 'https:' + video.value.embed_url
  }
  return video.value.embed_url || ''
})

const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

const toggleCollection = async () => {
  if (!isAuthenticated.value) {
    router.push('/login')
    return
  }

  try {
    if (isCollected.value) {
      await $api.delete(`/user/collections/${id}`)
      isCollected.value = false
    } else {
      await $api.post(`/user/collections/${id}`)
      isCollected.value = true
    }
  } catch (error) {
    console.error('Failed to toggle collection:', error)
    alert('操作失败，请重试')
  }
}

const openReportModal = () => {
  if (!isAuthenticated.value) {
    router.push('/login')
    return
  }
  reportModalOpen.value = true
}

const submitReport = async () => {
  if (!reportReason.value.trim()) {
    alert('请填写举报原因')
    return
  }

  submitting.value = true
  try {
    await $api.post('/user/reports', {
      videoId: id,
      reason: reportReason.value,
    })
    alert('举报已提交，我们会尽快处理')
    reportModalOpen.value = false
    reportReason.value = ''
  } catch (error) {
    console.error('Failed to submit report:', error)
    alert('提交失败，请重试')
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  loading.value = true
  try {
    await videoStore.fetchVideoById(id)
    video.value = videoStore.currentVideo
    
    if (video.value?.tags && video.value.tags.length > 0) {
      const tagIds = video.value.tags.map(t => t.id)
      const response = await $api.get('/videos', {
        params: { tags: tagIds, limit: 3 }
      })
      relatedVideos.value = (response.data as Video[]).filter(v => v.id !== id)
    }
  } catch (error) {
    console.error('Failed to load video:', error)
  } finally {
    loading.value = false
  }
})
</script>
