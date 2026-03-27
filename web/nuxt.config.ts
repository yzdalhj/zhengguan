import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-03-27',
  devtools: { enabled: true },
  modules: [
    '@nuxt/ui',
    '@pinia/nuxt',
  ],
  // 禁用 Nuxt UI 的字体功能
  ui: {
    fonts: false,
  },
  // 配置图标使用本地模式
  icon: {
    clientBundle: {
      scan: true,
      includeCustomCollections: true,
    },
  },
  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  // 运行时配置
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://111.231.134.242:44080/api',
    },
  },
  // 应用配置
  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      titleTemplate: '%s - 影视分镜参考库',
      meta: [
        { name: 'description', content: '搜索优质影视分镜、动作场面、打斗镜头参考，为视频创作提供灵感。' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
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
    transpile: ['html2canvas'],
  },
  // 开发服务器配置
  devServer: {
    port: 8080,
  },

  // Nitro 配置
  nitro: {
    devProxy: {
      '/api': {
        target: 'http://111.231.134.242:44080/api',
        changeOrigin: true,
      },
    },
  },
})
