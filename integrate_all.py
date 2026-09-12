import argparse
import json
import os
import re
import sys
from collections import defaultdict, Counter

from chapter_classifier import fix_chapter
import qkey
from qkey import dedup_key

BASE = os.path.dirname(os.path.abspath(__file__))
PARENT = os.path.dirname(BASE)
OUTPUT = os.path.join(BASE, 'seed_all_final.sql')

VALID_TYPES = ('single', 'multiple', 'judge', 'fill', 'essay')
SUBJECT_NAMES = {'math2': '数学二', 'circuit': '电路', 'english2': '英语二', 'politics': '政治'}
SUBJECT_TITLES = {'math2': '数学二题库', 'circuit': '电路题库', 'english2': '英语二题库', 'politics': '政治题库'}
GENERIC_SOURCES = {'', '政治题库', '政治多源题库'}

questions = []
seen_keys = {}
stats = defaultdict(lambda: {'total': 0, 'dup': 0, 'enriched': 0, 'skipped_short': 0, 'skipped_type': 0})
dup_log = []
missing_required = []
missing_optional = []
parse_alerts = []


def esc(s):
    if s is None:
        return ''
    return str(s).replace("'", "''")


def line_of(content, pos):
    return content.count('\n', 0, pos) + 1


def count_tuple_lines(content):
    n = 0
    for line in content.splitlines():
        if line.lstrip().startswith("('"):
            n += 1
    return n


def report_coverage(fname, matched, expected):
    if expected and matched == 0:
        parse_alerts.append(f'{fname}: 文件含 {expected} 行元组但解析到 0 条 —— 解析器与该文件格式不匹配')
    elif expected and matched < expected:
        parse_alerts.append(f'{fname}: 解析到 {matched} 条，文件内有 {expected} 行元组（差 {expected - matched}）')


def add_question(subject, chapter, qtype, question, options, answer, explanation, difficulty, source='', origin=None):
    if qtype not in VALID_TYPES:
        stats[subject]['skipped_type'] += 1
        dup_log.append({'kind': 'bad_type', 'origin': origin, 'subject': subject, 'type': str(qtype)[:16]})
        return
    if not question or len(str(question)) < 5:
        stats[subject]['skipped_short'] += 1
        return
    key = dedup_key(subject, question)
    if not key:
        stats[subject]['skipped_short'] += 1
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
        dup_log.append({'kind': 'dup', 'origin': origin, 'subject': subject, 'key': key[:16], 'kept_index': idx})
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


PG_ROW = re.compile(
    r"\('(math2|english2|circuit|politics)',\s*'([^']*(?:''[^']*)*)',\s*"
    r"'([a-z_]+)',\s*'([^']*(?:''[^']*)*)',\s*"
    r"'([^']*(?:''[^']*)*)',\s*'([^']*(?:''[^']*)*)',\s*"
    r"'([^']*(?:''[^']*)*)',\s*(\d+)(?:,\s*'([^']*(?:''[^']*)*)')?\)",
    re.DOTALL
)

POLITICS_ROW = re.compile(
    r"\('(politics)',\s*'([^']*(?:''[^']*)*)',\s*"
    r"'([a-z_]+)',\s*'([^']*(?:''[^']*)*)',\s*"
    r"'([^']*(?:''[^']*)*)',\s*'([^']*(?:''[^']*)*)',\s*"
    r"'([^']*(?:''[^']*)*)',\s*(\d+)(?:,\s*'([^']*(?:''[^']*)*)')?\)",
    re.DOTALL
)

DEFAULT_SOURCES = {
    'math2': '数学二题库',
    'circuit': '电路题库(北交大870)',
    'english2': '英语二题库',
    'politics': '政治题库',
}


def parse_pg_rows(content, subject_filter=None, default_source='', inline_source=False, origin_file=''):
    rows = [m for m in PG_ROW.finditer(content) if not subject_filter or m.group(1) == subject_filter]
    for m in rows:
        subject, chapter, qtype, question, options, answer, explanation, diff = m.groups()[:8]
        tail = m.group(9)
        chapter = unq(chapter)
        question = unq(question)
        options = unq(options)
        answer = unq(answer)
        explanation = unq(explanation)
        src = unq(tail) if (inline_source and tail) else ''
        if not src:
            src = default_source or DEFAULT_SOURCES.get(subject, '')
        add_question(subject, chapter, qtype, question, options, answer, explanation, int(diff), src,
                     origin={'file': origin_file, 'line': line_of(content, m.start())})
    return len(rows)


