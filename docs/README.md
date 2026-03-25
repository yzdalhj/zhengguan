# Reframe - 后端项目文档

## 1. 项目概述

### 1.1 项目背景
随着短视频、AI视频生成工具的爆发式增长，视频创作者对高质量分镜、动作、打斗画面的参考需求日益迫切。当前市场上缺少一个专门针对影视分镜与动作场面的快速检索工具。本项目旨在构建一个轻量级、可扩展的影视分镜参考库，通过索引公开视频外链，帮助用户快速找到创作灵感。

### 1.2 核心目标
- 提供覆盖主流影视作品的分镜、动作、打斗画面检索服务
- 支持多维度筛选（标签、影片、镜头类型等）
- 确保版权合规，所有内容均通过第三方平台外链引用
- 为AI视频创作者提供提示词辅助生成功能
- 实现可持续的运营与盈利模式

### 1.3 项目范围
- **一期（MVP）**：搭建基础检索平台，内置100-200条精选素材，支持搜索、标签筛选、视频嵌入
- **二期**：增加用户系统、收藏、举报、数据采集自动化
- **三期**：AI提示词生成、高级筛选、会员订阅

---

## 2. 系统架构

### 2.1 架构图
```
┌─────────────────────────────────────────────────────────────┐
│                     用户端（Web）                               │
│  - 响应式界面（PC/移动）                                       │
│  - 搜索/筛选组件                                               │
│  - 视频嵌入播放器                                              │
│  - 用户收藏/举报                                               │
└───────────────────────────────┬─────────────────────────────┘
                                │ HTTPS
┌───────────────────────────────▼─────────────────────────────┐
│                       API网关（Nginx）                        │
│  - 负载均衡、限流、SSL终止                                   │
└───────────────────────────────┬─────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────┐
│                    后端应用（Node.js + Express）              │
│  - 用户管理模块                                               │
│  - 视频管理模块                                               │
│  - 标签管理模块                                               │
│  - 收藏/举报模块                                              │
│  - 搜索/筛选模块                                              │
└───────────────────────────────┬─────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────┐
│                     数据层与缓存                              │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐      │
│  │ PostgreSQL  │    │ 全文检索    │    │   Redis     │      │
│  │ 结构化数据  │    │ Gin索引     │    │   缓存      │      │
│  └─────────────┘    └─────────────┘    └─────────────┘      │
└───────────────────────────────┬─────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────┐
│                      数据采集模块（独立服务）                 │
│  - Node.js 定时任务                                           │
│  - YouTube/Bilibili API 定时抓取                            │
│  - 关键词库管理                                               │
│  - 视频元数据清洗                                            │
│  - 审核流程                                                  │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 技术选型

| 层级 | 技术 | 理由 |
|------|------|------|
| 后端框架 | Node.js + Express | 高性能、异步I/O、生态丰富 |
| 语言 | TypeScript | 类型安全，减少运行时错误 |
| 主数据库 | PostgreSQL | 支持复杂查询、事务、全文检索 |
| 缓存 | Redis | 加速热门查询、搜索建议 |
| 定时任务 | node-cron | 简单可靠的定时采集 |
| 认证 | JWT | 无状态、易于扩展 |
| 密码加密 | bcryptjs | 安全可靠 |
| 限流 | express-rate-limit | 防止滥用 |
| 部署 | Docker + Docker Compose | 标准化部署，环境一致 |

---

## 3. 数据模型设计

### 3.1 PostgreSQL核心表结构

**users** - 用户表
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user', -- user/admin
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

**videos** - 视频表
```sql
CREATE TABLE videos (
    id SERIAL PRIMARY KEY,
    external_id VARCHAR(100) UNIQUE NOT NULL, -- 平台视频ID
    platform VARCHAR(20) NOT NULL, -- youtube, bilibili, vimeo
    title VARCHAR(255) NOT NULL,
    description TEXT,
    embed_url TEXT NOT NULL, -- 嵌入地址
    thumbnail_url TEXT, -- 缩略图地址
    duration INT, -- 秒
    quality VARCHAR(10), -- 720p, 1080p
    views INT DEFAULT 0,
    likes INT DEFAULT 0,
    upload_date DATE,
    source_film VARCHAR(100), -- 所属影片
    status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

**tags** - 标签表
```sql
CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    category VARCHAR(50), -- 动作类型、镜头类型、场景等
    created_at TIMESTAMP DEFAULT NOW()
);
```

**video_tags** - 视频标签关联表
```sql
CREATE TABLE video_tags (
    video_id INT REFERENCES videos(id) ON DELETE CASCADE,
    tag_id INT REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (video_id, tag_id)
);
```

**collections** - 用户收藏表
```sql
CREATE TABLE collections (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    video_id INT REFERENCES videos(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, video_id)
);
```

**reports** - 举报表
```sql
CREATE TABLE reports (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    video_id INT REFERENCES videos(id) ON DELETE CASCADE,
    reason TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- pending, resolved
    created_at TIMESTAMP DEFAULT NOW()
);
```

**keywords** - 采集关键词表（爬虫使用）
```sql
CREATE TABLE keywords (
    id SERIAL PRIMARY KEY,
    keyword VARCHAR(100) NOT NULL,
    platform VARCHAR(20) NOT NULL,
    enabled BOOLEAN DEFAULT true,
    crawl_count INT DEFAULT 0,
    last_crawled_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 3.2 索引策略

| 索引 | 类型 | 说明 |
|------|------|------|
| `videos(status)` | 普通索引 | 加速只显示已审核视频 |
| `videos(platform)` | 普通索引 | 平台筛选 |
| `videos(upload_date)` | 普通索引 | 时间排序 |
| `videos(source_film)` | 普通索引 | 影片筛选 |
| `videos(search_vector)` | GIN索引 | 全文检索 |

### 3.3 全文检索

使用PostgreSQL内置全文检索：
```sql
ALTER TABLE videos ADD COLUMN search_vector tsvector;
CREATE INDEX idx_videos_search ON videos USING GIN(search_vector);
```

触发器自动更新：
```sql
CREATE TRIGGER tsvectorupdate BEFORE INSERT OR UPDATE
    ON videos FOR EACH ROW EXECUTE FUNCTION videos_search_vector_update();
```

---

## 4. API接口设计

### 4.1 公共接口

| 方法 | 端点 | 描述 | 参数 |
|------|------|------|------|
| GET | `/api/videos` | 获取视频列表 | `page, limit, keyword, tags[], min_duration, max_duration, platform, sort` |
| GET | `/api/videos/:id` | 获取单个视频详情 | - |
| GET | `/api/tags` | 获取所有标签 | `category` (可选) |
| GET | `/api/tags/categories` | 获取所有分类 | - |
| GET | `/api/search/suggest` | 搜索建议 | `q` |
| GET | `/api/sitemap` | XML网站地图（SEO） | - |
| GET | `/api/health` | 健康检查 | - |

### 4.2 用户接口（需JWT认证）

| 方法 | 端点 | 描述 |
|------|------|------|
| POST | `/api/auth/register` | 用户注册 |
| POST | `/api/auth/login` | 用户登录 |
| GET | `/api/auth/me` | 获取当前用户信息 |
| PUT | `/api/auth/password` | 修改密码 |
| GET | `/api/user/collections` | 获取用户收藏列表 |
| POST | `/api/user/collections/:videoId` | 添加收藏 |
| DELETE | `/api/user/collections/:videoId` | 取消收藏 |
| GET | `/api/user/collections/export` | 导出收藏为JSON |
| POST | `/api/user/reports` | 举报视频 |

### 4.3 管理接口（需管理员权限）

| 方法 | 端点 | 描述 |
|------|------|------|
| GET | `/api/admin/videos/pending` | 获取待审核列表 |
| PUT | `/api/admin/videos/:id/approve` | 通过审核 |
| PUT | `/api/admin/videos/:id/reject` | 拒绝审核 |
| POST | `/api/admin/videos` | 创建视频 |
| PUT | `/api/admin/videos/:id` | 更新视频 |
| DELETE | `/api/admin/videos/:id` | 删除视频 |
| POST | `/api/admin/tags` | 创建标签 |
| PUT | `/api/admin/tags/:id` | 更新标签 |
| DELETE | `/api/admin/tags/:id` | 删除标签 |
| GET | `/api/admin/reports/pending` | 获取待处理举报 |
| PUT | `/api/admin/reports/:id/resolve` | 处理举报 |
| GET | `/api/admin/users` | 获取所有用户 |
| PUT | `/api/admin/users/:id/role` | 修改用户角色 |

### 4.4 响应格式

**成功响应**
```json
{
  "success": true,
  "data": {...},
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  },
  "seo": {
    "title": "页面标题",
    "description": "页面描述",
    "keywords": "关键词1,关键词2",
    "openGraph": {...}
  }
}
```

**错误响应**
```json
{
  "success": false,
  "error": "错误信息"
}
```

### 4.5 安全设计

- **认证**：JWT Token，有效期7天
- **限流**：用户端 100次/分钟，管理端 30次/分钟
- **密码**：bcrypt加盐哈希
- **安全头**：X-Content-Type-Options, X-Frame-Options, X-XSS-Protection
- **CORS**：可配置允许的源

---

## 5. SEO优化实现

### 5.1 已实现功能

| 优化项 | 实现方式 |
|--------|----------|
| XML Sitemap | `/api/sitemap` 自动生成，包含所有已审核视频 |
| 页面元数据 | 每个API响应包含 `seo.title`, `seo.description`, `seo.keywords` |
| Open Graph | 视频详情页提供OG标签，支持社交媒体分享预览 |
| 语义化URL | 推荐前端使用 `/video/{id}` 格式 |
| 全文检索 | PostgreSQL全文检索支持自然语言索引 |
| 标签分类 | 分类页面提供主题关键词聚合 |

### 5.2 Sitemap示例
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://yourdomain.com</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://yourdomain.com/search</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://yourdomain.com/video/123</loc>
    <lastmod>2025-03-25</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>
```

