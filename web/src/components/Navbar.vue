<template>
  <nav class="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a] border-b border-neutral-800">
    <div class="flex items-center h-14 px-4">
      <!-- Logo -->
      <router-link to="/" class="flex items-center gap-2 flex-shrink-0 mr-8">
        <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
          <svg class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </div>
        <div class="hidden sm:flex flex-col">
          <span class="text-white font-semibold text-lg leading-tight">帧观</span>
          <span class="text-neutral-500 text-xs leading-tight">每一帧，都是灵感</span>
        </div>
      </router-link>

      <!-- Search Bar (Center) -->
      <div class="flex-1 max-w-xl mx-auto">
        <div class="relative">
          <input
            v-model="searchQuery"
            @keyup.enter="handleSearch"
            type="text"
            placeholder="搜索感兴趣的内容或作者"
            class="w-full h-9 pl-10 pr-20 bg-neutral-900 border border-neutral-700 rounded-full text-sm text-white placeholder-neutral-500 focus:border-blue-500 focus:outline-none transition-colors"
          />
          <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <button
            @click="handleSearch"
            class="absolute right-1 top-1/2 -translate-y-1/2 px-4 h-7 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-full transition-colors"
          >
            搜索
          </button>
        </div>
      </div>

      <!-- Right Side Actions -->
      <div class="flex items-center gap-1 ml-4 flex-shrink-0">
        <!-- VIP -->
        <button class="flex items-center gap-1.5 px-3 py-1.5 text-neutral-300 hover:text-white transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>
          </svg>
          <span class="text-sm hidden md:block">会员</span>
        </button>

        <!-- History -->
        <button class="flex items-center gap-1.5 px-3 py-1.5 text-neutral-300 hover:text-white transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span class="text-sm hidden md:block">历史</span>
        </button>

        <!-- Auth Buttons -->
        <template v-if="!userStore.isAuthenticated">
          <router-link
            to="/login"
            class="px-4 py-1.5 text-sm text-neutral-300 hover:text-white transition-colors"
          >
            登录
          </router-link>
          <router-link
            to="/register"
            class="px-4 py-1.5 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded-full transition-colors"
          >
            注册
          </router-link>
        </template>

        <!-- User Menu (when authenticated) -->
        <template v-else>
          <div class="relative" ref="userMenuRef">
            <button
              @click="toggleUserMenu"
              class="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-neutral-800 transition-colors"
            >
              <div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-medium">
                {{ userInitial }}
              </div>
            </button>

            <Transition
              enter-active-class="transition duration-200 ease-out"
              enter-from-class="transform scale-95 opacity-0"
              enter-to-class="transform scale-100 opacity-100"
              leave-active-class="transition duration-150 ease-in"
              leave-from-class="transform scale-100 opacity-100"
              leave-to-class="transform scale-95 opacity-0"
            >
              <div
                v-if="showUserMenu"
                class="absolute right-0 mt-2 w-48 bg-neutral-900 border border-neutral-800 rounded-xl py-2 shadow-elevated"
              >
                <router-link
                  to="/collections"
                  @click="showUserMenu = false"
                  class="flex items-center gap-2 px-4 py-2 text-sm text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                  </svg>
                  我的收藏
                </router-link>
                <button
                  @click="handleLogout"
                  class="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                  </svg>
                  退出登录
                </button>
              </div>
            </Transition>
          </div>
        </template>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const searchQuery = ref('')
const showUserMenu = ref(false)
const userMenuRef = ref<HTMLElement | null>(null)

const userInitial = computed(() => {
  return userStore.user?.username?.charAt(0).toUpperCase() || 'U'
})

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

const handleLogout = () => {
  showUserMenu.value = false
  userStore.logout()
  router.push('/')
}

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({
      path: '/search',
      query: { keyword: searchQuery.value.trim() }
    })
  }
}

const handleClickOutside = (event: MouseEvent) => {
  if (userMenuRef.value && !userMenuRef.value.contains(event.target as Node)) {
    showUserMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  // 从 URL 初始化搜索词
  if (route.query.keyword) {
    searchQuery.value = route.query.keyword as string
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
