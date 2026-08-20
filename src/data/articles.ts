/* Article content — journal prose lives in Markdown (src/blog/posts/**, each
   file fronted by a tiny YAML block (slug, title, category, date, excerpt,
   tags). Metadata parses here so writing never touches markup or TypeScript;
   the essay body renders to HTML at build time, and reading time is computed
   from the body — never hand-written.

   Files are discovered with import.meta.glob — dropping a new *.md (and its
   *.zh.md translation) into any src/blog/posts/ subdirectory registers it
   automatically. No import lines to touch, ever. The curated order lives in
   journal.ts; anything not listed there still shows, appended newest-first
   by date. */

import type { JournalPost, Source } from "./journal";
import { journal, journalZh } from "./journal";
import { sections } from "./sections";
import { escapeHtml, renderMarkdown } from "../lib/markdown";
import type { Lang } from "../blog/prefs";

/* All markdown under src/blog/posts/, collected recursively at build time —
   posts may be filed into per-section subdirectories (essays/, notes/,
   field-records/, tutorials/, ...) or dropped flat; both work. Each file
   exists twice: the canonical English file (xxx.md) and a Chinese
   translation (xxx.zh.md). The blog's language toggle swaps the whole deck
   between the two; a post missing from one language simply won't appear
   there. The slug comes from the file name, so a post can live in any
   folder without changing its URL. */
const mdModules = import.meta.glob("../blog/posts/**/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const RAW: Record<Lang, Record<string, string>> = { en: {}, zh: {} };
for (const [path, content] of Object.entries(mdModules)) {
  const file = path.split("/").pop()!;
  const zh = file.endsWith(".zh.md");
  const slug = file.replace(/\.zh\.md$/, "").replace(/\.md$/, "");
  RAW[zh ? "zh" : "en"][slug] = content;
}

/* ---- frontmatter: a deliberate strict subset of YAML — only what the
   essays need (bare scalars, double-quoted strings with \n escapes, inline
   [a, b] arrays), so it parses in ~30 lines with no dependency. */

interface Frontmatter {
  [key: string]: string | string[];
}

function parseFrontmatter(raw: string): { meta: Frontmatter; body: string } {
  const lines = raw.replace(/\r\n/g, "\n").split("\n");
  if (!lines[0] || lines[0].trim() !== "---") return { meta: {}, body: raw };
  let end = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === "---") {
      end = i;
      break;
    }
  }
  if (end === -1) return { meta: {}, body: raw };
  const meta: Frontmatter = {};
  // A bare "key:" opens a list; the following "- item" lines collect into
  // it (used by sources). Any other key line closes the open list.
  let listKey: string | null = null;
  for (const line of lines.slice(1, end)) {
    const item = line.match(/^\s*-\s+(.*)$/);
    if (item && listKey) {
      const arr = meta[listKey];
      if (Array.isArray(arr)) arr.push(item[1].trim());
      continue;
    }
    listKey = null;
    const m = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!m) continue;
    const [, key, rest] = m;
    const val = rest.trim();
    if (val === "") {
      listKey = key;
      meta[key] = [];
      continue;
    }
    if (val.startsWith("[") && val.endsWith("]")) {
      meta[key] = val
        .slice(1, -1)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    } else if (val.startsWith('"')) {
      let out = "";
      for (let i = 1; i < val.length; i++) {
        const ch = val[i];
        if (ch === "\\" && i + 1 < val.length) {
          const n = val[i + 1];
          out += n === "n" ? "\n" : n === '"' ? '"' : n === "\\" ? "\\" : n;
          i++;
        } else if (ch === '"') {
          break;
        } else {
          out += ch;
        }
      }
      meta[key] = out;
    } else {
      meta[key] = val;
    }
  }
  return { meta, body: lines.slice(end + 1).join("\n") };
}

/* Reading time — CJK characters count as ~300/minute, English words as
   ~200/minute; rounded, with a 1-minute floor. Computed, never stored. The
   unit string follows the deck's language. */
