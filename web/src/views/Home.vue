<template>
  <div class="min-h-screen bg-[#0a0a0a] flex">
    <!-- 左侧边栏 -->
    <aside class="fixed left-0 top-14 bottom-0 w-44 bg-[#0a0a0a] border-r border-neutral-800 overflow-y-auto z-40 hidden lg:block">
      <nav class="py-4">
        <!-- 首页推荐 -->
        <router-link
          to="/"
          class="flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-sm font-medium transition-colors"
          :class="$route.path === '/' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
          </svg>
          首页推荐
        </router-link>

        <!-- 分类列表 -->
        <div class="mt-2">
          <router-link
            v-for="category in categories"
            :key="category.name"
            :to="category.link"
            class="flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-sm transition-colors"
            :class="$route.query.category === category.name ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'"
          >
            <span class="w-4 h-4 flex items-center justify-center">
              <component :is="category.icon" class="w-4 h-4" />
            </span>
            {{ category.name }}
          </router-link>
        </div>
      </nav>
    </aside>

    <!-- 主内容区 -->
    <main class="flex-1 lg:ml-44">
      <!-- 视频网格 -->
      <section class="p-4 lg:p-6">
        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <video-card
            v-for="video in displayVideos.slice(0, 8)"
            :key="video.id"
            :video="video"
          />
        </div>
      </section>

      <!-- 品牌横幅 -->
      <section class="px-4 lg:px-6 py-4">
        <div class="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
          <div class="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50"></div>
          <div class="relative flex items-center justify-between px-8 py-6">
            <div class="flex items-center gap-6">
              <div class="w-16 h-16 rounded-xl bg-white/20 flex items-center justify-center">
                <svg class="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <div>
                <h3 class="text-xl font-bold text-white mb-1">观千帧而后识镜，阅百剑而后闻器</h3>
                <p class="text-white/70 text-sm max-w-md">汇聚全球精选影视片段，从经典镜头到创意剪辑，为创作者提供无限灵感。探索、学习、创作，让每一帧都成为你的灵感源泉。</p>
              </div>
            </div>
            <button class="px-6 py-2.5 bg-white text-blue-600 font-medium rounded-lg hover:bg-white/90 transition-colors text-sm whitespace-nowrap">
              探索更多灵感
            </button>
          </div>
        </div>
      </section>

      <!-- 更多视频 -->
      <section class="p-4 lg:p-6">
        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <video-card
            v-for="video in displayVideos.slice(8, 16)"
            :key="video.id"
            :video="video"
          />
        </div>
      </section>

      <!-- 分页 -->
      <section class="px-4 lg:px-6 py-6">
        <div class="flex items-center justify-center gap-2">
          <button
            @click="handlePageChange(1)"
            :disabled="currentPage === 1"
            class="px-3 py-1.5 text-sm text-neutral-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            首页
          </button>
          <button
            v-for="page in displayedPages"
            :key="page"
            @click="handlePageChange(page)"
            class="w-8 h-8 rounded-lg text-sm font-medium transition-colors"
            :class="currentPage === page ? 'bg-blue-600 text-white' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'"
          >
            {{ page }}
          </button>
          <button
            @click="handlePageChange(totalPages)"
            :disabled="currentPage === totalPages"
            class="px-3 py-1.5 text-sm text-neutral-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            尾页
          </button>
        </div>
      </section>

      <!-- 页脚 -->
      <footer class="border-t border-neutral-800 px-4 lg:px-6 py-8 mt-8">
        <div class="max-w-6xl mx-auto">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <!-- 友情链接 -->
            <div>
              <h4 class="text-white font-medium mb-4 text-sm">友情链接</h4>
              <div class="flex flex-wrap gap-4">
                <a href="#" class="text-neutral-500 hover:text-neutral-300 text-sm transition-colors">哔哩哔哩</a>
              </div>
            </div>
            <!-- 合作联系 -->
            <div>
              <h4 class="text-white font-medium mb-4 text-sm">合作联系</h4>
              <div class="space-y-2 text-sm text-neutral-500">
                <p>QQ：1234567</p>
                <p>邮箱：1234567@qq.com</p>
              </div>
            </div>
            <!-- 占位 -->
            <div></div>
          </div>
          <div class="text-center text-neutral-600 text-sm">
            © 2025 JISHI - All Rights Reserved
          </div>
        </div>
      </footer>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, h } from 'vue'
