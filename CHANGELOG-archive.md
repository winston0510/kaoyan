# CHANGELOG 归档（精要版）

> v4.2.1 及更早版本的记录。受 MCP 单次推送体量限制以精要形式归档；完整权威记录以仓库本地 `CHANGELOG.md` 为准。

---

## v4.2.1（2026-08-31）iOS「添加到主屏幕」支持 + 苹果风 PNG 应用图标

> 版本说明：**次版本号 +1**（小改动：PWA 图标 PNG 化 / 苹果风重绘 + meta 修正，无功能 / 架构变化）。
- **新增 4 枚苹果风 PNG 图标**（GDI+ 矢量绘制：紫色渐变底 #8165FF→#382DAA + 白色翻开书本 + 深紫圆底白对勾徽章）：`apple-touch-icon.png`（180，iOS 主屏专用）、`icon-192.png`、`icon-512.png`、`icon-maskable-512.png`（0.72 安全区）。
- **变更**：`index.html` apple-touch-icon 改 PNG（iOS 不渲染 SVG 主屏图标）+ 新增 `mobile-web-app-capable` meta；manifest icons 追加 3 枚 PNG；APP_VERSION v4.2.0→v4.2.1，sw 缓存 `kaoyan-v4.2.1`。
- **验证**：typecheck / build 通过（产物 `index-CzUDMMwG.js` 591.86 kB）；图标目检符合 iOS 美学。
- **部署**：`dist-deploy.zip`（70 文件，1,090,818 B）发布到 `llss.netlify.app`，deploy `6a955e8e925ac48455feba70` ready（2026-08-31T10:59:27Z）；线上验证全绿（sw 缓存名 / 新 bundle / 四枚 PNG 200 / manifest 含 3 条 PNG）。
- **使用**：iPhone Safari 打开 `llss.netlify.app` → 分享 → 添加到主屏幕，全屏独立应用打开。
- **GitHub 同步**：manifest+sw.js（`c353b0e`）、index.html（`67a88f1`）、constants.ts（`a907007`）；历史版本归档 `CHANGELOG-archive.md`（`cae6eba`）；遗留临时文件已清理；4 枚 PNG 为二进制，MCP 通道仅支持文本，暂不入库。

---

## v4.2.0（2026-08-31）历年真题 + 名师题全量入库：题库新增 363 题（9,852 → 10,215）

> 版本说明：**次版本号 +1**（题库数据大增量 + 集成脚本调整）。
- **新增 5 个种子文件 363 题**：英语二完形 100（2020-2024，【第N空】前缀）、英语二阅读 100、数学二 2020-2022 真题 67、数学二 2023-2024 真题 44、名师题 52（张宇1000题 16 / 武忠祥 16 / 汤家凤1800 15 / 恋练有词 5）。
- **变更**：`integrate_all.py` 注册块换用 cloze+reading；`seed_all_final.sql` 重生成 10,215 题（数学 1,344 / 英语 1,154 / 电路 1,099 / 政治 6,618）零误删；删除损坏 `seed_real_english.sql`；新增 3 份独立日志；APP_VERSION→v4.2.0。
- **验证**：node 复核 363 题全通过；typecheck / build 通过。
- **部署**：Netlify deploy `6a954e38b54da3e914aa8e52` ready（2026-08-31T09:49:45Z），线上验证全绿；363 题经 Supabase 导入后生效；GitHub 同步含 `integrate_all.py`（`225efa8`）。

---

## v4.1.1（2026-08-30）知识库多科目文案通用化（修正「条公式」硬编码）

> 版本说明：**次版本号 +1**。
- **修复**：`KnowledgeTopic` 新增可选 `unit` 字段（默认「条公式」，英语二「个知识点」）；「📖 公式速查」→「📖 知识点速查」。
- **变更**：`knowledge-data.ts` / `knowledge.ts`（`topicUnit()` 替换 4 处硬编码）；APP_VERSION→v4.1.1。
- **验证**：typecheck / test 34/34 / build 通过。
- **部署**：Netlify deploy `6a94bf684d7584dd913a54ff` ready；GitHub 全项目同步 `dae13b0b` + 补同步 `413cde1f`（477 行一致）；Netlify PAT 存 `.local/netlify_token.txt` 不入库。

---

## v4.1.0（2026-08-30）知识库新增「电路」「英语二」两大主题 + 记忆卡片样式美化

> 版本说明：**次版本号 +1**（知识库内容扩展 + 样式优化）。
- **新增**：电路主题（⚡ #F39C12）2 板块 9 节 31 条目 + 8 提示 + 28 卡片；英语二主题（🔤 #3498DB）6 板块 16 节 58 条目 + 10 提示 + 29 卡片。
- **变更**：`KNOWLEDGE_TOPICS` 1→3 主题（共 129 条目、105 卡片）；记忆卡片 3D 翻转增强 + 胶囊徽标 + hover 浮起 + `prefers-reduced-motion` 降级 + 暗色模式；APP_VERSION→v4.1.0。
- **验证**：typecheck / test 34/34 / build 通过；Playwright 冒烟：105 张翻卡全部可翻，无 JS 错误。

---

## v4.0.0（2026-08-30）新增「知识库」功能模块：数学二公式速查 + 记忆卡片

> 版本说明：**主版本号 +1**（大改动：新增功能模块）。
- **新增**：底部导航第 5 项「知识库」；`knowledge-data.ts` 通用数据源（接口 + 工厂函数），首主题 math2-knowledge：高数 9 节 + 线代 6 节共 40 条公式、10 条提示、48 张记忆卡片；`knowledge.ts` 双标签详情（公式速查 / 记忆卡片、章节折叠、3D 翻卡自测）；KaTeX 兼容处理（替换不支持宏、多公式换行）。
- **变更**：`index.html` `#page-knowledge` + 导航项；`navigation.ts` / `main.ts` 分支与全局函数；`style.css` 知识库样式全套；APP_VERSION v3.11.1→v4.0.0。
- **验证**：typecheck / test 34/34 / build 通过；Playwright 冒烟：导航 5 项、KaTeX 245 处、48 翻卡、无 JS 错误。
