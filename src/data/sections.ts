/* Blog sections — the editorial columns the whole content site is filed
   under (essays, notes, field records, tutorials, tech notes, ...). The
   journal's cover subtitle ("Essays · Notes · Field Records") names the
   first three; every essay's frontmatter category (localized per language)
   keys into this directory, so a section is a stable, curated home while
   the category string stays author-facing and translated.

   Adding a column = one entry here + tagging essays in frontmatter with the
   matching name. Empty sections simply don't render anywhere (switcher,
   groups) until a post claims them. Order in this array is the order the
   columns appear on the index. */
export interface BlogSection {
  // Stable id used by the UI (active state) — independent of language.
  id: string;
  // Editorial glyph marking the column (switcher + section head).
  symbol: string;
  // Display names — must match frontmatter category per language.
  name: { en: string; zh: string };
  // One-line column manifesto shown under the section head.
  tagline: { en: string; zh: string };
}

export const sections: BlogSection[] = [
  {
    id: "essays",
    symbol: "❧",
    name: { en: "ESSAYS", zh: "随笔" },
    tagline: {
      en: "Essays on life, letters, and the things that stay with you.",
      zh: "关于生活、文学与历久弥新之物的随笔。",
    },
  },
  {
    id: "notes",
    symbol: "✎",
    name: { en: "NOTES", zh: "札记" },
    tagline: {
      en: "Reading notes — ways of thinking worth stealing.",
      zh: "读书札记——值得偷走的思想方法。",
    },
  },
  {
    id: "field-records",
    symbol: "✦",
    name: { en: "FIELD RECORDS", zh: "田野手记" },
    tagline: {
      en: "Revisiting historical scenes, turning over the evidence.",
      zh: "重返历史现场，翻检旧日证据。",
    },
  },
  {
    id: "tutorials",
    symbol: "◈",
    name: { en: "TUTORIALS", zh: "教程" },
    tagline: {
      en: "Step-by-step guides — build it, break it, understand it.",
      zh: "一步一步的教程——动手做、拆开看、弄明白。",
    },
  },
  {
    id: "tech-notes",
    symbol: "⌘",
    name: { en: "TECH NOTES", zh: "技术" },
    tagline: {
      en: "From the workshop: code, tools, and the systems behind them.",
      zh: "工坊里的技术札记：代码、工具与其背后的系统。",
    },
  },
];