### 5.3 前端建议

- 服务端渲染（SSR）或静态生成（SSG）以利于搜索引擎抓取
- 将API返回的SEO元数据填入对应HTML meta标签
- 使用预渲染生成静态页面

---

## 6. 数据采集流程

### 6.1 采集来源
- **YouTube Data API v3** - 搜索关键词，获取视频元数据
- **Bilibili 开放平台** - 类似，支持国内视频
- **手动录入** - 初期运营人员种子数据

### 6.2 自动采集流程

1. **定时触发**：node-cron每小时执行一次
2. **读取关键词**：从keywords表获取待采集关键词，按上次采集时间排序
3. **调用API**：调用对应平台搜索API
4. **去重检查**：检查external_id是否已存在
5. **质量过滤**：
   - 时长：15秒 ≤ 时长 ≤ 10分钟
   - 播放量：≥ 1000
   - 清晰度：≥ 480p
6. **自动标签**：基于标题/描述关键词匹配现有标签
7. **入库**：status = pending，等待人工审核
8. **更新状态**：更新关键词最后采集时间

### 6.3 人工审核流程
- 审核人员在后台查看视频预览（嵌入播放）
- 修改自动标签，补充source_film
- 通过后status改为approved，前端可见

### 6.4 合集视频处理
- 对于"十大动作场面"类视频，运营手动标注多个片段
- 每个片段生成独立记录，embed_url增加t参数定位开始时间

