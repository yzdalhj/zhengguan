<template>
  <t-layout class="min-h-screen">
    <!-- Header / Navbar -->
    <t-header>
      <navbar />
    </t-header>

    <t-layout>
      <t-aside>
        <t-menu
          v-model="activeMenu"
          theme="light"
          :collapsed="false"
          width="200px"
          class="h-full"
          @change="handleMenuChange"
        >
          <!-- 首页推荐 -->
          <t-menu-item value="/">
            <template #icon>
              <dynamic-icon name="home" />
            </template>
            首页推荐
          </t-menu-item>

          <!-- 观看历史 -->
          <t-menu-item value="/history">
            <template #icon>
              <dynamic-icon name="time" />
            </template>
            观看历史
          </t-menu-item>

          <!-- 分类分组 -->
          <t-submenu value="categories" title="分类">
            <template #icon>
              <dynamic-icon name="view-list" />
            </template>
            <t-menu-item
              v-for="category in categoryItems"
              :key="category.value"
              :value="category.value"
            >
              {{ category.label }}
            </t-menu-item>
          </t-submenu>

          <!-- 标签分组 -->
          <t-submenu value="tags" title="标签">
            <template #icon>
              <dynamic-icon name="tag" />
            </template>
            <t-menu-item
              v-for="tag in tagItems"
              :key="tag.value"
              :value="tag.value"
            >
              {{ tag.label }}
            </t-menu-item>
          </t-submenu>
        </t-menu>
      </t-aside>

      <t-layout>
        <t-content>
          <slot />
        </t-content>
        <Suspense>
          <main-footer />
          <template #fallback>
            <div class="h-16 bg-(--bg-secondary)" />
          </template>
        </Suspense>
      </t-layout>
    </t-layout>
  </t-layout>
</template>

<script setup lang="ts">
const route = useRoute()

// 计算当前激活的菜单项
const activeMenu = computed(() => {
  const path = route.path
  if (path === '/') return '/'
  if (path === '/history') return '/history'

  // 检查是否在分类或标签中
  const category = route.query.category as string
  const tag = route.query.tag as string
  if (category) return `/search?category=${category}`
  if (tag) return `/search?tag=${tag}`

  return path
})

// 分类列表
const categoryItems = [
  { label: '动作风格', value: '/search?category=动作风格' },
  { label: '镜头语言', value: '/search?category=镜头语言' },
  { label: '场景', value: '/search?category=场景' },
  { label: '情绪', value: '/search?category=情绪' },
  { label: '参考用途', value: '/search?category=参考用途' },
]

// 标签列表
const tagItems = [
  { label: '打斗', value: '/search?tag=打斗' },
  { label: '追逐', value: '/search?tag=追逐' },
  { label: '特写', value: '/search?tag=特写' },
  { label: '一镜到底', value: '/search?tag=一镜到底' },
  { label: '慢动作', value: '/search?tag=慢动作' },
  { label: '转场', value: '/search?tag=转场' },
  { label: '构图', value: '/search?tag=构图' },
  { label: '光影', value: '/search?tag=光影' },
]

// 处理菜单切换
const handleMenuChange = (value: any) => {
  navigateTo(value)
}
</script>

<style scoped>
:deep(.t-menu) {
  background: transparent;
}

:deep(.t-menu__item) {
  color: var(--text-secondary);
}

:deep(.t-menu__item.t-is-active) {
  color: var(--text-primary);
  background: var(--bg-tertiary);
}

:deep(.t-menu__item:hover:not(.t-is-active)) {
  color: var(--text-primary);
  background: var(--bg-secondary);
}

:deep(.t-submenu__title) {
  color: var(--text-secondary);
}

:deep(.t-submenu__title:hover) {
  color: var(--text-primary);
  background: var(--bg-secondary);
}

/* 隐藏侧边栏滚动条但保持滚动功能 */
t-aside::-webkit-scrollbar {
  width: 4px;
}

t-aside::-webkit-scrollbar-track {
  background: transparent;
}

t-aside::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 2px;
}

t-aside::-webkit-scrollbar-thumb:hover {
  background: var(--text-muted);
}
</style>
