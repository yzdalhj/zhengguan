<template>
  <seo-meta :seo="seo" />
  <div class="container mx-auto px-4 py-6">
    <h1 class="text-3xl font-bold mb-6">我的收藏</h1>

    <div v-if="!isAuthenticated" class="text-center py-20">
      <p class="text-gray-500 mb-4">请登录后查看收藏</p>
      <router-link to="/login" class="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary/90">
        去登录
      </router-link>
    </div>

    <template v-else>
      <div v-if="loading && collections.length === 0" class="text-center py-10">
        加载中...
      </div>

      <div v-if="!loading && collections.length === 0" class="text-center py-20 text-gray-500">
        暂无收藏
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <video-card v-for="collection in collections" :key="collection.id" :video="collection.video!" />
      </div>

      <div v-if="hasMore" class="text-center mt-8">
        <button @click="loadMore" :disabled="loading" class="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary/90 disabled:opacity-50">
          {{ loading ? '加载中...' : '加载更多' }}
        </button>
      </div>

      <div v-if="collections.length > 0" class="mt-8 text-center">
        <a href="/api/user/collections/export" target="_blank" class="text-primary hover:underline">
          导出收藏(JSON)
        </a>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useSeoMeta } from '@vueuse/head';
import { useUserStore } from '@/stores/user';
import api from '@/composables/api';
import VideoCard from '@/components/VideoCard.vue';
import SeoMeta from '@/components/SeoMeta.vue';
import type { Collection } from '@/types';

const userStore = useUserStore();

const seo = {
  title: '我的收藏 - 帧观',
  description: '查看你收藏的影视分镜参考素材',
};

useSeoMeta({
  title: seo.title,
  description: seo.description,
});

const collections = ref<Collection[]>([]);
const loading = ref(false);
const currentPage = ref(1);
const totalPages = ref(1);
const hasMore = computed(() => currentPage.value < totalPages.value);
const isAuthenticated = computed(() => userStore.isAuthenticated);

const loadMore = async () => {
  if (loading.value || !hasMore.value) return;
  
  loading.value = true;
  try {
    const response = await api.get('/api/user/collections', {
      page: currentPage.value + 1,
      limit: 20,
    });
    collections.value.push(...response.data);
    currentPage.value++;
    totalPages.value = response.pagination?.totalPages || 1;
  } catch (error) {
    console.error('Failed to load more collections:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  if (!isAuthenticated.value) return;
  
  loading.value = true;
  try {
    const response = await api.get('/api/user/collections', {
      page: 1,
      limit: 20,
    });
    collections.value = response.data;
    currentPage.value = 1;
    totalPages.value = response.pagination?.totalPages || 1;
  } catch (error) {
    console.error('Failed to load collections:', error);
  } finally {
    loading.value = false;
  }
});
</script>
