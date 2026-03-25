<template>
  <seo-meta :seo="seo" />
  <div class="min-h-[60vh] flex items-center justify-center">
    <div class="text-center">
      <h1 class="text-9xl font-bold text-gray-200">404</h1>
      <h2 class="text-3xl font-semibold text-gray-900 mt-4">页面不存在</h2>
      <p class="text-gray-500 mt-2">你访问的页面不存在</p>
      <router-link to="/" class="inline-block mt-6 bg-primary text-white px-6 py-2 rounded-md hover:bg-primary/90">
        返回首页
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSeoMeta } from '@vueuse/head';
import SeoMeta from '@/components/SeoMeta.vue';

const seo = {
  title: '页面不存在 - 帧观',
  description: '你访问的页面不存在',
};

useSeoMeta({
  title: seo.title,
  description: seo.description,
});
</script>
