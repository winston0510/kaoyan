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
