const fs = require('fs');

// ====== Helpers ======
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
  let p = 1;
  while (opts.length < 4) { let v = String(ri(1, 999)); if (!opts.includes(v)) opts.push(v); p++; }
  opts = opts.slice(0, 4);
  let sh = shuffle(opts);
  let idx = sh.indexOf(correct);
  let ans = 'ABCD'[idx];
  let formatted = sh.map((o, i) => `${'ABCD'[i]}. ${o}`);
  return { o: JSON.stringify(formatted), a: ans };
}
function mkj(correct, wrongs) { let opts = [correct]; for (let w of wrongs) { if (!opts.includes(w)) opts.push(w); } opts = opts.slice(0, 2); let sh = shuffle(opts); let idx = sh.indexOf(correct); let ans = 'AB'[idx]; let formatted = sh.map((o, i) => `${'AB'[i]}. ${o}`); return { o: JSON.stringify(formatted), a: ans }; }
function add(ch, t, q, o, a, e, d) { if (seen.has(q)) return; seen.add(q); Q.push({ ch, t, q, o, a, e, d }); }

// ====== Module 1: 电路模型和电路定律 (150+ questions) ======
function genBasic() {
  const ch = '电路模型与电路定律';

  // Ohm's law V=IR (20)
  for (let i = 0; i < 20; i++) {
    let V = ri(3, 24), R = ri(2, 20);
    let I = frac(V, R);
    let { o, a: ans } = mk(`${I}A`, [`${frac(V + ri(1, 3), R)}A`, `${frac(V, R + ri(1, 3))}A`, `${V * R}A`]);
    add(ch, 'single', `电阻R=${R}Ω两端电压U=${V}V，则流过的电流I=`, o, ans, `欧姆定律：I=U/R=${V}/${R}=${I}A`, 1);
  }
  for (let i = 0; i < 15; i++) {
    let I = ri(1, 10), R = ri(2, 20);
    let V = I * R;
    let { o, a: ans } = mk(`${V}V`, [`${V + ri(1, 5)}V`, `${V - ri(1, 5)}V`, `${frac(I, R)}V`]);
    add(ch, 'single', `流过R=${R}Ω的电流I=${I}A，则电阻两端电压U=`, o, ans, `U=IR=${I}×${R}=${V}V`, 1);
  }
  for (let i = 0; i < 15; i++) {
    let V = ri(6, 24), I = ri(1, 6);
    let R = frac(V, I);
    let { o, a: ans } = mk(`${R}Ω`, [`${frac(V + ri(1, 3), I)}Ω`, `${frac(V, I + ri(1, 3))}Ω`, `${V * I}Ω`]);
    add(ch, 'single', `电阻两端电压U=${V}V，电流I=${I}A，则R=`, o, ans, `R=U/I=${V}/${I}=${R}Ω`, 1);
  }

  // Power P=VI=I²R=V²/R (15)
  for (let i = 0; i < 15; i++) {
    let V = ri(3, 12), R = ri(2, 10);
    let P = V * V / R;
    let pStr = frac(V * V, R);
    let { o, a: ans } = mk(`${pStr}W`, [`${frac(V * V, R + 1)}W`, `${frac(V * V + 1, R)}W`, `${V * R}W`]);
    add(ch, 'single', `电阻R=${R}Ω接在U=${V}V电源上，消耗的功率P=`, o, ans, `P=U²/R=${V}²/${R}=${pStr}W`, 1);
  }

  // KCL (15)
  for (let i = 0; i < 15; i++) {
    let i1 = ri(1, 10), i2 = ri(1, 10), i3 = ri(1, 10);
    let i4 = i1 + i2 - i3;
    let { o, a: ans } = mk(`${i4}A`, [`${i1 + i2 + i3}A`, `${i3 - i1}A`, `${i2 + i3}A`]);
    add(ch, 'single', `某节点连接4条支路，流入电流I1=${i1}A、I2=${i2}A，流出I3=${i3}A，则流出I4=`, o, ans, `KCL：I1+I2=I3+I4，I4=${i1}+${i2}-${i3}=${i4}A`, 2);
  }
  for (let i = 0; i < 10; i++) {
    let i1 = ri(2, 8), i2 = ri(1, 5);
    let i3 = i1 - i2;
    let { o, a: ans } = mk(`${i3}A`, [`${i1 + i2}A`, `${-i3}A`, `${i2}A`]);
    add(ch, 'single', `节点上I1=${i1}A流入，I2=${i2}A流出，I3=?流出，求I3=`, o, ans, `KCL：I1=I2+I3，I3=${i1}-${i2}=${i3}A`, 1);
  }

  // KVL (15)
  for (let i = 0; i < 15; i++) {
    let v1 = ri(5, 20), v2 = ri(2, 10), v3 = ri(1, 8);
    let v4 = v1 - v2 - v3;
    let { o, a: ans } = mk(`${v4}V`, [`${v1 + v2 + v3}V`, `${v2 + v3 - v1}V`, `${v1 - v2}V`]);
    add(ch, 'single', `回路中U1=${v1}V(升)，U2=${v2}V降，U3=${v3}V降，U4=?降，求U4=`, o, ans, `KVL：U1=U2+U3+U4，U4=${v1}-${v2}-${v3}=${v4}V`, 2);
  }

  // Concepts (20)
  let concepts = [
    ['KCL的依据是', '电荷守恒', ['能量守恒', '功率守恒', '磁通守恒']],
    ['KVL的依据是', '能量守恒', ['电荷守恒', '功率守恒', '磁通守恒']],
    ['理想电压源的内阻为', '0', ['∞', '有限值', '不确定']],
    ['理想电流源的内阻为', '∞', ['0', '有限值', '不确定']],
    ['电压源与电流源等效变换时，R0的关系是', '相同', ['相反', '倒数', '无关']],
    ['实际电压源的模型是', '理想电压源串联电阻', ['理想电压源并联电阻', '理想电流源串联电阻', '理想电流源并联电阻']],
    ['实际电流源的模型是', '理想电流源并联电阻', ['理想电流源串联电阻', '理想电压源串联电阻', '理想电压源并联电阻']],
    ['关联参考方向下，功率P>0表示', '吸收功率', ['发出功率', '不吸收也不发出', '无法判断']],
    ['非关联参考方向下，P>0表示', '发出功率', ['吸收功率', '不吸收也不发出', '无法判断']],
    ['KCL适用于', '任何集总参数电路', ['仅直流电路', '仅交流电路', '仅线性电路']],
    ['KVL适用于', '任何集总参数电路', ['仅直流电路', '仅正弦电路', '仅线性电路']],
    ['电压源短路时，输出电流取决于', '内阻和短路回路', ['电动势', '负载', '内阻为零时无穷大']],
    ['电流源开路时，输出电压取决于', '内阻和开路回路', ['电流值', '负载', '无穷大']],
    ['在关联参考方向下，U和I的参考方向', '相同', ['相反', '垂直', '无关']],
    ['电阻元件的VCR（伏安关系）是', '线性的', ['非线性的', '时变的', '不确定的']],
    ['电导G与电阻R的关系是', 'G=1/R', ['G=R', 'G=R²', 'G=1/R²']],
    ['功率的单位是', '瓦特(W)', ['焦耳(J)', '伏特(V)', '安培(A)']],
    ['能量的单位是', '焦耳(J)', ['瓦特(W)', '伏特(V)', '韦伯(Wb)']],
    ['两个电阻并联，等效电阻比任何一个都', '小', ['大', '相等', '不确定']],
    ['两个电阻串联，等效电阻比任何一个都', '大', ['小', '相等', '不确定']]
  ];
  for (let c of concepts) {
    let [q, ans2, wrongs] = c;
    let { o, a: ans } = mk(ans2, wrongs.slice(0, 3));
    add(ch, 'single', q, o, ans, '', 1);
  }

  // Judge questions (15)
  let judges = [
    ['KCL不仅适用于节点，也适用于任意封闭面。', '正确'],
    ['KVL仅适用于线性电路。', '错误'],
    ['理想电压源的输出电压与负载无关。', '正确'],
    ['理想电流源的输出电流与负载无关。', '正确'],
    ['在关联参考方向下，P=UI>0表示元件吸收功率。', '正确'],
    ['电阻并联后的等效电阻一定大于任何一个分电阻。', '错误'],
    ['电压源串联时，总电动势为各电动势的代数和。', '正确'],
    ['电流源并联时，总电流为各电流的代数和。', '正确'],
    ['理想电压源和理想电流源可以直接等效变换。', '错误'],
    ['电导的单位是西门子(S)。', '正确'],
    ['KCL的本质是能量守恒。', '错误'],
    ['KVL的本质是能量守恒。', '正确'],
    ['功率平衡定理：电路中总吸收功率等于总发出功率。', '正确'],
    ['两个电压不同的理想电压源可以并联。', '错误'],
    ['两个电流不同的理想电流源可以串联。', '错误']
  ];
  for (let j of judges) {
    let [q, ans2] = j;
    let { o, a: ans } = mkj(ans2, [ans2 === '正确' ? '错误' : '正确']);
    add(ch, 'judge', q, o, ans, '', 2);
  }
}

// ====== Module 2: 电阻电路等效变换 (100+ questions) ======
function genEquivalent() {
  const ch = '电阻电路等效变换';

  // Series resistance (15)
  for (let i = 0; i < 15; i++) {
    let r1 = ri(2, 20), r2 = ri(2, 20), r3 = ri(2, 20);
    let R = r1 + r2 + r3;
    let { o, a: ans } = mk(`${R}Ω`, [`${r1 * r2 * r3}Ω`, `${R + ri(1, 5)}Ω`, `${frac(r1, r2 + r3)}Ω`]);
    add(ch, 'single', `三个电阻R1=${r1}Ω、R2=${r2}Ω、R3=${r3}Ω串联，等效电阻R=`, o, ans, `串联：R=R1+R2+R3=${r1}+${r2}+${r3}=${R}Ω`, 1);
  }

  // Parallel resistance (20)
  for (let i = 0; i < 20; i++) {
    let r1 = ri(2, 12), r2 = ri(2, 12);
    let R = frac(r1 * r2, r1 + r2);
    let { o, a: ans } = mk(`${R}Ω`, [`${r1 + r2}Ω`, `${frac(r1 * r2, r1 + r2 + 1)}Ω`, `${frac(r1 + r2, 2)}Ω`]);
    add(ch, 'single', `R1=${r1}Ω和R2=${r2}Ω并联，等效电阻R=`, o, ans, `并联：R=R1·R2/(R1+R2)=${r1}·${r2}/(${r1}+${r2})=${R}Ω`, 2);
  }

  // Voltage divider (15)
  for (let i = 0; i < 15; i++) {
    let V = ri(6, 24), r1 = ri(2, 10), r2 = ri(2, 10);
    let v1 = frac(V * r1, r1 + r2);
    let { o, a: ans } = mk(`${v1}V`, [`${frac(V * r2, r1 + r2)}V`, `${frac(V, 2)}V`, `${V}V`]);
    add(ch, 'single', `串联电路U=${V}V，R1=${r1}Ω、R2=${r2}Ω，R1上电压U1=`, o, ans, `分压：U1=U·R1/(R1+R2)=${V}·${r1}/(${r1}+${r2})=${v1}V`, 1);
  }

  // Current divider (15)
  for (let i = 0; i < 15; i++) {
    let I = ri(3, 15), r1 = ri(2, 10), r2 = ri(2, 10);
    let i1 = frac(I * r2, r1 + r2);
    let { o, a: ans } = mk(`${i1}A`, [`${frac(I * r1, r1 + r2)}A`, `${frac(I, 2)}A`, `${I}A`]);
    add(ch, 'single', `并联总电流I=${I}A，R1=${r1}Ω、R2=${r2}Ω，R1上电流I1=`, o, ans, `分流：I1=I·R2/(R1+R2)=${I}·${r2}/(${r1}+${r2})=${i1}A`, 2);
  }

  // Star-Delta (10)
  for (let i = 0; i < 10; i++) {
    let r = ri(3, 12);
    let delta = 3 * r;
    let { o, a: ans } = mk(`${delta}Ω`, [`${r}Ω`, `${frac(r, 3)}Ω`, `${2 * r}Ω`]);
    add(ch, 'single', `对称星形(Y)接法每相电阻${r}Ω，等效三角形(Δ)每相电阻=`, o, ans, `Y→Δ：R_Δ=3R_Y=3×${r}=${delta}Ω`, 3);
  }
  for (let i = 0; i < 10; i++) {
    let r = ri(6, 24);
    let star = frac(r, 3);
    let { o, a: ans } = mk(`${star}Ω`, [`${r}Ω`, `${3 * r}Ω`, `${frac(r, 2)}Ω`]);
    add(ch, 'single', `对称三角形(Δ)每相电阻${r}Ω，等效星形(Y)每相电阻=`, o, ans, `Δ→Y：R_Y=R_Δ/3=${r}/3=${star}Ω`, 3);
  }

  // Concepts (10)
  let concepts = [
    ['星形-三角形等效变换的条件是', '对应端口的VCR相同', ['电阻相等', '功率相等', '电流相等']],
    ['对称Y接法变Δ接法，每相电阻变为原来的', '3倍', ['1/3', '2倍', '不变']],
    ['对称Δ接法变Y接法，每相电阻变为原来的', '1/3', ['3倍', '1/2', '不变']],
    ['电源等效变换时，与电压源并联的电阻', '可去掉(开路)', ['可短路', '不能去掉', '必须保留']],
    ['电源等效变换时，与电流源串联的电阻', '可去掉(短路)', ['可开路', '不能去掉', '必须保留']],
    ['惠斯通电桥平衡条件是', '对臂电阻乘积相等', ['相邻臂相等', '对臂相等', '所有臂相等']]
  ];
  for (let c of concepts) {
    let [q, ans2, wrongs] = c;
    let { o, a: ans } = mk(ans2, wrongs.slice(0, 3));
    add(ch, 'single', q, o, ans, '', 2);
  }
}

