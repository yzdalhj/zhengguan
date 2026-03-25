# 帧观 - 影视分镜参考库

> 为视频创作者打造的轻量级分镜、动作、打斗画面检索平台

## 📖 项目简介

随着短视频和AI视频生成工具的爆发式增长，视频创作者对高质量分镜、动作、打斗画面的参考需求日益迫切。**帧观**是一个轻量级、可扩展的影视分镜参考库，通过索引公开视频外链，帮助创作者快速找到创作灵感。

### 核心特点

- ✅ **版权合规** - 仅索引第三方平台公开视频，所有内容通过官方播放器外链展示
- ✅ **多维度筛选** - 支持按标签、动作类型、镜头语言、时长等多维度搜索
- ✅ **自动采集** - 支持 YouTube 和 Bilibili 平台定时自动采集数据
- ✅ **SEO友好** - 内置 sitemap 生成和元数据优化，利于搜索引擎收录
- ✅ **用户系统** - 支持用户收藏、举报、收藏导出功能
- ✅ **前后端分离** - 清晰的架构分工，易于维护和扩展

## 🛠️ 技术栈

### 后端
- **Node.js + TypeScript** - 类型安全的后端开发
- **Express** - Web 框架
- **PostgreSQL** - 主数据库，支持全文检索
- **Redis** - 缓存层，提升响应速度
- **JWT** - 用户认证
- **Docker Compose** - 本地开发环境一键启动

### 前端
- **Vue 3** - 渐进式 JavaScript 框架
- **Vite** - 下一代前端构建工具
- **Tailwind CSS** - 实用优先的 CSS 框架
- **Pinia** - Vue 状态管理
- **Vue Router** - Vue 官方路由

## 📁 项目结构

```
zhengguan/
├── backend/                 # 后端 API 服务
│   ├── src/
│   │   ├── config/         # 数据库、Redis 配置
│   │   ├── controllers/    # 控制器层
│   │   ├── middleware/     # 认证、限流、错误处理中间件
│   │   ├── models/         # 数据模型
│   │   ├── routes/         # 路由定义
│   │   ├── crawler/        # 数据采集（YouTube、Bilibili）
│   │   └── app.ts          # 入口文件
│   └── Dockerfile
│
├── web/                    # 前端 Web 界面
│   ├── src/
│   │   ├── components/     # 可复用组件
│   │   ├── composables/    # 组合式函数
│   │   ├── router/         # 路由配置
│   │   ├── stores/         # Pinia 状态管理
│   │   ├── views/          # 页面组件
│   │   └── main.ts         # 入口文件
│   └── index.html
│
└── docs/                   # 项目文档
```

## 🚀 快速开始

### 环境要求
- Node.js 18+
- Docker & Docker Compose（推荐用于本地开发）

### 后端启动

```bash
cd backend

# 安装依赖
npm install

# 复制环境变量
cp .env.example .env
# 编辑 .env 修改配置

# 启动 PostgreSQL 和 Redis
docker-compose up -d

# 开发模式运行
npm run dev

# 服务运行在 http://localhost:3000
```

### 前端启动

```bash
cd web

# 安装依赖
npm install

# 开发模式运行
npm run dev

# 访问 http://localhost:5173
```

### 生产构建

```bash
# 后端构建
cd backend
npm run build
npm start

# 前端构建
cd ../web
npm run build
```

更多详细文档请查看：
- [后端API文档](backend/README.md)
- [架构设计文档](docs/README.md)

## ✨ 功能特性

### 已实现功能
- [x] 视频搜索与多维度筛选（关键词、标签、时长、平台）
- [x] 热门标签分组展示
- [x] 搜索建议自动补全
- [x] 用户注册/登录
- [x] 收藏夹管理
- [x] 视频举报功能
- [x] 收藏导出为 JSON
- [x] 管理后台审核功能
- [x] 数据定时采集（YouTube/Bilibili）
- [x] 自动标签匹配
- [x] SEO 优化 - sitemap.xml 和元数据支持

### 开发计划
- [ ] AI 提示词生成功能
- [ ] Elasticsearch 全文检索支持
- [ ] 会员订阅系统
- [ ] 分镜板导出功能
- [ ] Prometheus 监控指标

## 🏷️ 标签体系

项目内置多维度标签分类：

| 分类 | 示例标签 |
|------|----------|
| **动作风格** | 徒手搏击、兵器格斗、枪战、跑酷、追逐、车战、咏春、泰拳... |
| **镜头语言** | 长镜头、快速剪辑、慢动作、特写、过肩镜头、航拍、手持跟拍... |
| **场景** | 巷战、室内、古装、科幻、废土 |
| **情绪** | 紧张、悲壮、燃、唯美 |
| **参考用途** | 适合 Sora、适合 Runway |

## 📊 数据采集

项目支持通过 YouTube Data API 和 Bilibili 开放平台自动采集视频数据：

1. 添加关键词到数据库
2. 设置定时任务每小时轮询采集
3. 自动去重、质量过滤（时长、播放量检查）
4. 自动标签匹配
5. 人工审核后前端可见

## 📄 版权说明

本项目仅索引第三方平台公开视频，**不存储任何视频文件**。所有内容均通过官方播放器外链展示。如果您认为内容侵权，请通过项目 Issue 联系我们，我们会在 24 小时内移除。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📝 许可证

MIT License

## 🙏 致谢

感谢所有开源项目作者，本项目使用了众多优秀开源工具。

---

**为什么叫"帧观"？** 观千帧而后识镜，阅百剑而后闻器 —— 多看优秀分镜，才能创作出好作品。
