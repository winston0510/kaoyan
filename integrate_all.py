import re
import json
import os
from collections import defaultdict, Counter
from chapter_classifier import fix_chapter

BASE = os.path.dirname(os.path.abspath(__file__))
PARENT = os.path.dirname(BASE)

def esc(s):
    if s is None:
        return ''
    return str(s).replace("'", "''")

def normalize_question(q):
    q = re.sub(r'<[^>]+>', '', q)
    q = re.sub(r'\s+', '', q)
    q = re.sub(r'[，。、？！（）；：“”‘’【】《》〈〉「」『』()（）]', '', q)
    q = q.lower()
    return q[:80]

questions = []
seen_keys = {}
stats = defaultdict(lambda: {'total': 0, 'dup': 0, 'enriched': 0})

GENERIC_SOURCES = {'', '政治题库', '政治多源题库'}

def add_question(subject, chapter, qtype, question, options, answer, explanation, difficulty, source=''):
    if not question or len(str(question)) < 5:
        return
    key = normalize_question(str(question))
    if not key:
        return
    if key in seen_keys:
        idx = seen_keys[key]
        q = questions[idx]
        if source and source not in GENERIC_SOURCES:
            if not q['source'] or q['source'] in GENERIC_SOURCES:
                q['source'] = source
                stats[subject]['enriched'] += 1
            if chapter and len(str(chapter)) > len(q['chapter']):
                q['chapter'] = str(chapter)
            if explanation and len(str(explanation)) > len(str(q['explanation'])):
                q['explanation'] = str(explanation)
        stats[subject]['dup'] += 1
        stats[subject]['total'] += 1
        return
    seen_keys[key] = len(questions)
    stats[subject]['total'] += 1
    questions.append({
        'subject': subject,
        'chapter': chapter or '',
        'type': qtype,
        'question': str(question),
        'options': str(options),
        'answer': str(answer),
        'explanation': str(explanation) if explanation else '',
        'difficulty': int(difficulty) if difficulty else 2,
        'source': source or ''
    })

def parse_pg_sql(filepath, default_source='', inline_source=False):
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        return
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    pattern = re.compile(
        r"\('(math2|english2|circuit|politics)',\s*'([^']*(?:''[^']*)*)',\s*"
        r"'(single|multiple|judge|fill|essay)',\s*'([^']*(?:''[^']*)*)',\s*"
        r"'([^']*(?:''[^']*)*)',\s*'([^']*(?:''[^']*)*)',\s*"
        r"'([^']*(?:''[^']*)*)',\s*(\d+)(?:,\s*'([^']*(?:''[^']*)*)')?\)",
        re.DOTALL
    )
    matches = pattern.findall(content)
    for m in matches:
        subject, chapter, qtype, question, options, answer, explanation, diff = m[:8]
        chapter = chapter.replace("''", "'")
        question = question.replace("''", "'")
        options = options.replace("''", "'")
        answer = answer.replace("''", "'")
        explanation = explanation.replace("''", "'")
        src = ''
        if inline_source and m[8]:
            src = m[8].replace("''", "'")
        if not src:
            src = default_source
            if subject == 'math2' and not src:
                src = '数学二题库'
            elif subject == 'circuit' and not src:
                src = '电路题库(北交大870)'
            elif subject == 'english2' and not src:
                src = '英语二题库'
            elif subject == 'politics' and not src:
                src = '政治题库'
        add_question(subject, chapter, qtype, question, options, answer, explanation, int(diff), src)
    print(f"{os.path.basename(filepath)}: parsed {len(matches)} rows")

def parse_politics_sql(filepath, default_source='政治题库'):
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        return
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    pattern = re.compile(
        r"\('politics',\s*'([^']*(?:''[^']*)*)',\s*"
        r"'(single|multiple|judge)',\s*'([^']*(?:''[^']*)*)',\s*"
        r"'([^']*(?:''[^']*)*)',\s*'([^']*(?:''[^']*)*)',\s*"
        r"'([^']*(?:''[^']*)*)',\s*(\d+)\)",
        re.DOTALL
    )
    matches = pattern.findall(content)
    for m in matches:
        chapter, qtype, question, options, answer, explanation, diff = m
        chapter = chapter.replace("''", "'")
        question = question.replace("''", "'")
        options = options.replace("''", "'")
        answer = answer.replace("''", "'")
        explanation = explanation.replace("''", "'")
        add_question('politics', chapter, qtype, question, options, answer, explanation, int(diff), default_source)
    print(f"{os.path.basename(filepath)}: parsed {len(matches)} rows")

