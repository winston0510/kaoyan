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

function genTheorems() {
  const ch = '电路定理';
  for (let i = 0; i < 15; i++) {
    let a = ri(1, 6), b = ri(1, 6), s = Math.random() < 0.5 ? 1 : -1;
    let I = a + s * b;
    let { o, a: ans } = mk(`${I}A`, [`${a - s * b}A`, `${a}A`, `${s * b}A`]);
    add(ch, 'single', `线性电路中，电压源单独作用时某支路电流I'=${a}A，电流源单独作用时I''=${s * b}A，则两源共同作用时I=`, o, ans, `叠加定理：I=I'+I''=${a}+(${s * b})=${I}A`, 2);
  }
  for (let i = 0; i < 15; i++) {
    let Uoc = ri(6, 30) * 2, Req = ri(4, 16), RL = ri(2, 12);
    let I = frac(Uoc, Req + RL);
    let { o, a: ans } = mk(`${I}A`, [`${frac(Uoc, Req)}A`, `${frac(Uoc, RL)}A`, `${frac(Uoc, Req + RL + 2)}A`]);
    add(ch, 'single', `某单口网络戴维宁等效电路Uoc=${Uoc}V、Req=${Req}Ω，接负载RL=${RL}Ω，则负载电流I=`, o, ans, `I=Uoc/(Req+RL)=${Uoc}/${Req + RL}=${I}A`, 2);
  }
  for (let i = 0; i < 15; i++) {
    let Uoc = ri(4, 24) * 2, Req = ri(4, 16);
    let P = frac(Uoc * Uoc, 4 * Req);
    let { o, a: ans } = mk(`${P}W`, [`${frac(Uoc * Uoc, Req)}W`, `${frac(Uoc * Uoc, 2 * Req)}W`, `${frac(Uoc * Uoc, 8 * Req)}W`]);
    add(ch, 'single', `戴维宁等效电路Uoc=${Uoc}V、Req=${Req}Ω，负载获最大功率时的Pmax=`, o, ans, `RL=Req时获最大功率：Pmax=Uoc²/(4Req)=${Uoc}²/(4×${Req})=${P}W`, 2);
  }
  for (let i = 0; i < 12; i++) {
    let Isc = ri(2, 9), Req = ri(3, 15), RL = ri(2, 12);
    let I = frac(Isc * Req, Req + RL);
    let { o, a: ans } = mk(`${I}A`, [`${frac(Isc * RL, Req + RL)}A`, `${Isc}A`, `${frac(Isc * Req, RL)}A`]);
    add(ch, 'single', `诺顿等效电路Isc=${Isc}A、Req=${Req}Ω，接负载RL=${RL}Ω，则负载电流I=`, o, ans, `分流：I=Isc·Req/(Req+RL)=${Isc}×${Req}/${Req + RL}=${I}A`, 2);
  }
  let concepts = [
    ['叠加定理适用于', '线性电路的电压电流计算', ['非线性电路', '线性电路的功率计算', '任何电路的功率计算']],
    ['叠加定理中某电源单独作用时，其余电压源应', '短路处理', ['开路处理', '保持不变', '接地']],
    ['叠加定理中某电源单独作用时，其余电流源应', '开路处理', ['短路处理', '保持不变', '接地']],
    ['线性电路中功率能否用叠加定理计算', '不能，功率是电源的二次函数', ['能', '仅直流能', '仅交流能']],
    ['负载获得最大功率的条件是', 'RL=Req', ['RL=2Req', 'RL=Req/2', 'RL=0']],
    ['负载获最大功率时传输效率为', '50%', ['100%', '25%', '75%']],
    ['戴维宁定理的等效电阻Req是', '独立源置零后端口等效电阻', ['含独立源时端口电阻', '负载电阻', '开路电压与短路电流之积']],
    ['求Req时受控源应', '保留，用外加电源法或开路短路法', ['置零', '开路', '短路']],
    ['替代定理要求被替代支路', '替代前后电路均有唯一解', ['必须是线性支路', '必须是电阻支路', '必须不含受控源']],
    ['互易定理适用于', '仅含线性电阻的单一激励网络', ['含受控源网络', '非线性网络', '多激励网络']],
    ['理想变压器能否用戴维宁等效', '可以，按端口伏安关系求Uoc与Req', ['不可以', '仅直流可以', '仅交流不可以']],
    ['特勒根定理的依据是', 'KCL与KVL', ['欧姆定律', '叠加定理', '互易定理']]
  ];
  for (let c of concepts) {
    let [q, ans2, wrongs] = c;
    let { o, a: ans } = mk(ans2, wrongs.slice(0, 3));
    add(ch, 'single', q, o, ans, '', 2);
  }
  let judges = [
    ['叠加定理既能叠加电压电流，也能叠加功率。', '错误'],
    ['含受控源的电路求戴维宁等效电阻时不能简单地将受控源置零。', '正确'],
    ['负载电阻等于电源内阻时，负载获得最大功率。', '正确'],
    ['互易定理对含独立源的二端口网络也成立。', '错误'],
    ['替代定理既适用于线性电路，也适用于非线性电路。', '正确'],
    ['戴维宁等效电路只对外电路等效，对内电路不等效。', '正确']
  ];
  for (let j of judges) {
    let { o, a: ans } = mkj(j[1]);
    add(ch, 'judge', j[0], o, ans, '', 2);
  }
}

