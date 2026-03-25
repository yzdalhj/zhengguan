<template>
  <div class="bg-white rounded-lg overflow-hidden shadow card-hover cursor-pointer group" @click="openVideo">
    <div class="relative aspect-video bg-gray-100">
      <img
        v-if="video.thumbnail_url"
        :src="video.thumbnail_url"
        :alt="video.title"
        class="w-full h-full object-cover"
        loading="lazy"
      />
      <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
        <svg class="w-16 h-16 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
        </svg>
      </div>
      <div v-if="video.duration" class="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
        {{ formatDuration(video.duration) }}
      </div>
      <div v-if="video.platform" class="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
        {{ video.platform }}
      </div>
    </div>
    <div class="p-4">
      <h3 class="font-semibold text-gray-900 mb-2 line-clamp-2 leading-tight">
        {{ video.title }}
      </h3>
      <p v-if="video.source_film" class="text-sm text-gray-500 mb-2">
        {{ video.source_film }}
      </p>
      <div class="flex flex-wrap gap-1 mt-2">
        <span
          v-for="tag in video.tags?.slice(0, 3)"
          :key="tag.id"
          class="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded"
        >
          {{ tag.name }}
        </span>
        <span v-if="(video.tags?.length || 0) > 3" class="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
          +{{ (video.tags?.length || 0) - 3 }}
        </span>
      </div>
      <div class="flex items-center justify-between mt-3 text-xs text-gray-400">
        <span>{{ video.views }} 观看</span>
        <span>{{ video.likes }} 点赞</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Video } from '@/types';
import { useRouter } from 'vue-router';

const props = defineProps<{
  video: Video;
}>();

const router = useRouter();

const openVideo = () => {
  router.push(`/video/${props.video.id}`);
};

const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};
</script>
