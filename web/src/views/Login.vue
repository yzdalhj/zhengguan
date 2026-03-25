<template>
  <seo-meta :seo="seo" />
  <div class="min-h-[60vh] flex items-center justify-center py-12 px-4">
    <div class="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow">
      <div>
        <h2 class="text-center text-3xl font-bold text-gray-900">登录</h2>
      </div>
      <form @submit.prevent="handleLogin" class="mt-8 space-y-6">
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
          <input
            v-model="email"
            id="email"
            type="email"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 mb-1">密码</label>
          <input
            v-model="password"
            id="password"
            type="password"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div v-if="error" class="text-red-500 text-sm">{{ error }}</div>
        <div>
          <button
            type="submit"
            :disabled="loading"
            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
          >
            {{ loading ? '登录中...' : '登录' }}
          </button>
        </div>
        <div class="text-center text-sm text-gray-500">
          还没有账号？<router-link to="/register" class="text-primary hover:underline">注册</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useSeoMeta } from '@vueuse/head';
import { useUserStore } from '@/stores/user';
import SeoMeta from '@/components/SeoMeta.vue';

const router = useRouter();
const userStore = useUserStore();

const seo = {
  title: '登录 - 帧观',
  description: '登录帧观账号，收藏喜欢的分镜素材.',
};

useSeoMeta({
  title: seo.title,
  description: seo.description,
});

const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');

const handleLogin = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    await userStore.login(email.value, password.value);
    router.push('/collections');
  } catch (err: any) {
    error.value = err.error || '登录失败，请检查邮箱和密码';
  } finally {
    loading.value = false;
  }
};
</script>