function genAC() {
  const ch = '正弦稳态分析';
  let triples = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [9, 12, 15], [8, 15, 17]];
  for (let i = 0; i < 20; i++) {
    let t = triples[ri(0, triples.length - 1)];
    let R = t[0], X = t[1], Z = t[2];
    let { o, a: ans } = mk(`${Z}Ω`, [`${R + X}Ω`, `${Math.abs(X - R)}Ω`, `${Z + 2}Ω`]);
    add(ch, 'single', `R=${R}Ω与感抗X=${X}Ω串联，端口阻抗模|Z|=`, o, ans, `|Z|=√(R²+X²)=√(${R * R}+${X * X})=${Z}Ω`, 1);
  }
  for (let i = 0; i < 15; i++) {
    let U = ri(2, 20) * 10, I = ri(1, 9);
    let S = U * I, P = Math.round(S * 0.8), Qv = Math.round(S * 0.6);
    let { o, a: ans } = mk(`${P}W`, [`${S}W`, `${Qv}W`, `${Math.round(S * 0.6 + 10)}W`]);
    add(ch, 'single', `U=${U}V、I=${I}A，功率因数cosφ=0.8(滞后)，则有功功率P=`, o, ans, `S=UI=${S}VA，P=S·cosφ=${S}×0.8=${P}W`, 2);
  }
  for (let i = 0; i < 12; i++) {
    let U = ri(2, 20) * 10, I = ri(1, 9);
    let S = U * I, Qv = Math.round(S * 0.8);
    let { o, a: ans } = mk(`${Qv}var`, [`${S}var`, `${Math.round(S * 0.6)}var`, `${Math.round(S * 0.5)}var`]);
    add(ch, 'single', `U=${U}V、I=${I}A，cosφ=0.6(滞后)，则无功功率Q=`, o, ans, `S=UI=${S}VA，cosφ=0.6时sinφ=0.8，Q=S·sinφ=${S}×0.8=${Qv}var`, 2);
  }
  for (let i = 0; i < 12; i++) {
    let R = ri(2, 10), Ql = R * ri(2, 6);
    let Qq = Ql / R;
    let { o, a: ans } = mk(`${Qq}`, [`${Qq * 2}`, `${frac(R, Ql)}`, `${Qq + 1}`]);
    add(ch, 'single', `串联谐振电路中R=${R}Ω，谐振时ω0L=${Ql}Ω，则品质因数Q=`, o, ans, `Q=ω0L/R=${Ql}/${R}=${Qq}`, 2);
  }
  for (let i = 0; i < 10; i++) {
    let f0 = ri(2, 9) * 100, Qv = ri(2, 10);
    let BW = frac(f0, Qv);
    let { o, a: ans } = mk(`${BW}Hz`, [`${f0 * Qv}Hz`, `${f0}Hz`, `${BW}kHz`]);
    add(ch, 'single', `谐振频率f0=${f0}Hz，Q=${Qv}，则通频带BW=`, o, ans, `BW=f0/Q=${f0}/${Qv}=${BW}Hz`, 2);
  }
  let concepts = [
    ['感性负载的功率因数为', '滞后', ['超前', '等于1', '等于0']],
    ['容性负载的无功功率Q为', '负值', ['正值', '零', '无穷大']],
    ['提高感性负载功率因数的方法是', '并联适当电容', ['串联电容', '并联电感', '串联电阻']],
    ['并联电容提高功率因数后，负载本身的有功功率', '不变', ['增大', '减小', '不确定']],
    ['串联谐振时电路呈', '纯阻性', ['感性', '容性', '不定']],
    ['串联谐振时电感电压与电容电压', '大小相等方向相反', ['大小相等方向相同', '大小不等', '均为零']],
    ['串联谐振时若Q>>1，电感(电容)电压可达电源电压的', 'Q倍', ['1倍', 'Q²倍', '1/Q倍']],
    ['并联谐振时端口阻抗', '最大', ['最小', '为零', '为纯感性']],
    ['阻抗角φ>0说明电路呈', '感性', ['容性', '阻性', '不定']],
    ['正弦稳态中平均功率即', '有功功率P', ['视在功率S', '无功功率Q', '复功率模']]
  ];
  for (let c of concepts) {
    let [q, ans2, wrongs] = c;
    let { o, a: ans } = mk(ans2, wrongs.slice(0, 3));
    add(ch, 'single', q, o, ans, '', 1);
  }
  let judges = [
    ['串联谐振时电路的阻抗最小，电流最大。', '正确'],
    ['无功功率是无用的功率，没有实际意义。', '错误'],
    ['并联电容越大，功率因数提高越多。', '错误'],
    ['谐振时电感与电容之间进行能量交换，不与电源交换无功。', '正确'],
    ['正弦量的有效值等于其最大值的√2倍。', '错误'],
    ['功率因数角等于电压与电流的相位差。', '正确']
  ];
  for (let j of judges) {
    let { o, a: ans } = mkj(j[1]);
    add(ch, 'judge', j[0], o, ans, '', 2);
  }
}

