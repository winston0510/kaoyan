-- v4.8.4 增量导入支撑：给 questions 增加稳定的题目身份列。
-- 只增不改：不删除任何行、不改动作答记录/错题本/收藏的 question_id 关联。
-- 回填与碰撞改名由 supabase_import_v5.py --migrate 负责（身份规则与 Python 侧 qkey.dedup_key 同源）。

ALTER TABLE questions ADD COLUMN IF NOT EXISTS dedup_key TEXT;

COMMENT ON COLUMN questions.dedup_key IS 'sha1(subject + "|" + normalize(question))，由 qkey.dedup_key 计算，增量导入的幂等键';
