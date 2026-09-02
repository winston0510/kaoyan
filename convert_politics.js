const fs = require('fs');
const path = require('path');

const Q = [];
const seen = new Set();
function esc(s) { return String(s).replace(/'/g, "''"); }
function cleanHtml(s) {
  if (!s) return '';
  return String(s)
    .replace(/<[^>]+>/g, '')
    .replace(/&ldquo;/g, '\u201c')
    .replace(/&rdquo;/g, '\u201d')
    .replace(/&lsquo;/g, '\u2018')
    .replace(/&rsquo;/g, '\u2019')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&hellip;/g, '\u2026')
    .replace(/&mdash;/g, '\u2014')
    .replace(/\r\n/g, ' ')
    .replace(/\n/g, ' ')
    .trim();
}
function add(chapter, type, question, options, answer, explanation, difficulty) {
  if (!question || question.length < 5) return;
  if (seen.has(question)) return;
  seen.add(question);
  Q.push({ chapter, type, question, options, answer, explanation, difficulty });
}

function shuffle(arr) {
  let c = [...arr];
  for (let i = c.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [c[i], c[j]] = [c[j], c[i]];
  }
  return c;
}

// ====== Source 1: kyzz JSON (real exam 2010-2024) ======
function parseKyzz() {
  const dir = path.join(__dirname, '..', 'kyzz_json');
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
  for (let file of files) {
    try {
      let data = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
      if (!data.detail || !data.detail.timu) continue;
      let timu = data.detail.timu;
      for (let t of timu) {
        let title = cleanHtml(t.title);
        let type = t.type === '单选' ? 'single' : 'multiple';
        let opts = [];
        if (t.xuan_text) {
          let parts = t.xuan_text.split('|');
          for (let p of parts) {
            if (p.trim()) opts.push(p.trim());
          }
        } else if (t.xuanxiang) {
          let xObj = typeof t.xuanxiang === 'string' ? JSON.parse(t.xuanxiang) : t.xuanxiang;
          for (let k of ['A','B','C','D','E']) {
            if (xObj[k]) {
              let val = typeof xObj[k] === 'string' ? xObj[k] : xObj[k];
              opts.push(val);
            }
          }
        }
        if (opts.length < 4) continue;
        opts = opts.slice(0, 4);
        let formatted = opts.map((o, i) => `${'ABCDE'[i]}. ${o.replace(/^[A-E]\.\s*/, '')}`);
        let answer = t.right_text || '';
        let jiexi = cleanHtml(t.jiexi || '');
        let chapter = t.top_kaodian_text || '考研政治综合';
        let diff = 2;
        if (t.right_num && t.total_num) {
          let rate = t.right_num / t.total_num;
          diff = rate > 0.7 ? 1 : rate > 0.4 ? 2 : 3;
        }
        add(chapter, type, title, JSON.stringify(formatted), answer, jiexi, diff);
      }
    } catch(e) { /* skip */ }
  }
}

// ====== Source 2: Brush JSON ======
function parseBrush(filename, chapterName, limit) {
  const filepath = path.join(__dirname, '..', 'brush_data', filename);
  if (!fs.existsSync(filepath)) return;
  try {
    let data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
    let allProblems = [];
    if (data.sections) {
      for (let s of data.sections) {
        if (s.problems) allProblems.push(...s.problems);
      }
    }
    // Sample if needed
    if (limit && allProblems.length > limit) {
      allProblems = shuffle(allProblems).slice(0, limit);
    }
    for (let p of allProblems) {
      let title = cleanHtml(p.title);
      let type = p.type.includes('多选') ? 'multiple' : 'single';
      let opts = (p.options || []).map(o => cleanHtml(o));
      if (opts.length < 4) continue;
      opts = opts.slice(0, 4);
      let formatted = opts.map((o, i) => `${'ABCD'[i]}. ${o.replace(/^[A-D]\.\s*/, '')}`);
      let answer = p.key || '';
      if (answer.length > 1) type = 'multiple';
      add(chapterName, type, title, JSON.stringify(formatted), answer, '', 2);
    }
  } catch(e) { /* skip */ }
}

// ====== Source 3: maogai_all.json ======
function parseMaogai() {
  const filepath = path.join(__dirname, '..', 'maogai_all.json');
  if (!fs.existsSync(filepath)) return;
  try {
    let data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
    if (!Array.isArray(data)) return;
    for (let q of data) {
      let title = cleanHtml(q.question);
      let type = q.type === 'single' ? 'single' : 'multiple';
      let opts = (q.options || []).map(o => cleanHtml(o));
      if (opts.length < 4) continue;
      opts = opts.slice(0, 4);
      let formatted = opts.map((o, i) => `${'ABCD'[i]}. ${o.replace(/^[A-D]\.\s*/, '')}`);
      let answer = q.type === 'single' ? 'ABCD'[q.answer - 1] : 'ABCD'[q.answer - 1];
      add('毛泽东思想和中国特色社会主义理论体系概论', type, title, JSON.stringify(formatted), answer, '', 2);
    }
  } catch(e) { /* skip */ }
}

// ====== Run all ======
parseKyzz(); // 495 real exam questions
parseBrush('Marxism.json', '马克思主义基本原理', 200);
parseBrush('Marxism2.json', '马克思主义基本原理', 200);
parseBrush('history.json', '中国近现代史纲要', 200);
parseBrush('mao_thought.json', '毛泽东思想和中国特色社会主义理论体系概论', 150);
parseBrush('xi_thought.json', '习近平新时代中国特色社会主义思想概论', 200);
parseBrush('yjdhp.json', '思想道德与法治', 100);
parseBrush('military.json', '军事理论', 50);
parseMaogai(); // 187 questions

// ====== Generate SQL ======
function genSql() {
  let sql = '-- ' + '='.repeat(44) + '\n';
  sql += '-- 考研政治题库 (真题+练习, 1000+题)\n';
  sql += '-- 来源: 历年真题(2010-2024) + 开源题库\n';
  sql += '-- ' + '='.repeat(44) + '\n\n';
  let batchSize = 15;
  for (let i = 0; i < Q.length; i += batchSize) {
    let batch = Q.slice(i, i + batchSize);
    sql += 'INSERT INTO questions (subject, chapter, type, question, options, answer, explanation, difficulty) VALUES\n';
    for (let j = 0; j < batch.length; j++) {
      let q = batch[j];
      sql += `('politics', '${esc(q.chapter)}', '${q.type}', '${esc(q.question)}', '${esc(q.options)}', '${esc(q.answer)}', '${esc(q.explanation)}', ${q.difficulty})`;
      sql += j < batch.length - 1 ? ',\n' : ';\n\n';
    }
  }
  return sql;
}

let sqlOutput = genSql();
fs.writeFileSync('seed_politics_1000.sql', sqlOutput);

// Stats
console.log(`Generated ${Q.length} questions`);
let d1 = Q.filter(q => q.difficulty === 1).length;
let d2 = Q.filter(q => q.difficulty === 2).length;
let d3 = Q.filter(q => q.difficulty === 3).length;
console.log(`Difficulty: 基础=${d1} (${Math.round(d1/Q.length*100)}%), 中等=${d2} (${Math.round(d2/Q.length*100)}%), 进阶=${d3} (${Math.round(d3/Q.length*100)}%)`);
let chapters = {};
Q.forEach(q => { chapters[q.chapter] = (chapters[q.chapter] || 0) + 1; });
console.log('By chapter:', JSON.stringify(chapters, null, 2));
