import tailwindcss from '@tailwindcss/vite'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import Components from 'unplugin-vue-components/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-03-27',
  devtools: { enabled: false },
  modules: [
    '@pinia/nuxt',
    '@tdesign-vue-next/nuxt',
  ],
  css: [
    '~/assets/css/main.css',
  ],
  vite: {
    plugins: [
      tailwindcss(),
      // 自动导入图标组件
      Components({
        resolvers: [
          IconsResolver({
            prefix: 'icon',
          }),
        ],
      }),
      // 图标插件
      Icons({
        autoInstall: true,
      }),
    ],
    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            'tdesign': ['tdesign-vue-next'],
            'vendor': ['vue', 'vue-router', 'pinia'],
          },
        },
      },
    },
    optimizeDeps: {
      include: ['tdesign-vue-next', 'axios'],
    },
  },
  // 运行时配置
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api',
    },
  },
  // 应用配置
  app: {
    pageTransition: {
      name: 'page',
      mode: 'out-in',
    },
    keepalive: {
      include: ['index', 'search', 'collections'],
    },
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      titleTemplate: '%s - 影视分镜参考库',
      meta: [
        { name: 'description', content: '搜索优质影视分镜、动作场面、打斗镜头参考，为视频创作提供灵感。' },
        // Bilibili 图片防盗链需要设置 Referer
        { name: 'referrer', content: 'no-referrer' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      ],
      script: [
        {
          innerHTML: `
            (function() {
              var theme = localStorage.getItem('color-theme');
              if (!theme) {
                theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
              }
              document.documentElement.classList.add(theme);
            })();
          `,
          tagPosition: 'head',
        },
      ],
    },
  },
  // 路由配置
  router: {
    options: {
      scrollBehaviorType: 'smooth',
    },
  },
  // TypeScript
  typescript: {
    typeCheck: false,
  },
  // 构建配置
  build: {
    transpile: ['html2canvas', 'tdesign-vue-next'],
  },
  // 开发服务器配置
  devServer: {
    port: 8080,
  },

  // Nitro 配置
  nitro: {
    devProxy: {
      '/api': {
        target: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api',
        secure: false,
        changeOrigin: true,
      },
    },
  },
})
