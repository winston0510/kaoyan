# 修改日志 (CHANGELOG)

> 版本规则：**大改动**（新增功能、架构变更）→ 主版本号 +1；**小改动**（Bug 修复、细节优化）→ 次版本号 +1。
> 版本号常量位于 `src/constants.ts`（v3.0.0 前位于 `index.html` 顶部），管理页底部实时显示。
> 注：GitHub 端副本受 MCP 单次推送体量限制为精要版（自 v4.5.5 起旧版本节进一步压缩精要，压缩前完整精要原文见历史提交 `d756221`）；v4.3.0 及更早版本记录见 `CHANGELOG-archive.md`；完整权威记录以仓库本地 `CHANGELOG.md` 与各 `*.changelog.log` 为准。

---

## v4.8.1（2026-09-05）知识主题内容修订：清华孝哥公开资料原文录取（精要压缩版）

> 版本说明：**补丁版本 +1**（知识主题内容修订，无 UI 变化，前端数据随构建发布）。

- **背景**：用户要求「不自创，先互联网搜集、按原内容录取」。经查证，清华孝哥的完整知识点总结为付费资料《解题框架与方法总结》（淘宝发售，无公开全文）；其唯一官方免费网盘为 2023 考前模拟卷 PDF（百度网盘提取码 5sjs，非知识点总结）。
- **变更**（`src/data/knowledge-data.ts`）：移除 v4.8.0 自创的「高等数学十八讲」逐讲知识点内容（17881 B），主题更名「清华孝哥高数复习框架」，全部替换为孝哥 B 站公开发布内容的原文录取（11659 B）：五抓方法论（八问题/五抓/九特色）、【知识总结】张宇30讲视频合集逐讲目录（第1~15讲数二范围）、【数二】考研数学大总结板块总结1~17目录、简单粗暴上120分三步法与计划、真题四步法（五真相+四步）、答疑避坑实录、来源清单（7 篇文章日期+链接）。付费书内容不录入。
- **版本**：APP_VERSION v4.8.0 → v4.8.1（constants.ts）；sw.js 缓存名 `kaoyan-v4.8.1`。
- **验证**：tsc --noEmit 通过、vite build 通过；远端三文件 blob 核验一致（knowledge-data `b5bd9af5` / constants `0b5e2260` / sw `d57d7568`）。

### GitHub 同步
- knowledge-data.ts + constants.ts + sw.js 批次推送（`715e057`，blob 远程核验一致，旧自创内容标记确认移除）。
- 远端精要版 CHANGELOG 新增 v4.8.1 节（本提交）。

---

## v4.8.0（2026-09-04）UI 重叠修复 + 判断题选项污染修复 + 新增高等数学十八讲知识主题（精要压缩版）

> 完整记录见本地 `CHANGELOG.md` v4.8.0 节与 `release_v4.8.0.changelog.log`。
- **UI 重叠修复**（css/style.css）：首页搜索栏与政治卡片顶部重叠，`.search-box{margin:12px 16px 10px}` 贴死，GAP=10px 验证通过。
- **判断题选项污染修复**：`mk()` 为 4 选项单选题函数，wrongs 不足 3 个时以随机数字补位，判断题（2 选项）选项被污染；新增 `mkj(correct, wrongs)` 2 选项专用函数，数学二 20 条 judge、电路 10 处 judge 全量改用；seed 重生成 + Supabase 全量重导 `OK=234 Failed=0`，线上总计 11,628 题、judge 238 条全部标准 2 选项。
- **新增高等数学十八讲知识主题**（src/data/knowledge-data.ts)：独立主题 `gaoshu-18-lectures`「高等数学十八讲」，参考清华孝哥《高数十八讲》总结框架整理，覆盖数二范围第 1~15 讲（极限与连续 / 一元函数微分学 / 一元函数积分学 / 多元函数与微分方程四大模块），App「知识库」页签独立主题查看。
- **版本**：APP_VERSION v4.7.0→v4.8.0，sw 缓存 `kaoyan-v4.8.0`。
- **GitHub 同步**：css+constants（`3f697376`）、knowledge-data（`850f26da`）、数学二/电路/数据结构生成器（`96e86db6`）、英语二/政治生成器（`47b09b59`）、CHANGELOG（本提交）。

