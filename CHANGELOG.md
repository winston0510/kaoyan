# 修改日志 (CHANGELOG)

> 版本规则：**大改动**（新增功能、架构变更）→ 主版本号 +1；**小改动**（Bug 修复、细节优化）→ 次版本号 +1。
> 版本号常量位于 `src/constants.ts`（v3.0.0 前位于 `index.html` 顶部），管理页底部实时显示。

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

---

## v3.9.0（2026-08-30）章节刷题：科目详情页 + 四种刷题模式

> 版本说明：大版本 +1（新增刷题功能与页面）。

### 新增
- **科目详情页**（`page-subject`，新模块 `src/ui/subject.ts`）：首页点击科目卡片不再直接弹窗，改为进入科目详情页——顶部「整科刷题」入口卡（显示整科题量 / 已练 / 未掌握），下方为**章节卡片列表**，每章显示「题量 · 已练进度 · 未掌握错题徽标」；点击章节卡片即可单独刷该章节。题库中出现但不在 `SUBJECTS` 章节常量内的章节会自动追加为卡片，保证题目可达。
- **刷题设置弹窗重构**（`openQuizModal(subjectId, chapter)`）：整科与各章节共用同一弹窗，范围（整科 / 单章节）经弹窗 `dataset` 传入 `startQuiz`；标题显示「科目 · 章节刷题设置」。
- **新模式「顺序只刷未掌握」**（`data-mode="fresh"`）：按题库顺序出「未答对过的题 + 错题本中未掌握的题」，跳过已答对且不在错题本的题，适合系统性过一遍不重复。
- **章节进度统计**：已练数按 `records` 中该科目已作答的 `question_id` 去重统计，未掌握数按 `wrongBook`（`!mastered`）统计——均基于现有本地数据计算，**不新增存储结构、不动数据库**。
- 刷题页顶栏标题显示范围：如「政治 · 马原」（整科刷题显示「政治」）。

### 变更
- `src/ui/home.ts`：移除旧版 `openSubject` 科目弹窗与 `toggleChapter`（章节多选标签 UI 由章节卡片替代），仅保留 `renderHome` / `selectMode`。
- `src/ui/quiz.ts` `startQuiz` 签名由 `(subjectId, btn)` 改为 `(btn)`：科目与章节范围改从弹窗 `dataset.subject` / `dataset.chapter` 读取；错题重做支持章节范围过滤；空题库提示区分「章节无题」与「科目无题」。
- `src/ui/navigation.ts`：科目详情页隐藏底部导航（与刷题/管理页一致）。
- `src/main.ts`：全局挂载新增 `openSubject` / `renderSubject` / `openQuizModal`（来自 subject.ts），移除 `toggleChapter`。
- `css/style.css`：新增 `.subject-hero` / `.chapter-section-title` / `.chapter-card` 系列样式（复用现有设计变量，暗色模式自动适配）。
- `scripts/smoke_test.cjs`：刷题入口断言同步新交互（科目详情页 → 弹窗 → 开始），新增 `SUBJECT_PAGE` / `MODES` 断言（章节卡片 ≥1、整科入口存在、标题正确、模式数 ≥3）。
- **APP_VERSION v3.8.1 → v3.9.0**；`public/sw.js` 缓存名同步 `kaoyan-v3.9.0`。

### 验证
- `npm run typecheck` 通过；`npm run test` 34/34 通过；`npm run build` 成功（产物 `index-CfEzN8Lk.css` / `index-Zhh8yxyX.js`）。
- Playwright 冒烟全绿（`SMOKE_EXIT=0`）：SUBJECT_PAGE `{"chapterCards":5,"hero":true,"title":"政治"}`、答题/提交/结算/错题本/统计/收藏/搜索/填空简答/主题/PWA 全部通过，JS_ERRORS none、NOT_FOUND none。

### 部署
- **线上部署完成（2026-08-30）**：沿用修复后的 .NET `ZipArchive` 打包方式（66 文件，0 反斜杠条目，校验通过）发布到 `llss.netlify.app`（Netlify Deploy API，deploy `6a937e40c5856e8582a97cb9`，ready 发布于 2026-08-30T00:50:09Z）；线上验证：首页 200 且含 `page-subject` 容器、`sw.js` 返回 `kaoyan-v3.9.0`、`assets/index-CfEzN8Lk.css` 与 `index-Zhh8yxyX.js` 均 200。

---

## v3.8.1（2026-08-30）favorites 表 DDL 云端执行完成（运维事项闭环）

> 版本说明：小版本 +1（运维产物 + 云端建表执行，无前端功能变化）。

