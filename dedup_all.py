import re
import json
import os
from collections import defaultdict

BASE = os.path.dirname(os.path.abspath(__file__))

def esc(s):
    if s is None:
        return ''
    return str(s).replace("'", "''")

def normalize_question(q):
    q = re.sub(r'<[^>]+>', '', q)
    q = re.sub(r'\s+', '', q)
    q = re.sub(r'[，。、？！（）；：""''【】《》〈〉「」『』]', '', q)
    q = q.lower()
    return q[:80]

questions = []
seen_keys = set()
stats = defaultdict(lambda: {'total': 0, 'dup': 0})

def add_question(subject, chapter, qtype, question, options, answer, explanation, difficulty):
    if not question or len(str(question)) < 5:
        return
    key = normalize_question(str(question))
    if not key or key in seen_keys:
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
        'difficulty': int(difficulty) if difficulty else 2
    })

def parse_sql_file(filepath):
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        return
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    value_pattern = re.compile(
        r"\('(math2|english2|circuit|politics)',\s*'([^']*(?:''[^']*)*)',\s*"
        r"'(single|multiple|judge)',\s*'([^']*(?:''[^']*)*)',\s*"
        r"'([^']*(?:''[^']*)*)',\s*'([^']*(?:''[^']*)*)',\s*"
        r"'([^']*(?:''[^']*)*)',\s*(\d+)\)",
        re.DOTALL
    )
    matches = value_pattern.findall(content)
    for m in matches:
        subject, chapter, qtype, question, options, answer, explanation, diff = m
        chapter = chapter.replace("''", "'")
        question = question.replace("''", "'")
        options = options.replace("''", "'")
        answer = answer.replace("''", "'")
        explanation = explanation.replace("''", "'")
        add_question(subject, chapter, qtype, question, options, answer, explanation, int(diff))
    print(f"{os.path.basename(filepath)}: parsed {len(matches)} value rows")

def parse_politics_sql(filepath):
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        return
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    value_pattern = re.compile(
        r"\('politics',\s*'([^']*(?:''[^']*)*)',\s*"
        r"'(single|multiple|judge)',\s*'([^']*(?:''[^']*)*)',\s*"
        r"'([^']*(?:''[^']*)*)',\s*'([^']*(?:''[^']*)*)',\s*"
        r"'([^']*(?:''[^']*)*)',\s*(\d+)\)",
        re.DOTALL
    )
    matches = value_pattern.findall(content)
    for m in matches:
        chapter, qtype, question, options, answer, explanation, diff = m
        chapter = chapter.replace("''", "'")
        question = question.replace("''", "'")
        options = options.replace("''", "'")
        answer = answer.replace("''", "'")
        explanation = explanation.replace("''", "'")
        add_question('politics', chapter, qtype, question, options, answer, explanation, int(diff))
    print(f"{os.path.basename(filepath)}: parsed {len(matches)} value rows")

print("=== 开始解析所有SQL文件 ===\n")
parse_sql_file(os.path.join(BASE, 'seed_all.sql'))
parse_politics_sql(os.path.join(BASE, 'seed_politics_new.sql'))

print(f"\n=== 去重统计 ===")
total_in = 0
total_dup = 0
for subj in ['math2', 'circuit', 'english2', 'politics']:
    s = stats[subj]
    total_in += s['total']
    total_dup += s['dup']
    unique = s['total'] - s['dup']
    print(f"  {subj}: 输入{s['total']} -> 去重后{unique} (移除{s['dup']}重复)")

print(f"\n总输入: {total_in}")
print(f"总去重后: {len(questions)}")
print(f"移除重复: {total_dup}")

from collections import Counter
subj_counts = Counter(q['subject'] for q in questions)
print(f"\n最终各科目题量:")
for subj, cnt in sorted(subj_counts.items()):
    print(f"  {subj}: {cnt}")

output = os.path.join(BASE, 'seed_all_dedup.sql')
with open(output, 'w', encoding='utf-8') as f:
    f.write("-- ============================================\n")
    f.write("-- 考研刷题工具 - 完整数据库 (去重版)\n")
    f.write(f"-- 总题量: {len(questions)}题\n")
    for subj, cnt in sorted(subj_counts.items()):
        names = {'math2': '数学二', 'circuit': '电路', 'english2': '英语二', 'politics': '政治'}
        f.write(f"--   {names.get(subj, subj)}: {cnt}题\n")
    f.write("-- ============================================\n\n")
    f.write("-- 数据库表结构\n")
    f.write(open(os.path.join(BASE, 'schema.sql'), 'r', encoding='utf-8').read())
    f.write("\n\n")

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
            f.write("INSERT INTO questions (subject, chapter, type, question, options, answer, explanation, difficulty) VALUES\n")
            for j, q in enumerate(batch):
                ending = ',' if j < len(batch) - 1 else ';'
                f.write(
                    f"('{esc(q['subject'])}', '{esc(q['chapter'])}', '{q['type']}', "
                    f"'{esc(q['question'])}', '{esc(q['options'])}', '{esc(q['answer'])}', "
                    f"'{esc(q['explanation'])}', {q['difficulty']}){ending}\n"
                )
            f.write("\n")

print(f"\n输出文件: {output}")
print(f"文件大小: {os.path.getsize(output) / 1024 / 1024:.2f} MB")
