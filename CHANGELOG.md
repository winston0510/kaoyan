# 修改日志 (CHANGELOG)

> 版本规则：**大改动**（新增功能、架构变更）→ 主版本号 +1；**小改动**（Bug 修复、细节优化）→ 次版本号 +1。
> 版本号常量位于 `src/constants.ts`（v3.0.0 前位于 `index.html` 顶部），管理页底部实时显示。
> 注：GitHub 端副本受 MCP 单次推送体量限制为精要版；v4.2.0 及更早版本记录见 `CHANGELOG-archive.md`；完整权威记录以仓库本地 `CHANGELOG.md` 与各 `*.changelog.log` 为准。

---

## v4.4.0（2026-08-31）布局风格优化：悬浮胶囊标签栏 + 三槽顶栏 + 2×2 彩色瓦片

> 版本说明：**次版本号 +1**（纯视觉/布局层改造，参考 iOS 记账应用截图的布局与风格；功能 / 数据 / 架构零变化）。
- **悬浮胶囊底部标签栏**：`.bottom-nav` 改悬浮胶囊（距底 10px + 安全区、左右 14px、`border-radius:30px`、强毛玻璃 + 阴影）；选中项胶囊高亮（`border-radius:24px` + `--fill`），文字/图标品牌紫。
- **三槽顶栏**：8 个页面顶栏重构为 `tb-left/tb-center/tb-right`（单侧有按钮时标题仍光学居中）；新增 `.tb-btn` 40px 圆形/胶囊按钮（按压缩放 .92）与文字胶囊 `.tb-text`；首页顶栏新增副标题日期（`homeSub`，M月D日）。
- **2×2 彩色统计瓦片**：首页/统计页 4 瓦片改 2×2 网格、标签在上大号数字在下（`column-reverse` 标签在上、DOM 不变）；新增明暗双套彩色令牌 `--tile1..4`/`--tileN-num`（浅色浅蓝/浅绿/浅紫/浅橙；暗色高饱和深色底 + 亮字色）。
- **区块头 chips**：统计页「本周趋势 / 各科目」改 `.block-head`（左标题 + 右胶囊 chip：「本周 N 题」「共 4 科」）；section 标题品牌紫、右侧统计胶囊化。
- **卡片扁平化**：subject-card/chapter-card/week-chart/search-result 等卡片/列表边框透明去描边（保留 wrong/fav-card 语义左色条）；页面底部留白加大避让悬浮标签栏。
- **版本**：APP_VERSION v4.3.0→v4.4.0，sw 缓存 `kaoyan-v4.4.0`。
- **验证**：build（含 tsc）通过（产物 `index-DSgPFxJG.js` 592.17 kB / `index-Dr9jaTsG.css` 64.39 kB）；iPhone 视口（390×844）截图 3 张目检悬浮胶囊标签栏/圆形按钮/彩色瓦片/chips 符合参考风格。
- **部署**：`dist-deploy.zip`（70 文件，1,092,372 B）发布到 `llss.netlify.app`，deploy `6a9572f2b8459da15276d3ba` ready；线上验证全绿（新 bundle/CSS、tb-btn/homeSub/block-head/tile 令牌、sw 缓存名、图标 200）。
- **GitHub 同步**：sw.js+constants.ts（`e01712c`）、index.html（`20c55cb`）、home.ts+stats.ts（`9ea25a0`）、CHANGELOG 精要条目（本提交）；`css/style.css` 约 31KB 超单次推送上限，不入 GitHub，以本地为准。

---

## v4.3.0（2026-08-31）全站 UI iOS 化：玻璃拟态设计系统 + iOS 安全区适配

> 版本说明：**次版本号 +1**（纯视觉层整体改造，功能 / 数据 / 架构零变化）。
- **新增玻璃拟态设计系统**（`css/style.css` 全量重写，类名全保留、TS 零改动）：半透明玻璃令牌 + `blur(24px) saturate(180%)` 毛玻璃、环境渐变背景（品牌紫/天蓝/粉三层 radial-gradient）、iOS 系统色板（#34C759/#FF3B30/#FF9500）与分组背景 #F2F2F7、SF Pro 系统字体栈。
- **iOS 组件语言**：胶囊按钮 + 品牌紫辉光、iOS 搜索栏、UISegmentedControl 式知识库双标签、胶囊 chips、Sheet 弹窗（grabber 条 + 24px 圆角）、发丝线分隔统计栅格、iOS 标签栏（毛玻璃 + 选中图标半透明填充）；暗色纯黑 + #2C2C2E 玻璃卡。
- **安全区适配**：`viewport-fit=cover`；顶栏/底栏/弹窗/页底留白含 `env(safe-area-inset-*)`（毛玻璃延伸状态栏、避开 Home 指示条）；新增 `apple-mobile-web-app-title`。
- **版本**：APP_VERSION v4.2.1→v4.3.0，sw 缓存 `kaoyan-v4.3.0`。
- **验证**：build（含 tsc）通过（产物 `index-gUzZTJQJ.js` 591.86 kB / `index-Cj3kV0Tn.css` 62.47 kB）；iPhone 视口（390×844）截图核验明/暗双主题玻璃渲染正确。
- **部署**：`dist-deploy.zip`（70 文件，1,091,782 B）发布到 `llss.netlify.app`，deploy `6a956d2769b077bdeb269f88` ready；线上验证全绿（新 bundle/CSS、viewport-fit、sw 缓存名、图标 200）。
- **GitHub 同步**：sw.js+constants.ts（`c06d195`）、index.html（`c4efd71`）；`css/style.css` 约 30KB 超单次推送上限，不入 GitHub，以本地为准。

---

## v4.2.1（2026-08-31）iOS「添加到主屏幕」支持 + 苹果风 PNG 应用图标

> 版本说明：**次版本号 +1**（小改动：PWA 图标 PNG 化 / 苹果风重绘 + meta 修正，无功能 / 架构变化）。
- **新增 4 枚苹果风 PNG 图标**（GDI+ 矢量绘制：紫色渐变底 #8165FF→#382DAA + 白色翻开书本 + 深紫圆底白对勾徽章）：`apple-touch-icon.png`（180，iOS 主屏专用）、`icon-192.png`、`icon-512.png`、`icon-maskable-512.png`（0.72 安全区）。
- **变更**：`index.html` apple-touch-icon 改 PNG（iOS 不渲染 SVG 主屏图标）+ 新增 `mobile-web-app-capable` meta；manifest icons 追加 3 枚 PNG；APP_VERSION v4.2.0→v4.2.1，sw 缓存 `kaoyan-v4.2.1`。
- **验证**：typecheck / build 通过（产物 `index-CzUDMMwG.js` 591.86 kB）；图标目检符合 iOS 美学。
- **部署**：`dist-deploy.zip`（70 文件，1,090,818 B）发布到 `llss.netlify.app`，deploy `6a955e8e925ac48455feba70` ready（2026-08-31T10:59:27Z）；线上验证全绿（sw 缓存名 / 新 bundle / 四枚 PNG 200 / manifest 含 3 条 PNG）。
- **使用**：iPhone Safari 打开 `llss.netlify.app` → 分享 → 添加到主屏幕，全屏独立应用打开。
- **GitHub 同步**：manifest+sw.js（`c353b0e`）、index.html（`67a88f1`）、constants.ts（`a907007`）；历史版本归档 `CHANGELOG-archive.md`（`cae6eba`）；遗留临时文件已清理；4 枚 PNG 为二进制，MCP 通道仅支持文本，暂不入库。
