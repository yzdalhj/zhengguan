<template>
  <div class="bg-white rounded-lg shadow p-4 mb-6">
    <h3 class="font-semibold mb-4">筛选</h3>

    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-2">关键词</label>
      <input
        v-model="keyword"
        type="text"
        placeholder="搜索标题、描述..."
        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        @input="debounceUpdate"
      />
    </div>

    <div class="mb-4" v-if="tags.length > 0">
      <label class="block text-sm font-medium text-gray-700 mb-2">标签</label>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="tag in tags"
          :key="tag.id"
          @click="toggleTag(tag.id)"
          :class="[
            'px-2 py-1 text-xs rounded border',
            isSelected(tag.id)
              ? 'bg-primary text-white border-primary'
              : 'bg-white text-gray-600 border-gray-300 hover:border-primary'
          ]"
        >
          {{ tag.name }}
        </button>
      </div>
    </div>

    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-2">时长范围（秒）</label>
      <div class="flex gap-4">
        <input
          v-model.number="minDuration"
          type="number"
          placeholder="最小"
          class="w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <input
          v-model.number="maxDuration"
          type="number"
          placeholder="最大"
          class="w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
    </div>

    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-2">平台</label>
      <select v-model="platform" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
        <option value="">全部</option>
        <option value="youtube">YouTube</option>
        <option value="bilibili">Bilibili</option>
        <option value="vimeo">Vimeo</option>
      </select>
    </div>

    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-2">排序</label>
      <select v-model="sort" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
        <option value="created_at_desc">最新</option>
        <option value="views_desc">最多观看</option>
        <option value="likes_desc">最多点赞</option>
        <option value="upload_date_desc">最新上传</option>
      </select>
    </div>

    <div class="flex gap-2">
      <button @click="applyFilters" class="flex-1 bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 transition-colors">
        应用筛选
      </button>
      <button @click="clearFilters" class="flex-1 bg-gray-100 text-gray-600 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors">
        清空
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useVideoStore } from '@/stores/video';

const videoStore = useVideoStore();

const keyword = ref('');
const minDuration = ref<number | undefined>();
const maxDuration = ref<number | undefined>();
const platform = ref<string>('');
const sort = ref('created_at_desc');

let debounceTimer: number | null = null;

const tags = videoStore.tags;

const isSelected = (tagId: number) => {
  return videoStore.filters.selectedTags.includes(tagId);
};

const toggleTag = (tagId: number) => {
  videoStore.toggleTag(tagId);
};

const debounceUpdate = () => {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = window.setTimeout(() => {
    videoStore.setKeyword(keyword.value);
  }, 300);
};

const applyFilters = () => {
  videoStore.filters.minDuration = minDuration.value;
  videoStore.filters.maxDuration = maxDuration.value;
  videoStore.filters.platform = platform.value || undefined;
  videoStore.filters.sort = sort.value;
  videoStore.fetchVideos(1);
};

const clearFilters = () => {
  keyword.value = '';
  minDuration.value = undefined;
  maxDuration.value = undefined;
  platform.value = '';
  sort.value = 'created_at_desc';
  videoStore.clearFilters();
};

onMounted(() => {
  keyword.value = videoStore.filters.keyword;
  minDuration.value = videoStore.filters.minDuration;
  maxDuration.value = videoStore.filters.maxDuration;
  platform.value = videoStore.filters.platform || '';
  sort.value = videoStore.filters.sort;
});
</script>