function computeRead(body: string, lang: Lang): string {
  const cjk = (body.match(/[㐀-鿿]/g) || []).length;
  const eng = (body.match(/[A-Za-z0-9]+/g) || []).length;
  const minutes = Math.max(1, Math.round(cjk / 300 + eng / 200));
  return lang === "zh" ? `${minutes} 分钟` : `${minutes} MIN`;
}

/* Resolve a frontmatter category string to its stable section id. The
   category is the localized display name (ESSAYS in .md, 随笔 in .zh.md),
   so match against BOTH names here — at parse time, once, in a way that
   never depends on the reader's current UI language. */
function sectionIdOf(category: string): string | null {
  return (
    sections.find((s) => s.name.en === category || s.name.zh === category)
      ?.id ?? null
  );
}

/* Tags are language-independent: the ENGLISH frontmatter tag strings are
   the canonical ids (Literature, Mao Zedong, …). A Chinese translation
   carries the localized labels (文学, 毛泽东, …) and maps them onto the
   English ids positionally — translations keep the tag list in the same
   order. With a mismatch the label falls back to itself, so a stray tag
   never crashes. Display reads tagLabels, logic reads tags. */
function parseTags(
  meta: Frontmatter,
  lang: Lang,
  enTags: string[] | null,
): {
  tags: string[];
  tagLabels: string[];
} {
  const labels = Array.isArray(meta.tags) ? (meta.tags as string[]) : [];
  const tags =
    lang === "en" || !enTags
      ? labels
      : labels.map((_, i) => enTags[i] ?? labels[i]);
  return { tags, tagLabels: labels };
}

/* Parse one "title|provenance|url" list item into a Source. All three
   fields are required — a malformed row drops out silently rather than
   rendering a broken reference. */
function parseSource(item: string): Source | null {
  const [title, source, url] = item.split("|").map((s) => s.trim());
  if (!title || !source || !url) return null;
  return { title, source, url };
}

function parsePost(
  raw: string,
  lang: Lang,
  enTags: string[] | null = null,
): JournalPost {
  const { meta, body } = parseFrontmatter(raw);
  const str = (k: string) =>
    typeof meta[k] === "string" ? (meta[k] as string) : "";
  const category = str("category");
  const { tags, tagLabels } = parseTags(meta, lang, enTags);
  return {
    slug: str("slug"),
    title: str("title"),
    category,
    sectionId: sectionIdOf(category),
    date: str("date"),
    read: computeRead(body, lang),
    excerpt: str("excerpt"),
    tags,
    tagLabels,
    author: str("author") || undefined,
    sources: (Array.isArray(meta.sources) ? (meta.sources as string[]) : [])
      .map(parseSource)
      .filter((s): s is Source => s !== null),
  };
}

/* Per-language parsed posts, keyed by slug. A post missing from one
   language simply won't appear there. English parses first — its tag
   strings are the canonical ids the Chinese files map onto. */
const PARSED_EN = new Map(
  Object.keys(RAW.en).map((slug) => [slug, parsePost(RAW.en[slug], "en")]),
);
const PARSED_ZH = new Map(
  Object.keys(RAW.zh).map((slug) => {
    const en = PARSED_EN.get(slug);
    return [slug, parsePost(RAW.zh[slug], "zh", en ? en.tags : null)];
  }),
);
const PARSED: Record<Lang, Map<string, JournalPost>> = {
  en: PARSED_EN,
  zh: PARSED_ZH,
};

export interface Article {
  post: JournalPost;
  html: string;
}

/* The references block that closes an essay that cites original texts —
   an editorial source list appended after the rendered body. Each entry is
   one whole-row link that opens the full original in a new tab. The heading
   and the "read" affordance follow the deck's language; the entries
   themselves are already localized in the frontmatter. */
