# 修改日志 (CHANGELOG)

> 版本规则：**大改动**（新增功能、架构变更）→ 主版本号 +1；**小改动**（Bug 修复、细节优化）→ 次版本号 +1。
> 版本号常量位于 `src/constants.ts`（v3.0.0 前位于 `index.html` 顶部），管理页底部实时显示。
> 注：GitHub 端副本受 MCP 单次推送体量限制为精要版；v4.2.1 及更早版本记录见 `CHANGELOG-archive.md`；完整权威记录以仓库本地 `CHANGELOG.md` 与各 `*.changelog.log` 为准。

---

## v4.5.3（2026-08-31）题库大增量：电路 +410 / 数学二 +493（总量 10,215 → 11,118）

> 版本说明：**次版本号 +1**（题库数据大增量，沿袭 v4.2.0「题库大增量 = 次版本 +1」先例；功能 / 架构 / UI 零变化）。
- **电路强化题库**（新增 `gen_circuit_adv.js`，8 模块）：覆盖 10 个规范章节，产出 424 题（去重后 410）；**数学二强化题库**（新增 `gen_math2_adv.js`，12 模块）：覆盖高数 6 章 + 线代 6 章 + 综合，产出 508 题（去重后 493）。全部为参数化精确答案计算题（干扰项全参数域防碰撞）+ 干净概念题 + 两选项判断题（`mkj`）。
- **质量修复**（电路生成器）：判断题选项随机数补位污染 → `mkj` 两选项助手（8 处）；无功功率数学错误（Q=S×0.8，原误 0.6）；概念题垃圾选项 22 处清理；耦合系数 k 干扰项防碰撞。
- **历史真题库 JSON 转义缺陷修复**：3 行真题/名师题选项内 LaTeX 单反斜杠非法（导入 22P02）→ `_fix_json_escape.py` 定向加倍，`_scan_json.py` 全库扫描 BAD 0。
- **集成**：`integrate_all.py` 注册两增量种子文件；`seed_all_final.sql` 重生成：总题量 10,215 → **11,118**（+903）；电路 1,099 → 1,509；数学二 1,344 → 1,837。
- **质量工具**：`_check_seed.cjs`（ROWS 424/508 BAD 0）、`_scan_concepts.cjs`（TOTAL_BAD 0）。
- **版本**：APP_VERSION v4.5.2→v4.5.3，sw 缓存 `kaoyan-v4.5.3`。
- **验证**：build（含 tsc）通过（产物 `index-BmjNO3vV.js` 592.80 kB / `index-B5sdtsNa.css` 64.93 kB）；线上轮询 poll 1 即 ready，全绿。
- **部署**：`dist-deploy.zip`（70 文件，1,092,947 B）发布到 `llss.netlify.app`，deploy `6a95a221dc2a2ce2e232554f` ready；Supabase 导入 225 块全绿（`OK=225 Failed=0`），DB 总量 **11,118**（政治 6,618 / 数学二 1,837 / 电路 1,509 / 英语二 1,154），新增 903 题线上即刻可用；PAT 留存仓库外 `.local`，后续导入不再索取。
- **GitHub 同步**：sw.js+constants.ts（`67c878c`）、integrate_all.py（`9e51f12`）、CHANGELOG 精要条目（本提交系列）；种子 SQL（各 90-100 KB）超单次推送上限不入 GitHub，以本地为准。
