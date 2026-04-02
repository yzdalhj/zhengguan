<template>
  <div>
    <!-- 吸顶分类筛选条件 -->
    <div class="sticky top-14 z-40 bg-(--bg-secondary) border-b border-(--border-color)">
      <!-- 已选择的标签 -->
      <div v-if="selectedTags.length > 0" class="px-5 py-3 border-b border-(--border-color) bg-(--bg-primary)/50">
        <div class="flex items-center gap-3 flex-wrap">
          <span class="text-sm text-(--text-secondary) shrink-0">已选：</span>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="tag in selectedTags"
              :key="tag.id"
              class="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs"
            >
              {{ tag.name }}
              <button
                @click="toggleTag(tag.id)"
                class="hover:text-primary-hover transition-colors"
              >
                <Icon name="heroicons:x-mark" class="w-3.5 h-3.5" />
              </button>
            </span>
          </div>
          <button
            @click="clearAllFilters"
            class="text-xs text-(--text-secondary) hover:text-red-400 transition-colors shrink-0 ml-auto"
          >
            清除全部
          </button>
        </div>
      </div>

      <!-- 分类筛选 -->
      <div 
        class="px-5 py-4 transition-all duration-300 overflow-hidden relative"
        :class="{ 'max-h-25': !filtersExpanded, 'max-h-512': filtersExpanded }"
      >
        <!-- 右下角挂钩式展开/收起按钮 -->
        <button
          @click="toggleFilters"
          class="absolute bottom-2 right-6 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center shadow-md transition-all duration-300 transform hover:scale-105 active:scale-95"
          :class="filtersExpanded ? 'rotate-180' : ''"
          style="transition-timing-function: cubic-bezier(0.68, -0.55, 0.265, 1.55);"
        >
          <Icon name="heroicons:chevron-up" class="w-4 h-4" />
        </button>
        <div class="space-y-4">
          <!-- 分类标签组 -->
          <div v-for="(tags, category) in groupedTags" :key="category" class="flex items-start gap-3">
            <span class="text-sm font-medium text-(--text-primary) min-w-16 shrink-0 pt-1.5">{{ category }}</span>
            <div class="flex-1">
              <div class="flex flex-wrap gap-1.5">
                <button
                  @click="clearCategory(category)"
                  class="px-3 py-1.5 text-xs rounded-lg transition-all duration-200"
                  :class="!hasSelectedTagsInCategory(category) 
                    ? 'bg-primary text-white shadow-sm shadow-primary/20' 
                    : 'bg-(--bg-primary) text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--bg-elevated)'
                  "
                >
                  全部
                </button>
                <button
                  v-for="tag in tags"
                  :key="tag.id"
                  @click="toggleTag(tag.id)"
                  class="px-3 py-1.5 text-xs rounded-lg transition-all duration-200"
                  :class="videoStore.filters.selectedTags.includes(tag.id) 
                    ? 'bg-primary text-white shadow-sm shadow-primary/20' 
                    : 'bg-(--bg-primary) text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--bg-elevated)'
                  "
                >
                  {{ tag.name }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 视频数量统计 -->
    <div class="px-5 pt-4">
      <p class="text-sm text-(--text-secondary)">
        共 <span class="text-primary font-semibold">{{ videoStore.total }}</span> 个视频
        <span v-if="selectedTags.length > 0" class="text-(--text-muted)">（已筛选）</span>
      </p>
    </div>

    <!-- 视频网格 -->
    <div v-if="!videoStore.loading && videos.length > 0" class="p-5 pt-4">
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-2 md:gap-3">
        <video-card
          v-for="video in videos"
          :key="video.id"
          :video="video"
        />
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-else-if="videoStore.loading" class="p-5 pt-4">
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-2 md:gap-3">
        <div v-for="i in 14" :key="i" class="bg-(--bg-elevated) rounded-lg overflow-hidden shadow-sm">
          <div class="aspect-video bg-(--bg-secondary) animate-pulse"></div>
          <div class="p-2 space-y-1.5">
            <div class="h-3 bg-(--bg-secondary) rounded animate-pulse"></div>
            <div class="h-3 bg-(--bg-secondary) rounded w-3/4 animate-pulse"></div>
            <div class="flex items-center gap-1.5 pt-0.5">
              <div class="w-4 h-4 rounded-full bg-(--bg-secondary) animate-pulse"></div>
              <div class="h-2.5 bg-(--bg-secondary) rounded w-20 animate-pulse"></div>
            </div>
            <div class="flex gap-1.5 pt-0.5">
              <div class="h-2 bg-(--bg-secondary) rounded w-12 animate-pulse"></div>
              <div class="h-2 bg-(--bg-secondary) rounded w-10 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="flex-1 flex items-center justify-center p-5 pt-4">
      <div class="text-center py-20">
        <div class="w-20 h-20 mx-auto mb-6 rounded-full bg-(--bg-secondary) flex items-center justify-center">
          <Icon name="heroicons:film" size="40" />
        </div>
        <h3 class="text-xl font-semibold text-(--text-primary) mb-2">暂无视频</h3>
        <p class="text-(--text-secondary) mb-6">尝试调整筛选条件</p>
      </div>
    </div>

    <!-- 分页 -->
    <div v-if="totalPages > 1 && !videoStore.loading" class="flex items-center justify-center gap-2 p-5 pt-4 pb-8">
      <button
        @click="goToPage(1)"
        :disabled="currentPage === 1"
        :class="[
          'px-3 py-2 text-sm rounded-lg transition-colors',
          currentPage === 1
            ? 'text-(--text-muted) cursor-not-allowed'
            : 'text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--bg-secondary)'
        ]"
      >
        首页
      </button>
      <button
        @click="goToPage(currentPage - 1)"
        :disabled="currentPage === 1"
        :class="[
          'px-3 py-2 text-sm rounded-lg transition-colors',
          currentPage === 1
            ? 'text-(--text-muted) cursor-not-allowed'
            : 'text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--bg-secondary)'
        ]"
      >
        <Icon name="heroicons:chevron-left" size="16" />
      </button>

      <div class="flex items-center gap-1">
        <button
          v-for="page in displayedPages"
          :key="page"
          @click="goToPage(page)"
          :class="[
            'w-9 h-9 text-sm font-medium rounded-lg transition-colors',
            currentPage === page
              ? 'bg-primary text-white'
              : 'text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--bg-secondary)'
          ]"
        >
          {{ page }}
        </button>
      </div>

      <button
        @click="goToPage(currentPage + 1)"
        :disabled="currentPage === totalPages"
        :class="[
          'px-3 py-2 text-sm rounded-lg transition-colors',
          currentPage === totalPages
            ? 'text-(--text-muted) cursor-not-allowed'
            : 'text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--bg-secondary)'
        ]"
      >
        <Icon name="heroicons:chevron-right" size="16" />
      </button>
      <button
        @click="goToPage(totalPages)"
        :disabled="currentPage === totalPages"
        :class="[
          'px-3 py-2 text-sm rounded-lg transition-colors',
          currentPage === totalPages
            ? 'text-(--text-muted) cursor-not-allowed'
            : 'text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--bg-secondary)'
        ]"
      >
        尾页
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Tag } from '~/types'

