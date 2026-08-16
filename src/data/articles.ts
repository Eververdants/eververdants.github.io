/* Article content — journal prose lives in Markdown (src/blog/*.md), each
   file fronted by a tiny YAML block (slug, title, category, date, excerpt,
   tags). Metadata parses here so writing never touches markup or TypeScript;
   the essay body renders to HTML at build time, and reading time is computed
   from the body — never hand-written. */

import type { JournalPost } from "./journal";
import { journal } from "./journal";
import { renderMarkdown } from "../lib/markdown";
import directionRightFirst from "../blog/get-the-direction-right-first.md?raw";
import stoneAndEgg from "../blog/stone-and-egg-three-classics.md?raw";
import littlePrince from "../blog/little-prince-and-the-baobabs.md?raw";

const RAW: Record<string, string> = {
  "get-the-direction-right-first": directionRightFirst,
  "stone-and-egg-three-classics": stoneAndEgg,
  "little-prince-and-the-baobabs": littlePrince,
};

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
   ~200/minute; rounded, with a 1-minute floor. Computed, never stored. */
function computeRead(body: string): string {
  const cjk = (body.match(/[㐀-鿿]/g) || []).length;
  const eng = (body.match(/[A-Za-z0-9]+/g) || []).length;
  const minutes = Math.max(1, Math.round(cjk / 300 + eng / 200));
  return `${minutes} MIN`;
}

function parsePost(raw: string): JournalPost {
  const { meta, body } = parseFrontmatter(raw);
  const str = (k: string) => (typeof meta[k] === "string" ? (meta[k] as string) : "");
  return {
    slug: str("slug"),
    title: str("title"),
    category: str("category"),
    date: str("date"),
    read: computeRead(body),
    excerpt: str("excerpt"),
    tags: Array.isArray(meta.tags) ? (meta.tags as string[]) : [],
  };
}

const PARSED: Map<string, JournalPost> = new Map(
  Object.keys(RAW).map((slug) => [slug, parsePost(RAW[slug])])
);

export interface Article {
  post: JournalPost;
  html: string;
}

/* The deck in editorial order — journal.order lists the curated slugs, the
   featured essay first. Posts with no frontmatter are skipped. */
export function getDeck(): JournalPost[] {
  return journal.order
    .map((slug) => PARSED.get(slug))
    .filter((p): p is JournalPost => p !== undefined);
}

export function getArticle(slug: string): Article | null {
  const post = PARSED.get(slug);
  const raw = RAW[slug];
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

/* Search the full deck. Every whitespace-separated term must hit somewhere
   (AND); hits in the title rank first, then excerpt/tags, then the body, so
   a title match always outranks a body-only one. Date breaks ties newest
   first. An empty query returns [] — callers gate on that themselves. */
export function searchPosts(query: string): JournalPost[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];
  const scored = getDeck().map((post) => {
    const title = post.title.replace(/\n/g, " ").toLowerCase();
    const meta = [post.excerpt, post.category, ...post.tags].join(" ").toLowerCase();
    const body = RAW[post.slug] ? stripMarkdown(RAW[post.slug]) : "";
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
