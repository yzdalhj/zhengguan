<template>
  <seo-meta :seo="seo" />
  <div class="container mx-auto px-4 py-6">
    <h1 class="text-3xl font-bold mb-6">搜索</h1>
    
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div class="lg:col-span-1">
        <filter-panel />
      </div>
      <div class="lg:col-span-3">
        <div v-if="!loading && videos.length === 0" class="text-center py-20 text-gray-500">
          <p class="text-lg">没有找到符合条件的视频</p>
          <p class="text-sm mt-2">试试调整筛选条件吧</p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <video-card v-for="video in videos" :key="video.id" :video="video" />
        </div>

        <div v-if="loading" class="text-center py-10">
          加载中...
        </div>

        <div v-if="hasMore && !loading" class="text-center mt-8">
          <button @click="loadMore" class="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary/90">
            加载更多
          </button>
        </div>

        <div v-if="pagination" class="mt-6 text-center text-gray-500 text-sm">
          共 {{ pagination.total }} 个结果，{{ pagination.totalPages }} 页
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useSeoMeta } from '@vueuse/head';
import { useVideoStore } from '@/stores/video';
import VideoCard from '@/components/VideoCard.vue';
import FilterPanel from '@/components/FilterPanel.vue';
import SeoMeta from '@/components/SeoMeta.vue';

const route = useRoute();
const videoStore = useVideoStore();

const seo = {
  title: '搜索 - 帧观',
  description: '搜索您需要的影视分镜参考素材，支持标签筛选、多维度过滤。找到适合创作参考的高质量分镜、动作场面。',
  keywords: '搜索,帧观,影视分镜,动作参考,视频创作',
};

useSeoMeta({
  title: seo.title,
  description: seo.description,
});

const videos = computed(() => videoStore.videos);
const loading = computed(() => videoStore.loading);
const hasMore = computed(() => videoStore.hasMore);
const pagination = computed(() => ({
  page: videoStore.currentPage,
  limit: 20,
  total: videoStore.total,
  totalPages: videoStore.totalPages,
}));

const loadMore = () => {
  videoStore.loadMore();
};

onMounted(async () => {
  await videoStore.fetchTags();
  
  const keyword = route.query.keyword as string;
  if (keyword) {
    videoStore.setKeyword(keyword);
  }
  
  const tags = route.query.tags ? [parseInt(route.query.tags as string)] : [];
  if (tags.length > 0 && !isNaN(tags[0])) {
    videoStore.toggleTag(tags[0]);
  }
  
  await videoStore.fetchVideos(1);
});
</script>
