<template>
  <div>
    <!-- Results Header -->
    <div class="p-4 lg:p-6 pb-2">
      <h1 class="text-(--text-primary) text-lg font-medium">
        搜索结果共 <span class="text-primary">{{ total }}</span> 个结果
      </h1>
    </div>

    <!-- Video Grid -->
    <div v-if="!loading && videos.length > 0" class="p-4 lg:p-6 pt-2">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <video-card
          v-for="video in videos"
          :key="video.id"
          :video="video"
        />
      </div>
    </div>

    <!-- Loading State -->
    <div v-else-if="loading" class="p-4 lg:p-6 pt-2">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <div v-for="i in 12" :key="i" class="bg-(--bg-elevated) rounded-xl overflow-hidden">
          <div class="aspect-video bg-(--bg-secondary) animate-pulse"></div>
          <div class="p-3 space-y-2">
            <div class="h-4 bg-(--bg-secondary) rounded animate-pulse"></div>
            <div class="h-3 bg-(--bg-secondary) rounded w-2/3 animate-pulse"></div>
            <div class="flex gap-2 pt-1">
              <div class="h-3 w-16 bg-(--bg-secondary) rounded animate-pulse"></div>
              <div class="h-3 w-12 bg-(--bg-secondary) rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="flex-1 flex items-center justify-center p-4 lg:p-6">
      <div class="text-center py-20">
        <div class="w-20 h-20 mx-auto mb-6 rounded-full bg-(--bg-secondary) flex items-center justify-center">
          <dynamic-icon name="search" size="40px" />
        </div>
        <h3 class="text-xl font-semibold text-(--text-primary) mb-2">未找到相关结果</h3>
        <p class="text-(--text-secondary) mb-6">尝试调整搜索词或筛选条件</p>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1 && !loading" class="flex items-center justify-center gap-2 p-4 lg:p-6">
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
        <dynamic-icon name="chevron-left" size="16px" />
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
        <dynamic-icon name="chevron-right" size="16px" />
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
import { computed, onMounted, watch } from 'vue'

// SEO
useHead({
  title: '搜索',
  meta: [
    { name: 'description', content: '搜索您需要的短视频素材，支持多维度过滤。' }
  ]
})

const route = useRoute()
const videoStore = useVideoStore()

// Computed
const videos = computed(() => videoStore.videos)
const loading = computed(() => videoStore.loading)
const total = computed(() => videoStore.total)
const currentPage = computed(() => videoStore.currentPage)
const totalPages = computed(() => videoStore.totalPages)

// Pagination display
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

// Methods
const goToPage = (page: number) => {
  if (page < 1 || page > totalPages.value || page === currentPage.value) return
  videoStore.fetchVideos(page)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Initialize from URL params
onMounted(async () => {
  const keyword = route.query.keyword as string
  if (keyword) {
    videoStore.setKeyword(keyword)
  }
  await videoStore.fetchVideos(1)
})

// Watch for route changes
watch(() => route.query, (newQuery) => {
  if (!newQuery.keyword) {
    videoStore.setKeyword('')
  }
}, { deep: true })
</script>