function genDynamic() {
  const ch = '动态电路分析';
  for (let i = 0; i < 15; i++) {
    let R = ri(2, 20), C = ri(1, 10);
    let { o, a: ans } = mk(`${R * C}ms`, [`${frac(R, C)}ms`, `${frac(C, R)}ms`, `${R * C + 1}ms`]);
    add(ch, 'single', `RC一阶电路R=${R}kΩ、C=${C}μF，则时间常数τ=`, o, ans, `τ=RC=${R}kΩ×${C}μF=${R * C}ms`, 1);
  }
  for (let i = 0; i < 15; i++) {
    let L = ri(2, 20), R = ri(2, 10);
    let t = frac(L, R);
    let { o, a: ans } = mk(`${t}s`, [`${frac(R, L)}s`, `${L * R}s`, `${t}s²`]);
    add(ch, 'single', `RL一阶电路L=${L}H、R=${R}Ω，则时间常数τ=`, o, ans, `τ=L/R=${L}/${R}=${t}s`, 1);
  }
  for (let i = 0; i < 12; i++) {
    let a = ri(2, 12), b = ri(1, a - 1);
    let { o, a: ans } = mk(`${a - b}`, [`${a + b}`, `${b - a}`, `${a * b}`]);
    add(ch, 'single', `一阶电路f(0+)=${a}，f(∞)=${b}，三要素法中指数项系数[f(0+)−f(∞)]=`, o, ans, `f(t)=f(∞)+[f(0+)−f(∞)]e^(−t/τ)，系数=${a}−${b}=${a - b}`, 2);
  }
  for (let i = 0; i < 10; i++) {
    let r = ri(2, 6), Rcrit = 2 * r;
    let R = Rcrit + ri(1, 5);
    let { o, a: ans } = mk('过阻尼', ['欠阻尼', '临界阻尼', '无阻尼振荡']);
    add(ch, 'single', `RLC串联电路√(L/C)=${r}Ω，R=${R}Ω，则零输入响应为`, o, ans, `R=${R}>2√(L/C)=${Rcrit}，过阻尼`, 3);
  }
  for (let i = 0; i < 10; i++) {
    let r = ri(3, 8), Rcrit = 2 * r;
    let R = ri(2, Rcrit - 2);
    let { o, a: ans } = mk('欠阻尼', ['过阻尼', '临界阻尼', '非振荡']);
    add(ch, 'single', `RLC串联电路√(L/C)=${r}Ω，R=${R}Ω，则零输入响应为`, o, ans, `R=${R}<2√(L/C)=${Rcrit}，欠阻尼(衰减振荡)`, 3);
  }
  let concepts = [
    ['换路瞬间不能突变的量是', '电容电压与电感电流', ['电容电流与电感电压', '电阻电压', '所有电压电流']],
    ['电容电压不能突变的条件是', '电容电流为有限值', ['电容电压为有限值', '电容为线性', '电路稳定']],
    ['电感电流不能突变的条件是', '电感电压为有限值', ['电感电流为有限值', '电感为线性', '电路稳定']],
    ['时间常数τ越大，过渡过程', '越慢', ['越快', '不变', '不一定']],
    ['工程上认为过渡过程经过多长时间基本结束', '(3~5)τ', ['τ', '2τ', '10τ以上']],
    ['经过一个τ，电容电压衰减到初值的约', '36.8%', ['63.2%', '50%', '100%']],
    ['零输入响应由', '初始储能单独引起', ['外激励单独引起', '初始储能与外激励共同引起', '稳态分量引起']],
    ['零状态响应由', '外激励单独引起', ['初始储能单独引起', '初始储能与外激励共同引起', '稳态分量单独引起']],
    ['全响应= ', '零输入响应+零状态响应', ['稳态分量×暂态分量', '仅强制分量', '仅自由分量']],
    ['一阶电路三要素指', '初始值、稳态值、时间常数', ['电压、电流、功率', '幅值、频率、初相', 'R、L、C']],
    ['求初始值时t=0+等效电路中，电容可视为', '电压源uC(0+)', ['电流源', '短路', '开路']],
    ['求初始值时t=0+等效电路中，电感可视为', '电流源iL(0+)', ['电压源', '短路', '开路']]
  ];
  for (let c of concepts) {
    let [q, ans2, wrongs] = c;
    let { o, a: ans } = mk(ans2, wrongs.slice(0, 3));
    add(ch, 'single', q, o, ans, '', 1);
  }
  let judges = [
    ['换路定律的实质是能量不能突变。', '正确'],
    ['一阶电路的稳态分量就是强制分量。', '正确'],
    ['时间常数与外激励有关。', '错误'],
    ['二阶电路的响应一定比一阶电路慢。', '错误'],
    ['零状态响应中也包含自由分量。', '正确'],
    ['RLC串联电路R=0时为等幅振荡。', '正确']
  ];
  for (let j of judges) {
    let { o, a: ans } = mkj(j[1]);
    add(ch, 'judge', j[0], o, ans, '', 2);
  }
}

