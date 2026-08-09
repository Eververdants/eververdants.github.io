# Eververdants 个人网站重构 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 用 Astro 5 完全替换现有 React+Vite 项目，构建单仓库多站点个人网站——主站（简历）+ 博客 + 软件站，全站双语，编辑杂志风 + 六七十年代印刷质感视觉。

**Architecture:** 单 Astro 静态项目。三区域用子路径组织，叠加 i18n 语言前缀后实际 URL 为 `/zh/`（默认中文）、`/en/`（英文），根路径 `/` 客户端脚本按浏览器语言跳转。一套 `[lang]` 页面模板承载两种语言，内容按语言分 Content Collection。UI 文案走字典，React 只做两个交互岛（标签过滤、搜索）。

**Tech Stack:** Astro 5 + TypeScript + Tailwind CSS v4（`@tailwindcss/vite`，CSS-first `@theme`）+ React 18 岛 + Content Collections（MDX/MD）+ Pagefind（CLI 建索引）+ Vitest（纯函数单测）+ pnpm。

## Global Constraints

- 视觉：编辑杂志风 + 六七十年代印刷工艺质感（版画/活字/纸张/印章）。**硬约束：不含任何政治敏感内容**（政治人物/口号/组织符号/宣传图像）。所有配图生成时显式排除。
- 配色：纸色米黄底 `#F4EEDD`、墨黑 `#17140F`、朱红 `#B63A2A`。仅浅色，无暗色模式。
- 字体：中文标题思源宋体（Noto Serif SC）、拉丁展示衬线 EB Garamond、正文思源黑体（Noto Sans SC）、等宽 Geist Mono。
- 语言：全站双语，中文默认。根路径 `/` 客户端跳转 `/zh/` 或 `/en/`（浏览器语言非 en 则中文）。
- 动效克制：hover 微反馈 + 页面淡入。不用 Three.js / GSAP / Framer Motion。
- i18n 路由参数名必须是 `lang`（不是 `locale`）。页面语言一律从 `Astro.params.lang` 读取，**不用** `Astro.currentLocale`（SSG index 页有已知 bug）。
- 包管理：pnpm。脚本 `build` = `astro check && astro build && pagefind --site dist`。
- 数据：博客文章 MDX、项目 MD，手动维护。无运行时 GitHub API、无旧内容迁移。
- 目标部署：GitHub Pages，`site: 'https://eververdants.github.io'`，`base: '/'`。

---

### Task 1: 替换构建工具链为 Astro + Tailwind v4

**Files:**
- Create: `package.json`, `tsconfig.json`, `astro.config.mjs`, `src/env.d.ts`, `src/styles/global.css`, `src/pages/index.astro`（临时占位页）
- Delete: `index.html`, `vite.config.ts`, `tailwind.config.js`, `postcss.config.js`, `src/` 下全部旧 React 文件（`App.tsx`, `index.tsx`, `components/`, `pages/`, `routes/`, `layouts/`, `contexts/`, `data/`, `hooks/`, `services/`, `utils/`, `types.ts`）, `.env.local`, `.env.example`
- Modify: `.gitignore`（加 `.astro`）, `vercel.json`（framework 改 `astro`）

**Interfaces:**
- Consumes: 现有仓库（React 项目，GitHub Pages + pnpm）
- Produces: 可构建的 Astro 空壳；`astro.config.mjs` 含 i18n 配置（后续任务用）

- [ ] **Step 1: 重写 `package.json`**

```json
{
  "name": "eververdants-website",
  "private": true,
  "type": "module",
  "version": "0.0.0",
  "scripts": {
    "dev": "astro dev",
    "build": "astro check && astro build && pagefind --site dist",
    "preview": "astro preview",
    "check": "astro check",
    "test": "vitest run"
  },
  "dependencies": {
    "@astrojs/react": "^4.2.0",
    "@fontsource/geist-mono": "^5.2.8",
    "astro": "^5.7.0",
    "react": "18.3.1",
    "react-dom": "18.3.1"
  },
  "devDependencies": {
    "@astrojs/check": "^0.9.4",
    "@tailwindcss/vite": "^4.1.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "pagefind": "^1.3.0",
    "tailwindcss": "^4.1.0",
    "typescript": "~5.8.2",
    "vitest": "^3.1.0"
  }
}
```

- [ ] **Step 2: 重写 `tsconfig.json`**

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

- [ ] **Step 3: 新建 `astro.config.mjs`**

```js
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://eververdants.github.io',
  base: '/',
  output: 'static',
  i18n: {
    defaultLocale: 'zh',
    locales: ['zh', 'en'],
    routing: { prefixDefaultLocale: true },
  },
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
});
```

- [ ] **Step 4: 新建 `src/env.d.ts`**

```ts
/// <reference types="astro/client" />
```

- [ ] **Step 5: 新建 `src/styles/global.css`**（设计 token + 基础排版）

```css
@import "tailwindcss";

@theme {
  --color-paper: #f4eedd;
  --color-paper-2: #ece3c8;
  --color-ink: #17140f;
  --color-cinnabar: #b63a2a;
  --color-cinnabar-dark: #8e2b1f;
  --color-plum: #2e2a23;
  --color-line: #d8ccae;

  --font-serif-sc: "Noto Serif SC", "Songti SC", serif;
  --font-sans-sc: "Noto Sans SC", system-ui, sans-serif;
  --font-display: "EB Garamond", "Noto Serif SC", serif;
  --font-mono: "Geist Mono", ui-monospace, monospace;
}

html { scroll-behavior: smooth; }

body {
  @apply bg-paper text-ink font-sans-sc antialiased;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E");
}

::selection { background: color-mix(in srgb, var(--color-cinnabar) 25%, transparent); color: var(--color-ink); }

/* 杂志正文排版（博客/项目正文复用） */
.prose { @apply text-base leading-7 text-ink; }
.prose h1, .prose h2, .prose h3 { @apply font-serif-sc font-bold text-ink; }
.prose h2 { @apply mt-10 mb-4 text-2xl border-b border-line pb-2; }
.prose h3 { @apply mt-8 mb-3 text-xl; }
.prose p { @apply my-4; }
.prose a { @apply text-cinnabar underline decoration-line underline-offset-4 hover:text-cinnabar-dark; }
.prose blockquote { @apply my-6 border-l-2 border-cinnabar pl-4 font-serif-sc italic text-plum; }
.prose code { @apply font-mono text-sm bg-paper-2 px-1 py-0.5; }
.prose pre { @apply my-6 p-4 bg-ink text-paper overflow-x-auto font-mono text-sm; }
.prose pre code { @apply bg-transparent p-0 text-paper; }
.prose img { @apply my-6; }
.prose ul { @apply list-disc pl-5 my-4; }
.prose ol { @apply list-decimal pl-5 my-4; }
```

- [ ] **Step 6: 新建 `src/pages/index.astro` 临时占位页**

```astro
---
---
<html lang="zh">
  <head><meta charset="utf-8" /><title>Eververdants</title></head>
  <body><h1>placeholder</h1></body>
</html>
```

- [ ] **Step 7: 删除旧文件 + 更新 gitignore/vercel**

```bash
rm index.html vite.config.ts tailwind.config.js postcss.config.js .env.local .env.example
rm -rf src/components src/contexts src/data src/hooks src/layouts src/pages src/routes src/services src/utils src/App.tsx src/index.tsx src/types.ts src/assets
```

`.gitignore` 追加一行 `/.astro`。`vercel.json` 把 `"framework": "vite"` 改成 `"framework": "astro"`。

- [ ] **Step 8: 安装依赖**

Run: `pnpm install`
Expected: 安装完成，无 peer 冲突报错。

- [ ] **Step 9: 验证构建**

Run: `pnpm astro build`
Expected: 成功，输出 `dist/index.html`，无报错。（注：此时 `pnpm build` 里的 `astro check` 和 `pagefind` 还未配齐，用 `pnpm astro build` 直接验证。）

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "chore: 替换为 Astro 5 + Tailwind v4 工具链，清理旧 React 项目"
```

---

### Task 2: i18n 基础 + 根路径语言跳转 + 单测

**Files:**
- Create: `src/i18n/ui.ts`, `src/i18n/detect.ts`, `src/i18n/detect.test.ts`, `src/i18n/ui.test.ts`, `src/pages/[lang]/index.astro`（占位页）
- Modify: `src/pages/index.astro`（改为客户端语言跳转页）

**Interfaces:**
- Consumes: Task 1 的 `astro.config.mjs` i18n 配置
- Produces: `Lang` 类型（`'zh'|'en'`）、`useTranslations(lang)`、`detectLanguage(langs)`、`getLang(url)` 辅助；`src/pages/[lang]/index.astro` 供 Task 3+ 复用模板模式

- [ ] **Step 1: 写失败单测 `src/i18n/detect.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { detectLanguage } from './detect';

