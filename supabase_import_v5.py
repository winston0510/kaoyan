#!/usr/bin/env python3
"""Supabase Import v5 - 幂等增量导入 / 校验 / 全量重导

用法：
  1. PAT 取环境变量 SUPABASE_PAT；未设置时读仓库外 ../.local/supabase_pat.txt
  2. 可选：SUPABASE_PROJECT_REF（默认 tszojqkktvyjzcgsyenn）
  3. 只校验不动库（默认）：       python supabase_import_v5.py
  4. 一次性迁移（加列+回填+唯一索引）：python supabase_import_v5.py --migrate
  5. 增量导入（只插新题，保留既有 id）：python supabase_import_v5.py --incremental
  6. 全量重导（清空 questions，连带重置进度关联）：python supabase_import_v5.py --truncate --yes
"""
import argparse
import os
import re
import sys
import time
from collections import Counter

import requests

import qkey

DEFAULT_REF = 'tszojqkktvyjzcgsyenn'
HERE = os.path.dirname(os.path.abspath(__file__))
SQL_FILE = os.path.join(HERE, 'seed_all_final.sql')
DDL_FILE = os.path.join(HERE, 'ddl_dedup_key.sql')
INDEX_SQL = 'CREATE UNIQUE INDEX IF NOT EXISTS idx_questions_dedup_key ON questions(dedup_key)'
KEY_PAGE = 500
PRECHECK_BATCH = 800


def load_pat():
    pat = os.environ.get('SUPABASE_PAT')
    if pat:
        return pat.strip()
    for path in (os.path.join(HERE, '..', '.local', 'supabase_pat.txt'),
                 os.path.join(os.path.dirname(HERE), '.local', 'supabase_pat.txt')):
        if os.path.exists(path):
            with open(path, 'r', encoding='utf-8-sig') as f:
                for line in f:
                    if line.strip():
                        return line.strip()
    return None


PAT = load_pat()
PROJECT_REF = os.environ.get('SUPABASE_PROJECT_REF', DEFAULT_REF)
MGMT_URL = f'https://api.supabase.com/v1/projects/{PROJECT_REF}/database/query'
HEADERS = {'Authorization': f'Bearer {PAT}', 'Content-Type': 'application/json'} if PAT else {}


def db_query(sql, retries=0, retry_delay=2):
    attempt = 0
    while True:
        attempt += 1
        try:
            r = requests.post(MGMT_URL, headers=HEADERS, json={'query': sql}, timeout=90)
            if r.status_code in (200, 201):
                return r
            print(f"\n  ERROR [{r.status_code}]: {r.text[:500]}")
            return None
        except requests.exceptions.RequestException as e:
            if attempt > retries:
                print(f"\n  NETWORK ERROR: {type(e).__name__}: {e}")
                return None
            print(f"\n  RETRY {attempt}/{retries} after {type(e).__name__}, waiting {retry_delay}s...")
            time.sleep(retry_delay)


def read_rows(sql, retries=2):
    r = db_query(sql, retries=retries)
    if r is None:
        return None
    try:
        data = r.json()
    except ValueError:
        return None
    return data if isinstance(data, list) else None


def read_scalar(sql, retries=2):
    rows = read_rows(sql, retries=retries)
    if not rows:
        return None
    return list(rows[0].values())[0]


def split_insert_blocks(sql_content):
    insert_pattern = re.compile(r"INSERT INTO questions\s*\(", re.IGNORECASE)
    insert_starts = [m.start() for m in insert_pattern.finditer(sql_content)]

    blocks = []
    for idx, start in enumerate(insert_starts):
        search_end = insert_starts[idx + 1] if idx + 1 < len(insert_starts) else len(sql_content)

        i = start
        depth = 0
        in_string = False
        found = False

        while i < search_end:
            ch = sql_content[i]

            if in_string:
                if ch == "'":
                    if i + 1 < len(sql_content) and sql_content[i + 1] == "'":
                        i += 1
                    else:
                        in_string = False
            else:
                if ch == "'":
                    in_string = True
                elif ch == '(':
                    depth += 1
                elif ch == ')':
                    depth -= 1
                    if depth == 0:
                        j = i + 1
                        while j < len(sql_content) and sql_content[j] in ' \t\n\r':
                            j += 1
                        if j < len(sql_content) and sql_content[j] == ';':
                            blocks.append(sql_content[start:j + 1])
                            found = True
                            break
                elif ch == ';':
                    blocks.append(sql_content[start:i + 1])
                    found = True
                    break

            i += 1

        if not found:
            block = sql_content[start:search_end].strip()
            if block:
                blocks.append(block)

    return blocks


