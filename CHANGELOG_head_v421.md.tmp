# 修改日志 (CHANGELOG)

> 版本规则：**大改动**（新增功能、架构变更）→ 主版本号 +1；**小改动**（Bug 修复、细节优化）→ 次版本号 +1。
> 版本号常量位于 `src/constants.ts`（v3.0.0 前位于 `index.html` 顶部），管理页底部实时显示。

---

## v4.2.1（2026-08-31）iOS「添加到主屏幕」支持 + 苹果风 PNG 应用图标

> 版本说明：**次版本号 +1**（小改动：PWA 图标 PNG 化 / 苹果风重绘 + meta 修正，无功能 / 架构变化）。

### 新增
- **4 枚苹果风 PNG 应用图标**（GDI+ 矢量绘制脚本 `_make_icons_apple_v421.ps1` 生成：紫色垂直渐变底 #8165FF→#382DAA + 白色翻开书本图形 + 紫色书脊线 + 右下深紫圆底白色对勾徽章）：
  - `public/icons/apple-touch-icon.png`（180×180，3,581 B，iOS 主屏幕专用）。
  - `public/icons/icon-192.png`（192×192，3,847 B）。
  - `public/icons/icon-512.png`（512×512，10,288 B）。
  - `public/icons/icon-maskable-512.png`（512×512，8,294 B，图形缩放 0.72 预留 Android 自适应遮罩安全区）。

### 变更
- **`index.html`**：`apple-touch-icon` 由 `icon.svg` 改为 `icons/apple-touch-icon.png`（iOS 不渲染 SVG 主屏幕图标，为「添加到主屏幕」图标显示的阻塞项）；新增 `<meta name="mobile-web-app-capable" content="yes">`。
- **`public/manifest.webmanifest`**：icons 数组追加 3 枚 PNG（192 any / 512 any / 512 maskable），原 2 枚 SVG 保留兼容。
- **APP_VERSION v4.2.0 → v4.2.1**（`src/constants.ts`）；`public/sw.js` 缓存名同步 `kaoyan-v4.2.1`（install 时按首页引用自动预缓存新 PNG 图标）。

### 验证
- `npm run typecheck`、`npm run build` 全部通过（Vite 构建，产物 `assets/index-CzUDMMwG.js`，591.86 kB）。
- icon-512.png 目检：渐变底色、书本图形、对勾徽章显示正常，符合 iOS 图标美学。

### 部署
- **线上部署完成（2026-08-31）**：`dist-deploy.zip`（70 文件，正斜杠路径，1,090,818 B）经 Netlify Deploy API（`POST /api/v1/sites/38b9bbf0-39f6-4610-a09a-79be94755f17/deploys`）发布到 `llss.netlify.app`，deploy `6a955e8e925ac48455feba70` 状态 ready（published 2026-08-31T10:59:27Z，error 空）。
- **线上验证全绿**：`sw.js` 返回 `kaoyan-v4.2.1`、首页引用 `assets/index-CzUDMMwG.js` 并含 `apple-mobile-web-app-capable` meta、`apple-touch-icon.png` / `icon-192.png` / `icon-512.png` / `icon-maskable-512.png` 全部 200（3,581 / 3,847 / 10,288 / 8,294 B）、`manifest.webmanifest` 含全部 3 条 PNG 图标条目。
- **使用方式**：iPhone Safari 打开 `llss.netlify.app` → 底部「分享」按钮 → 「添加到主屏幕」，即可以全屏独立应用打开，主屏图标为苹果风紫色渐变书本图标。
- **GitHub 仓库同步（2026-08-31）**：`public/manifest.webmanifest` + `public/sw.js`（commit `c353b0e`）、`index.html`（commit `67a88f1`）、`src/constants.ts`（commit `a907007`）经 MCP `push_files` 推送至 `winston0510/kaoyan` main；遗留 `.changelog_part2_note.tmp` 已删除（commit `aa66eff`）。4 枚 PNG 为二进制文件，MCP `push_files` 仅支持文本内容，暂以线上部署与本地仓库为准。
