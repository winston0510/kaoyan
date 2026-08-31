# 修改日志 (CHANGELOG)

> 版本规则：**大改动**（新增功能、架构变更）→ 主版本号 +1；**小改动**（Bug 修复、细节优化）→ 次版本号 +1。
> 版本号常量位于 `src/constants.ts`（v3.0.0 前位于 `index.html` 顶部），管理页底部实时显示。
> 注：GitHub 端副本受 MCP 单次推送体量限制为精要版，完整权威记录以仓库本地 `CHANGELOG.md` 与各 `*.changelog.log` 为准。

---

## v4.2.1（2026-08-31）iOS「添加到主屏幕」支持 + 苹果风 PNG 应用图标

> 版本说明：**次版本号 +1**（小改动：PWA 图标 PNG 化 / 苹果风重绘 + meta 修正，无功能 / 架构变化）。

### 新增
- **4 枚苹果风 PNG 应用图标**（GDI+ 矢量绘制：紫色垂直渐变底 #8165FF→#382DAA + 白色翻开书本 + 紫色书脊线 + 右下深紫圆底白色对勾徽章）：
  - `public/icons/apple-touch-icon.png`（180×180，3,581 B，iOS 主屏幕专用）。
  - `public/icons/icon-192.png`（192×192，3,847 B）。
  - `public/icons/icon-512.png`（512×512，10,288 B）。
  - `public/icons/icon-maskable-512.png`（512×512，8,294 B，图形缩放 0.72 预留遮罩安全区）。

### 变更
- **`index.html`**：`apple-touch-icon` 由 SVG 改为 PNG（iOS 不渲染 SVG 主屏图标，为「添加到主屏幕」阻塞项）；新增 `mobile-web-app-capable` meta。
- **`public/manifest.webmanifest`**：icons 追加 3 枚 PNG（192/512 any + 512 maskable），SVG 保留。
- **APP_VERSION v4.2.0 → v4.2.1**（`src/constants.ts`）；`public/sw.js` 缓存名同步 `kaoyan-v4.2.1`。

### 验证
- `npm run typecheck`、`npm run build` 全部通过（产物 `assets/index-CzUDMMwG.js`，591.86 kB）；icon-512.png 目检符合 iOS 图标美学。

### 部署
- **线上部署完成（2026-08-31）**：`dist-deploy.zip`（70 文件，1,090,818 B）经 Netlify Deploy API 发布到 `llss.netlify.app`，deploy `6a955e8e925ac48455feba70` ready（published 2026-08-31T10:59:27Z，error 空）。
- **线上验证全绿**：`sw.js`=kaoyan-v4.2.1、首页引用新 bundle、四枚 PNG 全部 200、manifest 含 3 条 PNG 条目。
- **使用方式**：iPhone Safari 打开 `llss.netlify.app` → 分享 → 添加到主屏幕，全屏独立应用打开。
- **GitHub 同步**：manifest+sw.js（`c353b0e`）、index.html（`67a88f1`）、constants.ts（`a907007`）；遗留临时文件已清理（`aa66eff` 等）。4 枚 PNG 为二进制，MCP 通道仅支持文本，暂不入库。
