<template>
  <div class="min-h-[60vh] flex items-center justify-center py-12 px-4">
    <div class="max-w-md w-full space-y-8 bg-(--bg-elevated) p-8 rounded-lg shadow border border-(--border-color)">
      <div>
        <h2 class="text-center text-3xl font-bold text-(--text-primary)">登录</h2>
      </div>
      <form @submit.prevent="handleLogin" class="mt-8 space-y-6">
        <div>
          <label for="email" class="block text-sm font-medium text-(--text-secondary) mb-1">邮箱</label>
          <input
            v-model="email"
            id="email"
            type="email"
            required
            class="w-full px-3 py-2 bg-(--bg-input) border border-(--border-color) rounded-md text-(--text-primary) focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label for="password" class="block text-sm font-medium text-(--text-secondary) mb-1">密码</label>
          <input
            v-model="password"
            id="password"
            type="password"
            required
            class="w-full px-3 py-2 bg-(--bg-input) border border-(--border-color) rounded-md text-(--text-primary) focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div v-if="error" class="text-red-500 text-sm">{{ error }}</div>
        <div>
          <button
            type="submit"
            :disabled="loading"
            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
          >
            {{ loading ? '登录中...' : '登录' }}
          </button>
        </div>
        <div class="text-center text-sm text-(--text-secondary)">
          还没有账号？<NuxtLink to="/register" class="text-primary hover:underline">注册</NuxtLink>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

definePageMeta({
  layout: 'blank'
})

// SEO
useHead({
  title: '登录',
  meta: [
    { name: 'description', content: '登录帧观账号，收藏喜欢的分镜素材。' }
  ]
})

const router = useRouter()
const userStore = useUserStore()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  loading.value = true
  error.value = ''
  
  try {
    await userStore.login(email.value, password.value)
    router.push('/collections')
  } catch (err: any) {
    error.value = err.error || '登录失败，请检查邮箱和密码'
  } finally {
    loading.value = false
  }
}
</script>