def count_rows(insert_stmt):
    values_idx = insert_stmt.upper().find('VALUES')
    if values_idx == -1:
        return 0
    body = insert_stmt[values_idx + len('VALUES'):]
    tuples = 0
    depth = 0
    in_string = False
    i = 0
    n = len(body)
    while i < n:
        ch = body[i]
        if in_string:
            if ch == "'":
                if i + 1 < n and body[i + 1] == "'":
                    i += 2
                    continue
                in_string = False
        elif ch == "'":
            in_string = True
        elif ch == '(':
            depth += 1
            if depth == 1:
                tuples += 1
        elif ch == ')':
            depth -= 1
        i += 1
    return tuples


def block_fields(insert_stmt):
    values_idx = insert_stmt.upper().find('VALUES')
    cols = re.search(r'\(([^)]*)\)', insert_stmt[:values_idx])
    if not cols:
        return []
    return [c.strip() for c in cols.group(1).split(',') if c.strip()]


def validate_file(path):
    print('\n[1] Reading SQL file...')
    if not os.path.exists(path):
        sys.exit(f'文件不存在: {path}')
    with open(path, 'r', encoding='utf-8-sig') as f:
        content = f.read()
    print(f'  File: {path}')
    print(f'  Size: {len(content):,} chars')

    print('\n[2] Splitting INSERT blocks (parenthesis depth + string tracking)...')
    blocks = split_insert_blocks(content)
    if not blocks:
        sys.exit('未发现任何 INSERT INTO questions 块，终止')
    row_counts = [count_rows(b) for b in blocks]
    total = sum(row_counts)
    print(f'  Found {len(blocks)} INSERT blocks')
    print(f'  Total rows across all blocks: {total}')
    print(f'  Row counts: min={min(row_counts)}, max={max(row_counts)}, avg={total / len(row_counts):.1f}')

    if [i + 1 for i, c in enumerate(row_counts) if c == 0]:
        print('  !! 存在空 INSERT 块（坏 SQL），终止')
        sys.exit(1)

    col_sets = {tuple(block_fields(b)) for b in blocks}
    if len(col_sets) > 1:
        print('  !! 各块字段清单不一致:')
        for cs in col_sets:
            print('     ', len(cs), cs)
        sys.exit(1)
    cols = list(col_sets.pop())
    print(f'  Columns ({len(cols)}): {", ".join(cols)}')

    subjects = Counter()
    for b in blocks:
        m = re.search(r"\('([a-zA-Z0-9_]+)'", b)
        if m:
            subjects[m.group(1)] += count_rows(b)
    print(f'  By subject: {dict(subjects)}')
    return content, cols, total


def seed_statements(content):
    stmts = []
    for columns, tuples in qkey.iter_statements(content):
        prepared = []
        for fields in tuples:
            subject, question = qkey.row_subject_question(columns, fields)
            if subject is None:
                raise SystemExit('seed 文件缺少 subject/question 列，无法计算 dedup_key')
            row = list(fields)
            if 'dedup_key' not in columns:
                row.append(f"'{qkey.dedup_key(subject, question)}'")
            prepared.append(row)
        cols = list(columns) + ([] if 'dedup_key' in columns else ['dedup_key'])
        stmts.append((cols, prepared))
    return stmts


def dedup_column_state():
    rows = read_rows("SELECT 1 AS x FROM information_schema.columns WHERE table_name='questions' AND column_name='dedup_key'")
    if rows is None:
        return 'unknown'
    return 'yes' if rows else 'no'


def require_dedup_column():
    state = dedup_column_state()
    if state == 'unknown':
        sys.exit('无法确认 questions.dedup_key 状态（数据库查询失败），请检查网络或 PAT 后重试')
    if state == 'no':
        sys.exit('questions.dedup_key 不存在，请先执行：python supabase_import_v5.py --migrate')


