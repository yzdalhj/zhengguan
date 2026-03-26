<template>
  <div class="container mx-auto px-4 py-6">
    <h1 class="text-3xl font-bold mb-6">标签分类</h1>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="(group, category) in groupedTags" :key="category" class="bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold mb-4 capitalize">{{ category }}</h2>
        <div class="flex flex-wrap gap-2">
          <NuxtLink
            v-for="tag in group"
            :key="tag.id"
            :to="`/search?tags=${tag.id}`"
            class="px-3 py-1 bg-gray-100 hover:bg-primary hover:text-white text-gray-600 rounded-full text-sm transition-colors"
          >
            {{ tag.name }}
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import type { Tag } from '~/types'

// SEO
useHead({
  title: '标签分类',
  meta: [
    { name: 'description', content: '浏览所有标签分类，快速找到您需要的分镜参考素材。按动作风格、镜头语言、场景等分类组织。' }
  ]
})

const videoStore = useVideoStore()

const groupedTags = computed(() => {
  const groups: Record<string, Tag[]> = {}
  videoStore.tags.forEach(tag => {
    const category = tag.category || '其它'
    if (!groups[category]) {
      groups[category] = []
    }
    groups[category].push(tag)
  })
  return groups
})

onMounted(async () => {
  await videoStore.fetchTags()
})
</script>
