// Prerender blog articles + the WORKS INDEX sub-site to static HTML so
// non-JS crawlers (and AI engines with weak JS execution) can read full
// content directly from the served document.
//
// - renders each /blog/<slug> against the built blog sub-site in headless Chrome
// - extracts the rendered article block, builds a clean static shell with
//   per-page title/description/canonical/OG + BlogPosting JSON-LD
// - renders /projects/ against the built WORKS INDEX entry and bakes the
//   fully-rendered DOM (all repos + CollectionPage JSON-LD) into
//   dist/projects/index.html
// - renders /photos/ (gallery + every /photos/work/<slug> detail, each with
//   its own Photograph JSON-LD) into dist/photos/…
// - renders / (the main landing site) and bakes the fully rendered DOM —
//   hero <h1>, resume, works, journal sections — into dist/index.html so
//   crawlers that skip JS see real homepage content instead of an empty
//   #root (Bing Site Scan flagged "H1 tag missing" for exactly this reason)
// - renders /blog/ (the index/hub that links every article) into
//   dist/blog/index.html so crawlers see the full post list without JS
// - writes dist/blog/<slug>/index.html, dist/sitemap.xml, dist/robots.txt
//
// Safety: never fails the build. Missing Chrome / render failure => warn and
// skip (the SPA itself still works for real browsers).
import {
  readFileSync,
  readdirSync,
  writeFileSync,
  mkdirSync,
  existsSync,
} from "node:fs";
import { rm } from "node:fs/promises";
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { join, resolve, extname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

const SITE = "https://eververdants.github.io";
const ROOT = fileURLToPath(new URL("..", import.meta.url));
const PORT = 4174;

const CHROME_CANDIDATES = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  /* Edge is Chromium too and honours the same headless/CDP flags — a
     fallback that makes the pass work on Windows boxes without Chrome. */
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
];
const findChrome = () => CHROME_CANDIDATES.find((p) => existsSync(p)) || null;
const isWin = process.platform === "win32";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const esc = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/* The motion engine (src/shared/fx.ts) runs inside the rendering browser
   before the content check passes, so every snapshot's <html> carries
   class="fx-on" — and the shared CSS holds every [data-fx] section at
   opacity 0 under that class until a live reveal scan adds .fx-in.
   Serving the snapshot as-is meant a real browser's initFx() saw fx-on
   already present and (via the old class-keyed guard) never ran the
   scan: the deployed pages kept their text invisible for good. Bake the
   document in its VISIBLE state instead — without fx-on the CSS hides
   nothing (the no-JS contract), and a live browser re-adds fx-on and
   plays the reveals normally. The px-* classes are stripped for the
   same reason: they key the boot cover, which must never survive into
   a served document. */
const MOTION_CLASSES = new Set(["fx-on", "px-boot", "px-arrived"]);
function sanitizeMotion(html) {
  return (
    html
      .replace(
        /(<html\b[^>]*?\bclass=")([^"]*)(")/i,
        (m, head, cls, tail) =>
          head +
          cls
            .split(/\s+/)
            .filter((c) => c && !MOTION_CLASSES.has(c))
            .join(" ") +
            tail,
      )
      /* Runtime-injected decoration must not be baked into the served
         HTML. #px-ring carries view-transition-name: px-ring, and a
         second copy of that name makes the browser SKIP every view
         transition (a duplicate name is invalid) — which is exactly the
         "instant swap" the ring is supposed to replace. #fx-cursor is
         the same story with a stuck square left parked mid-page. Both
         are empty divs, so a tag-level match is safe.
         #px-progress is reused by progress.ts on a real load, but it is
         this render's leftover state, not page content — and the
         snapshot can catch its fill mid-sweep. The code-copy buttons are
         worse: ArticleScene's mount effect injects fresh, listener-wired
         buttons into every <pre>, so a baked set would leave TWO buttons
         per code block on a deep link, one of them dead. Neither ships. */
      .replace(/<div id="px-ring"[^>]*><\/div>/g, "")
      .replace(/<div id="fx-cursor"[^>]*><\/div>/g, "")
      .replace(/<div id="px-progress"[^>]*>[\s\S]*?<\/div>/g, "")
      .replace(/<button[^>]*class="code-copy"[^>]*>[\s\S]*?<\/button>/g, "")
  );
}

