import { addQuestionToDB } from '../api';
import { db } from '../state';
import { getLocal, setLocal } from '../storage';
import { toast } from '../utils';
import type { Question } from '../types';

export function addOption(): void {
  const container = document.getElementById('optionInputs');
  if (!container) return;
  const count = container.children.length;
  const letter = String.fromCharCode(65 + count);
  const row = document.createElement('div');
  row.className = 'option-input-row';
  row.innerHTML = `<span class="opt-letter">${letter}</span><input type="text" placeholder="选项 ${letter}"><span class="opt-del" onclick="delOption(this)">×</span>`;
  container.appendChild(row);
}

export function delOption(el: HTMLElement): void {
  const container = document.getElementById('optionInputs');
  if (!container) return;
  if (container.children.length <= 2) return;
  el.closest('.option-input-row')?.remove();
  [...container.children].forEach((row, i) => {
    const letterEl = row.querySelector('.opt-letter');
    if (letterEl) letterEl.textContent = String.fromCharCode(65 + i);
  });
}

export async function addQuestion(): Promise<void> {
  const subjectEl = document.getElementById('addSubject') as HTMLSelectElement | null;
  const chapter = (document.getElementById('addChapter') as HTMLInputElement | null)?.value.trim() || '';
  const typeEl = document.getElementById('addType') as HTMLSelectElement | null;
  const question = (document.getElementById('addQuestion') as HTMLTextAreaElement | null)?.value.trim() || '';
  const answer = (document.getElementById('addAnswer') as HTMLInputElement | null)?.value.trim().toUpperCase() || '';
  const explanation = (document.getElementById('addExplanation') as HTMLTextAreaElement | null)?.value.trim() || '';

  if (!subjectEl || !typeEl) return;
  const subject = subjectEl.value;
  const type = typeEl.value as Question['type'];
  if (!chapter || !question || !answer) { toast('请填写题目、章节和答案'); return; }

  const optionInputs = [...document.querySelectorAll<HTMLInputElement>('#optionInputs input')];
  const isInputType = type === 'fill' || type === 'essay';
  const options = isInputType ? [] : optionInputs.map((inp, i) => String.fromCharCode(65 + i) + '. ' + inp.value.trim()).filter(o => o.length > 3);

  const q: Question = { subject, chapter, type, question, options, answer, explanation, difficulty: 1, created_at: new Date().toISOString() };
  if (await addQuestionToDB(q)) {
    const chapterEl = document.getElementById('addChapter') as HTMLInputElement | null;
    const questionEl = document.getElementById('addQuestion') as HTMLTextAreaElement | null;
    const answerEl = document.getElementById('addAnswer') as HTMLInputElement | null;
    const explanationEl = document.getElementById('addExplanation') as HTMLTextAreaElement | null;
    if (chapterEl) chapterEl.value = '';
    if (questionEl) questionEl.value = '';
    if (answerEl) answerEl.value = '';
    if (explanationEl) explanationEl.value = '';
    optionInputs.forEach(inp => { inp.value = ''; });
  }
}

export function importJson(event: Event): void {
  const input = event.target as HTMLInputElement;
  const file = input.files ? input.files[0] : null;
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async (e: ProgressEvent<FileReader>) => {
    try {
      const data = JSON.parse((e.target as FileReader).result as string);
      const questions: Question[] = Array.isArray(data) ? data : (data.questions || []);
      const all = getLocal<Question[]>('questions', []);
      let added = 0;
      questions.forEach(q => {
        q.id = q.id || (Date.now() + Math.random());
        q.created_at = q.created_at || new Date().toISOString();
        if (!all.find(x => x.question === q.question && x.subject === q.subject)) {
          all.push(q);
          added++;
        }
      });
      setLocal('questions', all);
      const client = db;
      if (client) {
        for (const q of questions) {
          await client.from('questions').upsert(q as never);
        }
      }
      const result = document.getElementById('importResult');
      if (result) result.textContent = `✅ 成功导入 ${added} 道题目`;
      toast(`已导入 ${added} 道题目`);
    } catch {
      const result = document.getElementById('importResult');
      if (result) result.textContent = '❌ JSON 格式错误';
      toast('JSON 格式错误');
    }
  };
  reader.readAsText(file);
  input.value = '';
}

