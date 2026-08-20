/// <reference types="vite/client" />

/* Build-time virtual modules provided by vite.config.ts's blogIndexPlugin.

   virtual:blog-index — the light metadata index (frontmatter only, no
   bodies) plus the glob path for every post, so the lazy body loader can
   look a slug up without importing anything heavy. Imported synchronously:
   it is small (a few KB even at hundreds of posts).

   virtual:blog-search-index — every post body stripped to plain text for
   full-text search. Imported DYNAMICALLY (only when the user actually
   types a query), so its chunk ships separately and stays off the wire
   until a search happens. */
declare module "virtual:blog-index" {
  import type { JournalPost } from "./data/journal";

  export const blogIndex: {
    posts: Record<"en" | "zh", Record<string, JournalPost>>;
    paths: Record<"en" | "zh", Record<string, string>>;
  };
}

declare module "virtual:blog-search-index" {
  export const searchIndex: Record<"en" | "zh", Record<string, string>>;
}