function genCoupling() {
  const ch = '耦合电感与变压器';
  let sq = [4, 9, 16, 25];
  for (let i = 0; i < 15; i++) {
    let L1 = sq[ri(0, 3)], L2 = sq[ri(0, 3)];
    let Mmax = Math.sqrt(L1 * L2);
    let M = ri(1, Mmax - 1);
    let k = frac(M, Mmax);
    let { o, a: ans } = mk(`${k}`, [`${frac(Mmax, M)}`, `${frac(2 * M, Mmax)}`, `${frac(M, L1 + L2)}`]);
    add(ch, 'single', `L1=${L1}H、L2=${L2}H，互感M=${M}H，则耦合系数k=`, o, ans, `k=M/√(L1L2)=${M}/${Mmax}=${k}`, 2);
  }
  for (let i = 0; i < 12; i++) {
    let L1 = ri(2, 10), L2 = ri(2, 10), M = ri(1, Math.min(L1, L2) - 1);
    let L = L1 + L2 + 2 * M;
    let { o, a: ans } = mk(`${L}H`, [`${L1 + L2 - 2 * M}H`, `${L1 + L2}H`, `${L1 + L2 + M}H`]);
    add(ch, 'single', `两耦合电感顺向串联，L1=${L1}H、L2=${L2}H、M=${M}H，等效电感L=`, o, ans, `顺串：L=L1+L2+2M=${L1}+${L2}+${2 * M}=${L}H`, 2);
  }
  for (let i = 0; i < 12; i++) {
    let L1 = ri(4, 12), L2 = ri(4, 12), M = ri(1, Math.min(L1, L2) - 2);
    let L = L1 + L2 - 2 * M;
    let { o, a: ans } = mk(`${L}H`, [`${L1 + L2 + 2 * M}H`, `${L1 + L2}H`, `${L1 + L2 - M}H`]);
    add(ch, 'single', `两耦合电感反向串联，L1=${L1}H、L2=${L2}H、M=${M}H，等效电感L=`, o, ans, `反串：L=L1+L2−2M=${L1}+${L2}−${2 * M}=${L}H`, 2);
  }
  for (let i = 0; i < 12; i++) {
    let n = ri(2, 5), ZL = ri(2, 20);
    let Zin = n * n * ZL;
    let { o, a: ans } = mk(`${Zin}Ω`, [`${frac(ZL, n * n)}Ω`, `${n * ZL}Ω`, `${ZL}Ω`]);
    add(ch, 'single', `理想变压器变比n=N1/N2=${n}，副边接ZL=${ZL}Ω，原边输入阻抗Zin=`, o, ans, `Zin=n²ZL=${n}²×${ZL}=${Zin}Ω`, 2);
  }
  let concepts = [
    ['同名端是指', '互感磁通与自感磁通相助的端子', ['位置相同的端子', '电压极性相反的端子', '电流流入的端子']],
    ['互感电压的正负取决于', '电流参考方向与同名端关系', ['电流大小', '电压大小', '频率']],
    ['耦合系数k的取值范围是', '0≤k≤1', ['k≥1', '−1≤k≤1', 'k>0']],
    ['全耦合时k等于', '1', ['0', '0.5', '∞']],
    ['理想变压器的条件不包括', '线圈有电阻', ['无漏磁(k=1)', '无损耗', '导磁率无穷大']],
    ['理想变压器能否储能', '不能，只变换不储能', ['能储磁能', '能储电能', '能储能不耗能']],
    ['含互感电路去耦等效中，两电感有一公共节点且为异名端相连，公共支路应接', '+M', ['−M', 'M/2', '2M']],
    ['空心变压器副边对原边的引入阻抗性质为', '与副边回路阻抗性质相反(反射阻抗)', ['与副边阻抗相同', '纯电阻', '纯电感']]
  ];
  for (let c of concepts) {
    let [q, ans2, wrongs] = c;
    let { o, a: ans } = mk(ans2, wrongs.slice(0, 3));
    add(ch, 'single', q, o, ans, '', 2);
  }
  let judges = [
    ['互感系数M与两线圈的相对位置有关。', '正确'],
    ['理想变压器原副边电压比等于匝数比，与负载无关。', '正确'],
    ['耦合电感的储能可以为负值。', '错误'],
    ['同名端与电流参考方向的设定有关。', '错误'],
    ['反射阻抗的性质与副边回路阻抗性质相反。', '正确']
  ];
  for (let j of judges) {
    let { o, a: ans } = mkj(j[1]);
    add(ch, 'judge', j[0], o, ans, '', 2);
  }
}