describe('detectLanguage', () => {
  it('returns zh when browser prefers Chinese', () => {
    expect(detectLanguage(['zh-CN', 'zh', 'en'])).toBe('zh');
  });
  it('returns en when browser prefers English', () => {
    expect(detectLanguage(['en-US', 'en', 'zh'])).toBe('en');
  });
  it('defaults to zh when no en preference', () => {
    expect(detectLanguage(['ja-JP'])).toBe('zh');
  });
  it('handles empty input', () => {
    expect(detectLanguage([])).toBe('zh');
  });
});
```

- [ ] **Step 2: 运行确认失败**

Run: `pnpm test`
Expected: FAIL，`Cannot find module './detect'`。

- [ ] **Step 3: 写 `src/i18n/detect.ts`**

```ts
export type Lang = 'zh' | 'en';

export function detectLanguage(languages: readonly string[]): Lang {
  const list = languages.length > 0 ? languages : ['zh'];
  for (const item of list) {
    const primary = item.toLowerCase().slice(0, 2);
    if (primary === 'zh') return 'zh';
    if (primary === 'en') return 'en';
  }
  return 'zh';
}
```

- [ ] **Step 4: 写 `src/i18n/ui.ts`**

```ts
import type { Lang } from './detect';

export const ui = {
  zh: {
    'site.name': '万山青未阑',
    'nav.home': '首页',
    'nav.blog': '博客',
    'nav.projects': '软件站',
    'lang.name': '中文',
    'footer.rights': '保留所有权利',
    'notfound.title': '页面未找到',
    'notfound.back': '回到首页',
    'search.placeholder': '搜索文章与项目…',
    'missing.lang': '本文暂无{lang}版本，以下为{shown}版本。',
    'post.reading': '约 {min} 分钟',
    'project.active': '活跃',
    'project.archived': '归档',
    'hero.kicker': '作品集 · 简历',
    'subsite.blog.rule': '题字：随笔与文章',
    'subsite.projects.rule': '题字：开源与作品',
  },
  en: {
    'site.name': 'Eververdants',
    'nav.home': 'Home',
    'nav.blog': 'Blog',
    'nav.projects': 'Software',
    'lang.name': 'English',
    'footer.rights': 'All rights reserved',
    'notfound.title': 'Page not found',
    'notfound.back': 'Back home',
    'search.placeholder': 'Search posts & projects…',
    'missing.lang': 'This page has no {lang} version yet; showing the {shown} version.',
    'post.reading': '~{min} min',
    'project.active': 'Active',
    'project.archived': 'Archived',
    'hero.kicker': 'PORTFOLIO · Resume',
    'subsite.blog.rule': 'Essays & Notes',
    'subsite.projects.rule': 'Open Source & Works',
  },
} as const;

export type UiKey = keyof (typeof ui)['zh'];

export function useTranslations(lang: Lang) {
  return (key: UiKey): string => ui[lang][key] ?? ui.zh[key];
}

export const langNames: Record<Lang, string> = {
  zh: '中文',
  en: 'English',
};
```

- [ ] **Step 5: 写 `src/i18n/ui.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { useTranslations } from './ui';

describe('useTranslations', () => {
  it('returns zh value for zh', () => {
    expect(useTranslations('zh')('nav.blog')).toBe('博客');
  });
  it('returns en value for en', () => {
    expect(useTranslations('en')('nav.blog')).toBe('Blog');
  });
  it('falls back to zh when key missing in en', () => {
    expect(useTranslations('en')('site.name')).toBe('Eververdants');
  });
});
```

- [ ] **Step 6: 跑单测确认通过**

Run: `pnpm test`
Expected: 2 个测试文件全 PASS（7 个用例）。

- [ ] **Step 7: 改 `src/pages/index.astro` 为语言跳转页**

```astro
---
---
<html lang="zh">
  <head>
    <meta charset="utf-8" />
    <title>Eververdants</title>
  </head>
  <body>
    <script>
      import { detectLanguage } from '../i18n/detect';
      const lang = detectLanguage(navigator.languages ?? [navigator.language]);
      location.replace(`/${lang}/`);
    </script>
  </body>
</html>
```

- [ ] **Step 8: 新建 `src/pages/[lang]/index.astro` 占位页**

```astro
---
import { useTranslations } from '../../i18n/ui';
import type { Lang } from '../../i18n/detect';

export function getStaticPaths() {
  return [{ params: { lang: 'zh' } }, { params: { lang: 'en' } }];
}

const { lang } = Astro.params as { lang: Lang };
const t = useTranslations(lang);
---
<!DOCTYPE html>
<html lang={lang}>
  <head><meta charset="utf-8" /><title>{t('site.name')}</title></head>
  <body><h1>{t('site.name')}</h1></body>
</html>
```

- [ ] **Step 9: 验证构建 + 手动**

Run: `pnpm astro build`
Expected: 成功，`dist/zh/index.html` 与 `dist/en/index.html` 生成。

Run: `pnpm astro dev`
Expected: 浏览器开 `/` 跳 `/zh/`；开 `/zh/` 显示中文占位，`/en/` 显示英文占位。

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: i18n 路由基础 + 根路径语言检测跳转 + i18n 单测"
```

---

### Task 3: 布局骨架（BaseLayout + MagazineLayout + Masthead + 页脚）

**Files:**
- Create: `src/components/Masthead.astro`, `src/components/LangSwitch.astro`, `src/components/Footer.astro`, `src/layouts/BaseLayout.astro`, `src/layouts/MagazineLayout.astro`
- Modify: `src/pages/[lang]/index.astro`（接入 MagazineLayout）
- Create: `src/pages/404.astro`

**Interfaces:**
- Consumes: `useTranslations`, `Lang`（Task 2）；`@fontsource/geist-mono`（依赖）
- Produces: `BaseLayout` props `{ title, description, lang, path }`（`path` 为不含语言前缀的路径，如 `''`、`'blog/'`、`blog/foo/`）；`MagazineLayout` 同 props；后续页面全部套用

- [ ] **Step 1: 写 `src/components/LangSwitch.astro`**

```astro
---
import { getRelativeLocaleUrl } from 'astro:i18n';
import { langNames } from '../i18n/ui';
import type { Lang } from '../i18n/detect';

interface Props { lang: Lang; path: string; }
const { lang, path } = Astro.props;
const others: Lang[] = lang === 'zh' ? ['en'] : ['zh'];
---
<span class="font-mono text-xs tracking-widest">
  {others.map((other) => (
    <a href={getRelativeLocaleUrl(other, path)} class="text-plum hover:text-cinnabar transition-colors">
      {langNames[other]}
    </a>
  ))}
</span>
```

- [ ] **Step 2: 写 `src/components/Masthead.astro`**

```astro
---
import { getRelativeLocaleUrl } from 'astro:i18n';
import { useTranslations } from '../i18n/ui';
import type { Lang } from '../i18n/detect';
import LangSwitch from './LangSwitch.astro';

interface Props { lang: Lang; path: string; }
const { lang, path } = Astro.props;
const t = useTranslations(lang);
const nav = [
  { href: getRelativeLocaleUrl(lang, ''), label: t('nav.home'), key: 'home' },
  { href: getRelativeLocaleUrl(lang, 'blog/'), label: t('nav.blog'), key: 'blog' },
  { href: getRelativeLocaleUrl(lang, 'projects/'), label: t('nav.projects'), key: 'projects' },
];
const activeKey = path.split('/')[0];
---
<header class="border-b border-line">
  <div class="mx-auto max-w-4xl px-6 py-4 flex items-center justify-between">
    <a href={getRelativeLocaleUrl(lang, '')} class="font-serif-sc font-bold text-xl tracking-wide">
      {t('site.name')}
    </a>
    <nav class="flex items-center gap-6">
      {nav.map((item) => (
        <a href={item.href} class:list={[
          'font-mono text-xs uppercase tracking-[0.2em] hover:text-cinnabar transition-colors',
          item.key === activeKey ? 'text-cinnabar' : 'text-plum',
        ]}>{item.label}</a>
      ))}
      <LangSwitch lang={lang} path={path} />
    </nav>
  </div>
</header>
```