### 变更
- **新增 `ddl_favorites.sql`**（项目根）：`favorites` 表幂等执行版 DDL——`CREATE TABLE IF NOT EXISTS` + `CREATE INDEX IF NOT EXISTS` + `ENABLE ROW LEVEL SECURITY` + `DROP POLICY IF EXISTS` / `CREATE POLICY`，可重复执行不报错；文件头注明两种执行方式（Dashboard SQL Editor / Management API）。内容与 `schema.sql` 第 53-81 行 favorites 段一致。
- **云端执行完成（2026-08-30）**：用户提供有效 PAT 后，通过 Management API（`POST /v1/projects/tszojqkktvyjzcgsyenn/database/query`）执行 `ddl_favorites.sql` 全部 5 段语句均返回 201；验证查询确认：`pg_tables` → `favorites` 存在且 `rowsecurity=true`；`information_schema.columns` → `id`(bigserial PK) / `question_id`(bigint NOT NULL，FK → questions ON DELETE CASCADE，UNIQUE) / `subject`(text NOT NULL) / `created_at`(timestamptz default now()) 齐备；`pg_indexes` → `favorites_pkey` + `favorites_question_id_key` + `idx_favorites_subject`；`pg_policies` → "Allow all on favorites"（FOR ALL USING true）。`syncFavoriteToDB` 云端收藏同步恢复可用。
- **PROJECT_GUIDE.md 同步**：项目树 `ddl_favorites.sql` 行、第 3 节数据库备注、4.3 存储策略收藏行、第 10 节「执行 v3.2.0 新增 DDL」状态块均更新为 2026-08-30 已执行完成；另修复 4.2 节版本常量行、4.3 节 Cache API 行的过时版本字符串（v3.7.0 / kaoyan-v3.7.0 → v3.8.1 / kaoyan-v3.8.1）。
- **APP_VERSION v3.8.0 → v3.8.1**；`public/sw.js` 缓存名同步 `kaoyan-v3.8.1`。
- **线上部署完成（2026-08-30）**：排查发现线上 `llss.netlify.app` 最后发布为 2026-08-25（v3.6.0 之前旧版，缺 PWA / 主题 / favorites 云同步）；用户提供 Netlify PAT 后，通过 Netlify Deploy API（`POST /v1/sites/38b9bbf0-39f6-4610-a09a-79be94755f17/deploys`，zip 包 1.04MB）发布 v3.8.1 构建产物，deploy `6a93780f9a910429aec382e5` 状态 ready 并已发布；线上验证：首页 200 / hashed JS/CSS（index-Bj8hzJDQ.js / index-1RkQZVUU.css）/ `sw.js` 返回 `kaoyan-v3.8.1` / manifest 可访问。Netlify Token 按安全惯例不入库，用完即弃，建议后台撤销。
- **部署修复（2026-08-30，样式错乱）**：首次部署后用户反馈前端样式错乱。定位根因：PowerShell 5 `Compress-Archive` 生成的 zip 内部路径使用反斜杠 `\` 分隔子目录（`assets\index-*.css`），Netlify 解压后子目录资源全部 404（首页/根目录文件正常，CSS/JS/图标缺失）→ 页面无样式无脚本。修复：改用 .NET `System.IO.Compression.ZipArchive` 手动打包（`Replace('\\','/')` 强制正斜杠，66 个文件路径全部校验正确），重新部署 deploy `6a9378e9d8a9018c3fb32667`（ready，2026-08-30T00:27:22Z 发布）；线上复查 6 项资源全部 200（`/`、`index-1RkQZVUU.css`、`index-Bj8hzJDQ.js`、manifest、icon.svg、sw.js）。前端源码/构建产物 hash 未变，版本保持 v3.8.1。

### 说明
- PAT 按安全惯例不入库记录，仅在执行时经环境变量传入（请求封装见 `supabase_import_v5.py`）。
- 云端 `favorites` 表与本地 `kaoyan_favorites` 的映射关系、合并规则见 GUIDE 第 4.3 节；重建库/初始化新项目时可复用 `ddl_favorites.sql`。
- typecheck + build + 冒烟全绿（版本显示 v3.8.1）。

---

## v3.8.0（2026-08-30）单元测试基础设施（P3-4）

> 版本说明：清单功能项按惯例次版本 +1（与 v3.1.0–v3.7.0 记档方式一致）。本轮为代码质量基础设施（新增测试目录 + 测试脚本 + 依赖实装），无用户可见功能变化。

### 新增
- **单元测试落地**（Vitest 3.2.7，`npm run test` = `vitest run`，此前 devDeps 已声明但依赖未安装、测试未编写）：
  - `test/setup.ts`：Node 环境 `localStorage` 内存 shim（`Object.defineProperty(globalThis, ...)`），支持 `getItem/setItem/removeItem/clear/key/length`，覆盖 `src/storage.ts` 与 `src/streak.ts` 对 Storage 的全部调用面。
  - `test/judge.test.ts`（10 用例）：`judgeAnswer` 单选/判断大小写与空白归一、多选字母顺序无关与漏选/多选判错、填空 `|` 多候选命中 + 全角转半角/大小写/空白/标点归一化 + 空输入与无候选边界；`formatCorrectAnswer` 填空「或」连接；`isManualType` 仅 essay。
  - `test/streak.test.ts`（10 用例）：`dateKey` 补零；`calcStreak` 用 `vi.setSystemTime` 固定"今天"（2026-08-30）断言：空集/仅今天/连续三天/昨天起算/断档归零/中断只计今天/跨月连续/同日去重；`studyDays` 从 `kaoyan_today_` 前缀提取日期。
  - `test/merge.test.ts`（14 用例）：`mergeRecords` 并集去重（question_id|created_at|is_correct|user_answer 组合键）、created_at 升序、空 id 跳过、1000 条上限；`mergeWrongBook` 题目缓存外行跳过、云端更晚覆盖且 mastered 取或、云端更旧保留本地；`mergeDailyStats` 历史日期直写、今天已有本地数据不被覆盖、空日期跳过；`mergeFavorites` 缓存外跳过、更新/保留 favoritedAt 的时间戳比较。
- **Vitest 配置**（`vite.config.ts`）：`/// <reference types="vitest/config" />` 三斜线引用 + `test: { environment: 'node', setupFiles: ['./test/setup.ts'], include: ['test/**/*.test.ts'] }`；保持单一配置文件，`vite build/dev` 不受影响。
- **依赖实装**：`npm install` 补装已声明的 `vitest@^3.1.3`（实际解析 3.2.7）与 `vite-plugin-pwa`（仍不使用，维持手写 PWA 方案，见 v3.7.0）。

