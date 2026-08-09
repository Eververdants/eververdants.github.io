# Eververdants 个人网站重构设计

日期：2026-08-10
状态：已批准（用户确认全盘设计）

## 概述

对现有个人网站做**完全重构**，现有设计逻辑全部丢弃。新站由三个区域组成，全部放在一个 Astro 单仓库多站点项目中，通过子路径区分：

- **主站 → 个人简历**（杂志式单页：Hero + 技能与经历 + 联系 + 两个副站入口）
- **博客**（MDX 内容集合，标签过滤）
- **软件站**（管理用户自己的开源项目，静态数据）

三个区域用子路径组织；叠加语言前缀后，实际 URL 为 `/zh/`、`/zh/blog/`、`/zh/projects/` 及 `/en/` 镜像（见 i18n 机制）。

整体视觉走**编辑杂志风 + 六七十年代中国印刷工艺质感**（木刻版画、活字、纸张、印章），**明确不含任何政治敏感内容**——只取那个年代的印刷工艺语言，不放政治人物、口号、标志、宣传图像。这是硬约束。

## 已定决策

| 决策点 | 结果 |
|---|---|
| 架构 | Astro 单仓库多站点（static 输出） |
| URL 结构 | 三个区域用子路径组织（主站 `/`、博客 `/blog`、软件站 `/projects`）；i18n 前缀后实际 URL 为 `/zh/`、`/zh/blog/` 等（见下文 i18n 机制） |
| 技术栈 | Astro 5 + TypeScript + Tailwind + 少量 React 岛 |
| 主站板块 | Hero 简介、技能与经历、联系；**不提供 PDF 简历下载**；有副站跳转入口 |
| 视觉 | 编辑杂志风 + 六七十年代印刷质感，米黄纸色 + 朱红 + 墨黑，仅浅色 |
| 配图 | 本地 krea2 MCP 生图（`krea2_t2i` / `krea2_i2i` / `krea2_edit`，已就绪），统一纸色套印风格 |
| 语言 | 全站双语（中文 + 英文） |
| i18n 机制 | Astro 官方 i18n 路由，中文在 `/zh/`，英文在 `/en/`，根路径自动检测语言跳转 |
| 软件站数据 | 静态数据文件（Content Collection MD 文件，手动维护） |
| 搜索 | Pagefind 全站搜索，覆盖博客文章 + 软件站项目，build 时建索引 |
| 旧内容 | 全部丢弃，空白起步 |
| 部署 | 保留 GitHub Pages 自定义域名，更新 CI 构建 Astro |

## 架构

### 技术栈

- **Astro 5**，static 输出（无需 adapter）
- **TypeScript**
- **Tailwind CSS**（设计 token 由 Tailwind 配置承载）
- **React 岛**（`<ClientOnly>` 或按需）：语言切换、标签过滤、项目卡片 hover 交互、搜索结果
- **Content Collections** 管博客文章与软件站项目
- **Pagefind**（`@pagefind/astro`）：全站搜索，build 时生成索引，无服务器，支持双语与子路径
- 弃用：Three.js / GSAP / Framer Motion / Gemini API 逻辑

### 仓库结构

```
src/
├── pages/
│   ├── [...lang]/                  # 动态语言段（单套页面模板）
│   │   ├── index.astro             # 简历主站
│   │   ├── blog/index.astro        # 博客列表
│   │   ├── blog/[slug].astro       # 文章页
│   │   ├── projects/index.astro    # 软件站列表
│   │   └── projects/[slug].astro   # 项目详情
│   ├── index.astro                 # 根路径：自动检测语言 → 302 跳转
│   └── 404.astro
├── content/
│   ├── blog-zh/*.mdx               # 中文文章
│   ├── blog-en/*.mdx               # 英文文章
│   ├── projects-zh/*.md            # 项目数据（中文 frontmatter 内容）
│   └── projects-en/*.md            # 项目数据（英文）
├── data/
│   ├── resume-zh.ts                # 简历：技能/经历/联系（中文）
│   └── resume-en.ts                # 简历（英文）
├── i18n/
│   └── ui.ts                       # 界面文案字典 zh/en
├── components/                     # Astro 组件 + React 岛
├── layouts/                        # 杂志布局 / 博客阅读布局 / 项目布局
├── styles/                         # 设计 token + 排版样式
└── middleware.ts                   # 根路径语言检测跳转
public/
├── images/                         # krea2 生成的配图
└── CNAME                           # GitHub Pages 自定义域名
```

### 路由

- `/zh/` 中文简历，`/en/` 英文简历
- `/zh/blog/`、`/zh/blog/[slug]/` 及 `/en/` 镜像
- `/zh/projects/`、`/zh/projects/[slug]/` 及 `/en/` 镜像
- `/` → middleware 读 `Accept-Language`，302 到 `/zh/` 或 `/en/`（默认中文）
- `404.astro` 生成 `404.html`，GitHub Pages 深链接兜底

## i18n 机制

- `astro.config`：
  ```js
  i18n: {
    defaultLocale: 'zh',
    locales: ['zh', 'en'],
    routing: { prefixDefaultLocale: true },  // /zh/ /en/ 都带前缀
  }
  ```
- 一套页面模板，动态语言段 `[...lang]/` 承载，路由内读 `Astro.currentLocale` 决定取哪份内容
- 根路径独立 `index.astro` 做重定向（middleware）
- UI 文案走 `i18n/ui.ts` 字典，组件拿 locale 换文本，无 hydration
- 语言切换 = 链接换前缀（`/zh/blog/foo` ↔ `/en/blog/foo`），纯 `<a>`，零 JS
- 每页输出 `<link rel="alternate" hreflang>`，SEO 双版本独立索引
- 博客文章两语分目录存，slug 对应；缺失翻译时只显示已有语种 + 侧注提示
- 软件站项目同理：翻译缺失时只显示已有语种