- [ ] **Step 3: 写 `src/components/Footer.astro`**

```astro
---
import { getRelativeLocaleUrl } from 'astro:i18n';
import { useTranslations } from '../i18n/ui';
import type { Lang } from '../i18n/detect';

interface Props { lang: Lang; }
const { lang } = Astro.props;
const t = useTranslations(lang);
const year = 2026;
---
<footer class="border-t border-line">
  <div class="mx-auto max-w-4xl px-6 py-6 flex flex-wrap items-center justify-between gap-2 font-mono text-xs text-plum">
    <span>© {year} {t('site.name')} · {t('footer.rights')}</span>
    <span class="flex gap-4">
      <a href={getRelativeLocaleUrl(lang, 'blog/')} class="hover:text-cinnabar">{t('nav.blog')}</a>
      <a href={getRelativeLocaleUrl(lang, 'projects/')} class="hover:text-cinnabar">{t('nav.projects')}</a>
    </span>
  </div>
</footer>
```

- [ ] **Step 4: 写 `src/layouts/BaseLayout.astro`**

```astro
---
import '@fontsource/geist-mono';
import '../styles/global.css';
import { getAbsoluteLocaleUrl } from 'astro:i18n';
import type { Lang } from '../i18n/detect';

interface Props {
  title: string;
  description?: string;
  lang: Lang;
  path: string;
}
const { title, description, lang, path } = Astro.props;
const locales: Lang[] = ['zh', 'en'];
const canonical = getAbsoluteLocaleUrl(lang, path);
---
<!DOCTYPE html>
<html lang={lang}>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{title}</title>
    {description && <meta name="description" content={description} />}
    <link rel="canonical" href={canonical} />
    {locales.map((l) => (
      <link rel="alternate" hreflang={l} href={getAbsoluteLocaleUrl(l, path)} />
    ))}
    <link rel="icon" type="image/png" href="/favicon.png" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,600;1,400&family=Noto+Sans+SC:wght@400;500;700&family=Noto+Serif+SC:wght@500;700;900&display=swap"
      rel="stylesheet"
    />
  </head>
  <body>
    <slot />
  </body>
</html>
```

注：`favicon.png` 由 Task 10 生成，先用 `public/image.png` 现有文件占位（把 href 临时改 `/image.png`，Task 10 再换）。

- [ ] **Step 5: 写 `src/layouts/MagazineLayout.astro`**

```astro
---
import BaseLayout from './BaseLayout.astro';
import Masthead from '../components/Masthead.astro';
import Footer from '../components/Footer.astro';
import type { Lang } from '../i18n/detect';

interface Props {
  title: string;
  description?: string;
  lang: Lang;
  path: string;
}
const { title, description, lang, path } = Astro.props;
---
<BaseLayout title={title} description={description} lang={lang} path={path}>
  <Masthead lang={lang} path={path} />
  <main class="mx-auto max-w-4xl px-6">
    <slot />
  </main>
  <Footer lang={lang} />
</BaseLayout>
```

- [ ] **Step 6: 改 `src/pages/[lang]/index.astro` 接入布局**

```astro
---
import MagazineLayout from '../../layouts/MagazineLayout.astro';
import { useTranslations } from '../../i18n/ui';
import type { Lang } from '../../i18n/detect';

export function getStaticPaths() {
  return [{ params: { lang: 'zh' } }, { params: { lang: 'en' } }];
}

const { lang } = Astro.params as { lang: Lang };
const t = useTranslations(lang);
const path = '';
---
<MagazineLayout title={t('site.name')} description="Eververdants" lang={lang} path={path}>
  <section class="py-24 text-center">
    <h1 class="font-serif-sc text-5xl font-black">{t('site.name')}</h1>
  </section>
</MagazineLayout>
```

- [ ] **Step 7: 写 `src/pages/404.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import { useTranslations } from '../i18n/ui';
import type { Lang } from '../i18n/detect';

const lang: Lang = 'zh'; // 404 无语言上下文，默认中文，页面同时给出双语回链
const t = useTranslations(lang);
---
<BaseLayout title="404" lang="zh" path="">
  <div class="mx-auto max-w-4xl px-6 py-24 text-center">
    <p class="font-mono text-xs tracking-widest text-plum">404</p>
    <h1 class="mt-4 font-serif-sc text-4xl font-black">{t('notfound.title')}</h1>
    <div class="mt-6 flex justify-center gap-6 font-mono text-xs">
      <a href="/zh/" class="inline-block text-cinnabar underline underline-offset-4">{t('notfound.back')}</a>
      <a href="/en/" class="inline-block text-plum underline underline-offset-4 hover:text-cinnabar">English</a>
    </div>
  </div>
</BaseLayout>
```

- [ ] **Step 8: 验证**

Run: `pnpm astro build`
Expected: 成功，`dist/zh/index.html`、`dist/en/index.html`、`dist/404.html` 生成。

Run: `pnpm astro dev`
Expected: 页头显示站名 + 三导航 + 语言切换；点 EN 跳 `/en/`；404 页样式正常。

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: 杂志布局骨架（页头/导航/语言切换/页脚/404）"
```

---

### Task 4: 主站简历页

**Files:**
- Create: `src/data/resume-zh.ts`, `src/data/resume-en.ts`, `src/components/SkillSection.astro`, `src/components/Timeline.astro`, `src/components/SubSiteCards.astro`
- Modify: `src/pages/[lang]/index.astro`（完整简历页）

**Interfaces:**
- Consumes: `MagazineLayout`, `useTranslations`, `Lang`（Task 3）
- Produces: `resume` 数据 shape：`{ name, title, slogan, avatar?, skills: { group, items[] }[], experience: { period, org, role, desc }[], education: { period, org, desc }[], contacts: { label, href }[] }`（中英各一份）

- [ ] **Step 1: 写 `src/data/resume-zh.ts`**（占位内容，用户后填）

```ts
export interface ResumeData {
  name: string;
  title: string;
  slogan: string;
  avatar?: string;
  skills: { group: string; items: string[] }[];
  experience: { period: string; org: string; role: string; desc: string }[];
  education: { period: string; org: string; desc: string }[];
  contacts: { label: string; href: string }[];
}

export const resumeZh: ResumeData = {
  name: 'Eververdants',
  title: '创意开发者 · 技术教育者',
  slogan: '写代码，也写字。',
  avatar: '/images/avatar.png',
  skills: [
    { group: '前端', items: ['TypeScript', 'React', 'Astro', 'Tailwind CSS'] },
    { group: '后端', items: ['Node.js', 'Rust'] },
    { group: '创意', items: ['Three.js', '生成式图像'] },
  ],
  experience: [
    { period: '2023 — 至今', org: '自由职业', role: '全栈开发者', desc: '构建个人产品与开源项目。' },
  ],
  education: [
    { period: '—', org: '—', desc: '占位，待填。' },
  ],
  contacts: [
    { label: 'GitHub', href: 'https://github.com/Eververdants' },
    { label: 'Email', href: 'mailto:eververdants@example.com' },
  ],
};
```

- [ ] **Step 2: 写 `src/data/resume-en.ts`**（同 shape，英文占位）

```ts
import type { ResumeData } from './resume-zh';

