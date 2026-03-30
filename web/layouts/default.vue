<template>
  <div class="flex flex-col min-h-screen bg-(--bg-primary)">
    <!-- Header / Navbar -->
    <header class="h-14 shrink-0">
      <navbar />
    </header>

    <div class="flex flex-1">
      <aside class="fixed top-14 left-0 w-56 h-[calc(100vh-3.5rem)] shrink-0 border-r border-(--border-color) overflow-y-auto bg-(--bg-primary) backdrop-blur-sm z-10">
        <nav class="py-4 px-2">
          <!-- 首页推荐 -->
          <button
            @click="handleMenuChange('/')"
            class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 cursor-pointer mb-1"
            :class="activeMenu === '/' ? 'text-white bg-(--primary) hover:bg-(--primary-hover) shadow-sm shadow-(--primary)/20' : 'text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--bg-secondary)'"
          >
            <Icon name="heroicons:home" class="w-5 h-5" />
            <span class="text-sm font-medium">首页推荐</span>
          </button>

          <!-- 观看历史 -->
          <button
            @click="handleMenuChange('/history')"
            class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 cursor-pointer mb-1"
            :class="activeMenu === '/history' ? 'text-white bg-(--primary) hover:bg-(--primary-hover) shadow-sm shadow-(--primary)/20' : 'text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--bg-secondary)'"
          >
            <Icon name="heroicons:clock" class="w-5 h-5" />
            <span class="text-sm font-medium">观看历史</span>
          </button>

          <!-- 分隔线 -->
          <div class="my-3 mx-3 h-px bg-(--border-color)"></div>

          <!-- 分类 -->
          <button
            v-for="category in categoryItems"
            :key="category.value"
            @click="handleMenuChange(category.value)"
            class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 cursor-pointer mb-1"
            :class="activeMenu === category.value ? 'text-white bg-(--primary) hover:bg-(--primary-hover) shadow-sm shadow-(--primary)/20' : 'text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--bg-secondary)'"
          >
            <Icon :name="category.icon" class="w-5 h-5" />
            <span class="text-sm font-medium">{{ category.label }}</span>
          </button>
        </nav>
      </aside>

      <main class="flex-1 flex flex-col bg-(--bg-secondary) ml-56">
        <div class="flex-1">
          <slot />
        </div>
        <Suspense>
          <main-footer />
          <template #fallback>
            <div class="h-16 bg-(--bg-tertiary)" />
          </template>
        </Suspense>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()

const activeMenu = computed(() => {
  const path = route.path
  if (path === '/') return '/'
  if (path === '/history') return '/history'

  const category = route.query.category as string
  const tag = route.query.tag as string
  if (category) return `/search?category=${category}`
  if (tag) return `/search?tag=${tag}`

  return path
})

const categoryItems = [
  { label: '动作风格', value: '/search?category=动作风格', icon: 'heroicons:sparkles' },
  { label: '镜头语言', value: '/search?category=镜头语言', icon: 'heroicons:video-camera' },
  { label: '场景', value: '/search?category=场景', icon: 'heroicons:map-pin' },
  { label: '情绪', value: '/search?category=情绪', icon: 'heroicons:face-smile' },
  { label: '参考用途', value: '/search?category=参考用途', icon: 'heroicons:question-mark-circle' },
  { label: '打斗', value: '/search?category=打斗', icon: 'heroicons:shield-exclamation' },
  { label: '追逐', value: '/search?category=追逐', icon: 'heroicons:arrow-trending-up' },
  { label: '特写', value: '/search?category=特写', icon: 'heroicons:magnifying-glass' },
  { label: '一镜到底', value: '/search?category=一镜到底', icon: 'heroicons:play-circle' },
  { label: '慢动作', value: '/search?category=慢动作', icon: 'heroicons:clock' },
  { label: '转场', value: '/search?category=转场', icon: 'heroicons:arrows-right-left' },
  { label: '构图', value: '/search?category=构图', icon: 'heroicons:photo' },
  { label: '光影', value: '/search?category=光影', icon: 'heroicons:sun' },
]

const handleMenuChange = (value: string) => {
  navigateTo(value)
}
</script>

<style scoped>
aside::-webkit-scrollbar {
  width: 4px;
}

aside::-webkit-scrollbar-track {
  background: transparent;
}

aside::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 2px;
}

aside::-webkit-scrollbar-thumb:hover {
  background: var(--text-muted);
}
</style>
