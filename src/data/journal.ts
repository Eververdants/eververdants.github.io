/* Journal content for the fourth screen (SELECTED BLOG — the journal).
   Keep copy here, layout in BlogScene.tsx, so editing text never touches
   markup. \n in a title is an explicit editorial break for the giant
   display line.

   License: the articles below are CC BY-NC-SA 4.0 (see LICENSE-BLOG.md).
   Code around them is MIT (see LICENSE). */

export interface JournalPost {
  // \n = explicit editorial line break for the giant display line.
  title: string;
  category: string;
  date: string;
  read: string;
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
  featured: {
    overline: string;
    title: string;
    category: string;
    date: string;
    read: string;
    excerpt: string;
  };
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
    overline: "FEATURED ESSAY",
    title: "The Art\nof the Long\nScroll",
    category: "CRAFT",
    date: "2026",
    read: "6 MIN",
    excerpt:
      "This site unrolls like a handscroll — you scroll down, the story moves sideways. Every screen is a held breath, every panel a page turned sideways. To write about it here is to step inside the very scroll it describes.",
  },
  posts: [
    {
      title: "The Green\nMountains Never Fade",
      category: "ESSAY",
      date: "2026.05",
      read: "7 MIN",
      excerpt:
        "My name reads 'the green mountains never fade' — an unfinished line from a thousand-year-old poem. I keep it as a promise: whatever I build, I want the view to still hold.",
    },
    {
      title: "Light Is\nthe Only Subject",
      category: "PHOTO",
      date: "2025.11",
      read: "5 MIN",
      excerpt:
        "Every photograph I keep is really a note about light — its weight, its hour, its luck. The subject is only where the light agreed to land.",
    },
  ],
  close: {
    year: 2026,
    line: "The mountains stay green, so do the words.",
  },
};
