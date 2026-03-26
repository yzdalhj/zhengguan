<template>
  <div class="min-h-[60vh] flex items-center justify-center">
    <div class="text-center">
      <h1 class="text-9xl font-bold text-gray-200">404</h1>
      <h2 class="text-3xl font-semibold text-gray-900 mt-4">页面不存在</h2>
      <p class="text-gray-500 mt-2">你访问的页面不存在</p>
      <NuxtLink to="/" class="inline-block mt-6 bg-primary text-white px-6 py-2 rounded-md hover:bg-primary/90">
        返回首页
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'blank'
})

// SEO
useHead({
  title: '页面不存在',
  meta: [
    { name: 'description', content: '你访问的页面不存在' }
  ]
})
</script>
