# 修改日志 (CHANGELOG)

> 版本规则：**大改动**（新增功能、架构变更）→ 主版本号 +1；**小改动**（Bug 修复、细节优化）→ 次版本号 +1。
> 版本号常量位于 `src/constants.ts`（v3.0.0 前位于 `index.html` 顶部），管理页底部实时显示。
> 注：GitHub 端副本受 MCP 单次推送体量限制为精要版（自 v4.5.5 起旧版本节进一步压缩精要，压缩前完整精要原文见历史提交 `d756221`）；v4.3.0 及更早版本记录见 `CHANGELOG-archive.md`；完整权威记录以仓库本地 `CHANGELOG.md` 与各 `*.changelog.log` 为准。

---

## v4.6.0（2026-09-01）刷题中途退出支持已刷题目记录保存（退出小结页 + 继续作答）

> 版本说明：**次版本号 +1**（功能增强，沿袭 v3.9.0 / v4.1.0 / v4.5.0 先例）。
- **问题与方案**：逐题记录本经 `recordResult` 实时持久化（`kaoyan_records` / `kaoyan_today_*` / `kaoyan_wrongBook` + Supabase 云同步），退出从未丢记录；真实病灶是旧退出 confirm 文案「当前进度将丢失」误导，且退出静默回首页无保存确认。
- **退出新流程**（`src/ui/quiz.ts`）：已答 >0 点 ← 渲染**退出小结页**（`renderQuitSummary`）——「✓ 已答 N 题，作答记录已保存」+ 已答/正确/错误/正确率 + [继续作答（剩 N 题）] + [返回首页]；0 已答直接回首页（保持冒烟脚本兼容）。
- **续答防重复**：`resumeQuiz` 以 `index < correct + wrong` 判定当前题已有结果，续答先 `index++`；`pendingEssay` 不计已答，退出/续答时清空。main.ts windowApi 新增 `resumeQuiz` / `confirmQuit`。
- **版本与验证**：APP_VERSION v4.5.5→v4.6.0，sw 缓存 `kaoyan-v4.6.0`；typecheck / 34 项测试 / build（`index-VgODQdkU.js` 594.09 kB）全过；冒烟 `SMOKE_EXIT=0`；专项 `_verify_quit_v460.cjs` 六场景全绿 `VERIFY_EXIT=0`（答 3 题退出→小结页 + records 恰 3 条、续答跳第 4 题无残留、再答 1 题退出→4 条、确认退出回首页、0 已答直接回首页、零 JS 报错）。
- **部署（阻断）**：Netlify 被账户额度阻断（`Account credit usage exceeded`，与 v4.5.5 相同）；`dist-deploy.zip`（70 文件 / 1,093,133 B）已就绪待额度恢复重发；线上暂保持 v4.5.4。
- **GitHub 同步**：constants+sw（`109f19e`）、main.ts（`6f7c61b`）、quiz.ts 渐进三批定稿（`1bf3d4d`→`f44815b`→`ef2a7e7`，误增占位文件于 `ffc816b` 删除）。

---

## v4.5.5（2026-09-01）题库大增量：电路考研真题风格 2015-2024 共 140 题，总量 11,488 → 11,628（精要压缩版）

> 完整记录见本地 `CHANGELOG.md` v4.5.5 节。
- 电路真题风格原创题 140 题（`gen_real_circuit.js` seed=87015，每年 14 题 × 10 年覆盖 8 章节，答案参数化程序计算，不复现真题原文）；`seed_all_final.sql` 总量 11,628（电路 1,649）。
- Supabase 导入 `OK=234 Failed=0`，DB 11,628（政治 6,618 / 数学二 2,087 / 电路 1,649 / 英语二 1,274）；新题运行时拉取即刻可刷。
- 部署取消补发（前端无实质变化 + Netlify 额度阻断）；同步 `77cf1d6` / `184e633` / `33e0602` / `feee560` / `f93f9ac`；seed_real_circuit.sql 超上限不入 GitHub。

---

## v4.5.4（2026-09-01）名师典型 147 + 2015-2019 真题风格题，总量 11,118 → 11,488（精要压缩版）

> 完整记录见本地 `CHANGELOG.md` v4.5.4 节与 `release_v4.5.4.changelog.log`。
- 数学二名师典型 147 题（张宇 50 / 武忠祥 51 / 汤家凤 46）+ 2015-2019 真题风格数学 110 / 英语二 120；净增 370。
- 部署 `6a9611f467486800d14f509d` ready；Supabase `OK=232 Failed=0`，DB 11,488；同步 `f03bb49` / `1dd3be7` / `427a6c2` / `d0d5d20` / `d756221`。

---

## v4.5.3（2026-08-31）电路 +410 / 数学二 +493（总量 10,215 → 11,118）（精要压缩版）

> 完整记录见本地 `CHANGELOG.md` v4.5.3 节。
- 电路强化 410 题 + 数学二强化 493 题；选项 JSON 反斜杠转义修复（`_scan_json.py` BAD 0）；部署 `6a95a221dc2a2ce2e232554f` ready；同步 `67c878c` / `9e51f12` / `3f8f873` / `c409354`。

---

## v4.5.2（2026-08-31）修复暗模式状态栏仍白（精要压缩版）

> 完整记录见本地 `CHANGELOG.md` v4.5.2 节。
- `theme-color` / `status-bar-style` meta 移至内联脚本前，修复 iOS 暗色启动白条；部署 `6a9592f40869cda72f1037c0` ready；同步 `54a9b6c` / `fb96245`。

---

## v4.5.1（2026-08-31）亮色顶栏纯白消接缝（精要压缩版）

> 完整记录见本地 `CHANGELOG.md` v4.5.1 节。
- 新增 `--topbar-bg` 令牌亮色纯白；manifest `theme_color` → `#FFFFFF`；部署 `6a958a5aabc0ce50fe29079d` ready；同步 `c17eff3` / `e735fd1` / `d6de3a1`。

---

## v4.5.0（2026-08-31）APP 化交互细节 + 状态栏跟随主题（精要压缩版）

> 完整记录见本地 `CHANGELOG.md` v4.5.0 节。
- 状态栏暗 `black-translucent` / 亮 `default` 动态分流 + 启动期双 meta 消白闪；APP 化交互细节；部署 `6a957aaf9a9104806fc38746` ready；同步 `b2f132f` / `5c855cb` / `6ef1a30`。

---

## v4.4.0（2026-08-31）悬浮胶囊标签栏 + 三槽顶栏 + 2×2 彩色瓦片（精要压缩版）

> 完整记录见本地 `CHANGELOG.md` v4.4.0 节。
- 悬浮胶囊底部标签栏、三槽顶栏、彩色统计瓦片、卡片扁平化；部署 `6a9572f2b8459da15276d3ba` ready；同步 `e01712c` / `20c55cb` / `9ea25a0`。
