const fs = require('fs');
const path = require('path');

const PAT = process.env.SUPABASE_PAT;
if (!PAT) {
  console.error('ERROR: set SUPABASE_PAT environment variable');
  process.exit(1);
}
const APPLY = process.argv.includes('--apply');
const URL = 'https://api.supabase.com/v1/projects/tszojqkktvyjzcgsyenn/database/query';
const HEADERS = { Authorization: `Bearer ${PAT}`, 'Content-Type': 'application/json' };

const MAP_FILE = path.join(__dirname, 'chapter_migration_map.json');
const { migrationMap } = JSON.parse(fs.readFileSync(MAP_FILE, 'utf8'));

async function query(sql) {
  const res = await fetch(URL, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({ query: sql })
  });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch (e) { data = null; }
  if (!res.ok && res.status !== 201) {
    throw new Error(`HTTP ${res.status}: ${text.slice(0, 300)}`);
  }
  return data;
}

const esc = (s) => s.replace(/'/g, "''");

function classifyMath(q) {
  const t = q.question || '';
  if (q.chapter === '线性代数') {
    if (/特征值|特征向量|对角化|相似/.test(t)) return '第5章 特征值与特征向量';
    if (/二次型|正定|负定/.test(t)) return '第6章 二次型';
    if (/向量|线性相关|线性无关|极大线性无关/.test(t)) return '第3章 向量';
    if (/方程组|非零解|基础解系|无解|唯一解|无穷多解/.test(t)) return '第4章 线性方程组';
    if (/行列式/.test(t)) return '第1章 行列式';
    if (/矩阵|逆|初等|伴随|秩/.test(t)) return '第2章 矩阵';
    return '综合';
  }
  if (/二重积分|∬/.test(t)) return '第5章 二重积分';
  if (/微分方程|通解|特解|初始条件/.test(t)) return '第6章 常微分方程';
  if (/偏导|全微分|多元|梯度|方向导数/.test(t)) return '第4章 多元函数微分学';
  if (/积分|∫|面积|旋转体|弧长/.test(t)) return '第3章 一元函数积分学';
  if (/导数|微分|dy|dx|f'|f''|切线|中值定理|罗尔|极值|单调|拐点|渐近线|可导|最大值|最小值|实根/.test(t)) return '第2章 一元函数微分学';
  if (/极限|lim|无穷小|间断点|连续|奇偶|x→|n→/.test(t)) return '第1章 函数、极限、连续';
  return '第7章 综合应用';
}

async function main() {
  console.log('MODE=' + (APPLY ? 'APPLY' : 'DRY-RUN'));

  const check = await query('SELECT count(*)::int AS n FROM questions');
  console.log('DB_TOTAL=' + (check && check[0] ? check[0].n : '?'));

  console.log('\n--- STEP 1: politics exact-match updates (' + migrationMap.politics.length + ') ---');
  for (const m of migrationMap.politics) {
    if (m.old === m.new) continue;
    const sql = `UPDATE questions SET chapter = '${esc(m.new)}' WHERE subject = 'politics' AND chapter = '${esc(m.old)}'`;
    if (APPLY) {
      await query(sql);
      console.log(`OK [${m.count}] "${m.old}" -> "${m.new}"`);
    } else {
      console.log(`PLAN [${m.count}] "${m.old}" -> "${m.new}"`);
    }
  }

  console.log('\n--- STEP 2: circuit merges (' + migrationMap.circuit.length + ') ---');
  for (const m of migrationMap.circuit) {
    const sql = `UPDATE questions SET chapter = '${esc(m.new)}' WHERE subject = 'circuit' AND chapter = '${esc(m.old)}'`;
    if (APPLY) {
      await query(sql);
      console.log(`OK [${m.count}] "${m.old}" -> "${m.new}"`);
    } else {
      console.log(`PLAN [${m.count}] "${m.old}" -> "${m.new}"`);
    }
  }

  console.log('\n--- STEP 3: english2 renames (' + migrationMap.english2.length + ') ---');
  for (const m of migrationMap.english2) {
    const sql = `UPDATE questions SET chapter = '${esc(m.new)}' WHERE subject = 'english2' AND chapter = '${esc(m.old)}'`;
    if (APPLY) {
      await query(sql);
      console.log(`OK [${m.count}] "${m.old}" -> "${m.new}"`);
    } else {
      console.log(`PLAN [${m.count}] "${m.old}" -> "${m.new}"`);
    }
  }

  console.log('\n--- STEP 4: math2 keyword classification ---');
  const mathRows = await query("SELECT id, question, chapter FROM questions WHERE subject = 'math2' ORDER BY id");
  console.log('MATH2_ROWS=' + (Array.isArray(mathRows) ? mathRows.length : 'ERR'));
  if (!Array.isArray(mathRows)) { console.error(mathRows); process.exit(1); }
  const groups = new Map();
  const samples = new Map();
  for (const r of mathRows) {
    const target = classifyMath(r);
    if (!groups.has(target)) { groups.set(target, []); samples.set(target, []); }
    groups.get(target).push(r.id);
    if (samples.get(target).length < 3) samples.get(target).push((r.question || '').slice(0, 60));
  }
  for (const [ch, ids] of [...groups.entries()].sort()) {
    console.log(`  ${ch}: ${ids.length} 题  样例: ${samples.get(ch)[0] || ''}`);
  }
  if (APPLY) {
    for (const [ch, ids] of groups) {
      for (let i = 0; i < ids.length; i += 400) {
        const batch = ids.slice(i, i + 400);
        await query(`UPDATE questions SET chapter = '${esc(ch)}' WHERE id IN (${batch.join(',')})`);
      }
      console.log(`APPLIED ${ch}: ${ids.length}`);
    }
  }

  console.log('\n--- FINAL DISTRIBUTION ---');
  const dist = await query('SELECT subject, chapter, count(*)::int AS n FROM questions GROUP BY subject, chapter ORDER BY subject, chapter');
  if (Array.isArray(dist)) {
    for (const d of dist) console.log(`${d.subject} | ${d.chapter} | ${d.n}`);
  } else {
    console.log(JSON.stringify(dist));
  }
  console.log('\nDONE=' + (APPLY ? 'APPLIED' : 'DRY-RUN'));
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
