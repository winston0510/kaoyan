import fs from 'node:fs';

const Q = [];
const seen = new Set();
let seed = 87015;
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

const CH_LAW = '电路模型与电路定律';
const CH_EQ = '电阻电路等效变换';
const CH_THM = '电路定理';
const CH_AC = '正弦稳态分析';
const CH_DYN = '动态电路分析';
const CH_CPL = '耦合电感与变压器';
const CH_3PH = '三相电路';
const CH_2P = '二端口网络';

function genYear(year, yi) {
  const src = `${year}真题风格题`;

  let R1 = yi + 2, R2 = yi + 4, K = yi + 1;
  let U = (R1 + R2) * K;
  let m1 = mk(`${K}A`, [`${K + 1}A`, `${K - 1 >= 1 ? K - 1 : K + 2}A`, frac(U, R1) + 'A']);
  add(CH_LAW, 'single', `直流电路中，电阻R1=${R1}Ω与R2=${R2}Ω串联后接于电压源U=${U}V，则回路电流为（　　）`, m1.o, m1.a, `串联总电阻R1+R2=${R1 + R2}Ω，由欧姆定律I=U/(R1+R2)=${U}/${R1 + R2}=${K}A。`, 1, src);

  let R3 = yi + 2, R4 = yi + 3;
  let Req = frac(R3 * R4, R3 + R4);
  let m2 = mk(`${Req}Ω`, [`${R3 + R4}Ω`, `${frac(R3 + R4, 2)}Ω`, `${frac(R3 * R4, 2 * (R3 + R4))}Ω`]);
  add(CH_EQ, 'single', `将电阻R1=${R3}Ω与R2=${R4}Ω并联，其等效电阻为（　　）`, m2.o, m2.a, `并联等效电阻Req=R1R2/(R1+R2)=${R3 * R4}/${R3 + R4}=${Req}Ω。`, 1, src);

  let R5 = yi + 3, I5 = yi + 1;
  let P5 = I5 * I5 * R5;
  let m3 = mk(`${P5}W`, [`${I5 * R5}W`, `${frac(P5, 2)}W`, `${I5 * R5 * R5}W`]);
  add(CH_EQ, 'single', `电阻R=${R5}Ω中流过电流I=${I5}A，则该电阻吸收的功率为（　　）`, m3.o, m3.a, `P=I²R=${I5}²×${R5}=${P5}W。`, 1, src);

  let Ia = yi + 2, Ib = yi + 1;
  let m4 = mk(`${Ia + Ib}A`, [`${Ia - Ib}A`, `${Ib - Ia}A`, `${Ia}A`]);
  add(CH_THM, 'single', `含两个独立源的线性电阻电路中，电压源US单独作用时某支路电流I′=${Ia}A，电流源IS单独作用时I″=${Ib}A（方向均与I参考方向一致），则两源共同作用时I为（　　）`, m4.o, m4.a, `叠加定理：I=I′+I″=${Ia}+${Ib}=${Ia + Ib}A。`, 2, src);

  let Uoc = 2 * (yi + 3), Req2 = yi + 2, RL2 = yi + 4;
  let I2 = frac(Uoc, Req2 + RL2);
  let m5 = mk(`${I2}A`, [`${frac(Uoc, Req2)}A`, `${frac(Uoc, RL2)}A`, `${frac(Uoc, Req2 + RL2 + 2)}A`]);
  add(CH_THM, 'single', `某线性含源一端口网络的戴维宁等效电路为Uoc=${Uoc}V、Req=${Req2}Ω，端口接负载电阻RL=${RL2}Ω，则负载电流为（　　）`, m5.o, m5.a, `I=Uoc/(Req+RL)=${Uoc}/(${Req2}+${RL2})=${I2}A。`, 2, src);

  let Uoc3 = 2 * (yi + 3), Req3 = yi + 2;
  let Pmax = frac(Uoc3 * Uoc3, 4 * Req3);
  let m6 = mk(`${Pmax}W`, [`${frac(Uoc3 * Uoc3, Req3)}W`, `${frac(Uoc3 * Uoc3, 2 * Req3)}W`, `${frac(Uoc3 * Uoc3, 8 * Req3)}W`]);
  add(CH_THM, 'single', `某线性含源一端口网络的戴维宁等效参数为Uoc=${Uoc3}V、Req=${Req3}Ω，其端口所接负载可获得的最大功率为（　　）`, m6.o, m6.a, `RL=Req时获最大功率：Pmax=Uoc²/(4Req)=${Uoc3}²/(4×${Req3})=${Pmax}W。`, 2, src);

  let mt = yi + 1;
  let Rz = 3 * mt, Xz = 4 * mt, Zz = 5 * mt;
  let m7 = mk(`${Zz}Ω`, [`${Rz + Xz}Ω`, `${Xz - Rz}Ω`, `${6 * mt}Ω`]);
  add(CH_AC, 'single', `电阻R与电感L串联的正弦电路中，R=${Rz}Ω，感抗XL=${Xz}Ω，则电路输入阻抗的模为（　　）`, m7.o, m7.a, `|Z|=√(R²+XL²)=√(${Rz * Rz}+${Xz * Xz})=√${Rz * Rz + Xz * Xz}=${Zz}Ω。`, 2, src);

  let Uu = 10 * (yi + 2), Iu = yi + 1;
  let P8 = 8 * (yi + 2) * (yi + 1);
  let m8 = mk(`${P8}W`, [`${Uu * Iu}W`, `${6 * (yi + 2) * (yi + 1)}W`, `${5 * (yi + 2) * (yi + 1)}W`]);
  add(CH_AC, 'single', `某一端口网络端电压有效值U=${Uu}V，电流有效值I=${Iu}A，功率因数cosφ=0.8，则该网络吸收的平均功率为（　　）`, m8.o, m8.a, `P=UIcosφ=${Uu}×${Iu}×0.8=${P8}W。`, 2, src);

  let R9 = yi + 5;
  let m9 = mk(`${R9}Ω`, ['0Ω', `${2 * R9}Ω`, '无穷大']);
  add(CH_AC, 'single', `RLC串联电路中，R=${R9}Ω，电路发生谐振时其输入阻抗的模为（　　）`, m9.o, m9.a, `串联谐振时感抗与容抗相互抵消，电路呈纯电阻性，|Z|=R=${R9}Ω。`, 2, src);

  let Rd = 2 * (yi + 2), Cd = yi + 3;
  let tau = Rd * Cd;
  let m10 = mk(`${tau}s`, [`${frac(Rd, Cd)}s`, `${frac(Cd, Rd)}s`, `${frac(1, Rd * Cd)}s`]);
  add(CH_DYN, 'single', `一阶RC电路中，电阻R=${Rd}Ω，电容C=${Cd}F，则该电路的时间常数τ为（　　）`, m10.o, m10.a, `RC电路时间常数τ=RC=${Rd}×${Cd}=${tau}s。`, 1, src);

  let Usw = 2 * yi + 7;
  let m11 = mk(`${Usw}V`, ['0V', `${frac(Usw, 2)}V`, `${-Usw}V`]);
  add(CH_DYN, 'single', `电路换路前已处于稳态，换路前电容电压uC(0−)=${Usw}V，则换路后瞬间uC(0+)为（　　）`, m11.o, m11.a, `换路定律：电容电压不能跃变，uC(0+)=uC(0−)=${Usw}V。`, 1, src);

  let scale = yi + 1, p = yi % 5 + 1;
  let L1 = 4 * scale, L2 = 9 * scale, M = p * scale;
  let k = frac(p, 6);
  let m12 = mk(k, [frac(p, 4), frac(p, 2), frac(p, 8)]);
  add(CH_CPL, 'single', `两耦合电感L1=${L1}H、L2=${L2}H，互感M=${M}H，则耦合系数k为（　　）`, m12.o, m12.a, `k=M/√(L1L2)=${M}/√(${L1}×${L2})=${M}/${6 * scale}=${k}。`, 2, src);

  let UP = 100 * (yi + 2);
  let UL = Math.round(UP * 1.732);
  let m13 = mk(`${UL}V`, [`${UP}V`, `${2 * UP}V`, `${3 * UP}V`]);
  add(CH_3PH, 'single', `对称三相星形联接电路中，相电压有效值UP=${UP}V，则线电压有效值约为（　　）`, m13.o, m13.a, `星接对称三相电路中线电压为相电压的√3倍：UL=√3×${UP}≈${UL}V。`, 1, src);

  let Rp = yi + 5;
  let m14 = mk(`${Rp}Ω`, ['0Ω', `${frac(Rp, 2)}Ω`, `${2 * Rp}Ω`]);
  add(CH_2P, 'single', `某二端口网络仅由一只电阻R=${Rp}Ω跨接于两端口之间构成，其Z参数矩阵中的Z12为（　　）`, m14.o, m14.a, `由KVL得U1=R(I1+I2)，与U1=Z11I1+Z12I2比较得Z12=R=${Rp}Ω。`, 2, src);
}

for (let yi = 0; yi < 10; yi++) genYear(2015 + yi, yi);

let sql = '';
const batch = 50;
for (let i = 0; i < Q.length; i += batch) {
  const part = Q.slice(i, i + batch);
  sql += 'INSERT INTO questions (subject, chapter, type, question, options, answer, explanation, difficulty, source) VALUES\n';
  part.forEach((q, j) => {
    sql += `('circuit', '${esc(q.ch)}', '${q.t}', '${esc(q.q)}', '${esc(q.o)}', '${esc(q.a)}', '${esc(q.e)}', ${q.d}, '${esc(q.src)}')${j < part.length - 1 ? ',' : ';'}\n`;
  });
  sql += '\n';
}
fs.writeFileSync('seed_real_circuit.sql', sql);
console.log(`Generated ${Q.length} questions`);
for (let y = 2015; y <= 2024; y++) console.log(`${y}=${Q.filter(q => q.src === `${y}真题风格题`).length}`);
const chapters = {};
Q.forEach(q => { chapters[q.ch] = (chapters[q.ch] || 0) + 1; });
console.log(chapters);