def migrate():
    print('\n[M1] 执行 ddl_dedup_key.sql（加列，幂等）...')
    with open(DDL_FILE, 'r', encoding='utf-8-sig') as f:
        ddl = f.read()
    if db_query(ddl) is None:
        sys.exit('  加列失败')

    print('\n[M2] 回填 dedup_key...')
    assigned = set()
    existing = read_rows('SELECT dedup_key FROM questions WHERE dedup_key IS NOT NULL')
    if existing is None:
        sys.exit('  无法读取现有 dedup_key，终止')
    for row in existing:
        if row.get('dedup_key'):
            assigned.add(row['dedup_key'])
    print(f'  已存在 key: {len(assigned)}')

    total_keyed = 0
    total_aliased = 0
    while True:
        rows = read_rows(
            'SELECT id, subject, question FROM questions WHERE dedup_key IS NULL ORDER BY id LIMIT ' + str(KEY_PAGE))
        if rows is None:
            sys.exit('  读取未回填行失败，终止')
        if not rows:
            break
        updates = []
        for row in rows:
            key = qkey.dedup_key(row['subject'], row['question'])
            if key in assigned:
                key = f"{key}#{row['id']}"
                total_aliased += 1
            assigned.add(key)
            updates.append((row['id'], key))
        values = ', '.join(f"({i}::bigint, '{k}')" for i, k in updates)
        sql = f'UPDATE questions AS t SET dedup_key = v.k FROM (VALUES {values}) AS v(id, k) WHERE t.id = v.id'
        if db_query(sql) is None:
            sys.exit('  回填 UPDATE 失败，终止（可重跑 --migrate，脚本幂等）')
        total_keyed += len(updates)
        print(f'  已回填 {total_keyed} 行（碰撞改名 {total_aliased}）', end='\r')
    print()

    left = read_scalar('SELECT COUNT(*) FROM questions WHERE dedup_key IS NULL')
    if left:
        print(f'  !! 仍有 {left} 行无 dedup_key，唯一索引不会包含它们')
    dups = read_scalar(
        'SELECT COUNT(*) FROM (SELECT dedup_key, COUNT(*) c FROM questions WHERE dedup_key IS NOT NULL GROUP BY dedup_key HAVING COUNT(*) > 1) d')
    print(f'  库内重复 key 组: {dups}')

    print('\n[M3] 创建唯一索引...')
    if db_query(INDEX_SQL) is None:
        sys.exit('  唯一索引创建失败：请先查看上方重复 key 组数并处理')
    print('  idx_questions_dedup_key 就绪')
    print(f'\n迁移完成：回填 {total_keyed} 行，改名 {total_aliased} 行')


def precheck(stmts):
    keys = []
    for cols, rows in stmts:
        idx = cols.index('dedup_key')
        for fields in rows:
            keys.append(fields[idx].strip("'"))
    present = set()
    for i in range(0, len(keys), PRECHECK_BATCH):
        chunk = keys[i:i + PRECHECK_BATCH]
        rows = read_rows('SELECT dedup_key FROM questions WHERE dedup_key IN (' + ', '.join(f"'{k}'" for k in chunk) + ')')
        if rows is None:
            print('  预检查询失败，跳过预检')
            return
        for row in rows:
            if row.get('dedup_key'):
                present.add(row['dedup_key'])
    uniq = set(keys)
    print(f'\n  预检：seed 共 {len(keys)} 行 / {len(uniq)} 个唯一 key；线上已存在 {len(uniq & present)} 个，'
          f'预计新增 {len(uniq - present)} 行（seed 内部重复合并 {len(keys) - len(uniq)} 行）')


def incremental(content, total, keep_going):
    require_dedup_column()
    stmts = seed_statements(content)
    parsed = sum(len(rows) for _, rows in stmts)
    if parsed != total:
        print(f'  !! 元组级解析得到 {parsed} 行，与块级计数 {total} 不符，终止')
        sys.exit(1)

    before = read_scalar('SELECT COUNT(*) FROM questions')
    print(f'\n[3] 增量导入 {len(stmts)} 块 / {parsed} 行（线上现有 {before} 行）...')
    inserted = 0
    failed = 0
    aborted = False
    for i, (sc, rows) in enumerate(stmts):
        sql = qkey.render_statement(sc, rows, 'ON CONFLICT (dedup_key) DO NOTHING RETURNING id')
        res = read_rows(sql, retries=3)
        if res is None:
            failed += 1
            print(f'  Block {i + 1}/{len(stmts)}... FAILED')
            with open(os.path.join(HERE, f'failed_block_{i + 1}.sql'), 'w', encoding='utf-8') as f:
                f.write(sql)
            if not keep_going:
                aborted = True
                print('  已中止（失败块已落盘 failed_block_*.sql）。增量模式可安全重跑，已插入的行不会重复。')
                break
        else:
            inserted += len(res)
            print(f'  Block {i + 1}/{len(stmts)}... +{len(res)}', end='\r')
        if (i + 1) % 10 == 0:
            time.sleep(0.3)
    print()

    after = read_scalar('SELECT COUNT(*) FROM questions')
    expected = int(before) + inserted
    print(f'\n[4] 结果：新增 {inserted}，跳过（已存在）{parsed - inserted - failed}，失败块 {failed}')
    print(f'  线上总数：{after}（预期 {expected}）')
    r = read_rows('SELECT subject, COUNT(*) as cnt FROM questions GROUP BY subject ORDER BY cnt DESC')
    if r:
        for row in r:
            print(f"  {row['subject']}: {row['cnt']}")
    if aborted or failed:
        sys.exit(1)
    if after is None or int(after) != expected:
        print('  !! 线上总数与预期不符，请核验')
        sys.exit(1)
    print('  增量导入校验通过')