export const resumeEn: ResumeData = {
  name: 'Eververdants',
  title: 'Creative Developer · Technical Educator',
  slogan: 'Write code. Write words.',
  avatar: '/images/avatar.png',
  skills: [
    { group: 'Frontend', items: ['TypeScript', 'React', 'Astro', 'Tailwind CSS'] },
    { group: 'Backend', items: ['Node.js', 'Rust'] },
    { group: 'Creative', items: ['Three.js', 'Generative imagery'] },
  ],
  experience: [
    { period: '2023 — Present', org: 'Freelance', role: 'Full-stack Developer', desc: 'Building personal products and open source projects.' },
  ],
  education: [
    { period: '—', org: '—', desc: 'Placeholder.' },
  ],
  contacts: [
    { label: 'GitHub', href: 'https://github.com/Eververdants' },
    { label: 'Email', href: 'mailto:eververdants@example.com' },
  ],
};
```

- [ ] **Step 3: 写 `src/components/SkillSection.astro`**

```astro
---
import type { ResumeData } from '../data/resume-zh';
interface Props { skills: ResumeData['skills']; }
const { skills } = Astro.props;
---
<section class="mt-16">
  <h2 class="font-mono text-xs uppercase tracking-[0.3em] text-cinnabar border-b border-line pb-2 mb-6">Skills / 技能</h2>
  <div class="grid gap-8 sm:grid-cols-2">
    {skills.map((group) => (
      <div>
        <h3 class="font-serif-sc font-bold text-lg mb-3">{group.group}</h3>
        <ul class="flex flex-wrap gap-2">
          {group.items.map((item) => (
            <li class="border border-line px-2 py-1 font-mono text-xs text-plum">{item}</li>
          ))}
        </ul>
      </div>
    ))}
  </div>
</section>
```

- [ ] **Step 4: 写 `src/components/Timeline.astro`**

```astro
---
import type { ResumeData } from '../data/resume-zh';
interface Props { items: { period: string; org: string; role?: string; desc: string }[]; }
const { items } = Astro.props;
---
<ol class="relative border-l border-line pl-6 ml-2 space-y-8">
  {items.map((item) => (
    <li class="relative">
      <span class="absolute -left-[7px] top-1 h-3 w-3 rounded-full bg-cinnabar border-2 border-paper" aria-hidden="true" />
      <p class="font-mono text-xs tracking-widest text-plum">{item.period}</p>
      <h3 class="font-serif-sc font-bold text-lg mt-1">
        {item.role ? `${item.role} · ${item.org}` : item.org}
      </h3>
      <p class="text-sm text-plum mt-1">{item.desc}</p>
    </li>
  ))}
</ol>
```

- [ ] **Step 5: 写 `src/components/SubSiteCards.astro`**（两个副站大字入口）

```astro
---
import { getRelativeLocaleUrl } from 'astro:i18n';
import { useTranslations } from '../i18n/ui';
import type { Lang } from '../i18n/detect';

interface Props { lang: Lang; }
const { lang } = Astro.props;
const t = useTranslations(lang);
const cards = [
  { href: getRelativeLocaleUrl(lang, 'blog/'), label: t('nav.blog'), en: 'BLOG', rule: t('subsite.blog.rule') },
  { href: getRelativeLocaleUrl(lang, 'projects/'), label: t('nav.projects'), en: 'SOFTWARE', rule: t('subsite.projects.rule') },
];
---
<div class="mt-20 grid gap-6 sm:grid-cols-2">
  {cards.map((card) => (
    <a href={card.href} class="group border border-line bg-paper-2/50 p-8 hover:border-cinnabar transition-colors block">
      <span class="font-mono text-xs tracking-[0.3em] text-cinnabar">{card.en}</span>
      <span class="mt-3 block font-serif-sc text-3xl font-black group-hover:text-cinnabar transition-colors">{card.label}</span>
      <span class="mt-2 block font-mono text-xs text-plum">{card.rule}</span>
    </a>
  ))}
</div>
```

- [ ] **Step 6: 重写 `src/pages/[lang]/index.astro`**

```astro
---
import MagazineLayout from '../../layouts/MagazineLayout.astro';
import { useTranslations } from '../../i18n/ui';
import type { Lang } from '../../i18n/detect';
import { resumeZh } from '../../data/resume-zh';
import { resumeEn } from '../../data/resume-en';
import SkillSection from '../../components/SkillSection.astro';
import Timeline from '../../components/Timeline.astro';
import SubSiteCards from '../../components/SubSiteCards.astro';

export function getStaticPaths() {
  return [{ params: { lang: 'zh' } }, { params: { lang: 'en' } }];
}

const { lang } = Astro.params as { lang: Lang };
const t = useTranslations(lang);
const resume = lang === 'zh' ? resumeZh : resumeEn;
const path = '';
---
<MagazineLayout title={`${resume.name} · ${resume.title}`} description={resume.slogan} lang={lang} path={path}>
  <!-- Hero -->
  <section class="py-20 border-b border-line">
    <p class="font-mono text-xs uppercase tracking-[0.3em] text-cinnabar">{t('hero.kicker')}</p>
    <h1 class="mt-6 font-serif-sc text-6xl font-black leading-tight">{resume.name}</h1>
    <p class="mt-4 font-display text-2xl text-plum italic">{resume.title}</p>
    <p class="mt-2 text-plum">{resume.slogan}</p>
  </section>

  <!-- 副站入口 -->
  <SubSiteCards lang={lang} />

  <!-- 技能 -->
  <SkillSection skills={resume.skills} />

  <!-- 经历 -->
  <section class="mt-16">
    <h2 class="font-mono text-xs uppercase tracking-[0.3em] text-cinnabar border-b border-line pb-2 mb-6">Experience / 经历</h2>
    <Timeline items={resume.experience} />
  </section>

  <!-- 教育 -->
  <section class="mt-16">
    <h2 class="font-mono text-xs uppercase tracking-[0.3em] text-cinnabar border-b border-line pb-2 mb-6">Education / 教育</h2>
    <Timeline items={resume.education} />
  </section>

  <!-- 联系 -->
  <section class="mt-16 mb-24">
    <h2 class="font-mono text-xs uppercase tracking-[0.3em] text-cinnabar border-b border-line pb-2 mb-6">Contact / 联系</h2>
    <div class="flex flex-wrap gap-6">
      {resume.contacts.map((c) => (
        <a href={c.href} class="font-mono text-sm text-plum hover:text-cinnabar underline underline-offset-4">{c.label}</a>
      ))}
    </div>
  </section>
</MagazineLayout>
```

- [ ] **Step 7: 验证**

Run: `pnpm astro build`
Expected: 成功。

Run: `pnpm astro dev`，开 `/zh/`
Expected: Hero 大字 + 两个副站卡片 + 技能铅字标签 + 时间线 + 联系链接，杂志风格排版。

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: 主站简历页（Hero/技能/经历/教育/联系/副站入口）"
```

---

### Task 5: 博客——内容集合 + 列表页 + 文章页

**Files:**
- Create: `src/content.config.ts`, `src/content/blog-zh/hello.md`, `src/content/blog-en/hello.md`, `src/content/utils.ts`, `src/i18n/reading.ts`, `src/i18n/reading.test.ts`, `src/pages/[lang]/blog/index.astro`, `src/pages/[lang]/blog/[slug].astro`, `src/components/PostCard.astro`

**Interfaces:**
- Consumes: `MagazineLayout`, `useTranslations`, `Lang`
- Produces: `getPosts(lang)` → `CollectionEntry<'blog-zh'>[]`（按日期倒序、过滤 draft）；`getPost(lang, slug)` → entry 或 null；`readingTime(text, lang)` → `{ minutes }`；文章 frontmatter：`title, date, tags[], cover?, description?, draft?, series?`

- [ ] **Step 1: 写失败单测 `src/i18n/reading.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { readingTime } from './reading';

describe('readingTime', () => {
  it('counts Chinese at ~300 chars/min', () => {
    expect(readingTime('好。'.repeat(300), 'zh')).toBeGreaterThan(0);
    expect(readingTime('好。'.repeat(300), 'zh')).toBeLessThanOrEqual(1);
  });
  it('counts English at ~200 wpm', () => {
    expect(readingTime('word '.repeat(200), 'en')).toBeLessThanOrEqual(1);
  });
  it('returns at least 1 minute', () => {
    expect(readingTime('hi', 'en')).toBe(1);
  });
});
```

- [ ] **Step 2: 运行确认失败**

Run: `pnpm test`
Expected: FAIL，`Cannot find module './reading'`。

- [ ] **Step 3: 写 `src/i18n/reading.ts`**

```ts
import type { Lang } from './detect';

export function readingTime(text: string, lang: Lang): number {
  const cjk = (text.match(/[一-鿿]/g) ?? []).length;
  const latin = text.replace(/[一-鿿]/g, ' ').trim().split(/\s+/).filter(Boolean).length;
  let minutes: number;
  if (lang === 'zh') {
    minutes = cjk / 300 + latin / 150;
  } else {
    minutes = latin / 200 + cjk / 600;
  }
  return Math.max(1, Math.round(minutes));
}
```

