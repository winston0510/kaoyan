# 考研刷题工具

一个免费的考研刷题网页应用，支持**政治、英语二、数学二、电路（北京交通大学）**四个科目。

## 功能

- 按科目/章节选题刷题
- 三种刷题模式：随机出题、顺序出题、只刷错题
- 错题本自动收集，支持标记"已掌握"
- 每日刷题统计（题数、正确率）
- 管理后台：手动添加题目、JSON 批量导入
- 内置 15 道示例题目，开箱即用

## 两种使用方式

### 方式一：纯本地模式（零配置）

直接用浏览器打开 `index.html` 即可使用。所有数据存储在浏览器 localStorage 中，无需任何后端。

### 方式二：Supabase 云端模式（推荐）

数据存储在云端 PostgreSQL 数据库，支持多设备同步。

#### 1. 注册 Supabase（免费）

访问 [supabase.com](https://supabase.com)，用 GitHub 账号注册，免费额度足够个人使用。

#### 2. 创建项目

新建一个项目，记下 **Project URL** 和 **anon public key**（在 Settings → API 中）。

#### 3. 初始化数据库

在 Supabase 控制台的 **SQL Editor** 中依次执行：

1. 复制 `schema.sql` 的全部内容 → 执行
2. 复制 `seed.sql` 的全部内容 → 执行

#### 4. 配置应用

打开 `index.html`，在首页底部填入 Supabase URL 和 Key，点击"保存"即可。

## 免费部署

### Vercel 部署（推荐）

1. 访问 [vercel.com](https://vercel.com) 注册
2. 安装 Vercel CLI：`npm i -g vercel`
3. 在项目目录下执行 `vercel`，按提示完成部署
4. 获得一个 `xxx.vercel.app` 域名

### Netlify 部署

直接将 `index.html` 拖入 [app.netlify.com](https://app.netlify.com) 的部署区域即可。

### GitHub Pages

将 `index.html` 推送到 GitHub 仓库，开启 Pages 功能即可。

## 科目章节

| 科目 | 章节 |
|------|------|
| 政治 | 马原、毛中特、史纲、思修法基、时政 |
| 英语二 | 完形填空、阅读理解、新题型、翻译、写作 |
| 数学二 | 高等数学、线性代数 |
| 电路（北京交通大学） | 直流电路、交流电路、暂态分析、二端口网络、三相电路 |

## 题库规模（去重后共9861题）

| 科目 | 题量 | 来源 |
|------|------|------|
| 政治 | 6627 | 肖秀荣1000题(2021/2022) + 徐涛优题库 + 毛概题库 + 马原题库 + 学习强国 |
| 数学二 | 1186 | 程序生成 + 历年真题 + 名师训练题 |
| 电路 | 1099 | 北交大870考纲全覆盖 + 程序生成 |
| 英语二 | 949 | 考纲词汇 + 语法 + 阅读理解 + 翻译写作 |

## 项目结构

```
kaoyan-quiz-web/
├── index.html              # 完整前端应用（SPA）
├── schema.sql              # 数据库建表语句
├── seed_all_dedup.sql      # 完整题库SQL（9861题，去重版）
├── seed_politics_new.sql   # 政治题库SQL（5320题，多源整合）
├── gen_circuit_full.js     # 电路题库生成器
├── gen_english2_full.js    # 英语二题库生成器
├── gen_math2_full.js       # 数学二题库生成器
├── convert_all_politics.py # 政治题库多源转换脚本
├── dedup_all.py            # 全题库去重脚本
├── vercel.json             # Vercel 部署配置
└── README.md               # 本文件
```

## 技术栈

- 前端：原生 HTML/CSS/JS（无框架，零依赖）
- 后端：Supabase（PostgreSQL + REST API）
- 部署：Vercel / Netlify / 任意静态托管