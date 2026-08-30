const fs = require('fs');
const path = require('path');

const SEED_FILE = path.join(__dirname, '..', 'seed_all_final.sql');

const clean = (s) => s.replace(/\uFEFF/g, '').replace(/\s+/g, ' ').trim();

const POLITICS_BOOKS = {
  '马克思主义基本原理': '马原',
  '马克思主义基本原理概论': '马原',
  '毛泽东思想和中国特色社会主义理论体系': '毛中特',
  '毛泽东思想和中国特色社会主义理论体系概论': '毛中特',
  '中国近现代史纲要': '史纲',
  '思想道德修养与法律基础': '思修法基',
  '思想道德与法治': '思修法基',
  '习近平新时代中国特色社会主义思想概论': '习思想',
  '新时代中国特色社会主义思想概论': '习思想'
};

const MAYUAN = {
  1: '马克思主义是关于无产阶级和人类解放的科学',
  2: '世界的物质性及发展规律',
  3: '实践与认识及其发展规律',
  4: '人类社会及其发展规律',
  5: '资本主义的本质及规律',
  6: '资本主义的发展及其趋势',
  7: '社会主义的发展及其规律',
  8: '共产主义崇高理想及其最终实现'
};
const MAOGAI = {
  1: '毛泽东思想及其历史地位',
  2: '新民主主义革命理论',
  3: '社会主义改造理论',
  4: '社会主义建设道路初步探索的理论成果',
  5: '邓小平理论',
  6: '“三个代表”重要思想',
  7: '科学发展观',
  8: '习近平新时代中国特色社会主义思想及其历史地位',
  9: '坚持和发展中国特色社会主义的总任务',
  10: '“五位一体”总体布局',
  11: '“四个全面”战略布局',
  12: '全面推进国防和军队现代化',
  13: '中国特色大国外交',
  14: '坚持和加强党的领导',
  15: '坚持“一国两制”和推进祖国完全统一'
};
const SHIGANG = {
  1: '反对外国侵略的斗争',
  2: '对国家出路的早期探索',
  3: '辛亥革命与君主专制制度的终结',
  4: '开天辟地的大事变',
  5: '中国革命的新道路',
  6: '中华民族的抗日战争',
  7: '为新中国而奋斗',
  8: '社会主义基本制度在中国的确立',
  9: '社会主义建设在探索中曲折发展',
  10: '中国特色社会主义的开创与接续发展',
  11: '中国特色社会主义进入新时代'
};
const SIXIU = {
  0: '绪论',
  1: '人生的青春之问',
  2: '坚定理想信念',
  3: '弘扬中国精神',
  4: '践行社会主义核心价值观',
  5: '明大德守公德严私德',
  6: '尊法学法守法用法'
};
const XISIANG = {
  1: '新时代坚持和发展中国特色社会主义',
  2: '以中国式现代化全面推进中华民族伟大复兴',
  7: '社会主义现代化建设的教育、科技、人才战略'
};

const TITLE_KEYWORDS = [
  ['无产阶级和人类解放', '马原', 1],
  ['物质性及发展规律', '马原', 2],
  ['实践与认识', '马原', 3],
  ['人类社会及其发展规律', '马原', 4],
  ['资本主义的本质', '马原', 5],
  ['资本主义的发展', '马原', 6],
  ['社会主义社会的发展及其规律', '马原', 7],
  ['社会主义的发展及其规律', '马原', 7],
  ['共产主义', '马原', 8],
  ['毛泽东思想及其历史地位', '毛中特', 1],
  ['新民主主义革命', '毛中特', 2],
  ['社会主义改造', '毛中特', 3],
  ['社会主义建设道路初步探索', '毛中特', 4],
  ['邓小平理论', '毛中特', 5],
  ['三个代表', '毛中特', 6],
  ['科学发展观', '毛中特', 7],
  ['习近平新时代中国特色社会主义思想及其历史地位', '毛中特', 8],
  ['总任务', '毛中特', 9],
  ['五位一体', '毛中特', 10],
  ['改善和保障民生', '毛中特', 10],
  ['四个全面', '毛中特', 11],
  ['国防和军队现代化', '毛中特', 12],
  ['大国外交', '毛中特', 13],
  ['人类命运共同体', '毛中特', 13],
  ['坚持和加强党的领导', '毛中特', 14],
  ['一国两制', '毛中特', 15],
  ['反对外国侵略', '史纲', 1],
  ['对国家出路的早期探索', '史纲', 2],
  ['辛亥革命', '史纲', 3],
  ['君主专制制度', '史纲', 3],
  ['开天辟地', '史纲', 4],
  ['中国共产党成立', '史纲', 4],
  ['中国革命的新道路', '史纲', 5],
  ['抗日战争', '史纲', 6],
  ['为新中国而奋斗', '史纲', 7],
  ['社会主义基本制度', '史纲', 8],
  ['中华人民共和国的成立', '史纲', 8],
  ['探索中曲折发展', '史纲', 9],
  ['开创与接续发展', '史纲', 10],
  ['进入新时代', '史纲', 11],
  ['人生的青春之问', '思修法基', 1],
  ['理想信念', '思修法基', 2],
  ['中国精神', '思修法基', 3],
  ['社会主义核心价值观', '思修法基', 4],
  ['明大德', '思修法基', 5],
  ['尊法学法', '思修法基', 6],
  ['遵法学法', '思修法基', 6],
  ['新时代坚持和发展中国特色社会主义', '习思想', 1],
  ['中国式现代化全面推进', '习思想', 2],
  ['教育、科技、人才', '习思想', 7]
];

