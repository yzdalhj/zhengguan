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
            :class="activeMenu === '/' ? 'text-white bg-primary shadow-sm shadow-(--primary)/20' : 'text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--bg-secondary)'"
          >
            <Icon name="heroicons:home" class="w-5 h-5" />
            <span class="text-sm font-medium">首页推荐</span>
          </button>

          <!-- 观看历史 -->
          <button
            @click="handleMenuChange('/history')"
            class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 cursor-pointer mb-1"
            :class="activeMenu === '/history' ? 'text-white bg-primary shadow-sm shadow-(--primary)/20' : 'text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--bg-secondary)'"
          >
            <Icon name="heroicons:clock" class="w-5 h-5" />
            <span class="text-sm font-medium">观看历史</span>
          </button>

          <!-- 视频列表 -->
          <button
            @click="handleMenuChange('/videos')"
            class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 cursor-pointer mb-1"
            :class="activeMenu === '/videos' ? 'text-white bg-primary shadow-sm shadow-(--primary)/20' : 'text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--bg-secondary)'"
          >
            <Icon name="heroicons:film" class="w-5 h-5" />
            <span class="text-sm font-medium">视频</span>
          </button>

          <!-- 提示词 -->
          <button
            @click="handleMenuChange('/prompts')"
            class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 cursor-pointer mb-1"
            :class="activeMenu.startsWith('/prompts') ? 'text-white bg-primary shadow-sm shadow-(--primary)/20' : 'text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--bg-secondary)'"
          >
            <Icon name="heroicons:sparkles" class="w-5 h-5" />
            <span class="text-sm font-medium">提示词</span>
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
  if (path === '/videos') return '/videos'
  if (path === '/history') return '/history'
  if (path === '/prompts') return '/prompts'
  return path
})

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