def full_reimport(blocks, row_counts, total, sleep_every, keep_going):
    print('\n[3] Truncating table...')
    if db_query('TRUNCATE TABLE questions CASCADE') is None:
        print('  清空失败，终止（数据库未被改动）')
        sys.exit(1)
    print('  Table truncated successfully')

    print(f'\n[4] Executing {len(blocks)} INSERT blocks...')
    success = 0
    failed = 0
    aborted = False
    for i, block in enumerate(blocks):
        print(f'  Block {i + 1}/{len(blocks)} ({row_counts[i]} rows)...', end=' ', flush=True)
        if db_query(block) is None:
            failed += 1
            print('FAILED')
            with open(os.path.join(HERE, f'failed_block_{i + 1}.sql'), 'w', encoding='utf-8') as f:
                f.write(block)
            if not keep_going:
                aborted = True
                print('  已中止：线上题库处于部分导入状态，请修复后重跑全量')
                break
        else:
            success += 1
            print('OK')
        if sleep_every and i % sleep_every == sleep_every - 1:
            time.sleep(0.5)

    print(f'\n  Result: OK={success}, Failed={failed}, Rows={total}')
    db_total = read_scalar('SELECT COUNT(*) FROM questions')
    if db_total is None:
        print('  无法读取线上总数，请手动核验')
        sys.exit(1)
    print(f'\n[5] 线上总数: {db_total} / 预期 {total}')
    r = read_rows('SELECT subject, COUNT(*) as cnt FROM questions GROUP BY subject ORDER BY cnt DESC')
    if r:
        for row in r:
            print(f"  {row['subject']}: {row['cnt']}")
    r = read_rows('SELECT source, COUNT(*) as cnt FROM questions GROUP BY source ORDER BY cnt DESC')
    if r:
        print('\n  By source:')
        for row in r:
            print(f"    {row['source']}: {row['cnt']}")
    if aborted or failed or int(db_total) != int(total):
        sys.exit(1)
    print('\n  校验通过')


def main():
    parser = argparse.ArgumentParser(description='导入 seed_all_final.sql 到 Supabase')
    parser.add_argument('--sql-file', default=SQL_FILE)
    parser.add_argument('--migrate', action='store_true', help='一次性：加 dedup_key 列 + 回填 + 唯一索引')
    parser.add_argument('--incremental', action='store_true', help='增量导入：只插新题，保留既有 questions.id 与进度关联')
    parser.add_argument('--truncate', action='store_true', help='全量重导：清空 questions（连带清空答题记录/错题本/收藏镜像）')
    parser.add_argument('--yes', action='store_true', help='确认执行破坏性操作')
    parser.add_argument('--keep-going', action='store_true', help='某块失败后继续（默认立即中止）')
    parser.add_argument('--sleep-every', type=int, default=10)
    args = parser.parse_args()

    print('=' * 60)
    print('Supabase Import v5')
    print('=' * 60)

    if not PAT:
        sys.exit('错误：未找到 PAT。请设置环境变量 SUPABASE_PAT，或写入 ../.local/supabase_pat.txt')

    content, cols, total = validate_file(args.sql_file)
    if sum(1 for m in (args.migrate, args.incremental, args.truncate) if m) > 1:
        sys.exit('错误：--migrate / --incremental / --truncate 互斥，只能指定一个')

    if args.migrate:
        migrate()
        return

    if args.incremental:
        incremental(content, total, args.keep_going)
        return

    if args.truncate:
        if not args.yes:
            sys.exit('错误：--truncate 会清空 questions 并连带清空 quiz_records/wrong_book/favorites 镜像，'
                     '且重导后 id 全部重分配使既有进度关联失效。确认请加 --yes')
        blocks = split_insert_blocks(content)
        full_reimport(blocks, [count_rows(b) for b in blocks], total, args.sleep_every, args.keep_going)
        return

    print('\n[3] DRY RUN：仅校验，未写库。')
    print(f'  解析一致，共 {total} 题。')
    state = dedup_column_state()
    if state == 'yes':
        precheck(seed_statements(content))
        print('  执行增量导入：python supabase_import_v5.py --incremental')
    elif state == 'no':
        print('  尚未迁移 dedup_key 列：python supabase_import_v5.py --migrate')
    else:
        print('  未能连库确认 dedup_key 列状态（网络或 PAT 问题），以上仅为本地校验')
    print('  全量重导（破坏性）：python supabase_import_v5.py --truncate --yes')


if __name__ == '__main__':
    main()