### 说明
- 选型：测试仅覆盖**纯函数层**（判定/打卡/合并），浏览器交互层由既有冒烟测试（`scripts/smoke_test.cjs`）覆盖，二者互补；未引入 jsdom/happy-dom（零额外依赖，localStorage shim 足够）。
- `tsconfig.json` include 原已含 `test` 目录（此前预留），本次测试文件纳入 `npm run typecheck` 严格模式检查。
- 验证结果：`npm run test` → **34 passed (3 files)**；`npm run typecheck` 通过；`npm run build` 通过（KaTeX 字体 chunk 警告不变）。
- APP_VERSION v3.7.1 → v3.8.0；`public/sw.js` 缓存名同步 `kaoyan-v3.8.0`。
- PROJECT_GUIDE.md 已同步：项目树新增 `test/`、第 4 节版本常量、第 9 节 P3-4 勾选、第 10 节快速操作新增单测命令。

---

## v3.7.1（2026-08-29）政治时效性题目定期更新运维文档化（P2-8）

> 版本说明：小版本 +1。本轮为**文档 + 流程变更**（无前端功能改动），为遵循"生成的产物进行版本管理、小改动小版本号"的规则，升次版本记档。

### 变更
- **PROJECT_GUIDE.md 第 8 节新增「⏰ 政治时效性题目定期更新（P2-8，v3.7.1）」运维文档小节**，把政治题库的时效性更新固化为可复制流程：
  - 更新范围表：年度考研真题（每年初）、时政热点（季度/月）、名师新资料（上市时）、大纲新增考点（9 月大纲发布后）。
  - 完整链路 6 步：补全外部源（夸克网盘 `kyzz_question.sql` / `maogai_all.json` / `kyzz_json/` / `brush_data/`，踩坑 #14）→ 生成/转换（`convert_politics.js`）→ `integrate_all.py` 整合去重 → 校验（9852 + 净增口径，踩坑 #6/#7/#16）→ `supabase_import_v5.py` 导入（PAT 需先更新，当前已 401）→ `npm run build` 部署。
  - 时效性标识规范：`source` 字段必填（`2025年真题` / `肖秀荣2026年1000题` 等），利用"来源增强"去重规则（踩坑 #4）保留下线外过时题的自然淘汰策略。
  - 版本与记录：每次题库更新小版本号 +1 并同步 `APP_VERSION` + CHANGELOG 记录前后题量。