def parse_mysql_values(text, start):
    vals = []
    i = start
    while i < len(text) and text[i] in ' \t\n\r':
        i += 1
    if i >= len(text) or text[i] != '(':
        return None, i
    i += 1
    while i < len(text):
        while i < len(text) and text[i] in ' \t\n\r':
            i += 1
        if i >= len(text):
            break
        if text[i] == ')':
            i += 1
            break
        if text[i] == ',':
            i += 1
            continue
        if text[i] == "'":
            i += 1
            val = ''
            while i < len(text):
                if text[i] == "'" and i + 1 < len(text) and text[i+1] == "'":
                    val += "'"
                    i += 2
                elif text[i] == "'":
                    i += 1
                    break
                else:
                    val += text[i]
                    i += 1
            vals.append(val)
        else:
            val = ''
            while i < len(text) and text[i] not in ",)":
                val += text[i]
                i += 1
            vals.append(val.strip())
    return vals, i

def parse_kyzz_sql(filepath):
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        return
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    insert_pattern = re.compile(r"INSERT INTO\s+kyzz\.question\s*\([^)]*\)\s*VALUES\s*", re.IGNORECASE)
    matches = list(insert_pattern.finditer(content))
    count = 0
    for m in matches:
        vals, _ = parse_mysql_values(content, m.end())
        if not vals or len(vals) < 14:
            continue
        _id = vals[0]
        title = vals[1]
        qtype_raw = vals[2]
        opt_a = vals[3]
        opt_b = vals[4]
        opt_c = vals[5]
        opt_d = vals[6]
        answer = vals[7]
        analysis = vals[8]
        year = vals[9]
        _num = vals[10]
        p_from = vals[11]
        level_from = vals[12]
        top_from = vals[13]
        
        qtype = 'single' if '单选' in qtype_raw else ('multiple' if '多选' in qtype_raw else 'judge')
        
        opts = []
        letters = ['A', 'B', 'C', 'D']
        for idx, opt in enumerate([opt_a, opt_b, opt_c, opt_d]):
            if opt and opt.strip():
                opts.append(f'{letters[idx]}. {opt.strip()}')
        options_str = json.dumps(opts, ensure_ascii=False)
        
        parts = []
        if top_from and top_from.strip() and top_from.strip().lower() != 'null':
            parts.append(top_from.strip())
        if year and year.strip() and year.strip() != '0' and year.strip().lower() != 'null':
            parts.append(f'{year.strip()}年真题')
        source = ' '.join(parts) if parts else '考研政治真题'
        
        chapter = p_from.strip() if p_from and p_from.strip() and p_from.strip().lower() != 'null' else '考研政治综合'
        
        explanation = analysis.strip() if analysis else ''
        if level_from and level_from.strip():
            explanation = f'[{level_from.strip()}] {explanation}' if explanation else level_from.strip()
        
        difficulty = 2
        if level_from and '简单' in level_from:
            difficulty = 1
        elif level_from and ('难' in level_from or '重点' in level_from):
            difficulty = 3
        
        answer = answer.strip().upper()
        
        add_question('politics', chapter, qtype, title, options_str, answer, explanation, difficulty, source)
        count += 1
    print(f"{os.path.basename(filepath)}: parsed {count} rows")

def parse_maogai_json(filepath):
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        return
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    count = 0
    for item in data:
        q = item.get('question', '')
        if not q or len(q) < 5:
            continue
        qtype = item.get('type', 'single')
        raw_opts = item.get('options', [])
        ans_idx = item.get('answer', 0)
        
        letters = ['A', 'B', 'C', 'D', 'E', 'F']
        opts = []
        for idx, opt in enumerate(raw_opts):
            letter = letters[idx] if idx < len(letters) else str(idx)
            opts.append(f'{letter}. {opt}')
        options_str = json.dumps(opts, ensure_ascii=False)
        
        answer = letters[ans_idx] if isinstance(ans_idx, int) and ans_idx < len(letters) else str(ans_idx)
        
        add_question('politics', '毛泽东思想概论', qtype, q, options_str, answer, '', 2, '毛概题库')
        count += 1
    print(f"{os.path.basename(filepath)}: parsed {count} rows")

