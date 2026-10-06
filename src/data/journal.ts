/* Journal content — the /blog/ sub-site's own copy, plus the curated order
   that decides which essay leads a deck. Per-post metadata (slug, title,
   category, date, excerpt, tags) lives in each essay's frontmatter
   (src/blog/posts/**) and parses in data/articles.ts — reading time is
   computed from the body, never written by hand.

   The order array is the curated deck, the featured essay first. It drives
   the reading deck, the order essays are grouped in on /blog/, and
   prev/next inside an article; the hub's front page deliberately reads the
   calendar instead (data/articles.getLatest).

   License: the articles are CC BY-NC-SA 4.0 (see LICENSE-BLOG.md).
   Code around them is MIT (see LICENSE). */

export interface JournalPost {
  // URL slug for /blog/<slug> article pages.
  slug: string;
  // \n = explicit editorial line break for the giant display line.
  title: string;
  category: string;
  date: string;
  // "N MIN" — computed from the body in articles.ts, never stored.
  read: string;
  // One-line teaser shown on the blog deck.
  excerpt: string;
  // Language-independent tag ids — English frontmatter tags are the
  // canonical ids; Chinese translations map their localized labels onto
  // them positionally (see articles.ts). Filtering, deep links and
  // related-reading all key on these, never on the UI language.
  tags: string[];
  // Localized display labels for the tags (same order as tags). English
  // files repeat the ids; Chinese files carry the translated names.
  tagLabels: string[];
  // Language-independent topic ids (科技/文学/历史现场/社会观察 …) — the
  // same array in both language files, resolved at parse time. Drives the
  // topic hero bands on the blog index and the ?topic= deep link.
  topics: string[];
  // Optional byline — defaults to the site name when absent.
  author?: string;
  // Language-independent section key, resolved at parse time from the
  // frontmatter category (localized per file). Grouping, recommendation and
  // glyph lookup read this — never the reader's current UI language.
  sectionId: string | null;
  // Cited original texts — rendered as the closing "references" list of the
  // article, each row a link straight to the full original source.
  sources: Source[];
}

/* One cited original text: the work's title, its provenance (author · date ·
   volume), and a URL that opens the full text. Written once per language in
   the post's frontmatter as "title|provenance|url" list items. */
export interface Source {
  title: string;
  source: string;
  url: string;
}

/* Blog sections — the editorial columns the content site is filed under.
   Defined in ./sections (independent of the journal cover copy) and
   re-exported here so existing importers keep working. */
export { sections, type BlogSection } from "./sections";

/* Blog topics — the cross-cutting 专题 features. Defined in ./topics and
   re-exported for the blog scenes. */
export { topics, topicById, type BlogTopic } from "./topics";

interface Journal {
  /* The one cover field still rendered: the line under the /blog/ masthead
     title. overline / issue / caption belonged to the old full-bleed
     magazine opening and went with it. */
  cover: {
    subtitle: string;
  };
  // Featured essay leads the deck; the rest follow.
  order: string[];
  // The year in /blog/'s footer line.
  close: {
    year: number;
  };
}

export const journal: Journal = {
  cover: {
    subtitle: "Essays · Notes · Field Records",
  },
  order: [
    "the-odyssey-defy-the-gods",
    "hair-color-as-evidence",
    "deepseek-harness-installation-guide",
    "stone-and-egg-three-classics",
    "get-the-direction-right-first",
    "little-prince-and-the-baobabs",
  ],
  close: {
    year: 2026,
  },
};

/* Chinese cover/close copy for the /blog sub-site's language toggle — the
   light blog sub-site reads whichever matches its active lang. */
export const journalZh: Journal = {
  cover: {
    subtitle: "随笔 · 札记 · 田野手记",
  },
  order: [
    "the-odyssey-defy-the-gods",
    "hair-color-as-evidence",
    "deepseek-harness-installation-guide",
    "stone-and-egg-three-classics",
    "get-the-direction-right-first",
    "little-prince-and-the-baobabs",
  ],
  close: {
    year: 2026,
  },
};
