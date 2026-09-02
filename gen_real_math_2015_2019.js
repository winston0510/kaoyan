import fs from 'node:fs';

const Q = [];
const seen = new Set();
let seed = 50150;
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
function add(ch, t, q, o, a, e, d, src) { if (seen.has(q)) return; seen.add(q); Q.push({ ch, t, q, o, a, e, d, src }); }
const SUP = { 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸' };

const CH1 = '第1章 函数、极限、连续';
const CH2 = '第2章 一元函数微分学';
const CH3 = '第3章 一元函数积分学';
const CH5 = '第5章 二重积分';
const CH6 = '第6章 常微分方程';
const LA1 = '第1章 行列式';
const LA2 = '第2章 矩阵';
const LA4 = '第4章 线性方程组';
const LA5 = '第5章 特征值与特征向量';

function genYear(year, yi) {
  const src = `${year}真题风格题`;

  let a = yi + 2, b = ri(2, 4);
  let m1 = mk(`e^${a * b}`, [`e^${a + b}`, `e^${a}`, `e^${2 * a * b}`]);
  add(CH1, 'single', `lim(x→0) (1+${a}x)^(${b}/x)=（　　）`, m1.o, m1.a, `(1+${a}x)^(${b}/x)=[(1+${a}x)^(1/(${a}x))]^(${a * b})→e^${a * b}。`, 2, src);

  let a2 = yi + 2;
  let m2 = mk('−' + frac(a2 * a2 * a2, 6), [frac(a2 * a2 * a2, 6), '−' + frac(a2 * a2 * a2, 3), frac(a2 * a2 * a2, 2)]);
  add(CH1, 'single', `lim(x→0) (sin(${a2}x)−${a2}x)/x³=（　　）`, m2.o, m2.a, `sin(${a2}x)=${a2}x−(${a2}x)³/6+o(x³)，分子~−${a2 * a2 * a2}x³/6，原式=−${frac(a2 * a2 * a2, 6)}。`, 2, src);

  let a3 = yi + 1, b3 = a3 + ri(1, 3);
  let m3 = mk('2个', ['0个', '1个', '3个']);
  add(CH2, 'single', `设f(x)=|x−${a3}|·|x−${b3}|，则f(x)的不可导点个数为（　　）`, m3.o, m3.a, `|x−c|型因子在x=c处不可导，${a3}与${b3}两点处左右导数均不相等，故不可导点共2个。`, 2, src);

  let p4 = yi + 2;
  let m4 = mk('2个', ['0个', '1个', '3个']);
  add(CH2, 'single', `设f(x)=x³−${3 * p4}x，则f(x)的驻点个数为（　　）`, m4.o, m4.a, `f′(x)=3x²−${3 * p4}=0得x=±√${p4}，两个实根，故驻点2个。`, 2, src);

  let a5 = yi + 2;
  let m5 = mk(`xsin(${a5}x)`, [`sin(${a5}x)`, `xcos(${a5}x)`, `sin(${a5}x)+xcos(${a5}x)`]);
  add(CH3, 'single', `设F(x)=∫₀^x t·sin(${a5}t)dt，则F′(x)=（　　）`, m5.o, m5.a, `变上限积分求导：F′(x)=x·sin(${a5}x)。`, 2, src);

  let a6 = yi + 2, b6 = ri(2, 4);
  let m6 = mk(frac(a6 * a6 * b6 * b6, 4), [frac(a6 * a6 * b6 * b6, 2), frac(a6 * b6, 2), frac(a6 * a6 * b6 * b6, 8)]);
  add(CH5, 'single', `设D为矩形区域0≤x≤${a6}，0≤y≤${b6}，则∫∫_D xy dxdy=（　　）`, m6.o, m6.a, `∫∫_D xy dxdy=(∫₀^${a6} x dx)(∫₀^${b6} y dy)=(${frac(a6 * a6, 2)})(${frac(b6 * b6, 2)})=${frac(a6 * a6 * b6 * b6, 4)}。`, 2, src);

  let p7 = yi + 1;
  let m7 = mk(`(x+C)e^(−${p7}x)`, [`(x+C)e^(${p7}x)`, `Ce^(−${p7}x)`, `(x²/2+C)e^(−${p7}x)`]);
  add(CH6, 'single', `微分方程y′${p7 === 1 ? '+' : '+' + p7}y=e^(−${p7}x)的通解为（　　）`, m7.o, m7.a, `对应齐次通解Ce^(−${p7}x)；因右端e^(−${p7}x)的指数−${p7}是特征单根，特解形式为x·e^(−${p7}x)，代入得特解x·e^(−${p7}x)，故通解(x+C)e^(−${p7}x)。`, 3, src);

  let n8 = yi + 3;
  let m8 = mk(`k${SUP[n8]}|A|`, ['k|A|', `k${SUP[n8 + 1]}|A|`, 'nk|A|']);
  add(LA2, 'single', `设A为${n8}阶方阵，k为常数，则|kA|=（　　）`, m8.o, m8.a, `k乘${n8}阶矩阵相当于每行都提出因子k，共${n8}行，故|kA|=k${SUP[n8]}|A|。`, 2, src);

  let n9 = yi + 3, r9 = ri(1, n9 - 1);
  let m9 = mk('有无穷多解', ['有唯一解', '无解', '解的情况无法确定']);
  add(LA4, 'single', `设${n9}元非齐次线性方程组Ax=b的系数矩阵与增广矩阵的秩均为${r9}，则该方程组（　　）`, m9.o, m9.a, `R(A)=R(Ā)=${r9}<${n9}，故方程组有无穷多解。`, 2, src);

  let a10 = yi + 1, b10 = yi + 5;
  let m10 = mk('0', [`${a10}`, `${b10}`, `${a10 + b10}`]);
  add(LA5, 'single', `设3阶矩阵A的特征值为${a10}，${b10}，−${a10 + b10}，则tr(A)=（　　）`, m10.o, m10.a, `迹等于特征值之和：${a10}+${b10}−${a10 + b10}=0。`, 2, src);

  let f1 = yi + 2;
  add(CH1, 'fill', `（填空题）lim(x→0) (${f1}^x−1)/x=______。`, '[]', `ln${f1}`, `由等价无穷小a^x−1~xlna（x→0），原式=ln${f1}。`, 2, src);

  let k2 = yi + 2;
  add(CH2, 'fill', `（填空题）曲线y=x^${k2}在点(1,1)处的切线方程为______。`, '[]', `y=${k2}x−${k2 - 1}`, `y′=${k2}x^${k2 - 1}，在x=1处斜率k=${k2}，切线y−1=${k2}(x−1)，即y=${k2}x−${k2 - 1}。`, 2, src);

  let k3 = yi + 2;
  add(CH3, 'fill', `（填空题）∫₀¹ x·e^(${k3}x)dx=______。`, '[]', `(${k3 - 1}e^${k3}+1)/${k3 * k3}`, `分部积分：∫xe^(kx)dx=((kx−1)e^(kx))/k²，代入上下限得((${k3}−1)e^${k3}+1)/${k3 * k3}。`, 3, src);

  let a4 = yi + 2;
  add(CH5, 'fill', `（填空题）设D:0≤x≤${a4}，0≤y≤${a4}，则∫∫_D x dxdy=______。`, '[]', frac(a4 * a4 * a4, 2), `∫∫_D x dxdy=(∫₀^${a4} x dx)(∫₀^${a4} dy)=${frac(a4 * a4, 2)}·${a4}=${frac(a4 * a4 * a4, 2)}。`, 2, src);

  let a5b = yi + 2, b5b = ri(1, 5);
  add(CH6, 'fill', `（填空题）微分方程y′=${a5b}x满足初始条件y(0)=${b5b}的特解为______。`, '[]', `y=${frac(a5b, 2)}x²+${b5b}`, `两边积分得y=${frac(a5b, 2)}x²+C，代入y(0)=${b5b}得C=${b5b}。`, 2, src);

  let a6b = yi + 1, b6b = ri(1, 4), a6c = ri(2, 4), b6c = ri(1, 4);
  while (a6b * b6c - a6c * b6b === 0) { a6c = ri(2, 4); b6c = ri(1, 4); }
  let px = ri(1, 5), py = ri(1, 5);
  let c1 = a6b * px + b6b * py, c2 = a6c * px + b6c * py;
  add(LA1, 'fill', `（填空题）设方程组 ${a6b}x+${b6b}y=${c1}，${a6c}x+${b6c}y=${c2}，则x+y=______。`, '[]', `${px + py}`, `由克拉默法则，D=${a6b * b6c - a6c * b6b}≠0，解得x=${px}，y=${py}，故x+y=${px + py}。`, 2, src);

  let e1 = yi + 2;
  add(CH1, 'essay', `（本题满分10分）求极限lim(x→0) (tan(${e1}x)−sin(${e1}x))/x³。`, '[]', frac(e1 * e1 * e1, 2), `tan(${e1}x)−sin(${e1}x)=tan(${e1}x)(1−cos(${e1}x))。当x→0时tan(${e1}x)~${e1}x，1−cos(${e1}x)~(${e1}x)²/2，故分子~${e1 * e1 * e1}x³/2，原式=${frac(e1 * e1 * e1, 2)}。`, 3, src);

  let e2 = yi + 2;
  add(CH2, 'essay', `（本题满分10分）求函数f(x)=x^${e2}·lnx（x>0）的极值。`, '[]', `极小值−1/(${e2}e)，在x=e^(−1/${e2})处取得`, `f′(x)=x^${e2 - 1}(${e2}lnx+1)。令f′(x)=0，得唯一驻点x=e^(−1/${e2})。当0<x<e^(−1/${e2})时f′<0，当x>e^(−1/${e2})时f′>0，故该点为极小值点，极小值f(e^(−1/${e2}))=(e^(−1/${e2}))^${e2}·(−1/${e2})=−1/(${e2}e)。`, 3, src);

  let e3 = yi + 2;
  add(CH3, 'essay', `（本题满分10分）求由曲线y=x²与直线y=${e3}x所围平面图形的面积S。`, '[]', frac(e3 * e3 * e3, 6), `联立x²=${e3}x得交点x=0与x=${e3}。S=∫₀^${e3}(${e3}x−x²)dx=(${e3}x²/2−x³/3)|₀^${e3}=${e3 * e3 * e3}/2−${e3 * e3 * e3}/3=${frac(e3 * e3 * e3, 6)}。`, 3, src);

  let e4 = yi + 2;
  add(CH5, 'essay', `（本题满分10分）设D:0≤x≤${e4}，0≤y≤${e4}，计算二重积分∫∫_D xy dxdy。`, '[]', frac(e4 * e4 * e4 * e4, 4), `∫∫_D xy dxdy=(∫₀^${e4} x dx)(∫₀^${e4} y dy)=(${frac(e4 * e4, 2)})(${frac(e4 * e4, 2)})=${frac(e4 * e4 * e4 * e4, 4)}。`, 3, src);

  let ep = yi + 1, eq = ri(1, 4), er = ri(2, 5);
  add(LA4, 'essay', `（本题满分11分）解方程组 x+y+z=${ep + eq + er}，y+z=${eq + er}，z=${er}。`, '[]', `x=${ep}，y=${eq}，z=${er}`, `由第三式z=${er}，代入第二式得y=${eq}，再代入第一式得x=${ep}。`, 3, src);

  let ea = yi + 1, eb = ea + ri(1, 3), ec = ri(1, 4);
  add(LA5, 'essay', `（本题满分11分）设A=[${ea} ${ec}; 0 ${eb}]，求可逆矩阵P，使P⁻¹AP为对角矩阵，并写出该对角矩阵。`, '[]', `λ₁=${ea}，λ₂=${eb}，P=[1 ${ec}; 0 ${eb - ea}]，P⁻¹AP=[${ea} 0; 0 ${eb}]`, `上三角矩阵的特征值即对角元${ea}与${eb}。对λ=${ea}：(A−${ea}E)x=0得${ec}x₂=0，取ξ₁=(1,0)ᵀ。对λ=${eb}：(${ea}−${eb})x₁+${ec}x₂=0，取ξ₂=(${ec},${eb - ea})ᵀ。令P=(ξ₁,ξ₂)=[1 ${ec}; 0 ${eb - ea}]，则P⁻¹AP=diag(${ea},${eb})。`, 4, src);
}

[2015, 2016, 2017, 2018, 2019].forEach((year, yi) => genYear(year, yi));

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
fs.writeFileSync('seed_real_math_2015_2019.sql', sql);
console.log(`Generated ${Q.length} questions`);
for (const year of [2015, 2016, 2017, 2018, 2019]) console.log(`${year}=${Q.filter(q => q.src === `${year}真题风格题`).length}`);