// ====== Module 3: 电路定理 (150+ questions) ======
function genTheorems() {
  const ch = '电路定理';

  // Superposition (15)
  for (let i = 0; i < 15; i++) {
    let v1 = ri(5, 15), v2 = ri(5, 15), r1 = ri(2, 8), r2 = ri(2, 8), r3 = ri(2, 8);
    // Simple: two voltage sources in series with resistors
    // When V1 acts alone: I3_1 = V1/(R1+R3) (simplified)
    let i3_1 = frac(v1, r1 + r3);
    let i3_2 = frac(v2, r2 + r3);
    // Total = sum (simplified for educational purposes)
    let { o, a: ans } = mk('叠加', ['替代', '互易', '戴维南']);
    add(ch, 'single', `电路中有两个独立电源，求某支路电流时应使用___定理。`, o, ans, '叠加定理：线性电路中多个独立源共同作用的响应等于各源单独作用响应之和', 2);
  }

  // Thevenin (20)
  for (let i = 0; i < 20; i++) {
    let V = ri(5, 20), R = ri(2, 10), RL = ri(2, 10);
    let Vth = V;
    let Rth = R;
    let I = frac(Vth, Rth + RL);
    let { o, a: ans } = mk(`${I}A`, [`${frac(Vth, Rth)}A`, `${frac(V, RL)}A`, `${frac(V, R + RL + ri(1, 3))}A`]);
    add(ch, 'single', `含源一端口网络，Voc=${V}V，Rth=${R}Ω，接负载RL=${RL}Ω，电流I=`, o, ans, `戴维南：I=Vth/(Rth+RL)=${V}/(${R}+${RL})=${I}A`, 2);
  }

  for (let i = 0; i < 15; i++) {
    let V = ri(5, 20), R = ri(2, 10);
    let { o, a: ans } = mk(`${V}V`, [`${V + ri(1, 5)}V`, `${frac(V, R)}V`, `${V * R}V`]);
    add(ch, 'single', `一端口网络内只有U=${V}V电压源串联R=${R}Ω，则戴维南等效Vth=`, o, ans, `开路电压Vth=U=${V}V`, 2);
  }
  for (let i = 0; i < 15; i++) {
    let R = ri(2, 10);
    let { o, a: ans } = mk(`${R}Ω`, [`${R + ri(1, 3)}Ω`, `${frac(1, R)}Ω`, `${R * R}Ω`]);
    add(ch, 'single', `一端口网络内只有R=${R}Ω电阻（独立源置零），则Rth=`, o, ans, `独立源置零后，Rth=${R}Ω`, 2);
  }

  // Norton (15)
  for (let i = 0; i < 15; i++) {
    let V = ri(5, 20), R = ri(2, 10);
    let Isc = frac(V, R);
    let { o, a: ans } = mk(`${Isc}A`, [`${frac(V + 1, R)}A`, `${frac(V, R + 1)}A`, `${V * R}A`]);
    add(ch, 'single', `戴维南等效Vth=${V}V、Rth=${R}Ω，诺顿等效Isc=`, o, ans, `Isc=Vth/Rth=${V}/${R}=${Isc}A`, 2);
  }

  // Maximum power transfer (15)
  for (let i = 0; i < 15; i++) {
    let V = ri(5, 20), R = ri(2, 10);
    let Pmax = frac(V * V, 4 * R);
    let { o, a: ans } = mk(`${Pmax}W`, [`${frac(V * V, 2 * R)}W`, `${frac(V * V, R)}W`, `${frac(V * V, 8 * R)}W`]);
    add(ch, 'single', `Vth=${V}V、Rth=${R}Ω，当RL=Rth时负载获最大功率Pmax=`, o, ans, `Pmax=Vth²/(4Rth)=${V}²/(4×${R})=${Pmax}W`, 3);
  }

  // Concepts (20)
  let concepts = [
    ['叠加定理适用于', '线性电路', ['非线性电路', '任何电路', '仅直流电路']],
    ['叠加定理中，不作用的电压源应', '短路', ['开路', '保留', '短路保留内阻']],
    ['叠加定理中，不作用的电流源应', '开路', ['短路', '保留', '开路保留内阻']],
    ['戴维南定理将一端口等效为', '电压源串联电阻', ['电流源并联电阻', '电压源并联电阻', '电流源串联电阻']],
    ['诺顿定理将一端口等效为', '电流源并联电阻', ['电压源串联电阻', '电压源并联电阻', '电流源串联电阻']],
    ['戴维南等效电阻Rth的求法是', '独立源置零后端口等效电阻', ['端口电压除以电流', '短路电流除开路电压', '负载电阻']],
    ['最大功率传输条件是', 'RL=Rth', ['RL=2Rth', 'RL=Rth/2', 'RL=0']],
    ['替代定理适用于', '线性电路', ['仅非线性电路', '任何电路', '仅交流电路']],
    ['互易定理适用于', '线性电路', ['仅非线性电路', '任何电路', '仅直流电路']],
    ['诺顿等效电流Isc等于', '端口短路电流', ['开路电压', '端口电压', '负载电流']],
    ['戴维南等效电压Vth等于', '端口开路电压', ['短路电流', '端口电压', '负载电压']],
    ['当负载电阻等于电源内阻时，效率为', '50%', ['100%', '25%', '75%']],
    ['最大功率传输时，电源内阻消耗的功率', '等于负载功率', ['大于负载功率', '小于负载功率', '为零']],
    ['叠加定理不能用于计算', '功率', ['电流', '电压', '电阻']],
    ['戴维南定理和诺顿定理的关系是', '等效互换', ['独立', '无关', '互斥']]
  ];
  for (let c of concepts) {
    let [q, ans2, wrongs] = c;
    let { o, a: ans } = mk(ans2, wrongs.slice(0, 3));
    add(ch, 'single', q, o, ans, '', 2);
  }

  // Judge (15)
  let judges = [
    ['叠加定理不能用来计算功率，因为功率不是线性关系。', '正确'],
    ['戴维南等效电阻就是网络的输入电阻。', '正确'],
    ['最大功率传输时效率最高。', '错误'],
    ['诺顿定理和戴维南定理可以互相转换。', '正确'],
    ['叠加定理适用于非线性电路。', '错误'],
    ['在求戴维南等效电阻时，受控源不能置零。', '正确'],
    ['替代定理只适用于线性电路。', '错误'],
    ['互易定理要求电路中只有一个激励源。', '正确'],
    ['戴维南等效电压就是端口的开路电压。', '正确'],
    ['当RL=Rth时，负载获得最大功率。', '正确'],
    ['最大功率传输条件适用于任何负载。', '错误'],
    ['戴维南定理适用于含受控源的电路。', '正确'],
    ['诺顿等效电流就是端口的短路电流。', '正确'],
    ['叠加定理中，不作用的电流源应短路。', '错误'],
    ['戴维南等效电阻的求法中，独立源置零但受控源保留。', '正确']
  ];
  for (let j of judges) {
    let [q, ans2] = j;
    let { o, a: ans } = mkj(ans2, [ans2 === '正确' ? '错误' : '正确']);
    add(ch, 'judge', q, o, ans, '', 2);
  }
}

// ====== Module 4: 动态电路 (150+ questions) ======
function genDynamic() {
  const ch = '动态电路分析';

  // RC charging: v(t) = V(1 - e^(-t/RC)) (15)
  for (let i = 0; i < 15; i++) {
    let V = ri(5, 20), R = ri(1, 10), C = ri(1, 10);
    let tau = R * C;
    let { o, a: ans } = mk(`${tau}s`, [`${tau + ri(1, 3)}s`, `${frac(R, C)}s`, `${R + C}s`]);
    add(ch, 'single', `RC电路R=${R}Ω, C=${C}F，时间常数τ=`, o, ans, `τ=RC=${R}×${C}=${tau}s`, 1);
  }

  // RL time constant (15)
  for (let i = 0; i < 15; i++) {
    let R = ri(2, 10), L = ri(1, 10);
    let tau = frac(L, R);
    let { o, a: ans } = mk(`${tau}s`, [`${frac(L + 1, R)}s`, `${frac(L, R + 1)}s`, `${L * R}s`]);
    add(ch, 'single', `RL电路R=${R}Ω, L=${L}H，时间常数τ=`, o, ans, `τ=L/R=${L}/${R}=${tau}s`, 1);
  }

  // Three-element method (15)
  for (let i = 0; i < 15; i++) {
    let V0 = ri(0, 10), Vinf = ri(5, 20), R = ri(1, 8), C = ri(1, 8);
    let tau = R * C;
    let { o, a: ans } = mk(`f(t)=${Vinf}+(${V0 - Vinf})e^(-t/${tau})`, [`f(t)=${V0}+(${Vinf - V0})e^(-t/${tau})`, `f(t)=${Vinf}+(${V0})e^(-t/${tau})`, `f(t)=${Vinf}e^(-t/${tau})+${V0}`]);
    add(ch, 'single', `电容电压v(0)=${V0}V，v(∞)=${Vinf}V，τ=${tau}s，三要素法v(t)=`, o, ans, `三要素：v(t)=v(∞)+[v(0+)-v(∞)]e^(-t/τ)=${Vinf}+(${V0 - Vinf})e^(-t/${tau})`, 2);
  }

  // RC discharging (10)
  for (let i = 0; i < 10; i++) {
    let V0 = ri(5, 20), R = ri(1, 8), C = ri(1, 5);
    let tau = R * C;
    let { o, a: ans } = mk(`${V0}e^(-t/${tau})V`, [`${V0}(1-e^(-t/${tau}))V`, `${V0}e^(-${tau}t)V`, `${V0}V`]);
    add(ch, 'single', `电容初始电压${V0}V经R=${R}Ω放电(C=${C}F)，v(t)=`, o, ans, `零输入响应：v(t)=V0·e^(-t/τ)=${V0}e^(-t/${tau})V，τ=RC=${tau}s`, 2);
  }

  // RL zero-state (10)
  for (let i = 0; i < 10; i++) {
    let V = ri(5, 15), R = ri(2, 8), L = ri(2, 10);
    let Iinf = frac(V, R);
    let tau = frac(L, R);
    let { o, a: ans } = mk(`${Iinf}(1-e^(-t/${tau}))A`, [`${Iinf}e^(-t/${tau})A`, `${V}(1-e^(-t/${tau}))A`, `${Iinf}A`]);
    add(ch, 'single', `RL电路接U=${V}V电源(R=${R}Ω,L=${L}H)，零状态电流i(t)=`, o, ans, `零状态：i(t)=I∞(1-e^(-t/τ))=${Iinf}(1-e^(-t/${tau}))A，τ=L/R=${tau}s`, 2);
  }

  // Steady state (10)
  for (let i = 0; i < 10; i++) {
    let { o, a: ans } = mk('电容开路，电感短路', ['电容短路，电感开路', '都短路', '都开路']);
    add(ch, 'single', `直流稳态电路中，电容和电感的状态是`, o, ans, `直流稳态：C开路(dv/dt=0→i=0)，L短路(di/dt=0→v=0)`, 1);
  }

  // Concepts (15)
  let concepts = [
    ['一阶电路的三要素是', '初值、稳态值、时间常数', ['电压、电流、电阻', '电容、电感、电阻', '初值、终值、频率']],
    ['时间常数τ越大，过渡过程', '越慢', ['越快', '不变', '无法确定']],
    ['RC电路中，τ=RC，电容充电到63.2%所需时间为', '一个τ', ['半个τ', '两个τ', '5个τ']],
    ['工程上认为经过多少个τ后过渡过程结束', '3~5个τ', ['1个τ', '10个τ', '0.1个τ']],
    ['零输入响应是', '仅由初始储能引起的响应', ['仅由外加激励引起的响应', '两者都有', '无激励的响应']],
    ['零状态响应是', '仅由外加激励引起的响应', ['仅由初始储能引起的响应', '两者都有', '无初始储能的响应']],
    ['全响应=零输入响应+零状态响应，这体现的是', '叠加定理', ['戴维南定理', '诺顿定理', '替代定理']],
    ['一阶电路的过渡过程从开始到结束理论上需要', '无穷长时间', ['一个τ', '5个τ', '10个τ']],
    ['电容电压不能突变，这是', '换路定则', ['KCL', 'KVL', '欧姆定律']],
    ['电感电流不能突变，这是', '换路定则', ['KCL', 'KVL', '功率守恒']],
    ['换路定则的数学表达是', 'v_C(0+)=v_C(0-), i_L(0+)=i_L(0-)', ['i_C(0+)=i_C(0-)', 'v_L(0+)=v_L(0-)', '所有量不变']],
    ['电容C在t=0时初始电压为V0，等效为', '电压源V0', ['电流源', '短路', '开路']],
    ['电感L在t=0时初始电流为I0，等效为', '电流源I0', ['电压源', '短路', '开路']],
    ['二阶电路可能出现', '过阻尼、临界阻尼、欠阻尼', ['仅过阻尼', '仅欠阻尼', '仅临界阻尼']],
    ['RLC串联电路的阻尼电阻R满足___时为欠阻尼', 'R<2√(L/C)', ['R>2√(L/C)', 'R=2√(L/C)', 'R=0']]
  ];
  for (let c of concepts) {
    let [q, ans2, wrongs] = c;
    let { o, a: ans } = mk(ans2, wrongs.slice(0, 3));
    add(ch, 'single', q, o, ans, '', 2);
  }

  // Judge (10)
  let judges = [
    ['电容电压在换路瞬间不能突变。', '正确'],
    ['电感电流在换路瞬间不能突变。', '正确'],
    ['一阶电路的时间常数与激励无关。', '正确'],
    ['零输入响应与激励有关。', '错误'],
    ['零状态响应与初始储能有关。', '错误'],
    ['电容在直流稳态下相当于开路。', '正确'],
    ['电感在直流稳态下相当于短路。', '正确'],
    ['时间常数τ=RC仅适用于RC电路。', '正确'],
    ['一阶电路全响应等于零输入响应加零状态响应。', '正确'],
    ['二阶欠阻尼电路的响应是衰减振荡。', '正确']
  ];
  for (let j of judges) {
    let [q, ans2] = j;
    let { o, a: ans } = mkj(ans2, [ans2 === '正确' ? '错误' : '正确']);
    add(ch, 'judge', q, o, ans, '', 2);
  }
}