- **修正 PROJECT_GUIDE 5.1 节 `gen_politics_full.js` 错误产物描述**（原记为 `→ seed_politics_1000.sql (6618题)`）：实际该脚本未完成（仅 马原/毛中特/习思想 三个生成函数定义，无 SQL 渲染与写出逻辑），政治新题转换实际入口为 `convert_politics.js`（真题 kyzz_json 2010-2024 + brush_data 练习 + maogai_all.json → `seed_politics_1000.sql`）。
- **第 9 节待办勾选**：政治时效性题目定期更新 [x]（原文案为待办，现以运维文档形式闭环）。
- **APP_VERSION v3.7.0 → v3.7.1**（`src/constants.ts`，管理页底部实时显示）。
- **PWA 缓存名同步**：`public/sw.js` `CACHE = 'kaoyan-v3.7.0' → 'kaoyan-v3.7.1'`，保证 activate 阶段清理上一版本缓存。

### 说明
- 本轮未改动任何前端功能代码；题库数据本身未更新（线上仍 9852 题 / 政治 6618 题，后续实际更新题目时按新增文档流程执行并另行记档）。
- typecheck（tsc --noEmit）+ `vite build` 通过（KaTeX 字体 chunk 警告不变）。

---

## v3.7.0（2026-08-29）PWA 离线支持（P2-7）

> 版本说明：小版本 +1（新增功能在 3.x 线内以次版本记档，与 v3.1.0–v3.6.0 记档方式一致）。

### 新增
- **PWA 资源目录**（`public/`，构建时 Vite 原样复制到 `dist/`）：
  - `manifest.webmanifest`：应用清单（名称/描述/`lang:zh-CN`/`start_url:"/"`/`scope:"/"`/`display:"standalone"`/主题色 `#4B3FE3`/深浅背景色 + SVG 图标）。
  - `icons/icon.svg` + `icons/icon-maskable.svg`：应用图标（占位方案，纯 SVG，支持自动换档的 `purpose:any` 与 `purpose:maskable`）。
  - `sw.js`：Service Worker。**install**：预缓存固定列表（`/`、`/index.html`、manifest、图标）后动态 `fetch('/')` 解析 index.html 中所有 `src`/`href` 绝对路径资源（解决 Vite 构建产物 hashed 文件名不可预测问题）；**fetch**：统一「网络优先 + 缓存回填（含 `/index.html` 兜底）+ 成功响应写缓存」策略（同源 GET 才处理，跨域 API 不缓存）；**activate**：删除旧版本缓存 + `clients.claim()`。缓存名 `kaoyan-v3.7.0`。
- **入口注入**（`index.html`）：`<meta name="theme-color">`、`<link rel="manifest">`、iOS standalone 相关 meta（`apple-mobile-web-app-capable` / `apple-mobile-web-app-status-bar-style` / `apple-touch-icon`）。
- **注册模块**（`src/pwa.ts`）：`registerSW()`——`'serviceWorker' in navigator` 能力检查后在 `window load` 事件中 `navigator.serviceWorker.register('/sw.js')`，失败静默告警；`src/main.ts` DOMContentLoaded 起始调用。
- **部署放行**（`vercel.json`）：在 SPA 兜底重写 `/(.*)` → `/index.html` 之前显式放行 `/sw.js`、`/manifest.webmanifest`、`/icons/(.*)`，保证静态文件命中（文件系统优先 + 白名单双保险）。
- **冒烟测试扩展**（`scripts/smoke_test.cjs`）：新增 PWA 断言块——`serviceWorker in navigator`、`<link rel="manifest">` 存在、`/manifest.webmanifest` 可 fetch 200、`navigator.serviceWorker.ready` 注册成功；退出条件同步更新。

### 说明
- 缓存策略选型：为保证开发期不因缓存出陈旧代码，fetch 一律**网络优先、离线回退缓存**；离线时页面壳 + 静态资源可加载，业务数据读写仍走 localStorage（`kaoyan_` 键）与 Supabase 云端（见 PROJECT_GUIDE 4.3）。
- 冒烟测试在 dev server（localhost:5173）下验证注册链路；生产部署时 install 解析的是 `dist/index.html`，可正确预缓存 hashed JS/CSS 与 KaTeX 字体（已 glob 确认全部字体在 `dist/assets/` 且 index.html 均以绝对路径引用）。
- APP_VERSION v3.6.0 → v3.7.0。
- typecheck（tsc --noEmit）+ `vite build` 通过（KaTeX 字体 chunk >500 kB 警告不变；**`dist/` 已确认含 `sw.js` / `manifest.webmanifest` / `icons/`**）。
- 冒烟测试全绿：`PWA: {"swSupported":true,"manifestLink":true,"manifestOk":true,"swRegistered":true}`，`SMOKE_EXIT=0`，`JS_ERRORS:none` / `NOT_FOUND:none`，版本显示「当前版本 v3.7.0」。
- PROJECT_GUIDE.md 已同步：项目树（src/pwa.ts + public/）、第 4 节版本常量 v3.7.0、4.2 模块表、4.3 存储策略（Cache API 层说明）、4.4 初始化流程、第 9 节 P2-7 勾选、第 10 节冒烟覆盖描述。

