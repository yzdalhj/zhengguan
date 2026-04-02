-- 数据库初始化脚本

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 创建用户表
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone_verified BOOLEAN DEFAULT FALSE,
    role VARCHAR(20) DEFAULT 'user', -- user/admin
    -- 会员积分相关字段
    points INTEGER DEFAULT 0, -- 用户积分
    level VARCHAR(20) DEFAULT 'normal', -- 会员等级: normal/vip/svip
    level_expires_at TIMESTAMP, -- 会员等级过期时间
    total_points_earned INTEGER DEFAULT 0, -- 累计获得积分
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 创建短信验证码表
CREATE TABLE sms_codes (
    id SERIAL PRIMARY KEY,
    phone VARCHAR(20) NOT NULL,
    code VARCHAR(6) NOT NULL,
    purpose VARCHAR(20) NOT NULL, -- login, register, reset_password
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE
);

-- 索引：按手机号查询，按过期时间清理
CREATE INDEX idx_sms_codes_phone ON sms_codes(phone);
CREATE INDEX idx_sms_codes_expires ON sms_codes(expires_at);

-- 创建刷新令牌表
CREATE TABLE refresh_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    user_agent TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL,
    revoked BOOLEAN DEFAULT FALSE
);

-- 索引：按用户查询，按过期时间清理
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_expires ON refresh_tokens(expires_at);

-- 创建扫码登录状态表
CREATE TABLE qrcode_login (
    id SERIAL PRIMARY KEY,
    code VARCHAR(64) NOT NULL UNIQUE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, scanned, expired, cancelled
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL,
    scanned_at TIMESTAMP,
    confirmed_at TIMESTAMP
);

-- 索引：按码查询，按过期时间清理
CREATE INDEX idx_qrcode_login_code ON qrcode_login(code);
CREATE INDEX idx_qrcode_login_expires ON qrcode_login(expires_at);

-- 创建用户积分变动记录表
CREATE TABLE user_points_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    points_change INTEGER NOT NULL, -- 积分变化（正数增加，负数减少）
    points_balance INTEGER NOT NULL, -- 变动后积分余额
    reason VARCHAR(50) NOT NULL, -- 变动原因: collect_video, watch_video, redeem, admin_adjust
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 索引：按用户查询
CREATE INDEX idx_user_points_history_user_id ON user_points_history(user_id);
CREATE INDEX idx_user_points_history_created ON user_points_history(created_at);

-- 创建视频表
CREATE TABLE videos (
    id SERIAL PRIMARY KEY,
    external_id VARCHAR(100) UNIQUE NOT NULL, -- 平台视频ID
    platform VARCHAR(20) NOT NULL, -- youtube, bilibili, vimeo
    title VARCHAR(255) NOT NULL,
    description TEXT,
    embed_url TEXT NOT NULL, -- 嵌入地址
    thumbnail_url TEXT, -- 缩略图地址（平台提供）
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

-- 创建标签表
CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    category VARCHAR(50), -- 动作类型、镜头类型、场景等
    created_at TIMESTAMP DEFAULT NOW()
);

-- 视频标签关联表
CREATE TABLE video_tags (
    video_id INT REFERENCES videos(id) ON DELETE CASCADE,
    tag_id INT REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (video_id, tag_id)
);

-- 用户收藏表
CREATE TABLE collections (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    video_id INT REFERENCES videos(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, video_id)
);

-- 举报表
CREATE TABLE reports (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    video_id INT REFERENCES videos(id) ON DELETE CASCADE,
    reason TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- pending, resolved
    created_at TIMESTAMP DEFAULT NOW()
);

-- 用户观看历史表
CREATE TABLE watch_history (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    video_id INT REFERENCES videos(id) ON DELETE CASCADE,
    progress INT DEFAULT 0, -- 观看进度百分比 0-100
    watched_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, video_id)
);

-- 索引：按用户查询，按时间排序
CREATE INDEX idx_watch_history_user_id ON watch_history(user_id);
CREATE INDEX idx_watch_history_watched_at ON watch_history(watched_at DESC);

-- 创建索引
CREATE INDEX idx_videos_status ON videos(status);
CREATE INDEX idx_videos_platform ON videos(platform);
CREATE INDEX idx_videos_upload_date ON videos(upload_date);
CREATE INDEX idx_videos_source_film ON videos(source_film);

-- 全文检索GIN索引
ALTER TABLE videos ADD COLUMN search_vector tsvector;
UPDATE videos SET search_vector = 
    setweight(to_tsvector('english', coalesce(title, '')), 'A') || 
    setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(source_film, '')), 'C');
CREATE INDEX idx_videos_search ON videos USING GIN(search_vector);