## 三站页面细节

### 主站（简历）`/zh/` `/en/`

单页杂志式布局：

- **Hero**：姓名、头衔、一句话 slogan，配一张木刻风头像/插画（krea2）。下方两个大字卡片入口：博客、软件站
- **技能与经历**：技能按类别分组（铅字标签样式）+ 工作/教育时间线（竖线 + 年份题花）
- **联系**：社交链接 + 邮箱，底部刊号/版权行
- 杂志栅格：大标题栏 + 分栏正文 + 题花分隔

### 博客 `/zh/blog/` `/zh/blog/[slug]/`

- **列表**：按日期倒序条目 = 日期 + 标题 + 标签 + 封面小图（krea2），标签过滤（客户端小岛）
- **文章页**：标题 + 日期 + 标签 + 阅读时长，MDX 正文（代码块、引用、配图带说明），文末上一篇/下一篇，缺失翻译侧注
- **frontmatter**：`title, date, tags[], cover, description, draft, series?`

### 软件站 `/zh/projects/` `/zh/projects/[slug]/`

- **列表**：项目卡片栅格 = 配图 + 名称 + 一句话描述 + 标签，分类/标签过滤，featured 优先，活跃/归档徽章
- **详情页**：项目名、完整描述、标签、repo 链接 + demo 链接（按钮）、配图、状态、更新时间
- **frontmatter**：`name, tagline, description, tags[], category, repoUrl, demoUrl?, image, status(active|archived), date, featured?`

### 搜索（全站）

- 覆盖范围：**博客文章 + 软件站项目**
- 实现：Pagefind（`@pagefind/astro`），build 时生成索引，纯静态、无服务器、支持中文与子路径
- 入口：页头搜索框，全站可用；结果按语言分区（`/zh/` 搜中文索引、`/en/` 搜英文索引）
- 搜索框 UI 走杂志风样式（铅字感输入框）

### 公共

- 页头：站名（刊名感）+ 语言切换 + 三区导航 + 搜索框
- 页脚：版权 + 副站链接
- 面包屑（杂志目录式）

## 视觉系统

### 色板

- 纸色米黄底：`#F4EEDD` 系
- 墨黑：`#17140F`
- 朱红点缀：`#B63A2A`
- 灰墨副色、可选金线

### 字体

- 中文标题：思源宋体（Noto Serif SC）
- 拉丁标题：展示衬线（EB Garamond 系）
- 正文：思源黑体（Noto Sans SC）
- 引用：仿宋
- 元数据/标签：等宽（Geist Mono）

### 质感元素

- 纸张噪点纹理
- 木刻版画风配图（krea2，统一纸色套印风格）
- 题花分隔线（heading ornaments）
- 铅字标签
- 红印章元素
- 半调网点背景
- 少量竖排文字点缀
- 刊号角标、双线边框

### 非政治边界（硬约束）

只取六七十年代的**印刷工艺语言**（版画、活字、纸张、印章、排版风格）。**禁止**使用：政治人物形象、政治口号、政党组织符号、宣传性图像。所有 krea2 配图生成时需显式排除政治内容。

### 配图规范（krea2 MCP）

- 生成工具：本地 krea2 MCP（`krea2_t2i` 文生图 / `krea2_i2i` 图生图 / `krea2_edit` 指令编辑）
- 提示词：只用英文 + 具象名词（物体/材质/光线/动作），禁抽象概念词
- 统一风格：纸色套印/木刻版画风（米黄纸 + 墨黑 + 朱红两到三色），全站配图风格一致
- 尺寸：按用途定（Hero 插画、文章封面、项目卡片图）
- 输出落位：`public/images/`，路径写进 frontmatter/data
- 生成即明确排除政治内容（遵守非政治硬约束）

### 动效

- 克制：hover 微反馈 + 页面淡入
- 不使用重型动画库

## 内容管理

- 博客：新增 `.mdx` 文件，Content Collections schema 校验
- 软件站：新增项目 `.md` 文件，frontmatter schema 校验
- 简历：改 TS 数据文件文本
- 配图：krea2 MCP 生成 → `public/images/`，路径写进 frontmatter/data
- 配图占位：开发期先用纯色 + 题字占位图，内容定稿后生成正式配图

## 部署

- 保留 GitHub Pages 自定义域名（CNAME）为主部署
- 更新 `.github/workflows/deploy.yml`：安装 Astro → `build` → Pages
- `astro.config` `base: '/'`（自定义域名根路径）
- `404.astro` 自动出 404.html 兜 GitHub Pages 深链接
- Vercel 配置可选保留（Astro static 输出直接可部署）
- 移除 GEMINI_API_KEY 逻辑、Three/GSAP/Framer 依赖

## 实现里程碑

1. 脚手架：Astro + TS + Tailwind + i18n 路由 + 中间件跳转 + 设计 token
2. 主站简历页（双语数据）
3. 博客（content collection + 列表 + 文章页 + 标签过滤）
4. 软件站（project collection + 列表 + 详情）
5. 搜索（Pagefind 接入 + 页头搜索框）
6. 视觉打磨（噪点/版画/题花/印章/竖排）
7. krea2 MCP 配图生成（Hero 插画、文章封面、项目卡片图，统一纸色套印风格）
8. 部署验证（CI + 本地 preview）

## 明确不做（YAGNI）

- 不做 PDF 简历下载
- 不做视频作品集
- 不做暗色模式
- 不做运行时 GitHub API 拉取
- 不迁移旧内容（项目、文章、社交数据全弃）
