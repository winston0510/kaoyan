# 修改日志 (CHANGELOG)

> 版本规则：**大改动**（新增功能、架构变更）→ 主版本号 +1；**小改动**（Bug 修复、细节优化）→ 次版本号 +1。
> 版本号常量位于 `src/constants.ts`（v3.0.0 前位于 `index.html` 顶部），管理页底部实时显示。
> 注：GitHub 端副本受 MCP 单次推送体量限制为精要版；v4.3.0 及更早版本记录见 `CHANGELOG-archive.md`；完整权威记录以仓库本地 `CHANGELOG.md` 与各 `*.changelog.log` 为准。

---

## v4.5.5（2026-09-01）题库大增量：电路考研真题风格 2015-2024 共 140 题，总量 11,488 → 11,628

> 版本说明：**次版本号 +1**（题库数据大增量，沿袭 v4.2.0 / v4.5.3 / v4.5.4「题库大增量 = 次版本 +1」先例；功能 / 架构 / UI 零变化）。
- **版权边界声明**：不复现考研真题原文；电路题库为「真题风格」原创题——题型、考点分布、难度梯度、设问风格对齐真题体系，题干选项全部原创，答案参数化程序精确计算；source 标注 `{年份}真题风格题`。
- **电路真题风格题库**（新增 `gen_real_circuit.js`，seed=87015）：每年 14 题 × 10 年（2015-2024）覆盖 8 个规范章节（电路模型与电路定律 / 电阻电路等效变换 / 电路定理 / 正弦稳态分析 / 动态电路分析 / 耦合电感与变压器 / 三相电路 / 二端口网络）：串联欧姆定律、并联等效电阻、功率 I²R、叠加定理、戴维宁负载电流与最大功率、阻抗模勾股数组、平均功率 UIcosφ、串联谐振、时间常数 τ=RC、换路定律 uC(0+)=uC(0−)、耦合系数 k=M/√(L1L2)、三相 UL=√3UP、二端口 Z12；`genYear(year, yi)` 主参数年份索引偏移防撞，零碰撞零去重丢弃。
- **集成**：`integrate_all.py` 注册 `seed_real_circuit.sql`（9 字段行内带 source）；`seed_all_final.sql` 重生成：总题量 11,488 → **11,628**（净增 140）；电路 1,509 → 1,649。
- **版本**：APP_VERSION v4.5.4→v4.5.5，sw 缓存 `kaoyan-v4.5.5`。
- **验证**：种子 3 个 INSERT 块、行数 140、选项 JSON 反斜杠 0；`_scan_json.py` 全库扫描 TOTAL 11628 BAD 0；build（含 tsc）通过（产物 `index-5bLCMhYt.js` 592.80 kB / `index-B5sdtsNa.css`）。
- **数据导入**：Supabase 导入 234 块全绿（`OK=234 Failed=0`），DB 总量 **11,628**（政治 6,618 / 数学二 2,087 / 电路 1,649 / 英语二 1,274）；来源核验：2015-2019 真题风格题每年 60（数学/英语 46 + 电路 14）、2020-2024 每年 14（电路）；新增 140 题线上即刻可刷。
- **部署（受阻）**：`dist-deploy.zip`（70 文件，1,092,948 B）就绪；Netlify 部署被账户额度阻断（`Account credit usage exceeded - new deploys are blocked until credits are added`），重试确认非瞬时；补发步骤：充值后重跑 `_netlify_deploy_v420.ps1` + 新建 `_netlify_poll_v455.ps1`（bundle `index-5bLCMhYt.js`）轮询验证。数据已先行导入，新题在现有 v4.5.4 前端即刻可刷。
- **GitHub 同步**：sw.js+constants.ts（`77cf1d6`）、integrate_all.py（`184e633`）、gen_real_circuit.js（`33e0602`）、CHANGELOG 精要条目（`fd2e70c` 与修正提交）；seed_real_circuit.sql（41.1 KB）超 MCP 单次推送上限，不入 GitHub，权威记录以本地为准。

---

## v4.5.4（2026-09-01）题库大增量：名师典型 147 + 2015-2019 真题风格题（数学 110 / 英语 120），总量 11,118 → 11,488