function genThreePhase() {
  const ch = '三相电路';
  for (let i = 0; i < 10; i++) {
    let Ul = [380, 220, 660][ri(0, 2)];
    let Up = Ul === 380 ? 220 : (Ul === 220 ? 127 : 380);
    let { o, a: ans } = mk(`${Up}V`, [`${Ul}V`, `${Math.round(Ul / 3)}V`, `${Ul * 2}V`]);
    add(ch, 'single', `Y接对称三相电源线电压Ul=${Ul}V，则相电压Up=`, o, ans, `Y接：Up=Ul/√3=${Ul}/1.732≈${Up}V`, 1);
  }
  for (let i = 0; i < 10; i++) {
    let Ip = ri(2, 10);
    let { o, a: ans } = mk(`√3×${Ip}A`, [`${Ip}A`, `3×${Ip}A`, `${Ip * 2}A`]);
    add(ch, 'single', `Δ接对称负载相电流Ip=${Ip}A，则线电流Il=`, o, ans, `Δ接：Il=√3Ip=√3×${Ip}A`, 2);
  }
  for (let i = 0; i < 12; i++) {
    let Up = 220, Ip = ri(1, 9);
    let P = 3 * Up * Ip * 8 / 10;
    let { o, a: ans } = mk(`${P}W`, [`${3 * Up * Ip}W`, `${Math.round(3 * Up * Ip * 0.6)}W`, `${Up * Ip}W`]);
    add(ch, 'single', `对称三相负载Up=${Up}V、Ip=${Ip}A、cosφ=0.8，总有功功率P=`, o, ans, `P=3UpIp·cosφ=3×${Up}×${Ip}×0.8=${P}W`, 2);
  }
  for (let i = 0; i < 10; i++) {
    let W1 = ri(100, 900), W2 = ri(100, 900);
    let { o, a: ans } = mk(`${W1 + W2}W`, [`${W1 - W2}W`, `${Math.round((W1 + W2) / 2)}W`, `${2 * (W1 + W2)}W`]);
    add(ch, 'single', `两瓦特表法测三相功率，W1=${W1}W、W2=${W2}W，则总功率P=`, o, ans, `P=W1+W2=${W1 + W2}W`, 2);
  }
  let concepts = [
    ['对称三相Y接电源中，线电压与相电压的相位关系是', '线电压超前对应相电压30°', ['滞后30°', '同相', '反相']],
    ['对称三相Δ接负载中，线电流与相电流的相位关系是', '线电流滞后对应相电流30°', ['超前30°', '同相', '反相']],
    ['对称三相电路中线电流(中线)为', '0', ['等于相电流', '等于线电流', '三倍相电流']],
    ['三相四线制中中线的作用是', '使不对称负载相电压保持对称', ['增大功率', '减小损耗', '提高功率因数']],
    ['两瓦特表法适用于', '三相三线制', ['仅三相四线制', '仅对称电路', '仅单相']],
    ['对称纯电阻负载用两瓦特表法时', 'W1=W2', ['W1=−W2', 'W1=0', 'W2=0']],
    ['对称负载cosφ=0.5(φ=60°)时两瓦特表', '其一读数为0', ['两表相等', '两表均0', '一表为负且绝对值相等']],
    ['三相总有功功率P=√3UlIlcosφ中φ是', '相电压与相电流的相位差', ['线电压与线电流的相位差', '任意两线电压夹角', '功率因数角的两倍']],
    ['对称三相电路可归结为', '单相计算', ['两相计算', '四相计算', '逐相独立']],
    ['不对称Y接负载无中线时会出现', '中性点位移', ['线电压不对称', '相电流为零', '频率偏移']]
  ];
  for (let c of concepts) {
    let [q, ans2, wrongs] = c;
    let { o, a: ans } = mk(ans2, wrongs.slice(0, 3));
    add(ch, 'single', q, o, ans, '', 2);
  }
  let judges = [
    ['对称三相电路中中线可以省去。', '正确'],
    ['照明负载(不对称)必须采用三相四线制。', '正确'],
    ['两瓦特表法中任一表的读数都等于某相功率。', '错误'],
    ['三相负载对称时，瞬时功率为常数。', '正确'],
    ['Δ接负载一相断开时，其余两相仍承受线电压。', '正确']
  ];
  for (let j of judges) {
    let { o, a: ans } = mkj(j[1]);
    add(ch, 'judge', j[0], o, ans, '', 2);
  }
}

