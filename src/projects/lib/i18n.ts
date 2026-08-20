/* WORKS INDEX 双语字典 —— 语言偏好与博客打通（共享 blog-lang）。 */

export type Lang = "en" | "zh";

export interface Dict {
  overline: (year: number) => string;
  title: string;
  sub: string;
  sync: string;
  metaRepos: string;
  metaStars: string;
  metaLangs: string;
  featuredOverline: string;
  featuredTitle: string;
  hoverHint: string;
  indexOverline: string;
  indexTitle: string;
  filed: string;
  searchPlaceholder: string;
  all: string;
  sortUpdated: string;
  sortStars: string;
  sortName: string;
  emptyTitle: string;
  emptySub: string;
  clear: string;
  open: string;
  archived: string;
  noDesc: string;
  footerNote: string;
  syncLabel: string;
  backHome: string;
  mainSite: string;
  github: string;
  themeDark: string;
  themeLight: string;
}

export const ui: Record<Lang, Dict> = {
  en: {
    overline: (year: number) => `OPEN-SOURCE INDEX · EST. ${year}`,
    title: "Works",
    sub: "Every public project, filed in one ledger.",
    sync: "SYNCED",
    metaRepos: "REPOSITORIES",
    metaStars: "STARS",
    metaLangs: "LANGUAGES",
    featuredOverline: "[ FEATURED ]",
    featuredTitle: "Flagship works.",
    hoverHint: "Hover to reveal",
    indexOverline: "[ INDEX ]",
    indexTitle: "The full ledger.",
    filed: "FILED",
    searchPlaceholder: "Search name · language · topic",
    all: "All",
    sortUpdated: "Updated",
    sortStars: "Stars",
    sortName: "Name",
    emptyTitle: "Nothing filed here.",
    emptySub: "No project matches — try another query.",
    clear: "Clear filters",
    open: "Open",
    archived: "ARCHIVED",
    noDesc: "No description",
    footerNote: "Data pulled via gh repo list — synced from the GitHub API",
    syncLabel: "LAST SYNC",
    backHome: "Back to top",
    mainSite: "Main site",
    github: "GitHub",
    themeDark: "Switch to dark",
    themeLight: "Switch to light",
  },
  zh: {
    overline: (year: number) => `开源项目索引 · ${year}`,
    title: "作品",
    sub: "全部开源项目，一册收录。",
    sync: "已同步",
    metaRepos: "仓库",
    metaStars: "星标",
    metaLangs: "语言",
    featuredOverline: "[ 精选 ]",
    featuredTitle: "代表作品",
    hoverHint: "悬停显色",
    indexOverline: "[ 全量台账 ]",
    indexTitle: "全部台账",
    filed: "已收录",
    searchPlaceholder: "搜索项目 / 语言 / 标签",
    all: "全部",
    sortUpdated: "最近更新",
    sortStars: "星标",
    sortName: "名称",
    emptyTitle: "暂无匹配",
    emptySub: "没有匹配的项目 —— 换个关键词试试。",
    clear: "清空筛选",
    open: "打开",
    archived: "已归档",
    noDesc: "暂无描述",
    footerNote: "数据经 gh repo list 拉取 —— 由 GitHub API 自动同步",
    syncLabel: "最近同步",
    backHome: "回到顶部",
    mainSite: "返回主站",
    github: "GitHub",
    themeDark: "切换到深色",
    themeLight: "切换到浅色",
  },
};

/* 仓库描述：英文模式优先人工英文精选，其次 GitHub 原文；中文模式优先
   人工中文精选，其次英文精选/原文。两种语言都回退到另一语言，绝不返回
   与当前界面语言相反的内容。 */
export function repoDesc(
  lang: Lang,
  description: string,
  blurbEn?: string,
  blurbZh?: string,
): string {
  if (lang === "zh") return blurbZh || blurbEn || description;
  return blurbEn || description || blurbZh;
}
