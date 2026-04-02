<template>
  <div
    class="group cursor-pointer"
    @click="openPrompt"
  >
    <!-- Thumbnail Container -->
    <div class="relative aspect-4/3 overflow-hidden rounded-lg bg-(--bg-elevated) shadow-sm shadow-black/5 group-hover:shadow-md group-hover:shadow-black/10 transition-all duration-300">
      <!-- Preview Image -->
      <img
        v-if="prompt.preview_images?.length > 0 && !imageError"
        :src="prompt.preview_images[0]"
        :alt="prompt.title"
        class="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
        loading="lazy"
        decoding="async"
        @error="imageError = true"
      />

      <!-- Placeholder -->
      <div v-else class="w-full h-full flex items-center justify-center bg-linear-to-br from-purple-900/30 to-indigo-900/30">
        <div class="text-center">
          <Icon name="heroicons:sparkles" class="w-8 h-8 text-purple-400/60 mx-auto" />
          <span class="text-xs text-(--text-muted) mt-1 block">AI提示词</span>
        </div>
      </div>

      <!-- Gradient Overlay -->
      <div class="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <!-- VIP Lock Badge -->
      <div
        v-if="prompt.required_level !== 'free'"
        class="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded text-xs font-bold flex items-center gap-0.5"
        :class="prompt.required_level === 'svip'
          ? 'bg-linear-to-r from-amber-500 to-orange-500 text-white'
          : 'bg-linear-to-r from-purple-500 to-pink-500 text-white'"
      >
        <Icon name="heroicons:lock-closed" class="w-3 h-3" />
        {{ prompt.required_level === 'svip' ? 'SVIP' : 'VIP' }}
      </div>

      <!-- Difficulty Badge -->
      <div class="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-black/60 backdrop-blur-sm rounded text-white text-xs">
        {{ difficultyLabel }}
      </div>

      <!-- Copy Count -->
      <div class="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 bg-black/75 backdrop-blur-sm rounded text-xs text-white flex items-center gap-1">
        <Icon name="heroicons:clipboard-document" class="w-3 h-3" />
        {{ formatNumber(prompt.copy_count) }}
      </div>

      <!-- Favorite Heart -->
      <div
        v-if="prompt.is_favorited !== undefined"
        class="absolute bottom-1.5 left-1.5"
      >
        <Icon
          name="heroicons:heart"
          class="w-4 h-4"
          :class="prompt.is_favorited ? 'text-red-500' : 'text-white/60'"
        />
      </div>
    </div>

    <!-- Content -->
    <div class="mt-2 px-0.5">
      <h3 class="text-(--text-primary) text-xs font-semibold line-clamp-2 group-hover:text-primary transition-colors leading-snug min-h-8">
        {{ prompt.title }}
      </h3>

      <!-- Tags -->
      <div v-if="prompt.tags?.length" class="flex flex-wrap gap-1 mt-1.5">
        <span
          v-for="tag in prompt.tags?.slice(0, 3)"
          :key="tag.id"
          class="px-1.5 py-0.5 bg-(--bg-secondary) text-(--text-muted) rounded text-[10px]"
        >
          {{ tag.name }}
        </span>
        <span
          v-if="(prompt.tags?.length || 0) > 3"
          class="px-1.5 py-0.5 text-(--text-muted) text-[10px]"
        >
          +{{ (prompt.tags?.length || 0) - 3 }}
        </span>
      </div>

      <!-- Rating -->
      <div v-if="prompt.rating_count > 0" class="flex items-center gap-1 mt-1 text-xs text-(--text-muted)">
        <div class="flex items-center">
          <Icon name="heroicons:star" class="w-3 h-3 text-amber-400" />
          <span class="ml-0.5">{{ prompt.rating_avg?.toFixed(1) }}</span>
        </div>
        <span>({{ prompt.rating_count }})</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Prompt } from '~/types'
const props = defineProps<{
  prompt: Prompt
}>()

const router = useRouter()

const imageError = ref(false)

const difficultyLabel = computed(() => {
  const map: Record<string, string> = {
    beginner: '新手',
    intermediate: '进阶',
    expert: '专业',
  }
  return map[props.prompt.difficulty] || '新手'
})

const openPrompt = () => {
  router.push(`/prompt/${props.prompt.id}`)
}
const formatNumber = (num: number): string => {
  if (!num) return '0'
  if (num >= 10000) return (num / 10000).toFixed(1) + '万'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}
</script>
