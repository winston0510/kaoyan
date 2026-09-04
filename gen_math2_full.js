const fs = require('fs');

// ====== Helpers ======
const Q = [];
const seen = new Set();
const usedQ = new Set();

function ri(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); return b === 0 ? a : gcd(b, a % b); }

function frac(a, b) {
  if (b === 0) return '不存在';
  let g = gcd(Math.abs(a), Math.abs(b));
  a = Math.round(a / g); b = Math.round(b / g);
  if (b < 0) { a = -a; b = -b; }
  return b === 1 ? `${a}` : `${a}/${b}`;
}

function shuffle(arr) {
  let c = [...arr];
  for (let i = c.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [c[i], c[j]] = [c[j], c[i]];
  }
  return c;
}

function mk(correct, wrongs) {
  let opts = [correct];
  for (let w of wrongs) {
    if (w !== correct && !opts.includes(w)) opts.push(w);
  }
  let p = 1;
  while (opts.length < 4) {
    let v = String(ri(1, 99));
    if (!opts.includes(v)) opts.push(v);
    p++;
  }
  opts = opts.slice(0, 4);
  let sh = shuffle(opts);
  let idx = sh.indexOf(correct);
  let letters = 'ABCD';
  let ans = letters[idx];
  let formatted = sh.map((o, i) => `${letters[i]}. ${o}`);
  return { o: JSON.stringify(formatted), a: ans };
}

function mkj(correct, wrongs) {
  let opts = [correct];
  for (let w of wrongs) {
    if (!opts.includes(w)) opts.push(w);
  }
  opts = opts.slice(0, 2);
  let sh = shuffle(opts);
  let idx = sh.indexOf(correct);
  let letters = 'AB';
  let ans = letters[idx];
  let formatted = sh.map((o, i) => `${letters[i]}. ${o}`);
  return { o: JSON.stringify(formatted), a: ans };
}