// ====== Module 5: 正弦稳态分析 (150+ questions) ======
function genAC() {
  const ch = '正弦稳态分析';

  // Impedance of R (10)
  for (let i = 0; i < 10; i++) {
    let R = ri(2, 20);
    let { o, a: ans } = mk(`${R}Ω`, [`${R}jΩ`, `${frac(1, R)}Ω`, `${R}Ω+j${R}Ω`]);
    add(ch, 'single', `电阻R=${R}Ω的阻抗Z=`, o, ans, `电阻阻抗为纯实数：Z=R=${R}Ω`, 1);
  }
  // Impedance of L (15)
  for (let i = 0; i < 15; i++) {
    let L = ri(1, 10), f = 50, w = 2 * Math.PI * f;
    let XL = frac(Math.round(w * L * 100), 100);
    // Simplify: ωL ≈ 314L
    let XLval = 314 * L;
    let XLfrac = frac(XLval, 1);
    let { o, a: ans } = mk(`j${XLval}Ω`, [`-${XLval}Ω`, `${XLval}Ω`, `j${XLval + ri(10, 50)}Ω`]);
    add(ch, 'single', `电感L=${L}H在f=50Hz下，感抗XL≈`, o, ans, `XL=ωL=2πfL=2×3.14×50×${L}≈${XLval}Ω`, 2);
  }
  // Impedance of C (15)
  for (let i = 0; i < 15; i++) {
    let C = ri(1, 10);
    let XC = frac(1, 314 * C);
    let XCval = frac(1, 314 * C);
    let { o, a: ans } = mk(`-j${XCval}Ω`, [`j${XCval}Ω`, `${XCval}Ω`, `-j${frac(1, 314 * (C + 1))}Ω`]);
    add(ch, 'single', `电容C=${C}F在f=50Hz下，容抗XC≈`, o, ans, `XC=1/(ωC)=1/(2πfC)=1/(314×${C})=${XCval}Ω`, 2);
  }

  // RL series impedance (15)
  for (let i = 0; i < 15; i++) {
    let R = ri(2, 10), XL = ri(2, 10);
    let { o, a: ans } = mk(`${R}+j${XL}Ω`, [`${R}+j${R + XL}Ω`, `j${R + XL}Ω`, `${R}-j${XL}Ω`]);
    add(ch, 'single', `RL串联R=${R}Ω, XL=${XL}Ω，阻抗Z=`, o, ans, `Z=R+jXL=${R}+j${XL}Ω`, 2);
  }

  // RLC series impedance (15)
  for (let i = 0; i < 15; i++) {
    let R = ri(2, 8), XL = ri(2, 8), XC = ri(2, 8);
    let X = XL - XC;
    let { o, a: ans } = mk(`${R}+j${X}Ω`, [`${R}+j${XL + XC}Ω`, `j${X}Ω`, `${R}+j${-X}Ω`]);
    add(ch, 'single', `RLC串联R=${R}Ω, XL=${XL}Ω, XC=${XC}Ω，Z=`, o, ans, `Z=R+j(XL-XC)=${R}+j(${XL}-${XC})=${R}+j${X}Ω`, 2);
  }

  // Power factor (15)
  for (let i = 0; i < 15; i++) {
    let P = ri(100, 500), S = ri(150, 800);
    if (S <= P) S = P + ri(50, 200);
    let cosPhi = frac(P, S);
    let { o, a: ans } = mk(`${cosPhi}`, [frac(P + ri(10, 50), S), frac(P, S + ri(10, 50)), frac(S, P)]);
    add(ch, 'single', `有功功率P=${P}W，视在功率S=${S}VA，功率因数cosφ=`, o, ans, `cosφ=P/S=${P}/${S}=${cosPhi}`, 2);
  }

  // Active/Reactive power (15)
  for (let i = 0; i < 15; i++) {
    let V = ri(100, 380), I = ri(1, 20), cosPhi = [0.5, 0.6, 0.8, 0.9, 1][ri(0, 4)];
    let P = Math.round(V * I * cosPhi);
    let { o, a: ans } = mk(`${P}W`, [`${V * I}W`, `${Math.round(V * I * cosPhi + ri(10, 50))}W`, `${Math.round(V * I * (1 - cosPhi))}W`]);
    add(ch, 'single', `U=${V}V, I=${I}A, cosφ=${cosPhi}，有功功率P=`, o, ans, `P=UIcosφ=${V}×${I}×${cosPhi}=${P}W`, 2);
  }

  // Resonance (10)
  for (let i = 0; i < 10; i++) {
    let L = ri(1, 10), C = ri(1, 10);
    let f0 = frac(1, 2 * Math.round(Math.sqrt(L * C) * 100));
    // Simplify: f0 = 1/(2π√(LC))
    let { o, a: ans } = mk(`1/(2π√(${L}×${C}))`, [`1/(2π${L + C})`, `2π√(${L}×${C})`, `1/(π√(${L}×${C}))`]);
    add(ch, 'single', `RLC串联谐振频率f0=（L=${L}H, C=${C}F）`, o, ans, `f0=1/(2π√(LC))=1/(2π√(${L}×${C}))`, 3);
  }

  // Concepts (15)
  let concepts = [
    ['正弦交流电的三要素是', '幅值、频率、初相', ['有效值、周期、相位', '最大值、角频率、相位差', '有效值、频率、初相']],
    ['阻抗角的正切tanφ=', 'X/R', ['R/X', 'X*R', 'R+X']],
    ['感抗XL与频率f的关系是', '成正比', ['成反比', '无关', '平方关系']],
    ['容抗XC与频率f的关系是', '成反比', ['成正比', '无关', '平方关系']],
    ['串联谐振时，电路呈', '纯电阻性', ['纯电感性', '纯电容性', '感性']],
    ['串联谐振时，电流', '最大', ['最小', '为零', '不变']],
    ['串联谐振时，XL与XC的关系是', '相等', ['XL>XC', 'XL<XC', 'XL=2XC']],
    ['并联谐振时，总电流', '最小', ['最大', '为零', '不变']],
    ['功率因数cosφ=', 'P/S', ['P/Q', 'Q/S', 'S/P']],
    ['有功功率P的单位是', '瓦特(W)', ['伏安(VA)', '乏(var)', '焦耳(J)']],
    ['无功功率Q的单位是', '乏(var)', ['瓦特(W)', '伏安(VA)', '焦耳(J)']],
    ['视在功率S的单位是', '伏安(VA)', ['瓦特(W)', '乏(var)', '焦耳(J)']],
    ['提高功率因数的方法是', '并联电容', ['串联电容', '并联电感', '串联电阻']],
    ['感性负载并联电容后，总电流', '减小', ['增大', '不变', '为零']],
    ['阻抗Z=R+jX中，|Z|=', '√(R²+X²)', ['R+X', 'R²+X²', '√(R²-X²)']]
  ];
  for (let c of concepts) {
    let [q, ans2, wrongs] = c;
    let { o, a: ans } = mk(ans2, wrongs.slice(0, 3));
    add(ch, 'single', q, o, ans, '', 2);
  }

  // Judge (10)
  let judges = [
    ['感抗与频率成正比。', '正确'],
    ['容抗与频率成反比。', '正确'],
    ['串联谐振时电路呈纯电阻性。', '正确'],
    ['并联谐振时电路总电流最大。', '错误'],
    ['功率因数越高，线路损耗越小。', '正确'],
    ['提高功率因数通常采用并联电感的方法。', '错误'],
    ['在RLC串联电路中，当XL>XC时电路呈感性。', '正确'],
    ['有功功率P=UIcosφ。', '正确'],
    ['无功功率Q=UIsinφ。', '正确'],
    ['视在功率S=UI。', '正确']
  ];
  for (let j of judges) {
    let [q, ans2] = j;
    let { o, a: ans } = mkj(ans2, [ans2 === '正确' ? '错误' : '正确']);
    add(ch, 'judge', q, o, ans, '', 2);
  }
}

// ====== Module 6: 耦合电感与变压器 (80+ questions) ======
function genCoupling() {
  const ch = '耦合电感与变压器';

  // Mutual inductance voltage (15)
  for (let i = 0; i < 15; i++) {
    let M = ri(1, 10), di = ri(1, 10);
    let V = M * di;
    let { o, a: ans } = mk(`${V}V`, [`${V + ri(1, 5)}V`, `${frac(V, 2)}V`, `${V * 2}V`]);
    add(ch, 'single', `互感M=${M}H，di2/dt=${di}A/s，互感电压u1=`, o, ans, `u1=M·di2/dt=${M}×${di}=${V}V`, 2);
  }

  // Coupling coefficient (10)
  for (let i = 0; i < 10; i++) {
    let L1 = ri(1, 5), L2 = ri(1, 5), M = ri(1, Math.min(L1, L2));
    let k = frac(M, Math.round(Math.sqrt(L1 * L2)));
    let kNum = M * M, kDen = L1 * L2;
    let kStr = frac(M, Math.round(Math.sqrt(L1 * L2) * 1));
    // k = M/√(L1·L2)
    let sqrtProd = Math.round(Math.sqrt(L1 * L2));
    let kVal = frac(M, sqrtProd);
    let { o, a: ans } = mk(kVal, [frac(M + 1, sqrtProd), frac(M, sqrtProd + 1), frac(M + 1, sqrtProd + 1)]);
    add(ch, 'single', `L1=${L1}H, L2=${L2}H, M=${M}H，耦合系数k=`, o, ans, `k=M/√(L1·L2)=${M}/√(${L1}×${L2})=${M}/${sqrtProd}=${kVal}`, 2);
  }

  // Concepts (15)
  let concepts = [
    ['互感电压的方向取决于', '同名端', ['电压方向', '电流大小', '绕组匝数']],
    ['同名端的定义是', '电流从同名端流入时产生的磁通相互增强', ['电流方向相同', '电压极性相同', '匝数相同']],
    ['耦合系数k的取值范围是', '0≤k≤1', ['0<k<∞', 'k>1', 'k=1']],
    ['k=1表示', '全耦合', ['无耦合', '部分耦合', '负耦合']],
    ['k=0表示', '无耦合', ['全耦合', '部分耦合', '负耦合']],
    ['理想变压器的条件不包括', '铁芯有损耗', ['无漏磁', '无铜损', 'L→∞']],
    ['理想变压器原副边电压比等于', '匝数比', ['电流比', '阻抗比', '功率比']],
    ['理想变压器原副边电流比等于', '匝数反比', ['匝数正比', '电压正比', '功率比']],
    ['变压器变比n=N1/N2，副边接RL，原边等效阻抗为', 'n²·RL', ['RL/n²', 'n·RL', 'RL/n']],
    ['互感M的单位是', '亨利(H)', ['法拉(F)', '韦伯(Wb)', '亨利(H)']]
  ];
  for (let c of concepts) {
    let [q, ans2, wrongs] = c;
    let { o, a: ans } = mk(ans2, wrongs.slice(0, 3));
    add(ch, 'single', q, o, ans, '', 2);
  }

  // Judge (10)
  let judges = [
    ['同名端的定义是电流从同名端流入时产生的磁通方向相同。', '正确'],
    ['耦合系数k=1表示无漏磁。', '正确'],
    ['理想变压器不消耗功率。', '正确'],
    ['理想变压器副边电压与匝数成反比。', '错误'],
    ['理想变压器副边电流与匝数成正比。', '错误'],
    ['互感电压的方向与同名端有关。', '正确'],
    ['全耦合时k=1。', '正确'],
    ['变压器可以变换阻抗。', '正确'],
    ['互感M可以为负值。', '错误'],
    ['顺接串联时等效电感L=L1+L2+2M。', '正确']
  ];
  for (let j of judges) {
    let [q, ans2] = j;
    let { o, a: ans } = mkj(ans2, [ans2 === '正确' ? '错误' : '正确']);
    add(ch, 'judge', q, o, ans, '', 2);
  }
}

// ====== Module 7: 三相电路 (80+ questions) ======
function genThreePhase() {
  const ch = '三相电路';

  // Y connection line/phase voltage (15)
  for (let i = 0; i < 15; i++) {
    let Vp = ri(110, 380);
    let Vl = Math.round(Vp * Math.sqrt(3));
    let { o, a: ans } = mk(`${Vl}V`, [`${Vp}V`, `${Math.round(Vp / Math.sqrt(3))}V`, `${2 * Vp}V`]);
    add(ch, 'single', `Y接法相电压${Vp}V，线电压=`, o, ans, `Y接法：Ul=√3·Up=${Math.round(Vp * 1.732)}V`, 1);
  }

  // Delta connection line/phase (10)
  for (let i = 0; i < 10; i++) {
    let Vp = ri(110, 380);
    let { o, a: ans } = mk(`${Vp}V`, [`${Math.round(Vp * Math.sqrt(3))}V`, `${Math.round(Vp / Math.sqrt(3))}V`, `${2 * Vp}V`]);
    add(ch, 'single', `Δ接法相电压${Vp}V，线电压=`, o, ans, `Δ接法：Ul=Up=${Vp}V`, 1);
  }

  // Y connection line/phase current (10)
  for (let i = 0; i < 10; i++) {
    let Il = ri(5, 30);
    let { o, a: ans } = mk(`${Il}A`, [`${Math.round(Il * Math.sqrt(3))}A`, `${Math.round(Il / Math.sqrt(3))}A`, `${2 * Il}A`]);
    add(ch, 'single', `Y接法线电流${Il}A，相电流=`, o, ans, `Y接法：Ip=Il=${Il}A`, 1);
  }

  // Delta connection line/phase current (10)
  for (let i = 0; i < 10; i++) {
    let Ip = ri(5, 20);
    let Il = Math.round(Ip * Math.sqrt(3));
    let { o, a: ans } = mk(`${Il}A`, [`${Ip}A`, `${Math.round(Ip / Math.sqrt(3))}A`, `${2 * Ip}A`]);
    add(ch, 'single', `Δ接法相电流${Ip}A，线电流=`, o, ans, `Δ接法：Il=√3·Ip=${Math.round(Ip * 1.732)}A`, 2);
  }

  // Three-phase power (15)
  for (let i = 0; i < 15; i++) {
    let Vp = ri(110, 380), Ip = ri(2, 20), cosPhi = [0.8, 0.85, 0.9, 1][ri(0, 3)];
    let P = Math.round(3 * Vp * Ip * cosPhi);
    let { o, a: ans } = mk(`${P}W`, [`${Math.round(Vp * Ip * cosPhi)}W`, `${Math.round(3 * Vp * Ip)}W`, `${Math.round(Vp * Ip)}W`]);
    add(ch, 'single', `对称三相Y接法Up=${Vp}V, Ip=${Ip}A, cosφ=${cosPhi}，总功率P=`, o, ans, `P=3·Up·Ip·cosφ=3×${Vp}×${Ip}×${cosPhi}=${P}W`, 2);
  }

  // Concepts (10)
  let concepts = [
    ['对称三相电源的相位差为', '120°', ['60°', '90°', '180°']],
    ['Y接法中线电压与相电压的关系是', 'Ul=√3·Up', ['Ul=Up', 'Ul=Up/√3', 'Ul=2·Up']],
    ['Δ接法中线电流与相电流的关系是', 'Il=√3·Ip', ['Il=Ip', 'Il=Ip/√3', 'Il=2·Ip']],
    ['对称三相电路中线电流为', '0', ['最大', '等于相电流', '不确定']],
    ['三相四线制中，中线的作用是', '提供不对称负载的回路', ['提高电压', '减小电流', '提高功率因数']],
    ['三相功率公式P=√3·Ul·Il·cosφ适用于', '对称三相电路', ['不对称电路', '仅Y接法', '仅Δ接法']],
    ['在三相电路中，视在功率S=', '√3·Ul·Il', ['3·Up·Ip', 'Ul·Il', '√2·Ul·Il']]
  ];
  for (let c of concepts) {
    let [q, ans2, wrongs] = c;
    let { o, a: ans } = mk(ans2, wrongs.slice(0, 3));
    add(ch, 'single', q, o, ans, '', 2);
  }

  // Judge (10)
  let judges = [
    ['对称三相电源的相序为A-B-C，相位依次相差120°。', '正确'],
    ['Y接法中线电压等于相电压。', '错误'],
    ['Δ接法中线电流等于相电流。', '错误'],
    ['对称三相电路中线线电流为零。', '正确'],
    ['三相四线制中中线可以省去。', '错误'],
    ['对称三相功率P=√3·Ul·Il·cosφ。', '正确'],
    ['不对称三相电路不能用对称分量法分析。', '错误'],
    ['Y接法线电压超前对应相电压30°。', '正确'],
    ['Δ接法线电流滞后对应相电流30°。', '正确'],
    ['三相电路的瞬时功率是恒定的（对称时）。', '正确']
  ];
  for (let j of judges) {
    let [q, ans2] = j;
    let { o, a: ans } = mkj(ans2, [ans2 === '正确' ? '错误' : '正确']);
    add(ch, 'judge', q, o, ans, '', 2);
  }
}

