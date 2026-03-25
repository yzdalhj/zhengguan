import { createRouter, createWebHistory } from 'vue-router';
import { useSeoMeta } from '@vueuse/head';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: {
      title: '首页 - 影视分镜参考库',
      description: '搜索优质影视分镜、动作场面、打斗镜头参考，为视频创作提供灵感。',
    },
  },
  {
    path: '/search',
    name: 'Search',
    component: () => import('@/views/Search.vue'),
    meta: {
      title: '搜索 - 影视分镜参考库',
      description: '搜索您需要的影视分镜参考素材，支持标签筛选、多维度过滤。',
    },
  },
  {
    path: '/video/:id',
    name: 'VideoDetail',
    component: () => import('@/views/VideoDetail.vue'),
  },
  {
    path: '/tags',
    name: 'Tags',
    component: () => import('@/views/Tags.vue'),
    meta: {
      title: '标签分类 - 影视分镜参考库',
      description: '浏览所有标签分类，快速找到您需要的分镜参考素材。',
    },
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: {
      title: '登录 - 影视分镜参考库',
    },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue'),
    meta: {
      title: '注册 - 影视分镜参考库',
    },
  },
  {
    path: '/collections',
    name: 'Collections',
    component: () => import('@/views/Collections.vue'),
    meta: {
      title: '我的收藏 - 影视分镜参考库',
      requiresAuth: true,
    },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: {
      title: '页面不存在 - 影视分镜参考库',
    },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }
    return { top: 0 };
  },
});

export default router;
