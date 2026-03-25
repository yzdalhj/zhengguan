# 后端API

> 轻量级、可扩展的影视分镜参考库后端，帮助视频创作者快速找到高质量分镜、动作、打斗画面参考。

## 技术栈

- **Node.js + TypeScript** - 类型安全的后端开发
- **Express** - Web框架
- **PostgreSQL** - 主数据库存储结构化数据
- **Redis** - 缓存层，提升响应速度
- **Docker Compose** - 本地开发环境一键启动
- **JWT** - 用户认证
- **express-rate-limit** - API限流

## 功能特性

### API功能
- ✅ 视频搜索与多维度筛选（关键词、标签、时长、平台）
- ✅ 热门标签分组展示
- ✅ 搜索建议自动补全
- ✅ 用户注册/登录
- ✅ 收藏夹管理
- ✅ 视频举报功能
- ✅ 收藏导出为JSON
- ✅ 管理后台审核功能
- ✅ 数据定时采集（YouTube/Bilibili）
- ✅ 自动标签匹配
- ✅ SEO友好 - 提供`sitemap.xml`和元数据

### SEO优化
- 每个视频详情页包含独立标题、描述元数据
- Open Graph元数据支持社交媒体分享
- 自动生成XML Sitemap
- 全文检索优化支持搜索引擎索引
- 标签分类页面优化关键词布局

## 项目结构

```
src/
├── config/          # 配置文件（数据库、Redis）
├── controllers/     # 控制器层
├── middleware/      # 中间件（认证、限流、错误处理）
├── models/          # 数据模型（数据库操作）
├── routes/          # 路由定义
├── types/           # TypeScript类型定义
├── crawler/         # 数据采集模块（YouTube、Bilibili）
└── app.ts           # 入口文件
```

## 快速开始

### 环境要求
- Node.js 18+
- Docker & Docker Compose（可选，推荐用于本地开发）

### 本地开发

1. 克隆项目并安装依赖
```bash
npm install
```

2. 复制环境变量
```bash
cp .env.example .env
```

3. 修改`.env`配置数据库、JWT密钥等

4. 启动依赖服务（PostgreSQL、Redis）
```bash
docker-compose up -d
```

5. 运行开发服务器
```bash
npm run dev
```

### 生产部署

```bash
npm run build
npm start
```

或使用Docker:

```bash
docker build -t reframe-backend .
docker run -p 3000:3000 --env-file .env reframe-backend
```

## API端点

### 公共接口
| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/api/videos` | 获取视频列表（支持分页、筛选） |
| GET | `/api/videos/:id` | 获取单个视频详情 |
| GET | `/api/tags` | 获取所有标签 |
| GET | `/api/tags/categories` | 获取所有分类 |
| GET | `/api/search/suggest` | 搜索建议 |
| GET | `/api/health` | 健康检查 |
| GET | `/api/sitemap.xml` | XML网站地图 |

### 用户接口（需认证）
| 方法 | 端点 | 说明 |
|------|------|------|
| POST | `/api/auth/register` | 用户注册 |
| POST | `/api/auth/login` | 用户登录 |
| GET | `/api/auth/me` | 获取当前用户信息 |
| PUT | `/api/auth/password` | 修改密码 |
| GET | `/api/user/collections` | 获取用户收藏 |
| POST | `/api/user/collections/:videoId` | 添加收藏 |
| DELETE | `/api/user/collections/:videoId` | 取消收藏 |
| GET | `/api/user/collections/export` | 导出收藏 |
| POST | `/api/user/reports` | 举报视频 |

### 管理接口（需管理员权限）
| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/api/admin/videos/pending` | 获取待审核视频 |
| PUT | `/api/admin/videos/:id/approve` | 通过审核 |
| PUT | `/api/admin/videos/:id/reject` | 拒绝审核 |
| POST | `/api/admin/videos` | 创建视频 |
| PUT | `/api/admin/videos/:id` | 更新视频 |
| DELETE | `/api/admin/videos/:id` | 删除视频 |
| POST | `/api/admin/tags` | 创建标签 |
| PUT | `/api/admin/tags/:id` | 更新标签 |
| DELETE | `/api/admin/tags/:id` | 删除标签 |
| GET | `/api/admin/reports/pending` | 获取待处理举报 |
| PUT | `/api/admin/reports/:id/resolve` | 解决举报 |
| GET | `/api/admin/users` | 获取所有用户 |
| PUT | `/api/admin/users/:id/role` | 修改用户角色 |

## 数据采集

项目支持通过YouTube Data API和Bilibili开放平台自动采集视频数据：

1. 添加关键词到`keywords`表
2. 设置定时任务每小时轮询采集
3. 自动去重、质量过滤（时长、播放量检查）
4. 自动标签匹配
5. 人工审核后前端可见

配置环境变量：
```
YOUTUBE_API_KEY=your_youtube_api_key
BILIBILI_APP_KEY=your_bilibili_app_key
BILIBILI_APP_SECRET=your_bilibili_app_secret
CRAWLER_SCHEDULE=0 * * * *
```

## 数据库初始化

数据库表结构在`init.sql`中定义，Docker Compose会自动执行初始化。包含：
- 所有核心表
- 全文检索GIN索引
- 初始标签数据

## SEO优化说明

1. **Sitemap生成** - API提供`/api/sitemap`端点生成XML sitemap，可提交给搜索引擎
2. **元数据支持** - 每个API响应包含SEO标题、描述、关键词，前端可以直接填入meta标签
3. **Open Graph** - 视频详情包含OG标签支持社交媒体预览
4. **全文检索** - PostgreSQL全文检索支持自然语言搜索

## 版权说明

本项目仅索引第三方平台公开视频，不存储任何视频文件。所有内容均通过官方播放器外链展示。详见设计文档中的版权合规策略。

## 开发计划

- [ ] 支持Elasticsearch替换PostgreSQL全文检索
- [ ] AI提示词生成功能
- [ ] Redis缓存预热
- [ ] 数据库读写分离支持
- [ ] Prometheus监控指标

## 许可证

MIT

## 相关项目

- [前端Vue项目](https://github.com/yourusername/reframe-frontend) - 配套前端界面