> 版本说明：**次版本号 +1**（题库数据大增量，沿袭 v4.2.0 / v4.5.3「题库大增量 = 次版本 +1」先例；功能 / 架构 / UI 零变化）。
- **版权边界声明**：不复现考研真题原文与名师教材原题；三套题库均为「真题风格 / 名师风格」原创题——题型、考点分布、难度梯度、设问风格对齐真题与名师体系，题干选项全部原创，答案参数化程序精确计算；source 标注 `{年份}真题风格题`、`名师典型·张宇 / 武忠祥 / 汤家凤`。
- **数学二名师典型题库**（新增 `gen_teacher_math2.js`，seed=45321）：张宇 50 题（极限 / 中值定理 / 级数风格）+ 武忠祥 51 题（一元微积分 / 微分方程）+ 汤家凤 46 题（基础计算 / 二重积分 / 线代），共 147 题，去重后入库 140。
- **2015-2019 真题风格数学卷**（新增 `gen_real_math_2015_2019.js`）：每年 22 题（10 单选 + 6 填空 + 6 解答，解答带「（本题满分10分）」前缀），共 110 题；关键教训：首版因跨年参数碰撞仅产 71/110 题 → 重写 `genYear(year, yi)` 主参数 = 年份索引 + 固定偏移结构性唯一；同步修复三处 `replace()` 拼接隐患。
- **2015-2019 真题风格英语二卷**（新增 `gen_real_english_2015_2019.js`）：每年 24 题（完形 10 空 + 阅读 2 篇×4 题 + 词汇 6 题），共 120 题，短文全部原创（15 主题）；完形 `【第N空】` / 阅读 `Text N（第K题）` 前缀防撞；章节名用英语二新式规范章节名。
- **集成**：`integrate_all.py` 注册三种子（9 字段行内带 source）；`seed_all_final.sql` 重生成：总题量 11,118 → **11,488**（净增 370，输入 377 去重 7）；数学二 1,837 → 2,087；英语二 1,154 → 1,274。
- **版本**：APP_VERSION v4.5.3→v4.5.4，sw 缓存 `kaoyan-v4.5.4`；新增轮询脚本 `_netlify_poll_v454.ps1`。
- **验证**：三种子各 3 个 INSERT 块、行数 147 / 110 / 120、选项 JSON 反斜杠 0；`_scan_json.py` 全库扫描 TOTAL 11488 BAD 0；build（含 tsc）通过（产物 `index-CQGdYCxl.js` / `index-B5sdtsNa.css`）；线上轮询 poll 1 即 ready，五项全绿。
- **部署**：`dist-deploy.zip`（70 文件，1,092,948 B）发布到 `llss.netlify.app`，deploy `6a9611f467486800d14f509d` ready；Supabase 导入 232 块全绿（`OK=232 Failed=0`），DB 总量 **11,488**（政治 6,618 / 数学二 2,087 / 电路 1,509 / 英语二 1,274）；来源核验：2015-2019真题风格题合计 230、名师典型合计 140，与集成输出一致；新增 370 题线上即刻可用。
- **GitHub 同步**：sw.js+constants.ts（`f03bb49`）、integrate_all.py（`1dd3be7`）、gen_real_math_2015_2019.js（`427a6c2`）、gen_teacher_math2.js（`d0d5d20`）、CHANGELOG 精要条目（本提交）；gen_real_english_2015_2019.js（31.9 KB）与三种子 SQL（38.5 / 30.7 / 51.0 KB）超 MCP 单次推送上限，不入 GitHub，权威记录以本地为准。

---

## v4.5.3（2026-08-31）题库大增量：电路 +410 / 数学二 +493（总量 10,215 → 11,118）

