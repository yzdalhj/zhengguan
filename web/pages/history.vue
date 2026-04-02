<template>
  <div class="px-6 py-6  w-full mx-auto">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Icon name="mdi:history" class="text-primary" size="24" />
        </div>
        <div>
          <h1 class="text-2xl font-bold text-(--text-primary)">观看历史</h1>
          <p class="text-sm text-(--text-muted) mt-0.5">共 {{ history.length }} 个视频</p>
        </div>
      </div>
      <button
        v-if="history.length > 0"
        @click="showClearConfirm = true"
        class="flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:text-red-600 hover:bg-red-500/10 rounded-xl transition-colors"
      >
        <Icon name="mdi:delete-sweep" size="18" />
        清空历史
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-20">
      <div class="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
      <p class="text-(--text-muted)">加载中...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="history.length === 0" class="flex flex-col items-center justify-center py-20">
      <div class="w-24 h-24 rounded-full bg-(--bg-secondary) flex items-center justify-center mb-6">
        <Icon name="mdi:history" class="text-(--text-muted)" size="48" />
      </div>
      <h3 class="text-xl font-medium text-(--text-primary) mb-2">暂无观看记录</h3>
      <p class="text-(--text-muted) mb-8">你观看过的视频会显示在这里</p>
      <NuxtLink
        to="/"
        class="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl transition-colors"
      >
        <Icon name="mdi:play-circle" size="20" />
        去浏览视频
      </NuxtLink>
    </div>

    <!-- Timeline -->
    <div v-else class="relative">
      <!-- Timeline Line -->
      <div class="absolute left-4 top-0 bottom-0 w-0.5 bg-linear-to-b from-primary/50 via-primary/30 to-transparent hidden md:block" />

      <!-- Grouped History -->
      <div class="space-y-8">
        <div
          v-for="(group, date) in groupedHistory"
          :key="date"
          class="relative"
        >
          <!-- Date Header -->
          <div class="flex items-center gap-4 mb-4 sticky top-20 z-10">
            <div class="hidden md:flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white text-sm font-medium shadow-lg shadow-primary/30">
              <Icon name="mdi:calendar-today" class="text-white" size="16" />
            </div>
            <div class="flex items-center gap-3 bg-(--bg-elevated)/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-(--border-color)">
              <span class="text-lg font-semibold text-(--text-primary)">{{ formatDateHeader(date) }}</span>
              <span class="text-sm text-(--text-muted)">{{ group.length }} 个视频</span>
            </div>
          </div>

          <!-- Video Cards Grid -->
          <div class="md:pl-12">
            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              <div
                v-for="item in group"
                :key="item.video.id"
                class="group bg-(--bg-elevated) rounded-2xl border border-(--border-color) hover:border-primary/50 transition-all duration-300 overflow-hidden hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 flex flex-col"
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
                    class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div v-else class="w-full h-full flex items-center justify-center bg-(--bg-secondary)">
                    <Icon name="mdi:play-circle" class="text-(--text-muted)" size="44" />
                  </div>

                  <!-- Duration Badge -->
                  <div
                    v-if="item.video.duration"
                    class="absolute bottom-2 right-2 px-2 py-1 bg-black/80 backdrop-blur-sm rounded-lg text-xs text-white font-medium"
                  >
                    {{ formatDuration(item.video.duration) }}
                  </div>

                  <!-- Progress Bar -->
                  <div
                    v-if="item.progress && item.progress > 0 && item.progress < 100"
                    class="absolute bottom-0 left-0 right-0 h-1.5 bg-black/40"
                  >
                    <div
                      class="h-full bg-linear-to-r from-primary to-primary/80"
                      :style="{ width: item.progress + '%' }"
                    />
                  </div>

                  <!-- Watched Badge -->
                  <div
                    v-else-if="item.progress === 100"
                    class="absolute top-2 left-2 px-2 py-1 bg-green-500/90 backdrop-blur-sm rounded-lg text-xs text-white font-medium flex items-center gap-1"
                  >
                    <Icon name="mdi:check-circle" size="12" />
                    已看完
                  </div>

                  <!-- Hover Overlay -->
                  <div class="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <div class="absolute inset-0 flex items-center justify-center gap-3">
                      <button
                        @click.stop="openVideo(item.video.id)"
                        class="w-14 h-14 rounded-full bg-white flex items-center justify-center hover:scale-110 transition-transform shadow-xl"
                      >
                        <Icon name="mdi:play" class="text-primary" size="28" />
                      </button>
                    </div>
                    <div class="absolute bottom-3 right-3 flex gap-2">
                      <button
                        @click.stop="removeFromHistory(item.video.id)"
                        class="w-9 h-9 rounded-full bg-red-500 flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                        title="删除记录"
                      >
                        <Icon name="mdi:delete" class="text-white block" size="18" />
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Content -->
                <div class="p-4 flex flex-col flex-1">
                  <h3
                    class="text-(--text-primary) text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors cursor-pointer mb-3 leading-snug flex-1"
                    @click="openVideo(item.video.id)"
                  >
                    {{ item.video.title }}
                  </h3>
                  <div class="flex items-center justify-between mt-auto">
                    <div class="flex items-center gap-2 text-xs text-(--text-muted)">
                      <Icon name="mdi:clock-outline" size="14" />
                      <span>{{ formatWatchTime(item.watchedAt) }}</span>
                    </div>
                    <div v-if="item.progress && item.progress > 0 && item.progress < 100" class="flex items-center gap-1.5">
                      <div class="w-16 h-1.5 bg-(--bg-secondary) rounded-full overflow-hidden">
                        <div
                          class="h-full bg-primary rounded-full"
                          :style="{ width: item.progress + '%' }"
                        />
                      </div>
                      <span class="text-xs text-primary font-medium">{{ Math.round(item.progress) }}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Clear Confirm Modal -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="showClearConfirm"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        @click.self="showClearConfirm = false"
      >
        <div class="bg-(--bg-elevated) border border-(--border-color) rounded-2xl p-6 max-w-sm w-full shadow-2xl">
          <div class="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <Icon name="mdi:alert" class="text-red-500" size="28" />
          </div>
          <h3 class="text-xl font-semibold text-(--text-primary) text-center mb-2">确认清空</h3>
          <p class="text-sm text-(--text-muted) text-center mb-6">
            确定要清空所有观看历史吗？此操作无法撤销。
          </p>
          <div class="flex gap-3">
            <button
              @click="showClearConfirm = false"
              class="flex-1 py-3 text-(--text-muted) hover:text-(--text-primary) hover:bg-(--bg-secondary) rounded-xl transition-colors font-medium"
            >
              取消
            </button>
            <button
              @click="handleClear"
              class="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors font-medium"
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