const SECTION_CHAPTERS = {
  '马原': MAYUAN,
  '毛中特': MAOGAI,
  '史纲': SHIGANG,
  '思修法基': SIXIU,
  '习思想': XISIANG
};

const COARSE_TAGS = {
  '马克思主义基本原理': ['马原', '综合练习'],
  '马克思主义基本原理概论': ['马原', '综合练习'],
  '中国近现代史纲要': ['史纲', '综合练习'],
  '毛泽东思想和中国特色社会主义理论体系': ['毛中特', '综合练习'],
  '毛泽东思想和中国特色社会主义理论体系概论': ['毛中特', '综合练习'],
  '毛泽东思想和中国特色社会主义': ['毛中特', '综合练习'],
  '思想道德修养与法律基础': ['思修法基', '综合练习'],
  '思想道德与法治': ['思修法基', '综合练习'],
  '习近平新时代中国特色社会主义思想概论': ['习思想', '综合练习'],
  '新时代中国特色社会主义思想概论': ['习思想', '综合练习'],
  '时事政治综合': ['时事与综合', '时事政治综合'],
  '考研政治综合': ['时事与综合', '考研政治综合'],
  '军事理论': ['时事与综合', '军事理论']
};

const CN_NUM = { '零': 0, '〇': 0, '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6, '七': 7, '八': 8, '九': 9 };

function parseChapterNo(raw) {
  const s = raw.trim();
  if (/^\d+$/.test(s)) return parseInt(s, 10);
  if (s === '十') return 10;
  if (s.startsWith('十')) return 10 + (CN_NUM[s.slice(1)] || 0);
  if (s.includes('十')) {
    const parts = s.split('十');
    return (CN_NUM[parts[0]] || 0) * 10 + (parts[1] ? (CN_NUM[parts[1]] || 0) : 0);
  }
  return CN_NUM[s] !== undefined ? CN_NUM[s] : null;
}

function canonicalChapter(section, no, fallbackTitle) {
  if (no === 0 && section === '思修法基') return '绪论';
  const std = SECTION_CHAPTERS[section] ? SECTION_CHAPTERS[section][no] : null;
  return '第' + no + '章 ' + (std || fallbackTitle);
}

function mapPolitics(raw) {
  const v = clean(raw);
  if (COARSE_TAGS[v]) {
    const [section, chapter] = COARSE_TAGS[v];
    return { section, chapter };
  }
  const dashIdx = v.indexOf(' - ');
  if (dashIdx > 0) {
    const book = clean(v.slice(0, dashIdx));
    const rest = clean(v.slice(dashIdx + 3));
    const section = POLITICS_BOOKS[book];
    if (section) {
      if (/^绪论/.test(rest) && section === '思修法基') return { section, chapter: '绪论' };
      const m = rest.match(/^第([0-9零〇一二三四五六七八九十百]+)[章:：]\s*(.*)$/);
      if (m) {
        const no = parseChapterNo(m[1]);
        if (no !== null) return { section, chapter: canonicalChapter(section, no, m[2]) };
      }
      return { section, chapter: '综合练习' };
    }
  }
  const bare = v.match(/^第([0-9零〇一二三四五六七八九十百]+)[章:：]\s*(.*)$/);
  if (bare) {
    const title = bare[2];
    const no = parseChapterNo(bare[1]);
    for (const [kw, section, stdNo] of TITLE_KEYWORDS) {
      if (title.includes(kw)) {
        return { section, chapter: canonicalChapter(section, stdNo, title) };
      }
    }
    return null;
  }
  for (const [kw, section, no] of TITLE_KEYWORDS) {
    if (v.includes(kw)) {
      return { section, chapter: canonicalChapter(section, no, v) };
    }
  }
  return null;
}

const CIRCUIT_MERGE = {
  '电路基础补充': '电路模型与电路定律',
  '等效变换补充': '电阻电路等效变换',
  '动态电路补充': '动态电路分析',
  '正弦稳态补充': '正弦稳态分析',
  '三相电路补充': '三相电路',
  '二端口网络补充': '二端口网络',
  '拉普拉斯变换补充': '复频域分析'
};

const ENGLISH_MAP = {
  '词汇': '第1章 词汇',
  '语法': '第2章 语法',
  '完形填空': '第3章 完形填空',
  '阅读理解': '第4章 阅读理解',
  '翻译': '第5章 翻译',
  '写作': '第6章 写作'
};

function loadRows(file) {
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  const rows = [];
  for (const line of lines) {
    const m = line.match(/^\('([^']*)',\s*'((?:[^']|'')*)',\s*'((?:[^']|'')*)',/);
    if (m) {
      rows.push({ subject: m[1], chapter: m[2].replace(/''/g, "'"), type: m[3] });
    }
  }
  return rows;
}

const rows = loadRows(SEED_FILE);
console.log('SEED_ROWS=' + rows.length);

const report = { politics: {}, math2: {}, english2: {}, circuit: {} };
const unmapped = [];
const migrationMap = { politics: [], circuit: [], english2: [] };

const distinct = new Map();
for (const r of rows) {
  const key = r.subject + '|||' + r.chapter;
  distinct.set(key, (distinct.get(key) || 0) + 1);
}

for (const [key, count] of distinct) {
  const [subject, chapter] = key.split('|||');
  if (subject === 'politics') {
    const res = mapPolitics(chapter);
    if (!res) {
      unmapped.push({ subject, chapter, count });
      continue;
    }
    const newCh = res.chapter;
    report.politics[newCh] = report.politics[newCh] || { section: res.section, count: 0, olds: [] };
    report.politics[newCh].count += count;
    report.politics[newCh].olds.push(chapter + '(' + count + ')');
    migrationMap.politics.push({ old: chapter, new: newCh, section: res.section, count });
  } else if (subject === 'circuit') {
    const newCh = CIRCUIT_MERGE[chapter] || chapter;
    report.circuit[newCh] = report.circuit[newCh] || { count: 0, olds: [] };
    report.circuit[newCh].count += count;
    if (newCh !== chapter) {
      report.circuit[newCh].olds.push(chapter + '(' + count + ')');
      migrationMap.circuit.push({ old: chapter, new: newCh, count });
    }
  } else if (subject === 'english2') {
    const newCh = ENGLISH_MAP[chapter] || chapter;
    report.english2[newCh] = report.english2[newCh] || { count: 0, olds: [] };
    report.english2[newCh].count += count;
    if (newCh !== chapter) {
      migrationMap.english2.push({ old: chapter, new: newCh, count });
    }
  } else if (subject === 'math2') {
    report.math2[chapter] = report.math2[chapter] || { count: 0 };
    report.math2[chapter].count += count;
  }
}

console.log('\n=== 政治新章节预览（' + Object.keys(report.politics).length + ' 个）===');
for (const [ch, info] of Object.entries(report.politics).sort((a, b) => a[1].section.localeCompare(b[1].section) || a[0].localeCompare(b[0]))) {
  console.log(`[${info.section}] ${ch} <= ${info.count} 题  (旧值 ${info.olds.length} 个)`);
}

console.log('\n=== 电路归并预览 ===');
for (const m of migrationMap.circuit) console.log(`${m.old}(${m.count}) -> ${m.new}`);

console.log('\n=== 英语二映射预览 ===');
for (const m of migrationMap.english2) console.log(`${m.old}(${m.count}) -> ${m.new}`);

console.log('\n=== 数学二（待线上细分）===');
for (const [ch, info] of Object.entries(report.math2)) console.log(`${ch}: ${info.count}`);

console.log('\n=== 未映射项（' + unmapped.length + '）===');
for (const u of unmapped) console.log(`[${u.subject}] "${u.chapter}" x${u.count}`);

const outPath = path.join(__dirname, 'chapter_migration_map.json');
fs.writeFileSync(outPath, JSON.stringify({ migrationMap, unmapped }, null, 2), 'utf8');
console.log('\nMAP_WRITTEN=' + outPath);
