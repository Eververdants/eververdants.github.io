import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { parsePostMeta, stripMarkdown } from "./src/data/parsePost.ts";
import type { JournalPost } from "./src/data/journal.ts";
import { worksIndexPlugin } from "./src/photos/build/worksIndexPlugin.ts";

/* Each SPA entry (main /about /blog /projects /photos) fallbacks its own
   paths, but Vite's built-in dev/preview server only knows the root
   index.html — a deep link like /blog/<slug> or /projects/ with no static
   file (dev) would fall to the main site and normalize to the root. Rewrite
   those prefixes to their own entries, matching what the prerendered statics
   serve in production.

   The rewrite must not swallow a path that already has a file behind it:
   scripts/prerender.mjs writes dist/blog/<slug>/index.html and
   dist/blog/zh/<slug>/index.html, and rewriting unconditionally made preview
   serve the blog *index* for every article — so a deep link looked broken
   locally while production served it correctly. */
const SUB_SITES = [
  { prefix: "/about", entry: "/about/index.html" },
  { prefix: "/blog", entry: "/blog/index.html" },
  { prefix: "/projects", entry: "/projects/index.html" },
  { prefix: "/photos", entry: "/photos/index.html" },
];

/* The dist check belongs to preview only. The dev server serves from the
 * project root, not from dist/, so consulting dist there is actively wrong:
 * a stale dist/blog/<slug>/index.html makes the guard skip the rewrite, the
 * dev server then finds no such path in the root, and its SPA fallback hands
 * back the hub — so every article deep link "works" in preview and shows the
 * homepage in dev. */
function subSiteFallbackMiddleware(opts: { distDir?: string } = {}) {
  const hasStaticFile = (urlPath: string): boolean => {
    if (!opts.distDir) return false;
    const clean = decodeURIComponent(urlPath.split("?")[0]);
    return [
      join(opts.distDir, clean),
      join(opts.distDir, clean, "index.html"),
    ].some((p) => existsSync(p) && statSync(p).isFile());
  };
  return (req: { url?: string }, _res: unknown, next: () => void) => {
    const url = (req.url ?? "").split("?")[0];
    if (!hasStaticFile(url)) {
      for (const { prefix, entry } of SUB_SITES) {
        if (url === prefix || url.startsWith(prefix + "/")) {
          req.url = entry;
          break;
        }
      }
    }
    next();
  };
}

/* configureServer / configurePreviewServer are plugin hooks, not top-level
   config keys — hence the inline plugin. */
function subSiteEntryFallbackPlugin() {
  return {
    name: "subsite-entry-fallback",
    configureServer(server: {
      middlewares: { use: (m: unknown) => void };
    }) {
      server.middlewares.use(subSiteFallbackMiddleware());
    },
    configurePreviewServer(server: {
      middlewares: { use: (m: unknown) => void };
      config: { root: string };
    }) {
      server.middlewares.use(
        subSiteFallbackMiddleware({ distDir: join(server.config.root, "dist") }),
      );
    },
  };
}

/* ---- shared <head> block ------------------------------------------------
   Every entry needs the same four things: a pre-paint preference script (so
   nobody flashes the wrong theme or language), the self-hosted font preloads,
   the icon/manifest set, and the machine-readable links that generative
   engines follow. Duplicating them across five HTML files is how they drift,
   so they are injected from here instead — each file keeps only its own
   title / description / canonical / OG.

   The inline script mirrors src/shared/prefs.ts exactly (same keys, same
   precedence). Keep the two in step. */
const HEAD_INIT = `<script>(function(){try{var q=new URLSearchParams(location.search);var t=q.get("theme");t=(t==="dark"||t==="light")?t:localStorage.getItem("blog-theme");if(t===null)t="dark";document.documentElement.dataset.theme=t;var l=q.get("lang");l=(l==="en"||l==="zh")?l:localStorage.getItem("blog-lang");document.documentElement.lang=l==="zh"?"zh-Hans":"en";}catch(e){document.documentElement.dataset.theme="dark"}})();</script>`;

/* Pre-paint cover for the pixel navigation curtain: when the previous
   page covered itself before jumping here, this must be on the very
   first frame — a stylesheet-loaded cover would let the browser's
   default white flash through on slow loads. The cover is the same
   48px checker the canvas curtain ends on, so the handoff from the
   curtain to this static tile is seamless; the dark background
   inline is the anti-FOUC guard. */
const HEAD_COVER = `<style>html{background:#060608}html[data-theme="light"]{background:#f2f3ee}html.px-boot::after{content:"";position:fixed;inset:0;z-index:3000;pointer-events:none;background:url("data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20width=%2748%27%20height=%2748%27%20shape-rendering=%27crispEdges%27%3E%3Crect%20x=%270%27%20y=%270%27%20width=%2724%27%20height=%2724%27%20fill=%27%23060608%27/%3E%3Crect%20x=%2724%27%20y=%270%27%20width=%2724%27%20height=%2724%27%20fill=%27%230b0b10%27/%3E%3Crect%20x=%270%27%20y=%2724%27%20width=%2724%27%20height=%2724%27%20fill=%27%230e0e13%27/%3E%3Crect%20x=%2724%27%20y=%2724%27%20width=%2724%27%20height=%2724%27%20fill=%27%23090910%27/%3E%3C/svg%3E") 0 0/48px 48px}</style><script>(function(){try{var reduce=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;if(!reduce&&sessionStorage.getItem("px-nav")==="1"){document.documentElement.classList.add("px-boot")}}catch(e){}})();</script>`;

