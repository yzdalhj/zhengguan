import type { Video } from '~/types'

export interface WatchHistoryItem {
  video: Video
  watchedAt: string
  progress?: number
}

interface ServerHistoryItem {
  video_id: number
  video: Video
  watched_at: string
  progress?: number
}

export function useWatchHistory() {
  const userStore = useUserStore()
  const { $api } = useNuxtApp()

  const history = ref<WatchHistoryItem[]>([])
  const loading = ref(false)
  const syncing = ref(false)
  const maxHistoryItems = 100
  const localStorageKey = 'watch-history'

  // 从 localStorage 加载历史记录
  const loadLocalHistory = (): WatchHistoryItem[] => {
    if (!process.client) return []
    const saved = localStorage.getItem(localStorageKey)
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        return []
      }
    }
    return []
  }

  // 保存到 localStorage
  const saveLocalHistory = (items: WatchHistoryItem[]) => {
    if (!process.client) return
    localStorage.setItem(localStorageKey, JSON.stringify(items))
  }

  // 从服务器获取历史记录
  const fetchServerHistory = async (): Promise<WatchHistoryItem[]> => {
    try {
      const response = await $api.get('/user/history')
      return (response.data || []).map((item: ServerHistoryItem) => ({
        video: item.video,
        watchedAt: item.watched_at,
        progress: item.progress,
      }))
    } catch (err) {
      console.error('获取服务器历史记录失败:', err)
      return []
    }
  }

  // 同步本地历史到服务器
  const syncToServer = async (localItems: WatchHistoryItem[]) => {
    if (!userStore.isAuthenticated || localItems.length === 0) return

    syncing.value = true
    try {
      // 批量同步本地记录到服务器
      await $api.post('/user/history/sync', {
        items: localItems.map(item => ({
          video_id: item.video.id,
          watched_at: item.watchedAt,
          progress: item.progress,
        })),
      })
    } catch (err) {
      console.error('同步历史记录到服务器失败:', err)
    } finally {
      syncing.value = false
    }
  }

  // 合并本地和服务器历史记录
  const mergeHistory = (
    localItems: WatchHistoryItem[],
    serverItems: WatchHistoryItem[]
  ): WatchHistoryItem[] => {
    const mergedMap = new Map<number, WatchHistoryItem>()

    // 先添加本地记录
    localItems.forEach(item => {
      mergedMap.set(item.video.id, item)
    })

    // 合并服务器记录，以更新的时间为准
    serverItems.forEach(item => {
      const existing = mergedMap.get(item.video.id)
      if (!existing) {
        mergedMap.set(item.video.id, item)
      } else {
        const existingTime = new Date(existing.watchedAt).getTime()
        const serverTime = new Date(item.watchedAt).getTime()
        // 保留更新的记录
        if (serverTime > existingTime) {
          mergedMap.set(item.video.id, item)
        }
      }
    })

    // 转换为数组并按时间降序排序
    return Array.from(mergedMap.values())
      .sort((a, b) => new Date(b.watchedAt).getTime() - new Date(a.watchedAt).getTime())
      .slice(0, maxHistoryItems)
  }

  // 加载历史记录（根据登录状态决定从哪加载）
  const loadHistory = async () => {
    loading.value = true
    try {
      const localItems = loadLocalHistory()

      if (userStore.isAuthenticated) {
        // 已登录：获取服务器数据并合并
        const serverItems = await fetchServerHistory()

        // 如果本地有数据，先同步到服务器
        if (localItems.length > 0) {
          await syncToServer(localItems)
          // 同步后重新获取服务器数据
          const updatedServerItems = await fetchServerHistory()
          history.value = updatedServerItems
          // 清空本地记录（已同步到服务器）
          saveLocalHistory([])
        } else {
          history.value = serverItems
        }
      } else {
        // 未登录：只使用本地数据
        history.value = localItems
      }
    } finally {
      loading.value = false
    }
  }

  // 添加观看记录
  const addToHistory = async (video: Video, progress?: number) => {
    // 如果历史记录为空且未登录，先尝试从本地加载
    if (history.value.length === 0 && !userStore.isAuthenticated && process.client) {
      const localItems = loadLocalHistory()
      history.value = localItems
    }

    // 移除已存在的相同视频
    const filtered = history.value.filter(item => item.video.id !== video.id)

    // 添加到开头
    const newItem: WatchHistoryItem = {
      video,
      watchedAt: new Date().toISOString(),
      progress,
    }

    history.value = [newItem, ...filtered].slice(0, maxHistoryItems)

    if (userStore.isAuthenticated) {
      // 已登录：同步到服务器
      try {
        await $api.post('/user/history', {
          video_id: video.id,
          progress,
        })
      } catch (err) {
        console.error('添加历史记录到服务器失败:', err)
      }
    } else {
      // 未登录：保存到本地
      saveLocalHistory(history.value)
    }
  }

  // 移除单条记录
  const removeFromHistory = async (videoId: number) => {
    history.value = history.value.filter(item => item.video.id !== videoId)

    if (userStore.isAuthenticated) {
      try {
        await $api.delete(`/user/history/${videoId}`)
      } catch (err) {
        console.error('从服务器删除历史记录失败:', err)
      }
    } else {
      saveLocalHistory(history.value)
    }
  }

  // 清空历史
  const clearHistory = async () => {
    history.value = []

    if (userStore.isAuthenticated) {
      try {
        await $api.delete('/user/history')
      } catch (err) {
        console.error('清空服务器历史记录失败:', err)
      }
    } else {
      saveLocalHistory([])
    }
  }

  // 格式化观看时间
  const formatWatchTime = (date: string): string => {
    const now = new Date()
    const watchDate = new Date(date)
    const diffMs = now.getTime() - watchDate.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return '刚刚'
    if (diffMins < 60) return `${diffMins}分钟前`
    if (diffHours < 24) return `${diffHours}小时前`
    if (diffDays < 7) return `${diffDays}天前`
    return watchDate.toLocaleDateString('zh-CN')
  }

  // 监听登录状态变化
  watch(
    () => userStore.isAuthenticated,
    async (isAuthenticated, wasAuthenticated) => {
      // 从未登录变为已登录时，触发同步
      if (isAuthenticated && !wasAuthenticated) {
        await loadHistory()
      }
      // 从已登录变为未登录时，重新加载本地数据
      if (!isAuthenticated && wasAuthenticated) {
        history.value = loadLocalHistory()
      }
    }
  )

  // 初始化
  onMounted(() => {
    loadHistory()
  })

  return {
    history,
    loading,
    syncing,
    addToHistory,
    removeFromHistory,
    clearHistory,
    formatWatchTime,
    loadHistory,
  }
}
