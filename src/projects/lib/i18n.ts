/* WORKS INDEX 双语字典 —— 语言偏好与博客打通（共享 blog-lang）。 */

export type Lang = "en" | "zh";

export interface Dict {
  overline: (year: number) => string;
  title: string;
  sub: string;
  metaRepos: string;
  metaStars: string;
  metaLangs: string;
  featuredOverline: string;
  featuredTitle: string;
  indexOverline: string;
  indexTitle: string;
  filed: string;
  searchPlaceholder: string;
  searchAria: string;
  all: string;
  sortUpdated: string;
  sortStars: string;
  sortName: string;
  sortAria: string;
  filterAria: string;
  emptyTitle: string;
  emptySub: string;
  clear: string;
  open: string;
  archived: string;
  noDesc: string;
  /** 索引区注脚：数据同步状态 */
  synced: string;
  live: string;
  syncFailed: string;
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
    sub: "Everything I have made public, in one place.",
    metaRepos: "REPOSITORIES",
    metaStars: "STARS",
    metaLangs: "LANGUAGES",
    featuredOverline: "Featured",
    featuredTitle: "The ones I keep up.",
    indexOverline: "Index",
    indexTitle: "All of them.",
    filed: "Updated",
    searchPlaceholder: "Search name · language · topic",
    searchAria: "Search repositories",
    all: "All",
    sortUpdated: "Updated",
    sortStars: "Stars",
    sortName: "Name",
    sortAria: "Sort repositories",
    filterAria: "Filter by language",
    emptyTitle: "Nothing matches.",
    emptySub: "No repository matches that search.",
    clear: "Clear filters",
    open: "Open",
    archived: "ARCHIVED",
    noDesc: "No description",
    synced: "Synced",
    live: "LIVE",
    syncFailed: "Sync failed — showing the archived copy.",
    backHome: "Back to top",
    mainSite: "Main site",
    github: "GitHub",
    themeDark: "Switch to dark",
    themeLight: "Switch to light",
  },
  zh: {
    overline: (year: number) => `开源项目索引 · ${year}`,
    title: "作品",
    sub: "我公开的一切，都列在这里。",
    metaRepos: "仓库",
    metaStars: "星标",
    metaLangs: "语言",
    featuredOverline: "精选",
    featuredTitle: "还在维护的几个",
    indexOverline: "全量",
    indexTitle: "所有仓库",
    filed: "更新于",
    searchPlaceholder: "搜索项目 / 语言 / 标签",
    searchAria: "搜索仓库",
    all: "全部",
    sortUpdated: "最近更新",
    sortStars: "星标",
    sortName: "名称",
    sortAria: "排序方式",
    filterAria: "按语言筛选",
    emptyTitle: "没有匹配项",
    emptySub: "没有匹配的项目 —— 换个关键词试试。",
    clear: "清空筛选",
    open: "打开",
    archived: "已归档",
    noDesc: "暂无描述",
    synced: "同步于",
    live: "实时",
    syncFailed: "同步失败 —— 显示存档数据。",
    backHome: "回到顶部",
    mainSite: "返回主站",
    github: "GitHub",
    themeDark: "切换到深色",
    themeLight: "切换到浅色",
  },
};

/* 仓库描述：英文模式优先人工英文精选，其次 GitHub 原文；中文模式优先
   人工中文精选，其次英文精选/原文。英文模式绝不返回中文内容（zh 兜底
   会违反“绝不返回与当前界面语言相反的内容”），三者皆空时返回空串，
   由调用方显示“暂无描述”占位。 */
export function repoDesc(
  lang: Lang,
  description: string,
  blurbEn?: string,
  blurbZh?: string,
): string {
  if (lang === "zh") return blurbZh || blurbEn || description || "";
  return blurbEn || description || "";
}
