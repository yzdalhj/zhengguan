<template>
  <div>
    <!-- 视频网格 - 使用固定列数和间距 -->
    <section style="padding: 20px;">
      <div
        class="grid gap-4"
        style="grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));"
      >
        <video-card
          v-for="video in displayVideos.slice(0, 8)"
          :key="video.id"
          :video="video"
        />
      </div>
    </section>

    <!-- 品牌横幅 -->
    <section style="padding: 16px 20px;">
      <div class="relative overflow-hidden rounded-2xl bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600">
        <div class="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50"></div>
        <div class="relative flex items-center justify-between px-6 py-5">
          <div class="flex items-center gap-4">
            <div
              class="rounded-xl bg-white/20 flex items-center justify-center shrink-0"
              style="width: 56px; height: 56px;"
            >
              <UIcon name="i-heroicons-cube" class="w-7 h-7 text-white" />
            </div>
            <div class="min-w-0">
              <h3 class="font-bold text-white mb-1" style="font-size: 16px;">观千帧而后识镜，阅百剑而后闻器</h3>
              <p class="text-white/70 max-w-md" style="font-size: 13px;">汇聚全球精选影视片段，从经典镜头到创意剪辑，为创作者提供无限灵感。探索、学习、创作，让每一帧都成为你的灵感源泉。</p>
            </div>
          </div>
          <NuxtLink
            to="/search"
            class="bg-white text-(--color-primary) font-medium rounded-lg hover:bg-white/90 transition-colors whitespace-nowrap shrink-0"
            style="padding: 10px 20px; font-size: 13px;"
          >
            探索更多灵感
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- 更多视频 -->
    <section style="padding: 20px;">
      <div
        class="grid gap-4"
        style="grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));"
      >
        <video-card
          v-for="video in displayVideos.slice(8, 16)"
          :key="video.id"
          :video="video"
        />
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
          :class="currentPage === page ? 'bg-(--color-primary) text-white' : 'text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--bg-secondary)'"
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
import { ref, computed, onMounted } from 'vue'
import type { Video } from '~/types'

// SEO
useHead({
  title: '首页',
  meta: [
    { name: 'description', content: '搜索优质影视分镜、动作场面、打斗镜头参考，为视频创作提供灵感。' }
  ]
})

const videoStore = useVideoStore()

const currentPage = ref(1)
const totalPages = ref(7)

// 使用 store 中的视频数据
const videos = computed(() => videoStore.videos)

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

// 显示的视频数据 - 优先使用 API 数据，如果没有则使用模拟数据
const displayVideos = computed(() => {
  if (videos.value && videos.value.length > 0) {
    return videos.value
  }
  // 使用模拟数据作为后备
  return generateMockVideos()
})

// 处理页码变化
const handlePageChange = async (page: number) => {
  currentPage.value = page
  await videoStore.fetchVideos(page)
  // 滚动到顶部
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function generateMockVideos(): Video[] {
  const mockTitles = [
    'Blender 油画风格渲染秘籍',
    '摄影师前期拍摄入门教程',
    '2023史诗力作 AI大电影',
    'Blender 4.0 新功能详解',
    '一天出片 三维广告不是梦',
    'SPIDER-MAN 2 游戏评测',
    '秋日氛围感视频调色教程',
    'HELLO 创意短片制作',
    'AIGC 落地实战案例分享',
    '电商短视频拍摄流程',
    'Blender 中国龙建模教程',
    '最美的夜 跨年晚会集锦',
    '实用模型资源推荐',
    '包装设计入门到精通',
    '人像摄影布光技巧',
    '材质分析方法详解',
    '层次设计原理与应用',
    '空间感知与构图技巧',
    '动画制作全流程解析',
    '剪辑节奏把控秘诀'
  ]

  const mockAuthors = [
    '创意工作室', '影视学院', '设计达人', '技术分享', '教程频道',
    '游戏评测', '调色师', '短片制作', 'AI实验室', '电商学院'
  ]

  return Array.from({ length: 20 }, (_, i): Video => ({
    id: i + 1,
    title: mockTitles[i % mockTitles.length]!,
    description: '精彩视频内容描述...',
    thumbnail_url: `https://picsum.photos/400/225?random=${i + 1}`,
    platform: ['bilibili', 'youtube'][i % 2] as 'bilibili' | 'youtube',
    duration: Math.floor(Math.random() * 600) + 60,
    views: Math.floor(Math.random() * 1000000),
    likes: Math.floor(Math.random() * 50000),
    author: mockAuthors[i % mockAuthors.length]!,
    source_film: '',
    tags: [
      { id: 1, name: '教程', category: '类型' },
      { id: 2, name: 'Blender', category: '软件' }
    ],
    created_at: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString()
  }))
}

onMounted(async () => {
  await videoStore.fetchTags()
  await videoStore.fetchVideos(1)
})
</script>
