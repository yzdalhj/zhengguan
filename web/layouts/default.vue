<template>
  <div class="min-h-screen bg-(--bg-primary)">
    <!-- Navbar -->
    <navbar />

    <div class="flex" style="padding-top: 56px;">
      <!-- Sidebar Navigation - 固定宽度，不随浏览器缩放变化 -->
      <aside
        class="fixed left-0 bottom-0 bg-(--bg-primary) border-r border-(--border-color) overflow-y-auto z-40 hidden md:block"
        style="width: 200px; top: 56px;"
      >
        <nav class="py-3">
          <!-- 首页推荐 -->
          <NuxtLink
            to="/"
            class="flex items-center justify-center md:justify-start gap-3 px-3 py-2 mx-2 rounded-lg text-[13px] font-medium transition-colors whitespace-nowrap"
            :class="$route.path === '/' 
              ? 'bg-(--bg-tertiary) text-(--text-primary)' 
              : 'text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--bg-secondary)'"
          >
            <UIcon name="i-heroicons-home" class="w-18px h-18px shrink-0" />
            <span class="hidden xl:block">首页推荐</span>
          </NuxtLink>

          <!-- 分类列表 -->
          <div class="mt-1 space-y-0.5">
            <NuxtLink
              v-for="category in categories"
              :key="category.name"
              :to="category.link"
              class="flex items-center justify-center md:justify-start gap-3 px-3 py-2 mx-2 rounded-lg text-[13px] transition-colors whitespace-nowrap"
              :class="$route.query.category === category.name || $route.query.tag === category.name 
                ? 'bg-(--bg-tertiary) text-(--text-primary)' 
                : 'text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--bg-secondary)'"
            >
              <UIcon :name="category.icon" class="w-18px h-18px shrink-0" />
              <span class="hidden xl:block">{{ category.name }}</span>
            </NuxtLink>
          </div>
        </nav>
      </aside>

      <!-- Main Content - 固定左边距 -->
      <main
        class="flex-1 min-h-screen bg-(--bg-primary)"
        style="margin-left: 200px;"
      >
        <slot />

        <!-- Footer -->
        <main-footer />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
// 使用 Iconify Heroicons 图标
// 图标映射：name -> iconify name
const categories = [
  { name: '动作风格', link: '/search?category=动作风格', icon: 'i-heroicons-bolt' },
  { name: '镜头语言', link: '/search?category=镜头语言', icon: 'i-heroicons-video-camera' },
  { name: '场景', link: '/search?category=场景', icon: 'i-heroicons-photo' },
  { name: '情绪', link: '/search?category=情绪', icon: 'i-heroicons-face-smile' },
  { name: '参考用途', link: '/search?category=参考用途', icon: 'i-heroicons-bookmark' },
  { name: '打斗', link: '/search?tag=打斗', icon: 'i-heroicons-fire' },
  { name: '追逐', link: '/search?tag=追逐', icon: 'i-heroicons-bolt' },
  { name: '特写', link: '/search?tag=特写', icon: 'i-heroicons-magnifying-glass-plus' },
  { name: '一镜到底', link: '/search?tag=一镜到底', icon: 'i-heroicons-video-camera' },
  { name: '慢动作', link: '/search?tag=慢动作', icon: 'i-heroicons-clock' },
  { name: '转场', link: '/search?tag=转场', icon: 'i-heroicons-arrows-right-left' },
  { name: '构图', link: '/search?tag=构图', icon: 'i-heroicons-squares-2x2' },
  { name: '光影', link: '/search?tag=光影', icon: 'i-heroicons-sun' },
]
</script>
