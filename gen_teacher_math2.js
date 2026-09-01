import fs from 'node:fs';

const Q = [];
const seen = new Set();
let seed = 45321;
function rnd() { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; }
function ri(min, max) { return Math.floor(rnd() * (max - min + 1)) + min; }
function gcd(a, b) { a = Math.abs(Math.round(a)); b = Math.abs(Math.round(b)); while (b !== 0) { [a, b] = [b, a % b]; } return a || 1; }
function frac(a, b) {
  if (b === 0) return '不存在';
  let g = gcd(Math.abs(a), Math.abs(b));
  a = Math.round(a / g); b = Math.round(b / g);
  if (b < 0) { a = -a; b = -b; }
  return b === 1 ? `${a}` : `${a}/${b}`;
}
function fact(n) { let r = 1; for (let i = 2; i <= n; i++) r *= i; return r; }
function shuffle(arr) { const c = [...arr]; for (let i = c.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [c[i], c[j]] = [c[j], c[i]]; } return c; }
function esc(s) { return String(s).replace(/'/g, "''"); }
function mk(correct, wrongs) {
  let opts = [correct];
  for (const w of wrongs) { if (w !== correct && !opts.includes(w)) opts.push(w); }
  opts = opts.slice(0, 4);
  while (opts.length < 4) opts.push('以上都不对');
  const sh = shuffle(opts);
  return { o: JSON.stringify(sh.map((v, i) => `${'ABCD'[i]}. ${v}`)), a: 'ABCD'[sh.indexOf(correct)] };
}
function mkj(correct) {
  const sh = shuffle(['正确', '错误']);
  return { o: JSON.stringify(sh.map((v, i) => `${'AB'[i]}. ${v}`)), a: 'AB'[sh.indexOf(correct)] };
}
function add(ch, t, q, o, a, e, d, src) { if (seen.has(q)) return; seen.add(q); Q.push({ ch, t, q, o, a, e, d, src }); }

const CH1 = '第1章 函数、极限、连续';
const CH2 = '第2章 一元函数微分学';
const CH3 = '第3章 一元函数积分学';
const CH5 = '第5章 二重积分';
const LA1 = '第1章 行列式';
const LA2 = '第2章 矩阵';
const LA3 = '第3章 向量';
const LA4 = '第4章 线性方程组';
const LA5 = '第5章 特征值与特征向量';
const LA6 = '第6章 二次型';
const COMP = '综合';
const ZY = '名师典型·张宇';
const WZX = '名师典型·武忠祥';
const TJF = '名师典型·汤家凤';

function genZhangYu() {
  for (let i = 0; i < 8; i++) {
    let a = ri(1, 4);
    let { o, a: ans } = mk(`e^${2 * a}`, [`e^${a}`, 'e', `e^${4 * a}`]);
    add(CH1, 'single', `lim(x→∞) ((x+${a})/(x−${a}))^x=（　　）`, o, ans, `((x+${a})/(x−${a}))^x=(1+${2 * a}/(x−${a}))^x，令t=x−${a}，原式=(1+${2 * a}/t)^{t+${a}}→e^${2 * a}。`, 2, ZY);
  }
  for (let i = 0; i < 8; i++) {
    let b = ri(2, 4);
    let { o, a: ans } = mk(frac(b * b * b, 2), [frac(b * b * b, 6), `${b}`, frac(b * b * b, 3)]);
    add(CH1, 'single', `lim(x→0) (tan(${b}x)−sin(${b}x))/x³=（　　）`, o, ans, `tan(${b}x)−sin(${b}x)=tan(${b}x)(1−cos(${b}x))~${b}x·(${b}x)²/2，故原式=${frac(b * b * b, 2)}。`, 2, ZY);
  }
  for (let i = 0; i < 8; i++) {
    let a = ri(1, 4);
    let { o, a: ans } = mk(frac(a * a, 2), [`${a}`, frac(a * a * a, 6), '−' + frac(a * a, 2)]);
    add(CH1, 'single', `lim(x→0) (e^(${a}x)−1−${a}x)/x²=（　　）`, o, ans, `由泰勒展开e^(${a}x)=1+${a}x+(${a}x)²/2+o(x²)，分子~${a * a}x²/2，原式=${frac(a * a, 2)}。`, 2, ZY);
  }
  for (let i = 0; i < 8; i++) {
    let a = ri(2, 5);
    let { o, a: ans } = mk('同阶但不等价', ['等价无穷小', '高阶无穷小', '低阶无穷小']);
    add(CH1, 'single', `当x→0时，e^(${a}x)−1−${a}x关于x是（　　）`, o, ans, `(e^(${a}x)−1−${a}x)/x²→${frac(a * a, 2)}≠0且≠1，故为同阶但不等价无穷小。`, 2, ZY);
  }
  for (let i = 0; i < 8; i++) {
    let a = ri(1, 5);
    add(CH1, 'fill', `（填空题）为使f(x)=(e^(${a}x)−1)/x（x≠0）在x=0处连续，应定义f(0)=______。`, '[]', `${a}`, `x→0时e^(${a}x)−1~${a}x，故lim f(x)=${a}，定义f(0)=${a}即连续。`, 1, ZY);
  }
  const concepts = [
    ['若f(x)在x0处连续，则f(x)在x0处', '极限必存在', ['导数必存在', '必可微', '导数必为0'], '连续的定义即极限存在且等于函数值；连续不一定可导。'],
    ['若f(x)在x0处可导，则f(x)在x0处', '必连续', ['必不连续', '极限未必存在', '必取得极值'], '可导必连续，反之不真。'],
    ['若f(x)在[a,b]上可积，则f(x)在[a,b]上', '必有界', ['必连续', '必可导', '必单调'], '可积的必要条件是有界；有界未必连续。'],
    ['F(x)是f(x)的一个原函数，是指', 'F′(x)=f(x)', ['f′(x)=F(x)', 'F(x)−f(x)恒为常数', 'F(x)必连续可导'], '原函数定义：F′=f。'],
    ['若lim f(x)（x→x0）=∞，则x0是f(x)的', '第二类间断点', ['第一类间断点', '可去间断点', '跳跃间断点'], '极限为无穷属第二类（无穷间断点）。'],
    ['若f(x)是可导的奇函数，则f′(x)是', '偶函数', ['奇函数', '非奇非偶函数', '奇偶性不确定'], '对f(−x)=−f(x)两边求导得−f′(−x)=−f′(x)，即f′(−x)=f′(x)。'],
    ['若f(x)是可导的偶函数，则f′(x)是', '奇函数', ['偶函数', '非奇非偶函数', '奇偶性不确定'], '对f(−x)=f(x)两边求导得−f′(−x)=f′(x)，即f′为奇函数。'],
    ['若f(x)可导且以T为周期，则f′(x)', '也以T为周期', ['未必是周期函数', '以2T为周期', '必单调'], '对f(x+T)=f(x)两边求导得f′(x+T)=f′(x)。'],
    ['若f(x)在闭区间[a,b]上连续，则f(x)在[a,b]上', '有界且能取到最大值与最小值', ['必可导', '必单调', '未必有界'], '闭区间上连续函数的最值定理。'],
    ['当x→0时，1−cosx与下列哪个无穷小等价', 'x²/2', ['x²', 'x', 'x³/6'], '由泰勒展开cosx=1−x²/2+o(x²)。'],
    ['当x→0时，tanx−sinx是x的', '高阶无穷小', ['等价无穷小', '低阶无穷小', '同阶不等价无穷小'], 'tanx−sinx=tanx(1−cosx)~x·x²/2=x³/2，为x的3阶（高阶）无穷小。'],
    ['若f(x)g(x)在x0处连续，则f(x)、g(x)在x0处', '未必都连续', ['都连续', '都间断', '至少有一个连续'], '反例：g(x)≡0，f(x)为任意间断函数，乘积恒为0仍连续。']
  ];
  for (const [q, ans2, wrongs, expl] of concepts) {
    let { o, a: ans } = mk(ans2, wrongs);
    add(CH1, 'single', q + '（　　）', o, ans, expl, 1, ZY);
  }
  const laConcepts = [
    ['若A为n阶矩阵且r(A)=n，则齐次方程组Ax=0', '只有零解', ['有非零解', '有无穷多解', '可能无解'], 'r(A)=n（满秩）时齐次方程组只有零解。', LA4],
    ['若A为n阶矩阵且|A|=0，则', 'A至少有一个特征值为0', ['A必为零矩阵', 'r(A)=n', 'A无特征值'], '|A|=|λE−A|在λ=0处为0，故0是特征值。', LA5],
    ['若向量组α1,…,αs线性无关，则', '它的任一部分组都线性无关', ['添加任一向量后仍线性无关', ['去掉任一向量后可能线性相关', '每个向量都必须是单位向量']], '部分组保持无关；添加向量可能变相关。', LA3],
    ['若A与对角阵相似，则A', '有n个线性无关的特征向量', ['必有n个互异特征值', '必为对称矩阵', '必可逆'], '可对角化的充要条件是有n个线性无关的特征向量。', LA5],
    ['若A为实对称矩阵，则A的特征值', '全是实数', ['全是正数', ['全互不相同', '全不为零']], '实对称矩阵特征值必为实数。', LA5],
    ['若r(A)=r，则A中', '至少有一个r阶子式不为零', ['所有r阶子式都为零', '所有r+1阶子式都不为零', '所有r−1阶子式都不为零'], '秩的定义：最高阶非零子式的阶数。', LA1],
    ['若Ax=b有无穷多解，则', 'r(A)=r(A|b)且小于未知量个数', ['r(A)<r(A|b)', 'r(A)等于未知量个数', '|A|≠0'], '有解且导出组有非零解。', LA4],
    ['若η1、η2是Ax=b的两个解，则', 'η1−η2是Ax=0的解', ['η1+η2是Ax=b的解', '(η1+η2)/3是Ax=b的解', 'η1−η2是Ax=b的解'], 'A(η1−η2)=b−b=0。', LA4],
    ['若二次型f=xᵀAx正定，则', 'A的特征值全为正', ['A的元素全为正', 'A必为单位阵', 'A未必对称'], '正定等价于特征值全正。', LA6],
    ['若λ是A的特征值，则λ²是下列哪个矩阵的特征值', 'A²', ['A', '2A', 'A+E'], 'A²x=A(λx)=λ²x。', LA5],
    ['若A可逆且λ是A的特征值，则A⁻¹的特征值是', '1/λ', ['λ', '−λ', 'λ²'], '由Ax=λx得A⁻¹x=(1/λ)x。', LA5],
    ['若A为n阶矩阵且r(A)=1，则Ax=0的基础解系含', 'n−1个向量', ['1个向量', 'n个向量', '0个向量'], '基础解系向量个数=n−r(A)=n−1。', LA4]
  ];
  for (const [q, ans2, wrongs, expl, ch] of laConcepts) {
    let { o, a: ans } = mk(ans2, wrongs);
    add(ch, 'single', q + '（　　）', o, ans, expl, 2, ZY);
  }
}

function genWuZhongxiang() {
  for (let i = 0; i < 10; i++) {
    let d = ri(1, 6);
    add(CH2, 'fill', `（填空题）设曲线由参数方程x=t²+1，y=t³+${d}t确定，则d²y/dx²|_(t=1)=______。`, '[]', frac(3 - d, 4), `x′=2t，x″=2；y′=3t²+${d}，y″=6t。d²y/dx²=(y″x′−y′x″)/(x′)³=(12t²−6t²−${2 * d})/(8t³)=(6t²−${2 * d})/(8t³)。代入t=1得(6−${2 * d})/8=${frac(3 - d, 4)}。`, 2, WZX);
  }
  for (let i = 0; i < 8; i++) {
    let a = ri(2, 4);
    add(CH2, 'fill', `（填空题）设f(x)=x^${a}·lnx（x>0），则f(x)的最小值为______。`, '[]', `−1/(${a}e)`, `f′(x)=x^${a - 1}(${a}lnx+1)，令f′=0得x=e^{−1/${a}}。f(e^{−1/${a}})=(e^{−1/${a}})^${a}·(−1/${a})=e^{−1}·(−1/${a})=−1/(${a}e)。x<e^{−1/${a}}时f′<0，x>e^{−1/${a}}时f′>0，故为最小值。`, 3, WZX);
  }
  for (let i = 0; i < 8; i++) {
    let a = ri(1, 4);
    add(CH2, 'fill', `（填空题）曲线y=${a}x²在点x=0处的曲率为______。`, '[]', `${2 * a}`, `y′=2${a}x，y″=2${a}。x=0处y′=0，故κ=|y″|/(1+y′²)^{3/2}=2${a}=${2 * a}。`, 1, WZX);
  }
  for (let i = 0; i < 8; i++) {
    let a = ri(2, 4);
    let { o, a: ans } = mk(`y=${a}x−${a - 1}`, [`y=${a}x+${1 - a === 0 ? 0 : 1 - a}`, `y=${a - 1}x+1`, `y=${a + 1}x−${a}`]);
    add(CH2, 'single', `曲线y=x^${a}在点(1,1)处的切线方程是（　　）`, o, ans, `y′=${a}x^${a - 1}，x=1处斜率为${a}，切线y−1=${a}(x−1)，即y=${a}x−${a - 1}。`, 1, WZX);
  }
  const concepts = [
    ['若f′(x0)=0且f″(x0)>0，则x0是f(x)的', '极小值点', ['极大值点', '不是极值点', '无法判断'], '驻点处二阶导为正，取极小值。'],
    ['若f′(x0)=0且f″(x0)=0，则x0', '可能是极值点也可能不是', ['必是极值点', '必不是极值点', '必是拐点'], '如x⁴与x³在0处均满足条件，前者是极值后者不是。'],
    ['设f(x)二阶可导，(x0,f(x0))是曲线y=f(x)的拐点，则必有', 'f″(x0)=0', ['f′(x0)=0', 'f″(x0)>0', 'f″(x0)≠0'], '二阶导存在时拐点处二阶导必为零。'],
    ['若f(x)在区间I上单调增加且为凸（上凸）函数，则f′(x)在I上', '为正且单调减少', ['为正且单调增加', '为负且单调减少', '为负且单调增加'], '递增→f′≥0；上凸→f″≤0，即f′递减。'],
    ['设f(x)在x0某邻域连续，去心邻域内可导，且lim f′(x)（x→x0）=A，则f′(x0)', '存在且等于A', ['不存在', '等于0', '无法确定'], '由导数极限定理（洛必达）得f′(x0)=A。'],
    ['设f(x)在[a,b]上连续，f(a)=f(b)=0，在(a,b)内可导，且f在[a,b]上不恒为零，则存在ξ∈(a,b)使', 'f′(ξ)=0', ['f(ξ)=0', 'f″(ξ)=0', 'f′(ξ)=f(ξ)'], 'f在内部取到非零最值，最值点处导数为零。'],
    ['若f(x)处处可导且|f′(x)|≤M，则f(x)', '满足利普希茨条件（一致连续）', ['未必连续', '必单调', '必有界'], '由拉格朗日中值定理|f(x1)−f(x2)|≤M|x1−x2|。'],
    ['若f(x)在x0处可导且在x0取得极值，则', 'f′(x0)=0', ['f′(x0)>0', 'f′(x0)<0', 'f′(x0)可取任意值'], '费马定理。'],
    ['曲线y=f(x)的拐点是', '曲线上凹凸性发生改变的点', ['函数的极值点', '导数为零的点', '间断点'], '拐点是曲线上的点，刻画凹凸性改变。'],
    ['若f(x)在x0可导，则lim [f(x0+h)−f(x0−h)]/(2h)（h→0）=', 'f′(x0)', ['2f′(x0)', 'f′(x0)/2', '0'], '分子分母同除以2即导数定义的对称形式。']
  ];
  for (const [q, ans2, wrongs, expl] of concepts) {
    let { o, a: ans } = mk(ans2, wrongs);
    add(CH2, 'single', q + '（　　）', o, ans, expl, 2, WZX);
  }
}

function genWuIntegral() {
  for (let i = 0; i < 10; i++) {
    let m = ri(1, 3), n = ri(1, 3);
    add(CH3, 'fill', `（填空题）∫₀¹ x^${m}(1−x)^${n} dx=______。`, '[]', frac(fact(m) * fact(n), fact(m + n + 1)), `由贝塔函数公式∫₀¹ x^m(1−x)^n dx=m!n!/(m+n+1)!，代入m=${m}、n=${n}得${fact(m)}×${fact(n)}/${fact(m + n + 1)}=${frac(fact(m) * fact(n), fact(m + n + 1))}。`, 2, WZX);
  }
  for (let i = 0; i < 8; i++) {
    let a = ri(1, 3), b = ri(1, 4);
    add(CH3, 'fill', `（填空题）∫₋${a}^${a}(x³cosx+${b})dx=______。`, '[]', `${2 * a * b}`, `x³cosx是奇函数，对称区间积分为0；常数${b}的积分为${b}×2×${a}=${2 * a * b}。`, 1, WZX);
  }
  for (let i = 0; i < 8; i++) {
    let a = ri(1, 4);
    add(CH3, 'fill', `（填空题）由曲线y=√x、直线x=${a}与x轴所围图形绕x轴旋转一周所得旋转体体积V=______。`, '[]', `${frac(a * a, 2)}π`, `V=π∫₀^${a} (√x)² dx=π∫₀^${a} x dx=π·${a}²/2=${frac(a * a, 2)}π。`, 1, WZX);
  }
  const concepts = [
    ['若f(x)在[a,b]上连续，则f(x)在[a,b]上', '必存在原函数', ['未必可积', '必单调', '必恒正'], '连续函数既有原函数又可积。'],
    ['若f(x)在[a,b]上有界且只有有限个间断点，则f(x)在[a,b]上', '可积', ['必连续', '必有原函数', '必可导'], '有限个间断点的有界函数黎曼可积。'],
    ['若f(x)为连续的奇函数，则∫₋ₐᵃ f(x)dx=', '0', ['2∫₀ᵃ f(x)dx', '∫₀ᵃ f(x)dx', '不确定'], '奇函数在对称区间上积分为零。'],
    ['F(x)=∫₀ˣ f(t)dt，若f连续，则F′(x)=', 'f(x)', ['F(x)', 'f(x)−f(0)', '0'], '变上限积分求导基本定理。'],
    ['若f(x)在[a,b]上连续且∫ₐᵇ f(x)dx=0，则', '存在ξ∈[a,b]使f(ξ)=0（若f不变号则f恒为零）', ['f(x)恒为零', 'f在(a,b)内必有零点无需任何条件', 'f必单调'], '积分中值定理：∫=f(ξ)(b−a)=0。'],
    ['定积分∫ₐᵇ f(x)dx的值', '只与积分区间和被积函数有关', ['与积分变量记号有关', '必为正', '必与不定积分相同'], '定积分是数值，与变量记号无关。'],
    ['若f(x)≥0且在[a,b]连续，∫ₐᵇ f(x)dx=0，则', 'f(x)在[a,b]上恒为零', ['f只在端点为零', 'f可任意', 'f恰有一点为零'], '连续非负函数积分为零必恒为零。'],
    ['下列函数中在[−1,1]上可积的是', '有有限个跳跃间断点的有界函数', ['任意无界函数', '任意函数', '处处不连续的函数'], '有界且间断点有限则可积。']
  ];
  for (const [q, ans2, wrongs, expl] of concepts) {
    let { o, a: ans } = mk(ans2, wrongs);
    add(CH3, 'single', q + '（　　）', o, ans, expl, 1, WZX);
  }
}

function genTangJiafeng() {
  for (let i = 0; i < 10; i++) {
    let p = ri(1, 4), q = ri(1, 5), r = ri(1, 3);
    add(CH2, 'fill', `（填空题）设f(x)=(${p}x+${q})e^(${r}x)，则f′(0)=______。`, '[]', `${p + q * r}`, `f′(x)=${p}·e^(${r}x)+(${p}x+${q})·${r}·e^(${r}x)，代入x=0得${p}+${q}×${r}=${p + q * r}。`, 1, TJF);
  }
  for (let i = 0; i < 8; i++) {
    let od = 2 * ri(0, 3) + 1;
    add(CH3, 'fill', `（填空题）∫₀^π sin(${od}x)dx=______。`, '[]', frac(2, od), `∫₀^π sin(${od}x)dx=[−cos(${od}x)/${od}]₀^π=(1−cos(${od}π))/${od}=(1+1)/${od}=${frac(2, od)}。`, 1, TJF);
  }
  for (let i = 0; i < 8; i++) {
    let p = ri(2, 5);
    add(CH3, 'fill', `（填空题）反常积分∫₁^∞ dx/x^${p}=______。`, '[]', frac(1, p - 1), `∫₁^∞ x^(−${p})dx=[x^(−${p - 1})/(−${p - 1})]₁^∞=0−(−1/${p - 1})=${frac(1, p - 1)}（${p}>1收敛）。`, 1, TJF);
  }
  for (let i = 0; i < 10; i++) {
    let a = ri(1, 4), b = ri(1, 4), c = ri(1, 4);
    let d1 = ri(0, 5), d2 = ri(0, 5), d3 = ri(0, 5);
    add(LA1, 'fill', `（填空题）下三角行列式 |${a} 0 0; ${d1} ${b} 0; ${d2} ${d3} ${c}| =______。`, '[]', `${a * b * c}`, `三角行列式的值等于主对角线元素之积：${a}×${b}×${c}=${a * b * c}。`, 1, TJF);
  }
  for (let i = 0; i < 8; i++) {
    let a = ri(0, 3), b = ri(1, 3), c = ri(1, 3), d = ri(0, 3), e = ri(1, 3), f2 = ri(0, 3), g = ri(1, 3), h = ri(0, 3);
    let ans11 = a * e + b * g;
    add(LA2, 'fill', `（填空题）设A=[${a} ${b}; ${c} ${d}]，B=[${e} ${f2}; ${g} ${h}]，则乘积AB的第1行第1列元素为______。`, '[]', `${ans11}`, `(AB)₁₁=${a}×${e}+${b}×${g}=${ans11}。`, 1, TJF);
  }
  const judges = [
    ['若f(x)在x0可导，则f(x)在x0连续。', '正确', '可导必连续。'],
    ['若f(x)在x0连续，则f(x)在x0可导。', '错误', '反例：|x|在0连续但不可导。'],
    ['若f(x)、g(x)在x0都间断，则f(x)+g(x)在x0必间断。', '错误', '反例：g=−f，两者都间断但和恒为0连续。'],
    ['若f(x)在[a,b]上连续，则f(x)在[a,b]上可积。', '正确', '连续必可积。'],
    ['若f(x)在[a,b]上可积，则f(x)在[a,b]上连续。', '错误', '有有限个跳跃间断点的有界函数可积但不连续。'],
    ['若F′(x)=f(x)，则f(x)的不定积分是F(x)+C（C为任意常数）。', '正确', '不定积分是全体原函数。'],
    ['若A、B均为n阶可逆矩阵，则AB可逆且(AB)⁻¹=B⁻¹A⁻¹。', '正确', '逆矩阵的反序律。'],
    ['若A²=A，则A=O或A=E。', '错误', '幂等矩阵不唯一，如对角阵diag(1,0)。'],
    ['若A为n阶矩阵且|A|=0，则A至少有一行可由其余行线性表示。', '正确', '秩小于n，行向量组线性相关。'],
    ['若向量组α1,α2,α3线性相关，则其中任一向量都可由其余两个线性表示。', '错误', '只能推出至少有一个向量可由其余表示。'],
    ['若A与B相似，则A与B的特征值相同。', '正确', '相似矩阵有相同特征多项式。'],
    ['若二次型正定，则其各项系数全为正。', '错误', '正定看特征值（或顺序主子式），不能只看系数。']
  ];
  for (const [q, ans2, expl] of judges) {
    let { o, a: ans } = mkj(ans2);
    add(COMP, 'judge', q, o, ans, expl, 1, TJF);
  }
}

function genEssays() {
  for (let i = 0; i < 8; i++) {
    let p = ri(-3, 3), r = ri(1, 3), q = ri(1, 6);
    let poly = 'x²' + (p === 0 ? '' : (p > 0 ? `+${p === 1 ? '' : p}x` : `−${p === -1 ? '' : -p}x`)) + (q === 0 ? '' : (q > 0 ? `+${q}` : `−${-q}`));
    let s = p + r;
    let asym = 'y=x' + (s === 0 ? '' : (s > 0 ? `+${s}` : `−${-s}`));
    let rem = q + r * (p + r);
    add(COMP, 'essay', `（解答题）求曲线y=(${poly})/(x−${r})的斜渐近线方程。`, '[]', `${asym}`, `多项式长除：${poly}=(x−${r})(x+${p + r < 0 ? '−' + (-(p + r)) : p + r})+${rem}，故y=x+${p + r}+${rem}/(x−${r})。当x→∞时${rem}/(x−${r})→0，斜渐近线为${asym}。`, 2, ZY);
  }
}

genZhangYu();
genWuZhongxiang();
genWuIntegral();
genTangJiafeng();
genEssays();

let sql = '';
const batch = 50;
for (let i = 0; i < Q.length; i += batch) {
  const part = Q.slice(i, i + batch);
  sql += 'INSERT INTO questions (subject, chapter, type, question, options, answer, explanation, difficulty, source) VALUES\n';
  part.forEach((q, j) => {
    sql += `('math2', '${esc(q.ch)}', '${q.t}', '${esc(q.q)}', '${esc(q.o)}', '${esc(q.a)}', '${esc(q.e)}', ${q.d}, '${esc(q.src)}')${j < part.length - 1 ? ',' : ';'}\n`;
  });
  sql += '\n';
}
fs.writeFileSync('seed_teacher_math2.sql', sql);
console.log(`Generated ${Q.length} questions`);
console.log(`ZY=${Q.filter(q => q.src === ZY).length} WZX=${Q.filter(q => q.src === WZX).length} TJF=${Q.filter(q => q.src === TJF).length}`);