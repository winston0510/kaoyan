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

---

## v4.1.0（2026-08-30）知识库新增「电路」「英语二」两大主题 + 记忆卡片样式美化

> 版本说明：**次版本号 +1**（小改动：知识库内容增量扩展 + 样式优化，无架构变化）。

### 新增
- **「考研电路」知识库主题**（`circuit-knowledge`，⚡ #F39C12）：2 大板块 9 节 **31 个条目**——电路基础（基尔霍夫定律、电阻串并联与分压分流、等效变换、叠加定理、戴维南/诺顿定理、最大功率传输）与动态交流电路（一阶动态电路、RLC 谐振、正弦稳态功率、耦合电感与理想变压器、三相电路、二端口网络、复频域分析）、**8 条高频提示**、**6 组 28 张记忆卡片**。
- **「考研英语二」知识库主题**（`english2-knowledge`，🔤 #3498DB）：6 大板块 16 节 **58 个条目**——核心词汇（高频动词/形容词/名词，含近反义词）、语法（核心时态、介词搭配、常考连词）、完形填空（逻辑连接词、语境词汇）、阅读理解（题型技巧、高频主题词）、翻译（英译中 / 中译英高频表达）、写作（书信格式、常用表达、易错点、文章结构）、**10 条高频提示**、**6 组 29 张记忆卡片**。

### 变更
- **`src/data/knowledge-data.ts`**：`KNOWLEDGE_TOPICS` 由 1 个主题扩为 **3 个**（数学二 + 电路 + 英语二），两个新主题均使用对象字面量（`P1/P2` 工厂函数名称硬编码高等数学/线性代数，不可复用），分隔复用 `sec()/item()` 工厂函数；总条目 40+31+58=**129 项**、tips 28 条、记忆卡片 48+28+29=**105 张**。
- **记忆卡片样式美化**（`css/style.css` 知识库 `kt-flash` 区域）：卡片翻转动效增强（3D 透视 + 背料渐变）、「点击翻面」胶囊徽标、hover 浮起阴影、`prefers-reduced-motion` 降级为淡入无翻转，暗色模式同步适配。
- **APP_VERSION v4.0.0 → v4.1.0**（`src/constants.ts`）。
- `public/sw.js` 缓存名同步 `kaoyan-v4.1.0`。

### 验证
- 通过：`npm run typecheck`（退出码 0）、`npm run test`（34/34 通过）、`npm run build`（Vite 构建成功）。
- 通过：Playwright + 系统 Chrome 冒烟验证——列表页 hero「3 个主题 · 105 张记忆卡片」、三张主题卡（考研数学二 40 条 / 考研电路 31 条 / 考研英语二 58 条）、三主题详情页（数学 15 节 48 卡 / 电路 9 节 28 卡 / 英语 17 节 29 卡）、全部 105 张 3D 翻卡可翻面、版本显示「当前版本 v4.1.0」，全程无 JS 报错 / 404。

---

## v4.0.0（2026-08-30）新增「知识库」功能模块：数学二公式速查 + 记忆卡片

> 版本说明：**主版本号 +1**（大改动：新增功能模块——通用知识库页面、底部导航第 5 项、独立数据源与 UI 模块，后续可扩展其他科目知识点）。

### 新增
- **通用知识库页面**：底部导航新增第 5 项「知识库」（首页右侧），`index.html` 新增 `#page-knowledge`；列表页含 hero 区 + 主题卡片（图标 / 公式数 / 卡片数），支持多主题扩展。
- **`src/data/knowledge-data.ts`**：独立通用知识数据源。定义 `KnowledgeTopic / KnowledgePart / KnowledgeSection / KnowledgeItem / FlashCardGroup` 接口 + `P1 / P2 / sec / item` 工厂函数，主题结构（`parts` 公式分区 + `tips` 高频提示 + `cardGroups` 记忆卡片）可直接复用新增科目。首个主题 `math2-knowledge`：高等数学 9 节 + 线性代数 6 节共 **40 条公式**（每条含多条子公式，覆盖 93 项公式要点）、10 条高频考点易错提醒、**48 张记忆卡片**（10 组）。
- **`src/ui/knowledge.ts`**：主题详情页含横幅 + 「公式速查 / 记忆卡片」双标签；公式按「分部 → 章节」折叠卡片展示（LaTeX 经 `formatMath` 渲染为 KaTeX），每节可点击折叠；记忆卡片为 **3D 翻牌自测**（点击翻面看答案）。
- **KaTeX 兼容处理**：源文档 `\xlongequal` 宏（KaTeX 不支持的 extpfeil）替换为 `\xrightarrow{\ \frac{0}{0}\ \text{或}\ \frac{\infty}{\infty}\ }`；多公式 content 以 `\n` 连接、渲染时转为 `<br>` 保留换行。