function genTwoPort() {
  const ch = '二端口网络';
  for (let i = 0; i < 12; i++) {
    let Z1 = ri(1, 9), Z2 = ri(1, 9), Z3 = ri(1, 9);
    let { o, a: ans } = mk(`${Z1 + Z3}Ω`, [`${Z1}Ω`, `${Z3}Ω`, `${Z1 + Z2}Ω`]);
    add(ch, 'single', `T型二端口：串联臂Z1=${Z1}Ω、Z2=${Z2}Ω，并联臂Z3=${Z3}Ω，则Z11=`, o, ans, `Z11=Z1+Z3=${Z1}+${Z3}=${Z1 + Z3}Ω`, 3);
  }
  for (let i = 0; i < 10; i++) {
    let Z1 = ri(1, 9), Z2 = ri(1, 9), Z3 = ri(1, 9);
    let { o, a: ans } = mk(`${Z3}Ω`, [`${Z1}Ω`, `${Z2}Ω`, `${Z1 + Z2 + Z3}Ω`]);
    add(ch, 'single', `T型二端口：串联臂Z1=${Z1}Ω、Z2=${Z2}Ω，并联臂Z3=${Z3}Ω，则Z12=`, o, ans, `Z12=Z21=Z3=${Z3}Ω`, 3);
  }
  let concepts = [
    ['互易二端口满足', 'Z12=Z21', ['Z11=Z22', 'Z12=−Z21', 'Z11=0']],
    ['对称二端口满足', 'Z11=Z22且Z12=Z21', ['仅Z12=Z21', 'Z11=0', 'Z22=0']],
    ['理想变压器(n:1)的T参数A等于', 'n', ['1/n', 'n²', '1']],
    ['二端口级联时宜用', 'T参数相乘', ['Z参数相乘', 'Y参数相乘', 'H参数相乘']],
    ['二端口串联时宜用', 'Z参数相加', ['Y参数相加', 'T参数相加', 'H参数相加']],
    ['二端口并联时宜用', 'Y参数相加', ['Z参数相加', 'T参数相加', 'H参数相加']],
    ['仅含电阻的二端口一定是', '互易的', ['对称的', '无损的', '非互易的']],
    ['含受控源的二端口', '可能非互易', ['一定互易', '一定对称', '一定无损']]
  ];
  for (let c of concepts) {
    let [q, ans2, wrongs] = c;
    let { o, a: ans } = mk(ans2, wrongs.slice(0, 3));
    add(ch, 'single', q, o, ans, '', 2);
  }
  let judges = [
    ['二端口网络的端口条件是每个端口流入电流等于流出电流。', '正确'],
    ['任何二端口网络都存在Z参数。', '错误'],
    ['理想变压器是互易二端口。', '正确'],
    ['回转器是互易二端口。', '错误'],
    ['T参数与Y参数可以互相转换(存在时)。', '正确']
  ];
  for (let j of judges) {
    let { o, a: ans } = mkj(j[1]);
    add(ch, 'judge', j[0], o, ans, '', 2);
  }
}

