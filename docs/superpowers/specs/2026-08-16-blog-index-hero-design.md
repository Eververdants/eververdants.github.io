# Blog 子站首屏 Hero 设计

日期：2026-08-16
状态：已批准（用户点头）

## 背景

博客子站 `/blog`（`src/components/BlogIndexScene.tsx`）当前是纯功能页：顶部有 `← JOURNAL` 返回按钮 + 紧凑头部（ALL ESSAYS overline + BLOG 标题），下方标签筛选 + 文章列表。背景已是米白方格（`#f7f5ef` + `#e5e2d9` 1px 网格，28px）。

目标：首屏做成一个 **极简居中 hero 屏**，风格延续米白方格背景，入场带轻动画，与主站电影感呼应但不重复。

## 决策

| 决策点 | 结论 |
|---|---|
| 方向 | 极简居中（非编辑式刊头、非精选文章首屏） |
| 内容 | 博客标题式：overline + 大号 BLOG + 副标题 + SCROLL 提示（非品牌式头像） |
| 动效 | 入场动画（依次淡入/上移），非纯静态 |
| 预览方式 | 文字方案直接定，不用浏览器 mockup |

## Hero 构成

全屏段（`h-screen h-dvh`），米白方格背景，内容垂直居中：

```
        ← JOURNAL                      （左上角返回按钮，绝对定位保留，交互不变）

              EVERVERDANTS              overline · 11px · 宽字距 · #9a968b
              BLOG                      标题 · Inter 粗体 · #141414 · clamp(48px→80px) · 紧凑字距
    Essays · Notes · Field Records      副标题 · #5a564d（复用 journal.cover.subtitle）

              SCROLL                    （滚动提示：文字 + 竖线滚动填充动画）
```

- 标题字体：**Inter 粗体**，非 Fraunces。理由：博客子站是浅色功能空间，现有标题/阅读页全走 Inter，保持语言一致；Fraunces 名号留给主站深色电影区。
- overline 文案定为 `EVERVERDANTS`（可低成本替换，见下）。
- 背景网格沿用现有 inline style，无改动。

## 动画与滚动

- **入场动画**：新属性 `[data-blog-in]`。CSS 初始 `opacity: 0`（pre-JS 防闪），GSAP 依次淡入 + 上移 18px + blur 渐消，duration 0.8s，stagger 0.12s，ease power3.out。顺序：overline → 标题 → 副标题 → SCROLL 提示。
- **不动 `[data-hero-in]`**：全局 `initGsap`（`src/effects/gsap.ts`）在 App 挂载时跑 `initHeroEntrance()`，只针对主站 hero 且只跑一次。博客子站是**条件后挂载**组件（`{!article && blogIndex && <BlogIndexScene/>}`），必须自含入场逻辑。
- **实现位置**：`BlogIndexScene.tsx` 内加 `useEffect` + `gsap.context`，入场与 SCROLL 提示淡出写在一个 context 里，卸载 `ctx.revert()` 清理。动画函数放新文件 `src/effects/animations/blogIndex.ts`（沿用"TS + 拆文件"惯例）。
- **SCROLL 提示淡出**：ScrollTrigger scrub，hero 段（top top → bottom top）内随滚动淡出（仿 `initHeroCover` 但只处理 hint，不带主站的 glass 模糊/位移封套）。
- **reduced-motion**：`[data-blog-in]` 在 `prefers-reduced-motion` 下 CSS 恢复可见（仿 `[data-hero-in]` 现有规则）；GSAP 侧 `initBlogIndex(prefersReduced)` 跳过动画。

## 不改的部分

- 标签筛选、文章列表、页脚（`© ... EVERVERDANTS`）布局与交互全保留。
- 顶部 `← JOURNAL` 返回按钮改为 hero 内绝对定位，交互与文案不变。
- `onClose`/`onOpen` 路由、主站 ↔ 子站过渡 overlay、`data-article` 滚动条样式全不动。

## 改动文件

1. `src/components/BlogIndexScene.tsx` — hero 结构 + useEffect 挂动画
2. `src/effects/animations/blogIndex.ts` — 新增：入场 timeline + SCROLL 提示滚出
3. `src/styles/global.css` — 新增 `[data-blog-in]` 初始隐藏 + reduced-motion 恢复规则

## 待定（可后改）

- overline 文案：现拟 `EVERVERDANTS`，可换 `ALL ESSAYS` / `FIELD NOTES`。单点改动，非结构问题。