// SEO
useHead({
  title: '全部视频',
  meta: [
    { name: 'description', content: '浏览全部影视分镜视频，支持多维度分类筛选。' }
  ]
})

const videoStore = useVideoStore()

// 筛选区域展开状态
const filtersExpanded = ref(false)

// Computed
const videos = computed(() => videoStore.videos || [])
const currentPage = computed(() => videoStore.currentPage)
const totalPages = computed(() => videoStore.totalPages)

// 已选择的标签
const selectedTags = computed<Tag[]>(() => {
  if (!videoStore.tags || !videoStore.filters?.selectedTags) return []
  return videoStore.tags.filter(tag => videoStore.filters.selectedTags.includes(tag.id))
})

// 按分类分组标签
const groupedTags = computed(() => {
  const groups: Record<string, typeof videoStore.tags> = {}
  if (videoStore.tags) {
    videoStore.tags.forEach(tag => {
      const category = tag.category || '其他'
      if (!groups[category]) {
        groups[category] = []
      }
      groups[category].push(tag)
    })
  }
  return groups
})

// 切换筛选区域展开/收起
const toggleFilters = () => {
  filtersExpanded.value = !filtersExpanded.value
}

// 分页显示
const displayedPages = computed(() => {
  const pages: number[] = []
  const maxVisible = 7
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
  let end = Math.min(totalPages.value, start + maxVisible - 1)

  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1)
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

// 检查某个分类下是否有选中的标签
const hasSelectedTagsInCategory = (category: string) => {
  const categoryTags = groupedTags.value[category] || []
  return categoryTags.some(tag => videoStore.filters.selectedTags.includes(tag.id))
}

// 清除某个分类的筛选
const clearCategory = (category: string) => {
  const categoryTags = groupedTags.value[category] || []
  categoryTags.forEach(tag => {
    const index = videoStore.filters.selectedTags.indexOf(tag.id)
    if (index > -1) {
      videoStore.filters.selectedTags.splice(index, 1)
    }
  })
  videoStore.fetchVideos(1)
}

// 清除所有筛选
const clearAllFilters = () => {
  videoStore.filters.selectedTags = []
  videoStore.fetchVideos(1)
}



// 切换标签
const toggleTag = (tagId: number) => {
  videoStore.toggleTag(tagId)
  videoStore.fetchVideos(1)
}

// 跳转到指定页
const goToPage = (page: number) => {
  if (page < 1 || page > totalPages.value || page === currentPage.value) return
  videoStore.fetchVideos(page)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 初始化数据
onMounted(async () => {
  await videoStore.fetchTags()
  await videoStore.fetchVideos(1)
})
</script>
