<template>
  <seo-meta :seo="seo" />
  <div class="min-h-screen">
    <!-- Header -->
    <div class="glass-strong border-b border-white/5">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-2xl sm:text-3xl font-bold text-white">搜索素材</h1>
            <p class="text-dark-400 mt-1">找到你需要的分镜参考</p>
          </div>
          
          <!-- Search Input -->
          <div class="relative max-w-md w-full">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg class="w-5 h-5 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
            <input
              v-model="searchQuery"
              @keyup.enter="handleSearch"
              type="text"
              placeholder="搜索动作、镜头类型、影片名称..."
              class="w-full pl-11 pr-4 py-3 bg-surface border border-white/10 rounded-xl text-white placeholder-dark-400 focus:outline-none focus:border-primary/50 transition-colors"
            />
            <button
              v-if="searchQuery"
              @click="clearSearch"
              class="absolute inset-y-0 right-0 pr-4 flex items-center"
            >
              <svg class="w-5 h-5 text-dark-400 hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Active Filters -->
        <div v-if="hasActiveFilters" class="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-white/5">
          <span class="text-sm text-dark-400">筛选条件：</span>
          <span
            v-for="tag in selectedTags"
            :key="tag.id"
            class="inline-flex items-center gap-1 px-3 py-1 bg-primary/20 text-primary text-sm rounded-lg"
          >
            {{ tag.name }}
            <button @click="removeTag(tag.id)" class="hover:text-white transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </span>
          <button
            @click="clearAllFilters"
            class="text-sm text-dark-400 hover:text-primary transition-colors"
          >
            清除全部
          </button>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex flex-col lg:flex-row gap-8">
        <!-- Sidebar Filters -->
        <aside class="lg:w-64 flex-shrink-0">
          <div class="glass rounded-2xl p-5 sticky top-24">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-semibold text-white">筛选</h3>
              <button
                v-if="hasActiveFilters"
                @click="clearAllFilters"
                class="text-xs text-dark-400 hover:text-primary transition-colors"
              >
                重置
              </button>
            </div>

            <!-- Tags Filter -->
            <div class="mb-6">
              <h4 class="text-sm font-medium text-dark-300 mb-3">标签分类</h4>
              <div class="space-y-2 max-h-64 overflow-y-auto scrollbar-hide">
                <button
                  v-for="tag in availableTags"
                  :key="tag.id"
                  @click="toggleTag(tag.id)"
                  :class="[
                    'w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all',
                    isTagSelected(tag.id)
                      ? 'bg-primary/20 text-primary'
                      : 'text-dark-300 hover:bg-white/5 hover:text-white'
                  ]"
                >
                  <span>{{ tag.name }}</span>
                  <svg
                    v-if="isTagSelected(tag.id)"
                    class="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Duration Filter -->
            <div class="mb-6">
              <h4 class="text-sm font-medium text-dark-300 mb-3">时长</h4>
              <div class="space-y-2">
                <button
                  v-for="option in durationOptions"
                  :key="option.value"
                  @click="setDuration(option.value)"
                  :class="[
                    'w-full text-left px-3 py-2 rounded-lg text-sm transition-all',
                    selectedDuration === option.value
                      ? 'bg-primary/20 text-primary'
                      : 'text-dark-300 hover:bg-white/5 hover:text-white'
                  ]"
                >
                  {{ option.label }}
                </button>
              </div>
            </div>

            <!-- Platform Filter -->
            <div>
              <h4 class="text-sm font-medium text-dark-300 mb-3">平台</h4>
              <div class="space-y-2">
                <button
                  v-for="platform in platformOptions"
                  :key="platform.value"
                  @click="setPlatform(platform.value)"
                  :class="[
                    'w-full text-left px-3 py-2 rounded-lg text-sm transition-all',
                    selectedPlatform === platform.value
                      ? 'bg-primary/20 text-primary'
                      : 'text-dark-300 hover:bg-white/5 hover:text-white'
                  ]"
                >
                  {{ platform.label }}
                </button>
              </div>
            </div>
          </div>
        </aside>

        <!-- Results -->
        <div class="flex-1">
          <!-- Results Header -->
          <div class="flex items-center justify-between mb-6">
            <p class="text-dark-400">
              共找到 <span class="text-white font-semibold">{{ total }}</span> 个结果
            </p>
            <div class="flex items-center gap-2">
              <span class="text-sm text-dark-400">排序：</span>
              <select
                v-model="sortBy"
                @change="handleSortChange"
                class="bg-surface border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50"
              >
                <option value="newest">最新发布</option>
                <option value="popular">最受欢迎</option>
                <option value="views">最多观看</option>
              </select>
            </div>
          </div>

          <!-- Video Grid -->
          <div v-if="!loading && videos.length > 0" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            <video-card
              v-for="video in videos"
              :key="video.id"
              :video="video"
            />
          </div>

          <!-- Loading State -->
          <div v-else-if="loading" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            <div v-for="i in 6" :key="i" class="glass rounded-2xl overflow-hidden">
              <div class="aspect-video bg-dark-100 animate-pulse"></div>
              <div class="p-4 space-y-3">
                <div class="h-4 bg-dark-100 rounded animate-pulse"></div>
                <div class="h-3 bg-dark-100 rounded w-2/3 animate-pulse"></div>
                <div class="flex gap-2">
                  <div class="h-6 w-16 bg-dark-100 rounded animate-pulse"></div>
                  <div class="h-6 w-16 bg-dark-100 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="text-center py-20">
            <div class="w-20 h-20 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center">
              <svg class="w-10 h-10 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-white mb-2">未找到相关结果</h3>
            <p class="text-dark-400 mb-6">尝试调整搜索词或筛选条件</p>
            <button
              @click="clearAllFilters"
              class="px-6 py-3 bg-primary hover:bg-primary-700 text-white font-medium rounded-xl transition-all"
            >
              清除筛选条件
            </button>
          </div>

          <!-- Load More -->
          <div v-if="hasMore && !loading" class="text-center mt-10">
            <button
              @click="loadMore"
              class="px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl transition-all border border-white/10 hover:border-primary/50"
            >
              加载更多
            </button>
          </div>

          <!-- Pagination Info -->
          <div v-if="pagination && videos.length > 0" class="mt-8 text-center text-dark-500 text-sm">
            第 {{ currentPage }} 页，共 {{ totalPages }} 页
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useSeoMeta } from '@vueuse/head';
import { useVideoStore } from '@/stores/video';
import VideoCard from '@/components/VideoCard.vue';
import SeoMeta from '@/components/SeoMeta.vue';
import type { Tag } from '@/types';