def unq(s):
    return s.replace("''", "'")


def read_text(filepath):
    with open(filepath, 'r', encoding='utf-8-sig') as f:
        return f.read()


def parse_kyzz_sql(filepath):
    content = read_text(filepath)
    insert_pattern = re.compile(r"INSERT INTO\s+kyzz\.question\s*\([^)]*\)\s*VALUES\s*", re.IGNORECASE)
    matches = list(insert_pattern.finditer(content))
    count = 0
    letters = ['A', 'B', 'C', 'D']
    for m in matches:
        vals, _ = parse_mysql_values(content, m.end())
        if not vals or len(vals) < 14:
            continue
        title = vals[1]
        qtype_raw = vals[2]
        opts_raw = vals[3:7]
        answer = vals[7]
        analysis = vals[8]
        year = vals[9]
        p_from = vals[11]
        level_from = vals[12]
        top_from = vals[13]

        if '单选' in qtype_raw:
            qtype = 'single'
        elif '多选' in qtype_raw:
            qtype = 'multiple'
        elif '判断' in qtype_raw:
            qtype = 'judge'
        else:
            stats['politics']['skipped_type'] += 1
            dup_log.append({'kind': 'bad_type', 'origin': {'file': os.path.basename(filepath), 'line': line_of(content, m.start())},
                            'subject': 'politics', 'type': qtype_raw[:16]})
            continue

        opts = []
        for idx, opt in enumerate(opts_raw):
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

        add_question('politics', chapter, qtype, title, options_str, answer.strip().upper(), explanation, difficulty, source,
                     origin={'file': os.path.basename(filepath), 'line': line_of(content, m.start())})
        count += 1
    report_coverage(os.path.basename(filepath), count, len(matches))
    print(f"{os.path.basename(filepath)}: parsed {count} rows")


MYSQL_ESCAPES = {'n': '\n', 'r': '\r', 't': '\t', '0': '', 'Z': ''}


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
                c = text[i]
                if c == '\\' and i + 1 < len(text):
                    nxt = text[i + 1]
                    val += MYSQL_ESCAPES.get(nxt, nxt)
                    i += 2
                elif c == "'" and i + 1 < len(text) and text[i + 1] == "'":
                    val += "'"
                    i += 2
                elif c == "'":
                    i += 1
                    break
                else:
                    val += c
                    i += 1
            vals.append(val)
        else:
            val = ''
            while i < len(text) and text[i] not in ",)":
                val += text[i]
                i += 1
            vals.append(val.strip())
    return vals, i


