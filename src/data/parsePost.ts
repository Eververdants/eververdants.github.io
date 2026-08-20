/* Pure post-parsing helpers, shared by TWO runtimes:
   - the browser bundle (articles.ts needs parseFrontmatter to split the
     lazy-loaded body off its frontmatter before rendering)
   - the build-time index generator (vite.config.ts's blogIndexPlugin scans
     the filesystem and builds the metadata index with parsePostMeta, and
     the search index with stripMarkdown)

   Nothing here may touch import.meta.glob, the DOM, or any browser API —
   every function is a pure string-in/string-out transform so both runtimes
   can import it without surprises. */

import type { Lang } from "../blog/prefs";
import type { JournalPost, Source } from "./journal";
import { sections } from "./sections";

/* ---- frontmatter: a deliberate strict subset of YAML — only what the
   essays need (bare scalars, double-quoted strings with \n escapes, inline
   [a, b] arrays), so it parses in ~30 lines with no dependency. */

interface Frontmatter {
  [key: string]: string | string[];
}

export function parseFrontmatter(raw: string): {
  meta: Frontmatter;
  body: string;
} {
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
export function computeRead(body: string, lang: Lang): string {
  const cjk = (body.match(/[㐀-鿿]/g) || []).length;
  const eng = (body.match(/[A-Za-z0-9]+/g) || []).length;
  const minutes = Math.max(1, Math.round(cjk / 300 + eng / 200));
  return lang === "zh" ? `${minutes} 分钟` : `${minutes} MIN`;
}

/* Resolve a frontmatter category string to its stable section id. The
   category is the localized display name (ESSAYS in .md, 随笔 in .zh.md),
   so match against BOTH names here — at parse time, once, in a way that
   never depends on the reader's current UI language. */
export function sectionIdOf(category: string): string | null {
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

/* Frontmatter → JournalPost (metadata only — never the body). English
   parses first; its tag strings are the canonical ids the Chinese files
   map onto. This runs at BUILD TIME (the index generator) so the shipped
   bundle carries plain data, not parsers. */
export function parsePostMeta(
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

/* Plain-text index of a post body — markdown syntax stripped so a search
   query can hit prose that never shows up in the list metadata. Only the
   build-time search index generator needs this. */
export function stripMarkdown(md: string): string {
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
