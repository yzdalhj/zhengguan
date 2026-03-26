# 帧观 - Nuxt.js 重构版

影视分镜参考库前端项目，使用 Nuxt.js 3 构建。

## 项目结构

```
web-nuxt/
├── assets/           # 静态资源
│   ├── css/         # 全局样式
│   └── fonts/       # 字体文件
├── components/       # Vue 组件
│   ├── navbar.vue   # 导航栏
│   ├── main-footer.vue  # 页脚
│   └── video-card.vue   # 视频卡片
├── layouts/          # 布局文件
│   ├── default.vue  # 默认布局（带侧边栏）
│   └── blank.vue    # 空白布局（登录/注册）
├── pages/            # 页面路由
│   ├── index.vue    # 首页
│   ├── search.vue   # 搜索页
│   ├── video/
│   │   └── [id].vue # 视频详情页
│   ├── tags.vue     # 标签分类
│   ├── collections.vue  # 我的收藏
│   ├── login.vue    # 登录
│   ├── register.vue # 注册
│   └── [...slug].vue # 404
├── plugins/          # Nuxt 插件
│   ├── api.ts       # API 客户端
│   └── auth.client.ts   # 认证初始化
├── stores/           # Pinia 状态管理
│   ├── video.ts     # 视频状态
│   └── user.ts      # 用户状态
├── types/            # TypeScript 类型
│   └── index.ts     # 全局类型定义
├── nuxt.config.ts    # Nuxt 配置
├── tailwind.config.ts # Tailwind 配置
└── package.json      # 依赖配置
```

## 与原 Vue 项目的差异

### 路由系统
- **原项目**: 使用 `vue-router` + 手动配置路由表
- **Nuxt**: 基于文件系统的自动路由，`pages/` 目录下的文件自动生成路由

### 布局系统
- **原项目**: 使用 `router-view` + 动态组件切换布局
- **Nuxt**: 使用 `layouts/` 目录，`definePageMeta({ layout: 'blank' })` 切换布局

### SEO/Head 管理
- **原项目**: 使用 `@vueuse/head` + `useSeoMeta`
- **Nuxt**: 内置 `useHead()` 和 `useSeoMeta()`，支持 SSR

### 状态管理
- **原项目**: 使用 `pinia` 独立配置
- **Nuxt**: 使用 `@pinia/nuxt` 模块，自动集成

### API 请求
- **原项目**: 使用 composables/api.ts
- **Nuxt**: 使用 plugins/api.ts 作为 Nuxt 插件，通过 `$api` 访问

## 开发命令

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建生产版本
npm run build

# 生成静态站点
npm run generate

# 预览生产构建
npm run preview
```

## 环境变量

创建 `.env` 文件：

```env
NUXT_PUBLIC_API_BASE=http://localhost:3001/api
```

## 主要特性

- ✅ 基于文件系统的自动路由
- ✅ 内置 SEO 和 Head 管理
- ✅ 自动导入组件和 composables
- ✅ SSR/SSG 支持
- ✅ Pinia 状态管理集成
- ✅ Tailwind CSS 集成
- ✅ 页面过渡动画