// SEO
useHead({
  title: '观看历史',
  meta: [
    { name: 'description', content: '查看你最近观看过的视频' }
  ]
})

const router = useRouter()
const userStore = useUserStore()
const { history, loading, syncing, removeFromHistory, clearHistory, formatWatchTime } = useWatchHistory()
const showClearConfirm = ref(false)

// 按日期分组
const groupedHistory = computed<Record<string, WatchHistoryItem[]>>(() => {
  const groups: Record<string, WatchHistoryItem[]> = {}

  for (const item of history.value) {
    const date = new Date(item.watchedAt)
    const dateKey = date.toDateString()

    if (!groups[dateKey]) {
      groups[dateKey] = []
    }
    groups[dateKey].push(item)
  }

  // 按日期降序排序
  const sortedKeys = Object.keys(groups).sort((a, b) =>
    new Date(b).getTime() - new Date(a).getTime()
  )

  const sortedGroups: Record<string, WatchHistoryItem[]> = {}
  for (const key of sortedKeys) {
    sortedGroups[key] = groups[key] || []
  }

  return sortedGroups
})

// 格式化日期标题
const formatDateHeader = (dateStr: string): string => {
  const date = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  if (date.toDateString() === today.toDateString()) {
    return '今天'
  } else if (date.toDateString() === yesterday.toDateString()) {
    return '昨天'
  }
  
  const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const month = date.getMonth() + 1
  const day = date.getDate()
  const weekDay = days[date.getDay()]
  
  return `${month}月${day}日 ${weekDay}`
}

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

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