const REFS_TITLE: Record<Lang, string> = {
  en: "References & Original Texts",
  zh: "参考文献 · 原文出处",
};
const REFS_GO: Record<Lang, string> = {
  en: "Read Original",
  zh: "阅读原文",
};

function renderSources(sources: Source[], lang: Lang): string {
  const items = sources
    .map((s, i) => {
      const body =
        `<span class="ref-index">${String(i + 1).padStart(2, "0")}</span>` +
        `<span class="ref-body">` +
        `<span class="ref-title">${escapeHtml(s.title)}</span>` +
        `<span class="ref-source">${escapeHtml(s.source)}</span>` +
        `</span>` +
        `<span class="ref-go">${REFS_GO[lang]} ↗</span>`;
      return `<li><a href="${escapeHtml(s.url)}" target="_blank" rel="noreferrer">${body}</a></li>`;
    })
    .join("");
  return (
    `<section class="references">` +
    `<h2 id="references" class="references-heading">${REFS_TITLE[lang]}</h2>` +
    `<ol>${items}</ol>` +
    `</section>`
  );
}

/* The deck in editorial order — the language's order list drives it, the
   featured essay first, then any essay not listed (new drafts, no curation
   yet) appended newest-first by date so new content always surfaces without
   touching journal.ts. Posts with no frontmatter are skipped. Defaults to
   English so the main site's BlogScene call sites keep working unchanged. */
export function getDeck(lang: Lang = "en"): JournalPost[] {
  const order = (lang === "zh" ? journalZh : journal).order;
  const map = PARSED[lang];
  const seen = new Set(order);
  const curated = order
    .map((slug) => map.get(slug))
    .filter((p): p is JournalPost => p !== undefined);
  const rest = [...map.values()]
    .filter((p) => !seen.has(p.slug))
    .sort((a, b) => b.date.localeCompare(a.date));
  return [...curated, ...rest];
}

export function getArticle(slug: string, lang: Lang = "en"): Article | null {
  const post = PARSED[lang].get(slug);
  const raw = RAW[lang][slug];
  if (!post || !raw) return null;
  const body = parseFrontmatter(raw).body;
  const html = post.sources.length
    ? renderMarkdown(body) + "\n" + renderSources(post.sources, lang)
    : renderMarkdown(body);
  return { post, html };
}

/* Search — plain-text index over the deck plus each essay's body. The body
   markdown is stripped of syntax so a query can hit prose that never shows
   up in the list metadata. */
function stripMarkdown(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^>\s?/gm, "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[*_`~]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

/* Search the deck of the given language. Every whitespace-separated term
   must hit somewhere (AND); hits in the title rank first, then
   excerpt/tags, then the body, so a title match always outranks a
   body-only one. Date breaks ties newest first. An empty query returns []
   — callers gate on that themselves. */
export function searchPosts(query: string, lang: Lang = "en"): JournalPost[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];
  const scored = getDeck(lang).map((post) => {
    const title = post.title.replace(/\n/g, " ").toLowerCase();
    // tagLabels (the localized names) join the searchable meta so a
    // Chinese query hits the Chinese tag names; tags themselves are the
    // stable ids and stay out of the prose index.
    const meta = [post.excerpt, post.category, ...post.tagLabels]
      .join(" ")
      .toLowerCase();
    const body = RAW[lang][post.slug]
      ? stripMarkdown(RAW[lang][post.slug])
      : "";
    let titleHits = 0;
    let metaHits = 0;
    let bodyHits = 0;
    for (const t of terms) {
      if (title.includes(t)) titleHits++;
      else if (meta.includes(t)) metaHits++;
      else if (body.includes(t)) bodyHits++;
      else return null; // a term missed everywhere — post dropped
    }
    return { post, score: titleHits * 3 + metaHits * 2 + bodyHits };
  });
  return scored
    .filter((s): s is { post: JournalPost; score: number } => s !== null)
    .sort((a, b) => b.score - a.score || b.post.date.localeCompare(a.post.date))
    .map((s) => s.post);
}