---

## v3.6.0（2026-08-29）深色模式（P2-6）

> 版本说明：小版本 +1（新增功能在 3.x 线内以次版本记档，与 v3.1.0–v3.5.0 记档方式一致）。

### 新增
- **主题模块**（`src/ui/theme.ts`）：`initTheme()` 应用主题（`data-theme` 属性 → `html[data-theme="dark"]`）；`toggleTheme()` 切换并持久化到 `kaoyan_theme`。首次访问无保存值时跟随系统 `prefers-color-scheme`。
- **切换入口**（`index.html`）：首页 topbar 新增 🌙/☀️ 按钮（`#themeToggle`，`onclick="toggleTheme()"`），图标随当前主题切换。
- **防闪烁**：`index.html` `<head>` 新增同步内联脚本，在 CSS 渲染前读取 `kaoyan_theme` / 系统偏好设置 `data-theme`，避免深色用户首屏白闪。
- **样式**（`css/style.css`）：暗色变量（`--bg:#111827` / `--card:#1F2937` 等）与各组件暗色覆盖规则此前已随 v3.3.0 预置，本轮正式启用并修正注释标签为 v3.6.0。
- **全局暴露**（`src/main.ts`）：windowApi 新增 `toggleTheme`，DOMContentLoaded 起始调用 `initTheme()`。
- **冒烟测试扩展**（`scripts/smoke_test.cjs`）：新增 THEME 流程——点击切换 → 断言 `data-theme="dark"` + 按钮变 ☀️ → `page.reload` 验证持久化 → 再切换回 light；退出条件同步更新。

### 说明
- `kaoyan_theme` 为全局设置，所有页面共享 `html[data-theme]`；仅首页提供切换入口（默认页，切换后全局生效）。
- 未保存过主题时跟随系统；手动切换后以手动值为准（localStorage 优先）。
- APP_VERSION v3.5.0 → v3.6.0。
- typecheck（tsc --noEmit）+ `vite build` 通过（KaTeX 字体 chunk 警告不变；dist 产物已生成）。
- 冒烟测试全绿：`THEME: {"btn":true,"toggleDark":true,"persist":true,"backLight":true}`，`SMOKE_EXIT=0`，`JS_ERRORS:none` / `NOT_FOUND:none`，版本显示「当前版本 v3.6.0」。
- PROJECT_GUIDE.md 已同步：项目树新增 theme.ts、第 4 节版本常量（修正 v3.2.0 旧值 → v3.6.0）、4.2 模块表、4.3 存储策略新增主题行、4.4 初始化流程、第 9 节 P2-6 勾选、第 10 节冒烟覆盖描述。

---

## v3.5.0（2026-08-29）LaTeX 数学公式渲染（P2-5）

> 版本说明：小版本 +1（新增功能在 3.x 线内以次版本记档，与 v3.1.0–v3.4.0 记档方式一致）。

### 新增
- **KaTeX 依赖**：新增 `katex@^0.16.47`（运行时）与 `@types/katex@^0.16.8`（devDependency）；CSS 由 `src/main.ts` 首行 `import 'katex/dist/katex.min.css'` 引入，字体随构建打包。
- **`formatMath()` 重写**（`src/utils.ts`）：先对非数学文本做 HTML 转义（防注入），再按 `$$...$$`（块级，`.math-block` 包裹）→ `$...$`（内联，`.math-inline` 包裹）顺序用 `katex.renderToString(tex, { throwOnError:false, displayMode })` 渲染；渲染失败回退为转义原文。历史 Unicode 上/下标字符（`x²₀` 等）保留 `applySupSub` → `<sup>/<sub>` 兜底，既存题目不受影响。
- **全链路接入**：错题本（`src/ui/wrongbook.ts` 题干/选项/答案/解析）本轮显式接入；答题页 / 收藏页 / 搜索结果此前已调用 `formatMath`，自动获得 LaTeX 渲染能力。
- **Demo 题目**（`src/ui/admin.ts`）：新增 2 道 LaTeX 数学题（1 道单选：`f(x)=ln(1+x)` 求导，含块级公式；1 道填空：第一重要极限 `\lim_{x\to0}\sin x/x`）。
- **样式**（`css/style.css`）：`.math-inline{white-space:nowrap}`、`.math-block` 居中 + 横向滚动兜底、暗色模式下 `.katex` 跟随主题文字色。
- **冒烟测试扩展**（`scripts/smoke_test.cjs`）：巡题流程统计页面 `.katex` 出现次数（`katexHit`），断言 ≥1，退出条件同步更新。