function genLaplace() {
  const ch = '复频域分析';
  for (let i = 0; i < 10; i++) {
    let a = ri(1, 6);
    let { o, a: ans } = mk(`1/(s+${a})`, [`1/(s−${a})`, `s/(s+${a})`, `${a}/(s+${a})`]);
    add(ch, 'single', `f(t)=e^(−${a}t)·ε(t) 的拉氏变换F(s)=`, o, ans, `L{e^(−at)}=1/(s+a)`, 1);
  }
  for (let i = 0; i < 10; i++) {
    let w = ri(1, 6);
    let { o, a: ans } = mk(`${w}/(s²+${w * w})`, [`s/(s²+${w * w})`, `1/(s²+${w * w})`, `${w}/(s+${w})`]);
    add(ch, 'single', `f(t)=sin(${w}t)·ε(t) 的拉氏变换F(s)=`, o, ans, `L{sinωt}=ω/(s²+ω²)`, 1);
  }
  for (let i = 0; i < 8; i++) {
    let n = ri(1, 3);
    let { o, a: ans } = mk(`${[1, 1, 2][n - 1]}/s^${n + 1}`, [`1/s^${n}`, `${n}/s^${n}`, `1/s^${n + 2}`]);
    add(ch, 'single', `f(t)=t^${n}·ε(t) 的拉氏变换F(s)=`, o, ans, `L{t^n}=n!/s^(n+1)=${[1, 1, 2][n - 1]}/s^${n + 1}`, 2);
  }
  let concepts = [
    ['电感L的运算阻抗(零初始)为', 'sL', ['1/(sL)', 'L/s', 's/L']],
    ['电容C的运算阻抗(零初始)为', '1/(sC)', ['sC', 'C/s', 's/C']],
    ['有初始电流i(0−)的电感，运算电路中附加电压源为', 'Li(0−)，与sL串联', ['i(0−)/s', 'Li(0−)/s', '无需附加']],
    ['有初始电压u(0−)的电容，运算电路中可附加', 'u(0−)/s电压源串联', ['Cu(0−)电压源', 'u(0−)s电压源', '无需附加']],
    ['网络函数H(s)极点全在左半开平面，系统', '稳定', ['不稳定', '临界稳定', '振荡发散']],
    ['H(s)极点位于虚轴上(单阶)，系统', '临界稳定', ['稳定', '不稳定', '渐近稳定']],
    ['冲激响应h(t)与网络函数H(s)的关系是', '拉氏变换对', ['傅里叶变换对', '相等', '无关系']],
    ['初值定理f(0+)=', 'lim(s→∞) sF(s)', ['lim(s→0) sF(s)', 'lim(s→∞) F(s)', 'lim(s→0) F(s)']],
    ['终值定理f(∞)=', 'lim(s→0) sF(s)(存在时)', ['lim(s→∞) sF(s)', 'lim(s→0) F(s)/s', 'lim(s→∞) F(s)/s']]
  ];
  for (let c of concepts) {
    let [q, ans2, wrongs] = c;
    let { o, a: ans } = mk(ans2, wrongs.slice(0, 3));
    add(ch, 'single', q, o, ans, '', 2);
  }
  let judges = [
    ['运算电路法把微分方程求解转化为代数方程求解。', '正确'],
    ['网络函数与激励形式无关，只由网络结构参数决定。', '正确'],
    ['H(s)有右半平面极点时系统仍可能稳定。', '错误'],
    ['拉氏变换的卷积定理：时域卷积对应复频域相乘。', '正确']
  ];
  for (let j of judges) {
    let { o, a: ans } = mkj(j[1]);
    add(ch, 'judge', j[0], o, ans, '', 2);
  }
}