import { useRouter } from 'vue-router'
import { useVideoStore } from '@/stores/video'
import VideoCard from '@/components/VideoCard.vue'
import type { Video } from '@/types'

const router = useRouter()
const videoStore = useVideoStore()

const currentPage = ref(1)
const totalPages = ref(7)

// 使用 store 中的视频数据
const videos = computed(() => videoStore.videos)

// 图标组件
// 动作风格图标 - 拳击/动作
const ActionIcon = () => h('svg', { class: 'w-4 h-4', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M13 10V3L4 14h7v7l9-11h-7z' })
])
// 镜头语言图标 - 相机/镜头
const LensIcon = () => h('svg', { class: 'w-4 h-4', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z' })
])
// 场景图标 - 风景/场景
const SceneIcon = () => h('svg', { class: 'w-4 h-4', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' })
])
// 情绪图标 - 表情/情绪
const EmotionIcon = () => h('svg', { class: 'w-4 h-4', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' })
])
// 参考用途图标 - 收藏/参考
const ReferenceIcon = () => h('svg', { class: 'w-4 h-4', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z' })
])
// 打斗图标
const FightIcon = () => h('svg', { class: 'w-4 h-4', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' })
])
// 追逐图标
const ChaseIcon = () => h('svg', { class: 'w-4 h-4', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M13 10V3L4 14h7v7l9-11h-7z' })
])
// 特写图标
const CloseUpIcon = () => h('svg', { class: 'w-4 h-4', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7' })
])
// 一镜到底图标
const OneShotIcon = () => h('svg', { class: 'w-4 h-4', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' })
])
// 慢动作图标
const SlowMotionIcon = () => h('svg', { class: 'w-4 h-4', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' })
])
// 转场图标
const TransitionIcon = () => h('svg', { class: 'w-4 h-4', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4' })
])
// 构图图标
const CompositionIcon = () => h('svg', { class: 'w-4 h-4', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z' })
])
// 光影图标
const LightingIcon = () => h('svg', { class: 'w-4 h-4', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' })
])

const categories = [
  { name: '动作风格', link: '/search?category=动作风格', icon: ActionIcon },
  { name: '镜头语言', link: '/search?category=镜头语言', icon: LensIcon },
  { name: '场景', link: '/search?category=场景', icon: SceneIcon },
  { name: '情绪', link: '/search?category=情绪', icon: EmotionIcon },
  { name: '参考用途', link: '/search?category=参考用途', icon: ReferenceIcon },
  { name: '打斗', link: '/search?tag=打斗', icon: FightIcon },
  { name: '追逐', link: '/search?tag=追逐', icon: ChaseIcon },
  { name: '特写', link: '/search?tag=特写', icon: CloseUpIcon },
  { name: '一镜到底', link: '/search?tag=一镜到底', icon: OneShotIcon },
  { name: '慢动作', link: '/search?tag=慢动作', icon: SlowMotionIcon },
  { name: '转场', link: '/search?tag=转场', icon: TransitionIcon },
  { name: '构图', link: '/search?tag=构图', icon: CompositionIcon },
  { name: '光影', link: '/search?tag=光影', icon: LightingIcon },
]

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
  
  return Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    title: mockTitles[i % mockTitles.length],
    description: '精彩视频内容描述...',
    thumbnail_url: `https://picsum.photos/400/225?random=${i + 1}`,
    video_url: '',
    platform: ['bilibili', 'youtube'][i % 2],
    duration: Math.floor(Math.random() * 600) + 60,
    views: Math.floor(Math.random() * 1000000),
    likes: Math.floor(Math.random() * 50000),
    author: mockAuthors[i % mockAuthors.length],
    source_film: '',
    tags: [
      { id: 1, name: '教程', category: '类型' },
      { id: 2, name: 'Blender', category: '软件' }
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }))
}

onMounted(async () => {
  await videoStore.fetchTags()
  await videoStore.fetchVideos(1)
})
</script>
