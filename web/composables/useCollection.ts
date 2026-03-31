import type { Video } from '~/types'

export function useCollection() {
  const userStore = useUserStore()
  const { $api } = useNuxtApp()

  const isCollected = ref(false)
  const checking = ref(false)

  const checkCollection = async (videoId: number) => {
    if (!userStore.isAuthenticated) {
      isCollected.value = false
      return
    }
    checking.value = true
    try {
      const res = await $api.get(`/user/collections/check/${videoId}`)
      isCollected.value = res.data.isCollected
    } catch (err) {
      console.error('检查收藏状态失败:', err)
      isCollected.value = false
    } finally {
      checking.value = false
    }
  }

  const toggleCollection = async (videoId: number) => {
    if (!userStore.isAuthenticated) {
      navigateTo('/login')
      return
    }
    try {
      if (isCollected.value) {
        await $api.delete(`/user/collections/${videoId}`)
        isCollected.value = false
      } else {
        await $api.post(`/user/collections/${videoId}`)
        isCollected.value = true
      }
    } catch (err) {
      console.error('切换收藏状态失败:', err)
      throw err
    }
  }

  return {
    isCollected,
    checking: readonly(checking),
    checkCollection,
    toggleCollection,
  }
}
