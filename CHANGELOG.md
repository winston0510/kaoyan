# 修改日志 (CHANGELOG)

> 版本规则：**大改动**（新增功能、架构变更）→ 主版本号 +1；**小改动**（Bug 修复、细节优化）→ 次版本号 +1。
> 版本号常量位于 `src/constants.ts`（v3.0.0 前位于 `index.html` 顶部），管理页底部实时显示。
> 注：GitHub 端副本受 MCP 单次推送体量限制为精要版（自 v4.5.5 起旧版本节进一步压缩精要，压缩前完整精要原文见历史提交 `d756221`）；v4.3.0 及更早版本记录见 `CHANGELOG-archive.md`；完整权威记录以仓库本地 `CHANGELOG.md` 与各 `*.changelog.log` 为准。

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

---

## v4.5.4（2026-09-01）题库大增量：名师典型 147 + 2015-2019 真题风格题（数学 110 / 英语 120），总量 11,118 → 11,488（精要压缩版）

> 完整记录见本地 `CHANGELOG.md` v4.5.4 节与 `release_v4.5.4.changelog.log`；压缩前精要原文见历史提交 `d756221`。
- 数学二名师典型 147 题（`gen_teacher_math2.js`：张宇 50 / 武忠祥 51 / 汤家凤 46，入库 140）+ 2015-2019 真题风格数学 110 题（`gen_real_math_2015_2019.js`）与英语二 120 题（`gen_real_english_2015_2019.js`）；净增 370（输入 377 去重 7）；版权边界：均为原创风格题。
- 部署 `6a9611f467486800d14f509d` ready；Supabase 导入 `OK=232 Failed=0`，DB 11,488（政治 6,618 / 数学二 2,087 / 电路 1,509 / 英语二 1,274）。
- 同步 `f03bb49` / `1dd3be7` / `427a6c2` / `d0d5d20` / `d756221`；gen_real_english_2015_2019.js（31.9 KB）与三种子 SQL 超推送上限不入 GitHub。

---

## v4.5.3（2026-08-31）题库大增量：电路 +410 / 数学二 +493（总量 10,215 → 11,118）（精要压缩版）

> 完整记录见本地 `CHANGELOG.md` v4.5.3 节。
- 电路强化 424→410 题（`gen_circuit_adv.js` 8 模块 10 章）+ 数学二强化 508→493 题（`gen_math2_adv.js` 12 模块）；新增判断题两选项助手 `mkj`；选项 JSON 单反斜杠转义缺陷修复（`_fix_json_escape.py`，`_scan_json.py` BAD 0）。
- 部署 `6a95a221dc2a2ce2e232554f` ready；Supabase 导入 `OK=225 Failed=0`，DB 11,118；PAT 留存仓库外 `.local`。
- 同步 `67c878c` / `9e51f12` / `3f8f873` / `c409354`；种子 SQL（各 90-100 KB）超上限不入 GitHub。

---

## v4.5.2（2026-08-31）修复暗模式状态栏仍白（启动期 meta 写入 null 缺陷）（精要压缩版）

> 完整记录见本地 `CHANGELOG.md` v4.5.2 节。
- `theme-color` / `status-bar-style` 两枚 meta 移至内联脚本前，修复 iOS 暗色启动恒读静态 `default` 白条；静态值保持亮色默认。
- 部署 `6a9592f40869cda72f1037c0` ready；同步 `54a9b6c` / `fb96245`；`css/style.css` 超上限不入 GitHub。

---

## v4.5.1（2026-08-31）亮色顶栏纯白消接缝 + theme-color 亮统一 #FFFFFF（精要压缩版）

> 完整记录见本地 `CHANGELOG.md` v4.5.1 节。
- 新增令牌 `--topbar-bg`，亮色顶栏纯白与 iOS 白状态栏无缝融合；manifest `theme_color` `#4B3FE3`→`#FFFFFF`，Android 亮色工具栏同步纯白。
- 部署 `6a958a5aabc0ce50fe29079d` ready；同步 `c17eff3` / `e735fd1` / `d6de3a1`。

---

## v4.5.0（2026-08-31）APP 化交互细节 + 状态栏跟随主题（standalone 顶部白条修复）（精要压缩版）

> 完整记录见本地 `CHANGELOG.md` v4.5.0 节。
- 状态栏样式暗 `black-translucent` / 亮 `default` 动态分流 + 启动期双 meta 同步消白闪；`touch-action:manipulation` / `overscroll-behavior-y:none` / `100dvh` / 按压反馈等 APP 化细节；TabBar 滚动位记忆与 hash 深链；manifest shortcuts。
- 部署 `6a957aaf9a9104806fc38746` ready；同步 `b2f132f` / `5c855cb` / `6ef1a30` 等；`css/style.css` 超上限不入 GitHub。

---

## v4.4.0（2026-08-31）布局风格优化：悬浮胶囊标签栏 + 三槽顶栏 + 2×2 彩色瓦片（精要压缩版）

> 完整记录见本地 `CHANGELOG.md` v4.4.0 节。
- 悬浮胶囊底部标签栏、`tb-left/tb-center/tb-right` 三槽顶栏与 `.tb-btn` 圆钮、2×2 彩色统计瓦片 `--tile1..4`、区块头 chips、卡片扁平化（参考 iOS 记账应用风格）。
- 部署 `6a9572f2b8459da15276d3ba` ready；同步 `e01712c` / `20c55cb` / `9ea25a0`。
