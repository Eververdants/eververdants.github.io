import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { parsePostMeta, stripMarkdown } from "./src/data/parsePost.ts";
import type { JournalPost } from "./src/data/journal.ts";

/* The two entries each SPA-fallback their own paths, but Vite's built-in
   dev/preview server only knows the root index.html — a deep link like
   /blog/<slug> with no static file (dev) would fall to the main site and
   normalize to the root. Rewrite /blog/* to the blog entry, matching what
   the prerendered statics serve in production. */
function blogFallbackMiddleware() {
  return (req: { url?: string }, _res: unknown, next: () => void) => {
    const url = (req.url ?? "").split("?")[0];
    if (url === "/blog" || url.startsWith("/blog/")) {
      req.url = "/blog/index.html";
    }
    next();
  };
}

/* configureServer / configurePreviewServer are plugin hooks, not top-level
   config keys — hence the inline plugin. */
function blogEntryFallbackPlugin() {
  return {
    name: "blog-entry-fallback",
    configureServer(server: { middlewares: { use: (m: unknown) => void } }) {
      server.middlewares.use(blogFallbackMiddleware());
    },
    configurePreviewServer(server: {
      middlewares: { use: (m: unknown) => void };
    }) {
      server.middlewares.use(blogFallbackMiddleware());
    },
  };
}

/* ---- build-time blog index — the core of on-demand loading ----
   Scans every markdown file under src/blog/posts (recursively, English
   and *.zh.md translations) at build time and exposes two virtual
   modules:

   virtual:blog-index — frontmatter metadata for every post (title, date,
   excerpt, tags, section, sources, read time) plus the glob path of each
   body. Tiny; imported synchronously by data/articles.ts, so the deck,
   prev/next, related reading and tag filters never pull a body.

   virtual:blog-search-index — every post body stripped to plain text for
   full-text search. Only ever imported DYNAMICALLY (when the user types a
   query), so Vite emits it as its own chunk that stays off the wire until
   a search actually happens.

   Bodies themselves are NOT inlined anywhere: data/articles.ts loads each
   one via a lazy import.meta.glob, so every essay becomes its own chunk,
   fetched only when the reader opens it. */

const INDEX_ID = "virtual:blog-index";
const SEARCH_ID = "virtual:blog-search-index";
const POSTS_DIR = fileURLToPath(new URL("./src/blog/posts", import.meta.url));
const DATA_DIR = fileURLToPath(new URL("./src/data", import.meta.url));

function collectMarkdown(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...collectMarkdown(p));
    else if (entry.name.endsWith(".md")) out.push(p);
  }
  return out;
}

interface BlogIndex {
  posts: Record<"en" | "zh", Record<string, JournalPost>>;
  paths: Record<"en" | "zh", Record<string, string>>;
  search: Record<"en" | "zh", Record<string, string>>;
}

function buildBlogIndex(): BlogIndex {
  const posts: BlogIndex["posts"] = { en: {}, zh: {} };
  const paths: BlogIndex["paths"] = { en: {}, zh: {} };
  const search: BlogIndex["search"] = { en: {}, zh: {} };
  const enRaw: Record<string, string> = {};
  const zhRaw: Record<string, string> = {};

  for (const file of collectMarkdown(POSTS_DIR)) {
    const name = file.split(/[\\/]/).pop()!;
    const isZh = name.endsWith(".zh.md");
    const slug = name.replace(/\.zh\.md$/, "").replace(/\.md$/, "");
    const raw = readFileSync(file, "utf8");
    // The glob path as seen from src/data (where articles.ts lives), using
    // forward slashes — must match the import.meta.glob keys exactly.
    const rel = relative(DATA_DIR, file).replace(/\\/g, "/");
    if (isZh) {
      zhRaw[slug] = raw;
      paths.zh[slug] = rel;
      search.zh[slug] = stripMarkdown(raw);
    } else {
      enRaw[slug] = raw;
      paths.en[slug] = rel;
      search.en[slug] = stripMarkdown(raw);
    }
  }

  // English first — its tag strings are the canonical ids.
  for (const [slug, raw] of Object.entries(enRaw)) {
    posts.en[slug] = parsePostMeta(raw, "en");
  }
  for (const [slug, raw] of Object.entries(zhRaw)) {
    const en = posts.en[slug];
    posts.zh[slug] = parsePostMeta(raw, "zh", en ? en.tags : null);
  }
  return { posts, paths, search };
}

function blogIndexPlugin(): Plugin {
  return {
    name: "blog-index",
    resolveId(id) {
      if (id === INDEX_ID) return "\0" + INDEX_ID;
      if (id === SEARCH_ID) return "\0" + SEARCH_ID;
      return undefined;
    },
    load(id) {
      if (id === "\0" + INDEX_ID) {
        const { posts, paths } = buildBlogIndex();
        return `export const blogIndex = ${JSON.stringify({ posts, paths })};`;
      }
      if (id === "\0" + SEARCH_ID) {
        const { search } = buildBlogIndex();
        return `export const searchIndex = ${JSON.stringify(search)};`;
      }
      return undefined;
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  base: "/",
  plugins: [react(), tailwindcss(), blogEntryFallbackPlugin(), blogIndexPlugin()],
  build: {
    // Modern browsers only (es2022): smaller output, no legacy transforms.
    target: "es2022",
    rollupOptions: {
      // Two independent SPA entries: the main site at / and the light blog
      // sub-site at /blog/. Each gets its own index.html + app bundle; both
      // deploy together inside one dist/ (GitHub Pages serves /blog/ as a
      // subdirectory).
      input: {
        main: fileURLToPath(new URL("./index.html", import.meta.url)),
        blog: fileURLToPath(new URL("./blog/index.html", import.meta.url)),
      },
      output: {
        // Split heavy deps into stable vendor chunks so content updates
        // only re-download the small app chunk (cache-friendly on mobile).
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (id.includes("react") || id.includes("scheduler"))
            return "vendor-react";
          if (id.includes("gsap") || id.includes("lenis"))
            return "vendor-motion";
          return "vendor-misc";
        },
      },
    },
  },
  server: {
    // 允许通过 Tailscale Serve 远程访问（zennode.tail25e81f.ts.net）
    allowedHosts: ["zennode.tail25e81f.ts.net"],
  },
});
