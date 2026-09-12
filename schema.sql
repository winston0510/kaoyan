-- ============================================
-- 考研刷题工具 - 数据库表结构
-- 部署到 Supabase (免费 PostgreSQL)
-- ============================================

-- 题库表
CREATE TABLE questions (
  id          BIGSERIAL PRIMARY KEY,
  subject     TEXT NOT NULL,        -- politics | english2 | math2 | circuit
  chapter     TEXT NOT NULL,        -- 章节名称
  type        TEXT NOT NULL DEFAULT 'single',  -- single | multiple | judge
  question    TEXT NOT NULL,        -- 题目标题
  options     JSONB DEFAULT '[]',   -- 选项数组 ["A. xxx", "B. xxx", ...]
  answer      TEXT NOT NULL,        -- 正确答案 "A" 或 "AB"
  explanation TEXT DEFAULT '',      -- 解析
  difficulty  SMALLINT DEFAULT 1,   -- 1简单 2中等 3困难
  source      TEXT DEFAULT '',      -- 题目来源标签
  dedup_key   TEXT,                 -- sha1(subject|normalize(question))，增量导入幂等键
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 刷题记录表
CREATE TABLE quiz_records (
  id          BIGSERIAL PRIMARY KEY,
  question_id BIGINT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  subject     TEXT NOT NULL,
  is_correct  BOOLEAN NOT NULL,
  user_answer TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 错题本表
CREATE TABLE wrong_book (
  id          BIGSERIAL PRIMARY KEY,
  question_id BIGINT NOT NULL REFERENCES questions(id) ON DELETE CASCADE UNIQUE,
  subject     TEXT NOT NULL,
  user_answer TEXT NOT NULL,
  mastered    BOOLEAN DEFAULT FALSE,
  review_count SMALLINT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 每日统计表（v2.0.0 新增，每日一行）
CREATE TABLE daily_stats (
  stat_date   DATE PRIMARY KEY,
  total       INT NOT NULL DEFAULT 0,
  correct     INT NOT NULL DEFAULT 0,
  wrong       INT NOT NULL DEFAULT 0,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 收藏表（v3.2.0 新增，每题一行）
CREATE TABLE favorites (
  id          BIGSERIAL PRIMARY KEY,
  question_id BIGINT NOT NULL REFERENCES questions(id) ON DELETE CASCADE UNIQUE,
  subject     TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_questions_subject ON questions(subject);
CREATE UNIQUE INDEX idx_questions_dedup_key ON questions(dedup_key);
CREATE INDEX idx_questions_chapter ON questions(subject, chapter);
CREATE INDEX idx_quiz_records_created ON quiz_records(created_at);
CREATE INDEX idx_quiz_records_subject ON quiz_records(subject);
CREATE INDEX idx_wrong_book_subject ON wrong_book(subject);
CREATE INDEX idx_wrong_book_mastered ON wrong_book(mastered);
CREATE INDEX idx_favorites_subject ON favorites(subject);

-- 启用 Row Level Security (Supabase 推荐)
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE wrong_book ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- 允许所有操作（个人使用，无需登录认证）
CREATE POLICY "Allow all on questions"   ON questions   FOR ALL USING (true);
CREATE POLICY "Allow all on quiz_records" ON quiz_records FOR ALL USING (true);
CREATE POLICY "Allow all on wrong_book"   ON wrong_book   FOR ALL USING (true);
CREATE POLICY "Allow all on daily_stats"  ON daily_stats  FOR ALL USING (true);
CREATE POLICY "Allow all on favorites"    ON favorites    FOR ALL USING (true);