print("=== 开始解析所有题库文件 ===\n")

parse_pg_sql(os.path.join(BASE, 'seed_all.sql'), '')
parse_politics_sql(os.path.join(BASE, 'seed_politics_new.sql'), '政治多源题库')

parse_pg_sql(os.path.join(BASE, 'seed_real_math_2020_2022.sql'), '', inline_source=True)
parse_pg_sql(os.path.join(BASE, 'seed_real_math_2023_2024.sql'), '', inline_source=True)
parse_pg_sql(os.path.join(BASE, 'seed_real_english_cloze.sql'), '', inline_source=True)
parse_pg_sql(os.path.join(BASE, 'seed_real_english_reading.sql'), '', inline_source=True)
parse_pg_sql(os.path.join(BASE, 'seed_real_teacher.sql'), '', inline_source=True)

parse_pg_sql(os.path.join(BASE, 'seed_adv_circuit.sql'), '', inline_source=True)
parse_pg_sql(os.path.join(BASE, 'seed_adv_math2.sql'), '', inline_source=True)

parse_pg_sql(os.path.join(BASE, 'seed_teacher_math2.sql'), '', inline_source=True)
parse_pg_sql(os.path.join(BASE, 'seed_real_math_2015_2019.sql'), '', inline_source=True)
parse_pg_sql(os.path.join(BASE, 'seed_real_english_2015_2019.sql'), '', inline_source=True)
parse_pg_sql(os.path.join(BASE, 'seed_real_circuit.sql'), '', inline_source=True)

parse_kyzz_sql(os.path.join(PARENT, 'kyzz_question.sql'))
parse_maogai_json(os.path.join(PARENT, 'maogai_all.json'))

for q in questions:
    q['chapter'] = fix_chapter(q['subject'], q['chapter'], q['question'])

print(f"\n=== 去重统计 ===")
total_in = 0
total_dup = 0
for subj in ['math2', 'circuit', 'english2', 'politics']:
    s = stats[subj]
    total_in += s['total']
    total_dup += s['dup']
    unique = s['total'] - s['dup']
    print(f"  {subj}: 输入{s['total']} -> 去重后{unique} (移除{s['dup']}重复, 来源增强{s['enriched']})")

print(f"\n总输入: {total_in}")
print(f"总去重后: {len(questions)}")
print(f"移除重复: {total_dup}")

subj_counts = Counter(q['subject'] for q in questions)
source_counts = Counter(q['source'] for q in questions)
print(f"\n最终各科目题量:")
for subj, cnt in sorted(subj_counts.items()):
    names = {'math2': '数学二', 'circuit': '电路', 'english2': '英语二', 'politics': '政治'}
    print(f"  {names.get(subj, subj)}: {cnt}")

print(f"\n来源分布 (前20):")
for src, cnt in source_counts.most_common(20):
    print(f"  {src}: {cnt}")

