<template>
  <div
    class="group cursor-pointer"
    @click="openVideo"
  >
    <!-- Thumbnail Container -->
    <div class="relative aspect-video overflow-hidden rounded-lg bg-(--bg-elevated) shadow-sm shadow-black/5 group-hover:shadow-md group-hover:shadow-black/10 transition-all duration-300">
      <!-- Thumbnail Image -->
      <img
        v-if="video.thumbnail_url && !imageError"
        :src="video.thumbnail_url"
        :alt="video.title"
        class="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
        loading="lazy"
        decoding="async"
        @error="handleImageError"
      />
      
      <!-- Placeholder -->
      <div v-else class="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-800">
        <Icon name="heroicons:film" class="w-8 h-8 text-slate-500" />
      </div>

      <!-- Gradient Overlay -->
      <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <!-- Duration Badge -->
      <div v-if="video.duration" class="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 bg-black/75 backdrop-blur-sm rounded text-xs text-white font-semibold">
        {{ formatDuration(video.duration) }}
      </div>

      <!-- Platform Badge -->
      <div v-if="video.platform" class="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-black/60 backdrop-blur-sm rounded text-xs text-white font-medium flex items-center gap-0.5">
        <Icon v-if="video.platform === 'bilibili'" name="simple-icons:bilibili" class="w-3 h-3" />
        <Icon v-else-if="video.platform === 'youtube'" name="simple-icons:youtube" class="w-3 h-3" />
        <span class="capitalize">{{ video.platform }}</span>
      </div>

      <!-- Hover Play Button -->
      <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
        <div class="w-10 h-10 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center shadow-lg transform scale-75 group-hover:scale-100 transition-transform duration-300">
          <Icon name="heroicons:play" class="w-5 h-5 text-slate-800 ml-0.5" />
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="mt-2 px-0.5">
      <h3 class="text-(--text-primary) text-sm font-semibold line-clamp-2 group-hover:text-primary transition-colors leading-snug min-h-[2.75rem]">
        {{ video.title }}
      </h3>

      <div class="flex items-center justify-between mt-1.5 text-xs text-(--text-muted)">
        <div class="flex items-center gap-1">
          <div class="w-4 h-4 rounded-full bg-gradient-to-br from-primary to-indigo-500 flex items-center justify-center text-white text-[8px] font-semibold shrink-0">
            {{ (video.author || 'U').charAt(0).toUpperCase() }}
          </div>
          <span class="hover:text-(--text-primary) transition-colors truncate max-w-[100px]">{{ video.author || '未知作者' }}</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="flex items-center gap-1 shrink-0">
            <Icon name="heroicons:eye" class="w-3 h-3" />
            {{ formatNumber(video.views) }}
          </span>
          <span class="flex items-center gap-1 shrink-0">
            <Icon name="heroicons:heart" class="w-3 h-3" />
            {{ formatNumber(video.likes) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Video } from '~/types'

const props = defineProps<{
  video: Video
}>()

const router = useRouter()
const imageError = ref(false)

const openVideo = () => {
  router.push(`/video/${props.video.id}`)
}

const handleImageError = () => {
  imageError.value = true
}

const formatDuration = (seconds: number): string => {
  if (!seconds) return '00:00'
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

const formatNumber = (num: number): string => {
  if (!num) return '0'
  if (num >= 100000000) {
    return (num / 100000000).toFixed(1) + '亿'
  }
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

const formatTimeAgo = (date: string | Date): string => {
  if (!date) return ''
  const now = new Date()
  const past = new Date(date)
  const diffMs = now.getTime() - past.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)
  const diffMonths = Math.floor(diffDays / 30)
  const diffYears = Math.floor(diffDays / 365)

  if (diffYears > 0) return `${diffYears}年前`
  if (diffMonths > 0) return `${diffMonths}个月前`
  if (diffDays > 0) return `${diffDays}天前`
  if (diffHours > 0) return `${diffHours}小时前`
  if (diffMins > 0) return `${diffMins}分钟前`
  return '刚刚'
}
</script>
