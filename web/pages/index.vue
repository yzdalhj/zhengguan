<template>
  <div>
    <!-- 横幅 - 只在客户端渲染，避免水合不匹配 -->
    <ClientOnly>
      <div v-if="!userStore.bannerClosed" class="px-5 pt-6">
        <div
          class="group/banner relative overflow-hidden rounded-xl bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600"
        >
          <!-- 关闭按钮 - 右上角，鼠标进入横幅显示 -->
          <button
            @click="closeBanner"
            class="absolute top-3 right-3 z-50 flex items-center justify-center w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 text-white opacity-0 group-hover/banner:opacity-100 transition-all duration-200 backdrop-blur-sm border border-white/30"
            title="关闭"
          >
            <Icon name="heroicons:x-mark" class="w-4 h-4" />
          </button>
          <div class="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50"></div>
          <div class="relative flex items-center justify-between px-6 py-5">
            <div class="flex items-center gap-4">
              <div
                class="rounded-xl bg-white/20 flex items-center justify-center shrink-0"
                style="width: 56px; height: 56px;"
              >
                <Icon name="heroicons:film" class="w-7 h-7" style="color: white;" />
              </div>
              <div class="min-w-0 p-12px">
                <h3 class="font-bold text-white mb-1" style="font-size: 16px;">观千帧而后识镜，阅百剑而后闻器</h3>
                <p class="text-white/70" style="font-size: 13px;">汇聚全球精选影视片段，从经典镜头到创意剪辑，为创作者提供无限灵感。探索、学习、创作，让每一帧都成为你的灵感源泉。</p>
              </div>
            </div>
            <NuxtLink
              to="/search"
              class="bg-white text-primary font-medium rounded-lg hover:bg-white/90 transition-colors whitespace-nowrap shrink-0"
              style="padding: 10px 20px; font-size: 13px;"
            >
              探索更多灵感
            </NuxtLink>
          </div>
        </div>
      </div>
    </ClientOnly>

    <!-- 视频网格 -->
    <section class="px-5 py-6">
      <div
        class="grid grid-cols-5 gap-5"
      >
        <video-card v-for="video in videos" :key="video.id" :video="video" />
      </div>
    </section>
    <!-- 分页 -->
    <section style="padding: 20px;">
      <div class="flex items-center justify-center gap-2">
        <button
          @click="handlePageChange(1)"
          :disabled="currentPage === 1"
          class="px-3 py-1.5 text-(--text-secondary) hover:text-(--text-primary) disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          style="font-size: 13px;"
        >
          首页
        </button>
        <button
          v-for="page in displayedPages"
          :key="page"
          @click="handlePageChange(page)"
          class="rounded-lg font-medium transition-colors"
          style="width: 32px; height: 32px; font-size: 13px;"
          :class="currentPage === page ? 'bg-primary text-white' : 'text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--bg-secondary)'"
        >
          {{ page }}
        </button>
        <button
          @click="handlePageChange(totalPages)"
          :disabled="currentPage === totalPages"
          class="px-3 py-1.5 text-(--text-secondary) hover:text-(--text-primary) disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          style="font-size: 13px;"
        >
          尾页
        </button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Video } from '~/types'

// SEO
useHead({
  title: '首页',
  meta: [
    { name: 'description', content: '搜索优质影视分镜、动作场面、打斗镜头参考，为视频创作提供灵感。' }
  ]
})

const { $api } = useNuxtApp()
const userStore = useUserStore()

// 使用 SSR 获取首屏数据 - 关键优化点
const { data: videosData, refresh: refreshVideos } = await useAsyncData(
  'videos-page-1',
  async () => {
    const response = await $api.get('/videos', {
      params: { page: 1, limit: 20 }
    })
    return response.data
  },
  {
    server: true,
    default: () => []
  }
)

// 获取标签数据
const { data: tagsData } = await useAsyncData(
  'tags',
  async () => {
    const response = await $api.get('/tags')
    return response.data
  },
  {
    server: true,
    default: () => []
  }
)

// 本地状态管理
const videos = ref<Video[]>(videosData.value || [])
const currentPage = ref(1)
const totalPages = ref(1)
const total = ref(0)

// 初始化分页信息
if (videosData.value && videosData.value.length > 0) {
  // 从响应头或默认设置中获取分页信息
  totalPages.value = Math.ceil(100 / 20) // 假设默认值，实际应该从API返回
  total.value = 100
}

// 关闭横幅
const closeBanner = () => {
  userStore.closeBanner()
}

// 分页显示逻辑
const displayedPages = computed(() => {
  const pages: number[] = []
  const maxVisible = 7
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
  let end = Math.min(totalPages.value, start + maxVisible - 1)

  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1)
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

// 处理页码变化
const handlePageChange = async (page: number) => {
  if (page === currentPage.value) return
  
  const response = await $api.get('/videos', {
    params: { page, limit: 20 }
  })
  
  videos.value = response.data || []
  currentPage.value = page
  total.value = response.pagination?.total || 0
  totalPages.value = response.pagination?.totalPages || 0
  
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 客户端初始化
onMounted(() => {
})

onUnmounted(() => {
})
</script>