-- 创建触发器自动更新全文检索向量
CREATE FUNCTION videos_search_vector_update() RETURNS trigger AS $$
BEGIN
    NEW.search_vector := 
        setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') || 
        setweight(to_tsvector('english', coalesce(NEW.description, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(NEW.source_film, '')), 'C');
    RETURN NEW;
END
$$ LANGUAGE plpgsql;

CREATE TRIGGER tsvectorupdate BEFORE INSERT OR UPDATE
    ON videos FOR EACH ROW EXECUTE FUNCTION videos_search_vector_update();

-- 初始化基础标签数据
INSERT INTO tags (name, category) VALUES
-- 动作类型
('徒手搏击', '动作风格'),
('兵器格斗', '动作风格'),
('枪战', '动作风格'),
('跑酷', '动作风格'),
('追逐', '动作风格'),
('车战', '动作风格'),
('咏春', '动作风格'),
('泰拳', '动作风格'),
('拳击', '动作风格'),
('柔术', '动作风格'),
('刀剑', '动作风格'),
('长枪', '动作风格'),
('双节棍', '动作风格'),
('冷兵器', '动作风格'),
('战术射击', '动作风格'),
('子弹时间', '动作风格'),
('手枪对决', '动作风格'),
-- 镜头语言
('长镜头', '镜头语言'),
('快速剪辑', '镜头语言'),
('慢动作', '镜头语言'),
('特写', '镜头语言'),
('过肩镜头', '镜头语言'),
('航拍', '镜头语言'),
('手持跟拍', '镜头语言'),
('斯坦尼康', '镜头语言'),
('无人机', '镜头语言'),
('交叉剪辑', '镜头语言'),
('一镜到底', '镜头语言'),
('运动镜头', '镜头语言'),
('中景', '镜头语言'),
('远景', '镜头语言'),
('大远景', '镜头语言'),
-- 场景
('巷战', '场景'),
('室内', '场景'),
('古装', '场景'),
('科幻', '场景'),
('废土', '场景'),
-- 情绪
('紧张', '情绪'),
('悲壮', '情绪'),
('燃', '情绪'),
('唯美', '情绪'),
-- 影片类型
('古装', '影片类型'),
('现代', '影片类型'),
('未来', '影片类型'),
('华语', '国别'),
('好莱坞', '国别'),
('日本', '国别'),
('韩国', '国别'),
-- 参考用途
('适合Sora', '参考用途'),
('适合Runway', '参考用途');

-- =============================================
-- 提示词平台相关表（v2 新增）
-- =============================================

-- 提示词表
CREATE TABLE prompts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(500),
    content TEXT NOT NULL, -- 完整提示词文本
    preview_images TEXT[] DEFAULT '{}', -- 效果预览图URL数组
    difficulty VARCHAR(20) DEFAULT 'beginner', -- beginner, intermediate, expert
    applicable_tools VARCHAR(50)[] DEFAULT '{runway,pika,kling,jimeng}', -- 适用工具
    params JSONB DEFAULT '{}', -- 工具参数建议（步数、CFG等）
    required_level VARCHAR(20) DEFAULT 'free', -- free, vip, svip
    price DECIMAL(10,2) DEFAULT 0,
    copy_count INT DEFAULT 0, -- 被复制次数
    rating_avg DECIMAL(3,2) DEFAULT 0, -- 平均评分
    rating_count INT DEFAULT 0, -- 评分人数
    status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
    sort_order INT DEFAULT 0, -- 排序权重，越大越靠前
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_prompts_status ON prompts(status);
CREATE INDEX idx_prompts_difficulty ON prompts(difficulty);
CREATE INDEX idx_prompts_required_level ON prompts(required_level);
CREATE INDEX idx_prompts_sort ON prompts(sort_order DESC, created_at DESC);

-- 提示词全文检索
ALTER TABLE prompts ADD COLUMN search_vector tsvector;

CREATE FUNCTION prompts_search_vector_update() RETURNS trigger AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(NEW.subtitle, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(NEW.content, '')), 'C');
    RETURN NEW;
END
$$ LANGUAGE plpgsql;

CREATE TRIGGER prompts_tsvectorupdate BEFORE INSERT OR UPDATE
    ON prompts FOR EACH ROW EXECUTE FUNCTION prompts_search_vector_update();

CREATE INDEX idx_prompts_search ON prompts USING GIN(search_vector);

-- 提示词标签关联表
CREATE TABLE prompt_tags (
    prompt_id INT REFERENCES prompts(id) ON DELETE CASCADE,
    tag_id INT REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (prompt_id, tag_id)
);

-- 提示词评价表
CREATE TABLE prompt_ratings (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    prompt_id INT REFERENCES prompts(id) ON DELETE CASCADE,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, prompt_id)
);

CREATE INDEX idx_prompt_ratings_prompt_id ON prompt_ratings(prompt_id);

-- 提示词收藏表
CREATE TABLE prompt_favorites (
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    prompt_id INT REFERENCES prompts(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, prompt_id)
);

CREATE INDEX idx_prompt_favorites_user_id ON prompt_favorites(user_id);

-- 支付记录表
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    order_no VARCHAR(64) UNIQUE NOT NULL, -- 订单号
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL, -- prompt, membership
    target_id INT, -- prompt_id 或 membership 配置ID
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'CNY',
    payment_method VARCHAR(20), -- wechat, alipay
    status VARCHAR(20) DEFAULT 'pending', -- pending, paid, expired, refunded
    trade_no VARCHAR(128), -- 第三方交易号
    paid_at TIMESTAMP,
    expire_at TIMESTAMP, -- 订单过期时间
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_order_no ON payments(order_no);
CREATE INDEX idx_payments_status ON payments(status);

-- 会员订阅表
CREATE TABLE memberships (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    level VARCHAR(20) NOT NULL, -- vip, svip
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    auto_renew BOOLEAN DEFAULT FALSE,
    payment_id INT REFERENCES payments(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_memberships_user_id ON memberships(user_id);
CREATE INDEX idx_memberships_end_date ON memberships(end_date);

-- 初始化提示词平台标签数据
INSERT INTO tags (name, category) VALUES
-- 提示词分类
('动作类', '提示词分类'),
('场景转换', '提示词分类'),
('风格类', '提示词分类'),
('行业应用', '提示词分类'),
('首尾帧', '提示词分类'),
-- 适用工具
('Runway', '适用工具'),
('Pika', '适用工具'),
('可灵', '适用工具'),
('即梦', '适用工具'),
('Sora', '适用工具'),
-- 难度
('新手', '难度'),
('进阶', '难度'),
('专业', '难度');
