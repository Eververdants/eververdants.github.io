/* 摄影集双语字典 —— 语言偏好由 shared/prefs 管理（共享 blog-lang）。 */
import type { Work } from "../data/types";
import type { CategoryDef } from "../data/categories";

/* The one language type for the whole site. */
import type { Lang } from "../../shared/prefs";
export type { Lang };

export interface Dict {
  brand: string; // gallery name: footer + "back to gallery"
  overline: (year: string) => string;
  title: string; // hero h1
  lede: string;
  metaWorks: string;
  metaCategories: string;
  metaImages: string;
  all: string;
  empty: string;
  mainSite: string; // back-to-main button
  selected: string; // "· SELECTED" badge
  watermark: string; // rights notice, carried from the old main site
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
  filterAria: string;
  metaAria: string;
  navAria: string;
  backAria: string;
}

export const ui: Record<Lang, Dict> = {
  en: {
    brand: "Photographs",
    overline: (year: string) => `A PHOTOGRAPHIC JOURNAL · EST. ${year}`,
    title: "Photographs",
    lede:
      "Photographs I keep. Mountains, buildings, and the inside of a room nobody is standing in.",
    metaWorks: "WORKS",
    metaCategories: "CATEGORIES",
    metaImages: "IMAGES",
    all: "All",
    empty: "Nothing filed here yet",
    mainSite: "Main site",
    selected: "SELECTED",
    watermark:
      "Every original carries a blind watermark — please do not repost or reuse.",
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
    filterAria: "Filter by category",
    metaAria: "Metadata",
    navAria: "Work navigation",
    backAria: "Back to gallery",
  },
  zh: {
    brand: "摄影集",
    overline: (year: string) => `影像手记 · 始于 ${year}`,
    title: "摄影集",
    lede: "我留下来的照片。山、房子，和没有人的房间。",
    metaWorks: "作品",
    metaCategories: "分类",
    metaImages: "影像",
    all: "全部",
    empty: "这里还没有归档作品",
    mainSite: "返回主站",
    selected: "精选",
    watermark: "每张原片都带有盲水印，请勿转载复用。",
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
    filterAria: "按分类筛选",
    metaAria: "拍摄信息",
    navAria: "作品导航",
    backAria: "返回画廊",
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
