/* Blog topics — 专题分类: editorial features that group essays across the
   ordinary columns into themed "issues". Every topic owns a hero band on
   the blog index (big name + slogan + a scrapbook-style collage of
   placeholder color blocks), and essays opt in via a `topics: [id]`
   frontmatter list (language-independent ids, same array in both the
   English and Chinese files — exactly like tags).

   Each topic carries:
   - symbol: the editorial glyph stamped across the band
   - name/slogan: localized hero copy (the slogan is the band's 标语)
   - color: a mid-tone accent used to derive the scrapbook color blocks
     and paper wash via color-mix, so both light and dark themes read it
   - photos: scrapbook captions for the placeholder blocks — "fig. 01 …
     night build" reads like a real journal page. A future `img` field can
     swap a block for a real photo; the lazy-load architecture (TopicArt)
     is already in place.

   Topics are curated here, ordered for the index. Empty topics (no essay
   claims them) simply don't render. Adding a topic = one entry here +
   tagging essays in frontmatter. */
export interface BlogTopic {
  // Stable id used by the UI, deep links (?topic=) and frontmatter —
  // independent of language.
  id: string;
  // Editorial glyph stamped on the hero band and chips.
  symbol: string;
  // Display names (the band's big title) per language.
  name: { en: string; zh: string };
  // One-line 标语 shown under the name on the topic hero band.
  slogan: { en: string; zh: string };
  // Mid-tone accent — color blocks and paper wash derive from it.
  color: string;
  // Scrapbook captions for the placeholder photos (fig. 01 / 02 / 03).
  photos: { en: string; zh: string }[];
}

export const topics: BlogTopic[] = [
  {
    id: "tech",
    symbol: "⌘",
    name: { en: "TECH", zh: "科技" },
    slogan: {
      en: "Build it, break it, understand it — curiosity is an engineering practice.",
      zh: "搭起来、拆开看、弄明白——好奇心是一门工程。",
    },
    color: "#3f6fd4",
    photos: [
      { en: "night build", zh: "深夜构建" },
      { en: "wires", zh: "接线" },
      { en: "first run", zh: "初次运行" },
    ],
  },
  {
    id: "literature",
    symbol: "❧",
    name: { en: "LITERATURE", zh: "文学" },
    slogan: {
      en: "Stories are the oldest technology we own — still running.",
      zh: "故事是我们拥有过的最古老的技术，至今仍在运行。",
    },
    color: "#c2572e",
    photos: [
      { en: "the rose", zh: "那朵玫瑰" },
      { en: "the fox", zh: "那只狐狸" },
      { en: "a chapter", zh: "某一章" },
    ],
  },
  {
    id: "history",
    symbol: "✦",
    name: { en: "HISTORY", zh: "历史现场" },
    slogan: {
      en: "Turn over the stones of the past — the answers keep their shape.",
      zh: "翻检旧日的石头，答案仍保有原来的形状。",
    },
    color: "#8a7d3f",
    photos: [
      { en: "old stone", zh: "旧日的石" },
      { en: "the archive", zh: "档案室" },
      { en: "shelf dust", zh: "架上浮尘" },
    ],
  },
  {
    id: "society",
    symbol: "◎",
    name: { en: "OBSERVE", zh: "社会观察" },
    slogan: {
      en: "Read the present like evidence — carefully, and with doubt.",
      zh: "把当下当作证物来读：谨慎，且保持怀疑。",
    },
    color: "#0e7a86",
    photos: [
      { en: "the crowd", zh: "人群" },
      { en: "the mirror", zh: "镜子" },
      { en: "the remarks", zh: "评论席" },
    ],
  },
];

export const topicById = new Map(topics.map((t) => [t.id, t]));