output = os.path.join(BASE, 'seed_all_final.sql')
with open(output, 'w', encoding='utf-8') as f:
    f.write("-- ============================================\n")
    f.write("-- 考研刷题工具 - 完整数据库 (含来源字段)\n")
    f.write(f"-- 总题量: {len(questions)}题\n")
    for subj, cnt in sorted(subj_counts.items()):
        names = {'math2': '数学二', 'circuit': '电路', 'english2': '英语二', 'politics': '政治'}
        f.write(f"--   {names.get(subj, subj)}: {cnt}题\n")
    f.write("-- ============================================\n\n")
    
    schema_lines = [
        '-- 数据库表结构',
        'CREATE TABLE IF NOT EXISTS questions (',
        '  id          BIGSERIAL PRIMARY KEY,',
        '  subject     TEXT NOT NULL,',
        "  chapter     TEXT NOT NULL DEFAULT '',",
        "  type        TEXT NOT NULL DEFAULT 'single',",
        '  question    TEXT NOT NULL,',
        "  options     JSONB DEFAULT '[]',",
        '  answer      TEXT NOT NULL,',
        "  explanation TEXT DEFAULT '',",
        '  difficulty  SMALLINT DEFAULT 1,',
        "  source      TEXT DEFAULT '',",
        '  created_at  TIMESTAMPTZ DEFAULT NOW()',
        ');',
        '',
        'CREATE TABLE IF NOT EXISTS quiz_records (',
        '  id          BIGSERIAL PRIMARY KEY,',
        '  question_id BIGINT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,',
        '  subject     TEXT NOT NULL,',
        '  is_correct  BOOLEAN NOT NULL,',
        '  user_answer TEXT NOT NULL,',
        '  created_at  TIMESTAMPTZ DEFAULT NOW()',
        ');',
        '',
        'CREATE TABLE IF NOT EXISTS wrong_book (',
        '  id          BIGSERIAL PRIMARY KEY,',
        '  question_id BIGINT NOT NULL REFERENCES questions(id) ON DELETE CASCADE UNIQUE,',
        '  subject     TEXT NOT NULL,',
        '  user_answer TEXT NOT NULL,',
        '  mastered    BOOLEAN DEFAULT FALSE,',
        '  review_count SMALLINT DEFAULT 0,',
        '  created_at  TIMESTAMPTZ DEFAULT NOW(),',
        '  updated_at  TIMESTAMPTZ DEFAULT NOW()',
        ');',
        '',
        'CREATE INDEX IF NOT EXISTS idx_questions_subject ON questions(subject);',
        'CREATE INDEX IF NOT EXISTS idx_questions_chapter ON questions(subject, chapter);',
        'CREATE INDEX IF NOT EXISTS idx_quiz_records_created ON quiz_records(created_at);',
        'CREATE INDEX IF NOT EXISTS idx_quiz_records_subject ON quiz_records(subject);',
        'CREATE INDEX IF NOT EXISTS idx_wrong_book_subject ON wrong_book(subject);',
        'CREATE INDEX IF NOT EXISTS idx_wrong_book_mastered ON wrong_book(mastered);',
        '',
        'ALTER TABLE questions ENABLE ROW LEVEL SECURITY;',
        'ALTER TABLE quiz_records ENABLE ROW LEVEL SECURITY;',
        'ALTER TABLE wrong_book ENABLE ROW LEVEL SECURITY;',
        '',
        'CREATE POLICY "Allow all on questions" ON questions FOR ALL USING (true);',
        'CREATE POLICY "Allow all on quiz_records" ON quiz_records FOR ALL USING (true);',
        'CREATE POLICY "Allow all on wrong_book" ON wrong_book FOR ALL USING (true);',
        ''
    ]
    f.write('\n'.join(schema_lines) + '\n')
    
    by_subject = defaultdict(list)
    for q in questions:
        by_subject[q['subject']].append(q)
    
    subject_names = {'math2': '数学二题库', 'circuit': '电路题库', 'english2': '英语二题库', 'politics': '政治题库'}
    for subj in ['math2', 'circuit', 'english2', 'politics']:
        qs = by_subject[subj]
        if not qs:
            continue
        f.write(f"-- ============================================\n")
        f.write(f"-- {subject_names[subj]} ({len(qs)}题)\n")
        f.write(f"-- ============================================\n\n")
        batch_size = 50
        for i in range(0, len(qs), batch_size):
            batch = qs[i:i+batch_size]
            f.write("INSERT INTO questions (subject, chapter, type, question, options, answer, explanation, difficulty, source) VALUES\n")
            for j, q in enumerate(batch):
                ending = ',' if j < len(batch) - 1 else ';'
                f.write(
                    f"('{esc(q['subject'])}', '{esc(q['chapter'])}', '{q['type']}', "
                    f"'{esc(q['question'])}', '{esc(q['options'])}', '{esc(q['answer'])}', "
                    f"'{esc(q['explanation'])}', {q['difficulty']}, '{esc(q['source'])}'){ending}\n"
                )
            f.write("\n")

print(f"\n输出文件: {output}")
print(f"文件大小: {os.path.getsize(output) / 1024 / 1024:.2f} MB")
