# 修改日志 (CHANGELOG)

> 版本规则：**大改动**（新增功能、架构变更）→ 主版本号 +1；**小改动**（Bug 修复、细节优化）→ 次版本号 +1。
> 版本号常量位于 `src/constants.ts`（v3.0.0 前位于 `index.html` 顶部），管理页底部实时显示。
> 注：GitHub 端副本受 MCP 单次推送体量限制为精要版（自 v4.5.5 起旧版本节进一步压缩精要，压缩前完整精要原文见历史提交 `d756221`）；v4.3.0 及更早版本记录见 `CHANGELOG-archive.md`；完整权威记录以仓库本地 `CHANGELOG.md` 与各 `*.changelog.log` 为准。

---

## v4.6.0（2026-09-01）刷题中途退出支持已刷题目记录保存（退出小结页 + 继续作答）

> 版本说明：**次版本号 +1**（功能增强，沿袭 v3.9.0 / v4.1.0 / v4.5.0「功能增强 = 次版本 +1」先例）。
- **问题与方案**：逐题记录本经 `recordResult` 实时持久化（`kaoyan_records` / `kaoyan_today_*` / `kaoyan_wrongBook` + Supabase 云同步），退出从未丢记录；真实病灶是旧退出 confirm 文案「当前进度将丢失」误导用户，且退出静默回首页无保存确认。
- **退出新流程**（`src/ui/quiz.ts`）：已答 >0 点 ← 渲染**退出小结页**（`renderQuitSummary`）——「✓ 已答 N 题，作答记录已保存」+ 已答/正确/错误/正确率 + [继续作答（剩 N 题）] + [返回首页]；0 已答直接回首页（保持冒烟脚本兼容）。
- **续答防重复**：`resumeQuiz` 以 `index < correct + wrong` 判定当前题已有结果，续答先 `index++`；`pendingEssay`（简答已提交未自评）不计已答，退出/续答时清空。
- **main.ts**：windowApi 新增 `resumeQuiz` / `confirmQuit`。
- **版本**：APP_VERSION v4.5.5→v4.6.0，sw 缓存 `kaoyan-v4.6.0`。
- **验证**：typecheck / 34 项测试 / build（`index-VgODQdkU.js` 594.09 kB）全过；冒烟 `SMOKE_EXIT=0` 全绿；专项脚本 `_verify_quit_v460.cjs`（Playwright + Edge）六场景全绿 `VERIFY_EXIT=0`——答 3 题（含反馈态）退出→小结页 + records 恰 3 条、续答正确跳第 4 题无残留反馈、再答 1 题退出→4 条记录、确认退出回首页、0 已答退出直接回首页、零 JS 报错。
- **部署（阻断）**：Netlify 部署被账户额度阻断（`Account credit usage exceeded - new deploys are blocked until credits are added`，与 v4.5.5 相同）；`dist-deploy.zip`（70 文件 / 0 反斜杠 / 1,093,133 B）已就绪，待额度恢复重发；线上暂保持 v4.5.4。
- **GitHub 同步**：constants.ts + sw.js（`109f19e`）、main.ts（`6f7c61b`）、quiz.ts 渐进覆盖三批定稿（`1bf3d4d`→`f44815b`→`ef2a7e7`，中途误增占位文件已于 `ffc816b` 删除）。

---

## v4.5.5（2026-09-01）题库大增量：电路考研真题风格 2015-2024 共 140 题，总量 11,488 → 11,628

> 版本说明：**次版本号 +1**（题库数据大增量，沿袭 v4.2.0 / v4.5.3 / v4.5.4「题库大增量 = 次版本 +1」先例；功能 / 架构 / UI 零变化）。
- **版权边界声明**：不复现考研真题原文；电路题库为「真题风格」原创题——题型、考点分布、难度梯度、设问风格对齐真题体系，题干选项全部原创，答案参数化程序精确计算；source 标注 `{年份}真题风格题`。
- **电路真题风格题库**（新增 `gen_real_circuit.js`，seed=87015）：每年 14 题 × 10 年（2015-2024）覆盖 8 个规范章节（电路模型与电路定律 / 电阻电路等效变换 / 电路定理 / 正弦稳态分析 / 动态电路分析 / 耦合电感与变压器 / 三相电路 / 二端口网络）：串联欧姆定律、并联等效电阻、功率 I²R、叠加定理、戴维宁负载电流与最大功率、阻抗模勾股数组、平均功率 UIcosφ、串联谐振、时间常数 τ=RC、换路定律 uC(0+)=uC(0−)、耦合系数 k=M/√(L1L2)、三相 UL=√3UP、二端口 Z12；`genYear(year, yi)` 主参数年份索引偏移防撞，零碰撞零去重丢弃。
- **集成**：`integrate_all.py` 注册 `seed_real_circuit.sql`（9 字段行内带 source）；`seed_all_final.sql` 重生成：总题量 11,488 → **11,628**（净增 140）；电路 1,509 → 1,649。
- **版本**：APP_VERSION v4.5.4→v4.5.5，sw 缓存 `kaoyan-v4.5.5`。
- **验证**：种子 3 个 INSERT 块、行数 140、选项 JSON 反斜杠 0；`_scan_json.py` 全库扫描 TOTAL 11628 BAD 0；build（含 tsc）通过（产物 `index-5bLCMhYt.js` 592.80 kB / `index-B5sdtsNa.css`）。
- **数据导入**：Supabase 导入 234 块全绿（`OK=234 Failed=0`），DB 总量 **11,628**（政治 6,618 / 数学二 2,087 / 电路 1,649 / 英语二 1,274）；来源核验：2015-2019 真题风格题每年 60（数学/英语 46 + 电路 14）、2020-2024 每年 14（电路）；新增 140 题线上即刻可刷。
- **部署（取消补发）**：Netlify 部署被账户额度阻断（`Account credit usage exceeded - new deploys are blocked until credits are added`）；用户决定本版前端无实质变化（仅版本号与 sw 缓存名），不补发——线上保持 v4.5.4，新题经 Supabase 运行时拉取即刻可刷；规则固化：前端无实质变化的纯数据增量版本一律跳过部署。
- **GitHub 同步**：sw.js+constants.ts（`77cf1d6`）、integrate_all.py（`184e633`）、gen_real_circuit.js（`33e0602`）、CHANGELOG 精要定稿（`feee560`，期间多次修复节丢失并将旧版本节压缩精要，压缩前原文见 `d756221`）、integrate_all.py 等价重构修复（`f93f9ac`：三引号 schema 块改行数组拼接，修复批2 推送损坏，重跑输出与修复前逐字节一致）；`_verify_gh_v455.cjs` 验证 ALL_OK；seed_real_circuit.sql（41.1 KB）超 MCP 单次推送上限，不入 GitHub，权威记录以本地为准。