const route = useRoute();
const router = useRouter();
const videoStore = useVideoStore();

// SEO
const seo = {
  title: '搜索 - 帧观',
  description: '搜索您需要的影视分镜参考素材，支持标签筛选、多维度过滤。找到适合创作参考的高质量分镜、动作场面。',
  keywords: '搜索,帧观,影视分镜,动作参考,视频创作',
};

useSeoMeta({
  title: seo.title,
  description: seo.description,
});

// State
const searchQuery = ref('');
const selectedTags = ref<Tag[]>([]);
const selectedDuration = ref<string>('');
const selectedPlatform = ref<string>('');
const sortBy = ref('newest');

// Options
const durationOptions = [
  { value: '', label: '全部时长' },
  { value: '0-60', label: '1分钟以内' },
  { value: '60-300', label: '1-5分钟' },
  { value: '300-600', label: '5-10分钟' },
  { value: '600+', label: '10分钟以上' },
];

const platformOptions = [
  { value: '', label: '全部平台' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'bilibili', label: 'Bilibili' },
];

// Computed
const videos = computed(() => videoStore.videos);
const loading = computed(() => videoStore.loading);
const hasMore = computed(() => videoStore.hasMore);
const total = computed(() => videoStore.total);
const currentPage = computed(() => videoStore.currentPage);
const totalPages = computed(() => videoStore.totalPages);
const pagination = computed(() => ({
  page: videoStore.currentPage,
  limit: 20,
  total: videoStore.total,
  totalPages: videoStore.totalPages,
}));

const availableTags = computed(() => videoStore.tags);

const hasActiveFilters = computed(() => {
  return selectedTags.value.length > 0 || 
         selectedDuration.value || 
         selectedPlatform.value ||
         searchQuery.value;
});

// Methods
const isTagSelected = (tagId: number) => {
  return selectedTags.value.some(t => t.id === tagId);
};

const toggleTag = (tagId: number) => {
  const tag = availableTags.value.find(t => t.id === tagId);
  if (!tag) return;

  const index = selectedTags.value.findIndex(t => t.id === tagId);
  if (index > -1) {
    selectedTags.value.splice(index, 1);
  } else {
    selectedTags.value.push(tag);
  }
  performSearch();
};

const removeTag = (tagId: number) => {
  const index = selectedTags.value.findIndex(t => t.id === tagId);
  if (index > -1) {
    selectedTags.value.splice(index, 1);
    performSearch();
  }
};

const setDuration = (duration: string) => {
  selectedDuration.value = selectedDuration.value === duration ? '' : duration;
  performSearch();
};

const setPlatform = (platform: string) => {
  selectedPlatform.value = selectedPlatform.value === platform ? '' : platform;
  performSearch();
};

const handleSearch = () => {
  performSearch();
};

const clearSearch = () => {
  searchQuery.value = '';
  performSearch();
};

const clearAllFilters = () => {
  searchQuery.value = '';
  selectedTags.value = [];
  selectedDuration.value = '';
  selectedPlatform.value = '';
  performSearch();
};

const handleSortChange = () => {
  performSearch();
};

const performSearch = async () => {
  videoStore.setKeyword(searchQuery.value);
  
  // Build query params
  const query: Record<string, any> = {};
  if (searchQuery.value) query.keyword = searchQuery.value;
  if (selectedTags.value.length) query.tags = selectedTags.value.map(t => t.id).join(',');
  if (selectedDuration.value) query.duration = selectedDuration.value;
  if (selectedPlatform.value) query.platform = selectedPlatform.value;
  if (sortBy.value !== 'newest') query.sort = sortBy.value;

  router.replace({ query });
  await videoStore.fetchVideos(1);
};

const loadMore = () => {
  videoStore.loadMore();
};

// Initialize from URL params
onMounted(async () => {
  await videoStore.fetchTags();

  const keyword = route.query.keyword as string;
  if (keyword) {
    searchQuery.value = keyword;
    videoStore.setKeyword(keyword);
  }

  const tagsParam = route.query.tags as string;
  if (tagsParam) {
    const tagIds = tagsParam.split(',').map(id => parseInt(id));
    selectedTags.value = availableTags.value.filter(t => tagIds.includes(t.id));
    tagIds.forEach(id => videoStore.toggleTag(id));
  }

  if (route.query.duration) {
    selectedDuration.value = route.query.duration as string;
  }

  if (route.query.platform) {
    selectedPlatform.value = route.query.platform as string;
  }

  if (route.query.sort) {
    sortBy.value = route.query.sort as string;
  }

  await videoStore.fetchVideos(1);
});

// Watch for route changes
watch(() => route.query, (newQuery) => {
  if (!newQuery.keyword && !newQuery.tags) {
    searchQuery.value = '';
    selectedTags.value = [];
  }
}, { deep: true });
</script>
