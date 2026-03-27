<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>

<script setup lang="ts">
onMounted(() => {
  const userStore = useUserStore()
  userStore.initAuth()
})
</script>