// ====== Module 8: 二端口网络 (100+ questions) ======
function genTwoPort() {
  const ch = '二端口网络';

  // Z-parameters (15)
  for (let i = 0; i < 15; i++) {
    let z11 = ri(2, 10), z12 = ri(1, 5), z21 = ri(1, 5), z22 = ri(2, 10);
    let { o, a: ans } = mk(`Z=[${z11} ${z12};${z21} ${z22}]Ω`, [`Z=[${z11} ${z21};${z12} ${z22}]Ω`, `Z=[${z22} ${z12};${z21} ${z11}]Ω`, `Z=[${z11} ${z12};${z21} ${z22}]S`]);
    add(ch, 'single', `二端口Z参数方程U1=${z11}I1+${z12}I2, U2=${z21}I1+${z22}I2，Z矩阵=`, o, ans, `Z参数矩阵：Z11=${z11}, Z12=${z12}, Z21=${z21}, Z22=${z22}`, 2);
  }

  // Concepts (20)
  let concepts = [
    ['二端口网络的Z参数方程是', 'U=ZI', ['I=YU', 'U=TI', 'I=HU']],
    ['二端口网络的Y参数方程是', 'I=YU', ['U=ZI', 'U=TI', 'I=HU']],
    ['互易二端口网络的Z参数满足', 'Z12=Z21', ['Z11=Z22', 'Z12=Z11', 'Z21=Z22']],
    ['互易二端口网络的Y参数满足', 'Y12=Y21', ['Y11=Y22', 'Y12=Y11', 'Y21=Y22']],
    ['对称二端口网络满足', 'Z11=Z22且Z12=Z21', ['Z11=Z22', 'Z12=Z21', '所有参数相等']],
    ['Z参数和Y参数的关系是', 'Y=Z⁻¹', ['Z=Y⁻¹', 'Z=Y', '无关']],
    ['传输参数(T参数)适用于', '级联二端口', ['串联', '并联', '串并联']],
    ['二端口网络级联时用___参数', 'T(传输)参数', ['Z', 'Y', 'H']],
    ['二端口网络并联时用___参数', 'Y参数', ['Z', 'T', 'H']],
    ['二端口网络串联时用___参数', 'Z参数', ['Y', 'T', 'H']],
    ['二端口网络串并联时用___参数', 'H(混合)参数', ['Z', 'Y', 'T']],
    ['互易二端口的T参数满足', 'AD-BC=1', ['AD+BC=1', 'A=D', 'B=C']],
    ['对称二端口的T参数满足', 'A=D', ['AD-BC=1', 'B=C', '所有相等']],
    ['H参数方程中，U1=f(I1,U2)表示', '混合参数', ['阻抗', '导纳', '传输']],
    ['二端口网络最少需要___个独立参数描述', '3（互易）或4（非互易）', ['1', '2', '6']]
  ];
  for (let c of concepts) {
    let [q, ans2, wrongs] = c;
    let { o, a: ans } = mk(ans2, wrongs.slice(0, 3));
    add(ch, 'single', q, o, ans, '', 2);
  }

  // Judge (10)
  let judges = [
    ['互易二端口网络的Z12=Z21。', '正确'],
    ['对称二端口网络的Z11=Z22。', '正确'],
    ['任何二端口网络都有Z参数。', '错误'],
    ['任何二端口网络都有Y参数。', '错误'],
    ['二端口网络级联时，总T参数为各T参数矩阵的乘积。', '正确'],
    ['二端口网络并联时，总Y参数为各Y参数之和。', '正确'],
    ['二端口网络串联时，总Z参数为各Z参数之和。', '正确'],
    ['互易二端口的T参数满足AD-BC=1。', '正确'],
    ['H参数又称混合参数。', '正确'],
    ['二端口网络最少需要2个参数描述。', '错误']
  ];
  for (let j of judges) {
    let [q, ans2] = j;
    let { o, a: ans } = mkj(ans2, [ans2 === '正确' ? '错误' : '正确']);
    add(ch, 'judge', q, o, ans, '', 2);
  }
}

// ====== Module 9: 拉普拉斯变换 (80+ questions) ======
function genLaplace() {
  const ch = '复频域分析';

  // Basic transforms (15)
  let transforms = [
    ['L{1}', '1/s', 'L{1}=∫₀^∞ e^(-st)dt=1/s'],
    ['L{t}', '1/s²', 'L{t}=1/s²'],
    ['L{t²}', '2/s³', 'L{t^n}=n!/s^(n+1)，n=2时=2/s³'],
    ['L{e^(at)}', '1/(s-a)', 'L{e^(at)}=1/(s-a)'],
    ['L{sin(at)}', 'a/(s²+a²)', 'L{sin(at)}=a/(s²+a²)'],
    ['L{cos(at)}', 's/(s²+a²)', 'L{cos(at)}=s/(s²+a²)'],
    ['L{δ(t)}', '1', 'L{δ(t)}=1（冲激函数）'],
    ['L{e^(-at)sin(bt)}', 'b/((s+a)²+b²)', '频移定理'],
    ['L{e^(-at)cos(bt)}', '(s+a)/((s+a)²+b²)', '频移定理'],
    ['L{t·e^(at)}', '1/(s-a)²', '频移+阶数']
  ];
  for (let t of transforms) {
    let [q, ans2, exp] = t;
    let { o, a: ans } = mk(ans2, ['1/s', 's', '1/(s+1)', '1/s²', 'a/s', 's/(s²+1)'].filter(x => x !== ans2).slice(0, 3));
    add(ch, 'single', `${q}=`, o, ans, exp, 2);
  }

  // Properties (15)
  let props = [
    ['拉氏变换的线性性质：L{af+bg}=', 'aF(s)+bG(s)', ['aF(s)·bG(s)', 'F(s)+G(s)', 'ab·F(s)']],
    ["拉氏变换的微分性质：L{f'(t)}=", 'sF(s)-f(0)', ['F(s)', 'sF(s)', 'f(0)']],
    ['拉氏变换的积分性质：L{∫f(t)dt}=', 'F(s)/s', ['sF(s)', 'F(s)·s', 'F(s)+s']],
    ['拉氏变换的时移性质：L{f(t-a)u(t-a)}=', 'e^(-as)F(s)', ['e^(as)F(s)', 'F(s-a)', 'e^(-as)F(s+a)']],
    ['拉氏变换的频移性质：L{e^(at)f(t)}=', 'F(s-a)', ['F(s+a)', 'e^(-as)F(s)', 'F(s-a)F(s)']],
    ['拉氏变换的尺度变换：L{f(at)}=', '(1/a)F(s/a)', ['aF(s/a)', 'F(s/a)', '(1/a)F(as)']],
    ['初值定理：f(0+)=', 'lim(s→∞)sF(s)', ['lim(s→0)sF(s)', 'F(0)', 'lim(s→∞)F(s)']],
    ['终值定理：f(∞)=', 'lim(s→0)sF(s)', ['lim(s→∞)sF(s)', 'F(0)', 'lim(s→0)F(s)']],
    ['卷积定理：L{f*g}=', 'F(s)G(s)', ['F(s)+G(s)', 'F(s)/G(s)', 'F(s)·G(s)/s']]
  ];
  for (let p of props) {
    let [q, ans2, wrongs] = p;
    let { o, a: ans } = mk(ans2, wrongs.slice(0, 3));
    add(ch, 'single', q, o, ans, '', 2);
  }

  // Concepts (10)
  let concepts = [
    ['拉普拉斯变换将时域分析转换为', '复频域分析', ['频域', '时域', '相量域']],
    ['拉氏变换的收敛域是', 'Re(s)>σ₀', ['Re(s)<σ₀', '所有s', 'Re(s)=0']],
    ['拉氏变换适用于', '线性时不变系统', ['非线性系统', '时变系统', '任何系统']],
    ['拉氏变换中s=σ+jω，其中σ称为', '衰减因子', ['频率', '相位', '幅值']],
    ['用拉氏变换分析电路时，电感的s域阻抗为', 'sL', ['1/(sC)', 'L', 'jωL']],
    ['用拉氏变换分析电路时，电容的s域阻抗为', '1/(sC)', ['sL', 'C', '1/(jωC)']],
    ['拉氏反变换的部分分式展开法适用于', '有理分式F(s)', ['任何F(s)', '仅多项式', '仅指数函数']],
    ['电路的复频域模型中，初始条件体现为', '附加电源', ['附加电阻', '附加电抗', '无变化']]
  ];
  for (let c of concepts) {
    let [q, ans2, wrongs] = c;
    let { o, a: ans } = mk(ans2, wrongs.slice(0, 3));
    add(ch, 'single', q, o, ans, '', 2);
  }

  // Judge (10)
  let judges = [
    ['拉普拉斯变换将微分方程转化为代数方程。', '正确'],
    ['拉氏变换的收敛域为Re(s)>σ₀。', '正确'],
    ['初值定理：f(0+)=lim(s→∞)sF(s)。', '正确'],
    ['终值定理：f(∞)=lim(s→0)sF(s)。', '正确'],
    ['拉氏变换中电感的s域阻抗为1/(sL)。', '错误'],
    ['拉氏变换中电容的s域阻抗为1/(sC)。', '正确'],
    ['卷积定理：L{f*g}=F(s)G(s)。', '正确'],
    ['拉氏反变换的唯一性保证了变换的一一对应。', '正确'],
    ['部分分式展开法适用于任何F(s)。', '错误'],
    ['拉氏变换的频移性质：L{e^(at)f(t)}=F(s-a)。', '正确']
  ];
  for (let j of judges) {
    let [q, ans2] = j;
    let { o, a: ans } = mkj(ans2, [ans2 === '正确' ? '错误' : '正确']);
    add(ch, 'judge', q, o, ans, '', 2);
  }
}

