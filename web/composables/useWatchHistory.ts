import type { Video } from '~/types'

interface WatchHistoryItem {
  video: Video
  watchedAt: string
  progress?: number
}

export function useWatchHistory() {
  const history = useState<WatchHistoryItem[]>('watch-history', () => [])
  const maxHistoryItems = 100

  // 从 localStorage 加载历史记录
  const loadHistory = () => {
    if (process.client) {
      const saved = localStorage.getItem('watch-history')
      if (saved) {
        try {
          history.value = JSON.parse(saved)
        } catch {
          history.value = []
        }
      }
    }
  }

  // 保存到 localStorage
  const saveHistory = () => {
    if (process.client) {
      localStorage.setItem('watch-history', JSON.stringify(history.value))
    }
  }

  // 添加观看记录
  const addToHistory = (video: Video, progress?: number) => {
    // 移除已存在的相同视频
    history.value = history.value.filter(item => item.video.id !== video.id)
    
    // 添加到开头
    history.value.unshift({
      video,
      watchedAt: new Date().toISOString(),
      progress,
    })
    
    // 限制数量
    if (history.value.length > maxHistoryItems) {
      history.value = history.value.slice(0, maxHistoryItems)
    }
    
    saveHistory()
  }

  // 移除单条记录
  const removeFromHistory = (videoId: number) => {
    history.value = history.value.filter(item => item.video.id !== videoId)
    saveHistory()
  }

  // 清空历史
  const clearHistory = () => {
    history.value = []
    saveHistory()
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

  // 初始化
  onMounted(() => {
    loadHistory()
  })

  return {
    history: readonly(history),
    addToHistory,
    removeFromHistory,
    clearHistory,
    formatWatchTime,
  }
}
