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

import type { JournalPost } from "./journal";
import { journal, journalZh } from "./journal";
import { renderMarkdown } from "../lib/markdown";
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
  for (const line of lines.slice(1, end)) {
    const m = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!m) continue;
    const [, key, rest] = m;
    const val = rest.trim();
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

function parsePost(raw: string, lang: Lang): JournalPost {
  const { meta, body } = parseFrontmatter(raw);
  const str = (k: string) =>
    typeof meta[k] === "string" ? (meta[k] as string) : "";
  return {
    slug: str("slug"),
    title: str("title"),
    category: str("category"),
    date: str("date"),
    read: computeRead(body, lang),
    excerpt: str("excerpt"),
    tags: Array.isArray(meta.tags) ? (meta.tags as string[]) : [],
  };
}

/* Per-language parsed posts, keyed by slug. A post missing from one
   language simply won't appear there. */
const PARSED: Record<Lang, Map<string, JournalPost>> = {
  en: new Map(
    Object.keys(RAW.en).map((slug) => [slug, parsePost(RAW.en[slug], "en")]),
  ),
  zh: new Map(
    Object.keys(RAW.zh).map((slug) => [slug, parsePost(RAW.zh[slug], "zh")]),
  ),
};

export interface Article {
  post: JournalPost;
  html: string;
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
  return { post, html: renderMarkdown(parseFrontmatter(raw).body) };
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
    const meta = [post.excerpt, post.category, ...post.tags]
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