export function loadDemoData(): void {
  const demo: Question[] = [
    { subject: 'politics', chapter: '马原', type: 'single', question: '马克思主义哲学认为，世界的统一性在于它的', options: ['A. 存在性', 'B. 运动性', 'C. 物质性', 'D. 可知性'], answer: 'C', explanation: '辩证唯物主义认为，世界的真正统一性在于它的物质性。' },
    { subject: 'politics', chapter: '马原', type: 'single', question: '矛盾的两种基本属性是', options: ['A. 普遍性和特殊性', 'B. 同一性和斗争性', 'C. 绝对性和相对性', 'D. 对抗性和非对抗性'], answer: 'B', explanation: '矛盾的两种基本属性是同一性和斗争性。' },
    { subject: 'politics', chapter: '毛中特', type: 'single', question: '毛泽东思想的活的灵魂是', options: ['A. 武装斗争、统一战线、党的建设', 'B. 实事求是、群众路线、独立自主', 'C. 理论联系实际、密切联系群众、批评与自我批评', 'D. 土地革命、武装斗争、根据地建设'], answer: 'B', explanation: '实事求是、群众路线、独立自主是毛泽东思想的活的灵魂。' },
    { subject: 'politics', chapter: '史纲', type: 'single', question: '中国近代史上第一个不平等条约是', options: ['A. 《北京条约》', 'B. 《天津条约》', 'C. 《南京条约》', 'D. 《马关条约》'], answer: 'C', explanation: '1842年签订的《南京条约》是中国近代史上第一个不平等条约。' },
    { subject: 'politics', chapter: '思修', type: 'single', question: '社会主义道德建设的核心是', options: ['A. 集体主义', 'B. 为人民服务', 'C. 诚实守信', 'D. 爱国主义'], answer: 'B', explanation: '为人民服务是社会主义道德建设的核心。' },
    { subject: 'english2', chapter: '阅读理解', type: 'single', question: 'What is the main idea of the passage about climate change?', options: ['A. Climate change is a hoax', 'B. Climate change requires immediate global action', 'C. Climate change only affects polar regions', 'D. Climate change is beneficial for agriculture'], answer: 'B', explanation: 'Most passages about climate change emphasize the urgency of global action.' },
    { subject: 'english2', chapter: '完形填空', type: 'single', question: 'The research team ___ the experiment despite numerous challenges.', options: ['A. carried out', 'B. carried on', 'C. carried off', 'D. carried away'], answer: 'B', explanation: 'carry on = 继续进行，符合语境。' },
    { subject: 'math2', chapter: '高等数学', type: 'single', question: '极限 lim(x→0) sin(2x)/x 的值是', options: ['A. 0', 'B. 1', 'C. 2', 'D. 不存在'], answer: 'C', explanation: 'lim(x→0) sin(2x)/x = 2·lim(x→0) sin(2x)/(2x) = 2' },
    { subject: 'math2', chapter: '高等数学', type: 'single', question: '函数 f(x)=x³-3x 的极小值点是', options: ['A. x=-1', 'B. x=0', 'C. x=1', 'D. x=√3'], answer: 'C', explanation: "f'(x)=3x²-3=0, x=±1。f''(1)=6>0，x=1 是极小值点。" },
    { subject: 'math2', chapter: '线性代数', type: 'single', question: '设 A 是 n 阶方阵，|A|=2，则 |2A| =', options: ['A. 2', 'B. 4', 'C. 2^n', 'D. 2^(n+1)'], answer: 'D', explanation: '|2A| = 2^n·|A| = 2^n·2 = 2^(n+1)' },
    { subject: 'circuit', chapter: '电路模型', type: 'single', question: '基尔霍夫电流定律（KCL）的实质是', options: ['A. 能量守恒', 'B. 电荷守恒', 'C. 电压守恒', 'D. 功率守恒'], answer: 'B', explanation: 'KCL 的实质是电荷守恒定律在电路中的体现。' },
    { subject: 'circuit', chapter: '电阻电路', type: 'single', question: '两个电阻 R1=6Ω 和 R2=3Ω 并联，等效电阻为', options: ['A. 9Ω', 'B. 4.5Ω', 'C. 2Ω', 'D. 1Ω'], answer: 'C', explanation: 'R = (6×3)/(6+3) = 18/9 = 2Ω' },
    { subject: 'circuit', chapter: '动态电路', type: 'single', question: 'RC 一阶电路的时间常数 τ 等于', options: ['A. R/C', 'B. C/R', 'C. RC', 'D. 1/(RC)'], answer: 'C', explanation: 'RC 一阶电路的时间常数 τ = RC。' },
    { subject: 'circuit', chapter: '正弦稳态', type: 'single', question: '在正弦稳态电路中，电感元件的阻抗为', options: ['A. R', 'B. jωL', 'C. 1/(jωC)', 'D. -jωL'], answer: 'B', explanation: '电感阻抗 ZL = jωL。' },
    { subject: 'circuit', chapter: '三相电路', type: 'single', question: '对称 Y-Y 三相电路中，线电压与相电压的关系是', options: ['A. 相等', 'B. 线电压是相电压的 √3 倍', 'C. 相电压是线电压的 √3 倍', 'D. 线电压是相电压的 2 倍'], answer: 'B', explanation: '对称 Y 接法，线电压 = √3·相电压，且相位超前 30°。' },
    { subject: 'math2', chapter: '高等数学', type: 'fill', question: '极限 lim(x→0) sin x / x = ____', options: [], answer: '1|一', explanation: '第一个重要极限，lim(x→0) sin x / x = 1。' },
    { subject: 'math2', chapter: '高等数学', type: 'single', question: "设 $f(x)=\\ln(1+x)$，则 $f'(0)$ 等于", options: ['A. 0', 'B. 1', 'C. -1', 'D. 不存在'], answer: 'B', explanation: "复合函数求导：$$f'(x)=\\frac{1}{1+x}$$ 因此 $f'(0)=1$。" },
    { subject: 'math2', chapter: '高等数学', type: 'fill', question: "由重要极限可知 $\\lim_{x \\to 0} \\frac{\\sin x}{x}=$ ____", options: [], answer: '1', explanation: "第一个重要极限 $\\lim_{x \\to 0} \\frac{\\sin x}{x}=1$。" },
    { subject: 'circuit', chapter: '电阻电路', type: 'essay', question: '简述基尔霍夫电压定律（KVL）的内容及其适用条件。', options: [], answer: '在任一时刻，沿任一闭合回路绕行一周，各段电压降的代数和为零，即 ∑U = 0（仅适用于集总参数电路）。', explanation: 'KVL 反映能量守恒，适用于任何集总参数电路的任一闭合路径。' }
  ];

  demo.forEach((q, i) => { q.id = 10000 + i; q.created_at = new Date().toISOString(); });
  const existing = getLocal<Question[]>('questions', []);
  let added = 0;
  demo.forEach(q => {
    if (!existing.find(x => x.question === q.question && x.subject === q.subject)) {
      existing.push(q);
      added++;
    }
  });
  setLocal('questions', existing);
  toast(`已加载 ${added} 道示例题目`);
  const btn = document.getElementById('btnLoadDemo');
  if (btn) {
    btn.textContent = '已加载示例数据 ✓';
    btn.setAttribute('disabled', 'disabled');
  }
}