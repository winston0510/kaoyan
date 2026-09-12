"""历史脚本：把 seed_politics_new.sql 并入 seed_all.sql（替换旧政治题）。

现行权威整合入口是 integrate_all.py，本脚本仅保留作对照；输出改名以免与已归档的
seed_all_updated.sql 混淆。
"""
import os
import re

BASE = os.path.dirname(os.path.abspath(__file__))
SEED_ALL = os.path.join(BASE, 'seed_all.sql')
NEW_POLITICS = os.path.join(BASE, 'seed_politics_new.sql')
OUTPUT = os.path.join(BASE, 'seed_all_merged.sql')

HEADER_RE = re.compile(r'^\s*INSERT INTO\s+questions', re.IGNORECASE)
TUPLE_RE = re.compile(r"^\s*\('([a-zA-Z0-9_]+)'")
TUPLE_END_RE = re.compile(r"\)\s*;\s*$")


def read_lines(path):
    with open(path, 'r', encoding='utf-8-sig') as f:
        return f.readlines()


def split_statements(lines, fname):
    """返回 [(header_line, [(prefix_lines, tuple_line)])]；非 INSERT 行以 header=None 原样透传。

    块内的 -- 注释行与其后的元组绑定，过滤题目时一起保留或一起丢弃。
    """
    stmts = []
    header = None
    entries = []
    pending = []
    for line in lines:
        if HEADER_RE.match(line):
            if header is not None:
                stmts.append((header, entries))
            header, entries, pending = line, [], []
            continue
        if header is None:
            stmts.append((None, [line]))
            continue
        if line.strip() == '':
            continue
        if line.lstrip().startswith('--'):
            pending.append(line)
            continue
        if not TUPLE_RE.match(line):
            raise SystemExit(f'{fname}: 块内出现无法归位的行（疑似跨行元组）: {line[:24]!r}')
        entries.append((pending, line))
        pending = []
        if TUPLE_END_RE.search(line.rstrip()):
            stmts.append((header, entries))
            header, entries, pending = None, [], []
    if header is not None:
        stmts.append((header, entries))
    return stmts


def emit_block(header, entries, out):
    if not entries:
        return
    out.append(header)
    last = len(entries) - 1
    for i, (prefix, tup) in enumerate(entries):
        out.extend(prefix)
        stripped = re.sub(r"\)\s*[;,]?\s*$", ')', tup.rstrip('\n'))
        out.append(stripped + (',\n' if i < last else ';\n'))


def tuple_subject(line):
    m = TUPLE_RE.match(line)
    return m.group(1) if m else None


def main():
    for path in (SEED_ALL, NEW_POLITICS):
        if not os.path.exists(path):
            raise SystemExit(f'输入文件不存在: {path}')

    base_lines = read_lines(SEED_ALL)
    politics_lines = read_lines(NEW_POLITICS)

    out = []
    kept_other = 0
    dropped_politics = 0
    for header, entries in split_statements(base_lines, os.path.basename(SEED_ALL)):
        if header is None:
            out.extend(entries)
            continue
        kept = [e for e in entries if tuple_subject(e[1]) != 'politics']
        dropped_politics += len(entries) - len(kept)
        kept_other += len(kept)
        emit_block(header, kept, out)

    new_politics = 0
    for header, entries in split_statements(politics_lines, os.path.basename(NEW_POLITICS)):
        if header is None:
            continue
        kept = [e for e in entries if tuple_subject(e[1]) == 'politics']
        new_politics += len(kept)
        emit_block(header, kept, out)

    if new_politics == 0:
        raise SystemExit('新政治题库未解析到任何元组，未写出文件')

    with open(OUTPUT, 'w', encoding='utf-8') as f:
        f.writelines(out)

    print('原 seed_all.sql:')
    print(f'  非政治题目: {kept_other}')
    print(f'  旧政治题目(已移除): {dropped_politics}')
    print(f'新政治题目: {new_politics}')
    print(f'合并后总题量: {kept_other + new_politics}')
    print(f'输出文件: {OUTPUT}')
    print(f'文件大小: {os.path.getsize(OUTPUT) / 1024 / 1024:.2f} MB')


if __name__ == '__main__':
    main()
