import fs from 'node:fs';

const Q = [];
const seen = new Set();

function ri(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function gcd(a, b) { a = Math.abs(Math.round(a)); b = Math.abs(Math.round(b)); while (b !== 0) { [a, b] = [b, a % b]; } return a || 1; }
function frac(a, b) {
  if (b === 0) return '不存在';
  let g = gcd(Math.abs(a), Math.abs(b));
  a = Math.round(a / g); b = Math.round(b / g);
  if (b < 0) { a = -a; b = -b; }
  return b === 1 ? `${a}` : `${a}/${b}`;
}
function shuffle(arr) { let c = [...arr]; for (let i = c.length - 1; i > 0; i--) { let j = Math.floor(Math.random() * (i + 1)); [c[i], c[j]] = [c[j], c[i]]; } return c; }
function esc(s) { return String(s).replace(/'/g, "''"); }
function mk(correct, wrongs) {
  let opts = [correct];
  for (let w of wrongs) { if (w !== correct && !opts.includes(w)) opts.push(w); }
  while (opts.length < 4) { let v = String(ri(1, 999)); if (!opts.includes(v)) opts.push(v); }
  opts = opts.slice(0, 4);
  let sh = shuffle(opts);
  let idx = sh.indexOf(correct);
  let ans = 'ABCD'[idx];
  let formatted = sh.map((o, i) => `${'ABCD'[i]}. ${o}`);
  return { o: JSON.stringify(formatted), a: ans };
}
function mkj(correct) {
  let opts = shuffle(['正确', '错误']);
  let idx = opts.indexOf(correct);
  let ans = 'AB'[idx];
  let formatted = opts.map((v, i) => `${'AB'[i]}. ${v}`);
  return { o: JSON.stringify(formatted), a: ans };
}
function add(ch, t, q, o, a, e, d) { if (seen.has(q)) return; seen.add(q); Q.push({ ch, t, q, o, a, e, d }); }

function genLimits() {
  const ch = '第1章 函数、极限、连续';
  for (let i = 0; i < 12; i++) {
    let a = ri(2, 6), b = a + ri(1, 3);
    let { o, a: ans } = mk(frac(a, b), [frac(b, a), `${a * b}`, '1']);
    add(ch, 'single', `lim(x→0) sin(${a}x)/(${b}x)=`, o, ans, `sin(${a}x)~${a}x，原式=${a}/${b}`, 1);
  }
  for (let i = 0; i < 12; i++) {
    let a = ri(3, 6);
    let { o, a: ans } = mk(frac(a * a, 2), [`${a}`, `${a * a}`, '0']);
    add(ch, 'single', `lim(x→0) (1−cos(${a}x))/x²=`, o, ans, `1−cos(${a}x)~(${a}x)²/2，原式=${a * a}/2`, 2);
  }
  for (let i = 0; i < 10; i++) {
    let a = ri(1, 4);
    let { o, a: ans } = mk(`e^${2 * a}`, [`e^${a}`, 'e', '1']);
    add(ch, 'single', `lim(x→∞) ((x+${a})/(x−${a}))^x=`, o, ans, `[(x+${a})/(x−${a})]^x=[1+${2 * a}/(x−${a})]^x→e^${2 * a}`, 2);
  }
  for (let i = 0; i < 10; i++) {
    let a = ri(2, 3);
    let { o, a: ans } = mk(frac(a * a * a, 2), [frac(a * a * a, 6), `${a * a * a}`, frac(a, 2)]);
    add(ch, 'single', `lim(x→0) (tan(${a}x)−sin(${a}x))/x³=`, o, ans, `tan−sin=tan(1−cos)~${a}x·(${a}x)²/2，原式=${a * a * a}/2`, 3);
  }
  for (let i = 0; i < 10; i++) {
    let a = ri(2, 6), b = a + ri(1, 3);
    let { o, a: ans } = mk(frac(a, b), [frac(b, a), `${a + b}`, '0']);
    add(ch, 'single', `lim(x→0) ln(1+${a}x)/(${b}x)=`, o, ans, `ln(1+${a}x)~${a}x，原式=${a}/${b}`, 1);
  }
  for (let i = 0; i < 8; i++) {
    let a = ri(2, 6), b = a + ri(1, 3);
    let { o, a: ans } = mk(frac(a, b), [frac(b, a), `${a - b}`, '1']);
    add(ch, 'single', `lim(x→0) (e^(${a}x)−1)/(${b}x)=`, o, ans, `e^(${a}x)−1~${a}x，原式=${a}/${b}`, 1);
  }
  let concepts = [
    ['lim f(x)(x→x0)存在是f(x)在x0连续的', '必要非充分条件', ['充分非必要条件', '充要条件', '既非充分也非必要条件']],
    ['f(x)=sinx/x在x=0处的间断点类型是', '可去间断点', ['跳跃间断点', '无穷间断点', '振荡间断点']],
    ['f(x)=1/x在x=0处的间断点类型是', '无穷间断点', ['可去间断点', '跳跃间断点', '振荡间断点']],
    ['符号函数sgn(x)在x=0处的间断点类型是', '跳跃间断点', ['可去间断点', '无穷间断点', '振荡间断点']],
    ['f(x)=sin(1/x)在x=0处的间断点类型是', '振荡间断点', ['可去间断点', '跳跃间断点', '无穷间断点']],
    ['x→0时，x−sinx关于x³是', '等价无穷小', ['同阶不等价无穷小', '高阶无穷小', '低阶无穷小']],
    ['x→0时，1−cosx的等价无穷小是', 'x²/2', ['x²', 'x', 'x³/3']],
    ['lim f(x)(x→x0)存在的充要条件是', '左右极限都存在且相等', ['f(x0)存在', 'f在x0连续', 'f在x0有界']],
    ['无穷小与有界变量的乘积是', '无穷小', ['有界量', '无穷大', '不确定']],
    ['闭区间上的连续函数一定', '有界且能取到最大最小值', ['可导', '可积但未必有界', '单调']]
  ];
  for (let c of concepts) {
    let [q, ans2, wrongs] = c;
    let { o, a: ans } = mk(ans2, wrongs);
    add(ch, 'single', q, o, ans, '', 1);
  }
  let judges = [
    ['若f(x)在x0连续，则f(x)在x0必可导。', '错误'],
    ['若lim f(x)(x→x0)存在，则f(x)在x0必有定义。', '错误'],
    ['无穷小就是很小的数。', '错误'],
    ['有限个无穷小的乘积仍是无穷小。', '正确'],
    ['有界变量与无穷小的乘积是无穷小。', '正确'],
    ['若|f(x)|在x0连续，则f(x)在x0也连续。', '错误']
  ];
  for (let j of judges) {
    let { o, a: ans } = mkj(j[1]);
    add(ch, 'judge', j[0], o, ans, '', 1);
  }
}

function genDerivatives() {
  const ch = '第2章 一元函数微分学';
  for (let i = 0; i < 12; i++) {
    let n = ri(2, 5), a = ri(1, 3);
    let v = n * Math.pow(a, n - 1);
    let { o, a: ans } = mk(`${v}`, [`${Math.pow(a, n)}`, `${(n - 1) * Math.pow(a, n)}`, `${n * Math.pow(a, n)}`]);
    add(ch, 'single', `f(x)=x^${n}，则f'(${a})=`, o, ans, `f'(x)=${n}x^${n - 1}，f'(${a})=${n}×${Math.pow(a, n - 1)}=${v}`, 1);
  }
  for (let i = 0; i < 12; i++) {
    let a = ri(2, 5);
    let { o, a: ans } = mk(`${a}`, ['1', '0', `${-a}`]);
    add(ch, 'single', `f(x)=sin(${a}x)，则f'(0)=`, o, ans, `f'(x)=${a}cos(${a}x)，f'(0)=${a}`, 1);
  }
  for (let i = 0; i < 10; i++) {
    let a = ri(2, 5), b = a + ri(1, 4);
    let { o, a: ans } = mk(`${a}`, [`${b}`, `${a + b}`, '1']);
    add(ch, 'single', `f(x)=e^(${a}x)+${b}，则f'(0)=`, o, ans, `f'(x)=${a}e^(${a}x)，f'(0)=${a}`, 1);
  }
  for (let i = 0; i < 10; i++) {
    let p = ri(2, 8), q = p + ri(1, 4);
    let { o, a: ans } = mk(`${p}`, [`${q}`, `${p + q}`, '0']);
    add(ch, 'single', `设f(x)=x·g(x)，g(0)=${p}，g'(0)=${q}，则f'(0)=`, o, ans, `f'(x)=g(x)+xg'(x)，f'(0)=g(0)=${p}`, 2);
  }
  for (let i = 0; i < 10; i++) {
    let a = ri(3, 6);
    let { o, a: ans } = mk(`${2 * a}`, [`${a * a}`, `${a}`, `${2 * a * a}`]);
    add(ch, 'single', `曲线y=x²在x=${a}处切线的斜率为`, o, ans, `y'=2x，x=${a}时斜率=${2 * a}`, 1);
  }
  for (let i = 0; i < 8; i++) {
    let a = ri(2, 6);
    let { o, a: ans } = mk(frac(-1, 2 * a), [frac(1, 2 * a), `${-2 * a}`, `${2 * a}`]);
    add(ch, 'single', `曲线y=x²在x=${a}处法线的斜率为`, o, ans, `切线斜率${2 * a}，法线斜率=−1/${2 * a}`, 2);
  }
  for (let i = 0; i < 8; i++) {
    let k = ri(2, 6), h = ri(2, 5);
    let { o, a: ans } = mk(`${k * h}`, [frac(k, h), frac(h, k), `${k}`]);
    add(ch, 'single', `设y=f(x)在x0可导且f'(x0)=${k}，当Δx=${h}时，微分dy=`, o, ans, `dy=f'(x0)Δx=${k}×${h}=${k * h}`, 1);
  }
  let concepts = [
    ['f(x)在x0可导是f(x)在x0连续的', '充分非必要条件', ['必要非充分条件', '充要条件', '既非充分也非必要条件']],
    ['导数f\'(x0)的几何意义是', '曲线在x0处切线的斜率', ['割线的斜率', '曲线的曲率', '法线的斜率']],
    ['罗尔定理的条件是', '闭区间连续、开区间可导、端点函数值相等', ['闭区间可导', '端点函数值为0', '函数单调']],
    ['f\'(x0)=0且f\'\'(x0)>0，则x0是', '极小值点', ['极大值点', '非极值点', '无法判断']],
    ['f\'(x0)=0且f\'\'(x0)<0，则x0是', '极大值点', ['极小值点', '非极值点', '无法判断']],
    ['可导函数f(x)在x0取得极值的必要条件是', 'f\'(x0)=0', ['f\'\'(x0)=0', 'f\'(x0)>0', 'f(x0)=0']],
    ['拉格朗日中值定理的结论是f(b)−f(a)=', 'f\'(ξ)(b−a)', ['f\'(a)(b−a)', 'f\'(b)(b−a)', '(b−a)²f\'(ξ)/2']],
    ['洛必达法则适用于', '0/0型或∞/∞型未定式', ['任何极限', '0·∞型直接使用', '所有分式极限']],
    ['微分dy的本质是', '函数增量的线性主部', ['函数增量本身', '导数的增量', '高阶无穷小']],
    ['可导的偶函数，其导函数是', '奇函数', ['偶函数', '非奇非偶', '不确定']]
  ];
  for (let c of concepts) {
    let [q, ans2, wrongs] = c;
    let { o, a: ans } = mk(ans2, wrongs);
    add(ch, 'single', q, o, ans, '', 1);
  }
  let judges = [
    ['若f(x)在x0可导，则f(x)在x0连续。', '正确'],
    ['若f(x)在x0连续，则f(x)在x0可导。', '错误'],
    ['f(x)=|x|在x=0处可导。', '错误'],
    ['可导函数的极值点处导数必为0。', '正确'],
    ['f\'(x0)=0，则f(x)在x0必取得极值。', '错误'],
    ['可导的奇函数，其导函数是偶函数。', '正确']
  ];
  for (let j of judges) {
    let { o, a: ans } = mkj(j[1]);
    add(ch, 'judge', j[0], o, ans, '', 1);
  }
}

function genIntegrals() {
  const ch = '第3章 一元函数积分学';
  for (let i = 0; i < 12; i++) {
    let n = ri(1, 4), a = ri(2, 4);
    let p = Math.pow(a, n + 1);
    let { o, a: ans } = mk(frac(p, n + 1), [`${p}`, frac(p, n), frac(Math.pow(a, n), n + 1)]);
    add(ch, 'single', `∫[0,${a}] x^${n} dx=`, o, ans, `∫x^${n}dx=x^${n + 1}/${n + 1}，代入得${p}/${n + 1}`, 1);
  }
  for (let i = 0; i < 10; i++) {
    let k = ri(2, 6), a = ri(2, 5);
    let { o, a: ans } = mk(frac(k * a * a, 2), [frac(k * a, 2), `${k * a * a}`, frac(k * a * a, 4)]);
    add(ch, 'single', `∫[0,${a}] ${k}x dx=`, o, ans, `∫${k}xdx=${k}x²/2，代入得${k}×${a * a}/2`, 1);
  }
  for (let i = 0; i < 10; i++) {
    let a = ri(2, 5);
    let { o, a: ans } = mk(`e^(${a}x)/${a}+C`, [`${a}e^(${a}x)+C`, `e^(${a}x)+C`, `e^(${a}x)/${a + 1}+C`]);
    add(ch, 'single', `∫ e^(${a}x) dx=`, o, ans, `∫e^(ax)dx=e^(ax)/a+C`, 1);
  }
  for (let i = 0; i < 8; i++) {
    let a = ri(2, 6);
    let { o, a: ans } = mk(`ln${a}`, [`${a}`, frac(1, a), `e^${a}`]);
    add(ch, 'single', `∫[1,${a}] 1/x dx=`, o, ans, `∫1/x dx=lnx，原式=ln${a}−ln1=ln${a}`, 1);
  }
  for (let i = 0; i < 8; i++) {
    let a = ri(1, 4);
    let { o, a: ans } = mk('0', [frac(Math.pow(a, 4), 2), frac(Math.pow(a, 4), 4), `${Math.pow(a, 3)}`]);
    add(ch, 'single', `∫[−${a},${a}] x³ dx=`, o, ans, `x³是奇函数，对称区间积分为0`, 1);
  }
  for (let i = 0; i < 8; i++) {
    let a = ri(2, 4);
    let { o, a: ans } = mk(frac(2 * Math.pow(a, 3), 3), [frac(Math.pow(a, 3), 3), `${Math.pow(a, 3)}`, frac(2 * Math.pow(a, 3), 5)]);
    add(ch, 'single', `∫[−${a},${a}] x² dx=`, o, ans, `x²是偶函数：原式=2×${Math.pow(a, 3)}/3`, 2);
  }
  for (let i = 0; i < 10; i++) {
    let { o, a: ans } = mk('e^(x²)', ['2xe^(x²)', 'e^(x²)−1', 'xe^(x²)']);
    add(ch, 'single', `d/dx ∫[0,x] e^(t²) dt=`, o, ans, `变上限积分求导：d/dx∫[0,x]f(t)dt=f(x)`, 2);
  }
  for (let i = 0; i < 8; i++) {
    let { o, a: ans } = mk('2xsin(x²)', ['sin(x²)', '2sin(x²)', 'x²sin(x²)']);
    add(ch, 'single', `d/dx ∫[0,x²] sin(t) dt=`, o, ans, `复合求导：sin(x²)·(x²)'=2xsin(x²)`, 2);
  }
  for (let i = 0; i < 10; i++) {
    let a = ri(2, 5);
    let { o, a: ans } = mk(frac(Math.pow(a, 3), 6), [frac(Math.pow(a, 3), 3), frac(Math.pow(a, 3), 2), `${Math.pow(a, 3)}`]);
    add(ch, 'single', `y=x²与y=${a}x所围图形的面积S=`, o, ans, `交点x=0,${a}；S=∫[0,${a}](${a}x−x²)dx=${Math.pow(a, 3)}/6`, 2);
  }
  for (let i = 0; i < 8; i++) {
    let a = ri(1, 2);
    let p = Math.pow(a, 5);
    let { o, a: ans } = mk(`π·${p}/5`, [`π·${p}/3`, `π·${Math.pow(a, 4)}/4`, `2π·${p}/5`]);
    add(ch, 'single', `y=x²(0≤x≤${a})绕x轴旋转所得旋转体体积V=`, o, ans, `V=π∫[0,${a}]x⁴dx=π·${p}/5`, 3);
  }
  let concepts = [
    ['牛顿-莱布尼茨公式∫[a,b] f(x)dx=', 'F(b)−F(a)', ['F(a)−F(b)', 'F(b)+F(a)', 'f(b)−f(a)']],
    ['∫[−a,a] f(x)dx=0对哪类函数恒成立', '奇函数', ['偶函数', '周期函数', '有界函数']],
    ['∫[−a,a] f(x)dx=2∫[0,a] f(x)dx对哪类函数成立', '偶函数', ['奇函数', '单调函数', '连续函数']],
    ['∫[1,+∞) dx/x^p收敛的条件是', 'p>1', ['p≥1', 'p<1', 'p>0']],
    ['∫[0,1] dx/x^p收敛的条件是', 'p<1', ['p>1', 'p≥1', 'p>0']],
    ['分部积分公式∫u dv=', 'uv−∫v du', ['uv+∫v du', 'u\'v−∫uv\'', '∫v du−uv']],
    ['∫f(x)dx的含义是', 'f(x)的全体原函数', ['f(x)的一个原函数', 'f(x)的导数', '定积分']],
    ['若F\'(x)=f(x)，则∫f(x)dx=', 'F(x)+C', ['F(x)', 'f(x)+C', 'F\'(x)+C']],
    ['在[0,1]上比较∫x²dx与∫x³dx', '前者大', ['后者大', '相等', '无法比较']],
    ['积分中值定理要求f在[a,b]上', '连续', ['可导', '单调', '有界即可']]
  ];
  for (let c of concepts) {
    let [q, ans2, wrongs] = c;
    let { o, a: ans } = mk(ans2, wrongs);
    add(ch, 'single', q, o, ans, '', 1);
  }
  let judges = [
    ['不定积分是f(x)的全体原函数。', '正确'],
    ['连续函数在闭区间上必可积。', '正确'],
    ['若∫[a,b] f(x)dx=0，则f(x)在[a,b]上恒为0。', '错误'],
    ['d/dx ∫[a,x] f(t)dt=f(x)（f连续）。', '正确'],
    ['奇函数在对称区间上必可积。', '错误'],
    ['同一函数的任意两个原函数只相差一个常数。', '正确']
  ];
  for (let j of judges) {
    let { o, a: ans } = mkj(j[1]);
    add(ch, 'judge', j[0], o, ans, '', 1);
  }
}

function genMultiVar() {
  const ch = '第4章 多元函数微分学';
  for (let i = 0; i < 12; i++) {
    let m = ri(2, 5), n = m + ri(1, 3);
    let { o, a: ans } = mk(`${m}`, [`${n}`, `${m + n}`, `${m * n}`]);
    add(ch, 'single', `z=x^${m}·y^${n}，则∂z/∂x在(1,1)处的值=`, o, ans, `∂z/∂x=${m}x^${m - 1}y^${n}，代入(1,1)得${m}`, 1);
  }
  for (let i = 0; i < 10; i++) {
    let a = ri(2, 4), b = ri(2, 4);
    let v = 2 * a * b;
    let { o, a: ans } = mk(`${v}`, [`${a * b}`, `${2 * a}`, `${2 * b}`]);
    add(ch, 'single', `z=x²y+y²，则∂z/∂x在(${a},${b})处的值=`, o, ans, `∂z/∂x=2xy，代入得2×${a}×${b}=${v}`, 1);
  }
  for (let i = 0; i < 10; i++) {
    let a = ri(1, 4), b = a + ri(1, 3);
    let { o, a: ans } = mk(`${2 * a}dx+${2 * b}dy`, [`${2 * a}dx−${2 * b}dy`, `${a}dx+${b}dy`, `${2 * b}dx+${2 * a}dy`]);
    add(ch, 'single', `z=x²+y²在点(${a},${b})处的全微分dz=`, o, ans, `dz=2xdx+2ydy=${2 * a}dx+${2 * b}dy`, 2);
  }
  for (let i = 0; i < 8; i++) {
    let a = ri(1, 4), b = ri(1, 4);
    let { o, a: ans } = mk(frac(1, a + b), [frac(1, a), frac(1, b), frac(1, a * b)]);
    add(ch, 'single', `z=ln(x+y)，则∂z/∂x在(${a},${b})处的值=`, o, ans, `∂z/∂x=1/(x+y)=1/${a + b}`, 1);
  }
  for (let i = 0; i < 8; i++) {
    let b = ri(2, 5);
    let { o, a: ans } = mk(`${b}`, ['0', '1', `${b * b}`]);
    add(ch, 'single', `z=sin(xy)，则∂z/∂x在(0,${b})处的值=`, o, ans, `∂z/∂x=ycos(xy)，代入得${b}cos0=${b}`, 2);
  }
  let concepts = [
    ['z=f(x,y)在一点两个偏导数都存在，是该点可微的', '必要非充分条件', ['充分非必要条件', '充要条件', '既非充分也非必要条件']],
    ['可微函数z=f(x,y)在极值点处必有', 'fx=fy=0', ['fx=fy≠0', 'fxx=fyy=0', 'fxy=0']],
    ['驻点处Δ=B²−AC<0且A>0，则该点是', '极小值点', ['极大值点', '非极值点', '无法判断']],
    ['驻点处Δ=B²−AC<0且A<0，则该点是', '极大值点', ['极小值点', '非极值点', '无法判断']],
    ['驻点处Δ=B²−AC>0，则该点', '不是极值点', ['是极小值点', '是极大值点', '无法判断']],
    ['拉格朗日乘数法用于求', '条件极值', ['无条件极值', '最大值', '最值点']],
    ['梯度方向是函数', '增长最快的方向', ['减小最快的方向', '等值线方向', '任意方向']],
    ['全微分dz=', 'fx dx+fy dy', ['fx dy+fy dx', 'fxx dx+fyy dy', 'fx dx−fy dy']],
    ['复合函数求偏导使用', '链式法则', ['分部积分', '中值定理', '洛必达法则']],
    ['二元函数连续、可导(偏导存在)、可微三者关系是', '可微⇒偏导存在⇒未必连续', ['偏导存在⇒可微', '连续⇒偏导存在', '三者等价']]
  ];
  for (let c of concepts) {
    let [q, ans2, wrongs] = c;
    let { o, a: ans } = mk(ans2, wrongs);
    add(ch, 'single', q, o, ans, '', 2);
  }
  let judges = [
    ['z=f(x,y)在一点偏导数都存在，则f在该点必连续。', '错误'],
    ['z=f(x,y)在一点可微，则在该点两个偏导数都存在。', '正确'],
    ['驻点必是极值点。', '错误'],
    ['可微函数的极值点必是驻点。', '正确'],
    ['当Δ=B²−AC=0时，极值性需另行判断。', '正确']
  ];
  for (let j of judges) {
    let { o, a: ans } = mkj(j[1]);
    add(ch, 'judge', j[0], o, ans, '', 2);
  }
}

function genDoubleInt() {
  const ch = '第5章 二重积分';
  for (let i = 0; i < 10; i++) {
    let k = ri(2, 5), a = ri(2, 5), b = a + ri(1, 3);
    let { o, a: ans } = mk(`${k * a * b}`, [`${k * (a + b)}`, `${k * a * a}`, `${a * b}`]);
    add(ch, 'single', `D为矩形[0,${a}]×[0,${b}]，则∬D ${k} dσ=`, o, ans, `∬${k}dσ=${k}×面积=${k}×${a}×${b}`, 1);
  }
  for (let i = 0; i < 10; i++) {
    let R = ri(2, 5);
    let { o, a: ans } = mk(`${R * R}π`, [`${2 * R}π`, `${R * R * R}π`, `${2 * R * R}π`]);
    add(ch, 'single', `D为圆域x²+y²≤${R}²，则∬D 1 dσ=`, o, ans, `∬1dσ=圆面积=πR²=${R * R}π`, 1);
  }
  for (let i = 0; i < 10; i++) {
    let a = ri(1, 3), b = ri(1, 3);
    let p = a * a * b * b;
    let { o, a: ans } = mk(frac(p, 4), [frac(p, 2), `${p}`, frac(a * b, 4)]);
    add(ch, 'single', `∫[0,${a}]dx∫[0,${b}] xy dy=`, o, ans, `=(∫[0,${a}]xdx)(∫[0,${b}]ydy)=${a * a}/2·${b * b}/2=${p}/4`, 2);
  }
  for (let i = 0; i < 8; i++) {
    let R = ri(2, 3);
    let c = Math.pow(R, 3);
    let { o, a: ans } = mk(`2π·${c}/3`, [`π·${c}`, `4π·${c}/3`, `π·${c}/3`]);
    add(ch, 'single', `D为圆域x²+y²≤${R}²，则∬D √(${R * R}−x²−y²) dσ=`, o, ans, `极坐标：∫[0,2π]dθ∫[0,${R}]√(${R * R}−r²)rdr=2π·${c}/3`, 3);
  }
  for (let i = 0; i < 8; i++) {
    let { o, a: ans } = mk('0', ['D的面积', '无法确定', '∬D |x| dσ的一半']);
    add(ch, 'single', `D关于y轴对称，则∬D x dσ=`, o, ans, `x关于x是奇函数，D关于y轴对称，积分为0`, 2);
  }
  for (let i = 0; i < 8; i++) {
    let { o, a: ans } = mk('∫[0,1]dy∫[y,1] f(x,y) dx', ['∫[0,1]dy∫[0,y] f(x,y) dx', '∫[0,1]dy∫[0,1] f(x,y) dx', '∫[0,1]dy∫[y,2] f(x,y) dx']);
    add(ch, 'single', `交换积分次序：∫[0,1]dx∫[0,x] f(x,y) dy=`, o, ans, `区域0≤y≤x≤1，先x后y：x从y到1`, 2);
  }
  let concepts = [
    ['被积函数为1时，二重积分的几何意义是', '区域D的面积', ['区域周长', '曲顶柱体体积', '区域边界长度']],
    ['当f(x,y)≥0时，∬D f dσ的几何意义是', '曲顶柱体的体积', ['区域面积', '曲线长度', '质量']],
    ['极坐标变换下的面积元素dσ=', 'rdrdθ', ['drdθ', 'r²drdθ', 'rdθ']],
    ['圆域x²+y²≤R²在极坐标下表示为', '0≤r≤R，0≤θ≤2π', ['0≤r≤R²', 'r≤R且θ≤π', '0≤r≤2R']],
    ['交换积分次序的关键步骤是', '重画积分区域并重写限', ['直接对调dx dy', '对被积函数求导', '提取公因子']],
    ['二重积分的值与', '积分变量的字母选取无关', ['区域分割方式有关', '积分次序的任意选择结果不同', '被积函数的化简方式有关']],
    ['在D上f≤g，则', '∬f dσ≤∬g dσ', ['∬f dσ≥∬g dσ', '两者相等', '无法比较']],
    ['二重积分对区域的可加性指', 'D分成两块后积分相加', ['被积函数拆开', '积分次序可交换', '常数可提出']]
  ];
  for (let c of concepts) {
    let [q, ans2, wrongs] = c;
    let { o, a: ans } = mk(ans2, wrongs);
    add(ch, 'single', q, o, ans, '', 1);
  }
  let judges = [
    ['∬D 1·dσ等于D的面积。', '正确'],
    ['二重积分的值与区域D的分割方式有关。', '错误'],
    ['D关于x轴对称且f关于y为奇函数，则∬D f dσ=0。', '正确'],
    ['二重积分一定表示体积。', '错误'],
    ['极坐标下面积元素是rdrdθ。', '正确']
  ];
  for (let j of judges) {
    let { o, a: ans } = mkj(j[1]);
    add(ch, 'judge', j[0], o, ans, '', 1);
  }
}

function genODE() {
  const ch = '第6章 常微分方程';
  for (let i = 0; i < 10; i++) {
    let a = ri(1, 5), k = a + ri(1, 2);
    let { o, a: ans } = mk(`${a}e^(${k}x)`, [`${a}e^(${-k}x)`, `${k}e^(${a}x)`, `${a + k}e^(${k}x)`]);
    add(ch, 'single', `dy/dx=${k}y，y(0)=${a}，则y=`, o, ans, `分离变量：y=Ce^(${k}x)，代入y(0)=${a}得C=${a}`, 2);
  }
  for (let i = 0; i < 10; i++) {
    let c = ri(1, 5);
    let { o, a: ans } = mk(`x²+${c}`, [`2x+${c}`, `x²−${c}`, `${c}x²`]);
    add(ch, 'single', `y'=2x，y(0)=${c}，则y=`, o, ans, `积分：y=x²+C，代入得C=${c}`, 1);
  }
  for (let i = 0; i < 10; i++) {
    let p = ri(1, 4), q = p + ri(1, 3);
    let { o, a: ans } = mk(`C1e^(${p}x)+C2e^(${q}x)`, [`(C1+C2x)e^(${p}x)`, `C1e^(${-p}x)+C2e^(${-q}x)`, `C1cos(${p}x)+C2sin(${q}x)`]);
    add(ch, 'single', `特征根为${p}和${q}的二阶常系数齐次线性方程的通解是`, o, ans, `两个不等实根：y=C1e^(${p}x)+C2e^(${q}x)`, 2);
  }
  for (let i = 0; i < 8; i++) {
    let w = ri(1, 4);
    let { o, a: ans } = mk(`C1cos(${w}x)+C2sin(${w}x)`, [`C1e^(${w}x)+C2e^(${-w}x)`, `(C1+C2x)e^(${w}x)`, `C1e^(${w}x)cos(${w}x)+C2e^(${w}x)sin(${w}x)`]);
    add(ch, 'single', `特征根为±${w}i的二阶常系数齐次线性方程的通解是`, o, ans, `共轭复根α±βi(α=0)：y=C1cos${w}x+C2sin${w}x`, 2);
  }
  for (let i = 0; i < 8; i++) {
    let r = ri(1, 4);
    let { o, a: ans } = mk(`(C1+C2x)e^(${r}x)`, [`C1e^(${r}x)+C2e^(${-r}x)`, `C1cos(${r}x)+C2sin(${r}x)`, `(C1+C2x)e^(${-r}x)`]);
    add(ch, 'single', `特征方程有二重根r=${r}的二阶常系数齐次线性方程的通解是`, o, ans, `二重根：y=(C1+C2x)e^(${r}x)`, 2);
  }
  for (let i = 0; i < 8; i++) {
    let a = ri(2, 6);
    let { o, a: ans } = mk(`${a}e^(−x)`, [`${a}e^x`, `e^(−x)`, `${a}−x`]);
    add(ch, 'single', `y'+y=0，y(0)=${a}，则y=`, o, ans, `一阶齐次：y=Ce^(−x)，C=${a}`, 1);
  }
  for (let i = 0; i < 8; i++) {
    let a = ri(2, 4);
    let { o, a: ans } = mk(`e^(${a}x)/${a * a}+C1x+C2`, [`e^(${a}x)/${a}+C1x+C2`, `${a}e^(${a}x)+C1x+C2`, `e^(${a}x)+C1x+C2`]);
    add(ch, 'single', `y''=e^(${a}x)的通解是`, o, ans, `积分两次：y=e^(${a}x)/${a * a}+C1x+C2`, 2);
  }
  let concepts = [
    ['微分方程的阶是指', '方程中出现的最高阶导数的阶数', ['未知函数的次数', '方程项数', '自变量个数']],
    ['n阶微分方程的通解中含有', 'n个任意常数', ['1个任意常数', 'n−1个任意常数', '任意多个常数']],
    ['y\'+P(x)y=Q(x)属于', '一阶线性非齐次方程', ['可分离变量方程', '伯努利方程', '全微分方程']],
    ['可分离变量方程的解法是', '分离变量后两边积分', ['特征方程法', '常数变易法', '降代换']],
    ['特征方程法适用于', '常系数线性齐次方程', ['变系数方程', '非线性方程', '一阶方程']],
    ['特解是指', '不含任意常数的解', ['含一个常数的解', '零解', '通解']],
    ['y\'=y的通解是', 'Ce^x', ['Ce^(−x)', 'e^x', 'x+C']],
    ['非齐次线性方程的通解结构是', '齐次通解+非齐次一个特解', ['两个特解之和', '齐次通解', '特解的线性组合']],
    ['初始条件的作用是', '确定通解中的任意常数', ['降低方程阶数', '改变方程类型', '无作用']],
    ['y\'\'+y=0的特征根是', '±i', ['±1', '0', 'i']]
  ];
  for (let c of concepts) {
    let [q, ans2, wrongs] = c;
    let { o, a: ans } = mk(ans2, wrongs);
    add(ch, 'single', q, o, ans, '', 1);
  }
  let judges = [
    ['非齐次线性方程的通解=对应齐次通解+一个特解。', '正确'],
    ['微分方程的解一定唯一。', '错误'],
    ['可分离变量方程都是一阶方程。', '正确'],
    ['y"+y=0的特征方程是r²+1=0。', '正确'],
    ['特征方程有共轭复根时，解具有振荡形式。', '正确'],
    ['非齐次线性方程只有一个特解。', '错误']
  ];
  for (let j of judges) {
    let { o, a: ans } = mkj(j[1]);
    add(ch, 'judge', j[0], o, ans, '', 1);
  }
}

function genDet() {
  const ch = '第1章 行列式';
  for (let i = 0; i < 12; i++) {
    let a, b, c, d, D, vals;
    for (let t = 0; t < 50; t++) {
      a = ri(1, 6); b = ri(1, 6); c = ri(1, 6); d = ri(1, 6);
      D = a * d - b * c;
      vals = [D, a * d + b * c, a * c - b * d, a * b - c * d];
      if (D !== 0 && new Set(vals).size === 4) break;
    }
    let { o, a: ans } = mk(`${D}`, [`${a * d + b * c}`, `${a * c - b * d}`, `${a * b - c * d}`]);
    add(ch, 'single', `行列式|${a} ${b}; ${c} ${d}|的值是`, o, ans, `=ad−bc=${a}×${d}−${b}×${c}=${D}`, 1);
  }
  for (let i = 0; i < 8; i++) {
    let n = ri(2, 4), D = ri(1, 5);
    let v = Math.pow(2, n) * D;
    let { o, a: ans } = mk(`${v}`, [`${2 * D}`, `${n * D}`, `${D}`]);
    add(ch, 'single', `A为${n}阶方阵，|A|=${D}，则|2A|=`, o, ans, `|kA|=k^n|A|=2^${n}×${D}=${v}`, 2);
  }
  for (let i = 0; i < 8; i++) {
    let a = ri(1, 5), b = a + ri(1, 3);
    let { o, a: ans } = mk(`${a * b}`, [`${a + b}`, `${a - b}`, `${b - a}`]);
    add(ch, 'single', `A、B为同阶方阵，|A|=${a}，|B|=${b}，则|AB|=`, o, ans, `|AB|=|A||B|=${a}×${b}`, 1);
  }
  for (let i = 0; i < 6; i++) {
    let D = ri(2, 4);
    let v = D * D;
    let { o, a: ans } = mk(`${v}`, [`${D * D * D}`, `${D + 3}`, `${D}`]);
    add(ch, 'single', `A为3阶方阵，|A|=${D}，则|A*|=`, o, ans, `|A*|=|A|^(n−1)=${D}²=${v}`, 2);
  }
  for (let i = 0; i < 6; i++) {
    let n = ri(2, 4), D = ri(1, 6);
    let correct = n % 2 === 1 ? -D : D;
    let wrongs = n % 2 === 1 ? [`${D}`, `${n * D}`, `${-n * D}`] : [`${-D}`, `${n * D}`, `${-n * D}`];
    let { o, a: ans } = mk(`${correct}`, wrongs);
    add(ch, 'single', `A为${n}阶方阵，|A|=${D}，则|−A|=`, o, ans, `|−A|=(−1)^${n}|A|=${correct}`, 2);
  }
  let concepts = [
    ['交换行列式的两行，行列式', '变号', ['不变', '变为0', '乘以2']],
    ['行列式有两行相同，则行列式', '等于0', ['等于1', '变号', '无法确定']],
    ['行列式某行乘以k，行列式', '乘以k', ['不变', '乘以k²', '变号']],
    ['按行展开行列式时，使用的是该行各元素的', '代数余子式', ['余子式的相反数', '元素本身', '转置']],
    ['范德蒙行列式的值等于', '各变量两两之差的乘积', ['各变量之和', '各变量之积', '0']],
    ['|A^T|=', '|A|', ['−|A|', '|A|²', '1/|A|']],
    ['方阵A可逆的充要条件是', '|A|≠0', ['|A|>0', 'A≠O', 'A对称']],
    ['代数余子式Aij=', '(−1)^(i+j)乘以余子式Mij', ['余子式Mij', '(−1)^(i+j)乘以aij', 'aij的倒数']]
  ];
  for (let c of concepts) {
    let [q, ans2, wrongs] = c;
    let { o, a: ans } = mk(ans2, wrongs);
    add(ch, 'single', q, o, ans, '', 1);
  }
  let judges = [
    ['同阶方阵A、B，|AB|=|A||B|。', '正确'],
    ['|A+B|=|A|+|B|。', '错误'],
    ['若|A|=0，则A必有两行相同。', '错误'],
    ['|kA|=k|A|。', '错误'],
    ['三角形行列式等于主对角线元素的乘积。', '正确']
  ];
  for (let j of judges) {
    let { o, a: ans } = mkj(j[1]);
    add(ch, 'judge', j[0], o, ans, '', 1);
  }
}

function genMatrix() {
  const ch = '第2章 矩阵';
  for (let i = 0; i < 10; i++) {
    let a, b, c, d, D;
    for (let t = 0; t < 50; t++) {
      a = ri(1, 5); b = ri(1, 5); c = ri(1, 5); d = ri(1, 5);
      D = a * d - b * c;
      if (D !== 0 && new Set([frac(d, D), frac(a, D), frac(-b, D), `${d}`]).size === 4) break;
    }
    let { o, a: ans } = mk(frac(d, D), [frac(a, D), frac(-b, D), `${d}`]);
    add(ch, 'single', `A=[${a},${b};${c},${d}]，则A^(-1)的(1,1)元素是`, o, ans, `A^(-1)=1/${D}·[${d},−${b};−${c},${a}]，(1,1)=${d}/${D}`, 2);
  }
  for (let i = 0; i < 8; i++) {
    let a, b, c, d, D;
    for (let t = 0; t < 50; t++) {
      a = ri(1, 5); b = ri(1, 5); c = ri(1, 5); d = ri(1, 5);
      D = a * d - b * c;
      if (D !== 0 && new Set([frac(-b, D), frac(b, D), frac(-d, D), frac(a, D)]).size === 4) break;
    }
    let { o, a: ans } = mk(frac(-b, D), [frac(b, D), frac(-d, D), frac(a, D)]);
    add(ch, 'single', `A=[${a},${b};${c},${d}]，则A^(-1)的(1,2)元素是`, o, ans, `A^(-1)=1/${D}·[${d},−${b};−${c},${a}]，(1,2)=−${b}/${D}`, 2);
  }
  for (let i = 0; i < 10; i++) {
    let a = ri(1, 5), b = ri(1, 5), k = ri(2, 4);
    let { o, a: ans } = mk('1', ['2', '0', '3']);
    add(ch, 'single', `矩阵[${a},${b};${k * a},${k * b}]的秩为`, o, ans, `第二行是第一行的${k}倍，秩为1`, 1);
  }
  for (let i = 0; i < 8; i++) {
    let n = ri(2, 4);
    let { o, a: ans } = mk(`${n}`, [`${n - 1}`, '1', '0']);
    add(ch, 'single', `${n}阶可逆矩阵A的秩r(A)=`, o, ans, `可逆⇔满秩，r(A)=${n}`, 1);
  }
  let concepts = [
    ['(AB)^T=', 'B^T·A^T', ['A^T·B^T', '(BA)^T', 'AB']],
    ['(AB)^(-1)=', 'B^(-1)A^(-1)', ['A^(-1)B^(-1)', '(BA)^(-1)的转置', 'AB']],
    ['(A+B)²=A²+2AB+B²成立的条件是', 'AB=BA', ['A=B', 'A、B可逆', '总成立']],
    ['A可逆的充要条件是', '|A|≠0', ['A≠O', '|A|>0', 'A对称']],
    ['AA*=', '|A|E', ['A', 'E', '|A|A']],
    ['(kA)^(-1)=', '(1/k)A^(-1)', ['kA^(-1)', 'A^(-1)/k²', '(kA)^(-1)不存在']],
    ['由AB=O可以推出', '不能推出A=O或B=O', ['A=O', 'B=O', 'A=O且B=O']],
    ['初等行变换不改变矩阵的', '秩', ['行列式', '元素', '阶数与元素']],
    ['对称矩阵满足', 'A^T=A', ['A^T=−A', 'A²=E', 'A=O']],
    ['A²=E说明', 'A可逆且A^(-1)=A', ['A=E', 'A=−E', 'A不可逆']]
  ];
  for (let c of concepts) {
    let [q, ans2, wrongs] = c;
    let { o, a: ans } = mk(ans2, wrongs);
    add(ch, 'single', q, o, ans, '', 1);
  }
  let judges = [
    ['矩阵乘法满足交换律。', '错误'],
    ['矩阵乘法满足结合律。', '正确'],
    ['AB=AC且A≠O，则B=C。', '错误'],
    ['A可逆，则A^T也可逆。', '正确'],
    ['(AB)²=A²B²。', '错误'],
    ['对角元素全非零的对角矩阵的逆是对角元素取倒数的对角矩阵。', '正确']
  ];
  for (let j of judges) {
    let { o, a: ans } = mkj(j[1]);
    add(ch, 'judge', j[0], o, ans, '', 1);
  }
}

function genVectors() {
  const ch = '第3章 向量';
  for (let i = 0; i < 8; i++) {
    let v = [];
    let s = 0;
    for (let k = 0; k < 3; k++) { let x = ri(1, 4), y = ri(1, 4); v.push([x, y]); s += x * y; }
    let { o, a: ans } = mk(`${s}`, [`${s - v[2][0] * v[2][1]}`, `${s + 1}`, `${2 * s}`]);
    add(ch, 'single', `α=(${v[0][0]},${v[1][0]},${v[2][0]})，β=(${v[0][1]},${v[1][1]},${v[2][1]})，则内积(α,β)=`, o, ans, `内积=对应分量乘积之和=${s}`, 1);
  }
  let trips = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15]];
  for (let i = 0; i < 8; i++) {
    let t = trips[ri(0, trips.length - 1)];
    let { o, a: ans } = mk(`${t[2]}`, [`${t[0] + t[1]}`, `${t[0] * t[1]}`, `${t[2] + 2}`]);
    add(ch, 'single', `α=(${t[0]},${t[1]},0)，则||α||=`, o, ans, `||α||=√(${t[0] * t[0]}+${t[1] * t[1]})=${t[2]}`, 1);
  }
  let concepts = [
    ['α1,…,αs线性相关的充要条件是', '至少有一个向量可由其余向量线性表示', ['全部向量为零', '任一向量可被表示', '向量个数大于维数']],
    ['含有零向量的向量组必', '线性相关', ['线性无关', '秩为0', '正交']],
    ['向量组的部分组线性相关，则整个向量组', '线性相关', ['线性无关', '秩不变', '无法判断']],
    ['向量组线性无关，则它的任一部分组', '线性无关', ['线性相关', '含零向量', '秩为1']],
    ['β由向量组线性表示且表示唯一，则该向量组', '线性无关', ['线性相关', '含零向量', '秩小于维数']],
    ['向量组的秩等于', '极大无关组中向量的个数', ['向量总个数', '向量维数', '1']],
    ['α与β正交，则(α,β)=', '0', ['1', '||α||·||β||', '−1']],
    ['n+1个n维向量必', '线性相关', ['线性无关', '构成基', '秩为n+1']],
    ['极大无关组中向量的个数', '等于向量组的秩', ['等于向量个数', '等于维数', '不唯一确定个数']],
    ['两个等价的向量组必有', '相同的秩', ['相同的向量个数', '相同的维数', '完全相同的向量']]
  ];
  for (let c of concepts) {
    let [q, ans2, wrongs] = c;
    let { o, a: ans } = mk(ans2, wrongs);
    add(ch, 'single', q, o, ans, '', 1);
  }
  let judges = [
    ['任何向量组都存在极大线性无关组。', '正确'],
    ['向量的线性表示方式总是唯一的。', '错误'],
    ['α1,α2,α3线性相关，则其中任意两个也线性相关。', '错误'],
    ['线性无关组再添一个向量后仍线性无关。', '错误'],
    ['线性相关的向量组必含零向量。', '错误']
  ];
  for (let j of judges) {
    let { o, a: ans } = mkj(j[1]);
    add(ch, 'judge', j[0], o, ans, '', 1);
  }
}

function genLinearSys() {
  const ch = '第4章 线性方程组';
  for (let i = 0; i < 10; i++) {
    let r = ri(2, 4), n = r + ri(1, 4);
    if (n - r === r) n++;
    let { o, a: ans } = mk(`${n - r}`, [`${r}`, `${n - r + 1}`, `${n}`]);
    add(ch, 'single', `Ax=0中A是m×${n}矩阵，r(A)=${r}，则基础解系含向量个数=`, o, ans, `基础解系向量数=n−r=${n}−${r}=${n - r}`, 2);
  }
  for (let i = 0; i < 8; i++) {
    let r = ri(2, 4);
    let { o, a: ans } = mk('有解', ['无解', '有唯一解', '无法判断']);
    add(ch, 'single', `r(A)=${r}，r(A|b)=${r}，则Ax=b`, o, ans, `r(A)=r(A|b)，方程组有解`, 1);
  }
  let concepts = [
    ['Ax=0只有零解的充要条件是', 'r(A)=n', ['r(A)<n', 'm=n', 'r(A)=m']],
    ['Ax=0有非零解的充要条件是', 'r(A)<n', ['r(A)=n', 'm<n', 'r(A)=0']],
    ['Ax=b有解的充要条件是', 'r(A)=r(A|b)', ['r(A)=n', 'm≥n', 'b≠0']],
    ['Ax=b有唯一解的充要条件是', 'r(A)=r(A|b)=n', ['r(A)=m', 'r(A)<n', 'm=n']],
    ['Ax=b有无穷多解的充要条件是', 'r(A)=r(A|b)<n', ['r(A)<r(A|b)', 'r(A)=n', 'b=0']],
    ['非齐次方程组通解=', '一个特解+齐次通解', ['两个特解之和', '齐次通解', '任意特解之和']],
    ['Ax=b的两个解之差是', 'Ax=0的解', ['Ax=b的解', '不是解', '单位向量']],
    ['Ax=0的解的任意线性组合', '仍是Ax=0的解', ['是Ax=b的解', '不再是解', '变为零向量']],
    ['基础解系是', '解空间的一组基', ['全部解', '一个特解', '零解']],
    ['m<n时，Ax=0', '必有非零解', ['只有零解', '无解', '解唯一']]
  ];
  for (let c of concepts) {
    let [q, ans2, wrongs] = c;
    let { o, a: ans } = mk(ans2, wrongs);
    add(ch, 'single', q, o, ans, '', 1);
  }
  let judges = [
    ['Ax=0有非零解，则Ax=b必有无穷多解。', '错误'],
    ['Ax=b有两个不同的解，则必有无穷多解。', '正确'],
    ['零向量总是Ax=0的解。', '正确'],
    ['m<n时，Ax=0必有非零解。', '正确'],
    ['A可逆时，Ax=b有唯一解。', '正确']
  ];
  for (let j of judges) {
    let { o, a: ans } = mkj(j[1]);
    add(ch, 'judge', j[0], o, ans, '', 1);
  }
}

function genEigen() {
  const ch = '第5章 特征值与特征向量';
  for (let i = 0; i < 10; i++) {
    let a = ri(1, 6), b = a + ri(1, 3);
    let { o, a: ans } = mk(`${a}与${b}`, [`${a + b}与${a * b}`, `${-a}与${-b}`, `${a}与${-b}`]);
    add(ch, 'single', `对角矩阵diag(${a},${b})的特征值是`, o, ans, `对角阵的特征值即对角线元素`, 1);
  }
  for (let i = 0; i < 10; i++) {
    let l1 = ri(1, 5), l2 = l1 + ri(1, 3);
    let { o, a: ans } = mk(`${l1 + l2}`, [`${l1 * l2}`, `${l2 - l1}`, `${l1 + l2 + 1}`]);
    add(ch, 'single', `2阶矩阵A的特征值为${l1}和${l2}，则tr(A)=`, o, ans, `迹=特征值之和=${l1}+${l2}`, 1);
  }
  for (let i = 0; i < 8; i++) {
    let pool = [1, 3, 4, 5];
    let l1 = pool[ri(0, 3)], l2 = pool[ri(0, 3)];
    if (l1 === l2) l2 = pool[(pool.indexOf(l1) + 1) % 4];
    let { o, a: ans } = mk(`${l1 * l1}与${l2 * l2}`, [`${l1}与${l2}`, `${2 * l1}与${2 * l2}`, `${l1 + l2}与0`]);
    add(ch, 'single', `A的特征值为${l1}与${l2}，则A²的特征值是`, o, ans, `A²的特征值为λ²：${l1 * l1}与${l2 * l2}`, 2);
  }
  for (let i = 0; i < 8; i++) {
    let k = ri(2, 3), l1 = ri(1, 4), l2 = l1 + ri(1, 3);
    let { o, a: ans } = mk(`${k * l1}与${k * l2}`, [`${l1}与${l2}`, `${k + l1}与${k + l2}`, `${l1 * l2}与${k}`]);
    add(ch, 'single', `A的特征值为${l1}与${l2}，则${k}A的特征值是`, o, ans, `kA的特征值为kλ`, 2);
  }
  for (let i = 0; i < 6; i++) {
    let l1 = ri(2, 4), l2 = l1 + ri(1, 3);
    let { o, a: ans } = mk(`${frac(1, l1)}与${frac(1, l2)}`, [`${-l1}与${-l2}`, `${l1}与${l2}`, `${frac(-1, l1)}与${frac(-1, l2)}`]);
    add(ch, 'single', `可逆矩阵A的特征值为${l1}与${l2}，则A^(-1)的特征值是`, o, ans, `A^(-1)的特征值为1/λ`, 2);
  }
  let concepts = [
    ['特征值定义Aα=λα中，α必须是', '非零向量', ['零向量', '单位向量', '正交向量']],
    ['矩阵所有特征值之和等于', '迹(主对角元素之和)', ['行列式', '秩', '阶数']],
    ['矩阵所有特征值之积等于', '行列式', ['迹', '秩', '0']],
    ['λ=0是A的特征值的充要条件是', '|A|=0', ['A=O', 'A可逆', 'tr(A)=0']],
    ['属于不同特征值的特征向量', '线性无关', ['线性相关', '正交', '相等']],
    ['n阶矩阵可对角化的充要条件是', '有n个线性无关的特征向量', ['特征值互异', 'A对称', 'A可逆']],
    ['实对称矩阵的特征值', '全是实数', ['全是复数', '必有0', '互不相同']],
    ['特征值λ对应的特征空间是', '(λE−A)x=0的解空间去掉零向量', ['Ax=0的解空间', '全体n维向量', '空集']],
    ['A^T的特征值', '与A相同', ['与A互为相反数', '与A互为倒数', '不确定']],
    ['特征多项式|λE−A|是关于λ的', 'n次多项式', ['n−1次多项式', '2次多项式', '常数']]
  ];
  for (let c of concepts) {
    let [q, ans2, wrongs] = c;
    let { o, a: ans } = mk(ans2, wrongs);
    add(ch, 'single', q, o, ans, '', 2);
  }
  let judges = [
    ['特征向量不能是零向量。', '正确'],
    ['一个特征值可以对应无穷多个特征向量。', '正确'],
    ['特征值互异的矩阵必可对角化。', '正确'],
    ['特征值全不相等的矩阵必是对称矩阵。', '错误'],
    ['相似矩阵有相同的特征值。', '正确']
  ];
  for (let j of judges) {
    let { o, a: ans } = mkj(j[1]);
    add(ch, 'judge', j[0], o, ans, '', 2);
  }
}

function genQuadForm() {
  const ch = '第6章 二次型';
  for (let i = 0; i < 8; i++) {
    let a, b, c;
    for (let t = 0; t < 50; t++) {
      a = ri(1, 3); b = ri(2, 4); c = ri(1, 3);
      if (a !== b && c !== b && c !== 2 * b) break;
    }
    let { o, a: ans } = mk(`${b}`, [`${2 * b}`, `${a}`, `${c}`]);
    add(ch, 'single', `二次型f=${a}x1²+${2 * b}x1x2+${c}x2²的矩阵A的(1,2)元素是`, o, ans, `交叉项系数${2 * b}均分到非对角位置：A12=A21=${b}`, 2);
  }
  for (let i = 0; i < 8; i++) {
    let k = ri(1, 2);
    let extra = k === 1 ? '2' : '1';
    let { o, a: ans } = mk(`${k}`, ['3', '0', extra]);
    add(ch, 'single', `二次型f=${k === 2 ? 'x1²−2x2²' : 'x1²'}的秩是`, o, ans, `二次型的秩=其矩阵的秩=${k}`, 1);
  }
  let concepts = [
    ['二次型正定的充要条件是', '特征值全为正', ['特征值全为负', '行列式大于0', '秩等于未知量个数']],
    ['西尔维斯特判据：正定的充要条件是', '各阶顺序主子式全大于0', ['行列式大于0', '特征值非负', '对角元全为正']],
    ['二次型的标准形指', '只含平方项的形式', ['只含交叉项', '系数全为1', '只含两项']],
    ['两个二次型合同的充要条件是', '正负惯性指数相同', ['秩相同', '矩阵相似', '特征值相同']],
    ['正交变换化二次型为标准形依据的是', '实对称矩阵可正交对角化', ['配方法', '初等变换', '克拉默法则']],
    ['二次型的秩等于', '其矩阵的秩', ['未知量个数', '标准形系数个数', '正惯性指数']],
    ['二次型的矩阵必是', '对称矩阵', ['对角矩阵', '正交矩阵', '可逆矩阵']],
    ['可逆线性变换化二次型', '不改变正定性，新旧二次型合同', ['改变正定性', '使矩阵相似', '使矩阵相等']],
    ['负定的充要条件是', '特征值全为负', ['特征值全为正', '行列式小于0', '对角元全为负']],
    ['正惯性指数+负惯性指数=', '二次型的秩', ['未知量个数加1', '行列式', '2']]
  ];
  for (let c of concepts) {
    let [q, ans2, wrongs] = c;
    let { o, a: ans } = mk(ans2, wrongs);
    add(ch, 'single', q, o, ans, '', 2);
  }
  let judges = [
    ['任何二次型都可经可逆线性变换化为规范形。', '正确'],
    ['二次型的标准形是唯一的。', '错误'],
    ['二次型的矩阵(取对称矩阵时)是唯一的。', '正确'],
    ['正负惯性指数相同的两个二次型必合同。', '正确'],
    ['正定二次型的矩阵行列式必大于0。', '正确']
  ];
  for (let j of judges) {
    let { o, a: ans } = mkj(j[1]);
    add(ch, 'judge', j[0], o, ans, '', 2);
  }
  const ch2 = '综合';
  let concepts2 = [
    ['可微、连续、极限存在三者的蕴含关系是', '可微⇒连续⇒极限存在', ['连续⇒可微', '极限存在⇒连续', '三者等价']],
    ['泰勒公式的主要用途是', '用多项式近似函数并求极限', ['求导数', '求积分值', '判断连续性']],
    ['r(A)=n时，A的列向量组', '线性无关', ['线性相关', '秩小于n', '含零向量']],
    ['相似矩阵必有相同的', '特征值、迹、行列式', ['秩与惯性指数', '元素', '行向量组']],
    ['合同矩阵必有相同的', '秩与正负惯性指数', ['特征值', '迹', '行列式符号之外的一切']],
    ['等价矩阵必有相同的', '秩', ['行列式', '特征值', '阶数']],
    ['A²=O说明A的特征值', '全为0', ['全为1', '有0有1', '无法确定']],
    ['微分与积分的关系是', '互为逆运算(变上限积分意义下)', ['完全相同', '互不相关', '仅对多项式成立']]
  ];
  for (let c of concepts2) {
    let [q, ans2, wrongs] = c;
    let { o, a: ans } = mk(ans2, wrongs);
    add(ch2, 'single', q, o, ans, '', 3);
  }
}

function genSql() {
  let sql = '';
  const batch = 50;
  for (let i = 0; i < Q.length; i += batch) {
    const part = Q.slice(i, i + batch);
    sql += 'INSERT INTO questions (subject, chapter, type, question, options, answer, explanation, difficulty, source) VALUES\n';
    part.forEach((q, j) => {
      sql += `('math2', '${esc(q.ch)}', '${q.t}', '${esc(q.q)}', '${esc(q.o)}', '${esc(q.a)}', '${esc(q.e)}', ${q.d}, '数学二强化题库')${j < part.length - 1 ? ',' : ';'}\n`;
    });
    sql += '\n';
  }
  return sql;
}

genLimits();
genDerivatives();
genIntegrals();
genMultiVar();
genDoubleInt();
genODE();
genDet();
genMatrix();
genVectors();
genLinearSys();
genEigen();
genQuadForm();

let sqlOutput = genSql();
fs.writeFileSync('seed_adv_math2.sql', sqlOutput);
console.log(`Generated ${Q.length} questions`);
let d1 = Q.filter(q => q.d === 1).length;
let d2 = Q.filter(q => q.d === 2).length;
let d3 = Q.filter(q => q.d === 3).length;
console.log(`Difficulty: 基础=${d1}, 中等=${d2}, 进阶=${d3}`);
let chapters = {};
Q.forEach(q => { chapters[q.ch] = (chapters[q.ch] || 0) + 1; });
console.log(chapters);