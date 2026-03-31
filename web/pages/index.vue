<template>
  <div>
    <!-- 横幅 - 只在客户端渲染，避免水合不匹配 -->
    <ClientOnly>
      <div v-if="!userStore.bannerClosed" class="px-5 pt-6">
        <div
          class="group/banner relative overflow-hidden rounded-xl bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600"
        >
          <!-- 关闭按钮 - 右上角，鼠标进入横幅显示 -->
          <button
            @click="closeBanner"
            class="absolute top-3 right-3 z-50 flex items-center justify-center w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 text-white opacity-0 group-hover/banner:opacity-100 transition-all duration-200 backdrop-blur-sm border border-white/30"
            title="关闭"
          >
            <Icon name="heroicons:x-mark" class="w-4 h-4" />
          </button>
          <div class="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50"></div>
          <div class="relative flex items-center justify-between px-6 py-5">
            <div class="flex items-center gap-4">
              <div
                class="rounded-xl bg-white/20 flex items-center justify-center shrink-0"
                style="width: 56px; height: 56px;"
              >
                <Icon name="heroicons:film" class="w-7 h-7" style="color: white;" />
              </div>
              <div class="min-w-0 p-12px">
                <h3 class="font-bold text-white mb-1" style="font-size: 16px;">观千帧而后识镜，阅百剑而后闻器</h3>
                <p class="text-white/70" style="font-size: 13px;">汇聚全球精选影视片段，从经典镜头到创意剪辑，为创作者提供无限灵感。探索、学习、创作，让每一帧都成为你的灵感源泉。</p>
              </div>
            </div>
            <NuxtLink
              to="/videos"
              class="bg-white text-primary font-medium rounded-lg hover:bg-white/90 transition-colors whitespace-nowrap shrink-0"
              style="padding: 10px 20px; font-size: 13px;"
            >
              探索更多灵感
            </NuxtLink>
          </div>
        </div>
      </div>
    </ClientOnly>

    <!-- 最新视频分区 -->
    <section class="px-5 py-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-semibold text-(--text-primary)">最新视频</h2>
        <NuxtLink
          to="/videos"
          class="flex items-center gap-1 px-4 py-2 text-primary hover:text-primary-hover transition-colors rounded-lg hover:bg-primary/10"
        >
          <span class="text-sm font-medium">更多视频</span>
          <Icon name="heroicons:chevron-right" class="w-4 h-4" />
        </NuxtLink>
      </div>
      <div
        class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-2 md:gap-3"
      >
        <video-card v-for="video in videos.slice(0, 14)" :key="video.id" :video="video" />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { Video } from '~/types'

// SEO
useHead({
  title: '首页',
  meta: [
    { name: 'description', content: '搜索优质影视分镜、动作场面、打斗镜头参考，为视频创作提供灵感。' }
  ]
})

const { $api } = useNuxtApp()
const userStore = useUserStore()

// 使用 SSR 获取首屏数据
const { data: videosResponse } = await useAsyncData(
  'home-videos',
  async () => {
    const response = await $api.get('/videos', {
      params: { page: 1, limit: 20 }
    })
    return response
  },
  {
    server: true,
    default: () => ({ data: [] })
  }
)

// 本地状态管理
const videos = computed(() => videosResponse.value?.data || [])

// 关闭横幅
const closeBanner = () => {
  userStore.closeBanner()
}
</script>