// ====== Module 10: 综合概念题 (60+ questions) ======
function genConcepts() {
  const ch = '电路综合概念';

  let concepts = [
    ['戴维南定理和诺顿定理本质上是', '等效电源定理', ['叠加定理', '互易定理', '替代定理']],
    ['一阶电路三要素法适用于', '直流激励一阶电路', ['正弦激励', '任意激励', '二阶电路']],
    ['正弦交流电的有效值与最大值的关系是', 'U=Um/√2', ['U=Um', 'U=√2·Um', 'U=Um/2']],
    ['功率因数提高意味着', '无功功率减少', ['有功功率增加', '视在功率增加', '电流增大']],
    ['串联谐振也称为', '电压谐振', ['电流谐振', '功率谐振', '阻抗谐振']],
    ['并联谐振也称为', '电流谐振', ['电压谐振', '功率谐振', '阻抗谐振']],
    ['在RC电路中，时间常数τ=RC，其物理意义是', '响应衰减到37%的时间', ['响应衰减到0的时间', '响应达到稳态的时间', '半衰期']],
    ['换路定则适用于', '电容电压和电感电流', ['所有变量', '电容电流', '电感电压']],
    ['戴维南等效电阻的求解方法不包括', '短路电流法', ['开路电压法', '外加电源法', '直接化简法']],
    ['二端口网络的参数描述中，适用于级联的是', 'T参数', ['Z参数', 'Y参数', 'H参数']],
    ['三相电路中，对称负载Y接法时中线电流为', '0', ['等于相电流', '等于线电流', '不确定']],
    ['提高功率因数通常并联', '电容', ['电感', '电阻', '电源']],
    ['理想变压器的效率为', '100%', ['50%', '90%', '不确定']],
    ['耦合电感顺接串联时等效电感为', 'L1+L2+2M', ['L1+L2-2M', 'L1+L2', 'L1-L2+2M']],
    ['耦合电感反接串联时等效电感为', 'L1+L2-2M', ['L1+L2+2M', 'L1+L2', 'L1-L2-2M']],
    ['二阶RLC串联电路，当R>2√(L/C)时为', '过阻尼', ['欠阻尼', '临界阻尼', '无阻尼']],
    ['二阶RLC串联电路，当R<2√(L/C)时为', '欠阻尼', ['过阻尼', '临界阻尼', '无阻尼']],
    ['二阶RLC串联电路，当R=2√(L/C)时为', '临界阻尼', ['过阻尼', '欠阻尼', '无阻尼']],
    ['正弦交流电的角频率ω与频率f的关系是', 'ω=2πf', ['ω=πf', 'ω=f/2π', 'ω=2f']],
    ['复阻抗Z=R+jX的模|Z|=', '√(R²+X²)', ['R+X', 'R²+X²', '√(R²-X²)']]
  ];
  for (let i = 0; i < concepts.length; i++) {
    let [q, ans2, wrongs] = concepts[i];
    let { o, a: ans } = mk(ans2, wrongs.slice(0, 3));
    add(ch, 'single', q, o, ans, '', 2);
  }

  // More judge questions
  let judges = [
    ['电路中功率平衡意味着总发出功率等于总吸收功率。', '正确'],
    ['叠加定理可以用来计算功率。', '错误'],
    ['戴维南定理适用于非线性电路。', '错误'],
    ['理想电压源的内阻为零。', '正确'],
    ['理想电流源的内阻为无穷大。', '正确'],
    ['实际电压源的戴维南模型是理想电压源串联内阻。', '正确'],
    ['实际电流源的诺顿模型是理想电流源并联内阻。', '正确'],
    ['串联谐振时电感和电容上的电压可以远大于电源电压。', '正确'],
    ['并联谐振时电感和电容支路的电流可以远大于总电流。', '正确'],
    ['对称三相电路的瞬时功率是常数（不随时间变化）。', '正确']
  ];
  for (let j of judges) {
    let [q, ans2] = j;
    let { o, a: ans } = mkj(ans2, [ans2 === '正确' ? '错误' : '正确']);
    add(ch, 'judge', q, o, ans, '', 2);
  }

  // Advanced concept questions (20)
  let adv = [
    ['诺顿定理中，等效电流I_N等于', '端口短路电流', ['开路电压', '端口电压', '负载电流']],
    ['最大功率传输时负载电阻RL与等效电阻Rth的关系', 'RL=Rth', ['RL=2Rth', 'RL=Rth/2', 'RL>>Rth']],
    ['在复频域分析中，电感的s域模型包含', '附加电压源sL·i(0)', ['附加电流源', '仅阻抗sL', '无附加源']],
    ['在复频域分析中，电容的s域模型包含', '附加电压源u(0)/s', ['附加电流源', '仅阻抗1/(sC)', '无附加源']],
    ['RLC串联电路谐振时，阻抗为', 'R（最小）', ['最大', '零', '无穷大']],
    ['RLC并联电路谐振时，阻抗为', 'R（最大）', ['最小', '零', '无穷大']],
    ['三相电路的功率因数角φ是', '线电压与线电流的相位差', ['相电压与相电流', '线电压与相电流', '相电压与线电流']],
    ['二端口网络的特性阻抗Zc在___条件下有意义', '无限对称', ['有限对称', '互易', '非互易']],
    ['变压器除变换电压电流外，还可以', '变换阻抗', ['变换频率', '变换功率', '变换相位']],
    ['受控源的类型不包括', '独立电压源', ['VCVS', 'VCCS', 'CCVS']],
    ['四种受控源中，CCVS表示', '电流控制电压源', ['电压控制电压源', '电流控制电流源', '电压控制电流源']],
    ['四种受控源中，VCCS表示', '电压控制电流源', ['电流控制电压源', '电压控制电压源', '电流控制电流源']]
  ];
  for (let a of adv) {
    let [q, ans2, wrongs] = a;
    let { o, a: ans } = mk(ans2, wrongs.slice(0, 3));
    add(ch, 'single', q, o, ans, '', 3);
  }
}

// ====== Module 11: 网络图论 (30 questions) ======
function genNetworkGraph() {
  const ch = '网络图论与矩阵分析';
  let concepts = [
    ['关联矩阵A描述的是节点与___的关系', '支路', ['回路', '网孔', '割集']],
    ['关联矩阵A的每一行对应一个', '节点', ['支路', '回路', '网孔']],
    ['关联矩阵A的每一列对应一个', '支路', ['节点', '回路', '割集']],
    ['关联矩阵A中元素aij=1表示', '支路j与节点i关联且方向离开节点', ['支路j与节点i关联且方向指向节点', '支路j与节点i不关联', '支路j是树支']],
    ['关联矩阵A中元素aij=-1表示', '支路j与节点i关联且方向指向节点', ['支路j与节点i关联且方向离开节点', '支路j与节点i不关联', '支路j是连支']],
    ['基本回路矩阵Bf的每一行对应一个', '基本回路（单连支回路）', ['节点', '割集', '树支']],
    ['基本割集矩阵Qf的每一行对应一个', '基本割集（单树支割集）', ['回路', '节点', '连支']],
    ['连通图G有n个节点，b条支路，则树的树支数为', 'n-1', ['b', 'b-n+1', 'n']],
    ['连通图G有n个节点，b条支路，树的连支数为', 'b-n+1', ['n-1', 'b', 'b-n-1']],
    ['基本回路数等于', '连支数', ['树支数', '节点数', '支路数']],
    ['基本割集数等于', '树支数', ['连支数', '回路数', '网孔数']],
    ['KCL的矩阵形式为', 'Ab^T·Ib=0', ['AIb=0', 'Bf·Ub=0', 'Qf·Ib=0']],
    ['KVL的矩阵形式为', 'Bf·Ub=0', ['AIb=0', 'Ab^T·Ib=0', 'Qf·Ib=0']],
    ['节点方程的矩阵形式为', 'AYbA^T·Un=AYbUs-AYbYbUs', ['BfZbBf^T·Il=BfUs', 'QfYbQf^T·Ut=QfIb']],
    ['割集方程的矩阵形式为', 'QfYbQf^T·Ut=QfIs-QfYbVs', ['AYbA^T·Un=AYbUs', 'BfZbBf^T·Il=BfUs']],
    ['回路方程的矩阵形式为', 'BfZbBf^T·Il=BfUs-BfZbIs', ['AYbA^T·Un=AYbUs', 'QfYbQf^T·Ut=QfIs']],
    ['树的特性是', '连通且无回路', ['连通且有回路', '不连通', '有回路且不含割集']],
    ['连通图中树的特点是', '连通、包含所有节点、无回路', ['不连通', '有回路', '不含所有节点']],
    ['选择不同的树，所得基本回路矩阵Bf', '不同', ['相同', '互为转置', '互为逆']],
    ['特勒根定理的矩阵形式基于', '关联矩阵的转置关系', ['回路矩阵', '割集矩阵', '导纳矩阵']],
    ['特勒根定理一（功率守恒）的表达式为', 'Ub^T·Ib=0', ['Ab^T·Ib=0', 'Bf·Ub=0', 'Qf·Ib=0']],
    ['特勒根定理二（拟功率守恒）要求两个网络', '具有相同的关联矩阵A', ['具有相同的支路阻抗', '具有相同的节点导纳', '具有相同的树']],
    ['节点导纳矩阵Yn=AYbA^T中，Yb是', '支路导纳矩阵', ['节点导纳矩阵', '回路阻抗矩阵', '割集导纳矩阵']],
    ['回路阻抗矩阵Zl=BfZbBf^T中，Zb是', '支路阻抗矩阵', ['回路阻抗矩阵', '节点导纳矩阵', '割集导纳矩阵']],
    ['含有受控源时，矩阵分析中支路方程需', '增加受控源项', ['删除受控源', '忽略受控源', '简化为无受控源']],
    ['含有互感时，矩阵分析中支路阻抗矩阵Zb', '非对角线元素不为零', ['仍为对角矩阵', '变为零矩阵', '变为单位矩阵']],
    ['节点法适合于', '节点少支路多的电路', ['节点多支路少', '回路少', '割集多']],
    ['回路法适合于', '回路少的电路', ['节点少', '支路多', '割集少']],
    ['割集法与节点法的关系是', '割集法是节点法的推广', ['完全无关', '互为逆运算', '仅适用于平面电路']],
    ['特勒根定理适用于', '任何集中参数电路', ['仅适用于线性电路', '仅适用于非线性电路', '仅适用于时变电路']]
  ];
  for (let a of concepts) {
    let [q, ans2, wrongs] = a;
    let { o, a: ans } = mk(ans2, wrongs.slice(0, 3));
    add(ch, 'single', q, o, ans, '', 3);
  }
}

// ====== Module 12: 非线性电路 (25 questions) ======
function genNonlinear() {
  const ch = '非线性电路';
  let concepts = [
    ['非线性电阻的静态电阻Rq=', 'U/I', ['dU/dI', 'I/U', 'dI/dU']],
    ['非线性电阻的动态电阻rd=', 'dU/dI', ['U/I', 'I/U', 'dI/dU']],
    ['非线性电阻的静态电导Gq=', 'I/U', ['dI/dU', 'U/I', 'dI/dU']],
    ['非线性电阻的动态电导gd=', 'dI/dU', ['I/U', 'U/I', 'dU/dI']],
    ['工作点处动态电阻为零意味着', 'U-I曲线在该点有水平切线', ['垂直切线', '45度切线', '无切线']],
    ['工作点处动态电导为零意味着', 'U-I曲线在该点有垂直切线', ['水平切线', '45度切线', '无切线']],
    ['非线性电路的分析不能用', '叠加原理', ['图解法', '小信号法', '分段线性法']],
    ['小信号分析法中，直流工作点由___确定', '直流偏置电路', ['信号源', '交流等效电路', '线性化电路']],
    ['小信号分析法中，交流分量通过___求解', '在工作点处线性化后的等效电路', ['原始非线性电路', '直流偏置电路', '叠加原理']],
    ['小信号分析法的前提条件是', '信号变化幅度足够小', ['信号频率足够高', '电路必须是线性的', '电路必须含电感']],
    ['分段线性法将非线性元件的特性用___近似', '折线', ['曲线', '抛物线', '直线段序列']],
    ['图解法适用于', '含一个非线性电阻的电路', ['含多个非线性电阻', '纯线性电路', '高频电路']],
    ['非线性电路的解（工作点）可能', '有多个', ['只有一个', '一定不存在', '一定为零']],
    ['隧道二极管的伏安特性曲线呈', 'N形（有负阻区）', ['单调递增', 'S形', '线性']],
    ['理想二极管的正向电阻为', '0', ['无穷大', '有限值', '不确定']],
    ['理想二极管的反向电阻为', '无穷大', ['0', '有限值', '不确定']],
    ['非线性电容的特性是', 'Q-U关系非线性', ['Q=CU线性关系', 'Q与U无关', 'Q与U成正比']],
    ['非线性电感的特性是', 'ψ-i关系非线性', ['ψ=Li线性关系', 'ψ与i无关', 'ψ与i成正比']],
    ['含非线性元件的电路，功率计算需用', '积分法', ['叠加法', '相量法', '拉氏变换']],
    ['负阻器件在动态电阻为负的区域可', '提供能量', ['消耗能量', '存储能量', '不参与能量交换']],
    ['小信号等效电路中，非线性电阻用___替代', '工作点处的动态电阻', ['静态电阻', '零电阻', '无穷大电阻']],
    ['含理想二极管的电路分析常采用', '假设导通/截止后验证', ['戴维南定理', '诺顿定理', '叠加原理']],
    ['非线性电路中，叠加原理', '不适用', ['适用', '部分适用', '仅适用于直流']],
    ['工作点（Q点）是指', '非线性元件伏安特性与负载线的交点', ['电路中电压最大点', '电流最大点', '功率最大点']],
    ['通过负载线与非线性元件特性曲线的交点确定工作点的方法称为', '图解法', ['解析法', '数值法', '试探法']]
  ];
  for (let a of concepts) {
    let [q, ans2, wrongs] = a;
    let { o, a: ans } = mk(ans2, wrongs.slice(0, 3));
    add(ch, 'single', q, o, ans, '', 3);
  }
}

// ====== Module 13: 传递函数与频率响应 (35 questions) ======
function genTransferFunc() {
  const ch = '传递函数与频率响应';

  // RC低通/高通滤波器 (15)
  for (let i = 0; i < 8; i++) {
    let R = ri(1, 20), C = ri(1, 20);
    let fc = frac(1, 2 * Math.PI * R * C * 1000);
    let { o, a: ans } = mk(`${fc}Hz`, [`${frac(1, R * C * 1000)}Hz`, `${frac(2, R * C * 1000)}Hz`, `${R * C * 1000}Hz`]);
    add(ch, 'single', `RC低通滤波器，R=${R}kΩ，C=${C}μF，截止频率fc≈`, o, ans, `fc=1/(2πRC)=1/(2π×${R}k×${C}μ)≈${fc}Hz`, 2);
  }
  for (let i = 0; i < 7; i++) {
    let R = ri(1, 20), C = ri(1, 20);
    let fc = frac(1, 2 * Math.PI * R * C * 1000);
    let { o, a: ans } = mk(`${fc}Hz`, [`${frac(1, R * C * 1000)}Hz`, `${frac(2, R * C * 1000)}Hz`, `${frac(1, 4 * R * C * 1000)}Hz`]);
    add(ch, 'single', `RC高通滤波器，R=${R}kΩ，C=${C}μF，截止频率fc≈`, o, ans, `高通与低通截止频率公式相同：fc=1/(2πRC)≈${fc}Hz`, 2);
  }

  // RL滤波器 (5)
  for (let i = 0; i < 3; i++) {
    let R = ri(1, 20), L = ri(1, 20);
    let fc = frac(R, 2 * Math.PI * L * 1000);
    let { o, a: ans } = mk(`${fc}Hz`, [`${frac(1, 2 * Math.PI * L * 1000)}Hz`, `${frac(2 * R, L * 1000)}Hz`, `${R * L * 1000}Hz`]);
    add(ch, 'single', `RL低通滤波器，R=${R}Ω，L=${L}mH，截止频率fc≈`, o, ans, `RL低通fc=R/(2πL)=${R}/(2π×${L}m)≈${fc}Hz`, 2);
  }
  for (let i = 0; i < 2; i++) {
    let R = ri(1, 20), L = ri(1, 20);
    let fc = frac(R, 2 * Math.PI * L * 1000);
    let { o, a: ans } = mk(`${fc}Hz`, [`${frac(1, 2 * Math.PI * L * 1000)}Hz`, `${frac(2 * R, L * 1000)}Hz`, `${R + L}Hz`]);
    add(ch, 'single', `RL高通滤波器，R=${R}Ω，L=${L}mH，截止频率fc≈`, o, ans, `RL高通fc=R/(2πL)≈${fc}Hz`, 2);
  }

  // 传递函数概念 (15)
  let concepts = [
    ['传递函数H(jω)定义为', '输出相量与输入相量之比', ['输出与输入功率之比', '输出与输入阻抗之比', '输出与输入能量之比']],
    ['传递函数的模|H(jω)|表示', '幅频特性', ['相频特性', '功率增益', '阻抗比']],
    ['传递函数的幅角arg[H(jω)]表示', '相频特性', ['幅频特性', '功率因数', '增益']],
    ['RC低通的传递函数为', '1/(1+jωRC)', ['jωRC/(1+jωRC)', '1/(jωRC)', 'jωRC']],
    ['RC高通的传递函数为', 'jωRC/(1+jωRC)', ['1/(1+jωRC)', '1/(jωRC)', '1/(1-jωRC)']],
    ['截止频率处，|H|下降到通带的', '1/√2倍（-3dB）', ['1/2倍', '1倍', '0倍']],
    ['波特图的横轴是频率的', '对数坐标', ['线性坐标', '指数坐标', '平方坐标']],
    ['波特图的纵轴增益单位是', 'dB（分贝）', ['倍数', 'W', 'V']],
    ['20log|H|中，|H|=1对应', '0dB', ['20dB', '10dB', '-20dB']],
    ['20log|H|中，|H|=0.707对应', '约-3dB', ['0dB', '-10dB', '-20dB']],
    ['一阶低通的幅频特性曲线高频渐近线斜率为', '-20dB/dec', ['-40dB/dec', '0dB/dec', '20dB/dec']],
    ['一阶高通的幅频特性曲线低频渐近线斜率为', '20dB/dec', ['-20dB/dec', '0dB/dec', '-40dB/dec']],
    ['二阶RLC电路的传递函数中，品质因数Q越大', '谐振峰越尖锐', ['谐振峰越平', '截止频率变化', '带宽增大']],
    ['带宽BW与品质因数Q的关系为', 'BW=ω0/Q', ['BW=Qω0', 'BW=ω0×Q', 'BW=Q/ω0']],
    ['半功率点是指|H|²下降到通带的', '1/2', ['1/4', '1/3', '1倍']]
  ];
  for (let a of concepts) {
    let [q, ans2, wrongs] = a;
    let { o, a: ans } = mk(ans2, wrongs.slice(0, 3));
    add(ch, 'single', q, o, ans, '', 2);
  }
}

