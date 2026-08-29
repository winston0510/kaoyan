import os

BASE = os.path.dirname(os.path.abspath(__file__))
seed_all = os.path.join(BASE, 'seed_all.sql')
new_politics = os.path.join(BASE, 'seed_politics_new.sql')
output = os.path.join(BASE, 'seed_all_updated.sql')

with open(seed_all, 'r', encoding='utf-8') as f:
    lines = f.readlines()

with open(new_politics, 'r', encoding='utf-8') as f:
    politics_lines = f.readlines()

merged = []
politics_count = 0
other_count = 0
schema_count = 0

for line in lines:
    stripped = line.strip()
    if stripped.startswith('--') or stripped.startswith('CREATE') or stripped.startswith('ALTER') or stripped.startswith('CREATE POLICY') or stripped == '':
        merged.append(line)
        if 'CREATE' in stripped or 'ALTER' in stripped:
            schema_count += 1
        continue
    if stripped.startswith('INSERT INTO questions'):
        if "'politics'" in stripped:
            politics_count += 1
            continue
        else:
            other_count += 1
            merged.append(line)
    else:
        merged.append(line)

merged.append('\n')
merged.append('-- ============================================\n')
merged.append('-- 政治题库（多源整合版，5320题）\n')
merged.append('-- 来源: 肖秀荣1000题(2021/2022) + 徐涛优题 + 毛概 + 马原 + 学习强国\n')
merged.append('-- ============================================\n\n')
for line in politics_lines:
    if line.strip().startswith('INSERT INTO questions'):
        merged.append(line)

with open(output, 'w', encoding='utf-8') as f:
    f.writelines(merged)

total = other_count + 5320
print(f"原seed_all.sql中:")
print(f"  非政治题目: {other_count}")
print(f"  旧政治题目(已移除): {politics_count}")
print(f"\n新政治题目: 5320")
print(f"合并后总题量: {total}")
print(f"输出文件: {output}")
print(f"文件大小: {os.path.getsize(output) / 1024 / 1024:.2f} MB")