### 说明
- 转义先行保证 XSS 边界：题目文本先 `escapeHtml` 再交由 KaTeX 渲染，仅有 `$...$` / `$$...$$` 片段按 LaTeX 处理。
- 新题目可直接书写 `$...$`（内联）/ `$$...$$`（块级），无需任何额外配置。
- APP_VERSION v3.4.0 → v3.5.0。
- typecheck（tsc --noEmit）+ `vite build` 通过（KaTeX 字体致 chunk >500 kB 警告，非错误；dist 产物已生成）。
- 冒烟测试全绿：`SMOKE_EXIT=0`，`FILL_ESSAY={"fillHit":2,"essayHit":1,"katexHit":2}`，`SEARCH found:3`，`JS_ERRORS:none` / `NOT_FOUND:none`。
- PROJECT_GUIDE.md 已同步：项目树 utils 注释、第 4.2 节版本常量与模块表、踩坑 5（Unicode 上下标 → KaTeX 方案）、第 8 节渲染规范、第 9 节 P2-5 勾选。

---

## v3.4.0（2026-08-29）题目搜索功能（P2-4）

> 版本说明：小版本 +1（新增功能在 3.x 线内以次版本记档，与 v3.1.0–v3.3.0 记档方式一致）。

### 新增
- **首页搜索框**（`index.html` + `css/style.css`）：首页 `#todayStats` 下方新增搜索框（占位提示：极限、KVL、马原），回车或点击 🔍 触发搜索；复用 v2 遗留的 `.search-box` / `.search-result` 样式。
- **搜索模块**（`src/ui/search.ts`）：`doSearch()` 对本地 `kaoyan_questions` 缓存做关键词匹配（题干 + 章节 + 来源 + 解析 + 选项，大小写不敏感，最多返回 50 条；本地缓存为空且已连 Supabase 时先从云端拉全量回填）；`startSearchQuiz(index)` 点击结果卡片以单题精练（`· 搜索精练`）方式进入答题页。
- **结果列表**：显示科目 / 题型 / 章节标签 + 题干截断两行；点击卡片即开始作答；无结果显示空状态「未找到相关题目」。
- **冒烟测试扩展**：新增 SEARCH 流程（输入关键词「极限」→ 搜索结果 ≥1 → 点击进入答题 → 校验 `q-title` 渲染 → 退出），断言 `found ≥ 1` 且 `clickOk`；退出条件同步更新。

### 说明
- 搜索基于本地缓存实现，离线可用；不新增存储键，不触碰云端 schema。
- APP_VERSION v3.3.0 → v3.4.0。
- 冒烟测试全绿：`SEARCH: {"found":2,"clickOk":true,"title":"数学二 · 搜索精练"}`，`SMOKE_EXIT=0`，`JS_ERRORS:none` / `NOT_FOUND:none`。
- typecheck（tsc --noEmit）+ `vite build` 通过（62 modules，新增 search.ts；dist 产物已生成）。
- PROJECT_GUIDE.md 已同步：第 9 节 P2-4 勾选、第 4.2 节模块定位表新增 `doSearch` / `startSearchQuiz` / streak / favorites 条目并更新版本常量、项目树补 search.ts。

---

## v3.3.0（2026-08-29）学习连续打卡天数统计（P2-3）

> 版本说明：小版本 +1（新增功能在 3.x 线内以次版本记档，与 v3.1.0 / v3.2.0 记档方式一致）。

### 新增
- **连续打卡纯函数模块**（`src/streak.ts`）：`dateKey()`（Date → `YYYY-MM-DD`）、`studyDays()`（扫描 localStorage 中 `kaoyan_today_*` 键收集有学习记录的日期）、`calcStreak()`（今天有记录则从今天起连续计数，今天无记录则从昨天起算，昨天也没有则返回 0）。沿用 judge.ts 纯函数模式，可单测。
- **首页展示**（`index.html` + `src/ui/home.ts`）：`#todayStats` 新增第 4 格「连续打卡」，`renderHome()` 渲染 `calcStreak(studyDays())`。
- **统计页展示**（`src/ui/stats.ts`）：`.stats-overview` 新增第 4 个 stat-item「连续打卡」。
- **布局调整**（`css/style.css`）：`.today-stats` 与 `.stats-overview` 由 3 列改为 4 列 grid；`grid-template-columns: repeat(4,1fr)`。