// ====== Module 14: 高级定理应用 (30 questions) ======
function genAdvancedTheorem() {
  const ch = '高级电路定理应用';

  // 多源叠加 (10)
  for (let i = 0; i < 10; i++) {
    let v1 = ri(10, 50), v2 = ri(5, 30), r1 = ri(2, 10), r2 = ri(2, 10), r3 = ri(2, 10);
    let i3 = frac(v1 * r2 + v2 * r1, r1 * r2 + r1 * r3 + r2 * r3);
    let i3_v1 = frac(v1 * r2, r1 * r2 + r1 * r3 + r2 * r3);
    let i3_v2 = frac(v2 * r1, r1 * r2 + r1 * r3 + r2 * r3);
    let { o, a: ans } = mk(`${i3}A`, [`${frac(v1 + v2, r1 + r2)}A`, `${frac(v1 * r1 + v2 * r2, r1 + r2)}A`, `${frac(v1 * v2, r1 * r2)}A`]);
    add(ch, 'single', `双电源回路：E1=${v1}V, E2=${v2}V, R1=${r1}Ω, R2=${r2}Ω, R3=${r3}Ω(R3跨接两节点)，用叠加原理求R3电流I3=`, o, ans, `叠加：仅E1作用时I3'=${i3_v1}A，仅E2作用时I3''=${i3_v2}A，I3=I3'+I3''=${i3}A`, 3);
  }

  // 戴维南+最大功率综合 (10)
  for (let i = 0; i < 10; i++) {
    let v = ri(10, 50), r1 = ri(2, 15), r2 = ri(2, 15);
    let req = frac(r1 * r2, r1 + r2);
    let voc = frac(v * r2, r1 + r2);
    let reqNum = r1 * r2 / (r1 + r2);
    let vocNum = v * r2 / (r1 + r2);
    let pmaxNum = vocNum * vocNum / (4 * reqNum);
    let pmaxStr = Number.isInteger(pmaxNum) ? `${pmaxNum}` : `${pmaxNum.toFixed(2)}`;
    let { o, a: ans } = mk(`${pmaxStr}W`, [`${frac(v * v, 4 * r1)}W`, `${frac(v * v, 4 * r2)}W`, `${frac(v * v, r1 + r2)}W`]);
    add(ch, 'single', `含源网络：E=${v}V串联R1=${r1}Ω，并联R2=${r2}Ω作为负载，求负载R2获得的最大功率Pmax=`, o, ans, `Uoc=E×R2/(R1+R2)=${voc}V, Req=R1∥R2=${req}Ω, Pmax=Uoc²/(4Req)≈${pmaxStr}W`, 3);
  }

  // 互易定理 (10)
  let reciprocity = [
    ['互易定理仅适用于', '线性电阻网络', ['非线性电路', '含受控源电路', '时变电路']],
    ['互易定理形式一：电压源激励、电流响应，互换位置后', '电流响应相同', ['电压响应相同', '功率相同', '阻抗相同']],
    ['互易定理形式二：电流源激励、电压响应，互换位置后', '电压响应相同', ['电流响应相同', '功率相同', '导纳相同']],
    ['互易定理形式三：电压源↔电流源互换后', '数值上响应相等', ['响应不变', '响应为零', '响应加倍']],
    ['互易定理要求网络中', '不含独立源和受控源', ['含独立源', '含受控源', '含非线性元件']],
    ['互易定理本质上是___的体现', '特勒根定理', ['戴维南定理', '诺顿定理', '叠加定理']],
    ['互易网络的条件是', '网络矩阵对称', ['网络矩阵对角', '网络矩阵为零', '网络矩阵为单位阵']],
    ['含回转器的电路', '不满足互易定理', ['满足互易定理', '满足叠加定理', '满足戴维南定理']],
    ['理想变压器的电路', '满足互易定理', ['不满足互易定理', '不满足叠加定理', '不满足KCL']],
    ['互易定理在测量中的意义是', '可在任一端口激励、任一端口测量', ['只能在固定端口激励', '只能测量电压', '只能测量电流']]
  ];
  for (let a of reciprocity) {
    let [q, ans2, wrongs] = a;
    let { o, a: ans } = mk(ans2, wrongs.slice(0, 3));
    add(ch, 'single', q, o, ans, '', 3);
  }
}

// ====== Module 15: 综合应用题 (40 questions) ======
function genComprehensive() {
  const ch = '综合应用';

  // 混合计算 (15)
  for (let i = 0; i < 5; i++) {
    let v = ri(12, 48), r1 = ri(2, 10), r2 = ri(2, 10), r3 = ri(2, 10);
    let req = r1 + r2 * r3 / (r2 + r3);
    let totalI = frac(v, Math.round(req));
    let { o, a: ans } = mk(`${totalI}A`, [`${frac(v, r1)}A`, `${frac(v, r1 + r2)}A`, `${frac(v, r1 + r3)}A`]);
    add(ch, 'single', `电路：E=${v}V串R1=${r1}Ω，再并R2=${r2}Ω和R3=${r3}Ω，求总电流I=`, o, ans, `R23=R2∥R3=${(r2*r3/(r2+r3)).toFixed(1)}Ω, R总=R1+R23≈${req.toFixed(1)}Ω, I=E/R总=${totalI}A`, 3);
  }
  for (let i = 0; i < 5; i++) {
    let v = ri(6, 24), r1 = ri(1, 5), r2 = ri(1, 5), r3 = ri(1, 5), r4 = ri(1, 5);
    let r34 = r3 + r4;
    let r234 = r2 * r34 / (r2 + r34);
    let req = r1 + r234;
    let i1 = frac(v, Math.round(req));
    let { o, a: ans } = mk(`${i1}A`, [`${frac(v, r1 + r2 + r3 + r4)}A`, `${frac(v, r1 + r2)}A`, `${frac(v, r2)}A`]);
    add(ch, 'single', `梯形网络：E=${v}V，R1=${r1}Ω串R2=${r2}Ω，R2后串R3=${r3}Ω和R4=${r4}Ω(R3R4为串联支路)，求总电流I=`, o, ans, `R34=R3+R4=${r34}Ω, R234=R2∥R34=${r234.toFixed(1)}Ω, R总=R1+R234≈${req.toFixed(1)}Ω, I=E/R总=${i1}A`, 3);
  }
  for (let i = 0; i < 5; i++) {
    let v1 = ri(6, 24), v2 = ri(6, 24), r1 = ri(1, 5), r2 = ri(1, 5), r3 = ri(1, 5);
    let i1 = frac(v1 * (r2 + r3) - v2 * r3, r1 * (r2 + r3) + r2 * r3);
    let { o, a: ans } = mk(`${i1}A`, [`${frac(v1, r1)}A`, `${frac(v1 + v2, r1 + r2)}A`, `${frac(v1 - v2, r1)}A`]);
    add(ch, 'single', `双源双网孔：E1=${v1}V, E2=${v2}V, R1=${r1}Ω(公共), R2=${r2}Ω, R3=${r3}Ω, 用网孔法求R1支路电流I1=`, o, ans, `网孔1：E1=I1(R1+R2)-I2R2; 网孔2：-E2=I2(R2+R3)-I1R2; 联立求解得I1=${i1}A`, 3);
  }

  // AC综合 (10)
  for (let i = 0; i < 5; i++) {
    let R = ri(3, 15), L = ri(2, 10), C = ri(2, 10);
    let omega = ri(10, 50);
    let XL = omega * L;
    let XCnum = 1 / (omega * C);
    let XC = frac(1, omega * C);
    let Xnet = XL - XCnum;
    let Zstr = `${R}+j${Xnet.toFixed(1)}`;
    let { o, a: ans } = mk(`${Zstr}Ω`, [`${R + XL}Ω`, `${R - XCnum.toFixed(0)}Ω`, `${R * XL}Ω`]);
    add(ch, 'single', `RLC串联电路：R=${R}Ω, L=${L}H, C=${C}F, ω=${omega}rad/s，求阻抗Z=`, o, ans, `XL=ωL=${XL}Ω, XC=1/(ωC)=${XC}Ω, Z=R+j(XL-XC)=${Zstr}Ω`, 3);
  }
  for (let i = 0; i < 5; i++) {
    let R = ri(3, 15), L = ri(2, 10), C = ri(2, 10);
    let omega = ri(10, 50);
    let XL = omega * L;
    let XCv = 1 / (omega * C);
    let Zmag = Math.sqrt(R * R + (XL - XCv) * (XL - XCv));
    let { o, a: ans } = mk(`${Zmag.toFixed(1)}Ω`, [`${R + XL + XCv}Ω`, `${Math.abs(R + XL - XCv)}Ω`, `${R}Ω`]);
    add(ch, 'single', `RLC串联：R=${R}Ω, L=${L}H, C=${C}F, ω=${omega}rad/s，求阻抗模|Z|=`, o, ans, `|Z|=√(R²+(XL-XC)²)=√(${R}²+${((XL-XCv)).toFixed(1)}²)=${Zmag.toFixed(1)}Ω`, 3);
  }

  // 动态综合 (5)
  for (let i = 0; i < 5; i++) {
    let v = ri(5, 20), r = ri(2, 10), c = ri(1, 10);
    let tau = r * c;
    let uc_final = v;
    let { o, a: ans } = mk(`${tau}s`, [`${r + c}s`, `${r * c * 2}s`, `${frac(r, c)}s`]);
    add(ch, 'single', `RC充电：E=${v}V, R=${r}Ω, C=${c}F，时间常数τ=`, o, ans, `τ=RC=${r}×${c}=${tau}s`, 2);
  }

  // 耦合综合 (5)
  for (let i = 0; i < 5; i++) {
    let L1 = ri(2, 10), L2 = ri(2, 10), M = ri(1, 5);
    let k = frac(M, Math.round(Math.sqrt(L1 * L2)));
    let { o, a: ans } = mk(`${k}`, [`${frac(M, L1 + L2)}`, `${frac(M, L1)}`, `${frac(M, L2)}`]);
    add(ch, 'single', `耦合电感L1=${L1}H, L2=${L2}H, M=${M}H，耦合系数k=`, o, ans, `k=M/√(L1L2)=${M}/√(${L1}×${L2})=${k}`, 2);
  }

  // 三相综合 (5)
  for (let i = 0; i < 5; i++) {
    let Vp = ri(100, 380), R = ri(5, 20);
    let P = frac(3 * Vp * Vp, R);
    let { o, a: ans } = mk(`${P}W`, [`${frac(Vp * Vp, R)}W`, `${frac(Vp * Vp, 3 * R)}W`, `${frac(3 * Vp, R)}W`]);
    add(ch, 'single', `对称Y-Y三相：相电压${Vp}V，每相R=${R}Ω，总功率P=`, o, ans, `P=3×Vp²/R=3×${Vp}²/${R}=${P}W`, 2);
  }
}

