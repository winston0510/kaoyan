# 修改日志 (CHANGELOG)

> 版本规则：**大改动**（新增功能、架构变更）→ 主版本号 +1；**小改动**（Bug 修复、细节优化）→ 次版本号 +1。
> 版本号常量位于 `src/constants.ts`（v3.0.0 前位于 `index.html` 顶部），管理页底部实时显示。

---

## v4.2.0（2026-08-31）历年真题 + 名师题全量入库：题库新增 363 题（总量 9,852 → 10,215）

> 版本说明：**次版本号 +1**（题库数据大增量 + 集成脚本调整，无前端功能 / 架构变化）。

### 新增
- **5 个真题 / 名师种子文件共 363 题**（每题均含标准来源、标准章节归类、非空中文解析，9 字段格式）：
  - `seed_real_english_cloze.sql`：2020–2024 英语二完形填空 **100 题**（每年 20 空，题干带【第N空】前缀防去重碰撞，来源 `2020年真题`~`2024年真题`）。
  - `seed_real_english_reading.sql`：2020–2024 英语二阅读理解 Part A **100 题**（v3.11.1 已建文件，本次正式注册进集成脚本）。
  - `seed_real_math_2020_2022.sql`：数学二 2020–2022 真题 **67 题**（2020 年 23 + 2021 年 22 + 2022 年 22；单选/填空/解答齐备，章节精确归类到高数第1-7章 / 线代第1-6章）。
  - `seed_real_math_2023_2024.sql`：数学二 2023–2024 真题 **44 题**（每年 10 单选 + 6 填空 + 6 解答）。
  - `seed_real_teacher.sql`：名师题 **52 题**（张宇1000题 16 + 武忠祥每日一题 16 + 汤家凤1800题 15 + 恋练有词英语词汇 5）。

### 变更
- **`integrate_all.py`**：集成注册块移除已损坏的 `seed_real_english.sql`，替换为 `seed_real_english_cloze.sql` + `seed_real_english_reading.sql` 两个文件。
- **`seed_all_final.sql` 重新生成**：总题量 9,852 → **10,215**（数学二 1,344 / 英语二 1,154 / 电路 1,099 / 政治 6,618）；363 题真题 / 名师题全部保留，零误删（去重仅命中旧库内部重复：英语旧数据内部重复 131 条、政治 163 条、数学 1 条）。
- **删除损坏文件** `seed_real_english.sql`（此前 Write 截断事故产物，仅 2 行无效内容）。
- **独立修改日志**：新增 `seed_real_math_2020_2022.changelog.log`、`seed_real_teacher.changelog.log`、`release_v4.2.0.changelog.log`（本次集成发布明细）。
- **APP_VERSION v4.1.1 → v4.2.0**（`src/constants.ts`）；`public/sw.js` 缓存名同步 `kaoyan-v4.2.0`。

### 验证
- 独立复核脚本（node 正则全量解析 5 个种子文件）：363 题全部通过——章节名 100% 命中标准列表（`第N章 …`）、来源 100% 为标准格式（`20XX年真题` / 4 类名师来源）、解析与答案零空值。
- 集成输出核对：5 个文件分别解析 67 / 44 / 100 / 100 / 52 行；最终库中带真题 / 名师来源的题目恰为 363 条（math2 158 = 真题 111 + 名师数学 47；english2 205 = 真题 200 + 恋练有词 5），完形【第N空】标记 100 条完整在库。
- `npm run typecheck`、`npm run build` 全部通过（Vite 构建 69 模块，产物 `index-BQXjHljX.js`）。

