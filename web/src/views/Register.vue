<template>
  <seo-meta :seo="seo" />
  <div class="min-h-[60vh] flex items-center justify-center py-12 px-4">
    <div class="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow">
      <div>
        <h2 class="text-center text-3xl font-bold text-gray-900">注册账号</h2>
      </div>
      <form @submit.prevent="handleRegister" class="mt-8 space-y-6">
        <div>
          <label for="username" class="block text-sm font-medium text-gray-700 mb-1">用户名</label>
          <input
            v-model="username"
            id="username"
            type="text"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
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
            minlength="6"
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
            {{ loading ? '注册中...' : '注册' }}
          </button>
        </div>
        <div class="text-center text-sm text-gray-500">
          已有账号？<router-link to="/login" class="text-primary hover:underline">登录</router-link>
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
  title: '注册 - 帧观',
  description: '注册帧观账号，收藏喜欢的分镜素材.',
};

useSeoMeta({
  title: seo.title,
  description: seo.description,
});

const username = ref('');
const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');

const handleRegister = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    await userStore.register(username.value, email.value, password.value);
    router.push('/login');
  } catch (err: any) {
    error.value = err.error || '注册失败，请重试';
  } finally {
    loading.value = false;
  }
};
</script>