// ====== Module 16: 补充动态电路 (35 questions) ======
function genMoreDynamic() {
  const ch = '动态电路补充';

  // RC全响应 (10)
  for (let i = 0; i < 5; i++) {
    let v = ri(5, 20), uc0 = ri(0, 10), r = ri(2, 10), c = ri(1, 10);
    let tau = r * c;
    let final_v = v;
    let { o, a: ans } = mk(`${final_v}V`, [`${v + uc0}V`, `${v - uc0}V`, `${uc0}V`]);
    add(ch, 'single', `RC电路：E=${v}V, Uc(0)=${uc0}V, R=${r}Ω, C=${c}F，t→∞时Uc=`, o, ans, `稳态时电容开路，Uc(∞)=E=${v}V`, 2);
  }
  for (let i = 0; i < 5; i++) {
    let v = ri(5, 20), r = ri(2, 10), c = ri(1, 10);
    let tau = r * c;
    let i0 = frac(v, r);
    let { o, a: ans } = mk(`${i0}A`, [`${v * c}A`, `${frac(v, r + c)}A`, `${v}A`]);
    add(ch, 'single', `RC零状态响应：E=${v}V, R=${r}Ω, C=${c}F，t=0+时充电电流i(0+)=`, o, ans, `t=0+电容电压为零(短路)，i(0+)=E/R=${v}/${r}=${i0}A`, 2);
  }

  // RL全响应 (10)
  for (let i = 0; i < 5; i++) {
    let v = ri(5, 20), i0 = ri(0, 5), r = ri(2, 10), l = ri(1, 10);
    let final_i = frac(v, r);
    let { o, a: ans } = mk(`${final_i}A`, [`${v + i0}A`, `${frac(v, r + l)}A`, `${i0}A`]);
    add(ch, 'single', `RL电路：E=${v}V, iL(0)=${i0}A, R=${r}Ω, L=${l}H，t→∞时iL=`, o, ans, `稳态时电感短路，iL(∞)=E/R=${v}/${r}=${final_i}A`, 2);
  }
  for (let i = 0; i < 5; i++) {
    let v = ri(5, 20), r = ri(2, 10), l = ri(1, 10);
    let vL0 = v;
    let { o, a: ans } = mk(`${vL0}V`, [`${frac(v, r)}V`, `${v * l}V`, `0V`]);
    add(ch, 'single', `RL零状态响应：E=${v}V, R=${r}Ω, L=${l}H，t=0+时电感电压uL(0+)=`, o, ans, `t=0+电感电流为零(开路)，uL(0+)=E=${vL0}V`, 2);
  }

  // 时间常数与能量 (5)
  for (let i = 0; i < 3; i++) {
    let r = ri(2, 20), c = ri(1, 20);
    let tau = r * c;
    let t5tau = 5 * tau;
    let { o, a: ans } = mk(`${t5tau}s`, [`${tau}s`, `${3 * tau}s`, `${10 * tau}s`]);
    add(ch, 'single', `RC: R=${r}Ω, C=${c}F，工程上认为过渡过程结束需时间≈`, o, ans, `τ=RC=${tau}s, 5τ=${t5tau}s后基本结束`, 2);
  }
  for (let i = 0; i < 2; i++) {
    let r = ri(2, 10), l = ri(1, 10);
    let tau = frac(l, r);
    let { o, a: ans } = mk(`${tau}s`, [`${r * l}s`, `${frac(r, l)}s`, `${r + l}s`]);
    add(ch, 'single', `RL: R=${r}Ω, L=${l}H，时间常数τ=`, o, ans, `τ=L/R=${l}/${r}=${tau}s`, 1);
  }

  // 三要素法概念 (10)
  let concepts = [
    ['三要素法适用于', '一阶线性电路', ['二阶电路', '非线性电路', '高频电路']],
    ['三要素法的三要素是', '初始值、稳态值、时间常数', ['最大值、最小值、频率', '电压、电流、功率', '电阻、电感、电容']],
    ['三要素法公式f(t)=', 'f(∞)+[f(0+)-f(∞)]e^(-t/τ)', ['f(0+)e^(-t/τ)', 'f(∞)(1-e^(-t/τ))', 'f(∞)e^(-t/τ)']],
    ['一阶电路的响应由___组成', '稳态分量+暂态分量', ['仅稳态分量', '仅暂态分量', '仅自由分量']],
    ['暂态分量随时间', '指数衰减', ['线性增长', '恒定不变', '振荡']],
    ['稳态分量在直流激励下是', '常数', ['正弦量', '指数函数', '冲激函数']],
    ['强制分量是指', '与激励形式相同的响应分量', ['自由响应', '零输入响应', '暂态分量']],
    ['自由分量是指', '由电路结构和初始状态决定的响应分量', ['与激励形式相同', '稳态响应', '强制响应']],
    ['零输入响应中，激励为', '零', ['直流', '正弦', '阶跃']],
    ['零状态响应中，初始储能为', '零', ['非零', '最大', '不确定']]
  ];
  for (let a of concepts) {
    let [q, ans2, wrongs] = a;
    let { o, a: ans } = mk(ans2, wrongs.slice(0, 3));
    add(ch, 'single', q, o, ans, '', 2);
  }
}

// ====== Module 17: 正弦稳态补充 (30 questions) ======
function genMoreAC() {
  const ch = '正弦稳态补充';

  // 相量运算 (10)
  for (let i = 0; i < 5; i++) {
    let a = ri(3, 15), b = ri(2, 10), phase = ri(0, 90);
    let mag = Math.sqrt(a * a + b * b);
    let { o, a: ans } = mk(`${mag.toFixed(1)}∠${phase}°`, [`${a + b}∠${phase}°`, `${a}∠${phase}°`, `${b}∠${phase}°`]);
    add(ch, 'single', `正弦电压u=${a}sin(ωt+${phase}°)+${b}cos(ωt+${phase}°)V，用相量法求有效值相量=`, o, ans, `复数运算：模=√(${a}²+${b}²)=${mag.toFixed(1)}，幅角=${phase}°`, 2);
  }
  for (let i = 0; i < 5; i++) {
    let R = ri(3, 15), XL = ri(2, 10);
    let Zmag = Math.sqrt(R * R + XL * XL);
    let phi = Math.round(Math.atan2(XL, R) * 180 / Math.PI);
    let { o, a: ans } = mk(`${Zmag.toFixed(1)}Ω ∠${phi}°`, [`${R + XL}Ω`, `${R}Ω`, `${XL}Ω`]);
    add(ch, 'single', `RL串联：R=${R}Ω, XL=${XL}Ω，阻抗Z=`, o, ans, `Z=√(R²+XL²)∠arctan(XL/R)=${Zmag.toFixed(1)}∠${phi}°Ω`, 2);
  }

  // 功率因数补偿 (10)
  for (let i = 0; i < 5; i++) {
    let P = ri(100, 500), pf1 = 0.6, pf2 = 0.9;
    let phi1 = Math.acos(pf1);
    let phi2 = Math.acos(pf2);
    let Qc = P * (Math.tan(phi1) - Math.tan(phi2));
    let { o, a: ans } = mk(`${Qc.toFixed(0)}var`, [`${P}var`, `${P * pf1}var`, `${P * (Math.tan(phi1) + Math.tan(phi2))}var`]);
    add(ch, 'single', `负载P=${P}W，功率因数从0.6提高到0.9，需并联电容补偿的无功Qc=`, o, ans, `Qc=P(tanφ1-tanφ2)=${P}×(${Math.tan(phi1).toFixed(2)}-${Math.tan(phi2).toFixed(2)})≈${Qc.toFixed(0)}var`, 3);
  }
  for (let i = 0; i < 5; i++) {
    let S = ri(100, 500), pf1 = 0.5, pf2 = 0.8;
    let P = S * pf1;
    let phi1 = Math.acos(pf1);
    let phi2 = Math.acos(pf2);
    let Qc = P * (Math.tan(phi1) - Math.tan(phi2));
    let { o, a: ans } = mk(`${Qc.toFixed(0)}var`, [`${S}var`, `${S * pf2}var`, `${P}var`]);
    add(ch, 'single', `视在功率S=${S}VA, cosφ从0.5提至0.8，补偿无功Qc=`, o, ans, `P=S×cosφ1=${P}W, Qc=P(tanφ1-tanφ2)≈${Qc.toFixed(0)}var`, 3);
  }

  // 谐振补充 (10)
  for (let i = 0; i < 5; i++) {
    let L = ri(1, 10), C = ri(1, 10);
    let omega0 = 1 / Math.sqrt(L * C * 0.001);
    let { o, a: ans } = mk(`${omega0.toFixed(0)}rad/s`, [`${(1/(L*C*0.001)).toFixed(0)}rad/s`, `${L*C*0.001}rad/s`, `${L+C}rad/s`]);
    add(ch, 'single', `RLC串联：L=${L}mH, C=${C}μF，谐振角频率ω0=`, o, ans, `ω0=1/√(LC)=1/√(${L}m×${C}μ)≈${omega0.toFixed(0)}rad/s`, 2);
  }
  for (let i = 0; i < 5; i++) {
    let R = ri(2, 10), L = ri(1, 10), C = ri(1, 10);
    let omega0 = 1 / Math.sqrt(L * C * 0.001);
    let Q = omega0 * L * 0.001 / R;
    let { o, a: ans } = mk(`${Q.toFixed(2)}`, [`${(omega0 * C * 0.000001 / R).toFixed(2)}`, `${(R / (omega0 * L * 0.001)).toFixed(2)}`, `${(1 / Q).toFixed(2)}`]);
    add(ch, 'single', `RLC串联谐振：R=${R}Ω, L=${L}mH, C=${C}μF，品质因数Q=`, o, ans, `Q=ω0L/R=(${omega0.toFixed(0)}×${L}m)/${R}≈${Q.toFixed(2)}`, 3);
  }
}

// ====== Module 18: 三相补充 (20 questions) ======
function genMoreThreePhase() {
  const ch = '三相电路补充';

  // 功率测量 (10)
  for (let i = 0; i < 5; i++) {
    let Vl = ri(200, 400), Il = ri(5, 20), pf = 0.8;
    let P = Math.sqrt(3) * Vl * Il * pf;
    let { o, a: ans } = mk(`${P.toFixed(0)}W`, [`${Vl * Il * pf}W`, `${Vl * Il}W`, `${3 * Vl * Il}W`]);
    add(ch, 'single', `对称三相：线电压${Vl}V，线电流${Il}A，cosφ=0.8，总功率P=`, o, ans, `P=√3×Vl×Il×cosφ=1.732×${Vl}×${Il}×0.8≈${P.toFixed(0)}W`, 2);
  }
  for (let i = 0; i < 5; i++) {
    let Vp = ri(100, 220), Il = ri(5, 15), pf = 0.85;
    let P = 3 * Vp * Il * pf;
    let { o, a: ans } = mk(`${P.toFixed(0)}W`, [`${Vp * Il * pf}W`, `${Math.sqrt(3) * Vp * Il * pf}W`, `${3 * Vp * Il}W`]);
    add(ch, 'single', `对称Y形：相电压${Vp}V，线电流=${Il}A(等于相电流)，cosφ=0.85，P=`, o, ans, `Y形：Il=Ip, P=3×Vp×Ip×cosφ=3×${Vp}×${Il}×0.85≈${P.toFixed(0)}W`, 2);
  }

  // 连接方式 (10)
  let concepts = [
    ['Y形连接中线电压与相电压的关系是', '线电压=√3×相电压', ['线电压=相电压', '线电压=相电压/√3', '线电压=2×相电压']],
    ['△形连接中线电流与相电流的关系是', '线电流=√3×相电流', ['线电流=相电流', '线电流=相电流/√3', '线电流=2×相电流']],
    ['Y形连接中线电压超前对应相电压', '30°', ['60°', '90°', '0°']],
    ['△形连接中线电流滞后对应相电流', '30°', ['60°', '90°', '0°']],
    ['对称Y形连接中线电流', '等于相电流', ['是相电流的√3倍', '是相电流的1/√3倍', '为零']],
    ['对称△形连接中线电压', '等于相电压', ['是相电压的√3倍', '是相电压的1/√3倍', '为零']],
    ['不对称Y形无中线时，各相电压', '不相等', ['相等', '为零', '为额定值']],
    ['不对称Y形有中线时，各相电压', '基本相等', ['不相等', '为零', '为线电压']],
    ['中线的作用是', '使不对称负载各相电压对称', ['减小线电流', '提高功率因数', '消除谐波']],
    ['三相四线制中线的截面积通常', '小于相线', ['等于相线', '大于相线', '为零']]
  ];
  for (let a of concepts) {
    let [q, ans2, wrongs] = a;
    let { o, a: ans } = mk(ans2, wrongs.slice(0, 3));
    add(ch, 'single', q, o, ans, '', 2);
  }
}

// ====== Module 19: 二端口补充 (20 questions) ======
function genMoreTwoPort() {
  const ch = '二端口网络补充';

  // 参数关系 (10)
  let concepts = [
    ['Z参数矩阵中Z11称为', '输入端开路输入阻抗', ['输出端短路输入阻抗', '输入端短路输入阻抗', '输出端开路输出阻抗']],
    ['Z参数矩阵中Z21称为', '输入端开路转移阻抗', ['输出端短路转移阻抗', '输入端短路转移阻抗', '输出端开路转移阻抗']],
    ['Y参数矩阵中Y11称为', '输入端短路输入导纳', ['输出端开路输入导纳', '输入端开路输入导纳', '输出端短路输入导纳']],
    ['Y参数矩阵中Y21称为', '输入端短路转移导纳', ['输出端开路转移导纳', '输入端开路转移导纳', '输出端短路转移导纳']],
    ['对称二端口满足', 'Z11=Z22', ['Z12=Z21', 'Y11=Y22', 'A=D']],
    ['互易二端口满足', 'Z12=Z21', ['Z11=Z22', 'Y11=Y22', 'A=D']],
    ['互易且对称的二端口', 'Z11=Z22且Z12=Z21', ['仅Z12=Z21', '仅Z11=Z22', 'Z参数全为零']],
    ['传输参数（ABCD）中A是', '输出开路时的电压比', ['输出短路时的电流比', '输入开路时的电压比', '输入短路时的电流比']],
    ['传输参数中D的量纲是', '无量纲', ['阻抗', '导纳', '电压比']],
    ['两个二端口级联时，总传输参数矩阵为', '各传输参数矩阵之积', ['之和', '之差', '之商']]
  ];
  for (let a of concepts) {
    let [q, ans2, wrongs] = a;
    let { o, a: ans } = mk(ans2, wrongs.slice(0, 3));
    add(ch, 'single', q, o, ans, '', 2);
  }

  // 计算题 (10)
  for (let i = 0; i < 5; i++) {
    let Z11 = ri(2, 10), Z12 = ri(1, 5), Z21 = ri(1, 5), Z22 = ri(2, 10);
    let det = Z11 * Z22 - Z12 * Z21;
    let Y11 = frac(Z22, det);
    let { o, a: ans } = mk(`${Y11}S`, [`${frac(Z11, det)}S`, `${frac(Z12, det)}S`, `${frac(Z21, det)}S`]);
    add(ch, 'single', `二端口Z参数: Z11=${Z11}Ω, Z12=${Z12}Ω, Z21=${Z21}Ω, Z22=${Z22}Ω，求Y11=`, o, ans, `Y11=Z22/ΔZ=${Z22}/${det}=${Y11}S`, 3);
  }
  for (let i = 0; i < 5; i++) {
    let A = ri(1, 5), B = ri(2, 10), C = ri(1, 5), D = ri(1, 5);
    let det = A * D - B * C;
    let { o, a: ans } = mk(`${det}`, [`${A + D}`, `${B + C}`, `${A * D}`]);
    add(ch, 'single', `传输参数: A=${A}, B=${B}Ω, C=${C}S, D=${D}，求ΔT=AD-BC=`, o, ans, `ΔT=A×D-B×C=${A}×${D}-${B}×${C}=${det}`, 2);
  }
}