> 版本说明：**次版本号 +1**（题库数据大增量，沿袭 v4.2.0「题库大增量 = 次版本 +1」先例；功能 / 架构 / UI 零变化）。
- **电路强化题库**（新增 `gen_circuit_adv.js`，8 模块）：覆盖 10 个规范章节（电路定理 / 正弦稳态 / 动态电路 / 耦合电感与变压器 / 三相 / 二端口 / 复频域 / 图论矩阵 / 非线性 / 综合），产出 424 题（去重后 410）；**数学二强化题库**（新增 `gen_math2_adv.js`，12 模块）：覆盖高数 6 章 + 线代 6 章 + 综合，产出 508 题（去重后 493）。全部为参数化精确答案计算题（干扰项全参数域防碰撞）+ 干净概念题 + 两选项判断题（`mkj`）。
- **质量修复**（电路生成器）：判断题选项被随机数补位污染 → 新增判断题两选项助手 `mkj`（8 处）；无功功率数学错误（cosφ=0.6 时 Q=S×0.8，原误 0.6）；概念题数组型垃圾选项 22 处 → 直白字符串数组；耦合系数 k 干扰项防碰撞。
- **历史真题库 JSON 转义缺陷修复**：3 行真题/名师题选项内 LaTeX 单反斜杠非法（导入 22P02）→ `_fix_json_escape.py` 定向加倍，`_scan_json.py` 全库扫描 BAD 0。
- **集成**：`integrate_all.py` 注册 `seed_adv_circuit.sql` / `seed_adv_math2.sql`（9 字段行内带 source）；`seed_all_final.sql` 重生成：总题量 10,215 → **11,118**（+903）；电路 1,099 → 1,509；数学二 1,344 → 1,837。
- **质量工具**：`_check_seed.cjs`（SQL 行级校验：电路 ROWS 424 BAD 0、数学二 ROWS 508 BAD 0）、`_scan_concepts.cjs`（生成器结构校验 TOTAL_BAD 0）。
- **版本**：APP_VERSION v4.5.2→v4.5.3，sw 缓存 `kaoyan-v4.5.3`。
- **验证**：build（含 tsc）通过（产物 `index-BmjNO3vV.js` 592.80 kB / `index-B5sdtsNa.css` 64.93 kB）；线上轮询 poll 1 即 ready，全绿（新 bundle/CSS、sw 缓存名、bundle 含 v4.5.3、meta_before_script=True）。
- **部署**：`dist-deploy.zip`（70 文件，1,092,947 B）发布到 `llss.netlify.app`，deploy `6a95a221dc2a2ce2e232554f` ready；Supabase 导入 225 块全绿（`OK=225 Failed=0`），DB 总量 **11,118**（政治 6,618 / 数学二 1,837 / 电路 1,509 / 英语二 1,154），新增 903 题线上即刻可用；PAT 留存仓库外 `.local`，后续导入不再索取。
- **GitHub 同步**：sw.js+constants.ts（`67c878c`）、integrate_all.py（`9e51f12`）、CHANGELOG 精要条目（`3f8f873`/`c409354` 与本提交）；种子 SQL（各 90-100 KB）超单次推送上限不入 GitHub，以本地为准。

---

## v4.5.2（2026-08-31）修复暗模式状态栏仍白（启动期 meta 写入 null 缺陷）

> 版本说明：**次版本号 +1**（小修复：启动期 meta 同步脚本顺序缺陷，功能 / 数据 / 架构零变化）。
- **根因**（用户截图反馈：暗模式内容已暗但状态栏仍白条）：内联脚本位于两枚 meta 之前，脚本执行时 `querySelector` 取 null，暗色启动的 `#000000/black-translucent` 写入从未生效，iOS 启动读到的恒为静态 `default`。
- **修复**：`theme-color` / `status-bar-style` 两枚 meta 移至内联脚本前；暗色启动正确写入 meta，状态栏透明沉浸；静态值保持亮色默认。
- **版本**：APP_VERSION v4.5.1→v4.5.2，sw 缓存 `kaoyan-v4.5.2`。
- **验证**：build（含 tsc）通过（产物 `index-Brdu8nc3.js` 592.80 kB）；冷启动 meta 端到端（预置 localStorage 冷加载：暗 `#000000/black-translucent` / 亮 `#FFFFFF/default` ✔，修复前暗启动为静态 default 白）；线上 `meta_before_script=True`；截图 2 张目检暗色全黑沉浸 / 亮色纯白顶栏。
- **部署**：`dist-deploy.zip`（70 文件，1,092,947 B）发布到 `llss.netlify.app`，deploy `6a9592f40869cda72f1037c0` ready。
- **GitHub 同步**：sw.js+constants.ts（`54a9b6c`）、index.html（`fb96245`）、CHANGELOG 精要条目 + v4.2.1 归档（本提交系列）；`css/style.css` 超单次推送上限，不入 GitHub，以本地为准。

---

## v4.5.1（2026-08-31）亮色顶栏纯白消接缝 + theme-color 亮统一 #FFFFFF（状态栏视觉跟随主题）