/* Prerender same-origin pages on hover intent (Chromium): by the time
   the click lands, the target page — including its framework render —
   is fully built in a hidden renderer, and activation is instant. This
   is what removes the cross-document load gap the transition curtain
   used to have to ride out. Firefox/Safari ignore this and fall back
   to the plain curtain path (fx.ts hover-prefetches the HTML there). */
const HEAD_SPECULATION = `<script type="speculationrules">{"prerender":[{"source":"document","where":{"href_matches":"/**"},"eagerness":"moderate"}],"prefetch":[{"source":"document","where":{"href_matches":"/**"},"eagerness":"moderate"}]}</script>`;

const SHARED_HEAD = [
  HEAD_INIT,
  HEAD_COVER,
  HEAD_SPECULATION,
  `<meta name="author" content="Eververdants" />`,
  `<meta name="theme-color" content="#060608" />`,
  `<meta name="theme-color" media="(prefers-color-scheme: light)" content="#f2f3ee" />`,
  `<link rel="icon" href="/favicon.svg" type="image/svg+xml" />`,
  `<link rel="icon" href="/favicon.png" type="image/png" />`,
  `<link rel="apple-touch-icon" href="/apple-touch-icon.png" />`,
  `<link rel="manifest" href="/site.webmanifest" />`,
  /* Self-hosted variable Inter covers every display and UI weight.
     crossorigin is required even same-origin because font fetches
     are always CORS-mode. */
  `<link rel="preload" href="/fonts/inter-latin.woff2" as="font" type="font/woff2" crossorigin />`,
  /* Machine-readable surface that generative engines follow. */
  `<link rel="alternate" type="application/rss+xml" title="Eververdants — Blog" href="https://eververdants.github.io/rss.xml" />`,
  `<link rel="alternate" type="application/json" title="Site & identity" href="https://eververdants.github.io/site.json" />`,
  `<link rel="alternate" type="application/json" title="Repositories" href="https://eververdants.github.io/projects.json" />`,
  `<link rel="alternate" type="application/json" title="Essay index" href="https://eververdants.github.io/posts.json" />`,
  `<link rel="alternate" type="application/json" title="Photo works" href="https://eververdants.github.io/works.json" />`,
  `<link rel="search" type="application/json" href="https://eververdants.github.io/search.json" />`,
  `<link rel="llms" href="https://eververdants.github.io/llms.txt" />`,
  `<link rel="profile" href="https://eververdants.github.io/llms-full.txt" />`,
  `<meta property="og:site_name" content="Eververdants" />`,
  `<meta property="og:image" content="https://eververdants.github.io/og-image.jpg" />`,
  `<meta property="og:image:width" content="1200" />`,
  `<meta property="og:image:height" content="630" />`,
  `<meta property="og:image:alt" content="Eververdants — 万山青未阑" />`,
  `<meta name="twitter:card" content="summary_large_image" />`,
  `<meta name="twitter:image" content="https://eververdants.github.io/og-image.jpg" />`,
].join("\n    ");

/* Vite's tag-descriptor API cannot inject a raw multi-line block, so the
   shared head is spliced in as a string. It lands after the viewport meta
   rather than right after <head>, so `charset` stays the first thing in the
   document as the HTML spec asks. */
function sharedHeadPlugin(): Plugin {
  return {
    name: "shared-head",
    transformIndexHtml: {
      order: "pre",
      handler(html: string) {
        const block = `\n    ${SHARED_HEAD}\n    `;
        const viewport = /<meta name="viewport"[^>]*>/;
        return viewport.test(html)
          ? html.replace(viewport, (m) => m + block)
          : html.replace(/<head>/, `<head>${block}`);
      },
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
    posts.zh[slug] = parsePostMeta(
      raw,
      "zh",
      en ? en.tags : null,
      en ? en.topics : null,
    );
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
  plugins: [
    react(),
    tailwindcss(),
    sharedHeadPlugin(),
    subSiteEntryFallbackPlugin(),
    blogIndexPlugin(),
    worksIndexPlugin(),
  ],
  build: {
    // Modern browsers only (es2022): smaller output, no legacy transforms.
    target: "es2022",
    rollupOptions: {
      // Five independent SPA entries: the navigation hub at /, the résumé at
      // /about/, the blog at /blog/, the works index at /projects/ and the
      // photo journal at /photos/. Each gets its own index.html + app bundle;
      // all deploy together inside one dist/ (GitHub Pages serves them as
      // subdirectories).
      input: {
        main: fileURLToPath(new URL("./index.html", import.meta.url)),
        about: fileURLToPath(new URL("./about/index.html", import.meta.url)),
        blog: fileURLToPath(new URL("./blog/index.html", import.meta.url)),
        projects: fileURLToPath(
          new URL("./projects/index.html", import.meta.url),
        ),
        photos: fileURLToPath(new URL("./photos/index.html", import.meta.url)),
      },
      output: {
        // Split React into a stable vendor chunk so content updates only
        // re-download the small app chunk (cache-friendly on mobile).
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (id.includes("react") || id.includes("scheduler"))
            return "vendor-react";
          return undefined;
        },
      },
    },
  },
  server: {
    // 允许通过 Tailscale Serve 远程访问（zennode.tail25e81f.ts.net）
    allowedHosts: ["zennode.tail25e81f.ts.net"],
  },
});
