/* Blog URL shapes, in one place.

   An article's language is part of its path, not a client-side secret:
   /blog/<slug>/ is the English essay and /blog/zh/<slug>/ is the Chinese
   one. That is what lets each carry its own canonical and an hreflang pair
   pointing at the other — with one URL for both, a crawler only ever indexed
   whichever language happened to be baked, and the other five essays'
   Chinese readers were invisible to search. */

import type { Lang } from "../shared/prefs";

export const BLOG = "/blog";

export type BlogView =
  | { kind: "index" }
  | { kind: "topic"; id: string }
  | { kind: "article"; slug: string; lang: Lang };

export const articlePath = (slug: string, lang: Lang) =>
  lang === "zh" ? `${BLOG}/zh/${slug}/` : `${BLOG}/${slug}/`;

export const topicPath = (id: string) =>
  `${BLOG}/topic/${encodeURIComponent(id)}`;

/* Path → view. "topic" and "zh" are reserved first segments; real slugs
   never collide with them. A bare /blog/zh/ with no slug is not a route. */
export function parseView(pathname: string): BlogView {
  const clean = pathname.replace(/\/+$/, "");
  if (clean === BLOG) return { kind: "index" };
  const rest = clean.startsWith(BLOG + "/") ? clean.slice(BLOG.length + 1) : "";
  const [head, tail] = rest.split("/");
  if (head === "topic")
    return tail ? { kind: "topic", id: decodeURIComponent(tail) } : { kind: "index" };
  if (head === "zh")
    return tail
      ? { kind: "article", slug: decodeURIComponent(tail), lang: "zh" }
      : { kind: "index" };
  return head
    ? { kind: "article", slug: decodeURIComponent(head), lang: "en" }
    : { kind: "index" };
}