> 版本说明：**次版本号 +1**（小改动：亮模式顶栏视觉接缝修复与 theme-color 统一，功能 / 数据 / 架构零变化）。
- **根因与对策**（用户截图反馈：亮模式状态栏与顶栏色差接缝）：iOS 亮 `default` 状态栏为纯白不透明（平台限制，底色不可自定义）；亮色顶栏改纯白与白状态栏无缝融合（iOS 原生导航栏观感）。新增令牌 `--topbar-bg`（`:root` 亮 `#FFFFFF` / dark `var(--glass)`），`.topbar` background 改用令牌；暗色玻璃顶栏不变。
- **theme-color 亮统一 #FFFFFF**：`theme.ts` applyTheme、`index.html` 内联脚本与静态 meta、manifest `theme_color`（`#4B3FE3` → `#FFFFFF`，`background_color` 保持 `#F2F2F7`）；Android 系统工具栏亮色同纯白，双端一致。
- **版本**：APP_VERSION v4.5.0→v4.5.1，sw 缓存 `kaoyan-v4.5.1`。
- **验证**：build（含 tsc）通过（产物 `index-Cw9Ol3OT.js` 592.80 kB / `index-B5sdtsNa.css` 64.93 kB）；meta 同步端到端（实点 `#themeToggle`：亮 #FFFFFF/default → 暗 #000000/black-translucent）；iPhone 视口截图 3 张目检亮顶栏纯白接缝消失（含用户圈出的知识库页）、暗色全黑沉浸无回归。
- **部署**：`dist-deploy.zip`（70 文件，1,092,947 B）发布到 `llss.netlify.app`，deploy `6a958a5aabc0ce50fe29079d` ready；线上验证全绿（content="#FFFFFF" / --topbar-bg / background:var(--topbar-bg) / sw 缓存名 / manifest theme_color 字节流核验 / 图标 200）。
- **GitHub 同步**：sw.js+constants.ts+manifest（`c17eff3`）、index.html+theme.ts（`e735fd1`）、CHANGELOG 精要条目（`d6de3a1`）；`css/style.css` 超单次推送上限，不入 GitHub，以本地为准。

---

## v4.5.0（2026-08-31）APP 化交互细节 + 状态栏跟随主题（standalone 顶部白条修复）

> 版本说明：**次版本号 +1**（交互 / 体验层优化，功能 / 数据 / 架构零变化）。
- **状态栏跟随主题**（用户截图反馈：standalone 顶部状态栏恒白）：`apple-mobile-web-app-status-bar-style` 暗 `black-translucent` / 亮 `default` 动态分流；`theme-color` 同步（亮 #F2F2F7 / 暗 #000000）；head 内联脚本启动即同步双 meta 消白闪 + `theme.ts` `applyTheme` 运行时实时同步。
- **APP 化交互细节**：`touch-action:manipulation` 消双击缩放 / 点延迟；`overscroll-behavior-y:none` 禁整页橡皮筋；`100dvh` 回退；按压反馈补全（`.nav-item:active` scale(.94)、chips/收藏等 opacity .75）；交互元素名单制禁选择 / 长按呼叫；输入框 ≥16px 防 iOS 聚焦缩放；`gesturestart` 防捏合。
- **原生 TabBar 体验**：`navigation.ts` 滚动位记忆（Tab 页切回恢复、子页回顶）；`main.ts` hash 深链（knowledge/favorites/wrongbook/stats/admin 直达）。
- **manifest shortcuts**：长按图标「继续刷题 /#home、学习统计 /#stats」（Android 生效）；`background_color` #F2F2F7。
- **版本**：APP_VERSION v4.4.0→v4.5.0，sw 缓存 `kaoyan-v4.5.0`。
- **验证**：build（含 tsc）通过（产物 `index-C6YBzUVM.js` 592.80 kB / `index-BKm-ISLC.css` 64.88 kB）；meta 同步端到端（实点 `#themeToggle`：亮 #F2F2F7/default → 暗 #000000/black-translucent）；iPhone 视口截图 3 张目检暗色全黑无白条。
- **部署**：`dist-deploy.zip`（70 文件，1,092,948 B）发布到 `llss.netlify.app`，deploy `6a957aaf9a9104806fc38746` ready；线上验证全绿（启动脚本 / theme-color / touch-action / overscroll / nav-active / dvh / sw 缓存名 / manifest shortcuts 字节流核验 / 图标 200）。
- **GitHub 同步**：sw.js+constants.ts+manifest（`b2f132f`）、index.html（`5c855cb`）、navigation.ts+theme.ts+main.ts（`6ef1a30`）、constants.ts 文本对齐修正（`1f25668`/`9859e9f`）、CHANGELOG 精要条目与文本修正（`e61b2de`/`546fbe5`/`f278681`/`389ec4a`）；`css/style.css` 约 32KB 超单次推送上限，不入 GitHub，以本地为准。
