<template>
  <nav
    class="fixed top-0 left-0 right-0 z-50 bg-(--bg-primary) border-b border-(--border-color) h-14"
  >
    <div class="flex items-center h-full px-4 min-h-0">
      <!-- Logo -->
      <NuxtLink to="/" class="flex items-center gap-2 shrink-0 mr-8">
        <div
          class="rounded-lg bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center w-8 h-8"
        >
          <svg class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </div>
        <div class="hidden sm:flex flex-col">
          <span class="text-(--text-primary) font-semibold leading-tight text-lg">帧观</span>
          <span class="text-(--text-muted) leading-tight text-xs">每一帧，都是灵感</span>
        </div>
      </NuxtLink>

      <!-- Search Bar (Center) -->
      <div class="flex-1 max-w-xl mx-auto">
        <div class="relative">
          <input
            v-model="searchQuery"
            @keyup.enter="handleSearch"
            type="text"
            placeholder="搜索感兴趣的内容或作者"
            class="w-full h-9 pl-9 pr-18 text-sm bg-(--bg-input) border border-(--border-color) rounded-full text-(--text-primary) placeholder-(--text-muted) focus:border-primary focus:outline-none transition-colors"
          />
          <dynamic-icon name="search" size="12px" class="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-muted)" />
          <button
            @click="handleSearch"
            class="absolute right-1 h-7 pl-4 pr-4 text-sm top-1/2 -translate-y-1/2 bg-primary hover:bg-primary-hover text-white font-medium rounded-full transition-colors"
          >
            搜索
          </button>
        </div>
      </div>

      <!-- Right Side Actions -->
      <div class="flex items-center gap-1 ml-4 shrink-0 min-h-0">
        <!-- Theme Toggle -->
        <button
          @click="toggleTheme"
          class="flex items-center gap-1.5 px-3 py-1.5 text-(--text-secondary) hover:text-(--text-primary) transition-colors"
          :title="isDark ? '切换到浅色模式' : '切换到深色模式'"
        >
          <dynamic-icon :name="isDark ? 'sunny' : 'moon'" size="12px" />
          <span class="hidden md:block text-xs">{{ isDark ? '浅色' : '深色' }}</span>
        </button>

        <!-- VIP -->
        <NuxtLink
          to="/vip"
          class="flex items-center gap-1.5 px-3 py-1.5 text-amber-400 hover:text-amber-300 transition-colors"
        >
          <Icon name="heroicons:crown" size="16px" />
          <span class="hidden md:block text-xs font-medium">会员</span>
        </NuxtLink>

        <!-- Collections -->
        <button
          @click="navigateTo('/collections')"
          class="flex items-center gap-1.5 px-3 py-1.5 text-(--text-secondary) hover:text-(--text-primary) transition-colors">
            <Icon name="heroicons:heart" size="12px" />
            <span class="hidden md:block text-xs">收藏</span>
        </button>
 

        <!-- Auth Buttons -->
        <template v-if="!userStore.isAuthenticated">
          <button
            @click="loginMode = 'login'; showLoginDialog = true"
            class="px-4 py-1.5  bg-primary hover:bg-primary-hover text-white rounded-full transition-colors text-sm"
          >
            登录
          </button>
          <!-- <NuxtLink
            to="/register"
            class="px-4 py-1.5"
            style="font-size: 13px;"
          >
            注册
          </NuxtLink> -->

          <UiDialog
            v-model:model-value="showLoginDialog"
            :title="loginMode === 'login' ? '登录' : '注册'"
            size="xl"
            :plain="true"
            :show-close="true"
          >
            <LoginForm
              :mode="loginMode"
              @close="showLoginDialog = false"
              @success="handleLoginSuccess"
              @switch-mode="loginMode = loginMode === 'login' ? 'register' : 'login'"
            />
          </UiDialog>
        </template>

        <!-- User Menu (when authenticated) -->
        <template v-else>
          <div class="relative" ref="userMenuRef">
            <button
              @click="toggleUserMenu"
              class="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-(--bg-secondary) transition-colors"
            >
              <div
                class="rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium"
                style="width: 32px; height: 32px; font-size: 13px;"
              >
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
                class="absolute right-0 mt-2 bg-(--bg-elevated) border border-(--border-color) rounded-xl py-2 shadow-elevated"
                style="width: 160px;"
              >
                <NuxtLink
                  to="/collections"
                  @click="showUserMenu = false"
                  class="flex items-center gap-2 px-4 py-2 text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--bg-secondary) transition-colors"
                  style="font-size: 13px;"
                >
                  <dynamic-icon name="heart" size="20px" />
                  我的收藏
                </NuxtLink>
                <NuxtLink
                  to="/prompts"
                  @click="showUserMenu = false"
                  class="flex items-center gap-2 px-4 py-2 text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--bg-secondary) transition-colors"
                  style="font-size: 13px;"
                >
                  <dynamic-icon name="sparkles" size="20px" />
                  提示词库
                </NuxtLink>
                <NuxtLink
                  to="/vip"
                  @click="showUserMenu = false"
                  class="flex items-center gap-2 px-4 py-2 text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 transition-colors"
                  style="font-size: 13px;"
                >
                  <dynamic-icon name="crown" size="20px" />
                  {{ userStore.user?.level && userStore.user.level !== 'normal' ? (userStore.user.level === 'svip' ? 'SVIP会员' : 'VIP会员') : '开通会员' }}
                </NuxtLink>
                <button
                  @click="handleLogout"
                  class="w-full flex items-center gap-2 px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                  style="font-size: 13px;"
                >
                  <dynamic-icon name="logout" size="14px" />
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

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const { isDark, toggleTheme } = useColorTheme()

const searchQuery = ref('')
const showUserMenu = ref(false)
const showLoginDialog = ref(false)
const loginMode = ref<'login' | 'register'>('login')
const userMenuRef = ref<HTMLElement | null>(null)

const userInitial = computed(() => {
  return userStore.user?.username?.charAt(0).toUpperCase() || 'U'
})

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

const handleLoginSuccess = () => {
  showLoginDialog.value = false
  router.push('/collections')
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