def parse_maogai_json(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    count = 0
    skipped = 0
    letters = ['A', 'B', 'C', 'D', 'E', 'F']
    for item in data:
        q = item.get('question', '')
        if not q or len(q) < 5:
            continue
        qtype = item.get('type', 'single')
        if qtype not in VALID_TYPES:
            qtype = 'single'
        raw_opts = item.get('options', []) or []
        ans = item.get('answer', 0)

        opts = []
        for idx, opt in enumerate(raw_opts):
            letter = letters[idx] if idx < len(letters) else str(idx)
            opts.append(f'{letter}. {opt}')
        options_str = json.dumps(opts, ensure_ascii=False)

        if isinstance(ans, int):
            if ans < 0 or ans >= len(letters):
                skipped += 1
                continue
            answer = letters[ans]
        elif isinstance(ans, str) and re.fullmatch(r'[A-Fa-f]+', ans.strip()):
            answer = ans.strip().upper()
        else:
            skipped += 1
            continue

        add_question('politics', '毛泽东思想概论', qtype, q, options_str, answer, '', 2, '毛概题库',
                     origin={'file': os.path.basename(filepath), 'line': 0})
        count += 1
    if skipped:
        stats['politics']['skipped_type'] += skipped
        print(f"  !! maogai_all.json: {skipped} 条因答案字段不可识别被跳过")
    print(f"{os.path.basename(filepath)}: parsed {count} rows")


REGISTRY = [
    {'kind': 'pg', 'file': os.path.join(BASE, 'seed_all.sql'), 'default_source': ''},
    {'kind': 'politics', 'file': os.path.join(BASE, 'seed_politics_new.sql'), 'default_source': '政治多源题库'},
    {'kind': 'pg', 'file': os.path.join(BASE, 'seed_real_math_2020_2022.sql'), 'inline_source': True},
    {'kind': 'pg', 'file': os.path.join(BASE, 'seed_real_math_2023_2024.sql'), 'inline_source': True},
    {'kind': 'pg', 'file': os.path.join(BASE, 'seed_real_english_cloze.sql'), 'inline_source': True},
    {'kind': 'pg', 'file': os.path.join(BASE, 'seed_real_english_reading.sql'), 'inline_source': True},
    {'kind': 'pg', 'file': os.path.join(BASE, 'seed_real_teacher.sql'), 'inline_source': True},
    {'kind': 'pg', 'file': os.path.join(BASE, 'seed_adv_circuit.sql'), 'inline_source': True},
    {'kind': 'pg', 'file': os.path.join(BASE, 'seed_adv_math2.sql'), 'inline_source': True},
    {'kind': 'pg', 'file': os.path.join(BASE, 'seed_teacher_math2.sql'), 'inline_source': True},
    {'kind': 'pg', 'file': os.path.join(BASE, 'seed_real_math_2015_2019.sql'), 'inline_source': True},
    {'kind': 'pg', 'file': os.path.join(BASE, 'seed_real_english_2015_2019.sql'), 'inline_source': True},
    {'kind': 'pg', 'file': os.path.join(BASE, 'seed_real_circuit.sql'), 'inline_source': True},
    {'kind': 'pg', 'file': os.path.join(BASE, 'seed_real_math_2025.sql'), 'inline_source': True},
    {'kind': 'politics', 'file': os.path.join(BASE, '_part_politics_2016.sql'), 'default_source': '2016年真题', 'optional': True},
    {'kind': 'politics', 'file': os.path.join(BASE, '_part_politics_2017.sql'), 'default_source': '2017年真题', 'optional': True},
    {'kind': 'politics', 'file': os.path.join(BASE, '_part_politics_2018.sql'), 'default_source': '2018年真题', 'optional': True},
    {'kind': 'politics', 'file': os.path.join(BASE, '_part_politics_2019.sql'), 'default_source': '2019年真题', 'optional': True},
    {'kind': 'politics', 'file': os.path.join(BASE, '_part_politics_2020.sql'), 'default_source': '2020年真题', 'optional': True},
    {'kind': 'politics', 'file': os.path.join(BASE, '_part_politics_2021.sql'), 'default_source': '2021年真题', 'optional': True},
    {'kind': 'politics', 'file': os.path.join(BASE, '_part_politics_2022.sql'), 'default_source': '2022年真题', 'optional': True},
    {'kind': 'politics', 'file': os.path.join(BASE, '_part_politics_2023.sql'), 'default_source': '2023年真题', 'optional': True},
    {'kind': 'politics', 'file': os.path.join(BASE, '_part_politics_2024.sql'), 'default_source': '2024年真题', 'optional': True},
    {'kind': 'politics', 'file': os.path.join(BASE, '_part_politics_2025.sql'), 'default_source': '2025年真题', 'optional': True},
    {'kind': 'kyzz', 'file': os.path.join(PARENT, 'kyzz_question.sql'), 'optional': True},
    {'kind': 'maogai', 'file': os.path.join(PARENT, 'maogai_all.json'), 'optional': True},
]


def run_registry():
    for spec in REGISTRY:
        path = spec['file']
        name = os.path.basename(path)
        if not os.path.exists(path):
            if spec.get('optional'):
                missing_optional.append(name)
            else:
                missing_required.append(name)
            continue
        if spec['kind'] == 'kyzz':
            parse_kyzz_sql(path)
        elif spec['kind'] == 'maogai':
            parse_maogai_json(path)
        else:
            content = read_text(path)
            expected = count_tuple_lines(content)
            if spec['kind'] == 'politics':
                rows = [m for m in POLITICS_ROW.finditer(content)]
                for m in rows:
                    subject, chapter, qtype, question, options, answer, explanation, diff = m.groups()[:8]
                    tail = m.group(9)
                    src = unq(tail) if tail else spec.get('default_source', '政治题库')
                    add_question('politics', unq(chapter), qtype, unq(question), unq(options), unq(answer),
                                 unq(explanation), int(diff), src,
                                 origin={'file': name, 'line': line_of(content, m.start())})
                matched = len(rows)
            else:
                matched = parse_pg_rows(content, None, spec.get('default_source', ''), spec.get('inline_source', False), name)
            report_coverage(name, matched, expected)
            print(f"{name}: parsed {matched} rows")


COLUMNS = ['subject', 'chapter', 'type', 'question', 'options', 'answer', 'explanation', 'difficulty', 'source']
BATCH_SIZE = 50


def dict_fields(q):
    return [
        f"'{esc(q['subject'])}'", f"'{esc(q['chapter'])}'", f"'{q['type']}'",
        f"'{esc(q['question'])}'", f"'{esc(q['options'])}'", f"'{esc(q['answer'])}'",
        f"'{esc(q['explanation'])}'", str(q['difficulty']), f"'{esc(q['source'])}'"
    ]


def base_rows(path):
    """读现有权威 SQL：原样保留字段文本（含既有编码），并算出身份键。"""
    with open(path, 'r', encoding='utf-8-sig') as f:
        content = f.read()
    rows = []
    for columns, tuples in qkey.iter_statements(content):
        if columns != COLUMNS:
            sys.exit(f'基底文件字段清单 {columns} 与主链 {COLUMNS} 不一致，拒绍并入')
        for fields in tuples:
            subject, question = qkey.row_subject_question(columns, fields)
            rows.append((subject, fields, qkey.dedup_key(subject, question)))
    if not rows:
        sys.exit(f'基底文件未解析到任何行: {path}')
    return rows


def write_rows(target, rows):
    by_subject = defaultdict(list)
    for subject, fields in rows:
        by_subject[subject].append(fields)
    counts = Counter(subject for subject, _ in rows)

    tmp = target + '.tmp'
    with open(tmp, 'w', encoding='utf-8') as f:
        f.write("-- " + "=" * 44 + "\n")
        f.write("-- 考研刷题工具 - 完整数据库 (含来源字段)\n")
        f.write(f"-- 总题量: {len(rows)}题\n")
        for subj, cnt in sorted(counts.items()):
            f.write(f"--   {SUBJECT_NAMES.get(subj, subj)}: {cnt}题\n")
        f.write("-- 建表与权限见 schema.sql；本文件只含数据\n\n")
        for subj in ['math2', 'circuit', 'english2', 'politics']:
            batched = by_subject.get(subj)
            if not batched:
                continue
            f.write("-- " + "=" * 44 + "\n")
            f.write(f"-- {SUBJECT_TITLES[subj]} ({len(batched)}题)\n")
            f.write("-- " + "=" * 44 + "\n\n")
            for i in range(0, len(batched), BATCH_SIZE):
                chunk = batched[i:i + BATCH_SIZE]
                f.write(f"INSERT INTO questions ({', '.join(COLUMNS)}) VALUES\n")
                for j, fields in enumerate(chunk):
                    f.write('(' + ', '.join(fields) + ')' + (',' if j < len(chunk) - 1 else ';') + '\n')
                f.write("\n")
    os.replace(tmp, target)
    return counts


def summarize():
    print("\n=== 去重统计 ===")
    for subj in ['math2', 'circuit', 'english2', 'politics']:
        s = stats[subj]
        print(f"  {subj}: 输入{s['total']} -> 去重后{s['total'] - s['dup']} "
              f"(移除{s['dup']}重复, 来源增强{s['enriched']}, 题干过短{s['skipped_short']}, 题型非法{s['skipped_type']})")
    print(f"\n总输入: {sum(s['total'] for s in stats.values())}")
    print(f"总去重后: {len(questions)}")

    subj_counts = Counter(q['subject'] for q in questions)
    print("\n最终各科目题量:")
    for subj, cnt in sorted(subj_counts.items()):
        print(f"  {SUBJECT_NAMES.get(subj, subj)}: {cnt}")

    source_counts = Counter(q['source'] for q in questions)
    print("\n来源分布 (前20):")
    for src, cnt in source_counts.most_common(20):
        print(f"  {src}: {cnt}")
    return subj_counts


def main():
    parser = argparse.ArgumentParser(description='合并各 seed_*.sql 生成完整题库 SQL')
    parser.add_argument('--write', action='store_true', help='覆盖写 seed_all_final.sql（默认只写候选文件 seed_all_final.new.sql）')
    parser.add_argument('--out', default=None, help='指定输出文件路径')
    parser.add_argument('--allow-missing', action='store_true', help='允许必需输入缺失时继续（不得配合 --write 覆盖权威文件）')
    parser.add_argument('--merge-into', default=None, metavar='SQL', help='以该 SQL 文件为基底，只追加其中不存在的题目（基底行原样保留）')
    args = parser.parse_args()

    print("=== 开始解析所有题库文件 ===")
    run_registry()

    for name in missing_required:
        print(f"  !! 必需输入缺失: {name}")
    for name in missing_optional:
        print(f"  -- 可选输入缺失: {name}")
    for alert in parse_alerts:
        print(f"  !! 解析覆盖度告警: {alert}")
    if parse_alerts or missing_required:
        print("\n存在必需输入缺失或解析覆盖度问题，未写出任何文件。")
        sys.exit(1)

    for q in questions:
        q['chapter'] = fix_chapter(q['subject'], q['chapter'], q['question'])

    summarize()

    if dup_log:
        with open(os.path.join(BASE, 'integrate_dedup_report.json'), 'w', encoding='utf-8') as f:
            json.dump(dup_log, f, ensure_ascii=False, indent=1)
        print(f"\n重复合并明细已写入 integrate_dedup_report.json（{len(dup_log)} 条，仅含来源文件/行号/键哈希）")

    if args.merge_into:
        base = base_rows(args.merge_into)
        seen = {key for _, _, key in base}
        rows = [(subject, fields) for subject, fields, _ in base]
        appended = 0
        for q in questions:
            key = dedup_key(q['subject'], q['question'])
            if key in seen:
                continue
            seen.add(key)
            rows.append((q['subject'], dict_fields(q)))
            appended += 1
        print(f"\n并入模式：基底 {len(base)} 行原样保留，本次 {len(questions)} 行中 {len(questions) - appended} 行已在基底内，实际追加 {appended} 行 -> 合计 {len(rows)} 行")
    else:
        rows = [(q['subject'], dict_fields(q)) for q in questions]

    if args.write:
        if missing_optional and not args.merge_into and not args.allow_missing:
            sys.exit('错误：存在可选输入缺失（见上方清单），输出将少于预期。确认请加 --allow-missing')
        target = OUTPUT
        counts = write_rows(target, rows)
    else:
        target = args.out or os.path.join(BASE, 'seed_all_final.new.sql')
        counts = write_rows(target, rows)

    print(f"\n输出文件: {target}")
    print(f"文件大小: {os.path.getsize(target) / 1024 / 1024:.2f} MB")

    prev = Counter()
    if os.path.exists(OUTPUT) and os.path.abspath(target) != os.path.abspath(OUTPUT):
        with open(OUTPUT, 'r', encoding='utf-8-sig') as f:
            for line in f:
                m = re.match(r"\('([a-zA-Z0-9_]+)'", line)
                if m:
                    prev[m.group(1)] += 1
    if prev:
        print("与现有 seed_all_final.sql 的科目差量（新 - 旧）:")
        for subj in sorted(set(prev) | set(counts)):
            print(f"  {SUBJECT_NAMES.get(subj, subj)}: {counts.get(subj, 0)} - {prev.get(subj, 0)} = {counts.get(subj, 0) - prev.get(subj, 0):+d}")


if __name__ == '__main__':
    main()