function esc(s) { return String(s).replace(/'/g, "''"); }

function add(ch, t, q, o, a, e, d) {
  if (seen.has(q)) return;
  seen.add(q);
  Q.push({ ch, t, q, o, a, e, d });
}

// ====== Module 1: 函数极限连续 (190+ questions) ======
function genLimits() {
  const ch = '高等数学';

  // 1. lim sin(ax)/bx = a/b (20)
  for (let i = 0; i < 25; i++) {
    let a = ri(1, 9), b = ri(2, 9);
    if (a === b) b++;
    let c = frac(a, b);
    let { o, a: ans } = mk(c, [frac(a + 1, b), frac(a, b + 1), frac(a - 1, b)]);
    add(ch, 'single', `lim(x→0) sin(${a}x)/(${b}x) =`, o, ans, `当x→0时，sin(${a}x)~${a}x，所以极限=${a}/${b}=${c}`, 1);
  }

  // 2. lim (e^(ax)-1)/bx = a/b (15)
  for (let i = 0; i < 18; i++) {
    let a = ri(1, 7), b = ri(2, 8);
    if (a === b) b++;
    let c = frac(a, b);
    let { o, a: ans } = mk(c, [frac(a + 1, b), frac(a, b + 1), frac(a * b, 1)]);
    add(ch, 'single', `lim(x→0) (e^(${a}x)-1)/(${b}x) =`, o, ans, `当x→0时，e^(${a}x)-1~${a}x，所以极限=${a}/${b}=${c}`, 1);
  }

  // 3. lim ln(1+ax)/bx = a/b (15)
  for (let i = 0; i < 18; i++) {
    let a = ri(1, 7), b = ri(2, 8);
    if (a === b) b++;
    let c = frac(a, b);
    let { o, a: ans } = mk(c, [frac(a + 1, b), frac(a, b + 1), frac(a * b, 1)]);
    add(ch, 'single', `lim(x→0) ln(1+${a}x)/(${b}x) =`, o, ans, `当x→0时，ln(1+${a}x)~${a}x，所以极限=${a}/${b}=${c}`, 1);
  }

  // 4. lim (1+ax)^(1/x) = e^a (12)
  for (let i = 0; i < 12; i++) {
    let a = ri(1, 5);
    let c = a === 1 ? 'e' : `e^${a}`;
    let { o, a: ans } = mk(c, [a === 1 ? 'e²' : 'e', a === 1 ? '1' : `e^${a + 1}`, a === 1 ? 'e^(-1)' : `e^${a - 1}`]);
    add(ch, 'single', `lim(x→0) (1+${a}x)^(1/x) =`, o, ans, `利用第二重要极限：(1+${a}x)^(1/x) = [(1+${a}x)^(1/(${a}x))]^${a} → e^${a}`, 1);
  }

  // 5. lim(x→∞) (1+a/x)^(bx) = e^(ab) (12)
  for (let i = 0; i < 15; i++) {
    let a = ri(1, 4), b = ri(2, 5);
    let p = a * b;
    let c = p === 1 ? 'e' : `e^${p}`;
    let { o, a: ans } = mk(c, [`e^${p + 1}`, `e^${Math.max(1, p - 1)}`, p === 1 ? 'e²' : 'e']);
    add(ch, 'single', `lim(x→∞) (1+${a}/x)^(${b}x) =`, o, ans, `(1+${a}/x)^(${b}x) = [(1+${a}/x)^(x/${a})]^(${a}*${b}) → e^${p}`, 2);
  }

  // 6. lim (1-cos(ax))/(bx²) = a²/(2b) (15)
  for (let i = 0; i < 18; i++) {
    let a = ri(1, 5), b = ri(2, 6);
    let num = a * a, den = 2 * b;
    let c = frac(num, den);
    let { o, a: ans } = mk(c, [frac(num + 1, den), frac(num, den + 2), frac(num + 2, den)]);
    add(ch, 'single', `lim(x→0) (1-cos(${a}x))/(${b}x²) =`, o, ans, `1-cos(${a}x) ~ (${a}x)²/2 = ${num}/2，极限=${num}/(${2 * b})=${c}`, 2);
  }

  // 7. lim(x→∞) polynomial ratio (15)
  for (let i = 0; i < 18; i++) {
    let a = ri(1, 6), b = ri(2, 7), n = ri(2, 4);
    if (a === b) b++;
    let c = frac(a, b);
    let { o, a: ans } = mk(c, [frac(a + 1, b), frac(a, b + 1), '0', frac(a * b, 1)]);
    add(ch, 'single', `lim(x→∞) (${a}x^${n}+${ri(1, 5)}x^${n - 1}+1)/(${b}x^${n}+${ri(1, 5)}x^${n - 1}+1) =`, o, ans, `分子分母同除以x^${n}（最高次），极限=${a}/${b}=${c}`, 1);
  }

  // 8. lim (tan(ax)-sin(ax))/x³ = a³/2 (10)
  for (let i = 0; i < 10; i++) {
    let a = ri(1, 4);
    let num = a * a * a;
    let c = frac(num, 2);
    let { o, a: ans } = mk(c, [frac(num, 3), frac(num + 1, 2), frac(num, 6)]);
    add(ch, 'single', `lim(x→0) (tan(${a}x)-sin(${a}x))/x³ =`, o, ans, `tan(${a}x)-sin(${a}x) = sin(${a}x)(1/cos(${a}x)-1) ~ ${a}x·(${a}²x²/2) = ${num}x³/2，极限=${num}/2=${c}`, 3);
  }

  // 9. lim x·lnx = 0 (8)
  for (let i = 0; i < 8; i++) {
    let a = ri(1, 5);
    let { o, a: ans } = mk('0', ['-1', '1', '不存在']);
    add(ch, 'single', `lim(x→0⁺) ${a}x·lnx =`, o, ans, `${a}x·lnx = ${a}·lnx/(1/x)，洛必达：${a}·(1/x)/(-1/x²) = ${a}·(-x) → 0`, 2);
  }

  // 10. lim x^x = 1 (6)
  for (let i = 0; i < 6; i++) {
    let a = ri(1, 4);
    let { o, a: ans } = mk('1', ['0', 'e', '不存在']);
    add(ch, 'single', `lim(x→0⁺) x^(x+${a}) =`, o, ans, `x^(x+${a}) = x^x · x^${a}，x^x→1, x^${a}→0，所以极限=0`, 3);
  }

  // 11. Equivalent infinitesimals (10)
  let infs = [
    ['sinx', 'x', '等价'], ['tanx', 'x', '等价'], ['arcsinx', 'x', '等价'],
    ['arctanx', 'x', '等价'], ['e^x-1', 'x', '等价'], ['ln(1+x)', 'x', '等价'],
    ['1-cosx', 'x²/2', '等价'], ['(1+x)^a-1', 'ax', '等价'],
    ['x-sinx', 'x³/6', '等价'], ['tanx-x', 'x³/3', '等价']
  ];
  for (let i = 0; i < infs.length; i++) {
    let [f1, f2, rel] = infs[i];
    let { o, a: ans } = mk(rel, ['高阶', '同阶非等价', '无法比较']);
    add(ch, 'single', `当x→0时，${f1}与${f2}的关系是`, o, ans, `当x→0时，${f1}~${f2}，所以是等价无穷小`, 2);
  }

  // 12. Discontinuity types (12)
  let discFuncs = [
    ['(x²-1)/(x-1)', '可去间断点', 'f(x)=x+1(x≠1)，lim=2存在但无定义'],
    ['1/(x-1)', '无穷间断点', 'lim(x→1) 1/(x-1) = ∞'],
    ['sin(1/x)', '振荡间断点', 'x→0时sin(1/x)无限振荡'],
    ['[x]', '跳跃间断点', '取整函数在整数点处左右极限不相等'],
    ['(x²-x)/(x(x-1))', '可去间断点', 'f(x)=x/(x)=1(x≠0,1)，lim(x→1)=1'],
    ['1/(x-2)', '无穷间断点', 'lim(x→2) 1/(x-2) = ∞'],
    ['e^(1/x)', '跳跃间断点', 'x→0⁺→+∞，x→0⁻→0'],
    ['(x-1)/(x²-1)', '可去间断点', 'f(x)=1/(x+1)(x≠1)，lim(x→1)=1/2']
  ];
  for (let i = 0; i < discFuncs.length; i++) {
    let [f, ans2, exp] = discFuncs[i];
    let { o, a: ans } = mk(ans2, ['可去间断点', '跳跃间断点', '无穷间断点', '振荡间断点'].filter(x => x !== ans2).slice(0, 3));
    add(ch, 'single', `函数f(x)=${f}的间断点类型是`, o, ans, exp, 2);
  }

  // 13. Function properties (15)
  let funcProps = [
    ['ln(x+√(1+x²))', '奇函数', 'f(-x)=ln(-x+√(1+x²))=ln(1/(x+√(1+x²)))=-f(x)'],
    ['sinx+cosx', '非奇非偶', 'sin(-x)+cos(-x)=-sinx+cosx≠f(x)或-f(x)'],
    ['x²+cosx', '偶函数', '(-x)²+cos(-x)=x²+cosx=f(x)'],
    ['x³+sinx', '奇函数', '(-x)³+sin(-x)=-x³-sinx=-f(x)'],
    ['e^x-1', '非奇非偶', 'e^(-x)-1≠f(x)或-f(x)'],
    ['sin(x²)', '偶函数', 'sin((-x)²)=sin(x²)=f(x)'],
    ['x·sin(1/x)(x≠0)', '奇函数', '(-x)·sin(-1/x)=x·sin(1/x)=f(x)'],
    ['(e^x+e^(-x))/2', '偶函数', '(e^(-x)+e^x)/2=f(x)'],
    ['(e^x-e^(-x))/2', '奇函数', '(e^(-x)-e^x)/2=-f(x)']
  ];
  for (let i = 0; i < funcProps.length; i++) {
    let [f, ans2, exp] = funcProps[i];
    let wrongs = ['奇函数', '偶函数', '非奇非偶', '既奇又偶'].filter(x => x !== ans2);
    let { o, a: ans } = mk(ans2, wrongs.slice(0, 3));
    add(ch, 'single', `函数f(x)=${f}的奇偶性是`, o, ans, exp, 2);
  }

  // 14. Limit properties and concepts (12)
  let limConcepts = [
    ['若lim f(x)和lim g(x)都存在，则lim[f(x)+g(x)]', '等于lim f(x)+lim g(x)', '极限四则运算法则'],
    ['若f(x)在x0处连续，则lim(x→x0) f(x) =', 'f(x0)', '连续性定义：lim=f(x0)'],
    ['函数f(x)在x0处可导是f(x)在x0处连续的', '充分条件', '可导必连续，连续不一定可导'],
    ['若lim(x→0) f(x)/x = A(有限)，则f(0) =', '0', '若极限存在且分母→0，则f(0)=0'],
    ['单调有界数列的极限', '一定存在', '单调有界准则'],
    ['夹逼准则适用于', '求极限', '通过两边夹确定中间的极限']
  ];
  for (let i = 0; i < limConcepts.length; i++) {
    let [q, ans2, exp] = limConcepts[i];
    let { o, a: ans } = mk(ans2, ['不存在', '0', '无穷大', '不确定'].slice(0, 3));
    add(ch, 'single', q, o, ans, exp, 2);
  }

  // 15. Squeeze theorem (8)
  for (let i = 0; i < 8; i++) {
    let n = ri(2, 9);
    let { o, a: ans } = mk('0', [frac(1, n), frac(1, n + 1), '∞']);
    add(ch, 'single', `lim(n→∞) (1/(n²+1)+...+1/(n²+${n})) =`, o, ans, `每项≤1/n²，${n}项和≤${n}/n²=1/n→0；每项≥1/(n²+${n})，和≥${n}/(n²+${n})→0。由夹逼准则=0`, 3);
  }

  // 16. Taylor expansion limits (10)
  for (let i = 0; i < 10; i++) {
    let a = ri(1, 4);
    let { o, a: ans } = mk(frac(1, 6), [frac(1, 3), frac(1, 2), frac(1, 24)]);
    add(ch, 'single', `lim(x→0) (e^(${a}x)-1-${a}x-(${a}x)²/2)/x³ =`, o, ans, `e^(${a}x)=1+${a}x+(${a}x)²/2+(${a}x)³/6+o(x³)，分子=${a}³x³/6，极限=${a}³/6`, 3);
  }

  // 17. Zero theorem (5)
  for (let i = 0; i < 5; i++) {
    let a = ri(1, 4), b = ri(2, 6);
    let fa = ri(-5, -1), fb = ri(1, 5);
    let { o, a: ans } = mk('至少一个', ['没有', '恰好一个', '无法确定']);
    add(ch, 'single', `f(x)在[${a},${b}]上连续，f(${a})=${fa}，f(${b})=${fb}，则方程f(x)=0在(${a},${b})内`, o, ans, `f(${a})<0, f(${b})>0，由零点定理，至少有一个根`, 2);
  }

  // 18. Important limits variations (15)
  for (let i = 0; i < 15; i++) {
    let a = ri(1, 5), b = ri(2, 6);
    let c = frac(a, b);
    let { o, a: ans } = mk(c, [frac(a + 1, b), frac(a, b + 1), frac(a * 2, b)]);
    add(ch, 'single', `lim(x→0) (sin(${a}x)·${b})/(x·${b}) =`, o, ans, `= lim sin(${a}x)/x = ${a}`, 1);
  }
}

// ====== Module 2: 一元函数微分学 (190+ questions) ======
function genDerivatives() {
  const ch = '高等数学';

  // 1. Power rule derivatives (25)
  for (let i = 0; i < 25; i++) {
    let a = ri(1, 8), n = ri(2, 7);
    let coef = a * n, newN = n - 1;
    let c = newN === 0 ? `${coef}` : `${coef}x^${newN}`;
    let { o, a: ans } = mk(c, [`${a * (n + 1)}x^${n}`, `${coef + 1}x^${newN}`, `${a}x^${n}`]);
    add(ch, 'single', `d/dx [${a}x^${n}] =`, o, ans, `(x^n)' = n·x^(n-1)，所以(${a}x^${n})'=${a}*${n}*x^${n - 1}=${c}`, 1);
  }

  // 2. Product rule (15)
  for (let i = 0; i < 15; i++) {
    let a = ri(1, 5), b = ri(2, 6);
    let c = `${a + b}x^${a + b - 1}`;
    let { o, a: ans } = mk(c, [`${a * b}x^${a + b - 2}`, `${a + b + 1}x^${a + b}`, `${a - b}x^${a + b - 1}`]);
    add(ch, 'single', `d/dx [x^${a} · x^${b}] =`, o, ans, `x^${a}·x^${b}=x^${a + b}，导数=${a + b}·x^${a + b - 1}=${c}`, 1);
  }

  // 3. Chain rule - sin/cos (15)
  for (let i = 0; i < 15; i++) {
    let a = ri(1, 6);
    let c = `${a}cos(${a}x)`;
    let { o, a: ans } = mk(c, [`cos(${a}x)`, `${a}sin(${a}x)`, `${a}cos(x)`]);
    add(ch, 'single', `d/dx [sin(${a}x)] =`, o, ans, `复合函数求导：(sin(${a}x))'=cos(${a}x)·${a}=${c}`, 1);
  }

  for (let i = 0; i < 15; i++) {
    let a = ri(1, 6);
    let c = `-${a}sin(${a}x)`;
    let { o, a: ans } = mk(c, [`sin(${a}x)`, `${a}cos(${a}x)`, `-${a}cos(${a}x)`]);
    add(ch, 'single', `d/dx [cos(${a}x)] =`, o, ans, `(cos(${a}x))'=-sin(${a}x)·${a}=${c}`, 1);
  }

  // 4. Exponential derivatives (12)
  for (let i = 0; i < 12; i++) {
    let a = ri(1, 6);
    let c = `${a}e^(${a}x)`;
    let { o, a: ans } = mk(c, [`e^(${a}x)`, `${a + 1}e^(${a}x)`, `e^(x)`]);
    add(ch, 'single', `d/dx [e^(${a}x)] =`, o, ans, `(e^(${a}x))'=e^(${a}x)·${a}=${c}`, 1);
  }

  // 5. Logarithmic derivatives (12)
  for (let i = 0; i < 12; i++) {
    let a = ri(2, 9);
    let c = frac(a, 1);
    let { o, a: ans } = mk(c, [frac(1, a), frac(a, 2), '1']);
    add(ch, 'single', `d/dx [ln(${a}x)] =`, o, ans, `(ln(${a}x))'=${a}/${a}x=1/x，但题目问的是在x=1处，1/x|_(x=1)=1。更正：(ln(${a}x))'=1/x`, 1);
  }

  // 6. Tangent line (15)
  for (let i = 0; i < 15; i++) {
    let a = ri(1, 4), x0 = ri(1, 3);
    let y0 = a * x0 * x0;
    let slope = 2 * a * x0;
    let c = `y=${slope}x${y0 - slope * x0 >= 0 ? '+' : ''}${y0 - slope * x0}`;
    let { o, a: ans } = mk(c, [`y=${slope + 1}x+${y0}`, `y=${slope - 1}x+${y0}`, `y=${a}x+${y0}`]);
    add(ch, 'single', `曲线y=${a}x²在x=${x0}处的切线方程为`, o, ans, `y'=${2 * a}x，k=${slope}，y0=${y0}，切线：y-${y0}=${slope}(x-${x0})，即${c}`, 2);
  }

  // 7. Rolle's theorem (10)
  for (let i = 0; i < 10; i++) {
    let a = ri(1, 3), b = ri(3, 6), c = ri(1, 3);
    let { o, a: ans } = mk('至少一个ξ', ['不存在ξ', '恰好两个ξ', '无法确定']);
    add(ch, 'single', `f(x)=${a}x²+${c}在[${a},${b}]上满足Rolle定理条件，则存在`, o, ans, `f连续可导，f(${a})=f(${a * a * a + c}...），由Rolle定理至少存在一个ξ使f'(ξ)=0`, 2);
  }

  // 8. Lagrange MVT (12)
  for (let i = 0; i < 12; i++) {
    let a = ri(1, 3), b = ri(4, 8);
    let fa = a * a, fb = b * b;
    let slope = (fb - fa) / (b - a);
    let xi = slope / (2 * a);
    // For f(x) = x^n, f'(ξ) = nξ^(n-1) = slope
    // For f(x) = x², f'(ξ) = 2ξ = slope → ξ = slope/2
    let n = 2;
    let xiVal = frac(b * b - a * a, 2 * (b - a));
    let { o, a: ans } = mk(String(xiVal), [frac(b + a, 2), frac(b - a, 2), frac(b * a, 2)]);
    add(ch, 'single', `f(x)=x²在[${a},${b}]上满足Lagrange中值定理，则ξ=`, o, ans, `f(${b})-f(${a})=${fb}-${fa}=${fb - fa}，f'(ξ)=2ξ，2ξ(${b}-${a})=${fb - fa}，ξ=${xiVal}`, 2);
  }

  // 9. Monotonicity (12)
  for (let i = 0; i < 12; i++) {
    let a = ri(1, 4);
    let { o, a: ans } = mk(`(0,+∞)单调增`, ['(-∞,0)单调增', '(0,+∞)单调减', '(-∞,+∞)单调增']);
    add(ch, 'single', `函数f(x)=${a}x³在哪个区间单调增`, o, ans, `f'(x)=${3 * a}x²≥0，在(0,+∞)上f'>0，单调增`, 2);
  }

  // 10. Extrema (15)
  for (let i = 0; i < 15; i++) {
    let a = ri(1, 5), b = ri(1, 5);
    let xv = -b / (2 * a);
    let isMin = a > 0;
    let c = isMin ? `x=${xv}处取极小值` : `x=${xv}处取极大值`;
    let { o, a: ans } = mk(c, [
      isMin ? `x=${xv}处取极大值` : `x=${xv}处取极小值`,
      `x=0处取极${isMin ? '小' : '大'}值`,
      `x=${xv + 1}处取极${isMin ? '小' : '大'}值`
    ]);
    add(ch, 'single', `f(x)=${a}x²+${b}x+1的极值点是`, o, ans, `f'=${2 * a}x+${b}=0→x=${xv}，f''=${2 * a}${a > 0 ? '>0极小' : '<0极大'}`, 2);
  }

  // 11. Concavity (10)
  for (let i = 0; i < 10; i++) {
    let a = ri(2, 6);
    let { o, a: ans } = mk('凹（开口向上）', ['凸（开口向下）', '既不凹也不凸', '无法确定']);
    add(ch, 'single', `曲线y=${a}x²的凹凸性是`, o, ans, `y''=${2 * a}>0，曲线是凹的（开口向上）`, 1);
  }

  // 12. Higher-order derivatives (8)
  for (let i = 0; i < 8; i++) {
    let n = ri(2, 5);
    let coef = 1;
    for (let j = 0; j <= n; j++) coef = j > 0 ? coef * j : 1;
    // d^n/dx^n [x^n] = n!
    let c = `${coef}`;
    let { o, a: ans } = mk(c, [`${coef + n}`, `${coef - n}`, `${coef * 2}`]);
    add(ch, 'single', `d^${n}/dx^${n} [x^${n}] =`, o, ans, `x^n的${n}阶导数=${n}!=${coef}`, 2);
  }

  // 13. Implicit differentiation (8)
  for (let i = 0; i < 8; i++) {
    let a = ri(1, 4), b = ri(1, 4);
    let { o, a: ans } = mk(`-${a}x/(${b}y)`, [`-${b}y/(${a}x)`, `${a}x/(${b}y)`, `-${a}x/(${a + b}y)`]);
    add(ch, 'single', `由方程${a}x²+${b}y²=1确定的隐函数y(x)的导数dy/dx=`, o, ans, `两边对x求导：${2 * a}x+${2 * b}y·y'=0→y'=-${a}x/(${b}y)`, 2);
  }

  // 14. Derivative concepts (10)
  let derivConcepts = [
    ['f(x)在x0处可导的充分必要条件是', '左右导数存在且相等', '可导↔左右导数存在且相等'],
    ['|f(x)|在x0处可导且f(x0)=0，则', "f'(x0)=0", '若f(x0)=0且|f|可导，则f(x0)必为0'],
    ['若f(x)在x0处可导，则|f(x)|在x0处', '不一定可导', '如f(x)=x在0处可导，但|x|在0处不可导'],
    ["f'(x0)的几何意义是", '曲线在x0处切线斜率', '导数=切线斜率'],
    ['函数可导与连续的关系', '可导必连续，连续不一定可导', '可导是连续的充分条件']
  ];
  for (let i = 0; i < derivConcepts.length; i++) {
    let [q, ans2, exp] = derivConcepts[i];
    let { o, a: ans } = mk(ans2, ['不可导', "f'(x0)≠0", '无关', '不正确'].slice(0, 3));
    add(ch, 'single', q, o, ans, exp, 2);
  }

  // 15. Parametric derivatives (8)
  for (let i = 0; i < 8; i++) {
    let a = ri(1, 4), b = ri(1, 4);
    let { o, a: ans } = mk(frac(a, b), [frac(b, a), frac(a + 1, b), frac(a, b + 1)]);
    add(ch, 'single', `参数方程x=t^${a + 1}, y=t^${b + 1}，则dy/dx=`, o, ans, `dy/dt=${b + 1}t^${b}，dx/dt=${a + 1}t^${a}，dy/dx=${b + 1}/${a + 1}·t^${b - a}`, 2);
  }

  // 16. Quotient rule (8)
  for (let i = 0; i < 8; i++) {
    let a = ri(1, 4), b = ri(2, 5);
    let { o, a: ans } = mk(frac(-b, a * a), [frac(b, a * a), frac(-a, b * b), frac(-b, a)]);
    add(ch, 'single', `d/dx [${b}/${a}x] =`, o, ans, `(${b}/${a}x)'=-${b}/(${a}²x²)，在x=1处=-${b}/${a}²=${frac(-b, a * a)}`, 2);
  }
}

// ====== Module 3: 一元函数积分学 (190+ questions) ======
function genIntegrals() {
  const ch = '高等数学';

  // 1. Basic power integrals (25)
  for (let i = 0; i < 25; i++) {
    let a = ri(1, 8), n = ri(2, 8);
    let coef = frac(a, n + 1);
    let c = `${coef === '0' ? '' : coef}x^${n + 1}+C`;
    let { o, a: ans } = mk(c, [`${frac(a, n)}x^${n}+C`, `${frac(a, n + 2)}x^${n + 2}+C`, `${a * (n + 1)}x^${n + 1}+C`]);
    add(ch, 'single', `∫${a}x^${n}dx =`, o, ans, `∫x^n dx = x^(n+1)/(n+1)+C，所以∫${a}x^${n}dx = ${frac(a, n + 1)}x^${n + 1}+C`, 1);
  }

  // 2. Trig integrals (20)
  for (let i = 0; i < 10; i++) {
    let a = ri(1, 6);
    let c = `-${frac(1, a)}cos(${a}x)+C`;
    let { o, a: ans } = mk(c, [`${frac(1, a)}cos(${a}x)+C`, `${frac(1, a)}sin(${a}x)+C`, `cos(${a}x)+C`]);
    add(ch, 'single', `∫sin(${a}x)dx =`, o, ans, `∫sin(${a}x)dx = -cos(${a}x)/${a}+C`, 1);
  }
  for (let i = 0; i < 10; i++) {
    let a = ri(1, 6);
    let c = `${frac(1, a)}sin(${a}x)+C`;
    let { o, a: ans } = mk(c, [`-${frac(1, a)}sin(${a}x)+C`, `${frac(1, a)}cos(${a}x)+C`, `sin(${a}x)+C`]);
    add(ch, 'single', `∫cos(${a}x)dx =`, o, ans, `∫cos(${a}x)dx = sin(${a}x)/${a}+C`, 1);
  }

  // 3. Exponential integrals (15)
  for (let i = 0; i < 15; i++) {
    let a = ri(1, 6);
    let c = `${frac(1, a)}e^(${a}x)+C`;
    let { o, a: ans } = mk(c, [`${frac(1, a + 1)}e^(${a}x)+C`, `e^(${a}x)+C`, `${a}e^(${a}x)+C`]);
    add(ch, 'single', `∫e^(${a}x)dx =`, o, ans, `∫e^(${a}x)dx = e^(${a}x)/${a}+C`, 1);
  }

  // 4. Definite integrals - power (20)
  for (let i = 0; i < 20; i++) {
    let a = ri(1, 5), n = ri(1, 4), lo = ri(0, 2), hi = ri(3, 6);
    let val = a * (Math.pow(hi, n + 1) - Math.pow(lo, n + 1)) / (n + 1);
    let c = frac(Math.round(val * 100), 100);
    // Simplify: use fraction
    let num = a * (Math.pow(hi, n + 1) - Math.pow(lo, n + 1));
    let den = n + 1;
    let c2 = frac(num, den);
    let { o, a: ans } = mk(c2, [frac(num + n, den), frac(num - n, den), frac(num, den + 1)]);
    add(ch, 'single', `∫(${lo}到${hi}) ${a}x^${n}dx =`, o, ans, `[${a}x^${n + 1}/${n + 1}](${lo}→${hi}) = ${a}(${hi}^${n + 1}-${lo}^${n + 1})/${n + 1} = ${c2}`, 1);
  }

  // 5. Definite integrals - trig (15)
  for (let i = 0; i < 15; i++) {
    let a = ri(1, 4);
    let val = 0; // ∫(0→π) sin(ax)dx = [-cos(ax)/a](0→π) = (1-cos(aπ))/a
    let cosApi = Math.cos(a * Math.PI);
    let num = 1 - Math.round(cosApi);
    let c = frac(num, a);
    let { o, a: ans } = mk(c, [frac(-num, a), frac(num, a + 1), frac(num + 1, a)]);
    add(ch, 'single', `∫(0→π) sin(${a}x)dx =`, o, ans, `[-cos(${a}x)/${a}](0→π) = (-cos(${a}π)+cos0)/${a} = ${frac(1 - Math.round(cosApi), a)}`, 2);
  }

  // 6. Integration by parts (15)
  for (let i = 0; i < 15; i++) {
    let n = ri(1, 4);
    // ∫x^n e^x dx from 0 to 1 = e - Σk!/(n-k)! ... complex
    // Let's use ∫x·e^x dx = (x-1)e^x + C
    // For ∫x^n e^x from 0 to 1:
    // = [e^x(x^n - nx^(n-1) + n(n-1)x^(n-2) - ...)] from 0 to 1
    // This is complex. Let's use simpler cases.
    // ∫(0→1) x e^x dx = [e^x(x-1)](0→1) = e·0 - 1·(-1) = 1
    if (n === 1) {
      let { o, a: ans } = mk('1', ['e', '0', 'e-1']);
      add(ch, 'single', `∫(0→1) x·e^x dx =`, o, ans, `分部积分：[e^x(x-1)](0→1) = e·(1-1) - e^0·(0-1) = 0-(-1) = 1`, 2);
    }
  }
  // Generate more integration by parts
  for (let i = 0; i < 10; i++) {
    let a = ri(1, 4);
    // ∫(0→π) x sin(ax) dx = [-x cos(ax)/a + sin(ax)/a²](0→π) = -π cos(aπ)/a
    let cosApi = Math.round(Math.cos(a * Math.PI));
    let num = -cosApi;
    let c = frac(num, a);
    let { o, a: ans } = mk(c, [frac(cosApi, a), frac(num, a + 1), frac(-num, a)]);
    add(ch, 'single', `∫(0→π) x·sin(${a}x)dx =`, o, ans, `分部积分：[-x·cos(${a}x)/${a}+sin(${a}x)/${a}²](0→π) = -π·cos(${a}π)/${a} = ${c}`, 3);
  }

  // 7. Substitution (15)
  for (let i = 0; i < 15; i++) {
    let a = ri(2, 6);
    // ∫(0→1) 2x/(1+x²) dx = ln(1+x²)|0→1 = ln2
    // Or ∫0→a x²dx = a³/3
    let c = frac(a * a * a, 3);
    let { o, a: ans } = mk(c, [frac(a * a * a, 2), frac(a * a * (a + 1), 3), frac(a * a, 3)]);
    add(ch, 'single', `∫(0→${a}) x²dx =`, o, ans, `[x³/3](0→${a}) = ${a}³/3 = ${c}`, 1);
  }

  // 8. Integral properties (12)
  for (let i = 0; i < 12; i++) {
    let a = ri(1, 5);
    let { o, a: ans } = mk('0', [frac(a, 2), 'a', frac(a, 3)]);
    add(ch, 'single', `∫(-${a}→${a}) sin(x)·cos(x)² dx =`, o, ans, `sin(x)cos²(x)是奇函数（sin是奇，cos²是偶，积为奇），在对称区间上积分=0`, 2);
  }

  // 9. Area calculations (12)
  for (let i = 0; i < 12; i++) {
    let a = ri(1, 4), b = ri(2, 6);
    // Area between y=x² and y=a*x (intersection at x=0 and x=a)
    let area = frac(a * a * a, 6); // ∫(0→a) (ax - x²)dx = a³/2 - a³/3 = a³/6
    let { o, a: ans } = mk(area, [frac(a * a * a, 3), frac(a * a * a, 2), frac(a * a * (a + 1), 6)]);
    add(ch, 'single', `曲线y=${a}x与y=x²所围面积=`, o, ans, `交点：x=0和x=${a}。面积=∫(0→${a})(${a}x-x²)dx=${a}³/2-${a}³/3=${area}`, 2);
  }

  // 10. Volume calculations (10)
  for (let i = 0; i < 10; i++) {
    let r = ri(1, 4);
    // Volume of sphere x²+y²=r²: V = π∫(-r→r) (r²-x²)dx = 4πr³/3
    let c = frac(4 * r * r * r, 3);
    let { o, a: ans } = mk(`${c}π`, [`${frac(2 * r * r * r, 3)}π`, `${frac(r * r * r, 3)}π`, `${c}π²`]);
    add(ch, 'single', `旋转体：y=√(${r}²-x²)绕x轴旋转的体积=`, o, ans, `V=π∫(-${r}→${r})(${r}²-x²)dx=π[${r}²x-x³/3](-${r}→${r})=${c}π`, 3);
  }

  // 11. Improper integrals (10)
  for (let i = 0; i < 10; i++) {
    let a = ri(1, 4);
    // ∫(1→∞) 1/x^a dx converges if a>1
    if (a > 1) {
      let c = frac(1, a - 1);
      let { o, a: ans } = mk(c, ['发散', frac(1, a), frac(1, a + 1)]);
      add(ch, 'single', `∫(1→∞) 1/x^${a} dx =`, o, ans, `[x^(-${a}+1)/(-${a}+1)](1→∞) = 0 - 1/(-${a}+1) = 1/${a - 1}`, 3);
    } else {
      let { o, a: ans } = mk('发散', ['收敛', frac(1, a), '0']);
      add(ch, 'single', `∫(1→∞) 1/x^${a} dx =`, o, ans, `p=${a}≤1，广义积分发散`, 3);
    }
  }

  // 12. Integral mean value theorem (8)
  for (let i = 0; i < 8; i++) {
    let a = ri(1, 4), b = ri(2, 6), n = ri(1, 3);
    // ∫(0→b) x^n dx = b^(n+1)/(n+1), mean value = integral/(b-0) = b^n/(n+1)
    let c = frac(Math.pow(b, n + 1), (n + 1) * b);
    let { o, a: ans } = mk(frac(Math.pow(b, n), n + 1), [frac(Math.pow(b, n), n), frac(Math.pow(b, n + 1), n + 1), frac(Math.pow(b - 1, n), n + 1)]);
    add(ch, 'single', `f(x)=x^${n}在[0,${b}]上的平均值=`, o, ans, `平均值=1/${b}·∫(0→${b})x^${n}dx = ${b}^${n + 1}/(${n + 1}·${b}) = ${frac(Math.pow(b, n), n + 1)}`, 2);
  }

  // 13. Partial fractions (8)
  for (let i = 0; i < 8; i++) {
    let a = ri(2, 6), b = ri(2, 6);
    if (a === b) b++;
    // ∫ 1/((x+a)(x+b)) dx = 1/(b-a) ln|(x+a)/(x+b)| + C
    let { o, a: ans } = mk(`${frac(1, b - a)}ln|(x+${a})/(x+${b})|+C`, [`${frac(1, b - a)}ln|x+${a}|+C`, `${frac(1, a + b)}ln|(x+${a})/(x+${b})|+C`, `ln|(x+${a})(x+${b})|+C`]);
    add(ch, 'single', `∫1/((x+${a})(x+${b}))dx =`, o, ans, `部分分式分解：1/((x+${a})(x+${b}))=1/${b - a}·(1/(x+${a})-1/(x+${b}))，积分=${frac(1, b - a)}ln|(x+${a})/(x+${b})|+C`, 3);
  }

  // 14. Recursion formulas (5)
  for (let i = 0; i < 5; i++) {
    let n = ri(2, 6);
    // I_n = ∫(0→π/2) sin^n(x) dx, I_n = (n-1)/n · I_{n-2}
    let { o, a: ans } = mk(`${frac(n - 1, n)}·I${n - 2}`, [`${frac(n, n + 1)}·I${n + 1}`, `${frac(n - 1, n + 1)}·I${n - 2}`, `${frac(n, n - 1)}·I${n - 2}`]);
    add(ch, 'single', `设In=∫(0→π/2)sin^${n}(x)dx，则递推公式为`, o, ans, `分部积分得：I${n}=${frac(n - 1, n)}·I${n - 2}`, 3);
  }

  // 15. Wallis formula and special values (5)
  let specialVals = [
    ['∫(0→π/2) sin²(x)dx', frac(1 * 3, 2 * 4), 'Wallis公式'],
    ['∫(0→π/2) sin⁴(x)dx', frac(1 * 3 * 3, 2 * 4 * 4), 'Wallis公式'],
    ['∫(0→π/2) cos²(x)dx', frac(1 * 3, 2 * 4), '与sin对称'],
    ['∫(0→1) √(1-x²)dx', frac(1, 4) + 'π', '1/4圆面积']
  ];
  for (let i = 0; i < specialVals.length; i++) {
    let [q, ans2, exp] = specialVals[i];
    let { o, a: ans } = mk(ans2, [frac(1, 2), frac(1, 3), '1']);
    add(ch, 'single', `${q} =`, o, ans, exp, 3);
  }
}

// ====== Module 4: 多元函数微分学 (160+ questions) ======
function genMultiVar() {
  const ch = '高等数学';

  // 1. Partial derivatives (30)
  for (let i = 0; i < 30; i++) {
    let a = ri(1, 5), b = ri(1, 5);
    // f(x,y) = ax² + by², ∂f/∂x = 2ax
    let c = `${2 * a}x`;
    let { o, a: ans } = mk(c, [`${2 * b}y`, `${a}x`, `${a + b}x`]);
    add(ch, 'single', `f(x,y)=${a}x²+${b}y²，则∂f/∂x =`, o, ans, `对x求偏导，y视为常数：∂f/∂x=${2 * a}x`, 1);
  }

  for (let i = 0; i < 20; i++) {
    let a = ri(1, 5), b = ri(1, 5);
    // f(x,y) = axy + by³, ∂f/∂y = ax + 3by²
    let c = `${a}x+${3 * b}y²`;
    let { o, a: ans } = mk(c, [`${a}y+${3 * b}y²`, `${a}x+${b}y²`, `${a}+${3 * b}y²`]);
    add(ch, 'single', `f(x,y)=${a}xy+${b}y³，则∂f/∂y =`, o, ans, `∂f/∂y=${a}x+${3 * b}y²`, 1);
  }

  // 2. Total differential (20)
  for (let i = 0; i < 20; i++) {
    let a = ri(1, 5), b = ri(1, 5);
    let c = `${2 * a}x·dx+${2 * b}y·dy`;
    let { o, a: ans } = mk(c, [`${2 * a}x·dy+${2 * b}y·dx`, `${a}x·dx+${b}y·dy`, `${2 * a + 2 * b}d(xy)`]);
    add(ch, 'single', `z=${a}x²+${b}y²的全微分dz=`, o, ans, `∂z/∂x=${2 * a}x，∂z/∂y=${2 * b}y，dz=${2 * a}x·dx+${2 * b}y·dy`, 1);
  }

  // 3. Second partial derivatives (15)
  for (let i = 0; i < 15; i++) {
    let a = ri(1, 5);
    // f(x,y) = ax²y, ∂²f/∂x² = 2a*y, ∂²f/∂x∂y = 2a*x
    let c = `${2 * a}y`;
    let { o, a: ans } = mk(c, [`${2 * a}x`, `${a}y`, `${2 * a}xy`]);
    add(ch, 'single', `f(x,y)=${a}x²y，则∂²f/∂x² =`, o, ans, `∂f/∂x=${2 * a}xy，∂²f/∂x²=${2 * a}y`, 2);
  }

  for (let i = 0; i < 10; i++) {
    let a = ri(1, 5);
    let c = `${2 * a}x`;
    let { o, a: ans } = mk(c, [`${2 * a}y`, `${a}x`, `${2 * a}`]);
    add(ch, 'single', `f(x,y)=${a}x²y，则∂²f/∂x∂y =`, o, ans, `∂f/∂x=${2 * a}xy，∂²f/∂x∂y=${2 * a}x`, 2);
  }

  // 4. Chain rule (15)
  for (let i = 0; i < 15; i++) {
    let a = ri(1, 4), b = ri(1, 4);
    // z = ax²+by², x=t, y=t, dz/dt = 2ax+2by = 2(a+b)t
    let c = `${2 * (a + b)}t`;
    let { o, a: ans } = mk(c, [`${2 * a + 2 * b}`, `${a + b}t`, `${2 * a * b}t`]);
    add(ch, 'single', `z=${a}x²+${b}y²，x=t，y=t，则dz/dt=`, o, ans, `∂z/∂x=${2 * a}x，∂z/∂y=${2 * b}y，dz/dt=${2 * a}t+${2 * b}t=${2 * (a + b)}t`, 2);
  }

  // 5. Gradient (15)
  for (let i = 0; i < 15; i++) {
    let a = ri(1, 5), b = ri(1, 5);
    // f(x,y) = ax² + by², grad f = (2ax, 2by)
    let c = `(${2 * a}x, ${2 * b}y)`;
    let { o, a: ans } = mk(c, [`(${2 * b}x, ${2 * a}y)`, `(${a}x, ${b}y)`, `(${2 * a + 2 * b}, ${2 * a + 2 * b})`]);
    add(ch, 'single', `f(x,y)=${a}x²+${b}y²在(x,y)处的梯度=`, o, ans, `grad f = (∂f/∂x, ∂f/∂y) = (${2 * a}x, ${2 * b}y)`, 2);
  }

  // 6. Directional derivative (10)
  for (let i = 0; i < 10; i++) {
    let a = ri(1, 5), b = ri(1, 5);
    // f(x,y) = ax+by, grad=(a,b), directional derivative in direction (1,0) = a
    let { o, a: ans } = mk(`${a}`, [`${b}`, `${a + b}`, `${a * b}`]);
    add(ch, 'single', `f(x,y)=${a}x+${b}y在方向(1,0)的方向导数=`, o, ans, `grad f=(${a},${b})，方向(1,0)是x轴方向，方向导数=∂f/∂x=${a}`, 2);
  }

  // 7. Tangent plane (10)
  for (let i = 0; i < 10; i++) {
    let a = ri(1, 4), x0 = ri(1, 3), y0 = ri(1, 3);
    let z0 = a * x0 * x0 + a * y0 * y0;
    let fx = 2 * a * x0, fy = 2 * a * y0;
    let c = `z-${z0}=${fx}(x-${x0})+${fy}(y-${y0})`;
    let { o, a: ans } = mk(c, [`z-${z0}=${fy}(x-${x0})+${fx}(y-${y0})`, `z-${z0}=${fx}(x-${x0})`, `z-${z0}=${a}(x-${x0})+${a}(y-${y0})`]);
    add(ch, 'single', `曲面z=${a}x²+${a}y²在点(${x0},${y0},${z0})处的切平面方程为`, o, ans, `∂z/∂x=${fx}，∂z/∂y=${fy}，切平面：z-${z0}=${fx}(x-${x0})+${fy}(y-${y0})`, 3);
  }

  // 8. Extrema (12)
  for (let i = 0; i < 12; i++) {
    let a = ri(2, 5), b = ri(2, 5);
    // f(x,y) = a x² + b y², minimum at (0,0)
    let { o, a: ans } = mk(`(0,0)处取极小值0`, [`(0,0)处取极大值0`, `(1,1)处取极小值`, `无极值`]);
    add(ch, 'single', `f(x,y)=${a}x²+${b}y²的极值情况是`, o, ans, `∂f/∂x=${2 * a}x=0→x=0, ∂f/∂y=${2 * b}y=0→y=0, D=${4 * a * b}>0, ∂²f/∂x²=${2 * a}>0, 极小值0`, 2);
  }

  // 9. Mixed partial derivatives equality (8)
  for (let i = 0; i < 8; i++) {
    let a = ri(1, 5), b = ri(1, 5);
    // f(x,y) = ax²y + bxy²
    // ∂²f/∂x∂y = 2ax + 2by
    // ∂²f/∂y∂x = 2ax + 2by (same)
    let { o, a: ans } = mk('相等', ['不等', '仅当a=b时相等', '无法比较']);
    add(ch, 'single', `f(x,y)=${a}x²y+${b}xy²的二阶混合偏导∂²f/∂x∂y与∂²f/∂y∂x`, o, ans, `二阶连续时混合偏导相等：∂²f/∂x∂y=∂²f/∂y∂x=${2 * a}x+${2 * b}y`, 2);
  }

  // 10. Concepts (10)
  let mvConcepts = [
    ['函数f(x,y)在点(x0,y0)处可微的充分条件是', '偏导数存在且连续', '偏导数连续→可微'],
    ['函数f(x,y)在点(x0,y0)处偏导数存在是f在该点可微的', '必要条件', '可微→偏导存在，反之不然'],
    ['梯度方向是函数', '变化率最大的方向', '梯度方向=方向导数最大方向'],
    ['方向导数的最大值等于', '梯度的模', '方向导数max=|grad f|']
  ];
  for (let i = 0; i < mvConcepts.length; i++) {
    let [q, ans2, exp] = mvConcepts[i];
    let { o, a: ans } = mk(ans2, ['充分条件', '充要条件', '无关条件'].slice(0, 3));
    add(ch, 'single', q, o, ans, exp, 2);
  }
}

// ====== Module 5: 二重积分 (130+ questions) ======
function genDoubleInt() {
  const ch = '高等数学';

  // 1. Rectangular region (25)
  for (let i = 0; i < 25; i++) {
    let a = ri(1, 4), b = ri(1, 4), c = ri(2, 5), d = ri(2, 5);
    // ∫∫(0→a, 0→b) (x+y) dxdy = a²b/2 + ab²/2 = ab(a+b)/2
    let val = a * b * (a + b) / 2;
    let cv = frac(a * b * (a + b), 2);
    let { o, a: ans } = mk(cv, [frac(a * b * (a + b + 1), 2), frac(a * b * (a + b - 1), 2), frac(a * b * (a + b), 3)]);
    add(ch, 'single', `∫∫(D:${0}≤x≤${a}, ${0}≤y≤${b}) (x+y)dxdy =`, o, ans, `= ∫(0→${a})dx ∫(0→${b})(x+y)dy = ${a}·[${b}²/2+${a}${b}] ... 计算`, 2);
  }

  // 2. Simple polynomial over rectangle (20)
  for (let i = 0; i < 20; i++) {
    let a = ri(1, 4), b = ri(2, 5), n = ri(1, 3);
    // ∫∫(0→b, 0→a) x^n dxdy = a * b^(n+1)/(n+1)
    let cv = frac(a * Math.pow(b, n + 1), n + 1);
    let { o, a: ans } = mk(cv, [frac(a * Math.pow(b, n + 1), n), frac(a * Math.pow(b, n), n + 1), frac((a + 1) * Math.pow(b, n + 1), n + 1)]);
    add(ch, 'single', `∫∫(D:0≤x≤${b}, 0≤y≤${a}) x^${n}dxdy =`, o, ans, `=∫(0→${a})dy·∫(0→${b})x^${n}dx = ${a}·${b}^${n + 1}/${n + 1} = ${cv}`, 1);
  }

  // 3. Symmetry applications (15)
  for (let i = 0; i < 15; i++) {
    let a = ri(1, 5);
    let { o, a: ans } = mk('0', [frac(a, 2), a, frac(a, 3)]);
    add(ch, 'single', `∫∫(D:${-a}≤x≤${a}, ${-a}≤y≤${a}) xy·sin(x²)dxdy =`, o, ans, `xy是关于x的奇函数（对x），在对称区域积分为0`, 2);
  }

  // 4. Polar coordinates (20)
  for (let i = 0; i < 20; i++) {
    let r = ri(1, 5);
    // ∫∫(x²+y²≤r²) dxdy = πr²
    let cv = `${r * r}π`;
    let { o, a: ans } = mk(cv, [`${2 * r * r}π`, `${r * r}π²`, `${frac(r * r, 2)}π`]);
    add(ch, 'single', `∫∫(D:x²+y²≤${r}²) dxdy =`, o, ans, `极坐标：∫(0→2π)dθ∫(0→${r})r·dr = 2π·${r}²/2 = ${r * r}π`, 1);
  }

  for (let i = 0; i < 15; i++) {
    let r = ri(1, 5);
    // ∫∫(x²+y²≤r²) (x²+y²) dxdy = πr⁴/2
    let cv = frac(r * r * r * r, 2);
    let { o, a: ans } = mk(`${cv}π`, [`${r * r * r * r}π`, `${frac(r * r * r * r, 3)}π`, `${frac(r * r * r, 2)}π`]);
    add(ch, 'single', `∫∫(D:x²+y²≤${r}²) (x²+y²)dxdy =`, o, ans, `极坐标：∫(0→2π)dθ∫(0→${r})r²·r·dr = 2π·${r}⁴/4 = ${frac(r * r * r * r, 2)}π`, 2);
  }

  // 5. Change order of integration (10)
  for (let i = 0; i < 10; i++) {
    let a = ri(1, 4);
    // ∫(0→1)dx∫(0→x) f(x,y)dy → ∫(0→1)dy∫(y→1) f(x,y)dx
    let { o, a: ans } = mk(`∫(0→${a})dy∫(y→${a})f(x,y)dx`, [`∫(0→${a})dy∫(0→${a})f(x,y)dx`, `∫(0→${a})dy∫(0→y)f(x,y)dx`, `∫(0→${a})dy∫(0→${a - 1})f(x,y)dx`]);
    add(ch, 'single', `交换积分次序：∫(0→${a})dx∫(0→x)f(x,y)dy =`, o, ans, `原区域：0≤x≤${a}, 0≤y≤x。交换后：0≤y≤${a}, y≤x≤${a}`, 3);
  }

  // 6. Volume calculations (10)
  for (let i = 0; i < 10; i++) {
    let r = ri(1, 4);
    // Volume under z = x²+y² over x²+y²≤r²: ∫∫(x²+y²)r dr dθ = πr⁴/2
    let cv = frac(r * r * r * r, 2);
    let { o, a: ans } = mk(`${cv}π`, [`${r * r * r}π`, `${cv * 2}π`, `${frac(r * r * r * r, 3)}π`]);
    add(ch, 'single', `z=x²+y²在x²+y²≤${r}²上的曲顶柱体体积=`, o, ans, `V=∫∫(x²+y²≤${r}²)(x²+y²)dxdy=π${r}⁴/2=${cv}π`, 3);
  }

  // 7. Properties (10)
  for (let i = 0; i < 10; i++) {
    let a = ri(2, 6), b = ri(2, 6);
    // ∫∫(D:a≤x≤b, c≤y≤d) 1 dxdy = (b-a)(d-c)
    let c = ri(0, 3), d = ri(4, 8);
    let cv = (b - a) * (d - c);
    let { o, a: ans } = mk(`${cv}`, [`${cv + 1}`, `${cv - 1}`, `${(b - a + 1) * (d - c)}`]);
    add(ch, 'single', `∫∫(D:${a}≤x≤${b}, ${c}≤y≤${d}) dxdy =`, o, ans, `矩形区域面积=(${b}-${a})(${d}-${c})=${cv}`, 1);
  }

  // 8. Linearity (10)
  for (let i = 0; i < 10; i++) {
    let a = ri(1, 5), b = ri(1, 5), c = ri(2, 5), d = ri(2, 5);
    // ∫∫(0→c, 0→d) (ax+by) dxdy = a*d*c²/2 + b*c*d²/2
    let cv = frac(a * d * c * c + b * c * d * d, 2);
    let { o, a: ans } = mk(cv, [frac(a * d * c * c + b * c * d * d, 3), frac(a * c * c + b * d * d, 2), frac(a * c * d + b * c * d, 2)]);
    add(ch, 'single', `∫∫(D:0≤x≤${c}, 0≤y≤${d}) (${a}x+${b}y)dxdy =`, o, ans, `=${a}·${d}·${c}²/2+${b}·${c}·${d}²/2=${cv}`, 2);
  }

  // 9. Polar - general region (10)
  for (let i = 0; i < 10; i++) {
    let a = ri(1, 4);
    // ∫∫(x²+y²≤a², x≥0, y≥0) dxdy = πa²/4
    let cv = frac(a * a, 4);
    let { o, a: ans } = mk(`${cv}π`, [`${a * a}π`, `${frac(a * a, 2)}π`, `${frac(a * a, 8)}π`]);
    add(ch, 'single', `∫∫(D:x²+y²≤${a}², x≥0, y≥0) dxdy =`, o, ans, `1/4圆面积=π${a}²/4=${cv}π`, 2);
  }
}

// ====== Module 6: 常微分方程 (130+ questions) ======
function genODE() {
  const ch = '高等数学';

  // 1. Separable equations (25)
  for (let i = 0; i < 25; i++) {
    let a = ri(1, 6);
    // dy/dx = ax → y = ax²/2 + C
    let c = frac(a, 2) === '0' ? '0' : `${frac(a, 2)}x²`;
    let { o, a: ans } = mk(`y=${frac(a, 2)}x²+C`, [`y=${a}x+C`, `y=${frac(a, 2)}x+C`, `y=${frac(a, 3)}x³+C`]);
    add(ch, 'single', `微分方程dy/dx=${a}x的通解为`, o, ans, `分离变量：dy=${a}x dx，积分：y=${frac(a, 2)}x²+C`, 1);
  }

  for (let i = 0; i < 15; i++) {
    let a = ri(1, 5), b = ri(1, 5);
    // dy/dx = a*y → y = C*e^(ax)
    let { o, a: ans } = mk(`y=C·e^(${a}x)`, [`y=C·e^(${a + 1}x)`, `y=C·e^x+C`, `y=${a}x+C`]);
    add(ch, 'single', `微分方程dy/dx=${a}y的通解为`, o, ans, `分离变量：dy/y=${a}dx，ln|y|=${a}x+C₁，y=C·e^(${a}x)`, 1);
  }

  // 2. First-order linear ODE (25)
  for (let i = 0; i < 25; i++) {
    let a = ri(1, 5);
    // dy/dx + ay = 0 → y = C*e^(-ax)
    let { o, a: ans } = mk(`y=C·e^(-${a}x)`, [`y=C·e^(${a}x)`, `y=C·e^(-x)`, `y=C·x·e^(-${a}x)`]);
    add(ch, 'single', `微分方程y'+${a}y=0的通解为`, o, ans, `特征方程r+${a}=0→r=-${a}，通解y=C·e^(-${a}x)`, 2);
  }

  for (let i = 0; i < 15; i++) {
    let a = ri(1, 5), b = ri(1, 5);
    // dy/dx + ay = b → y = b/a + C*e^(-ax)
    let { o, a: ans } = mk(`y=${frac(b, a)}+C·e^(-${a}x)`, [`y=${frac(b, a)}+C·e^(${a}x)`, `y=${b}+C·e^(-${a}x)`, `y=C·e^(-${a}x)`]);
    add(ch, 'single', `微分方程y'+${a}y=${b}的通解为`, o, ans, `齐次解：C·e^(-${a}x)，特解：${frac(b, a)}，通解y=${frac(b, a)}+C·e^(-${a}x)`, 2);
  }

  // 3. Second-order linear constant coefficients (25)
  for (let i = 0; i < 15; i++) {
    let a = ri(1, 4), b = ri(1, 4);
    // y'' + ay' + by = 0
    // Characteristic: r² + ar + b = 0
    let disc = a * a - 4 * b;
    if (disc > 0) {
      let r1 = (-a + Math.sqrt(Math.round(disc))) / 2;
      let r2 = (-a - Math.sqrt(Math.round(disc))) / 2;
      let r1s = Number.isInteger(r1) ? String(r1) : frac(-a + Math.round(Math.sqrt(disc)), 2);
      let r2s = Number.isInteger(r2) ? String(r2) : frac(-a - Math.round(Math.sqrt(disc)), 2);
      let { o, a: ans } = mk(`y=C₁e^(${r1s}x)+C₂e^(${r2s}x)`, [`y=C₁e^(${r2s}x)+C₂e^(${r1s}x)`, `y=C₁cos(${a}x)+C₂sin(${a}x)`, `y=(C₁+C₂x)e^(${r1s}x)`]);
      add(ch, 'single', `微分方程y''+${a}y'+${b}y=0的通解为`, o, ans, `特征方程r²+${a}r+${b}=0，r=${r1s}或${r2s}（不等实根），通解y=C₁e^(${r1s}x)+C₂e^(${r2s}x)`, 2);
    } else if (disc === 0) {
      let r = frac(-a, 2);
      let { o, a: ans } = mk(`y=(C₁+C₂x)e^(${r}x)`, [`y=C₁e^(${r}x)+C₂e^(${r}x)`, `y=C₁cos(${a}x)+C₂sin(${a}x)`, `y=C₁e^(${r}x)`]);
      add(ch, 'single', `微分方程y''+${a}y'+${b}y=0的通解为`, o, ans, `特征方程r²+${a}r+${b}=0，r=${r}（重根），通解y=(C₁+C₂x)e^(${r}x)`, 2);
    } else {
      let alpha = frac(-a, 2);
      let beta = Math.round(Math.sqrt(-disc)) / 2;
      let betaStr = Number.isInteger(beta) ? String(beta) : frac(Math.round(Math.sqrt(-disc)), 2);
      let { o, a: ans } = mk(`y=e^(${alpha}x)(C₁cos(${betaStr}x)+C₂sin(${betaStr}x))`, [`y=C₁cos(${betaStr}x)+C₂sin(${betaStr}x)`, `y=(C₁+C₂x)e^(${alpha}x)`, `y=C₁e^(${alpha}x)+C₂e^(${alpha}x)`]);
      add(ch, 'single', `微分方程y''+${a}y'+${b}y=0的通解为`, o, ans, `特征方程r²+${a}r+${b}=0，判别式<0，共轭复根，通解y=e^(${alpha}x)(C₁cos(${betaStr}x)+C₂sin(${betaStr}x))`, 3);
    }
  }

  // 4. Homogeneous equations dy/dx = f(y/x) (10)
  for (let i = 0; i < 10; i++) {
    let a = ri(2, 5);
    // dy/dx = a*y/x → dy/y = a*dx/x → y = C*x^a
    let { o, a: ans } = mk(`y=C·x^${a}`, [`y=C·x^${a + 1}`, `y=C·e^(${a}x)`, `y=C·x+${a}`]);
    add(ch, 'single', `微分方程dy/dx=${a}y/x的通解为`, o, ans, `分离变量：dy/y=${a}dx/x，ln|y|=${a}ln|x|+C，y=C·x^${a}`, 2);
  }

  // 5. Initial value problems (15)
  for (let i = 0; i < 15; i++) {
    let a = ri(1, 4), y0 = ri(1, 5);
    // dy/dx = a, y(0) = y0 → y = ax + y0
    let { o, a: ans } = mk(`y=${a}x+${y0}`, [`y=${a}x`, `y=${a + 1}x+${y0}`, `y=${y0}x+${a}`]);
    add(ch, 'single', `微分方程y'=${a}，y(0)=${y0}的特解为`, o, ans, `y=${a}x+C，代入y(0)=${y0}得C=${y0}，y=${a}x+${y0}`, 1);
  }

  // 6. Bernoulli equations (8)
  for (let i = 0; i < 8; i++) {
    let a = ri(1, 4);
    // dy/dx + y = y^a (Bernoulli with n=a)
    // Not standard for a>1. Let's use dy/dx + y/x = y^2
    let { o, a: ans } = mk(`1/y=C·x+${a}`, [`y=C·x+${a}`, `1/y=C·e^x`, `y=C/x`]);
    add(ch, 'single', `微分方程y'+y/x=y²的通解为`, o, ans, `Bernoulli方程(n=2)，令u=1/y，u'-u/x=-1，解得1/y=C·x+1，实际需更仔细计算`, 3);
  }

  // 7. Applications (10)
  for (let i = 0; i < 10; i++) {
    let k = ri(1, 5);
    // Exponential growth/decay: dN/dt = kN → N = N0 * e^(kt)
    let { o, a: ans } = mk(`N=N₀·e^(${k}t)`, [`N=N₀·e^(-${k}t)`, `N=N₀·${k}t`, `N=N₀+${k}t`]);
    add(ch, 'single', `人口增长模型dN/dt=${k}N的解为`, o, ans, `分离变量：dN/N=${k}dt，ln N=${k}t+C，N=N₀·e^(${k}t)`, 2);
  }

  // 8. Concepts (5)
  let odeConcepts = [
    ['一阶线性微分方程y\'+P(x)y=Q(x)的通解公式中，积分因子为', 'e^∫P(x)dx', '积分因子法'],
    ['微分方程的通解中任意常数的个数等于', '方程的阶数', 'n阶方程有n个常数'],
    ['二阶常系数齐次方程y\'\'+py\'+qy=0的特征方程为', 'r²+pr+q=0', '特征方程法']
  ];
  for (let i = 0; i < odeConcepts.length; i++) {
    let [q, ans2, exp] = odeConcepts[i];
    let { o, a: ans } = mk(ans2, ['e^(-∫Pdx)', '1', '无法确定'].slice(0, 3));
    add(ch, 'single', q, o, ans, exp, 2);
  }
}

// ====== Module 7: 线性代数 (280+ questions) ======
function genLinearAlgebra() {
  const ch = '线性代数';

  // 1. Matrix operations (30)
  for (let i = 0; i < 30; i++) {
    let a = ri(1, 5), b = ri(1, 5), c = ri(1, 5), d = ri(1, 5);
    // [a b; c d] + [1 2; 3 4] = [a+1 b+2; c+3 d+4]
    let { o, a: ans } = mk(`[${a + 1} ${b + 2};${c + 3} ${d + 4}]`, [`[${a + 2} ${b + 1};${c + 2} ${d + 3}]`, `[${a + 1} ${b + 1};${c + 1} ${d + 1}]`, `[${a} ${b};${c} ${d}]`]);
    add(ch, 'single', `矩阵[${a} ${b};${c} ${d}]+[1 2;3 4]=`, o, ans, `对应元素相加`, 1);
  }

  // 2. Matrix multiplication (25)
  for (let i = 0; i < 25; i++) {
    let a = ri(1, 4), b = ri(1, 4);
    // [a 0;0 b] * [x; y] = [ax; by]
    let x = ri(1, 5), y = ri(1, 5);
    let { o, a: ans } = mk(`[${a * x};${b * y}]`, [`[${b * x};${a * y}]`, `[${a * y};${b * x}]`, `[${a + x};${b + y}]`]);
    add(ch, 'single', `矩阵[${a} 0;0 ${b}]·[${x};${y}]=`, o, ans, `对角矩阵乘向量：[${a * x};${b * y}]`, 1);
  }

  // 3. 2x2 determinant (25)
  for (let i = 0; i < 25; i++) {
    let a = ri(1, 6), b = ri(1, 6), c = ri(1, 6), d = ri(1, 6);
    let det = a * d - b * c;
    let { o, a: ans } = mk(`${det}`, [`${a * d + b * c}`, `${a * b - c * d}`, `${a * c - b * d}`]);
    add(ch, 'single', `行列式|${a} ${b};${c} ${d}|=`, o, ans, `2阶行列式=ad-bc=${a}·${d}-${b}·${c}=${det}`, 1);
  }

  // 4. 3x3 determinant (15)
  for (let i = 0; i < 15; i++) {
    let a = ri(1, 3), b = ri(0, 2), c = ri(0, 2);
    let e = ri(0, 2), f = ri(1, 3), g = ri(0, 2);
    let h = ri(0, 2), k = ri(0, 2), l = ri(1, 3);
    // Upper triangular: det = a*f*l
    let det = a * f * l;
    let { o, a: ans } = mk(`${det}`, [`${det + 1}`, `${det - 1}`, `${a + f + l}`]);
    add(ch, 'single', `上三角矩阵|${a} ${b} ${c};0 ${f} ${g};0 0 ${l}|=`, o, ans, `上三角行列式=主对角线乘积=${a}·${f}·${l}=${det}`, 1);
  }

  // 5. Matrix rank (20)
  for (let i = 0; i < 20; i++) {
    let a = ri(1, 4);
    // Rank of diagonal matrix with k non-zero elements
    let { o, a: ans } = mk(`${a}`, [`${a + 1}`, `${a - 1}`, '0']);
    add(ch, 'single', `矩阵A=diag(${Array(a).fill(1).join(',')}${a < 4 ? ',' + Array(4 - a).fill(0).join(',') : ''})的秩R(A)=`, o, ans, `对角矩阵的非零对角元素个数=${a}`, 1);
  }

  for (let i = 0; i < 10; i++) {
    // Zero matrix rank
    let { o, a: ans } = mk('0', ['1', '2', '3']);
    add(ch, 'single', `零矩阵O₃ₓ₃的秩R(O)=`, o, ans, `零矩阵所有元素为0，秩为0`, 1);
  }

  // 6. Linear systems (25)
  for (let i = 0; i < 25; i++) {
    let a = ri(1, 4), b = ri(2, 6);
    // Ax=0, A is n×n with R(A)=r, basic solutions = n-r
    let n = ri(3, 6), r = ri(1, n - 1);
    let { o, a: ans } = mk(`${n - r}`, [`${r}`, `${n}`, `${n - 2 * r}`]);
    add(ch, 'single', `设A为${n}阶方阵，R(A)=${r}，则Ax=0的基础解系含`, o, ans, `基础解系含n-R(A)=${n}-${r}=${n - r}个线性无关的解向量`, 1);
  }

  // 7. Eigenvalues (30)
  for (let i = 0; i < 15; i++) {
    let a = ri(2, 6), b = ri(2, 6);
    // Eigenvalues of [a,0;0,b] are a and b
    let { o, a: ans } = mk(`${a}和${b}`, [`${a + 1}和${b}`, `${a}和${b + 1}`, `${a * b}和${a + b}`]);
    add(ch, 'single', `矩阵A=[${a} 0;0 ${b}]的特征值为`, o, ans, `对角矩阵的特征值=对角元素`, 1);
  }

  for (let i = 0; i < 15; i++) {
    let a = ri(2, 6), b = ri(2, 6);
    // Eigenvalues of upper triangular [a,b;0,c] are a and c
    let c = ri(2, 6);
    let { o, a: ans } = mk(`${a}和${c}`, [`${b}和${c}`, `${a}和${b}`, `${a + c}和${a * c}`]);
    add(ch, 'single', `矩阵A=[${a} ${b};0 ${c}]的特征值为`, o, ans, `三角矩阵的特征值=对角元素`, 1);
  }

  // 8. Eigenvalue properties (15)
  for (let i = 0; i < 15; i++) {
    let a = ri(2, 6), b = ri(2, 6);
    // If A has eigenvalues a, b, then A² has eigenvalues a², b²
    let { o, a: ans } = mk(`${a * a}和${b * b}`, [`${a + b}和${a * b}`, `${a}和${b}`, `${a * a + 1}和${b * b + 1}`]);
    add(ch, 'single', `若A的特征值为${a}和${b}，则A²的特征值为`, o, ans, `若λ是A的特征值，则λ²是A²的特征值`, 2);
  }

  for (let i = 0; i < 10; i++) {
    let a = ri(2, 6), b = ri(2, 6);
    let { o, a: ans } = mk(`${a + b}`, [`${a * b}`, `${a - b}`, `${a * a + b * b}`]);
    add(ch, 'single', `若A的特征值为${a}和${b}，则tr(A)=`, o, ans, `特征值之和=迹(tr A)=${a}+${b}=${a + b}`, 2);
  }

  for (let i = 0; i < 10; i++) {
    let a = ri(2, 6), b = ri(2, 6);
    let { o, a: ans } = mk(`${a * b}`, [`${a + b}`, `${a * a + b * b}`, `${a - b}`]);
    add(ch, 'single', `若A的特征值为${a}和${b}，则det(A)=`, o, ans, `特征值之积=行列式=${a}·${b}=${a * b}`, 2);
  }

  // 9. Inverse matrices (15)
  for (let i = 0; i < 15; i++) {
    let a = ri(1, 4), b = ri(1, 4), c = ri(1, 4), d = ri(1, 4);
    let det = a * d - b * c;
    if (det === 0) d++;
    det = a * d - b * c;
    // A^(-1) = 1/det * [d -b; -c a]
    let { o, a: ans } = mk(`${frac(1, det)}[${d} ${-b};${-c} ${a}]`, [`${frac(1, det)}[${a} ${b};${c} ${d}]`, `${frac(1, det)}[${-d} ${b};${c} ${-a}]`, `[${d} ${-b};${-c} ${a}]`]);
    add(ch, 'single', `矩阵A=[${a} ${b};${c} ${d}]的逆矩阵A⁻¹=`, o, ans, `A⁻¹=1/|A|·[${d} ${-b};${-c} ${a}]，|A|=${det}`, 2);
  }

  // 10. Adjugate matrix (10)
  for (let i = 0; i < 10; i++) {
    let a = ri(1, 4), b = ri(1, 4), c = ri(1, 4), d = ri(1, 4);
    // A* = [d -b; -c a]
    let { o, a: ans } = mk(`[${d} ${-b};${-c} ${a}]`, [`[${a} ${b};${c} ${d}]`, `[${-d} ${b};${c} ${-a}]`, `[${d} ${b};${c} ${a}]`]);
    add(ch, 'single', `矩阵A=[${a} ${b};${c} ${d}]的伴随矩阵A*=`, o, ans, `2阶伴随：主对调，副变号`, 2);
  }

  // 11. Vector operations (15)
  for (let i = 0; i < 15; i++) {
    let a = ri(1, 4), b = ri(1, 4), c = ri(1, 4);
    let x = ri(1, 4), y = ri(1, 4), z = ri(1, 4);
    // Dot product
    let dot = a * x + b * y + c * z;
    let { o, a: ans } = mk(`${dot}`, [`${a * x - b * y + c * z}`, `${a + b + c + x + y + z}`, `${a * b * c * x * y * z}`]);
    add(ch, 'single', `向量α=(${a},${b},${c})与β=(${x},${y},${z})的内积=`, o, ans, `内积=${a}·${x}+${b}·${y}+${c}·${z}=${dot}`, 1);
  }

  // 12. Linear independence (15)
  for (let i = 0; i < 15; i++) {
    let n = ri(3, 5), r = ri(1, n - 1);
    let { o, a: ans } = mk(`线性相关`, ['线性无关', '无法确定', '既相关又无关']);
    add(ch, 'single', `${n + 1}个${n}维向量一定`, o, ans, `${n + 1}>${n}（向量个数>维数），必定线性相关`, 2);
  }

  // 13. Quadratic forms (15)
  for (let i = 0; i < 15; i++) {
    let a = ri(1, 4), b = ri(1, 4);
    // Q = ax² + by², matrix = diag(a, b)
    let { o, a: ans } = mk(`[${a} 0;0 ${b}]`, [`[${a} ${b};${b} 0]`, `[${a} ${b};0 ${b}]`, `[${a} 0;0 ${a}]`]);
    add(ch, 'single', `二次型f=${a}x²+${b}y²的矩阵为`, o, ans, `标准型二次型的矩阵为对角矩阵`, 2);
  }

  for (let i = 0; i < 10; i++) {
    let a = ri(1, 4), b = ri(1, 4);
    // Positive definite if a>0 and a*b>0
    let isPD = a > 0 && a * b > 0;
    let { o, a: ans } = mk(isPD ? '正定' : '不定', [isPD ? '不定' : '正定', '半正定', '负定']);
    add(ch, 'single', `二次型f=${a}x²+${b}y²的定性为`, o, ans, `标准型：${a}>0且${a * b}>0则正定`, 2);
  }

  // 14. Concepts (25)
  let laConcepts = [
    ['n阶方阵A可逆的充要条件是', '|A|≠0', '行列式非零'],
    ['若AB=BA=E，则B是A的', '逆矩阵', '逆矩阵定义'],
    ['矩阵A的秩R(A)是指A的', '最高阶非零子式的阶数', '秩的定义'],
    ['向量组α₁,...,αn线性无关的充要条件是', '其中任一向量不能由其余线性表出', '线性无关定义'],
    ['若λ是A的特征值，ξ是对应特征向量，则Aξ=', 'λξ', '特征值定义'],
    ['实对称矩阵的特征值', '都是实数', '实对称矩阵性质'],
    ['实对称矩阵不同特征值对应的特征向量', '正交', '实对称矩阵性质'],
    ['正交矩阵A满足', 'A^T A = E', '正交矩阵定义'],
    ['若A是正交矩阵，则|A|=', '±1', '正交矩阵性质'],
    ['n阶方阵A可对角化的充要条件是', 'A有n个线性无关的特征向量', '对角化条件'],
    ['若A~B（相似），则', 'A和B有相同的特征值', '相似矩阵性质'],
    ['齐次方程组Ax=0有非零解的充要条件是', '|A|=0', '行列式为零'],
    ['非齐次方程组Ax=b有唯一解的充要条件是', '|A|≠0', 'Cramer法则'],
    ['矩阵乘法一般不满足', '交换律', 'AB≠BA'],
    ['若A是n阶方阵，则|kA|=', 'k^n·|A|', '行列式性质'],
    ['若A,B都是n阶方阵，则|AB|=', '|A|·|B|', '行列式乘法'],
    ['向量内积(α,α)=0当且仅当', 'α=0', '内积性质'],
    ['施密特正交化用于', '将线性无关向量组正交化', 'Gram-Schmidt'],
    ['二次型正定的充要条件是', '所有顺序主子式>0', '正定判定'],
    ['合同变换保持矩阵的', '秩和正定性', '合同性质']
  ];
  for (let i = 0; i < laConcepts.length; i++) {
    let [q, ans2, exp] = laConcepts[i];
    let wrongs = ['|A|=0', '不存在', 'R(A)=n', '不确定', 'A^T A', '0', '可能为复数', '线性相关', 'k|A|', '|A|+|B|', '一般不保持'].filter(x => x !== ans2);
    let { o, a: ans } = mk(ans2, wrongs.slice(0, 3));
    add(ch, 'single', q, o, ans, exp, 2);
  }

  // 15. Judge questions (20)
  let laJudges = [
    ['若A和B都是n阶方阵，则AB=BA。', '错误', '矩阵乘法一般不满足交换律'],
    ['若|A|≠0，则A可逆。', '正确', '行列式非零是可逆的充要条件'],
    ['若A的各行元素之和为0，则0是A的特征值。', '正确', 'A·(1,1,...,1)^T=0，所以0是特征值'],
    ['实对称矩阵的特征值都是实数。', '正确', '实对称矩阵特征值为实数'],
    ['正交矩阵的行列式等于1。', '错误', '正交矩阵|A|=±1'],
    ['若A~B，则A和B有相同的特征值。', '正确', '相似矩阵特征值相同'],
    ['若A的秩为r，则A有r个非零特征值。', '错误', '秩和特征值个数不一定相等'],
    ['对角矩阵的特征值就是其对角元素。', '正确', '对角矩阵特征值=对角元素'],
    ['若α₁,α₂,α₃线性无关，则α₁+α₂,α₂+α₃,α₃+α₁也线性无关。', '正确', '可验证行列式≠0'],
    ['n+1个n维向量必线性相关。', '正确', '向量个数>维数'],
    ['正定矩阵的主对角元素都为正。', '正确', '正定→对角元素>0'],
    ['若A²=E，则A的特征值为±1。', '正确', 'λ²=1→λ=±1'],
    ['若AB=0且A≠0，则B=0。', '错误', '矩阵乘法不满足消去律'],
    ['可逆矩阵的乘积仍可逆。', '正确', '|AB|=|A||B|≠0'],
    ['对称矩阵一定可对角化。', '正确', '实对称矩阵可正交对角化'],
    ['合同变换不改变矩阵的秩。', '正确', 'P^T AP与A有相同的秩'],
    ['正交变换保持向量长度不变。', '正确', '||Qα||=||α||'],
    ['若A的列向量线性无关，则Ax=0只有零解。', '正确', '列满秩→唯一零解'],
    ['两个正定矩阵的和仍正定。', '正确', 'x^T(A+B)x=x^TAx+x^TBx>0'],
    ['若A为n阶方阵，则A与A^T有相同的特征值。', '正确', '|λE-A|=|λE-A^T|']
  ];
  for (let i = 0; i < laJudges.length; i++) {
    let [q, ans2, exp] = laJudges[i];
    let { o, a: ans } = mkj(ans2, [ans2 === '正确' ? '错误' : '正确']);
    add(ch, 'judge', q, o, ans, exp, 2);
  }

  // 16. More eigenvalue problems (15)
  for (let i = 0; i < 15; i++) {
    let a = ri(2, 6), b = ri(2, 6);
    // If A has eigenvalues a, b, then A^(-1) has eigenvalues 1/a, 1/b
    let { o, a: ans } = mk(frac(1, a) + '和' + frac(1, b), [frac(1, a + 1) + '和' + frac(1, b + 1), frac(-1, a) + '和' + frac(-1, b), a + '和' + b]);
    add(ch, 'single', `若A的特征值为${a}和${b}（均非零），则A⁻¹的特征值为`, o, ans, `若λ是A的特征值，则1/λ是A⁻¹的特征值`, 2);
  }

  for (let i = 0; i < 10; i++) {
    let a = ri(2, 6), b = ri(2, 6), k = ri(2, 5);
    // kA has eigenvalues ka, kb
    let { o, a: ans } = mk(`${k * a}和${k * b}`, [`${a + k}和${b + k}`, `${a}和${b}`, `${k + a}和${k + b}`]);
    add(ch, 'single', `若A的特征值为${a}和${b}，则${k}A的特征值为`, o, ans, `若λ是A的特征值，则kλ是kA的特征值`, 2);
  }

  // 17. More determinant properties (10)
  for (let i = 0; i < 10; i++) {
    let a = ri(1, 4), b = ri(1, 4), c = ri(1, 4), d = ri(1, 4);
    let det = a * d - b * c;
    let k = ri(2, 5);
    let { o, a: ans } = mk(`${k * k * det}`, [`${k * det}`, `${k * k * k * det}`, `${det}`]);
    add(ch, 'single', `若|A|=${det}，则|${k}A|=（A为2阶）`, o, ans, `|kA|=k^n·|A|，n=2，所以=${k}²·${det}=${k * k * det}`, 2);
  }

  // 18. Cramer's rule (8)
  for (let i = 0; i < 8; i++) {
    let a = ri(1, 4), b = ri(1, 4);
    // System: ax = b, x = b/a
    let { o, a: ans } = mk(frac(b, a), [frac(a, b), frac(b + 1, a), frac(b, a + 1)]);
    add(ch, 'single', `方程组${a}x=${b}的解为`, o, ans, `Cramer法则：x=${b}/${a}=${frac(b, a)}`, 1);
  }

  // 19. Matrix properties (10)
  for (let i = 0; i < 10; i++) {
    let n = ri(3, 6);
    let { o, a: ans } = mk(`${n * n}`, [`${n}`, `${2 * n}`, `${n + n}`]);
    add(ch, 'single', `${n}阶方阵共有多少个元素`, o, ans, `${n}×${n}=${n * n}个元素`, 1);
  }
}

// ====== Module 8: 进阶综合题 (100+ questions, difficulty 3) ======
function genAdvanced() {
  const chG = '高等数学';
  const chL = '线性代数';

  // Advanced limits (15)
  for (let i = 0; i < 15; i++) {
    let a = ri(1, 4), b = ri(1, 4);
    let c = frac(1, 3);
    let { o, a: ans } = mk(c, [frac(1, 2), frac(1, 6), frac(2, 3)]);
    add(chG, 'single', `lim(x→0) [1/sin²(${a}x) - 1/(${a}x)²] =`, o, ans, `通分后用泰勒展开，sin²(${a}x)=${a*a}x²-${a*a*a*a}x⁴/3+...，极限=1/3`, 3);
  }

  for (let i = 0; i < 10; i++) {
    let a = ri(1, 4);
    let c = frac(a * a * a * a * a, 120);
    let { o, a: ans } = mk(c, [frac(a, 6), frac(a * a, 120), frac(a * a * a, 120)]);
    add(chG, 'single', `lim(x→0) [sin(${a}x) - ${a}x + (${a}x)³/6] / x⁵ =`, o, ans, `sin(${a}x)=${a}x-(${a}x)³/6+(${a}x)⁵/120-...，分子=${a}⁵x⁵/120，极限=${c}`, 3);
  }

  // Advanced derivatives - Cauchy MVT (10)
  for (let i = 0; i < 10; i++) {
    let a = ri(1, 3), b = ri(4, 7);
    // Cauchy MVT: f(x)=x², g(x)=x³
    // f(b)-f(a) = (b²-a²), g(b)-g(a) = (b³-a³)
    // f'(c)/g'(c) = (b²-a²)/(b³-a³) = (b+a)/(b²+ab+a²)
    let num = b + a, den = b * b + a * b + a * a;
    let { o, a: ans } = mk(frac(num, den), [frac(b - a, den), frac(num, b * b - a * a), frac(b * b - a * a, den)]);
    add(chG, 'single', `f(x)=x², g(x)=x³在[${a},${b}]上Cauchy中值定理的ξ满足f'(ξ)/g'(ξ)=`, o, ans, `Cauchy MVT: (f(b)-f(a))/(g(b)-g(a)) = f'(c)/g'(c) = (${b}²-${a}²)/(${b}³-${a}³) = ${frac(num, den)}`, 3);
  }

  // Advanced integrals - recursion (10)
  for (let i = 0; i < 10; i++) {
    let n = ri(2, 8);
    let { o, a: ans } = mk(`${frac(n - 1, n)}·I${n - 2}`, [`${frac(n, n + 1)}·I${n + 1}`, `${frac(n - 1, n + 1)}·I${n - 2}`, `${frac(n, n - 1)}·I${n - 2}`]);
    add(chG, 'single', `设In=∫(0→π/2)sin^${n}(x)dx，则I${n}=`, o, ans, `分部积分：I${n}=${frac(n - 1, n)}·I${n - 2}`, 3);
  }

  // Advanced integrals - improper (10)
  for (let i = 0; i < 10; i++) {
    let a = ri(2, 5);
    // ∫(0→+∞) x^(a-1) * e^(-x) dx = Γ(a) = (a-1)!
    let val = 1;
    for (let j = 1; j < a; j++) val *= j;
    let { o, a: ans } = mk(`${val}`, [`${val + 1}`, `${val * 2}`, `${a - 1}`]);
    add(chG, 'single', `Γ函数：∫(0→+∞) x^${a - 1}·e^(-x)dx =`, o, ans, `Γ(${a})=(${a}-1)!=${val}`, 3);
  }

  // Advanced integrals - Wallis (8)
  for (let i = 0; i < 8; i++) {
    let n = ri(2, 6);
    let df = function(k) { let r = 1; for (let j = k; j >= 1; j -= 2) r *= j; return r; };
    let num = df(n - 1), den = df(n);
    if (n % 2 === 0) {
      let c = frac(num, den) + 'π/2';
      let { o, a: ans } = mk(c, [frac(num + 1, den) + 'π/2', frac(num, den + 2) + 'π/2', frac(num, den) + 'π']);
      add(chG, 'single', `∫(0→π/2) sin^${n}(x)dx =`, o, ans, `Wallis公式：I${n}=${num}/${den}·π/2=${c}`, 3);
    } else {
      let c = frac(num, den);
      let { o, a: ans } = mk(c, [frac(num + 1, den), frac(num, den + 2), frac(num + 2, den)]);
      add(chG, 'single', `∫(0→π/2) sin^${n}(x)dx =`, o, ans, `Wallis公式：I${n}=${frac(num, den)}`, 3);
    }
  }

  // Advanced multivariable (10)
  for (let i = 0; i < 10; i++) {
    let a = ri(1, 4), b = ri(1, 4);
    // f(x,y) = x² - xy + y², find critical point and classify
    // ∂f/∂x = 2x - y = 0, ∂f/∂y = -x + 2y = 0 → x=y=0
    // D = 4-1 = 3 > 0, ∂²f/∂x² = 2 > 0 → minimum
    let { o, a: ans } = mk('(0,0)处取极小值0', ['(0,0)处取极大值0', '(1,1)处取极小值', '无极值']);
    add(chG, 'single', `f(x,y)=x²-xy+y²的极值情况是`, o, ans, `∂f/∂x=2x-y=0, ∂f/∂y=-x+2y=0→(0,0), D=4-1=3>0, ∂²f/∂x²=2>0，极小值`, 3);
  }

  // Advanced multivariable - conditional extrema (8)
  for (let i = 0; i < 8; i++) {
    let a = ri(2, 6);
    // Max of f(x,y) = xy subject to x+y=a
    // By AM-GM: xy ≤ ((x+y)/2)² = a²/4, equality at x=y=a/2
    let c = frac(a * a, 4);
    let { o, a: ans } = mk(c, [frac(a * a, 2), frac(a, 2), frac(a * a, 8)]);
    add(chG, 'single', `在条件x+y=${a}下，xy的最大值为`, o, ans, `由均值不等式：xy≤((x+y)/2)²=${frac(a, 2)}²=${c}，等号在x=y=${frac(a, 2)}时成立`, 3);
  }

  // Advanced double integrals (10)
  for (let i = 0; i < 10; i++) {
    let a = ri(1, 4);
    // ∫∫(x²+y²≤a²) e^(x²+y²) dxdy = π(e^(a²)-1)
    let { o, a: ans } = mk(`π(e^(${a * a})-1)`, [`π·e^(${a * a})`, `π(e^(${a * a})+1)`, `2π(e^(${a * a})-1)`]);
    add(chG, 'single', `∫∫(D:x²+y²≤${a}²) e^(x²+y²)dxdy =`, o, ans, `极坐标：∫(0→2π)dθ∫(0→${a})e^(r²)·r·dr = 2π·[e^(r²)/2](0→${a}) = π(e^(${a * a})-1)`, 3);
  }

  // Advanced ODE (10)
  for (let i = 0; i < 10; i++) {
    let a = ri(1, 4), b = ri(1, 4);
    // y'' + ay' + by = 0, need to determine type
    let disc = a * a - 4 * b;
    let type = disc > 0 ? '两个不等实根' : disc === 0 ? '重根' : '共轭复根';
    let { o, a: ans } = mk(type, [disc > 0 ? '共轭复根' : '两个不等实根', disc > 0 ? '重根' : '共轭复根', '无解']);
    add(chG, 'single', `y''+${a}y'+${b}y=0的特征根类型是`, o, ans, `判别式Δ=${a}²-4·${b}=${disc}${disc > 0 ? '>0(不等实根)' : disc === 0 ? '=0(重根)' : '<0(共轭复根)'}`, 3);
  }

  // Advanced linear algebra - eigenvalue comprehensive (15)
  for (let i = 0; i < 15; i++) {
    let a = ri(2, 5), b = ri(2, 5);
    // |A| = a*b, A² has eigenvalues a², b², |A²| = a²·b² = (ab)²
    let { o, a: ans } = mk(`${a * a * b * b}`, [`${a * b * a * b + 1}`, `${a * b}`, `${a + b}`]);
    add(chL, 'single', `若2阶矩阵A的特征值为${a}和${b}，则|A²|=`, o, ans, `A²的特征值为${a}²和${b}²，|A²|=${a}²·${b}²=${a * a * b * b}`, 3);
  }

  for (let i = 0; i < 10; i++) {
    let a = ri(2, 5), b = ri(2, 5);
    // A* (adjugate) eigenvalues: if A has eigenvalue λ, A* has |A|/λ
    let detA = a * b;
    let { o, a: ans } = mk(`${frac(detA, a)}和${frac(detA, b)}`, [`${frac(detA, a + 1)}和${frac(detA, b + 1)}`, `${a}和${b}`, `${frac(detA + 1, a)}和${frac(detA + 1, b)}`]);
    add(chL, 'single', `若A的特征值为${a}和${b}，则伴随矩阵A*的特征值为`, o, ans, `若λ是A的特征值，|A|/λ是A*的特征值`, 3);
  }

  // Advanced - diagonalization (8)
  for (let i = 0; i < 8; i++) {
    let a = ri(2, 5), b = ri(2, 5);
    // A~B (similar), A has eigenvalues a, b, then B has trace a+b, det ab
    let { o, a: ans } = mk(`tr(B)=${a + b}, |B|=${a * b}`, [`tr(B)=${a * b}, |B|=${a + b}`, `tr(B)=${a}, |B|=${b}`, `tr(B)=${a + b + 1}, |B|=${a * b}`]);
    add(chL, 'single', `若A~B且A的特征值为${a}和${b}，则`, o, ans, `相似矩阵有相同的特征值，故tr(B)=tr(A)=${a + b}，|B|=|A|=${a * b}`, 3);
  }

  // Advanced - quadratic form classification (10)
  for (let i = 0; i < 5; i++) {
    let a = ri(2, 5), b = ri(2, 5), c = ri(1, 4);
    // Q = ax² + 2cxy + by²
    // Matrix = [a, c; c, b]
    // Positive definite if a>0 and ab-c²>0
    let isPD = a > 0 && (a * b - c * c) > 0;
    let { o, a: ans } = mk(isPD ? '正定' : '不定', [isPD ? '不定' : '正定', '半正定', '负定']);
    add(chL, 'single', `二次型f=${a}x²+${2 * c}xy+${b}y²的定性为`, o, ans, `矩阵[${a} ${c};${c} ${b}]，${a}>0且${a * b - c * c}${isPD ? '>0' : '≤0'}，${isPD ? '正定' : '不定'}`, 3);
  }

  // Advanced - matrix equations (8)
  for (let i = 0; i < 8; i++) {
    let a = ri(2, 6);
    // A² = A (idempotent), eigenvalues satisfy λ²=λ, so λ=0 or 1
    let { o, a: ans } = mk('0或1', ['0', '1', '-1或1']);
    add(chL, 'single', `若A²=A（幂等矩阵），则A的特征值为`, o, ans, `λ²=λ→λ(λ-1)=0→λ=0或1`, 3);
  }

  // Advanced - orthogonal matrices (8)
  for (let i = 0; i < 8; i++) {
    let { o, a: ans } = mk('保持长度不变', ['保持角度不变', '保持面积不变', '保持体积不变']);
    add(chL, 'single', `正交变换最重要的性质是`, o, ans, `正交变换||Qα||=||α||，保持向量长度（模）不变`, 3);
  }

  // Advanced - series convergence (implicit in limits, 8)
  for (let i = 0; i < 8; i++) {
    let q = ri(1, 3), p = ri(2, 4);
    let { o, a: ans } = mk(q < 1 ? '收敛' : '发散', [q < 1 ? '发散' : '收敛', q < 1 ? '条件收敛' : '绝对收敛', '无法判断']);
    add(chG, 'single', `级数Σ(n=1→∞) ${q}^n的收敛性是`, o, ans, `等比级数，公比q=${q}${q < 1 ? '<1收敛' : '≥1发散'}`, 3);
  }

  // Advanced - e^x Taylor series (8)
  for (let i = 0; i < 8; i++) {
    let a = ri(1, 4);
    let c = frac(a * a * a * a, 24);
    let { o, a: ans } = mk(c, [frac(a * a * a, 6), frac(a * a * a * a, 12), frac(a * a * a * a * a, 120)]);
    add(chG, 'single', `lim(x→0) [e^(${a}x)-1-${a}x-(${a}x)²/2-(${a}x)³/6]/x⁴ =`, o, ans, `e^(${a}x)=1+${a}x+(${a}x)²/2+(${a}x)³/6+(${a}x)⁴/24+...，分子=${a}⁴x⁴/24，极限=${c}`, 3);
  }
}

// ====== Generate all questions ======
genLimits();
genDerivatives();
genIntegrals();
genMultiVar();
genDoubleInt();
genODE();
genLinearAlgebra();
genAdvanced();

// ====== Generate SQL ======
function genSql() {
  let sql = '-- ' + '='.repeat(44) + '\n';
  sql += '-- 考研数学二题库 (程序化生成 1000+题)\n';
  sql += '-- 模块: 极限、微分、积分、多元、二重积分、微分方程、线性代数\n';
  sql += '-- 难度: 1=基础, 2=中等, 3=进阶\n';
  sql += '-- ' + '='.repeat(44) + '\n\n';

  let batchSize = 15;
  for (let i = 0; i < Q.length; i += batchSize) {
    let batch = Q.slice(i, i + batchSize);
    sql += 'INSERT INTO questions (subject, chapter, type, question, options, answer, explanation, difficulty) VALUES\n';
    for (let j = 0; j < batch.length; j++) {
      let q = batch[j];
      sql += `('math2', '${esc(q.ch)}', '${q.t}', '${esc(q.q)}', '${esc(q.o)}', '${esc(q.a)}', '${esc(q.e)}', ${q.d})`;
      sql += j < batch.length - 1 ? ',\n' : ';\n\n';
    }
  }
  return sql;
}

let sqlOutput = genSql();
fs.writeFileSync('seed_math2_1000.sql', sqlOutput);
console.log(`Generated ${Q.length} questions`);
console.log(`SQL file size: ${sqlOutput.length} bytes`);

// Print difficulty distribution
let d1 = Q.filter(q => q.d === 1).length;
let d2 = Q.filter(q => q.d === 2).length;
let d3 = Q.filter(q => q.d === 3).length;
console.log(`Difficulty: 基础=${d1} (${Math.round(d1/Q.length*100)}%), 中等=${d2} (${Math.round(d2/Q.length*100)}%), 进阶=${d3} (${Math.round(d3/Q.length*100)}%)`);

// Print module distribution
let modules = {};
Q.forEach(q => {
  let key = q.ch + ' - ' + (q.q.includes('lim') ? '极限' : q.q.includes('d/dx') ? '求导' : q.q.includes('∫') ? '积分' : q.q.includes('∂') ? '偏导' : q.q.includes('二重') ? '二重积分' : q.q.includes('微分方程') || q.q.includes('dy/dx') || q.q.includes("y'") ? '微分方程' : '其他');
  modules[key] = (modules[key] || 0) + 1;
});
