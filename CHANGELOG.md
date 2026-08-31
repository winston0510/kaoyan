# 修改日志 (CHANGELOG)

> 版本规则：**大改动**（新增功能、架构变更）→ 主版本号 +1；**小改动**（Bug 修复、细节优化）→ 次版本号 +1。
> 版本号常量位于 `src/constants.ts`（v3.0.0 前位于 `index.html` 顶部），管理页底部实时显示。
> 注：GitHub 端副本受 MCP 单次推送体量限制为精要版，完整权威记录以仓库本地 `CHANGELOG.md` 与各 `*.changelog.log` 为准。

---

## v4.2.1（2026-08-31）iOS「添加到主屏幕」支持 + 苹果风 PNG 应用图标

> 版本说明：**次版本号 +1**（小改动：PWA 图标 PNG 化 / 苹果风重绘 + meta 修正，无功能 / 架构变化）。
- **新增 4 枚苹果风 PNG 图标**（GDI+ 矢量绘制：紫色渐变底 #8165FF→#382DAA + 白色翻开书本 + 深紫圆底白对勾徽章）：`apple-touch-icon.png`（180，iOS 主屏专用）、`icon-192.png`、`icon-512.png`、`icon-maskable-512.png`（0.72 安全区）。
- **变更**：`index.html` apple-touch-icon 改 PNG（iOS 不渲染 SVG 主屏图标）+ 新增 `mobile-web-app-capable` meta；manifest icons 追加 3 枚 PNG；APP_VERSION v4.2.0→v4.2.1，sw 缓存 `kaoyan-v4.2.1`。
- **验证**：typecheck / build 通过（产物 `index-CzUDMMwG.js` 591.86 kB）；图标目检符合 iOS 美学。
- **部署**：`dist-deploy.zip`（70 文件，1,090,818 B）发布到 `llss.netlify.app`，deploy `6a955e8e925ac48455feba70` ready（2026-08-31T10:59:27Z）；线上验证全绿（sw 缓存名 / 新 bundle / 四枚 PNG 200 / manifest 含 3 条 PNG）。
- **使用**：iPhone Safari 打开 `llss.netlify.app` → 分享 → 添加到主屏幕，全屏独立应用打开。
- **GitHub 同步**：manifest+sw.js（`c353b0e`）、index.html（`67a88f1`）、constants.ts（`a907007`）；遗留临时文件已清理；4 枚 PNG 为二进制，MCP 通道仅支持文本，暂不入库。

---

## v4.2.0（2026-08-31）历年真题 + 名师题全量入库：题库新增 363 题（9,852 → 10,215）

> 版本说明：**次版本号 +1**（题库数据大增量 + 集成脚本调整）。
- **新增 5 个种子文件 363 题**：英语二完形 100（2020-2024，【第N空】前缀）、英语二阅读 100、数学二 2020-2022 真题 67、数学二 2023-2024 真题 44、名师题 52（张宇1000题 16 / 武忠祥 16 / 汤家凤1800 15 / 恋练有词 5）；均含标准来源、章节归类、非空解析。
- **变更**：`integrate_all.py` 注册块换用 cloze+reading 两文件；`seed_all_final.sql` 重生成 10,215 题（数学 1,344 / 英语 1,154 / 电路 1,099 / 政治 6,618）零误删；删除损坏 `seed_real_english.sql`；新增 3 份独立日志；APP_VERSION→v4.2.0，sw 缓存同步。
- **验证**：node 正则复核 363 题全通过（章节 / 来源 100% 标准、解析零空）；typecheck / build 通过。
- **部署**：Netlify deploy `6a954e38b54da3e914aa8e52` ready（2026-08-31T09:49:45Z），线上验证全绿；363 题经用户 Supabase 导入后生效；GitHub 同步含 `integrate_all.py`（`225efa8`）。

---

## v4.1.1（2026-08-30）知识库多科目文案通用化（修正「条公式」硬编码）

> 版本说明：**次版本号 +1**。
- **修复**：`KnowledgeTopic` 新增可选 `unit` 字段（默认「条公式」，英语二声明「个知识点」）；主题卡 / 横幅按科目显示 40 条公式 / 31 条公式 / 58 个知识点；「📖 公式速查」→「📖 知识点速查」。
- **变更**：`knowledge-data.ts` / `knowledge.ts`（`topicUnit()` 替换 4 处硬编码）；APP_VERSION→v4.1.1，sw 缓存同步。
- **验证**：typecheck / test 34/34 / build 通过；浏览器冒烟正常。
- **部署**：Netlify deploy `6a94bf684d7584dd913a54ff` ready（2026-08-30T23:40:25Z），线上验证全绿；GitHub 全项目同步 `dae13b0b` + 补同步 `413cde1f`（当时 477 行一致）；Netlify PAT 存 `.local/netlify_token.txt` 不入库。