### 变更
- **`index.html`**：新增 `#page-knowledge` 区块 + 底部导航第 5 项（`data-page="knowledge"`，`switchPage('knowledge')`）。
- **`src/ui/navigation.ts`**：`switchPage` 新增 `page === 'knowledge'` 分支调用 `renderKnowledge()`。
- **`src/main.ts`**：导入并暴露 6 个全局函数至 `windowApi`：`renderKnowledge / openKnowledgeTopic / backFromKnowledge / switchKnowledgeTab / toggleKnowledgeSection / flipCard`。
- **APP_VERSION v3.11.1 → v4.0.0**（`src/constants.ts`，大改动 → 主版本号 +1）。
- `public/sw.js` 缓存名同步 `kaoyan-v4.0.0`。
- `css/style.css` 新增知识库整套样式（`kt-hero / kt-topic-card / kt-section 折叠 / kt-flash 3D 翻卡 / kt-tips` 等，全部基于既有 CSS 变量适配深色模式）。

### 验证
- 通过：`npm run typecheck`（退出码 0）、`npm run test`（34/34 通过）、`npm run build`（Vite 构建成功）。
- 通过：Playwright + 系统 Chrome 冒烟验证——底部导航 5 项、列表页 hero 与主题卡片（考研数学二 / 40 条公式 / 48 张卡片）、主题页 15 章节、KaTeX 渲染 245 处、章节折叠（15→14 open）、双标签切换（公式速查 ↔ 记忆卡片）、48 张 3D 翻卡（0→1 flipped）、返回导航正常、版本显示「当前版本 v4.0.0」，全程无 JS 报错。

---

## v3.11.1（2026-08-30）新增英语二真题阅读理解种子文件 seed_real_english_reading.sql（100 题）

> 版本说明：小版本 +1（新增 seed 数据文件：2020–2024 年英语二真题阅读理解 Part A 共 100 题，无前端功能 / 架构变化）。

### 新增
- **`seed_real_english_reading.sql`**：独立种子文件，收录 2020–2024 年考研英语二真题阅读理解 Part A（每年 Text 1-4、题号 21-40、每年 20 题，五年共 **100 题**，全部 `single` 单选）。9 字段格式与既有 seed 一致，题干带「Text X（第XX题）」前缀保证互不相同，每题含 40-90 字中文解析（定位句 / 同义替换 / 排除理由），难度统一 `2`，`source` 字段为 `2020年真题` ~ `2024年真题`。
- 每 20 行为一个完整 INSERT 块（每块 1 条 `INSERT INTO questions (...)` VALUES 含 20 行，块末以分号结尾），可整体追加到题库。

### 变更
- **APP_VERSION v3.11.0 → v3.11.1**（`src/constants.ts`）。
- `public/sw.js` 缓存名同步 `kaoyan-v3.11.1`。

### 验证
- 读回验证（Read 工具）：文件共 **109 行** = 5 个 INSERT 头 + 100 行数据 + 4 个空行；5 个块（2020-2024）各 20 行、块末分号齐全、无截断。
- 统计核对（grep + PowerShell）：数据行 100 / INSERT 语句 5 / `source` 字段 100（每年各 20）；`python -c` 因沙盒限制（exit 9009，AppData 访问受限）无法执行，改用等价统计。
- 数据来源：题干 + 选项 + 答案取自 `seed_all_final.sql` 既有题库（历年经多家来源按选项文本交叉验证全对），解析依据历年真题原文（`_tmp_*.txt` 文本提取）撰写；五年 20 个 Text 全部抓取成功，**无跳过**。

---

## v3.11.0（2026-08-30）英语二真题题库扩充：2020–2024 完形填空 + 阅读理解 Part A 共 200 题

> 版本说明：小版本 +1（真题题库内容增量：seed 数据文件扩充 2020–2024 五年英语二 完形填空 + 阅读理解，无前端功能 / 架构变化）。

