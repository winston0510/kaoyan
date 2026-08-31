# 修改日志 (CHANGELOG)

> 版本规则：**大改动**（新增功能、架构变更）→ 主版本号 +1；**小改动**（Bug 修复、细节优化）→ 次版本号 +1。
> 版本号常量位于 `src/constants.ts`（v3.0.0 前位于 `index.html` 顶部），管理页底部实时显示。

---

## v4.2.1（2026-08-31）iOS「添加到主屏幕」支持 + 苹果风 PNG 应用图标

> 版本说明：**次版本号 +1**（小改动：PWA 图标 PNG 化 / 苹果风重绘 + meta 修正，无功能 / 架构变化）。

### 新增
- **4 枚苹果风 PNG 应用图标**（GDI+ 矢量绘制，紫色垂直渐变底 #8165FF→#382DAA + 白色翻开书本 + 紫色书脊线 + 右下深紫圆底白对勾徽章）：
  - `public/icons/apple-touch-icon.png`（180×180，3,581 B，iOS 主屏幕专用）。
  - `public/icons/icon-192.png`（192×192，3,847 B）。
  - `public/icons/icon-512.png`（512×512，10,288 B）。
  - `public/icons/icon-maskable-512.png`（512×512，8,294 B，图形缩放 0.72 预留遮罩安全区）。

### 变更
- **`index.html`**：`apple-touch-icon` 由 `icon.svg` 改为 `icons/apple-touch-icon.png`（iOS 不渲染 SVG 主屏图标）；新增 `<meta name="mobile-web-app-capable" content="yes">`。
- **`public/manifest.webmanifest`**：icons 数组追加 3 枚 PNG（192 any / 512 any / 512 maskable），原 SVG 保留。
- **APP_VERSION v4.2.0 → v4.2.1**（`src/constants.ts`）；`public/sw.js` 缓存名同步 `kaoyan-v4.2.1`。

### 验证
- `npm run typecheck`、`npm run build` 全部通过（产物 `assets/index-CzUDMMwG.js`，591.86 kB）。
- icon-512.png 目检：渐变底色、书本图形、对勾徽章正常，符合 iOS 图标美学。

### 部署
- **线上部署完成（2026-08-31）**：`dist-deploy.zip`（70 文件，1,090,818 B）经 Netlify Deploy API 发布到 `llss.netlify.app`，deploy `6a955e8e925ac48455feba70` ready（published 2026-08-31T10:59:27Z，error 空）。
- **线上验证全绿**：`sw.js`=kaoyan-v4.2.1、首页引用新 bundle、四枚 PNG 全部 200、manifest 含 3 条 PNG 条目。
- **使用**：iPhone Safari 打开 `llss.netlify.app` → 分享 → 添加到主屏幕，全屏独立应用打开。
- **GitHub 同步**：manifest+sw.js（`c353b0e`）、index.html（`67a88f1`）、constants.ts（`a907007`）；临时文件清理（`aa66eff`/`88024a5`/`075ad50`）。PNG 为二进制，MCP 仅支持文本，暂不入库。

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
- **`seed_all_final.sql` 重新生成**：总题量 9,852 → **10,215**（数学二 1,344 / 英语二 1,154 / 电路 1,099 / 政治 6,618）；363 题真题 / 名师题全部保留，零误删。
- **删除损坏文件** `seed_real_english.sql`（此前 Write 截断事故产物，仅 2 行无效内容）。
- **独立修改日志**：新增 `seed_real_math_2020_2022.changelog.log`、`seed_real_teacher.changelog.log`、`release_v4.2.0.changelog.log`。
- **APP_VERSION v4.1.1 → v4.2.0**（`src/constants.ts`）；`public/sw.js` 缓存名同步 `kaoyan-v4.2.0`。

### 验证
- 独立复核脚本（node 正则全量解析 5 个种子文件）：363 题全部通过——章节名 100% 命中标准列表、来源 100% 标准格式、解析与答案零空值。
- 集成输出核对：5 个文件分别解析 67 / 44 / 100 / 100 / 52 行；最终库真题 / 名师来源题目恰为 363 条，完形【第N空】标记 100 条完整在库。
- `npm run typecheck`、`npm run build` 全部通过（产物 `index-BQXjHljX.js`）。

### 部署
- **线上部署完成（2026-08-31）**：`dist-deploy.zip`（66 文件，1,068,038 B）发布到 `llss.netlify.app`，deploy `6a954e38b54da3e914aa8e52` ready（published 2026-08-31T09:49:45Z）。
- **线上验证全绿**：`sw.js` 返回 `kaoyan-v4.2.0`、首页引用 `assets/index-BQXjHljX.js` + `assets/index-D9c1O0fW.css`、JS 包 200（591,858 B）、manifest 200。
- **数据说明**：363 题存于 `seed_all_final.sql`（10,215 题），由用户在 Supabase 侧导入后生效；本次前端部署不携带数据库变更。
- **GitHub 同步**：`src/constants.ts`、`public/sw.js`、`integrate_all.py`（commit `225efa8`）经 MCP 推送；本文档因单次推送体量限制采用累积同步。