---

## v4.7.0（2026-09-01）新增「继续刷题」模式：按顺序做题，跳过所有已答题目（精要压缩版）

> 完整记录见本地 `CHANGELOG.md` v4.7.0 节与 `release_v4.7.0.changelog.log`。
- **需求定稿**（用户三轮确认）：按题库顺序做题、不洗牌；**有作答记录即跳过（不论上次答对还是答错）**；答错照常进错题本（既有行为不变）。与既有「顺序只刷未掌握」（跳答对、留答错未掌握）互补。
- **弹窗**（`src/ui/subject.ts`）：新增第 5 个模式选项 `data-mode="continue"`「继续刷题 / 按顺序练习，跳过所有已答题目」，位于「顺序只刷未掌握」与「错题重做」之间。
- **过滤逻辑**（`src/ui/quiz.ts` `startQuiz`）：新增 `continue` 分支——以 `kaoyan_records` 中 `question_id` 非空的记录构建 `answeredIds` 集合，凡 id 在集合中即剔除；新增 `allAnswered` 标志，范围内题目全部答完时空态精确提示「题目已全部刷完，试试「错题重做」或更换范围」。
- **版本**：APP_VERSION v4.6.1→v4.7.0，sw 缓存 `kaoyan-v4.7.0`。
- **验证**：typecheck / 34 项测试 / build（`index-D-PlKLHS.js` 594.56 kB）全过；冒烟 `NODE_EXIT=0`（MODES=4、版本 v4.7.0、零报错）；专项 `_verify_continue_v470.cjs` 六断言全绿 `VERIFY_EXIT=0`（弹窗选项文案、顺序跳过已答 1-3 首题=4、故意答错→错题本 +1、再开继续首题=5 答错也跳过、零 JS 报错；演示题库无 id，故注入 8 道带 id 题验证）。
- **部署（已完成）**：已迁移至 Vercel 部署（域名暂不记录）；`dist-deploy.zip`（70 文件 / 0 反斜杠 / 1,093,247 B）存档；Netlify 账户额度阻断（403 `Account credit usage exceeded`）为历史记录，以本地 `release_v4.7.0.changelog.log` 为准。
- **GitHub 同步**：constants+sw+subject（`0887014`）、quiz.ts（`1810b5a`）、CHANGELOG（本提交）。

---

## v4.6.1（2026-09-01）章节治理：数学二 / 电路 / 英语二全量题目划入详细章节（政治跳过），总量 11,628 不变（精要压缩版）

> 完整记录见本地 `CHANGELOG.md` v4.6.1 节与 `release_v4.6.1.changelog.log`。
- 新增 `chapter_classifier.py`：电路 7 个「…补充」旧名改规范名；英语二 6 个裸名加「第N章」前缀；数学二泛章节（高等数学 / 线性代数 / 综合）双层关键词归类划入 13 个详细章节；`integrate_all.py` 集成 `fix_chapter`（解析后、去重前全量重划章节）。
- `seed_all_final.sql` 重生成（11,628 题，总量不变）：数学二泛章节清零（高数 793 / 线代 380 全部归入详细章节，仅余「第7章 综合应用」3 道源定章综合证明题）；电路 15 章 / 英语二 6 章全部规范名；BAD 章节空、无空章节。
- Supabase 导入 `OK=234 Failed=0`，DB 11,628（政治 6,618 / 数学二 2,087 / 电路 1,649 / 英语二 1,274）；线上审计章节分布与本地完全一致，治理结果即刻生效（运行时拉取）。
- Netlify 部署按规则跳过（仅数据质量修复 + 版本号，前端零实质变化）；同步 `328f4c5` / `eae46f6` / `ce2d80e`；seed_all_final.sql（5.53 MB）超上限不入 GitHub。

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