### 说明
- 数据来源复用现有每日统计键 `kaoyan_today_YYYY-MM-DD`（答题成功/错题记录时写入），无新存储键；9/9 无记录时展示 0。
- 冒烟测试扩展：HOME 块断言 `todayStreak`、STATS 块断言 `streakItem === '连续打卡'` 与 `gridItems === 4`，全绿 `SMOKE_EXIT=0`。
- typecheck（tsc --noEmit）+ `vite build` 通过（61 modules，新增 streak.ts；dist 产物已生成）。
- PROJECT_GUIDE.md 第 9 节 P2-3 已勾选。

---

## v3.2.0（2026-08-29）收藏 / 标记功能（P2-2）

> 版本说明：P2-2 新增功能在 3.x 线内以次版本 v3.2.0 记档（主版本跳升已在 v3.0.0 架构拆分时使用，与 v3.1.0 记档方式一致）。

### 新增
- **答题页星标收藏**（`src/ui/quiz.ts`）：每道题右上角 ☆/★ 切换，本地 `kaoyan_favorites` 保存完整题目快照（含 `favoritedAt`，离线可用）；全局暴露 `isFavorite()` / `toggleFavorite()`。
- **收藏页**（`src/ui/favorites.ts` + `index.html` 新增 4 号页面 + 底部导航第 4 个 tab）：科目筛选 chips（含各科计数）、收藏卡片列表（题型/科目/章节 + 数学格式化题干）、「开始作答」一键进入刷题、「取消收藏」；`startFavQuiz()` 按当前筛选科目初始化刷题会话。
- **云端镜像**（`src/api.ts`）：`syncFavoriteToDB()` 收藏时对 `favorites` 表 upsert（`onConflict: 'question_id'`）、取消时按 `question_id` 删除；`pullFromDB()` 启动拉取并新增 `mergeFavorites()`，仅当云端 `created_at` 比本地新时用本地题目缓存重建完整快照；同步失败静默，不影响离线。
- **`schema.sql` 新增 `favorites` 表**：`question_id` UNIQUE + FK CASCADE、`subject`、`created_at`，附 `idx_favorites_subject` 索引与 RLS 开放策略。—— DDL 已同步至 PROJECT_GUIDE 第 10 节；**线上执行待 PAT 更新**（当前 PAT 401 失效，云端收藏同步暂静默失败，本地功能不受影响）。

### 修复
- **收藏 id 类型不匹配**：localStorage 中 `Question.id` 为 number，内联 `onclick="removeFavorite('${q.id}', this)"` 传入字符串，`f.id === id` 严格比较恒 false，导致取消收藏保存不生效。全链路改为 `String()` 规范化比较（`isFavorite` / `toggleFavorite` / `removeFavorite`），冒烟测试重新验证通过。

### 说明
- 冒烟测试新增收藏流程：进入 math2 → 点 ☆ → 收藏页出现 1 张卡片 → 点「取消收藏」→ 卡片移除；输出 `FAVORITES: {"favBtn":true,"toggleActive":true,"listCount":1,...,"removed":true,"removeCard":true}`，`SMOKE_EXIT=0` 全绿。
- typecheck（tsc --noEmit）+ `vite build` 通过（60 modules，dist 产物已生成）。
- PROJECT_GUIDE.md 已同步：第 4.3 节存储策略新增 favorites 行（⏳ 云端待建表）、第 3 节表结构新增 favorites DDL 与 5 张表说明、module 定位表补充 `syncFavoriteToDB` / `mergeFavorites`、第 9 节 P2-2 勾选、第 10 节新增 favorites 建表指南（待 PAT 更新）。

---

## v3.1.0（2026-08-29）新题型：填空 / 简答

> 版本说明：v3.0.0（架构拆分，主版本+1）与 P2-1 新题型在本次交付批次一起完成；P2-1 在 3.x 线内以次版本 v3.1.0 记档，避免同一批次重复跳主版本。