### 部署
- **线上部署完成（2026-08-31）**：`dist-deploy.zip`（66 文件，正斜杠路径，1,068,038 B）经 Netlify Deploy API（`POST /api/v1/sites/38b9bbf0-39f6-4610-a09a-79be94755f17/deploys`）发布到 `llss.netlify.app`，deploy `6a954e38b54da3e914aa8e52` 状态 ready（published 2026-08-31T09:49:45Z，error 空）。
- **线上验证全绿**：`sw.js` 返回 `kaoyan-v4.2.0`、首页引用 `assets/index-BQXjHljX.js` + `assets/index-D9c1O0fW.css`（v4.2.0 bundle）、JS 包 200（591,858 B）、`manifest.webmanifest` 200。
- **数据说明**：363 题存于 `seed_all_final.sql`（10,215 题），按既有流程由用户在 Supabase 侧导入后即在 App 内生效；本次前端部署不携带数据库变更。
- **GitHub 仓库同步（2026-08-31）**：`src/constants.ts`、`public/sw.js`、`integrate_all.py`（新增，题库集成管线）与本文档（完整 509 行）经 MCP `push_files` 推送至 `winston0510/kaoyan` main（integrate_all.py commit `225efa8`）。

---

## v4.1.1（2026-08-30）知识库多科目文案通用化（修正「条公式」硬编码）

> 版本说明：**次版本号 +1**（小改动：文案通用化 + 数据结构新增可选字段，无架构变化）。

### 修复
- **知识库主题计量单位通用化**：列表页主题卡与详情页横幅此前对所有主题统一显示「XX 条公式」，对非公式科目（英语二）措辞不当。现为 `KnowledgeTopic` 数据结构新增可选字段 `unit`（默认 `条公式`），英语二主题声明 `unit: '个知识点'`；主题卡 / 详情横幅据此按科目显示「40 条公式」「31 条公式」「58 个知识点」。
- **知识库页签与副标题通用化**：「📖 公式速查」统一改为「📖 知识点速查」，hero 副标题「公式速查 · 记忆卡片」改为「知识点速查 · 记忆卡片」，与多科目定位一致（对公式类科目语义同样适用）。

### 变更
- `src/data/knowledge-data.ts`：`KnowledgeTopic` 接口新增 `unit?: string`；`english2-knowledge` 声明 `unit: '个知识点'`。
- `src/ui/knowledge.ts`：新增 `topicUnit()` 辅助函数；4 处硬编码「公式」相关文案（hero sub / 主题卡 tags / 横幅 meta / tab 标签）全部改为按主题单位渲染。
- **APP_VERSION v4.1.0 → v4.1.1**（`src/constants.ts`）；`public/sw.js` 缓存名同步 `kaoyan-v4.1.1`。

### 验证
- `npm run typecheck`、`npm run test`（34/34）、`npm run build` 全部通过。
- 浏览器冒烟：列表页主题卡显示「40 条公式 / 31 条公式 / 58 个知识点」，英语二详情页 banner「58 个知识点 · 29 张记忆卡片」、tab「📖 知识点速查」，版本显示 v4.1.1，无 JS 报错 / 404。

### 部署
- **线上部署完成（2026-08-30）**：`dist-deploy.zip`（66 文件，正斜杠路径，1,068,034 B）经 Netlify Deploy API（`POST /api/v1/sites/38b9bbf0-39f6-4610-a09a-79be94755f17/deploys`）发布到 `llss.netlify.app`，deploy `6a94bf684d7584dd913a54ff` 状态 ready（published 2026-08-30T23:40:25Z，error null）。
- **线上验证全绿**：首页加载 `assets/index-DjSzWQhK.js` + `assets/index-D9c1O0fW.css`（v4.1.1 bundle）、`sw.js` 返回 `kaoyan-v4.1.1`、manifest「考研刷题」、静态资源全部 200；浏览器 UI——科目 政治 48 / 英语二 6 / 数学二 14 / 电路 15 章节、知识库 3 主题（数学二 40 公式 48 卡 / 电路 31 公式 28 卡 / 英语二 58 知识点 29 卡，共 105 张卡片）渲染正常、版本显示 v4.1.1、console 无 JS 错误。
- **GitHub 仓库同步**：完整项目推送至 `winston0510/kaoyan` main（项目 commit `dae13b0b`）；补记本文档部署章节后二次同步修复线上一处同步截断（commit `413cde1f`），经 GitHub API 读取核对与本地 **477 行完全一致**（含 v1.0.0 / v2.0.0 / v2.1.0 / v4.1.1 全部章节）。
- **Netlify PAT 安全处置**：有效令牌（`nfp_…`）保存至本地 `.local/netlify_token.txt` 不入库，后续部署自动读取、不再重复索要（用户要求）。
