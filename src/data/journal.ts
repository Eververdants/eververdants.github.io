/* Journal content for the fourth screen (SELECTED BLOG — the journal).
   Keep metadata here, layout in BlogScene.tsx / ArticleScene.tsx, so
   editing text never touches markup. \n in a title is an explicit editorial
   break for the giant display line. Article bodies live in src/blog/*.md
   (rendered by data/articles.ts).

   License: the articles are CC BY-NC-SA 4.0 (see LICENSE-BLOG.md).
   Code around them is MIT (see LICENSE). */

export interface JournalPost {
  // URL slug for /blog/<slug> article pages.
  slug: string;
  // \n = explicit editorial line break for the giant display line.
  title: string;
  category: string;
  date: string;
  read: string;
  // One-line teaser shown on the blog deck.
  excerpt: string;
}

export interface Journal {
  // Cover fields drive the asymmetric editorial masthead.
  cover: {
    overline: string;
    issue: string;
    subtitle: string;
    caption: string;
  };
  // Featured essay leads the deck; the rest are the following posts.
  featured: JournalPost;
  posts: JournalPost[];
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
  featured: {
    slug: "stone-and-egg-three-classics",
    title: "The Stone Is Hard,\nthe Egg Is Light",
    category: "ESSAY",
    date: "2026.08",
    read: "7 MIN",
    excerpt:
      "On Contradiction, On Protracted War, and A Single Spark Can Start a Prairie Fire — three essays, three periods, and the strategic framework they build for overturning an unequal contest.",
  },
  posts: [
    {
      slug: "get-the-direction-right-first",
      title: "Don't Rush\nto Work Hard",
      category: "ESSAY",
      date: "2026.08",
      read: "5 MIN",
      excerpt:
        "Two methodologies from Mao Zedong's 1941 essay 'Reform Our Study' — seek truth from facts, and aim the arrow at the target — and how they cut through modern confusion.",
    },
    {
      slug: "little-prince-and-the-baobabs",
      title: "The Grown-Ups\nLove Numbers\n— Notes on The Little Prince",
      category: "ESSAY",
      date: "2026.06",
      read: "6 MIN",
      excerpt:
        "Grown-ups love figures — but how do you measure a flower, a star, a sheep? From chapter four to seven, one line runs through: the sickness, the cause, the loneliness, and the keeping.",
    },
  ],
  close: {
    year: 2026,
    line: "The mountains stay green, so do the words.",
  },
};
