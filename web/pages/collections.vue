<template>
  <div class="container mx-auto px-4 py-6">
    <h1 class="text-3xl font-bold mb-6 text-(--text-primary)">我的收藏</h1>

    <div v-if="!isAuthenticated" class="text-center py-20">
      <p class="text-(--text-secondary) mb-4">请登录后查看收藏</p>
      <button @click="openLoginDialog" class="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-hover">
        去登录
      </button>

      <UiDialog
        v-model:model-value="showLoginDialog"
        :title="loginMode === 'login' ? '登录' : '注册'"
        size="xl"
        :plain="true"
        :show-close="true"
      >
        <LoginForm
          :mode="loginMode"
          @close="showLoginDialog = false"
          @success="handleLoginSuccess"
          @switch-mode="loginMode = loginMode === 'login' ? 'register' : 'login'"
        />
      </UiDialog>
    </div>

    <template v-else>
      <div v-if="loading && collections.length === 0" class="text-center py-10 text-(--text-secondary)">
        加载中...
      </div>

      <div v-if="!loading && collections.length === 0" class="text-center py-20 text-(--text-secondary)">
        暂无收藏
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <video-card v-for="collection in collections" :key="collection.id" :video="collection.video!" />
      </div>

      <div v-if="hasMore" class="text-center mt-8">
        <button @click="loadMore" :disabled="loading" class="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-hover disabled:opacity-50">
          {{ loading ? '加载中...' : '加载更多' }}
        </button>
      </div>

      <div v-if="collections.length > 0" class="mt-8 text-center space-x-4">
        <a href="/api/user/collections/export" target="_blank" class="text-primary hover:underline">
          导出收藏(JSON)
        </a>
        <span class="text-(--border-color)">|</span>
        <button @click="openExportStoryboardModal" class="text-primary hover:underline">
          导出分镜板(图片)
        </button>
      </div>

      <!-- 分镜板导出弹窗 -->
      <div v-if="storyboardModalOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-(--bg-elevated) rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-(--border-color)">
          <h3 class="text-xl font-bold mb-4 text-(--text-primary)">导出分镜板</h3>
          
          <div class="mb-4">
            <label class="block text-sm font-medium text-(--text-secondary) mb-2">分镜标题</label>
            <input
              v-model="storyboardTitle"
              type="text"
              placeholder="请输入分镜板标题"
              class="w-full px-3 py-2 bg-(--bg-input) border border-(--border-color) rounded-md text-(--text-primary)"
            />
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-(--text-secondary) mb-2">布局</label>
            <div class="flex gap-4 text-(--text-primary)">
              <label class="flex items-center">
                <input
                  v-model="storyboardLayout"
                  type="radio"
                  value="grid"
                  class="mr-2"
                >
                网格布局
              </label>
              <label class="flex items-center">
                <input
                  v-model="storyboardLayout"
                  type="radio"
                  value="vertical"
                  class="mr-2"
                >
                垂直列表
              </label>
            </div>
          </div>

          <div class="mb-6 bg-(--bg-secondary) p-4 rounded-md">
            <p class="text-sm text-(--text-secondary)">
              分镜板将包含所有收藏的视频缩略图和标题，可以直接保存为图片使用。
            </p>
          </div>

          <div 
            id="storyboard-preview" 
            class="border border-(--border-color) rounded-lg p-4 mb-4 bg-(--bg-primary) max-h-[50vh] overflow-y-auto"
          >
            <div ref="storyboardContainer" class="storyboard-content" :class="storyboardLayout">
              <h1 class="storyboard-title">{{ storyboardTitle || '分镜板' }}</h1>
              <div 
                v-for="(collection, index) in collections" 
                :key="collection.id"
                class="storyboard-item"
              >
                <div class="storyboard-thumbnail">
                  <img v-if="collection.video?.thumbnail_url" :src="collection.video.thumbnail_url" :alt="collection.video.title" />
                  <div v-else class="bg-(--bg-secondary) flex items-center justify-center text-(--text-muted) w-full h-full">
                    无预览
                  </div>
                  <div class="storyboard-number">{{ index + 1 }}</div>
                </div>
                <div class="storyboard-info">
                  <h4>{{ collection.video?.title }}</h4>
                  <p v-if="collection.video?.description" class="text-(--text-secondary) text-sm">
                    {{ collection.video.description }}
                  </p>
                  <div v-if="collection.video?.tags" class="flex flex-wrap gap-1 mt-2">
                    <span 
                      v-for="tag in collection.video.tags.slice(0, 5)" 
                      :key="tag.id"
                      class="text-xs px-2 py-0.5 bg-(--bg-secondary) text-(--text-secondary) rounded-full"
                    >
                      {{ tag.name }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="flex gap-2 justify-end">
            <button @click="storyboardModalOpen = false" class="px-4 py-2 bg-(--bg-secondary) text-(--text-secondary) rounded-md hover:bg-(--bg-tertiary)">
              取消
            </button>
            <button @click="generateStoryboardImage" :disabled="generatingStoryboard" class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover disabled:opacity-50">
              {{ generatingStoryboard ? '生成中...' : '生成图片并下载' }}
            </button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Collection } from '~/types'

