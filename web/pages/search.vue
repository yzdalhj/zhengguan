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
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-2 md:gap-3">
        <video-card
          v-for="video in videos"
          :key="video.id"
          :video="video"
        />
      </div>
    </div>

    <!-- Loading State -->
    <div v-else-if="loading" class="p-4 lg:p-6 pt-2">
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
import type { Tag } from '~/types'

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
  const category = route.query.category as string
  const tagName = route.query.tag as string

  if (keyword) {
    videoStore.setKeyword(keyword)
  }

  if (category) {
    await videoStore.fetchTags(category)
  } else if (tagName) {
    await videoStore.fetchTags()
  } else {
    await videoStore.fetchTags()
  }

  await applyUrlParamsToFilters()
  await videoStore.fetchVideos(1)
})

const applyUrlParamsToFilters = () => {
  const category = route.query.category as string
  const tagName = route.query.tag as string

  if (category) {
    const categoryTags = videoStore.tags.filter((tag: Tag) => tag.category === category)
    categoryTags.forEach((tag: Tag) => {
      if (!videoStore.filters.selectedTags.includes(tag.id)) {
        videoStore.filters.selectedTags.push(tag.id)
      }
    })
  }

  if (tagName) {
    const tag = videoStore.tags.find((t: Tag) => t.name === tagName)
    if (tag && !videoStore.filters.selectedTags.includes(tag.id)) {
      videoStore.filters.selectedTags.push(tag.id)
    }
  }
}

// Watch for route changes
watch(() => route.query, async (newQuery) => {
  videoStore.clearFilters()

  const keyword = newQuery.keyword as string
  const category = newQuery.category as string
  const tagName = newQuery.tag as string

  if (keyword) {
    videoStore.setKeyword(keyword)
  }

  if (category) {
    if (videoStore.tags.length === 0 || videoStore.tags.some(t => t.category !== category)) {
      await videoStore.fetchTags(category)
    }
  } else if (tagName) {
    if (videoStore.tags.length === 0) {
      await videoStore.fetchTags()
    }
  }

  applyUrlParamsToFilters()
  await videoStore.fetchVideos(1)
}, { deep: true })
</script>
