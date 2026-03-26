<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
// 全局初始化
onMounted(() => {
  // 初始化用户认证状态
  const userStore = useUserStore()
  userStore.initAuth()
})
</script>