// SEO
useHead({
  title: '我的收藏',
  meta: [
    { name: 'description', content: '查看你收藏的影视分镜参考素材' }
  ]
})

const userStore = useUserStore()
const { $api } = useNuxtApp()

// 分镜板导出
const storyboardModalOpen = ref(false)
const storyboardTitle = ref('')
const storyboardLayout = ref<'grid' | 'vertical'>('grid')
const generatingStoryboard = ref(false)

const openExportStoryboardModal = () => {
  if (!isAuthenticated.value) {
    return
  }
  storyboardTitle.value = '我的分镜板'
  storyboardModalOpen.value = true
}

const generateStoryboardImage = async () => {
  generatingStoryboard.value = true
  
  try {
    const html2canvas = (await import('html2canvas')).default
    const container = document.getElementById('storyboard-preview') as HTMLElement
    
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
    })
    
    const link = document.createElement('a')
    const fileName = `${storyboardTitle.value || 'storyboard'}.png`
    link.download = fileName
    link.href = canvas.toDataURL('image/png')
    link.click()
    
    storyboardModalOpen.value = false
  } catch (error) {
    console.error('Failed to generate storyboard image:', error)
    alert('生成失败，请确保所有图片已经加载完成')
  } finally {
    generatingStoryboard.value = false
  }
}

const collections = ref<Collection[]>([])
const loading = ref(false)
const currentPage = ref(1)
const totalPages = ref(1)
const hasMore = computed(() => currentPage.value < totalPages.value)
const isAuthenticated = computed(() => userStore.isAuthenticated)

const showLoginDialog = ref(false)
const loginMode = ref<'login' | 'register'>('login')

const openLoginDialog = () => {
  loginMode.value = 'login'
  showLoginDialog.value = true
}

const handleLoginSuccess = () => {
  showLoginDialog.value = false
  window.location.reload()
}

const loadMore = async () => {
  if (loading.value || !hasMore.value) return
  
  loading.value = true
  try {
    const response = await $api.get('/user/collections', {
      params: { page: currentPage.value + 1, limit: 20 }
    })
    collections.value.push(...response.data)
    currentPage.value++
    totalPages.value = response.pagination?.totalPages || 1
  } catch (error) {
    console.error('Failed to load more collections:', error)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  if (!isAuthenticated.value) return
  
  loading.value = true
  try {
    const response = await $api.get('/user/collections', {
      params: { page: 1, limit: 20 }
    })
    collections.value = response.data
    currentPage.value = 1
    totalPages.value = response.pagination?.totalPages || 1
  } catch (error) {
    console.error('Failed to load collections:', error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.storyboard-content {
  padding: 2rem;
  background: white;
}

.storyboard-content.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.storyboard-content.vertical {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.storyboard-title {
  grid-column: 1 / -1;
  text-align: center;
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #eee;
}

.storyboard-item {
  display: flex;
  gap: 1rem;
  border: 1px solid #eee;
  border-radius: 0.5rem;
  overflow: hidden;
}

.storyboard-content.vertical .storyboard-item {
  flex-direction: row;
}

.storyboard-content.grid .storyboard-item {
  flex-direction: column;
}

.storyboard-thumbnail {
  position: relative;
  flex-shrink: 0;
}

.storyboard-content.grid .storyboard-thumbnail {
  width: 100%;
  padding-top: 56.25%;
  height: 0;
}

.storyboard-content.vertical .storyboard-thumbnail {
  width: 200px;
  height: 112px;
}

.storyboard-thumbnail img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.storyboard-number {
  position: absolute;
  top: 8px;
  left: 8px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}

.storyboard-info {
  flex: 1;
  padding: 1rem;
}

.storyboard-info h4 {
  font-weight: bold;
  margin-bottom: 0.5rem;
}

@media (max-width: 768px) {
  .storyboard-content.grid {
    grid-template-columns: 1fr;
  }
  
  .storyboard-content.vertical .storyboard-item {
    flex-direction: column;
  }
  
  .storyboard-content.vertical .storyboard-thumbnail {
    width: 100%;
    height: 0;
    padding-top: 56.25%;
  }
}
</style>