- [ ] **Step 4: 跑单测确认通过**

Run: `pnpm test`
Expected: `reading.test.ts` PASS。

- [ ] **Step 5: 写 `src/content.config.ts`**

```ts
import { defineCollection, z } from 'astro:content';

const blogSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  date: z.coerce.date(),
  tags: z.array(z.string()).default([]),
  cover: z.string().optional(),
  draft: z.boolean().default(false),
  series: z.string().optional(),
});

const projectSchema = z.object({
  name: z.string(),
  tagline: z.string(),
  description: z.string().optional(),
  tags: z.array(z.string()).default([]),
  category: z.string().optional(),
  repoUrl: z.string(),
  demoUrl: z.string().optional(),
  image: z.string().optional(),
  status: z.enum(['active', 'archived']).default('active'),
  date: z.coerce.date(),
  featured: z.boolean().default(false),
});

const blogZh = defineCollection({ type: 'content', schema: blogSchema });
const blogEn = defineCollection({ type: 'content', schema: blogSchema });
const projectsZh = defineCollection({ type: 'content', schema: projectSchema });
const projectsEn = defineCollection({ type: 'content', schema: projectSchema });

export const collections = {
  'blog-zh': blogZh,
  'blog-en': blogEn,
  'projects-zh': projectsZh,
  'projects-en': projectsEn,
};
```

- [ ] **Step 6: 写 `src/content/utils.ts`**

```ts
import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';
import type { Lang } from '../i18n/detect';

const blogKey: Record<Lang, 'blog-zh' | 'blog-en'> = { zh: 'blog-zh', en: 'blog-en' };
const projKey: Record<Lang, 'projects-zh' | 'projects-en'> = { zh: 'projects-zh', en: 'projects-en' };

export async function getPosts(lang: Lang): Promise<CollectionEntry<'blog-zh'>[]> {
  const posts = await getCollection(blogKey[lang]);
  return posts
    .filter((p) => !p.data.draft)
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export async function getPost(lang: Lang, slug: string) {
  const posts = await getPosts(lang);
  return posts.find((p) => p.slug === slug) ?? null;
}

export async function getProjects(lang: Lang): Promise<CollectionEntry<'projects-zh'>[]> {
  const projects = await getCollection(projKey[lang]);
  return projects.sort(
    (a, b) => Number(b.data.featured) - Number(a.data.featured) || b.data.date.getTime() - a.data.date.getTime()
  );
}

export function otherLang(lang: Lang): Lang {
  return lang === 'zh' ? 'en' : 'zh';
}
```

- [ ] **Step 7: 写种子文章 `src/content/blog-zh/hello.md` 与 `src/content/blog-en/hello.md`**

`blog-zh/hello.md`:
```md
---
title: 你好，新站
description: 重构之后的第一篇。
date: 2026-08-10
tags: [杂记]
---
这是新站的第一篇文章。设计走了编辑杂志风，取自六七十年代的印刷工艺质感。
```

`blog-en/hello.md`:
```md
---
title: Hello, new site
description: First post after the rebuild.
date: 2026-08-10
tags: [notes]
---
The first post of the rebuilt site, styled as an editorial magazine borrowing the print-craft texture of the 1960s–70s.
```

- [ ] **Step 8: 写 `src/components/PostCard.astro`**

```astro
---
import { getRelativeLocaleUrl } from 'astro:i18n';
import { readingTime } from '../i18n/reading';
import { useTranslations } from '../i18n/ui';
import type { Lang } from '../i18n/detect';
import type { CollectionEntry } from 'astro:content';

interface Props { post: CollectionEntry<'blog-zh'>; lang: Lang; }
const { post, lang } = Astro.props;
const t = useTranslations(lang);
const rendered = await post.render();
const minutes = readingTime(rendered.body ?? '', lang);
---
<article class="border-b border-line py-8" data-tags={post.data.tags.join(' ')}>
  <time class="font-mono text-xs tracking-widest text-plum">{post.data.date.toISOString().slice(0, 10)}</time>
  <h2 class="mt-2 font-serif-sc text-2xl font-bold">
    <a href={getRelativeLocaleUrl(lang, `blog/${post.slug}/`)} class="hover:text-cinnabar transition-colors">{post.data.title}</a>
  </h2>
  {post.data.description && <p class="mt-2 text-plum text-sm">{post.data.description}</p>}
  <div class="mt-3 flex flex-wrap items-center gap-3 font-mono text-xs">
    {post.data.tags.map((tag) => <span class="border border-line px-2 py-0.5 text-plum">#{tag}</span>)}
    <span class="text-plum">{t('post.reading').replace('{min}', String(minutes))}</span>
  </div>
</article>
```

- [ ] **Step 9: 写 `src/pages/[lang]/blog/index.astro`**

```astro
---
import MagazineLayout from '../../../layouts/MagazineLayout.astro';
import { useTranslations } from '../../../i18n/ui';
import type { Lang } from '../../../i18n/detect';
import { getPosts } from '../../../content/utils';
import PostCard from '../../../components/PostCard.astro';

export function getStaticPaths() {
  return [{ params: { lang: 'zh' } }, { params: { lang: 'en' } }];
}

const { lang } = Astro.params as { lang: Lang };
const t = useTranslations(lang);
const path = 'blog/';
const posts = await getPosts(lang);
const allTags = [...new Set(posts.flatMap((p) => p.data.tags))].sort();
---
<MagazineLayout title={`${t('nav.blog')} · ${t('site.name')}`} lang={lang} path={path}>
  <header class="py-14 border-b border-line">
    <p class="font-mono text-xs uppercase tracking-[0.3em] text-cinnabar">{t('nav.blog').toUpperCase()}</p>
    <h1 class="mt-4 font-serif-sc text-5xl font-black">{t('nav.blog')}</h1>
  </header>

  <!-- 标签行（Task 6 会换成交互岛） -->
  <nav class="flex flex-wrap gap-3 py-6 border-b border-line font-mono text-xs">
    <span class="text-plum">Tags</span>
    {allTags.map((tag) => <button type="button" data-tag={tag} class="border border-line px-2 py-0.5 text-plum hover:border-cinnabar hover:text-cinnabar">{tag}</button>)}
  </nav>

  <div id="post-list" class="divide-y divide-line">
    {posts.map((post) => <PostCard post={post} lang={lang} />)}
  </div>
</MagazineLayout>
```

- [ ] **Step 10: 写 `src/pages/[lang]/blog/[slug].astro`**

```astro
---
import MagazineLayout from '../../../layouts/MagazineLayout.astro';
import { useTranslations, langNames } from '../../../i18n/ui';
import { getRelativeLocaleUrl } from 'astro:i18n';
import type { Lang } from '../../../i18n/detect';
import { getPosts, getPost, otherLang } from '../../../content/utils';
import { readingTime } from '../../../i18n/reading';

export async function getStaticPaths() {
  const langs: Lang[] = ['zh', 'en'];
  // 收集两语言 slug 并集：保证单语文章在另一语言也生成路径，供页面内缺语言回退兜底
  const slugs = new Set<string>();
  for (const lang of langs) {
    for (const post of await getPosts(lang)) {
      slugs.add(post.slug);
    }
  }
  const params: { params: { lang: Lang; slug: string } }[] = [];
  for (const lang of langs) {
    for (const slug of slugs) {
      params.push({ params: { lang, slug } });
    }
  }
  return params;
}

const { lang } = Astro.params as { lang: Lang };
const slug = Astro.params.slug as string;
const t = useTranslations(lang);
let post = await getPost(lang, slug);
let shownLang = lang;
if (!post) {
  shownLang = otherLang(lang);
  post = await getPost(shownLang, slug);
}
if (!post) return Astro.redirect(`/${lang}/blog/`);
const { Content } = await post.render();
const minutes = readingTime(post.body ?? '', shownLang);
// 前后篇基于展示语言（shownLang）的文章列表，回退场景下也正确
const allPosts = await getPosts(shownLang);
const idx = allPosts.findIndex((p) => p.slug === post.slug);
const prev = idx > 0 ? allPosts[idx - 1] : null;
const next = idx >= 0 && idx < allPosts.length - 1 ? allPosts[idx + 1] : null;
const path = `blog/${slug}/`;
---
<MagazineLayout title={post.data.title} description={post.data.description} lang={lang} path={path}>
  <article class="py-14 max-w-2xl mx-auto">
    <time class="font-mono text-xs tracking-widest text-plum">{post.data.date.toISOString().slice(0, 10)} · {t('post.reading').replace('{min}', String(minutes))}</time>
    <h1 class="mt-4 font-serif-sc text-4xl font-black leading-tight">{post.data.title}</h1>
    {shownLang !== lang && (
      <p class="mt-4 border-l-2 border-cinnabar pl-3 font-mono text-xs text-plum">
        {t('missing.lang').replace('{lang}', langNames[lang] ?? lang).replace('{shown}', langNames[shownLang] ?? shownLang)}
      </p>
    )}
    <div class="mt-6 flex flex-wrap gap-3 font-mono text-xs">
      {post.data.tags.map((tag) => <span class="border border-line px-2 py-0.5 text-plum">#{tag}</span>)}
    </div>
    <div class="prose mt-10">
      <Content />
    </div>

    <nav class="mt-16 flex justify-between border-t border-line pt-6 font-mono text-xs">
      {next ? <a href={getRelativeLocaleUrl(lang, `blog/${next.slug}/`)} class="text-plum hover:text-cinnabar">← {next.data.title}</a> : <span />}
      {prev ? <a href={getRelativeLocaleUrl(lang, `blog/${prev.slug}/`)} class="text-plum hover:text-cinnabar text-right">{prev.data.title} →</a> : <span />}
    </nav>
  </article>
</MagazineLayout>
```

