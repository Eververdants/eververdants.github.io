/* 摄影集双语字典 —— 语言偏好与 blog/projects 打通（共享 blog-lang）。 */
import type { Work } from "../data/types";
import type { CategoryDef } from "../data/categories";

export type Lang = "en" | "zh";

export interface Dict {
  brand: string; // header mark
  overline: (year: string) => string;
  title: string; // hero h1
  lede: string;
  metaWorks: string;
  metaCategories: string;
  metaImages: string;
  all: string;
  empty: string;
  mainSite: string; // back-to-main button
  backGallery: string; // aria label for the brand link
  selected: string; // "· SELECTED" badge
  prev: string;
  next: string;
  first: string;
  latest: string;
  metaDate: string;
  metaLocation: string;
  metaCategory: string;
  metaCamera: string;
  metaLens: string;
  metaFocal: string;
  metaAperture: string;
  metaShutter: string;
  metaIso: string;
  themeDark: string;
  themeLight: string;
  filterAria: string;
}

export const ui: Record<Lang, Dict> = {
  en: {
    brand: "Photographs",
    overline: (year: string) => `A PHOTOGRAPHIC JOURNAL · EST. ${year}`,
    title: "Photographs",
    lede:
      "A small, slow collection — landscapes, architecture, and the rooms in between. Filed as it is made.",
    metaWorks: "WORKS",
    metaCategories: "CATEGORIES",
    metaImages: "IMAGES",
    all: "All",
    empty: "Nothing filed here yet",
    mainSite: "Main site",
    backGallery: "Photographs — back to gallery",
    selected: "SELECTED",
    prev: "← Previous",
    next: "Next →",
    first: "— First entry",
    latest: "Latest entry —",
    metaDate: "Date",
    metaLocation: "Location",
    metaCategory: "Category",
    metaCamera: "Camera",
    metaLens: "Lens",
    metaFocal: "Focal",
    metaAperture: "Aperture",
    metaShutter: "Shutter",
    metaIso: "ISO",
    themeDark: "Switch to dark",
    themeLight: "Switch to light",
    filterAria: "Filter by category",
  },
  zh: {
    brand: "摄影集",
    overline: (year: string) => `影像手记 · 始于 ${year}`,
    title: "摄影集",
    lede: "一座小而慢的影像档案 —— 山川、建筑，以及其间安静的角落。随拍随录。",
    metaWorks: "作品",
    metaCategories: "分类",
    metaImages: "影像",
    all: "全部",
    empty: "这里还没有归档作品",
    mainSite: "返回主站",
    backGallery: "摄影集 —— 返回画廊",
    selected: "精选",
    prev: "← 上一篇",
    next: "下一篇 →",
    first: "— 首篇",
    latest: "已是末篇 —",
    metaDate: "日期",
    metaLocation: "地点",
    metaCategory: "分类",
    metaCamera: "相机",
    metaLens: "镜头",
    metaFocal: "焦距",
    metaAperture: "光圈",
    metaShutter: "快门",
    metaIso: "感光度",
    themeDark: "切换到深色",
    themeLight: "切换到浅色",
    filterAria: "按分类筛选",
  },
};

/* ---- localized view helpers for a work ---- */
export const titleOf = (w: Work, lang: Lang): string =>
  lang === "zh" && w.titleZh ? w.titleZh : w.title;

export const subTitleOf = (w: Work, lang: Lang): string | undefined =>
  lang === "zh" ? (w.titleZh ? w.title : undefined) : w.titleZh;

export const descOf = (w: Work, lang: Lang): string =>
  lang === "zh" ? w.descriptionZh || w.description || "" : w.description || w.descriptionZh || "";

export const locOf = (w: Work, lang: Lang): string =>
  lang === "zh" ? w.locationZh || w.location || "" : w.location || w.locationZh || "";

export const catLabelOf = (cat: CategoryDef | undefined, id: string, lang: Lang): string => {
  if (!cat) return id;
  return lang === "zh" ? cat.labelZh : cat.label;
};

/** Earliest work year → hero "EST." stamp. Falls back to the current year. */
export const estYear = (works: Work[]): string => {
  const years = works
    .map((w) => (w.date || "").slice(0, 4))
    .filter((y) => /^\d{4}$/.test(y));
  return years.length ? years.sort()[0] : String(new Date().getFullYear());
};

export const countImages = (works: Work[]): number =>
  works.reduce((n, w) => n + 1 + (w.gallery?.length ?? 0), 0);