---

## 7. 初始标签体系

### 7.1 标签分类

| 一级分类 | 示例标签 |
|----------|----------|
| **动作风格** | 徒手搏击、兵器格斗、枪战、跑酷、追逐、车战、咏春、泰拳、拳击、柔术、刀剑、长枪、双节棍、冷兵器、战术射击、子弹时间、手枪对决 |
| **镜头语言** | 长镜头、快速剪辑、慢动作、特写、过肩镜头、航拍、手持跟拍、斯坦尼康、无人机、交叉剪辑、一镜到底、运动镜头、中景、远景、大远景 |
| **场景** | 巷战、室内、古装、科幻、废土 |
| **情绪** | 紧张、悲壮、燃、唯美 |
| **影片类型** | 古装、现代、未来 |
| **国别** | 华语、好莱坞、日本、韩国 |
| **参考用途** | 适合Sora、适合Runway |

---

## 8. 版权与合规策略

### 8.1 内容合规
- 仅嵌入官方播放器，不存储视频文件
- 缩略图使用平台官方URL
- 页面显著位置添加版权声明
- 设立投诉邮箱，24小时内响应处理

### 8.2 用户协议
- 用户注册需同意不得上传侵权内容
- 若用户提交的链接侵权，由用户自行承担责任

### 8.3 商业分离
- 基础检索功能免费
- 盈利功能（AI提示词、分镜板导出）与视频内容索引解耦