- [ ] **Step 11: 验证**

Run: `pnpm astro build`
Expected: 成功，生成 `/zh/blog/`、`/zh/blog/hello/`、`/en/blog/`、`/en/blog/hello/`。

Run: `pnpm astro dev`
Expected: 博客列表显示日期/标题/标签/阅读时长；文章页正文 MDX 渲染、上一篇/下一篇、缺失语言提示逻辑正常。

- [ ] **Step 12: Commit**

```bash
git add -A
git commit -m "feat: 博客内容集合 + 列表页 + 文章页（MDX/阅读时长/前后篇）"
```

---

### Task 6: 博客标签过滤（React 岛）

**Files:**
- Create: `src/components/TagFilter.tsx`
- Modify: `src/pages/[lang]/blog/index.astro`（标签行换成 TagFilter 岛）

**Interfaces:**
- Consumes: 列表页 `#post-list` 中每个 `article[data-tags]` 的 DOM
- Produces: 客户端标签过滤岛；无 props（读 DOM）

- [ ] **Step 1: 写 `src/components/TagFilter.tsx`**

```tsx
import { useState } from 'react';

const ALL = '__all__';

export default function TagFilter({ tags }: { tags: string[] }) {
  const [active, setActive] = useState<string>(ALL);

  const apply = (tag: string) => {
    setActive(tag);
    const articles = document.querySelectorAll<HTMLElement>('#post-list article[data-tags]');
    articles.forEach((el) => {
      const matched = tag === ALL || el.dataset.tags?.split(' ').includes(tag);
      el.hidden = !matched;
    });
  };

  return (
    <nav className="flex flex-wrap gap-3 py-6 border-b border-line font-mono text-xs">
      <span className="text-plum">Tags</span>
      <button
        type="button"
        onClick={() => apply(ALL)}
        className={`border px-2 py-0.5 ${active === ALL ? 'border-cinnabar text-cinnabar' : 'border-line text-plum hover:border-cinnabar hover:text-cinnabar'}`}
      >
        全部 / All
      </button>
      {tags.map((tag) => (
        <button
          key={tag}
          type="button"
          onClick={() => apply(tag)}
          className={`border px-2 py-0.5 ${active === tag ? 'border-cinnabar text-cinnabar' : 'border-line text-plum hover:border-cinnabar hover:text-cinnabar'}`}
        >
          {tag}
        </button>
      ))}
    </nav>
  );
}
```

- [ ] **Step 2: 改 `src/pages/[lang]/blog/index.astro`**

标签行（Step 9 的 `<nav>...</nav>`）替换为：

```astro
<TagFilter tags={allTags} client:load />
```

顶部 import 加 `import TagFilter from '../../../components/TagFilter.tsx';`

- [ ] **Step 3: 验证**

Run: `pnpm astro build`
Expected: 成功，React 岛打包。

Run: `pnpm astro dev`，开 `/zh/blog/`
Expected: 点标签过滤文章，点"全部"恢复。

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: 博客标签过滤（React 岛）"
```

---

### Task 7: 软件站——项目集合 + 列表 + 详情

**Files:**
- Create: `src/content/projects-zh/etb.md`, `src/content/projects-en/etb.md`, `src/components/ProjectCard.astro`, `src/pages/[lang]/projects/index.astro`, `src/pages/[lang]/projects/[slug].astro`

**Interfaces:**
- Consumes: `getProjects(lang)`（Task 5 的 utils）；`useTranslations`；`MagazineLayout`
- Produces: 项目页模板模式（与博客页对称）；frontmatter：`name, tagline, description?, tags[], category?, repoUrl, demoUrl?, image?, status, date, featured?`

- [ ] **Step 1: 写种子项目 `src/content/projects-zh/etb.md` 与 `src/content/projects-en/etb.md`**

`projects-zh/etb.md`:
```md
---
name: ETB Save Manager
tagline: 管理《Escape The Backrooms》存档的桌面工具
description: 跨平台存档备份/恢复工具，基于 Tauri。
tags: [Tauri, Rust, Vue, TypeScript]
category: 桌面应用
repoUrl: https://github.com/Eververdants/ETBSaveManager
demoUrl: https://eververdants.github.io/ETBSaveManager/
image: /images/projects/etb.png
status: active
date: 2025-01-01
featured: true
---
Tauri 桌面应用，一键备份、恢复和管理游戏存档。
```

`projects-en/etb.md`:
```md
---
name: ETB Save Manager
tagline: A save manager for Escape The Backrooms
description: Cross-platform save backup/restore tool built with Tauri.
tags: [Tauri, Rust, Vue, TypeScript]
category: Desktop
repoUrl: https://github.com/Eververdants/ETBSaveManager
demoUrl: https://eververdants.github.io/ETBSaveManager/
image: /images/projects/etb.png
status: active
date: 2025-01-01
featured: true
---
A Tauri desktop app for backing up, restoring, and managing game saves.
```

- [ ] **Step 2: 写 `src/components/ProjectCard.astro`**

```astro
---
import { getRelativeLocaleUrl } from 'astro:i18n';
import { useTranslations } from '../i18n/ui';
import type { Lang } from '../i18n/detect';
import type { CollectionEntry } from 'astro:content';

