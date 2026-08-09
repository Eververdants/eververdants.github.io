import type { Lang } from './detect';

export const ui = {
  zh: {
    'site.name': '万山青未阑',
    'hero.kicker': '作品集 · 简历',
    'nav.home': '首页',
    'nav.blog': '博客',
    'nav.projects': '软件站',
    'subsite.blog.rule': '题字：随笔与文章',
    'subsite.projects.rule': '题字：开源与作品',
    'lang.name': '中文',
    'footer.rights': '保留所有权利',
    'notfound.title': '页面未找到',
    'notfound.back': '回到首页',
    'search.placeholder': '搜索文章与项目…',
    'missing.lang': '本文暂无{lang}版本，以下为{shown}版本。',
    'post.reading': '约 {min} 分钟',
    'blog.all': '全部',
    'project.active': '活跃',
    'project.archived': '归档',
  },
  en: {
    'site.name': 'Eververdants',
    'hero.kicker': 'PORTFOLIO · Resume',
    'nav.home': 'Home',
    'nav.blog': 'Blog',
    'nav.projects': 'Software',
    'subsite.blog.rule': 'Essays & Notes',
    'subsite.projects.rule': 'Open Source & Works',
    'lang.name': 'English',
    'footer.rights': 'All rights reserved',
    'notfound.title': 'Page not found',
    'notfound.back': 'Back home',
    'search.placeholder': 'Search posts & projects…',
    'missing.lang': 'This page has no {lang} version yet; showing the {shown} version.',
    'post.reading': '~{min} min',
    'blog.all': 'All',
    'project.active': 'Active',
    'project.archived': 'Archived',
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
