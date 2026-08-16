/* Article content — journal prose lives in Markdown (src/blog/*.md),
   bundled as raw strings and rendered to HTML at build time. Metadata
   (slug, title, category, dates) stays in journal.ts; the essay body lives
   here so writing never touches markup or TypeScript. */

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

const ALL: JournalPost[] = [journal.featured, ...journal.posts];

export interface Article {
  post: JournalPost;
  html: string;
}

export function getArticle(slug: string): Article | null {
  const post = ALL.find((p) => p.slug === slug);
  const raw = RAW[slug];
  if (!post || !raw) return null;
  return { post, html: renderMarkdown(raw) };
}

export function getDeck(): JournalPost[] {
  return ALL;
}
