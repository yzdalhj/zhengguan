export default defineNuxtPlugin(() => {
  // 在客户端初始化时恢复用户认证状态
  const userStore = useUserStore()
  userStore.initAuth()
})