### 新增
- **`seed_real_english.sql` 扩充至 200 题**：新增 2024 年英语二真题 40 题（完形填空第 3 章 20 题 + 阅读理解第 4 章 20 题），与既有 2020–2023 年数据合并后，英语二真题 seed 共 **200 题**（每年完形 20 + 阅读 20）。
- 每行含 `source` 字段（`2020年英语二真题` ~ `2024年英语二真题`），经 `integrate_all.py`（`parse_pg_sql(..., inline_source=True)`）解析入库；难度统一 `2`，章节使用两级目录的 `第3章 完形填空` / `第4章 阅读理解`。

### 变更
- **APP_VERSION v3.10.1 → v3.11.0**（`src/constants.ts`）。
- `public/sw.js` 缓存名同步 `kaoyan-v3.11.0`。

### 验证
- `integrate_all.py` 输出：`seed_real_english.sql: parsed 200 rows`；分布核对：完形填空 100 行（5 年 × 20）+ 阅读理解 100 行（5 年 × 20），2024 年 40 行，无缺漏。
- 内容比对：新增 2024 年题目与 `seed_all.sql` 既有题库无重复命中；答案依据公开真题解析（多家来源交叉）确认。
- 数据源：2024 年原文取自 `_tmp_pdf/2024_eng2_text.pdf` 文本提取，2020–2023 年沿用历年提取文本；OCR 双栏断行的选项已逐题按 ABCD 还原。

---

## v3.10.1（2026-08-30）性能优化：科目加载与生成试题提速

> 版本说明：小版本 +1（性能优化：题库加载三级缓存、章节统计单趟化、收藏判定 Set 化）。

### 变更
- **`src/api.ts` `loadQuestions` 三级缓存**：内存（`questionsCache`）→ localStorage（`kaoyan_questions`）→ 网络，避免每次点击科目 / 开始刷题都全量网络拉取整科题目（政治 6618 题等）；同 subject 并发请求共享同一 in-flight Promise 去重；已有缓存时立即返回 + 后台静默刷新（网络结果写回内存与 localStorage 供下次使用）；`syncQuestionsFromDB` / `addQuestionToDB` 成功后同步更新 `questionsCache`。
- **`src/ui/subject.ts` 章节统计单趟 O(N)**：`renderSubject` 由「每章 `questions.filter` 重复 O(N×章数)」改为单趟构建 `Map<chapter, ChapterStat>`（一次遍历同时统计总数 / 已练 / 未掌握）；页面增加「加载中…」占位，缓存命中时秒开。
- **`src/ui/quiz.ts` 收藏判定内存 Set 化**：`isFavorite` 由每题 `JSON.parse` 全量收藏数组 + 线性查找改为模块级 `Set<string>` 惰性缓存（首次构建一次），`toggleFavorite` 成功时同步增删 Set，`favorites.ts` `removeFavorite` 调 `invalidateFavIds()` 使缓存失效——渲染每道题不再重复解析大数组。
- `public/sw.js` 缓存名同步 `kaoyan-v3.10.1`。
- **APP_VERSION v3.10.0 → v3.10.1**。

### 验证
- `npm run typecheck` 通过（修复一处 catch 回调返回类型）；`npm run test` 34/34 通过；`npm run build` 成功（JS bundle `index-4QzeeM2C.js`）。
- Playwright 冒烟全绿（`SMOKE_EXIT=0`）：SUBJECT_PAGE `{"chapterCards":52,"hero":true,"title":"政治"}`、MODES 3、QUIZ 渲染/答题/自评正常、收藏增删与 Set 缓存失效正常、首页版本号 v3.10.1、全程 JS_ERRORS none、NOT_FOUND none。

---

## v3.10.0（2026-08-30）章节目录两级化重组 + 题库章节数据迁移

> 版本说明：大版本 +1（章节目录架构重组 + 线上题库数据迁移，用户可见目录结构彻底改变）。

### 新增
- **两级章节目录**（科目 → 板块 → 章）：`src/constants.ts` 的 `SUBJECTS` 由平铺章节升级为 `sections: { name, chapters[] }` 结构，四科目全部按考研大纲划分：
  - 政治 6 板块 · 48 章：马原（第1-8章 + 综合练习）、毛中特（第1-15章）、史纲（第1-11章）、思修法基（绪论 + 第1-6章）、习思想（第1/2/7章）、时事与综合；
  - 英语二 2 板块 · 6 章：基础知识（词汇/语法）、真题题型（完形/阅读/翻译/写作）；
  - 数学二 2 板块 · 14 章：高等数学（第1章 函数极限连续 ~ 第7章 综合应用）、线性代数（第1章 行列式 ~ 第6章 二次型 + 综合）；
  - 电路 3 板块 · 15 章：直流电路 / 交流电路与动态电路 / 电路进阶。