// ====== Module 20: 拉氏变换补充 (25 questions) ======
function genMoreLaplace() {
  const ch = '拉普拉斯变换补充';

  // 变换对 (10)
  let pairs = [
    ['L{1}=1/s的函数是', '单位阶跃函数u(t)', ['单位冲激函数δ(t)', '指数函数e^(-at)', '正弦函数sin(ωt)']],
    ['L{δ(t)}=', '1', ['1/s', 's', '1/s²']],
    ['L{e^(-at)}=', '1/(s+a)', ['1/s', 's/(s+a)', '1/(s-a)']],
    ['L{t}=1/s²对应的时间函数是', '单位斜坡函数t·u(t)', ['阶跃函数', '冲激函数', '指数函数']],
    ['L{sin(ωt)}=', 'ω/(s²+ω²)', ['s/(s²+ω²)', '1/(s²+ω²)', 'ω/(s+ω)']],
    ['L{cos(ωt)}=', 's/(s²+ω²)', ['ω/(s²+ω²)', '1/(s²+ω²)', 's/(s+ω²)']],
    ['L{e^(-at)sin(ωt)}=', 'ω/((s+a)²+ω²)', ['ω/(s²+ω²)', 'ω/((s-a)²+ω²)', '(s+a)/((s+a)²+ω²)']],
    ['L{e^(-at)cos(ωt)}=', '(s+a)/((s+a)²+ω²)', ['s/(s²+ω²)', '(s-a)/((s-a)²+ω²)', 'ω/((s+a)²+ω²)']],
    ['L{df(t)/dt}=', 'sF(s)-f(0+)', ['F(s)/s', 'sF(s)', 'F(s)-f(0+)']],
    ['L{∫f(t)dt}=', 'F(s)/s', ['sF(s)', 'sF(s)-f(0+)', 'F(s)×s']]
  ];
  for (let a of pairs) {
    let [q, ans2, wrongs] = a;
    let { o, a: ans } = mk(ans2, wrongs.slice(0, 3));
    add(ch, 'single', q, o, ans, '', 3);
  }

  // 电路s域分析 (8)
  for (let i = 0; i < 4; i++) {
    let R = ri(2, 10), L = ri(1, 10);
    let Zs = `${R}+${L}s`;
    let { o, a: ans } = mk(`${Zs}`, [`${R}+${L}/s`, `${R}s+${L}`, `${R}+${L}s²`]);
    add(ch, 'single', `RL串联在s域中的阻抗Z(s)=`, o, ans, `R在s域为R，L在s域为Ls，Z(s)=R+Ls=${Zs}`, 2);
  }
  for (let i = 0; i < 4; i++) {
    let R = ri(2, 10), C = ri(1, 10);
    let Zs = `${R}+1/(${C}s)`;
    let { o, a: ans } = mk(`${Zs}`, [`${R}+${C}s`, `${R}+${C}/s`, `${R}s+1/${C}`]);
    add(ch, 'single', `RC串联在s域中的阻抗Z(s)=`, o, ans, `R在s域为R，C在s域为1/(Cs)，Z(s)=R+1/(Cs)`, 2);
  }

  // 初始值 (7)
  let concepts = [
    ['s域分析中，电感L的初始电流iL(0)对应的附加源为', '电压源LiL(0)', ['电流源LiL(0)', '电压源CvC(0)', '电流源CvC(0)']],
    ['s域分析中，电容C的初始电压uC(0)对应的附加源为', '电压源uC(0)/s', ['电流源CvC(0)', '电压源LiL(0)', '电流源LiL(0)']],
    ['电感在s域的串联模型包括', 'Ls和电压源LiL(0)串联', ['Ls和电流源并联', '1/(Ls)和电压源并联', 'L/s和电压源串联']],
    ['电容在s域的并联模型包括', 'Cs和电流源CvC(0)并联', ['Cs和电压源串联', '1/(Cs)和电流源串联', 'C/s和电压源并联']],
    ['零初始条件下，电感s域阻抗为', 'Ls', ['1/(Ls)', 'L/s', 'L']],
    ['零初始条件下，电容s域阻抗为', '1/(Cs)', ['Cs', 'C/s', '1/C']],
    ['s域分析中，网络函数H(s)定义为', '零状态响应的s域与输入的s域之比', ['输出功率与输入功率之比', '输出电压与输入电流之比', '总响应与输入之比']]
  ];
  for (let a of concepts) {
    let [q, ans2, wrongs] = a;
    let { o, a: ans } = mk(ans2, wrongs.slice(0, 3));
    add(ch, 'single', q, o, ans, '', 3);
  }
}

// ====== Module 21: 基础补充题 (35 questions) ======
function genMoreBasic() {
  const ch = '电路基础补充';

  // 更多欧姆定律 (10)
  for (let i = 0; i < 5; i++) {
    let R = ri(2, 20), I = ri(1, 10);
    let P = I * I * R;
    let { o, a: ans } = mk(`${P}W`, [`${I * R}W`, `${R * R * I}W`, `${frac(I, R)}W`]);
    add(ch, 'single', `R=${R}Ω, I=${I}A，功率P=I²R=`, o, ans, `P=I²R=${I}²×${R}=${P}W`, 1);
  }
  for (let i = 0; i < 5; i++) {
    let V = ri(3, 24), R = ri(2, 20);
    let P = frac(V * V, R);
    let { o, a: ans } = mk(`${P}W`, [`${V * R}W`, `${frac(V, R * R)}W`, `${frac(V * R, 2)}W`]);
    add(ch, 'single', `R=${R}Ω, U=${V}V，功率P=U²/R=`, o, ans, `P=U²/R=${V}²/${R}=${P}W`, 1);
  }

  // 节点电压法 (10)
  for (let i = 0; i < 5; i++) {
    let v1 = ri(5, 20), v2 = ri(5, 20), r1 = ri(2, 10), r2 = ri(2, 10), r3 = ri(2, 10);
    let g1 = frac(1, r1), g2 = frac(1, r2), g3 = frac(1, r3);
    let un = frac(v1 * r2 * r3 + v2 * r1 * r3, r1 * r2 + r1 * r3 + r2 * r3);
    let { o, a: ans } = mk(`${un}V`, [`${frac(v1 + v2, 2)}V`, `${frac(v1 * r1 + v2 * r2, r1 + r2)}V`, `${frac(v1, r1)}V`]);
    add(ch, 'single', `节点法：V1=${v1}V经R1=${r1}Ω, V2=${v2}V经R2=${r2}Ω, R3=${r3}Ω接地，节点电压Un=`, o, ans, `Un=(V1/R1+V2/R2)/(1/R1+1/R2+1/R3)=${un}V`, 2);
  }
  for (let i = 0; i < 5; i++) {
    let v1 = ri(5, 20), r1 = ri(2, 10), r2 = ri(2, 10);
    let un = frac(v1 * r2, r1 + r2);
    let { o, a: ans } = mk(`${un}V`, [`${frac(v1 * r1, r1 + r2)}V`, `${v1}V`, `${frac(v1, 2)}V`]);
    add(ch, 'single', `分压：V1=${v1}V, R1=${r1}Ω串R2=${r2}Ω，R2两端电压U2=`, o, ans, `分压：U2=V1×R2/(R1+R2)=${v1}×${r2}/${r1+r2}=${un}V`, 1);
  }

  // 网孔电流法 (5)
  for (let i = 0; i < 5; i++) {
    let v1 = ri(5, 20), v2 = ri(5, 20), r1 = ri(2, 10), r2 = ri(2, 10), r3 = ri(2, 10);
    let im = frac(v1 * r2 - v2 * r1, r1 * r2 + r1 * r3 + r2 * r3);
    let { o, a: ans } = mk(`${im}A`, [`${frac(v1, r1 + r3)}A`, `${frac(v2, r2 + r3)}A`, `${frac(v1 + v2, r1 + r2)}A`]);
    add(ch, 'single', `网孔法：回路1 E1=${v1}V, R1=${r1}Ω, R3=${r3}Ω; 回路2 E2=${v2}V, R2=${r2}Ω, R3共用，公共电阻R3电流I=`, o, ans, `两个网孔联立求解，I_R3=(E1R2-E2R1)/(R1R2+R1R3+R2R3)=${im}A`, 3);
  }

  // 基础概念 (10)
  let concepts = [
    ['电压的单位是', '伏特(V)', ['安培(A)', '瓦特(W)', '欧姆(Ω)']],
    ['电流的单位是', '安培(A)', ['伏特(V)', '瓦特(W)', '欧姆(Ω)']],
    ['功率的单位是', '瓦特(W)', ['伏特(V)', '安培(A)', '欧姆(Ω)']],
    ['能量的单位是', '焦耳(J)', ['瓦特(W)', '伏特(V)', '安培(A)']],
    ['1度电等于', '1kWh=3.6×10^6J', ['1Wh', '1J', '1kW']],
    ['电压表内阻应', '很大', ['很小', '为零', '等于被测电阻']],
    ['电流表内阻应', '很小', ['很大', '无穷大', '等于被测电阻']],
    ['电压测量时电压表应', '并联', ['串联', '短接', '断开']],
    ['电流测量时电流表应', '串联', ['并联', '短接', '断开']],
    ['理想电压源的内阻为', '0', ['无穷大', '有限值', '不确定']]
  ];
  for (let a of concepts) {
    let [q, ans2, wrongs] = a;
    let { o, a: ans } = mk(ans2, wrongs.slice(0, 3));
    add(ch, 'single', q, o, ans, '', 1);
  }
}

// ====== Module 22: 等效变换补充 (20 questions) ======
function genMoreEquivalent() {
  const ch = '等效变换补充';

  // Y-Δ补充 (5)
  for (let i = 0; i < 5; i++) {
    let r12 = ri(3, 15), r23 = ri(3, 15), r31 = ri(3, 15);
    let sum = r12 + r23 + r31;
    let r1 = frac(r12 * r31, sum);
    let { o, a: ans } = mk(`${r1}Ω`, [`${frac(r12 * r23, sum)}Ω`, `${frac(r23 * r31, sum)}Ω`, `${r12}Ω`]);
    add(ch, 'single', `△→Y：R12=${r12}Ω, R23=${r23}Ω, R31=${r31}Ω，Y形R1（接12和31）=`, o, ans, `R1=R12×R31/(R12+R23+R31)=${r12}×${r31}/${sum}=${r1}Ω`, 3);
  }

  // 电源等效 (5)
  for (let i = 0; i < 5; i++) {
    let V = ri(5, 20), R = ri(2, 10);
    let I = frac(V, R);
    let { o, a: ans } = mk(`${I}A`, [`${V * R}A`, `${frac(V, R + 1)}A`, `${frac(V + R, 2)}A`]);
    add(ch, 'single', `电压源E=${V}V串R=${R}Ω等效为电流源，I=`, o, ans, `I=E/R=${V}/${R}=${I}A`, 2);
  }
  for (let i = 0; i < 5; i++) {
    let I = ri(1, 10), R = ri(2, 10);
    let V = I * R;
    let { o, a: ans } = mk(`${V}V`, [`${frac(I, R)}V`, `${I + R}V`, `${I * R * R}V`]);
    add(ch, 'single', `电流源I=${I}A并R=${R}Ω等效为电压源，E=`, o, ans, `E=I×R=${I}×${R}=${V}V`, 2);
  }

  // 概念 (5)
  let concepts = [
    ['等效变换是指', '对外特性相同的电路替换', ['内部结构相同', '功率相同', '电压相同']],
    ['两种电路等效的条件是', '外特性（端口V-I关系）相同', ['内部电流相同', '内部电压相同', '功率相同']],
    ['电压源串联等效为', '一个电压源（代数和）', ['一个电流源', '两个电压源', '零值']],
    ['电流源并联等效为', '一个电流源（代数和）', ['一个电压源', '两个电流源', '零值']],
    ['电压源并联电阻时对外', '仍等效为电压源', ['变为电流源', '功率不变', '阻抗变化']]
  ];
  for (let a of concepts) {
    let [q, ans2, wrongs] = a;
    let { o, a: ans } = mk(ans2, wrongs.slice(0, 3));
    add(ch, 'single', q, o, ans, '', 2);
  }
}

// ====== Generate all ======
genBasic();
genEquivalent();
genTheorems();
genDynamic();
genAC();
genCoupling();
genThreePhase();
genTwoPort();
genLaplace();
genConcepts();
genNetworkGraph();
genNonlinear();
genTransferFunc();
genAdvancedTheorem();
genComprehensive();
genMoreDynamic();
genMoreAC();
genMoreThreePhase();
genMoreTwoPort();
genMoreLaplace();
genMoreBasic();
genMoreEquivalent();

// ====== Generate SQL ======
function genSql() {
  let sql = '-- ' + '='.repeat(44) + '\n';
  sql += '-- 考研电路题库 (北交大870, 1000+题)\n';
  sql += '-- 模块: 电路定律/等效变换/定理/动态电路/正弦稳态/耦合电感/三相/二端口/拉氏变换\n';
  sql += '-- 难度: 1=基础, 2=中等, 3=进阶\n';
  sql += '-- ' + '='.repeat(44) + '\n\n';
  let batchSize = 15;
  for (let i = 0; i < Q.length; i += batchSize) {
    let batch = Q.slice(i, i + batchSize);
    sql += 'INSERT INTO questions (subject, chapter, type, question, options, answer, explanation, difficulty) VALUES\n';
    for (let j = 0; j < batch.length; j++) {
      let q = batch[j];
      sql += `('circuit', '${esc(q.ch)}', '${q.t}', '${esc(q.q)}', '${esc(q.o)}', '${esc(q.a)}', '${esc(q.e)}', ${q.d})`;
      sql += j < batch.length - 1 ? ',\n' : ';\n\n';
    }
  }
  return sql;
}

let sqlOutput = genSql();
fs.writeFileSync('seed_circuit_1000.sql', sqlOutput);
console.log(`Generated ${Q.length} questions`);
let d1 = Q.filter(q => q.d === 1).length;
let d2 = Q.filter(q => q.d === 2).length;
let d3 = Q.filter(q => q.d === 3).length;
console.log(`Difficulty: 基础=${d1} (${Math.round(d1/Q.length*100)}%), 中等=${d2} (${Math.round(d2/Q.length*100)}%), 进阶=${d3} (${Math.round(d3/Q.length*100)}%)`);