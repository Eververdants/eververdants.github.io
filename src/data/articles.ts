/* Article content — journal prose lives in Markdown (src/blog/posts/**,
   each file fronted by a tiny YAML block (slug, title, category, date,
   excerpt, tags). On-demand loading keeps the network light as the archive
   grows:

   - METADATA (frontmatter: slug/title/date/excerpt/tags/section/sources)
     is parsed at BUILD TIME by vite.config.ts's blogIndexPlugin into the
     virtual:blog-index module. A few KB even at hundreds of posts, imported
     synchronously — the deck, prev/next, related reading and tag filters
     never fetch a body.
   - BODIES load lazily through import.meta.glob (one chunk per essay,
     fetched only when the reader opens it) — loadArticle().
   - FULL-TEXT SEARCH dynamically imports virtual:blog-search-index the
     first time the user actually types a query — searchPosts().

   Dropping a new *.md (and its *.zh.md translation) into any
   src/blog/posts/ subdirectory registers it automatically: the build-time
   plugin picks up its metadata, the glob picks up its body. No import
   lines to touch, ever. The curated order lives in journal.ts; anything
   not listed there still shows, appended newest-first by date. */

import type { JournalPost, Source } from "./journal";
import { journal, journalZh } from "./journal";
import { escapeHtml, renderMarkdown } from "../lib/markdown";
import { parseFrontmatter } from "./parsePost";
import { blogIndex } from "virtual:blog-index";
import type { Lang } from "../blog/prefs";

/* Every markdown file under src/blog/posts/ as a LAZY loader — Vite splits
   each into its own chunk. The build-time index maps every slug to its
   glob path, so a slug resolves without importing anything heavy. */
const mdLoaders = import.meta.glob("../blog/posts/**/*.md", {
  query: "?raw",
  import: "default",
}) as Record<string, () => Promise<string>>;

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
   touching journal.ts. Synchronous: reads only the build-time metadata
   index, never a body. Defaults to English so the main site's BlogScene
   call sites keep working unchanged. */
export function getDeck(lang: Lang = "en"): JournalPost[] {
  const order = (lang === "zh" ? journalZh : journal).order;
  const map = blogIndex.posts[lang];
  const seen = new Set(order);
  const curated = order
    .map((slug) => map[slug])
    .filter((p): p is JournalPost => p !== undefined);
  const rest = Object.values(map)
    .filter((p) => !seen.has(p.slug))
    .sort((a, b) => b.date.localeCompare(a.date));
  return [...curated, ...rest];
}

/* Load one essay body on demand — the reader opens /blog/<slug> and only
   then is the post's own chunk fetched. Returns null for a slug that does
   not exist in the language (never a network error). */
export async function loadArticle(
  slug: string,
  lang: Lang = "en",
): Promise<Article | null> {
  const post = blogIndex.posts[lang][slug];
  const loader = blogIndex.paths[lang][slug]
    ? mdLoaders[blogIndex.paths[lang][slug]]
    : undefined;
  if (!post || !loader) return null;
  const raw = await loader();
  const body = parseFrontmatter(raw).body;
  const html = post.sources.length
    ? renderMarkdown(body) + "\n" + renderSources(post.sources, lang)
    : renderMarkdown(body);
  return { post, html };
}

type SearchIndex = Record<"en" | "zh", Record<string, string>>;

/* The full-text body index — cached after its first dynamic import, so a
   session that searches several times only fetches it once. */
let searchIndexCache: SearchIndex | null = null;

/* Search the deck of the given language. Every whitespace-separated term
   must hit somewhere (AND); hits in the title rank first, then
   excerpt/tags, then the body, so a title match always outranks a
   body-only one. Date breaks ties newest first. An empty query returns []
   — callers gate on that themselves. The body index is fetched lazily on
   first search only. */
export async function searchPosts(
  query: string,
  lang: Lang = "en",
): Promise<JournalPost[]> {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];
  searchIndexCache ??= (await import("virtual:blog-search-index")).searchIndex;
  const bodyIndex = searchIndexCache[lang];
  const scored = getDeck(lang).map((post) => {
    const title = post.title.replace(/\n/g, " ").toLowerCase();
    // tagLabels (the localized names) join the searchable meta so a
    // Chinese query hits the Chinese tag names; tags themselves are the
    // stable ids and stay out of the prose index.
    const meta = [post.excerpt, post.category, ...post.tagLabels]
      .join(" ")
      .toLowerCase();
    const body = bodyIndex[post.slug] ?? "";
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