### 新增
- **填空 / 简答题型全链路支持**（P2-1）：
  - `src/judge.ts` 新增判定纯函数：`judgeAnswer(type, userAnswer, correctAnswer)` —— fill 用 `|` 分隔多个可接受答案（如 `1|一`），全半角/大小写/标点规范化后匹配；multiple 排序后比对；其余类型大小写规范化后比对。`formatCorrectAnswer()` 把 fill 多候选以"或"连接展示；`isManualType()` 标记需人工判定的题型（简答），为单元测试提供纯净的复用入口。
  - `src/ui/quiz.ts`：填空题渲染输入框，提交后自动判题（对/错高亮 + readonly）；简答题渲染多行文本框，提交后展示参考答案并出现**自评按钮**（"我做对了 / 我做错了"），通过全局 `selfAssess(correct)` 记账。横切重构：抽取 `recordResult()`（今日统计 + 记录 + 错题本 + 云同步）与 `showFeedback()`（统一反馈区渲染，正确答案用 formatCorrectAnswer 格式化），判题/记账不再重复。
  - `src/ui/admin.ts`：管理端新增题型下拉选项（`fill` 填空题 / `essay` 简答题），这两类题目 options 自动置空；demo 数据新增 1 道填空（math2 第一重要极限）+ 1 道简答（circuit KVL 简述）。
  - `index.html`：添加题目表单题型下拉新增两项，答案占位符提示填空可用 `|` 分隔多候选、简答填参考答案。
- **冒烟测试扩展**（`scripts/smoke_test.cjs`）：新增巡题流程，在 math2 命中填空题、circuit 命中简答题并走完"作答→提交→判题/自评→反馈"链路；修复沙箱干扰：改用 `launchPersistentContext` + 项目内独立 user-data-dir，隔离 Edge 对系统路径的访问。

### 说明
- 全局 `selfAssess` 由 `src/main.ts` 的 `windowApi` 暴露（页面内联 `onclick` 依赖）。
- 冒烟测试全绿：`JS_ERRORS:none / NOT_FOUND:none / fillHit:1 / essayHit:1`，typecheck + `vite build` 通过。
- PROJECT_GUIDE.md 已同步：第 4 节重写为 Vite + TS 架构与模块定位表、第 1/2/9/10 节更新、第 6 节补充行号时效性提示。

---

## v3.0.0（2026-08-29）架构拆分：单文件 → Vite + TypeScript（P3）

v2 单文件 SPA（index.html 内联 CSS/JS）拆分为工程化多文件：TS strict 类型检查 + Vite 打包构建，行为等价（冒烟测试验证首页/弹窗/答题/结果/错题本/统计/管理全流程）。

### 工程调整
- **拆分结果**：`index.html`（框架 HTML，5 个 page div + 管理表单）+ `css/style.css`（全部样式）+ `src/*.ts`（ES Module 逻辑）。
- **模块划分**：`src/types.ts`（类型）、`constants.ts`（SUBJECTS / APP_VERSION）、`storage.ts`（localStorage 封装）、`state.ts`（quizState）、`utils.ts`（shuffle / formatMath / toast）、`api.ts`（Supabase + 云同步 + 拉取合并）、`ui/`（home / quiz / wrongbook / stats / admin / navigation 六模块）、`main.ts`（`Object.assign(window, windowApi)` 暴露全局函数 + DOMContentLoaded 初始化）。
- **Supabase 接入**：CDN 动态加载 UMD → `@supabase/supabase-js@2` 静态 ES import；`initSupabase()` 总是创建客户端，初始化时序简化（无需等 script.onload），离线兜底与 `pullFromDB()` 拉取合并保留。
- **构建工具链**：`package.json`（Vite 6 + TypeScript 5，npm scripts：`dev` / `build` / `typecheck`）、`tsconfig.json`（strict + noUnusedLocals/Parameters:false）、`vite.config.ts`。
- **冒烟测试**（`scripts/smoke_test.cjs`）：playwright-core + 系统 Edge 无头模式，覆盖 8 段核心流程 + 收集 console.error / 404；data-URI favicon 消除 404。
- **APP_VERSION v2.1.0 → v3.1.0**（架构变更 → 主版本 +1 → v3.0.0；与 P2-1 同批次交付，实际落版本为 v3.1.0，见上条版本说明）。

### 说明
- 存储键不变（`kaoyan_` 前缀），云同步双向机制不受拆分影响；行为等价已由冒烟测试确认。
- 源码从单文件提取时修复 2 处 TS 严格模式报错（`.option` letter 判空守卫）。
- PROJECT_GUIDE.md 第 1/2/4/9/10 节同步为 Vite + TS 架构。

---

## v2.1.0（2026-08-29）功能升级：云同步补齐双向

v2.0.0 的云同步"只推不拉