function genMisc() {
  const ch = '网络图论与矩阵分析';
  for (let i = 0; i < 10; i++) {
    let n = ri(3, 7), b = n + ri(1, 5);
    let { o, a: ans } = mk(`${n - 1}`, [`${n}`, `${b - n + 1}`, `${b}`]);
    add(ch, 'single', `连通图节点数n=${n}、支路数b=${b}，则树支数=`, o, ans, `树支数=n−1=${n - 1}`, 2);
  }
  for (let i = 0; i < 10; i++) {
    let n = ri(3, 7), b = n + ri(2, 6);
    let { o, a: ans } = mk(`${b - n + 1}`, [`${n - 1}`, `${b - n}`, `${b + n}`]);
    add(ch, 'single', `连通图节点数n=${n}、支路数b=${b}，则连支数(独立回路数)=`, o, ans, `连支数=b−n+1=${b - n + 1}`, 2);
  }
  let concepts = [
    ['树是', '包含全部节点且无回路的连通子图', ['任一子图', '含回路的子图', '不含全部节点的子图']],
    ['基本回路由', '一条连支与若干树支构成', ['仅连支构成', '仅树支构成', '两条连支构成']],
    ['基本割集含', '一条树支与若干连支', ['仅树支', '仅连支', '两条树支']],
    ['节点电压法的独立方程数等于', 'n−1', ['b', 'b−n+1', 'n']],
    ['回路电流法的独立方程数等于', 'b−n+1', ['n−1', 'b', 'n']],
    ['关联矩阵A描述', '支路与节点的关联关系', ['支路与回路关系', '节点与割集关系', '树支与连支关系']]
  ];
  for (let c of concepts) {
    let [q, ans2, wrongs] = c;
    let { o, a: ans } = mk(ans2, wrongs.slice(0, 3));
    add(ch, 'single', q, o, ans, '', 2);
  }
  const ch2 = '非线性电路';
  let concepts2 = [
    ['非线性电阻的伏安特性是', '曲线', ['直线', '抛物线必过原点', '水平线']],
    ['静态电阻定义为', 'u/i', ['du/di', 'di/du', 'u·i']],
    ['动态电阻定义为', 'du/di', ['u/i', 'i/u', 'u+i']],
    ['小信号分析中，工作点附近非线性电阻等效为', '动态电阻', ['静态电阻', '理想电源', '电容']],
    ['分段线性化法是', '用折线近似非线性曲线', ['精确解法', '仅用于电容', '频域法']],
    ['非线性电路叠加定理', '不适用', ['适用', '部分适用', '仅交流适用']]
  ];
  for (let c of concepts2) {
    let [q, ans2, wrongs] = c;
    let { o, a: ans } = mk(ans2, wrongs.slice(0, 3));
    add(ch2, 'single', q, o, ans, '', 2);
  }
  let judges2 = [
    ['非线性电阻的静态电阻与动态电阻一般不相等。', '正确'],
    ['非线性电路可能存在多个工作点。', '正确'],
    ['小信号法适用于任意幅度信号。', '错误'],
    ['非线性电路不满足齐次性。', '正确']
  ];
  for (let j of judges2) {
    let { o, a: ans } = mkj(j[1]);
    add(ch2, 'judge', j[0], o, ans, '', 2);
  }
  const ch3 = '电路综合概念';
  let concepts3 = [
    ['集总参数电路的条件是', '电路尺寸远小于工作波长', ['尺寸大于波长', '与频率无关', '仅高频']],
    ['参考方向是', '人为假定的方向', ['实际方向', '电子流动方向', '电场方向']],
    ['受控源是', '四端元件，输出受控制量支配', ['独立源', '二端元件', '无源元件']],
    ['求解含受控源电路时，受控源', '按电源处理但保留控制量关系', ['一律置零', '一律短路', '删除']],
    ['特勒根定理适用于', '任何集总参数电路', ['仅线性电路', '仅电阻电路', '仅正弦']],
    ['对偶元素中电阻的对偶是', '电导', ['电容', '电感', '电压']],
    ['对偶元素中电感的对偶是', '电容', ['电阻', '电导', '磁通']],
    ['对偶元素中KCL的对偶是', 'KVL', ['欧姆定律', '叠加定理', '特勒根定理']]
  ];
  for (let c of concepts3) {
    let [q, ans2, wrongs] = c;
    let { o, a: ans } = mk(ans2, wrongs.slice(0, 3));
    add(ch3, 'single', q, o, ans, '', 1);
  }
}

function genSql() {
  let sql = '';
  const batch = 50;
  for (let i = 0; i < Q.length; i += batch) {
    const part = Q.slice(i, i + batch);
    sql += 'INSERT INTO questions (subject, chapter, type, question, options, answer, explanation, difficulty, source) VALUES\n';
    part.forEach((q, j) => {
      sql += `('circuit', '${esc(q.ch)}', '${q.t}', '${esc(q.q)}', '${esc(q.o)}', '${esc(q.a)}', '${esc(q.e)}', ${q.d}, '电路强化题库')${j < part.length - 1 ? ',' : ';'}\n`;
    });
    sql += '\n';
  }
  return sql;
}

genTheorems();
genAC();
genDynamic();
genCoupling();
genThreePhase();
genTwoPort();
genLaplace();
genMisc();

let sqlOutput = genSql();
fs.writeFileSync('seed_adv_circuit.sql', sqlOutput);
console.log(`Generated ${Q.length} questions`);
let d1 = Q.filter(q => q.d === 1).length;
let d2 = Q.filter(q => q.d === 2).length;
let d3 = Q.filter(q => q.d === 3).length;
console.log(`Difficulty: 基础=${d1}, 中等=${d2}, 进阶=${d3}`);
let chapters = {};
Q.forEach(q => { chapters[q.ch] = (chapters[q.ch] || 0) + 1; });
console.log(chapters);
