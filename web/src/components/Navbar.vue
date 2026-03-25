<template>
  <nav class="bg-white shadow-sm">
    <div class="container mx-auto px-4">
      <div class="flex justify-between items-center h-16">
        <router-link to="/" class="flex items-center space-x-2">
          <span class="text-2xl font-bold text-primary">帧观</span>
          <span class="text-sm text-gray-500 hidden sm:inline">每一帧，都是灵感</span>
        </router-link>

        <div class="hidden md:flex items-center space-x-4">
          <router-link to="/search" class="text-gray-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">
            搜索
          </router-link>
          <router-link to="/tags" class="text-gray-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">
            标签
          </router-link>
        </div>

        <div class="flex items-center space-x-4">
          <template v-if="userStore.isAuthenticated">
            <router-link to="/collections" class="text-gray-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">
              我的收藏
            </router-link>
            <button @click="logout" class="text-gray-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">
              退出
            </button>
          </template>
          <template v-else>
            <router-link to="/login" class="text-gray-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">
              登录
            </router-link>
            <router-link to="/register" class="bg-primary text-white hover:bg-primary/90 px-3 py-2 rounded-md text-sm font-medium">
              注册
            </router-link>
          </template>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/user';
import { useRouter } from 'vue-router';

const userStore = useUserStore();
const router = useRouter();

const logout = () => {
  userStore.logout();
  router.push('/');
};
</script>
