-- 数据库初始化脚本

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 创建用户表
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user', -- user/admin
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

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