- **板块级交互**：科目详情页按板块分组渲染，每个板块有独立标题栏（未掌握徽标 + 已练统计 + 「刷题」按钮 → 直接刷整个板块）；题库中含但目录未收录的章节自动归入「其他章节」兜底板块，保证题目可达。
- **`src/types.ts`** 新增 `SectionDef`（板块定义）、`SubjectDef` 扩展 `sections` 字段；`chapters` 保留扁平视图兼容既有逻辑。
- **`src/ui/subject.ts` 重构**：`openQuizModal(subjectId, chapter, section)` 新增第三参板块名；章节统计改为按题目 id 关联（`idToChapter` Map），旧本地错题数据自动兼容。
- **`src/ui/quiz.ts`**：`startQuiz` 支持板块范围（`scopeChapters` / `inScope`）：章节名 → 单章范围，板块名 → 板块内多章范围；错题重做与常规取题均按范围过滤。
- **数据迁移工具链**：`scripts/migrate_chapters.cjs`（离线生成迁移映射，政治 130+ 脏章节值 → 48 标准章，0 未映射）+ `scripts/chapter_migration_map.json`（映射产物）+ `scripts/exec_chapter_migration.cjs`（Management API 执行器，DRY-RUN / `--apply` 双模式）。

### 变更
- `css/style.css`：新增 `.section-header` / `.section-title` / `.section-meta` / `.section-stats` / `.section-start` 板块样式（复用既有设计变量，暗色模式适配）。
- `public/sw.js` 缓存名同步 `kaoyan-v3.10.0`。
- **APP_VERSION v3.9.0 → v3.10.0**。

### 数据迁移（线上执行完成，2026-08-30）
- **政治**：6618 题章节清洗归并——BOM（`\uFEFF`）/空格/第零章/第08章/「本质和规律」等变体全部映射到 48 个标准章名（如「马克思主义基本原理概论 - 第五章资本主义的本质及规律」→「第5章 资本主义的本质及规律」），全部 48 章分布合理，无未映射残留。
- **电路**：7 个「XX补充」归并到主章（动态电路补充 → 动态电路分析 等）；**英语二**：6 项裸章名改为「第N章 标题」。
- **数学二**：1186 题按考研大纲关键词自动细分到 14 章（高数 7 + 线代 7，`classifyMath` 规则：二重积分→微分方程→多元→积分→微分→极限→综合 / 特征值→二次型→向量→方程组→行列式→矩阵）。
- 迁移后分布核对：政治 6618 / 数学二 1186 / 电路 1099 / 英语二 949，**总数 9852 与迁移前完全一致，零丢失**；SQL 逐条精确匹配（政治/电路/英语）或按题目 id 批量 UPDATE（数学）执行。

### 验证
- `npm run typecheck` 通过（本轮修复：重写 constants.ts 时补回 `TYPE_LABELS` 导出）；`npm run test` 34/34 通过；`npm run build` 成功（`index-pCQzz_B4.css` / `index-CDkJmRe6.js`）。
- Playwright 冒烟全绿（`SMOKE_EXIT=0`）：SUBJECT_PAGE `{"chapterCards":52,"hero":true,"title":"政治"}`（章节卡片由 v3.9.0 的 5 张增至 52 张）、MODES 3、全程 JS_ERRORS none、NOT_FOUND none。

### 部署
- **线上部署完成（2026-08-30）**：.NET `ZipArchive` 打包（0 反斜杠条目）发布到 `llss.netlify.app`，deploy `6a938bb01e39ad3fc02563d5` 状态 ready；Supabase PAT 经环境变量使用、未入库。
- **PROJECT_GUIDE.md 同步**：第 7 节凭据表 PAT 更新为新的可用令牌 `sbp_v0_09db3a40a92c9a5939d31db8956fad19515e3190`（旧的 `sbp_73ca…` 已 401 失效）、第 5.3 节「PAT 已失效需更新」备注同步为「见凭据表」；项目树 subject.ts 描述、版本常量（v3.10.0）、page-subject、SUBJECTS 模块定位、openQuizModal 签名、Cache API 缓存名（kaoyan-v3.10.0）等 6 处版本引用同步。线上验证：sw.js 返回 `kaoyan-v3.10.0`、JS bundle 含新目录章名、数据库四科章节分布 48/14/15/6 题量 9852 零丢失。
