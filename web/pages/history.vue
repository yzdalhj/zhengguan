<template>
  <div class="px-6 py-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-default">观看历史</h1>
      <button
        v-if="history.length > 0"
        @click="showClearConfirm = true"
        class="px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
      >
        清空历史
      </button>
    </div>

    <!-- Empty State -->
    <div v-if="history.length === 0" class="flex flex-col items-center justify-center py-20">
      <div class="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
        <dynamic-icon name="time" size="20px" />
      </div>
      <h3 class="text-lg font-medium text-default mb-2">暂无观看记录</h3>
      <p class="text-muted-foreground mb-6">你观看过的视频会显示在这里</p>
      <NuxtLink
        to="/"
        class="px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors"
      >
        去浏览视频
      </NuxtLink>
    </div>

    <!-- History Grid -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <div
        v-for="item in history"
        :key="item.video.id"
        class="group bg-elevated rounded-xl border border-default hover:border-primary/50 transition-colors overflow-hidden"
      >
        <!-- Thumbnail -->
        <div
          class="relative aspect-video overflow-hidden cursor-pointer"
          @click="openVideo(item.video.id)"
        >
          <img
            v-if="item.video.thumbnail_url"
            :src="item.video.thumbnail_url"
            :alt="item.video.title"
            class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div v-else class="w-full h-full flex items-center justify-center bg-muted">
            <dynamic-icon name="play-circle" size="48px" />
          </div>

          <!-- Duration Badge -->
          <div
            v-if="item.video.duration"
            class="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/80 rounded text-xs text-white font-medium"
          >
            {{ formatDuration(item.video.duration) }}
          </div>

          <!-- Progress Bar -->
          <div
            v-if="item.progress && item.progress > 0 && item.progress < 100"
            class="absolute bottom-0 left-0 right-0 h-1 bg-black/30"
          >
            <div
              class="h-full bg-primary"
              :style="{ width: item.progress + '%' }"
            />
          </div>

          <!-- Hover Overlay with Delete -->
          <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              @click.stop="openVideo(item.video.id)"
              class="w-12 h-12 rounded-full bg-white flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
            >
              <dynamic-icon name="play" size="24px" />
            </button>
            <button
              @click.stop="removeFromHistory(item.video.id)"
              class="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
              title="删除记录"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 6h18"/>
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Content -->
        <div class="p-3">
          <h3
            class="text-default text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors cursor-pointer mb-2"
            @click="openVideo(item.video.id)"
          >
            {{ item.video.title }}
          </h3>
          <div class="flex items-center justify-between text-xs text-muted-foreground">
            <span>{{ formatWatchTime(item.watchedAt) }}</span>
            <span v-if="item.progress && item.progress > 0 && item.progress < 100" class="text-primary">
              {{ Math.round(item.progress) }}%
            </span>
            <span v-else-if="item.progress === 100" class="text-green-500">已看完</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Clear Confirm Modal -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="showClearConfirm"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        @click.self="showClearConfirm = false"
      >
        <div class="bg-elevated border border-default rounded-2xl p-6 max-w-sm w-full">
          <h3 class="text-lg font-semibold text-default mb-2">确认清空</h3>
          <p class="text-sm text-muted-foreground mb-6">
            确定要清空所有观看历史吗？此操作无法撤销。
          </p>
          <div class="flex gap-3">
            <button
              @click="showClearConfirm = false"
              class="flex-1 py-2.5 text-muted-foreground hover:text-default hover:bg-muted rounded-xl transition-colors"
            >
              取消
            </button>
            <button
              @click="handleClear"
              class="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors"
            >
              确认清空
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Video } from '~/types'

// SEO
useHead({
  title: '观看历史',
  meta: [
    { name: 'description', content: '查看你最近观看过的视频' }
  ]
})

const router = useRouter()
const { history, removeFromHistory, clearHistory, formatWatchTime } = useWatchHistory()
const showClearConfirm = ref(false)

const openVideo = (id: number) => {
  router.push(`/video/${id}`)
}

const handleClear = () => {
  clearHistory()
  showClearConfirm.value = false
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
</script>