interface Props { project: CollectionEntry<'projects-zh'>; lang: Lang; }
const { project, lang } = Astro.props;
const t = useTranslations(lang);
const p = project.data;
---
<a href={getRelativeLocaleUrl(lang, `projects/${project.slug}/`)} class="group block border border-line bg-paper-2/40 p-6 hover:border-cinnabar transition-colors">
  <div class="flex items-start justify-between gap-4">
    <h3 class="font-serif-sc text-xl font-bold group-hover:text-cinnabar transition-colors">{p.name}</h3>
    <span class:list={[
      'font-mono text-xs px-2 py-0.5 border',
      p.status === 'active' ? 'border-cinnabar text-cinnabar' : 'border-line text-plum',
    ]}>{p.status === 'active' ? t('project.active') : t('project.archived')}</span>
  </div>
  <p class="mt-2 text-sm text-plum">{p.tagline}</p>
  {p.description && <p class="mt-1 text-xs text-plum/80">{p.description}</p>}
  <div class="mt-4 flex flex-wrap gap-2 font-mono text-xs">
    {p.tags.map((tag) => <span class="border border-line px-2 py-0.5 text-plum">#{tag}</span>)}
  </div>
</a>
```

- [ ] **Step 3: 写 `src/pages/[lang]/projects/index.astro`**

```astro
---
import MagazineLayout from '../../../layouts/MagazineLayout.astro';
import { useTranslations } from '../../../i18n/ui';
import type { Lang } from '../../../i18n/detect';
import { getProjects } from '../../../content/utils';
import ProjectCard from '../../../components/ProjectCard.astro';

export function getStaticPaths() {
  return [{ params: { lang: 'zh' } }, { params: { lang: 'en' } }];
}

const { lang } = Astro.params as { lang: Lang };
const t = useTranslations(lang);
const path = 'projects/';
const projects = await getProjects(lang);
---
<MagazineLayout title={`${t('nav.projects')} · ${t('site.name')}`} lang={lang} path={path}>
  <header class="py-14 border-b border-line">
    <p class="font-mono text-xs uppercase tracking-[0.3em] text-cinnabar">{t('nav.projects').toUpperCase()}</p>
    <h1 class="mt-4 font-serif-sc text-5xl font-black">{t('nav.projects')}</h1>
  </header>
  <div class="py-10 grid gap-6 sm:grid-cols-2">
    {projects.map((project) => <ProjectCard project={project} lang={lang} />)}
  </div>
</MagazineLayout>
```

- [ ] **Step 4: 写 `src/pages/[lang]/projects/[slug].astro`**

```astro
---
import MagazineLayout from '../../../layouts/MagazineLayout.astro';
import { useTranslations } from '../../../i18n/ui';
import { langNames } from '../../../i18n/ui';
import type { Lang } from '../../../i18n/detect';
import { getProjects, otherLang } from '../../../content/utils';
import { getCollection } from 'astro:content';

export async function getStaticPaths() {
  const langs: Lang[] = ['zh', 'en'];
  // 收集两语言 slug 并集，保证单语项目在另一语言也生成路径（与博客文章页一致）
  const slugs = new Set<string>();
  for (const lang of langs) {
    for (const project of await getProjects(lang)) {
      slugs.add(project.slug);
    }
  }
  const params: { params: { lang: Lang; slug: string } }[] = [];
  for (const lang of langs) {
    for (const slug of slugs) {
      params.push({ params: { lang, slug } });
    }
  }
  return params;
}

const { lang } = Astro.params as { lang: Lang };
const slug = Astro.params.slug as string;
const t = useTranslations(lang);
let project = (await getCollection(lang === 'zh' ? 'projects-zh' : 'projects-en')).find((p) => p.slug === slug) ?? null;
let shownLang = lang;
if (!project) {
  shownLang = otherLang(lang);
  const key = shownLang === 'zh' ? 'projects-zh' : 'projects-en';
  project = (await getCollection(key)).find((p) => p.slug === slug) ?? null;
}
if (!project) return Astro.redirect(`/${lang}/projects/`);
const { Content } = await project.render();
const p = project.data;
const path = `projects/${slug}/`;
---
<MagazineLayout title={p.name} description={p.tagline} lang={lang} path={path}>
  <article class="py-14 max-w-2xl mx-auto">
    <p class="font-mono text-xs uppercase tracking-[0.3em] text-cinnabar">{t('nav.projects').toUpperCase()}</p>
    <h1 class="mt-4 font-serif-sc text-4xl font-black">{p.name}</h1>
    <p class="mt-3 font-display text-xl text-plum italic">{p.tagline}</p>
    {shownLang !== lang && (
      <p class="mt-4 border-l-2 border-cinnabar pl-3 font-mono text-xs text-plum">
        {t('missing.lang').replace('{lang}', langNames[lang] ?? lang).replace('{shown}', langNames[shownLang] ?? shownLang)}
      </p>
    )}
    <div class="mt-6 flex flex-wrap gap-3 font-mono text-xs">
      {p.tags.map((tag) => <span class="border border-line px-2 py-0.5 text-plum">#{tag}</span>)}
    </div>
    <div class="mt-8 flex flex-wrap gap-4">
      <a href={p.repoUrl} class="border border-ink px-4 py-2 font-mono text-xs tracking-widest hover:bg-ink hover:text-paper transition-colors">GitHub ↗</a>
      {p.demoUrl && <a href={p.demoUrl} class="border border-cinnabar text-cinnabar px-4 py-2 font-mono text-xs tracking-widest hover:bg-cinnabar hover:text-paper transition-colors">Demo ↗</a>}
    </div>
    <div class="prose mt-10">
      <Content />
    </div>
  </article>
</MagazineLayout>
```

- [ ] **Step 5: 验证**

Run: `pnpm astro build`
Expected: 成功，生成 `/zh/projects/`、`/zh/projects/etb/`、`/en/projects/`、`/en/projects/etb/`。

Run: `pnpm astro dev`
Expected: 列表卡片（名称/一句话/状态徽章/标签），详情页 repo + demo 按钮，MDX 正文。

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: 软件站项目集合 + 列表 + 详情页"
```

---

### Task 8: 搜索（Pagefind + React 岛）

**Files:**
- Create: `src/components/SearchBox.tsx`, `src/components/SearchLink.astro`
- Modify: `src/components/Masthead.astro`（加搜索框入口），`astro.config.mjs`（无需改）

**Interfaces:**
- Consumes: `pagefind` CLI 在 build 后生成 `dist/pagefind/`
- Produces: `SearchBox` 客户端岛；依赖 `pagefind/pagefind.js` 客户端 API

- [ ] **Step 1: 写 `src/components/SearchBox.tsx`**

```tsx
import { useEffect, useRef, useState } from 'react';

export default function SearchBox({ lang }: { lang: 'zh' | 'en' }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<{ title: string; url: string; excerpt: string }[]>([]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (query.trim().length < 2) {
        setResults([]);
        return;
      }
      try {
        const pagefind = await import('/pagefind/pagefind.js');
        await pagefind.init();
        const search = await pagefind.search(query);
        const items = search.results.slice(0, 15);
        const data = await Promise.all(items.map((r) => r.data()));
        if (cancelled) return;
        setResults(
          data
            .filter((d) => d.url.startsWith(`/${lang}/`))
            .map((d) => ({ title: d.meta.title, url: d.url, excerpt: d.excerpt }))
        );
      } catch {
        if (!cancelled) setResults([]);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [query, lang]);

  return (
    <div className="relative font-mono text-xs">
      <input
        ref={inputRef}
        type="search"
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder="搜索 / Search"
        className="w-36 border border-line bg-transparent px-2 py-1 text-plum placeholder:text-plum/60 focus:border-cinnabar focus:outline-none"
      />
      {open && results.length > 0 && (
        <ul className="absolute right-0 top-full mt-2 w-80 border border-line bg-paper shadow-lg">
          {results.map((r) => (
            <li key={r.url}>
              <a href={r.url} className="block px-4 py-3 hover:bg-paper-2">
                <span className="block text-ink">{r.title}</span>
                <span className="block text-xs text-plum line-clamp-2" dangerouslySetInnerHTML={{ __html: r.excerpt }} />
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

- [ ] **Step 2: 改 `src/components/Masthead.astro`**

`</nav>` 前加：

```astro
<SearchBox lang={lang} client:load />
```

顶部 import 加 `import SearchBox from './SearchBox.tsx';`

- [ ] **Step 3: 验证索引 + 搜索**

Run: `pnpm astro build`
Expected: `astro check` 通过 → `astro build` 成功 → `pagefind --site dist` 生成 `dist/pagefind/` 目录。

Run: `pnpm astro preview`，开 `/zh/`
Expected: 页头搜索框输入"你好"出结果，跳转正确；`/en/` 输入 "hello" 出英文结果。

（开发期验证搜索需 `astro build` 后 `astro preview`；`astro dev` 无 pagefind 索引。）

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: Pagefind 全站搜索（React 岛，按语言过滤结果）"
```

---

### Task 9: 视觉打磨——版画质感元素

**Files:**
- Create: `src/components/Ornament.astro`, `src/components/Stamp.astro`, `src/components/VerticalText.astro`
- Modify: `src/styles/global.css`（半调网点、首字下沉、竖排工具类），`src/layouts/MagazineLayout.astro`（页脚上方加刊号角标），`src/pages/[lang]/blog/[slug].astro`（首字下沉）

**Interfaces:**
- Consumes: 既有设计 token
- Produces: 复用组件 + 质感 CSS 工具类

- [ ] **Step 1: global.css 追加质感样式**

```css
/* 半调网点背景装饰 */
.halftone {
  background-image: radial-gradient(color-mix(in srgb, var(--color-cinnabar) 22%, transparent) 1px, transparent 1px);
  background-size: 10px 10px;
}
/* 首字下沉 */
.drop-cap::first-letter {
  @apply font-serif-sc font-black text-5xl text-cinnabar float-left mr-2 mt-1 leading-none;
}
/* 竖排文字 */
.vtext {
  writing-mode: vertical-rl;
  letter-spacing: 0.2em;
}
/* 杂志刊号角标 */
.issue-mark {
  @apply font-mono text-[10px] tracking-[0.3em] text-plum;
}
```

- [ ] **Step 2: 写 `src/components/Ornament.astro`**（题花分隔线）

```astro
---
interface Props { label?: string; }
const { label } = Astro.props;
---
<div class="flex items-center gap-3 my-10" aria-hidden="true">
  <span class="h-px flex-1 bg-line"></span>
  {label && <span class="font-serif-sc text-cinnabar">✦</span>}
  {label && <span class="font-mono text-xs tracking-[0.3em] text-plum">{label}</span>}
  {label && <span class="font-serif-sc text-cinnabar">✦</span>}
  <span class="h-px flex-1 bg-line"></span>
</div>
```

- [ ] **Step 3: 写 `src/components/Stamp.astro`**（红印章）

```astro
---
interface Props { text: string; }
const { text } = Astro.props;
---
<span class="inline-flex items-center justify-center border-2 border-cinnabar text-cinnabar px-3 py-2 font-serif-sc font-bold text-sm rotate-[-3deg] rounded-sm" aria-label={text}>
  {text}
</span>
```

- [ ] **Step 4: 写 `src/components/VerticalText.astro`**

```astro
---
interface Props { text: string; }
const { text } = Astro.props;
---
<span class="vtext font-serif-sc text-plum/70 text-sm" aria-hidden="true">{text}</span>
```

- [ ] **Step 5: 接入各页**

- `src/pages/[lang]/index.astro`：Hero 区右侧放 `VerticalText text="万山青未阑"`（`class="absolute right-6 top-24 hidden lg:block"`，Hero 容器加 `relative`）；联系区后加 `Stamp text="万山"`。
- `src/pages/[lang]/blog/[slug].astro`：正文 `<div class="prose mt-10">` 改 `<div class="prose mt-10 drop-cap">`（正文第一段首字下沉）。
- `src/layouts/MagazineLayout.astro`：`<main>` 后、`<Footer>` 前加 `<Ornament label={lang === 'zh' ? '卷 终' : 'FIN'} />`。
- `src/pages/[lang]/projects/index.astro`：列表容器加 `halftone` 装饰（可选）。

- [ ] **Step 6: 验证**

Run: `pnpm astro build`
Expected: 成功。

Run: `pnpm astro dev`
Expected: 首页竖排装饰 + 印章、文章首字下沉、页脚题花、软件站半调网点背景，杂志感成型。

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "style: 杂志质感打磨（半调/题花/印章/竖排/首字下沉）"
```

---

### Task 10: krea2 MCP 配图生成

**Files:**
- Create: `public/images/avatar.png`, `public/images/projects/etb.png`, `public/images/covers/hello.png`, `public/favicon.png`（覆盖）
- Modify: `src/data/resume-zh.ts` / `resume-en.ts`（avatar 路径已指向 `/images/avatar.png`），`src/content/blog-zh/hello.md` / `blog-en/hello.md`（加 `cover`），`src/layouts/BaseLayout.astro`（favicon 改 `/favicon.png`）

**Interfaces:**
- Consumes: krea2 MCP（`krea2_t2i` / `krea2_i2i` / `krea2_edit`）
- Produces: 统一纸色套印风格配图，落位 `public/images/`

- [ ] **Step 1: 生成 Hero 头像/插画（`public/images/avatar.png`）**

用 `krea2_t2i`。提示词（英文具象，木刻版画风，排除政治）：
```
woodcut print portrait of a person silhouette, two-tone ink black and vermilion red on rice paper, 1970s chinese printmaking style, thick bold carving lines, halftone texture, paper grain, no text, no words, geometric composition
```
宽 720 高 1280（竖幅头像）。生成后检查：无政治符号、无文字。不合格用 `krea2_edit` 修正。

- [ ] **Step 2: 生成博客封面（`public/images/covers/hello.png`）**

`krea2_t2i`：
```
editorial magazine cover illustration, open book and pen on wooden desk, two-tone vermilion and ink black on cream rice paper, 1970s chinese print aesthetic, woodcut carving lines, paper grain texture, no text, no political content
```
宽 1280 高 720（横版）。

- [ ] **Step 3: 生成项目配图（`public/images/projects/etb.png`）**

`krea2_t2i`：
```
isometric illustration of a save-file backup tool, desktop computer and folder icons, two-tone ink black and vermilion on rice paper, 1970s chinese woodcut print style, bold lines, paper grain, no text, no political content
```
宽 1280 高 720。

- [ ] **Step 4: 生成 favicon（`public/favicon.png`）**

用现有 `public/圆角-image.png` 改小，或 `krea2_i2i` 参考生成 128x128 印章式图标。落位 `public/favicon.png`。

- [ ] **Step 5: 接线**

- `BaseLayout.astro`：`href="/image.png"` 改 `href="/favicon.png"`。
- `hello.md`（中英）：frontmatter 加 `cover: /images/covers/hello.png`。
- 确认 `resume-zh.ts` / `resume-en.ts` 的 `avatar: '/images/avatar.png'` 存在对应文件。

- [ ] **Step 6: 验证**

Run: `pnpm astro build`
Expected: 成功，静态资源复制进 `dist/`。

Run: `pnpm astro dev`
Expected: 头像、封面、项目图正常显示，风格统一。

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: krea2 生成杂志风配图（头像/封面/项目图/favicon）"
```

---

### Task 11: 部署配置 + 收尾

**Files:**
- Modify: `.github/workflows/deploy.yml`（去掉 GEMINI_API_KEY env），`vercel.json`（已在 Task 1 改 framework），`.gitignore`
- Delete: 残留无用的 `.wrangler/`（如存在且无用）

**Interfaces:**
- Consumes: Task 1-10 的全部构建产物
- Produces: 可直接部署的 GitHub Pages 流程

- [ ] **Step 1: 改 `.github/workflows/deploy.yml`**

移除 `env: GEMINI_API_KEY: ... NODE_ENV: production` 块（`pnpm run build` 前），保留其余步骤。build 步骤变为：

```yaml
      - name: Build
        run: pnpm run build
```

- [ ] **Step 2: 本地验证完整构建**

Run: `pnpm run build`
Expected: `astro check` 0 错误 → `astro build` 成功 → `pagefind --site dist` 生成 `dist/pagefind/`。`dist/zh/`、`dist/en/`、`dist/404.html`、`dist/pagefind/` 齐全。

- [ ] **Step 3: 预览最终产物**

Run: `pnpm astro preview`
Expected: `/` 跳 `/zh/`；三区域双语可访问；搜索可用；404 兜底。

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: 部署流程适配 Astro（去 Gemini env）"
```

---

### Self-Review 记录

- **Spec 覆盖**：主站简历（T4）、博客（T5/T6）、软件站（T7）、搜索（T8）、视觉（T9）、krea2 配图（T10）、部署（T11）、i18n + 根跳转（T2）、布局骨架（T3）、工具链（T1）。✓ 全部覆盖。
- **已知偏差**：
  1. 根路径语言检测：设计文档写 middleware，但 `output: 'static'` 下 middleware 不在请求期运行，改为 `index.astro` 客户端脚本跳转（体验一致）。已实现于 T2。
  2. Pagefind：不依赖存疑的 `@pagefind/astro` 包，改用官方 `pagefind` CLI（postbuild 步骤）。
  3. `Astro.currentLocale` 在 SSG index 页有已知 bug（astro#14228），全程改用 `Astro.params.lang`。
  4. 搜索按语言分区用客户端 URL 前缀过滤（`d.url.startsWith('/'+lang+'/')`）实现，见 T8。
- **占位符扫描**：无 TBD/TODO；resume 数据为可填充占位内容（用户后续填）。
- **类型一致性**：`Lang`、`useTranslations`、`getPosts`、`getPost`、`getProjects`、`otherLang`、`readingTime` 在定义与使用处签名一致。`langNames` 在 T2 定义，T5/T7 引用。
