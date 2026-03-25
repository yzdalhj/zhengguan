<template>
  <div>
    <seo-meta :seo="seo" />
    <section class="bg-gradient-to-b from-blue-50 to-white py-16">
      <div class="container mx-auto px-4 text-center">
        <h1 class="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          帧观
        </h1>
        <p class="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
          每一帧，都是灵感。探索优质影视分镜，为AI视频创作提供参考。
        </p>
        <div class="max-w-2xl mx-auto relative mb-12">
          <input
            v-model="searchQuery"
            @keyup.enter="goSearch"
            type="text"
            placeholder="搜索动作、镜头类型、影片名称..."
            class="w-full px-6 py-4 text-lg rounded-full shadow-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            @click="goSearch"
            class="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-white px-6 py-2 rounded-full hover:bg-primary/90 transition-colors"
          >
            搜索
          </button>
        </div>
      </div>
    </section>

    <section class="container mx-auto px-4 py-10">
      <h2 class="text-2xl font-bold mb-6">热门标签</h2>
      <div class="flex flex-wrap gap-3 mb-10">
        <a
          v-for="tag in popularTags"
          :key="tag.id"
          :href="`/search?tags=${tag.id}`"
          class="px-4 py-2 bg-white rounded-full shadow hover:shadow-md transition-shadow border border-gray-100 hover:border-primary"
        >
          {{ tag.name }}
        </a>
      </div>

      <h2 class="text-2xl font-bold mb-6">推荐素材</h2>
      <div v-if="!loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <video-card v-for="video in videos" :key="video.id" :video="video" />
      </div>
      <div v-else class="text-center py-10">加载中...</div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useSeoMeta } from '@vueuse/head';
import { useVideoStore } from '@/stores/video';
import VideoCard from '@/components/VideoCard.vue';
import SeoMeta from '@/components/SeoMeta.vue';
import type { Tag, Video } from '@/types';

const router = useRouter();
const videoStore = useVideoStore();

const searchQuery = ref('');
const loading = ref(true);
const videos = ref<Video[]>([]);
const popularTags = ref<Tag[]>([]);

const seo = {
  title: '帧观 - 每一帧，都是灵感',
  description: '帧观 - 探索优质影视分镜，为AI视频创作提供灵感。专注动作场面、打斗镜头参考，所有内容均通过第三方平台外链展示。',
  keywords: '帧观,影视分镜,动作参考,视频创作,镜头参考,AI视频生成,Sora,Runway',
};

useSeoMeta({
  title: seo.title,
  description: seo.description,
});

const goSearch = () => {
  if (searchQuery.value.trim()) {
    videoStore.setKeyword(searchQuery.value);
    router.push({
      path: '/search',
      query: { keyword: searchQuery.value },
    });
  }
};

onMounted(async () => {
  await videoStore.fetchTags();
  popularTags.value = videoStore.tags.slice(0, 30);
  await videoStore.fetchVideos(1);
  videos.value = videoStore.videos;
  loading.value = false;
});
</script>
