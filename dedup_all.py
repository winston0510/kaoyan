import re
import os
from collections import defaultdict

from qkey import dedup_key

BASE = os.path.dirname(os.path.abspath(__file__))

VALID_TYPES = ('single', 'multiple', 'judge', 'fill', 'essay')
DEFAULT_SOURCES = {
    'math2': '数学二题库',
    'circuit': '电路题库(北交大870)',
    'english2': '英语二题库',
    'politics': '政治题库',
}

def esc(s):
    if s is None:
        return ''
    return str(s).replace("'", "''")

questions = []
seen_keys = set()
stats = defaultdict(lambda: {'total': 0, 'dup': 0, 'skipped_short': 0, 'skipped_type': 0})

def add_question(subject, chapter, qtype, question, options, answer, explanation, difficulty, source=''):
    if qtype not in VALID_TYPES:
        stats[subject]['skipped_type'] += 1
        return
    if not question or len(str(question)) < 5:
        stats[subject]['skipped_short'] += 1
        return
    key = dedup_key(subject, question)
    if key in seen_keys:
        stats[subject]['dup'] += 1
        stats[subject]['total'] += 1
        return
    seen_keys.add(key)
    stats[subject]['total'] += 1
    questions.append({
        'subject': subject,
        'chapter': chapter,
        'type': qtype,
        'question': str(question),
        'options': str(options),
        'answer': str(answer),
        'explanation': str(explanation) if explanation else '',
        'difficulty': int(difficulty) if difficulty else 2,
        'source': source or DEFAULT_SOURCES.get(subject, '')
    })

ROW = re.compile(
    r"\('(math2|english2|circuit|politics)',\s*'([^']*(?:''[^']*)*)',\s*"
    r"'([a-z_]+)',\s*'([^']*(?:''[^']*)*)',\s*"
    r"'([^']*(?:''[^']*)*)',\s*'([^']*(?:''[^']*)*)',\s*"
    r"'([^']*(?:''[^']*)*)',\s*(\d+)(?:,\s*'([^']*(?:''[^']*)*)')?\)",
    re.DOTALL
)

def unq(s):
    return s.replace("''", "'")

def count_tuple_lines(content):
    return sum(1 for line in content.splitlines() if line.lstrip().startswith("('"))

def parse_sql_file(filepath, subject_filter=None, default_source=''):
    if not os.path.exists(filepath):
        raise SystemExit(f"File not found: {filepath}")
    with open(filepath, 'r', encoding='utf-8-sig') as f:
        content = f.read()
    expected = count_tuple_lines(content)
    matched = 0
    for m in ROW.finditer(content):
        subject, chapter, qtype, question, options, answer, explanation, diff, src = m.groups()
        if subject_filter and subject != subject_filter:
            continue
        add_question(subject, unq(chapter), qtype, unq(question), unq(options), unq(answer),
                     unq(explanation), int(diff), (unq(src) if src else '') or default_source)
        matched += 1
    if expected and matched == 0:
        raise SystemExit(f"{os.path.basename(filepath)}: 含 {expected} 行元组但解析到 0 条，解析器与文件格式不匹配")
    print(f"{os.path.basename(filepath)}: parsed {matched} value rows" + (f" (文件内元组行 {expected})" if expected else ""))

print("=== 开始解析所有SQL文件 ===\n")
parse_sql_file(os.path.join(BASE, 'seed_all.sql'))
parse_sql_file(os.path.join(BASE, 'seed_politics_new.sql'))

print(f"\n=== 去重统计 ===")
total_in = 0
total_dup = 0
for subj in ['math2', 'circuit', 'english2', 'politics']:
    s = stats[subj]
    total_in += s['total']
    total_dup += s['dup']
    unique = s['total'] - s['dup']
    print(f"  {subj}: 输入{s['total']} -> 去重后{unique} (移除{s['dup']}重复, "
          f"题干过短{s['skipped_short']}, 题型非法{s['skipped_type']})")

print(f"\n总输入: {total_in}")
print(f"总去重后: {len(questions)}")
print(f"移除重复: {total_dup}")

from collections import Counter
subj_counts = Counter(q['subject'] for q in questions)
print(f"\n最终各科目题量:")
for subj, cnt in sorted(subj_counts.items()):
    print(f"  {subj}: {cnt}")

output = os.path.join(BASE, 'seed_all_dedup.new.sql')
with open(output, 'w', encoding='utf-8') as f:
    f.write("-- ============================================\n")
    f.write("-- 考研刷题工具 - 完整数据库 (去重版)\n")
    f.write(f"-- 总题量: {len(questions)}题\n")
    for subj, cnt in sorted(subj_counts.items()):
        names = {'math2': '数学二', 'circuit': '电路', 'english2': '英语二', 'politics': '政治'}
        f.write(f"--   {names.get(subj, subj)}: {cnt}题\n")
    f.write("-- 建表与权限见 schema.sql；本文件只含数据\n\n")

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
