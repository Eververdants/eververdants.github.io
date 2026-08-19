/* Journal content for the fourth screen (SELECTED BLOG — the journal).
   Site-level copy lives here: the cover masthead and the close line. Per-post
   metadata (slug, title, category, date, excerpt, tags) lives in each essay's
   frontmatter (src/blog/*.md) and parses in data/articles.ts — reading time
   is computed from the body, never written by hand.

   The order array is the curated deck, the featured essay first; it drives
   the reading deck, the /blog list, and prev/next inside an article.

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
  // Tags for the blog's filter system.
  tags: string[];
}

export interface Journal {
  // Cover fields drive the asymmetric editorial masthead.
  cover: {
    overline: string;
    issue: string;
    subtitle: string;
    caption: string;
  };
  // Featured essay leads the deck; the rest follow.
  order: string[];
  close: {
    year: number;
    line: string;
  };
}

export const journal: Journal = {
  cover: {
    overline: "SELECTED BLOG — VOL. VI",
    issue: "VI",
    subtitle: "Essays · Notes · Field Records",
    caption: "FIELD NOTES · MMXXIV — MMXXVI",
  },
  order: [
    "stone-and-egg-three-classics",
    "get-the-direction-right-first",
    "little-prince-and-the-baobabs",
  ],
  close: {
    year: 2026,
    line: "The mountains stay green, so do the words.",
  },
};

/* Chinese cover/close copy for the /blog sub-site's language toggle. The
   main site's cinematic BlogScene keeps the English journal above; the
   light blog sub-site reads whichever matches its active lang. */
export const journalZh: Journal = {
  cover: {
    overline: "精选博客 — 第六卷",
    issue: "VI",
    subtitle: "随笔 · 札记 · 田野手记",
    caption: "田野札记 · 二〇二四 — 二〇二六",
  },
  order: [
    "stone-and-egg-three-classics",
    "get-the-direction-right-first",
    "little-prince-and-the-baobabs",
  ],
  close: {
    year: 2026,
    line: "青山依旧在，文字也是。",
  },
};
