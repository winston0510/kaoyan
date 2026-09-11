"""题目身份与 seed SQL 解析的单一来源。

dedup_key = sha1(subject + '|' + normalize(question))，用于 questions.dedup_key 唯一列，
使题库可以增量导入（只插新行、不重分配已有 id），导入重试也因此幂等。
"""
import hashlib
import re

INSERT_HEADER_RE = re.compile(r"INSERT\s+INTO\s+questions\s*\(([^)]*)\)\s*VALUES", re.IGNORECASE)


def normalize_question(q):
    q = re.sub(r'<[^>]+>', '', q or '')
    q = re.sub(r'\s+', '', q)
    q = re.sub(r'[，。、？！（）；：“”‘’【】《》〈〉「」『』()（）]', '', q)
    return q.lower()


def dedup_key(subject, question):
    raw = f'{subject}|{normalize_question(question)}'
    return hashlib.sha1(raw.encode('utf-8')).hexdigest()


def decode_field(raw):
    s = raw.strip()
    if s.startswith("'") and s.endswith("'") and len(s) >= 2:
        return s[1:-1].replace("''", "'")
    if s.upper() == 'NULL':
        return ''
    return s


def _scan_tuple(text, start):
    """从 '(' 开始扫描一个元组，返回 (fields, end_index_after_closing_paren) 或 (None, start)。"""
    i = start + 1
    n = len(text)
    fields = []
    buf = []
    in_string = False
    while i < n:
        ch = text[i]
        if in_string:
            if ch == "'":
                if i + 1 < n and text[i + 1] == "'":
                    buf.append("''")
                    i += 2
                    continue
                in_string = False
            buf.append(ch)
            i += 1
            continue
        if ch == "'":
            in_string = True
            buf.append(ch)
            i += 1
            continue
        if ch == ',':
            fields.append(''.join(buf).strip())
            buf = []
            i += 1
            continue
        if ch == ')':
            fields.append(''.join(buf).strip())
            return fields, i + 1
        buf.append(ch)
        i += 1
    return None, start


def iter_statements(content):
    """yield (columns, [tuple_field_lists])，字段保持原始 SQL 文本以便原样回写。"""
    for m in INSERT_HEADER_RE.finditer(content):
        columns = [c.strip() for c in m.group(1).split(',') if c.strip()]
        i = m.end()
        tuples = []
        while i < len(content):
            ch = content[i]
            if ch in ' \t\n\r,':
                i += 1
                continue
            if ch != '(':
                break
            fields, end = _scan_tuple(content, i)
            if fields is None:
                break
            tuples.append(fields)
            i = end
            while i < len(content) and content[i] in ' \t\n\r':
                i += 1
            if i < len(content) and content[i] == ';':
                i += 1
                break
        if tuples:
            yield columns, tuples


def render_statement(columns, tuples, suffix=''):
    head = f"INSERT INTO questions ({', '.join(columns)}) VALUES\n"
    bodies = ['(' + ', '.join(fields) + ')' for fields in tuples]
    tail = f" {suffix}" if suffix else ''
    return head + ',\n'.join(bodies) + tail + ';\n'


def count_rows(content):
    return sum(len(t) for _, t in iter_statements(content))


def row_subject_question(columns, fields):
    try:
        subject_idx = columns.index('subject')
        question_idx = columns.index('question')
    except ValueError:
        return None, None
    if max(subject_idx, question_idx) >= len(fields):
        return None, None
    return decode_field(fields[subject_idx]), decode_field(fields[question_idx])
