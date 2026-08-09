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