/* ---- parse essay frontmatter (src/blog/posts, recursive) for metadata ----
   Posts may live in per-section subdirectories (essays/, notes/, ...) — the
   directory is walked recursively. Only the canonical English files (xxx.md)
   are collected; the Chinese translations (xxx.zh.md) share the same slugs
   and would double-generate. */
function collectPosts(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...collectPosts(p));
    else if (entry.name.endsWith(".md") && !entry.name.endsWith(".zh.md"))
      out.push(p);
  }
  return out;
}

function parsePosts() {
  const dir = join(ROOT, "src/blog/posts");
  const posts = new Map();
  for (const file of collectPosts(dir)) {
    /* A UTF-8 BOM (Windows editors add one) would make the ^--- anchor
       fail and silently drop the post from the sitemap and RSS. */
    const src = readFileSync(file, "utf8").replace(/^\uFEFF/, "");
    const fm = src.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!fm) continue;
    const kv = (key) => {
      const line = fm[1].match(new RegExp(`^${key}:[ \t]*(.*)$`, "m"));
      if (!line) return "";
      let v = line[1].trim();
      if (v.startsWith('"')) {
        v = v.replace(/^"|"$/g, "").replace(/\\n/g, " ").replace(/\\"/g, '"');
      }
      return v;
    };
    const slug = kv("slug");
    if (!slug) continue;
    /* topics: [society, history] — the ids the topic pages are keyed by, so
       each topic's sitemap lastmod can be derived from its own newest post. */
    const topics = kv("topics")
      .replace(/^\[|\]$/g, "")
      .split(",")
      .map((s) => s.trim().replace(/^["']|["']$/g, ""))
      .filter(Boolean);
    posts.set(slug, {
      slug,
      title: kv("title").replace(/\\n/g, " "),
      category: kv("category"),
      date: kv("date"),
      excerpt: kv("excerpt").replace(/\\n/g, " "),
      topics,
    });
  }
  return [...posts.values()];
}

/* ---- parse photos works frontmatter (src/photos/works) for slugs ---- */
function parseWorks() {
  const dir = join(ROOT, "src/photos/works");
  const out = [];
  let names = [];
  try {
    names = readdirSync(dir);
  } catch {
    return out;
  }
  for (const name of names) {
    if (!name.endsWith(".md")) continue;
    const src = readFileSync(join(dir, name), "utf8").replace(/^\uFEFF/, "");
    const fm = src.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!fm) continue;
    const kv = (key) => {
      const line = fm[1].match(new RegExp(`^${key}:[ \t]*(.*)$`, "m"));
      if (!line) return "";
      return line[1].trim().replace(/^"|"$/g, "");
    };
    const slug = kv("slug");
    if (!slug) continue;
    out.push({ slug, title: kv("title"), date: kv("date"), cover: kv("cover") });
  }
  out.sort((a, b) => a.slug.localeCompare(b.slug));
  return out;
}

/* ---- tiny static server with SPA fallback (needed by headless Chrome) ---- */
function startServer() {
  const dist = resolve(ROOT, "dist");
  return createServer((req, res) => {
    /* req.url can be absent on malformed requests, and decodeURIComponent
       throws URIError on a truncated %-sequence — either would be an
       uncaught exception inside the request handler and kill the whole
       prerender process. Answer 400 and keep serving. */
    let p;
    try {
      p = decodeURIComponent((req.url ?? "/").split("?")[0]);
    } catch {
      res.writeHead(400);
      res.end();
      return;
    }
    if (p.endsWith("/")) p += "index.html";
    const file = resolve(dist, "." + p);
    if (!file.startsWith(dist)) {
      res.writeHead(403);
      res.end();
      return;
    }
    if (existsSync(file)) {
      const types = {
        ".html": "text/html",
        ".js": "text/javascript",
        ".css": "text/css",
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".webp": "image/webp",
        ".svg": "image/svg+xml",
        ".woff2": "font/woff2",
        ".json": "application/json",
        ".txt": "text/plain",
        ".xml": "application/xml",
        ".webmanifest": "application/manifest+json",
      };
      res.writeHead(200, {
        "Content-Type": types[extname(file)] || "application/octet-stream",
      });
      res.end(readFileSync(file));
    } else {
      // SPA fallback: each sub-site serves its own entry, every other path
      // the main site. Guarded with existsSync so a sub-site whose static
      // entry is missing (e.g. first build) never crashes the server.
      const isBlog = p.startsWith("/blog");
      const isProjects = p.startsWith("/projects");
      const isPhotos = p.startsWith("/photos");
      const entry = isBlog
        ? "blog/index.html"
        : isProjects
          ? "projects/index.html"
          : isPhotos
            ? "photos/index.html"
            : "index.html";
      const entryPath = join(dist, entry);
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(
        readFileSync(existsSync(entryPath) ? entryPath : join(dist, "index.html")),
      );
    }
  }).listen(PORT, "127.0.0.1");
}

/* ---- render a URL in headless Chrome, evaluate `expr` on the page, return
   its value (string) ---- */
async function renderWithChrome(chromePath, url, expr, waitMs = 15000) {
  const profile = join(tmpdir(), `hermes-prerender-${Date.now()}`);
  /* Per-render debug port: chrome.kill() on Windows leaves renderer children
     that keep the old port bound for a while. A fixed port made the next
     render's Chrome fail to attach, hanging/crashing the whole prerender.
     Randomising avoids the collision entirely. */
  const debugPort = 9228 + Math.floor(Math.random() * 100);
  const chrome = spawn(
    chromePath,
    [
      "--headless=new",
      `--remote-debugging-port=${debugPort}`,
      `--user-data-dir=${profile}`,
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-gpu",
      "--hide-scrollbars",
      "--mute-audio",
      ...(isWin ? [] : ["--no-sandbox", "--disable-dev-shm-usage"]),
      "about:blank",
    ],
    { stdio: "ignore" },
  );
  /* chrome.kill() on an already-exited process (or a failed spawn) emits an
     'error' on the ChildProcess; with no listener that's an unhandled 'error'
     crash. Swallow it — the CDP wait loop below fails fast on its own. */
  chrome.on("error", () => {});
  try {
    let target = null;
    for (let i = 0; i < 40; i++) {
      try {
        const r = await fetch(`http://127.0.0.1:${debugPort}/json`, {
          signal: AbortSignal.timeout(2000),
        });
        const list = await r.json();
        target = list.find((t) => t.type === "page");
        if (target) break;
      } catch {}
      await sleep(250);
    }
    if (!target) throw new Error("CDP target not ready");
    const ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((res, rej) => {
      /* Bound the handshake: a zombie renderer that answers the /json
         probe but never completes the ws upgrade would otherwise hang the
         whole prerender forever. */
      const timer = setTimeout(() => {
        ws.close();
        rej(new Error("CDP websocket open timeout"));
      }, 5000);
      ws.onopen = () => {
        clearTimeout(timer);
        res();
      };
      ws.onerror = (e) => {
        clearTimeout(timer);
        rej(e);
      };
    });
    /* A dying renderer can drop the socket mid-render; without a handler
       Node raises an unhandled 'error' and kills the whole prerender with
       exit code 1. Swallow it — failPending() below rejects whatever is in
       flight and the per-page try/catch logs a ✗ instead. */
    ws.onerror = () => {};
    let id = 0;
    const pending = new Map();
    /* A crashed renderer must never leave a send() unresolved: a pending
       Runtime.evaluate with no timeout used to hang the wait loop forever
       (the 15s deadline never gets re-checked while awaiting), so chrome
       was never killed and the whole build sat until the CI job timeout. */
    const failPending = (err) => {
      for (const p of pending.values()) {
        clearTimeout(p.timer);
        p.rej(err);
      }
      pending.clear();
    };
    ws.onclose = () => failPending(new Error("CDP websocket closed"));
    ws.onmessage = (ev) => {
      let m;
      try {
        m = JSON.parse(ev.data);
      } catch {
        return;
      }
      if (m.id && pending.has(m.id)) {
        const p = pending.get(m.id);
        pending.delete(m.id);
        clearTimeout(p.timer);
        p.res(m);
      }
    };
    const send = (method, params = {}) =>
      new Promise((res, rej) => {
        const i = ++id;
        const timer = setTimeout(() => {
          pending.delete(i);
          rej(new Error(`CDP ${method} timed out`));
        }, 10000);
        const entry = {
          res,
          rej,
          timer,
        };
        pending.set(i, entry);
        try {
          ws.send(JSON.stringify({ id: i, method, params }));
        } catch (e) {
          clearTimeout(timer);
          pending.delete(i);
          rej(e);
        }
      });

    await send("Page.enable");
    /* Marked before any page script runs: shared/fx.ts checks this to
       skip the boot curtain (a canvas that exists for half a second
       must never be baked into the snapshot). navigator.webdriver is
       not reliably set on a raw-CDP headless Chrome. */
    await send("Page.addScriptToEvaluateOnNewDocument", {
      source: "window.__PRERENDER__ = 1;",
    });
    await send("Page.navigate", { url });

    let value = "";
    const deadline = Date.now() + waitMs;
    while (Date.now() < deadline) {
      await sleep(400);
      const r = await send("Runtime.evaluate", {
        returnByValue: true,
        expression: expr,
      });
      const v = r.result?.result?.value;
      if (typeof v === "string" && v.length > 300) {
        value = v;
        break;
      }
    }
    ws.close();
    if (!value) throw new Error("page did not render");
    return sanitizeMotion(value);
  } finally {
    chrome.kill();
    // Best-effort cleanup. rmSync on a Chrome user-data-dir can hard-crash
    // node on some Windows setups (native crash, uncatchable) and abort the
    // whole prerender. Use async rm fire-and-forget so a cleanup failure can
    // never break the build; leftover profiles stay in %TEMP% only.
    rm(profile, { recursive: true, force: true }).catch(() => {});
  }
}

/* ---- render one article in one language, capture the whole document ----
   The reader owns its own head now (applyHead in ArticleScene writes title,
   description, canonical, og:/twitter:, hreflang pair and BlogPosting), so
   serialising the live document is both simpler and more correct than the
   regex pass this replaces — which could not update twitter:* and stamped
   every article, English included, with inLanguage: zh-Hans. */
async function renderArticle(chromePath, slug, lang) {
  const path =
    lang === "zh" ? `/blog/zh/${slug}/` : `/blog/${slug}/`;
  return renderWithChrome(
    chromePath,
    `http://127.0.0.1:${PORT}${path}`,
    `(() => { const a = document.querySelector('[data-article] .article-content'); return a && a.textContent.trim().length > 200 ? document.documentElement.outerHTML : ''; })()`,
  );
}

/* ---- render the WORKS INDEX sub-site, capture the whole document ---- */
async function renderProjects(chromePath) {
  const html = await renderWithChrome(
    chromePath,
    `http://127.0.0.1:${PORT}/projects/`,
    `(() => { const h = document.querySelector('.hero__title'); return h && h.textContent.trim() ? document.documentElement.outerHTML : ''; })()`,
  );
  const out = join(ROOT, "dist/projects/index.html");
  writeFileSync(out, html);
  return out;
}

/* ---- render the /about/ résumé page, capture the whole document ----
   The content that used to live only in scroll scenes is a real page now;
   bake it so the education, award and contact facts are readable without
   executing JavaScript. */
async function renderAbout(chromePath) {
  const html = await renderWithChrome(
    chromePath,
    `http://127.0.0.1:${PORT}/about/`,
    `(() => { const h = document.querySelector('.about__title'); return h && h.textContent.trim() ? document.documentElement.outerHTML : ''; })()`,
  );
  const out = join(ROOT, "dist/about/index.html");
  writeFileSync(out, html);
  return out;
}

/* ---- render the photos sub-site gallery, capture the whole document ----
   The gallery (works list, category filter, hero, CollectionPage + ItemList
   JSON-LD injected by the app) is baked into dist/photos/index.html so
   crawlers / AI engines that skip JS can read every work. */
async function renderPhotos(chromePath) {
  const html = await renderWithChrome(
    chromePath,
    `http://127.0.0.1:${PORT}/photos/`,
    `(() => { const el = document.querySelector('.gallery-grid, .gallery-empty'); return el ? document.documentElement.outerHTML : ''; })()`,
  );
  const out = join(ROOT, "dist/photos/index.html");
  writeFileSync(out, html);
  return out;
}

/* ---- render one work's detail page to its own static file ----
   Path-routed /photos/work/<slug>/ renders the full Photograph JSON-LD and
   metadata in-app (src/photos/lib/seo.ts); capture the whole document so
   each detail page is independently crawlable, like the blog's articles. */
async function renderWork(chromePath, slug) {
  return renderWithChrome(
    chromePath,
    `http://127.0.0.1:${PORT}/photos/work/${slug}/`,
    `(() => { const a = document.querySelector('article[data-work-slug]'); return a ? document.documentElement.outerHTML : ''; })()`,
  );
}

/* ---- parse topic ids (src/data/topics.ts) so each 专题 page can be baked ----
   /blog/topic/<id> is a SPA route with no static file behind it, so a direct
   visit — a share, a palette result, an article's topic chips — used to fall
   through to GitHub Pages' 404.html, whose guard boots the hub for
   extension-less paths: the reader landed on the homepage at a topic URL. */
function parseTopicIds() {
  try {
    const src = readFileSync(join(ROOT, "src/data/topics.ts"), "utf8");
    return [...src.matchAll(/\bid:\s*"([^"]+)"/g)].map((m) => m[1]);
  } catch {
    return [];
  }
}

/* ---- render one topic page, capture the whole document ----
   The path check matters: an unknown id normalizes back to the index and
   replaceStates the URL to /blog before the capture loop looks — without it
   the index's DOM would be baked under the topic's URL. */
async function renderTopic(chromePath, id) {
  return renderWithChrome(
    chromePath,
    `http://127.0.0.1:${PORT}/blog/topic/${id}/`,
    `(() => { const onTopic = location.pathname.indexOf('/blog/topic/') === 0; const h = document.querySelector('.blog-index__title'); return onTopic && h && h.textContent.trim() ? document.documentElement.outerHTML : ''; })()`,
  );
}

/* ---- render the main landing site, capture the whole document ----
   The built index.html body is an empty #root, so a crawler without JS sees
   no headings or copy at all on / (Bing Site Scan: "H1 tag missing"). Bake
   the rendered DOM — hero <h1> included — into dist/index.html; createRoot
   re-renders over it for real browsers, same as /projects/ + /photos/. */
async function renderHome(chromePath) {
  const html = await renderWithChrome(
    chromePath,
    `http://127.0.0.1:${PORT}/`,
    `(() => { const m = document.querySelector('main'); const h = m && m.querySelector('h1'); return m && h && h.textContent.trim() && m.innerHTML.length > 2000 ? document.documentElement.outerHTML : ''; })()`,
  );
  const out = join(ROOT, "dist/index.html");
  writeFileSync(out, html);
  return out;
}

/* ---- render the blog index, capture the whole document ----
   /blog/ is the hub that links every article; without it a crawler that
   skips JS finds no internal links to the posts at all. Bake it exactly
   like /projects/ + /photos/. */
async function renderBlogIndex(chromePath) {
  const html = await renderWithChrome(
    chromePath,
    `http://127.0.0.1:${PORT}/blog/`,
    `(() => { const links = document.querySelectorAll('a[href^="/blog/"]').length; const h = document.querySelector('h1'); return h && h.textContent.trim() && links >= 2 ? document.documentElement.outerHTML : ''; })()`,
  );
  const out = join(ROOT, "dist/blog/index.html");
  writeFileSync(out, html);
  return out;
}

function writeSitemap(posts, works, topicIds = []) {
  /* lastmod is only a useful hint if engines can trust it — Google's docs
     say they use it when it is "consistently and verifiably accurate", and
     Bing behaves the same. Stamping every URL with the build date made the
     value change on every deploy (the nightly repos-refresh cron redeploys
     daily with unchanged content), teaching both engines the date means
     nothing. Derive each entry's date from the content it actually serves:
       - articles & works: their own frontmatter date (posts YYYY.MM.DD,
         works may be month-precision YYYY-MM — both normalize to the W3C
         truncated forms the sitemap schema allows)
       - /blog/ and /photos/: the newest date their lists can show
       - / and /about/: the newest content date anywhere on the site —
         stable across no-change deploys; /about/ carries no dated content
         of its own, so the site-wide max is the closest honest proxy
       - /projects/: the build date, honestly — repos.json is refreshed by
         the daily cron, so this page genuinely changes every day
       - topics: the newest post filed under that topic
     /resume, /selected and /selected-blog used to be scroll positions inside
     the old single-page deck. They are now redirect stubs (see
     scripts/postbuild.mjs) and deliberately stay out of the sitemap — a
     sitemap should list destinations, not hops. */
  const today = new Date().toISOString().slice(0, 10);
  const norm = (raw, fallback = "") => {
    const d = String(raw || "").replace(/\./g, "-").trim();
    return /^\d{4}-\d{2}(-\d{2})?$/.test(d) ? d : fallback;
  };
  const maxDate = (arr) => arr.reduce((a, b) => (b > a ? b : a), "");
  const latestPost = maxDate(posts.map((p) => norm(p.date)).filter(Boolean)) || today;
  const latestWork = maxDate(works.map((w) => norm(w.date)).filter(Boolean)) || today;
  const contentDate = maxDate([latestPost, latestWork].filter(Boolean)) || today;
  const topicDate = (id) =>
    maxDate(
      posts
        .filter((p) => (p.topics ?? []).includes(id))
        .map((p) => norm(p.date))
        .filter(Boolean),
    ) || contentDate;
  const alt = (en, zh) =>
    [
      `<xhtml:link rel="alternate" hreflang="en" href="${en}"/>`,
      `<xhtml:link rel="alternate" hreflang="zh-Hans" href="${zh}"/>`,
      `<xhtml:link rel="alternate" hreflang="x-default" href="${en}"/>`,
    ].join("");
  const urls = [
    `<url><loc>${SITE}/</loc><lastmod>${contentDate}</lastmod><priority>1.0</priority></url>`,
    `<url><loc>${SITE}/about/</loc><lastmod>${contentDate}</lastmod><priority>0.8</priority></url>`,
    `<url><loc>${SITE}/projects/</loc><lastmod>${today}</lastmod><priority>0.8</priority></url>`,
    `<url><loc>${SITE}/photos/</loc><lastmod>${latestWork}</lastmod><priority>0.8</priority></url>`,
    `<url><loc>${SITE}/blog/</loc><lastmod>${latestPost}</lastmod><priority>0.7</priority></url>`,
    ...topicIds.map(
      (id) =>
        `<url><loc>${SITE}/blog/topic/${id}/</loc><lastmod>${topicDate(id)}</lastmod><priority>0.6</priority></url>`,
    ),
    ...posts.flatMap((p) => {
      const lastmod = norm(p.date, today);
      const en = `${SITE}/blog/${p.slug}/`;
      const zh = `${SITE}/blog/zh/${p.slug}/`;
      return [
        `<url><loc>${en}</loc><lastmod>${lastmod}</lastmod>${alt(en, zh)}<priority>0.9</priority></url>`,
        `<url><loc>${zh}</loc><lastmod>${lastmod}</lastmod>${alt(en, zh)}<priority>0.8</priority></url>`,
      ];
    }),
    ...works.map((w) => {
      /* Covers are stored root-relative without a leading slash; strip one
         anyway so a future frontmatter edit can't mint a `//` URL. */
      const image = w.cover
        ? `<image:image><image:loc>${SITE}/${String(w.cover).replace(/^\//, "")}</image:loc><image:title>${esc(w.title)}</image:title></image:image>`
        : "";
      return `<url><loc>${SITE}/photos/work/${w.slug}/</loc><lastmod>${norm(w.date, today)}</lastmod>${image}<priority>0.7</priority></url>`;
    }),
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urls
    .map((u) => `  ${u}`)
    .join("\n")}\n</urlset>\n`;
  writeFileSync(join(ROOT, "dist/sitemap.xml"), xml);
}

function writeRobots() {
  const lines = [
    "User-agent: *",
    "Allow: /",
    "",
    "# Generative-engine / AI crawlers — explicitly welcomed for GEO",
    "User-agent: GPTBot",
    "Allow: /",
    "",
    "User-agent: ClaudeBot",
    "Allow: /",
    "",
    "User-agent: Google-Extended",
    "Allow: /",
    "",
    "User-agent: PerplexityBot",
    "Allow: /",
    "",
    "User-agent: Bytespider",
    "Allow: /",
    "",
    "User-agent: CCBot",
    "Allow: /",
    "",
    "Sitemap: " + SITE + "/sitemap.xml",
    "",
  ];
  writeFileSync(join(ROOT, "dist/robots.txt"), lines.join("\n"));
}

function writeRss(posts) {
  const buildDate = new Date().toUTCString();
  /* Newest first: parsePosts() returns readdir order, which left the newest
     essay fifth in the feed — and a reader that shows the head of a feed
     never saw it. Dates are YYYY.MM.DD, so lexical is chronological. */
  const items = [...posts]
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((p) => {
      const d = new Date(p.date.replace(/\./g, "-") + "T00:00:00Z");
      const pub = isNaN(d.getTime()) ? buildDate : d.toUTCString();
      const link = `${SITE}/blog/${p.slug}/`;
      return `    <item>
      <title>${esc(p.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${pub}</pubDate>
      <category>${esc(p.category)}</category>
      <description>${esc(p.excerpt)}</description>
    </item>`;
    })
    .join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Eververdants — Blog</title>
    <link>${SITE}/blog/</link>
    <description>Essays, notes and field records by Eververdants.</description>
    <language>en</language>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <atom:link href="${SITE}/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;
  writeFileSync(join(ROOT, "dist/rss.xml"), xml);
}

async function main() {
  const posts = parsePosts();
  const works = parseWorks();
  const topicIds = parseTopicIds();
  const chromePath = findChrome();
  let ok = 0;
  let projectsOk = false;
  let aboutOk = false;
  let photosOk = false;
  let photosWorksOk = 0;
  let homeOk = false;
  let blogIndexOk = false;
  let topicsOk = 0;
  if (chromePath) {
    const server = startServer();
    await sleep(300);
    console.log(`prerender: ${posts.length} article(s) + ${works.length} photo work(s) via ${chromePath}`);
    for (const post of posts) {
      for (const lang of ["en", "zh"]) {
        const dir =
          lang === "zh"
            ? join(ROOT, "dist/blog/zh", post.slug)
            : join(ROOT, "dist/blog", post.slug);
        try {
          const html = await renderArticle(chromePath, post.slug, lang);
          mkdirSync(dir, { recursive: true });
          const out = join(dir, "index.html");
          writeFileSync(out, html);
          ok++;
          const shown = lang === "zh" ? `/blog/zh/${post.slug}/` : `/blog/${post.slug}/`;
          console.log(
            `  ✓ ${shown} (${html.length} chars) -> ${out.replace(ROOT, ".")}`,
          );
        } catch (e) {
          console.log(`  ✗ ${post.slug} (${lang}): ${e.message}`);
        }
      }
    }
    try {
      const out = await renderProjects(chromePath);
      projectsOk = true;
      console.log(`  ✓ /projects/ prerendered -> ${out.replace(ROOT, ".")}`);
    } catch (e) {
      console.log(`  ✗ /projects/: ${e.message}`);
    }
    try {
      const out = await renderAbout(chromePath);
      aboutOk = true;
      console.log(`  ✓ /about/ prerendered -> ${out.replace(ROOT, ".")}`);
    } catch (e) {
      console.log(`  ✗ /about/: ${e.message}`);
    }
    try {
      const out = await renderPhotos(chromePath);
      photosOk = true;
      console.log(`  ✓ /photos/ prerendered -> ${out.replace(ROOT, ".")}`);
    } catch (e) {
      console.log(`  ✗ /photos/: ${e.message}`);
    }
    for (const w of works) {
      try {
        const html = await renderWork(chromePath, w.slug);
        const dir = join(ROOT, "dist/photos/work", w.slug);
        mkdirSync(dir, { recursive: true });
        const out = join(dir, "index.html");
        writeFileSync(out, html);
        photosWorksOk++;
        console.log(
          `  ✓ photos/work/${w.slug} (${html.length} chars) -> ${out.replace(ROOT, ".")}`,
        );
      } catch (e) {
        console.log(`  ✗ photos/work/${w.slug}: ${e.message}`);
      }
    }
    try {
      const out = await renderHome(chromePath);
      homeOk = true;
      console.log(`  ✓ / prerendered -> ${out.replace(ROOT, ".")}`);
    } catch (e) {
      console.log(`  ✗ /: ${e.message}`);
    }
    /* Last, so it never competes with the article pages for the same file.
       (The old buildStatic() read this as a template; nothing does now.) */
    try {
      const out = await renderBlogIndex(chromePath);
      blogIndexOk = true;
      console.log(`  ✓ /blog/ prerendered -> ${out.replace(ROOT, ".")}`);
    } catch (e) {
      console.log(`  ✗ /blog/: ${e.message}`);
    }
    for (const id of topicIds) {
      try {
        const html = await renderTopic(chromePath, id);
        const dir = join(ROOT, "dist/blog/topic", id);
        mkdirSync(dir, { recursive: true });
        const out = join(dir, "index.html");
        writeFileSync(out, html);
        topicsOk++;
        console.log(
          `  ✓ blog/topic/${id} (${html.length} chars) -> ${out.replace(ROOT, ".")}`,
        );
      } catch (e) {
        console.log(`  ✗ blog/topic/${id}: ${e.message}`);
      }
    }
    server.close();
  } else {
    console.log(
      "prerender: Chrome not found, skipping article static generation",
    );
  }
  // Always emit sitemap + robots + rss so production deploys (CI runners have
  // no Chrome) still get them even when article prerendering is skipped.
  writeSitemap(posts, works, topicIds);
  writeRobots();
  writeRss(posts);
  console.log(
    `prerender done: ${ok}/${posts.length * 2} article pages (en+zh)${topicsOk ? ` + ${topicsOk}/${topicIds.length} topics` : ""}${blogIndexOk ? " + /blog/" : ""}${homeOk ? " + /" : ""}${aboutOk ? " + /about/" : ""}${projectsOk ? " + /projects/" : ""}${photosOk ? " + /photos/" : ""}${photosWorksOk ? ` + ${photosWorksOk}/${works.length} photo works` : ""} + sitemap.xml + robots.txt + rss.xml`,
  );
}

main().catch((e) => {
  console.error("prerender failed:", e.message);
  process.exit(0); // never break the deploy
});
