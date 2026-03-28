<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
onMounted(() => {
  const userStore = useUserStore()
  userStore.initAuth()
})
</script>