---

## 9. 项目启动

### 9.1 环境要求
- Node.js 18+
- Docker & Docker Compose（推荐）

### 9.2 本地开发启动

```bash
# 克隆项目
cd /path/to/reframe

# 安装依赖
npm install

# 复制环境变量
cp .env.example .env
# 编辑 .env 修改配置

# 启动PostgreSQL和Redis
docker-compose up -d

# 开发运行
npm run dev

# 查看地址
# Server running on http://localhost:3000
```

### 9.3 生产部署

```bash
# 构建
npm run build

# 启动
npm start

# 或使用Docker
docker build -t reframe-backend .
docker run -p 3000:3000 --env-file .env reframe-backend
```

### 9.4 环境变量说明

| 变量 | 说明 | 示例 |
|------|------|------|
| PORT | 服务端口 | 3000 |
| NODE_ENV | 环境 | development/production |
| DB_HOST | PostgreSQL地址 | localhost |
| DB_PORT | PostgreSQL端口 | 5432 |
| DB_USER | PostgreSQL用户名 | postgres |
| DB_PASSWORD | PostgreSQL密码 | postgres |
| DB_NAME | 数据库名 | video_reference |
| REDIS_URL | Redis地址 | redis://localhost:6379 |
| JWT_SECRET | JWT密钥 | your_secret_key |
| JWT_EXPIRE_IN | JWT有效期 | 7d |
| CORS_ORIGIN | 允许的前端地址 | http://localhost:5173 |
| BASE_URL | 网站基础URL（sitemap） | https://reframe.example.com |
| RATE_LIMIT_WINDOW_MS | 限流窗口毫秒 | 60000 |
| RATE_LIMIT_MAX_USER | 用户每分钟最大请求 | 100 |
| RATE_LIMIT_MAX_ADMIN | 管理员每分钟最大请求 | 30 |
| YOUTUBE_API_KEY | YouTube API密钥 | - |
| BILIBILI_APP_KEY | Bilibili App Key | - |
| CRAWLER_SCHEDULE | 采集定时表达式 | 0 * * * * |

---

## 10. 非功能性需求

### 10.1 性能
- 页面首屏加载时间 < 2秒
- API响应时间 < 200ms（95%请求）
- 支持并发用户数 > 1000（初期）

### 10.2 安全性
- 所有传输使用HTTPS
- 用户密码bcrypt加密
- 防SQL注入（使用参数化查询）
- 防XSS（前端转义输出）
- 管理员后台支持IP限制（可配置）

### 10.3 可扩展性
- 后端无状态设计，可水平扩展
- 支持后期数据库读写分离
- 可迁移到Elasticsearch支持海量检索

### 10.4 可用性
- 目标99.5%可用性（SLA）
- 每日备份数据库，保留30天

---

## 11. 项目文件结构

