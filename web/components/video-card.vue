<template>
  <div
    class="group cursor-pointer"
    @click="openVideo"
  >
    <!-- Thumbnail -->
    <div class="relative aspect-video overflow-hidden rounded-xl bg-(--bg-elevated)">
      <img
        v-if="video.thumbnail_url && !imageError"
        :src="video.thumbnail_url"
        :alt="video.title"
        class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        loading="lazy"
        @error="handleImageError"
      />
      <div v-else class="w-full h-full flex items-center justify-center bg-linear-to-br from-(--bg-elevated) to-(--bg-secondary)">
        <UIcon name="i-heroicons-play-circle" class="w-12 h-12 text-(--text-muted)" />
      </div>

      <!-- Duration Badge -->
      <div v-if="video.duration" class="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/80 rounded text-xs text-white font-medium">
        {{ formatDuration(video.duration) }}
      </div>

      <!-- Platform Badge -->
      <div v-if="video.platform" class="absolute top-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-sm rounded text-xs text-white/90 font-medium flex items-center gap-1">
        <UIcon v-if="video.platform === 'bilibili'" name="i-simple-icons-bilibili" class="w-3 h-3" />
        <UIcon v-else-if="video.platform === 'youtube'" name="i-simple-icons-youtube" class="w-3 h-3" />
        <span class="capitalize">{{ video.platform }}</span>
      </div>

      <!-- Hover Overlay -->
      <div class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <div class="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform duration-200">
          <UIcon name="i-heroicons-play" class="w-6 h-6 text-(--text-primary) ml-0.5" />
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="mt-3 px-0.5">
      <h3 class="text-(--text-primary) text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors leading-relaxed">
        {{ video.title }}
      </h3>

      <div class="flex items-center gap-2 mt-2 text-xs text-(--text-secondary)">
        <span class="hover:text-(--text-primary) transition-colors">{{ video.author || '未知作者' }}</span>
        <span class="text-(--text-muted)">·</span>
        <span>{{ formatNumber(video.views) }}次观看</span>
        <span class="text-(--text-muted)">·</span>
        <span>{{ formatTimeAgo(video.created_at) }}</span>
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
