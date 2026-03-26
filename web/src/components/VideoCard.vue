<template>
  <div
    class="group cursor-pointer"
    @click="openVideo"
  >
    <!-- Thumbnail -->
    <div class="relative aspect-video overflow-hidden rounded-lg bg-neutral-800">
      <img
        v-if="video.thumbnail_url"
        :src="video.thumbnail_url"
        :alt="video.title"
        class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        loading="lazy"
        @error="handleImageError"
      />
      <div v-else class="w-full h-full flex items-center justify-center">
        <svg class="w-10 h-10 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      </div>

      <!-- Play Button Overlay -->
      <div class="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <div class="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform">
          <svg class="w-5 h-5 text-neutral-900 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </div>
      </div>

      <!-- Duration Badge -->
      <div v-if="video.duration" class="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/70 rounded text-xs text-white font-medium">
        {{ formatDuration(video.duration) }}
      </div>
    </div>

    <!-- Content -->
    <div class="mt-3">
      <h3 class="text-white text-sm font-medium line-clamp-2 group-hover:text-blue-400 transition-colors leading-relaxed">
        {{ video.title }}
      </h3>

      <div class="flex items-center gap-2 mt-2 text-xs text-neutral-500">
        <span class="hover:text-neutral-300 transition-colors">{{ video.author || '未知作者' }}</span>
        <span>·</span>
        <span>{{ formatNumber(video.views) }}次观看</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import type { Video } from '@/types'

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
</script>