```
reframe/
├── src/
│   ├── config/
│   │   ├── database.ts         # PostgreSQL连接配置
│   │   └── redis.ts            # Redis连接配置
│   ├── controllers/
│   │   ├── auth.ts             # 认证控制器
│   │   ├── videos.ts           # 视频控制器（含SEO）
│   │   ├── tags.ts             # 标签控制器
│   │   ├── user.ts             # 用户控制器
│   │   └── admin.ts            # 管理控制器
│   ├── middleware/
│   │   ├── errorHandler.ts     # 统一错误处理
│   │   ├── auth.ts             # JWT认证中间件
│   │   └── rateLimit.ts        # 限流配置
│   ├── models/
│   │   ├── user.ts             # 用户数据操作
│   │   ├── video.ts            # 视频数据操作
│   │   ├── tag.ts              # 标签数据操作
│   │   ├── collection.ts       # 收藏数据操作
│   │   └── report.ts           # 举报数据操作
│   ├── routes/
│   │   ├── auth.ts             # 认证路由
│   │   ├── videos.ts           # 视频路由
│   │   ├── tags.ts             # 标签路由
│   │   ├── user.ts             # 用户路由
│   │   └── admin.ts            # 管理路由
│   ├── types/
│   │   └── index.ts            # TypeScript类型定义
│   ├── crawler/
│   │   ├── youtube.ts          # YouTube采集
│   │   ├── bilibili.ts         # Bilibili采集
│   │   └── scheduler.ts         # 定时调度
│   └── app.ts                  # 入口文件
├── docs/
│   └── README.md               # 本文档
├── init.sql                    # 数据库初始化脚本
├── docker-compose.yml          # Docker Compose配置
├── Dockerfile                  # Docker镜像构建
├── tsconfig.json               # TypeScript配置
├── package.json                # 依赖配置
├── nodemon.json                # nodemon开发配置
├── .env.example                # 环境变量示例
├── .gitignore                  # Git忽略
└── README.md                  # 项目说明
```

---

## 12. 开发路线图

| 阶段 | 周期 | 主要任务 |
|------|------|----------|
| 需求设计 | 1周 | 原型、数据库设计、接口定义 |
| MVP开发 | 3周 | 前端静态页面、后端API、手动数据录入 |
| 测试上线 | 1周 | 功能测试、安全测试、部署上线 |
| 采集自动化 | 2周 | 爬虫模块开发、审核后台 |
| 用户系统 | 2周 | 登录注册、收藏、举报 |
| AI高级功能 | 3周 | AI提示词生成、会员系统 |
| 持续迭代 | 持续 | 根据反馈优化，增加新功能 |

---

## 13. 风险评估与对策

| 风险 | 概率 | 影响 | 对策 |
|------|------|------|------|
| 版权投诉 | 中高 | 高 | 快速响应下架机制，严格审核 |
| 平台API变动 | 中 | 中 | 监控官方公告，适配器模式 |
| 采集被限制 | 低 | 中 | 使用官方API，控制频率 |
| 用户增长性能瓶颈 | 中 | 中 | 提前缓存设计，按需扩容 |
| 盈利困难 | 中 | 中 | 初期不依赖盈利，增值服务变现 |

---

## 14. 视频嵌入示例

**YouTube**
```html
<iframe src="https://www.youtube.com/embed/VIDEO_ID?autoplay=1&rel=0" 
        frameborder="0" allowfullscreen>
</iframe>
```

**带时间戳**
```
https://www.youtube.com/embed/VIDEO_ID?start=90
```

**Bilibili**
```html
<iframe src="//player.bilibili.com/player.html?bvid=BV1xx411x7xx&page=1" 
        scrolling="no" frameborder="no">
</iframe>
```

---

## 15. 总结

本项目按照设计文档完整实现了后端API，包含：

✅ 完整的RESTful API  
✅ 用户认证与权限管理  
✅ 多条件视频搜索筛选  
✅ SEO优化支持（Sitemap、元数据）  
✅ 定时自动数据采集（YouTube/Bilibili）  
✅ 自动标签匹配  
✅ 人工审核流程  
✅ 用户收藏与举报  
✅ 管理后台功能  
✅ Docker开发环境配置  

项目符合**版权合规**要求，所有视频仅通过第三方平台外链展示，不存储视频内容。

---

**文档版本**：1.0  
**最后更新**：2025年3月25日  
