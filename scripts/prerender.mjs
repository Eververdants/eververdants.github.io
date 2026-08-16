// Prerender blog articles to static HTML so non-JS crawlers (and AI engines
// with weak JS execution) can read full article bodies.
//
// - renders each /blog/<slug> against the built blog sub-site in headless Chrome
// - extracts the rendered article block, builds a clean static shell with
//   per-page title/description/canonical/OG + BlogPosting JSON-LD
// - writes dist/blog/<slug>/index.html, dist/sitemap.xml, dist/robots.txt
//
// Safety: never fails the build. Missing Chrome / render failure => warn and
// skip (the SPA itself still works for real browsers).
import { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync, rmSync } from "node:fs";
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { join, resolve, extname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

const SITE = "https://eververdants.github.io";
const ROOT = fileURLToPath(new URL("..", import.meta.url));
const PORT = 4174;
const DEBUG_PORT = 9228;

const CHROME_CANDIDATES = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
];
const findChrome = () => CHROME_CANDIDATES.find((p) => existsSync(p)) || null;
const isWin = process.platform === "win32";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/* ---- parse essay frontmatter (src/blog/*.md) for post metadata ---- */
function parsePosts() {
  const dir = join(ROOT, "src/blog");
  const posts = new Map();
  for (const file of readdirSync(dir).filter((f) => f.endsWith(".md"))) {
    const src = readFileSync(join(dir, file), "utf8");
    const fm = src.match(/^---\n([\s\S]*?)\n---/);
    if (!fm) continue;
    const kv = (key) => {
      const line = fm[1].match(new RegExp(`^${key}:\\s*(.*)$`, "m"));
      if (!line) return "";
      let v = line[1].trim();
      if (v.startsWith('"')) {
        v = v.replace(/^"|"$/g, "").replace(/\\n/g, " ").replace(/\\"/g, '"');
      }
      return v;
    };
    const slug = kv("slug");
    if (!slug) continue;
    posts.set(slug, {
      slug,
      title: kv("title").replace(/\\n/g, " "),
      category: kv("category"),
      date: kv("date"),
      excerpt: kv("excerpt").replace(/\\n/g, " "),
    });
  }
  return [...posts.values()];
}

/* ---- tiny static server with SPA fallback (needed by headless Chrome) ---- */
function startServer() {
  const dist = resolve(ROOT, "dist");
  return createServer((req, res) => {
    let p = decodeURIComponent(req.url.split("?")[0]);
    if (p.endsWith("/")) p += "index.html";
    const file = resolve(dist, "." + p);
    if (!file.startsWith(dist)) {
      res.writeHead(403);
      res.end();
      return;
    }
    if (existsSync(file)) {
      const types = {
        ".html": "text/html", ".js": "text/javascript", ".css": "text/css",
        ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp",
        ".svg": "image/svg+xml", ".woff2": "font/woff2", ".json": "application/json",
        ".txt": "text/plain", ".xml": "application/xml", ".webmanifest": "application/manifest+json",
      };
      res.writeHead(200, { "Content-Type": types[extname(file)] || "application/octet-stream" });
      res.end(readFileSync(file));
    } else {
      // SPA fallback: /blog/* serves the blog sub-site's own entry, every
      // other path the main site.
      const isBlog = p.startsWith("/blog");
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(readFileSync(join(dist, isBlog ? "blog/index.html" : "index.html")));
    }
  }).listen(PORT, "127.0.0.1");
}

/* ---- render one article in headless Chrome, return the rendered [data-article] HTML ---- */
async function renderArticle(chromePath, slug) {
  const profile = join(tmpdir(), `hermes-prerender-${Date.now()}`);
  const chrome = spawn(
    chromePath,
    [
      "--headless=new",
      `--remote-debugging-port=${DEBUG_PORT}`,
      `--user-data-dir=${profile}`,
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-gpu",
      "--hide-scrollbars",
      "--mute-audio",
      ...(isWin ? [] : ["--no-sandbox", "--disable-dev-shm-usage"]),
      "about:blank",
    ],
    { stdio: "ignore" }
  );
  try {
    let target = null;
    for (let i = 0; i < 40; i++) {
      try {
        const r = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json`);
        const list = await r.json();
        target = list.find((t) => t.type === "page");
        if (target) break;
      } catch {}
      await sleep(250);
    }
    if (!target) throw new Error("CDP target not ready");
    const ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((res, rej) => {
      ws.onopen = res;
      ws.onerror = rej;
    });
    let id = 0;
    const pending = new Map();
    ws.onmessage = (ev) => {
      const m = JSON.parse(ev.data);
      if (m.id && pending.has(m.id)) {
        pending.get(m.id)(m);
        pending.delete(m.id);
      }
    };
    const send = (method, params = {}) =>
      new Promise((res) => {
        const i = ++id;
        pending.set(i, res);
        ws.send(JSON.stringify({ id: i, method, params }));
      });

    await send("Page.enable");
    await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/blog/${slug}/` });

    let html = "";
    for (let i = 0; i < 30; i++) {
      await sleep(500);
      const r = await send("Runtime.evaluate", {
        returnByValue: true,
        expression: `(() => { const el = document.querySelector('[data-article]'); return el ? el.outerHTML : ''; })()`,
      });
      if (r.result?.result?.value?.length > 300) {
        html = r.result.result.value;
        break;
      }
    }
    ws.close();
    if (!html) throw new Error("article did not render");
    return html;
  } finally {
    chrome.kill();
    try {
      rmSync(profile, { recursive: true, force: true });
    } catch {}
  }
}

/* ---- build a static shell for one article from the built blog entry's
   index.html template (the article reader lives on the blog sub-site) ---- */
function buildStatic(post, articleHtml) {
  const url = `${SITE}/blog/${post.slug}/`;
  const dateISO = post.date.replace(/\./g, "-"); // "2026.07.04" -> "2026-07-04" (ISO date)
  let tpl = readFileSync(join(ROOT, "dist/blog/index.html"), "utf8");
  tpl = tpl.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(post.title)} — Eververdants</title>`);
  tpl = tpl.replace(/<meta name="description"[^>]*\/>/, `<meta name="description" content="${esc(post.excerpt)}" />`);
  tpl = tpl.replace(/<link rel="canonical"[^>]*\/>/, `<link rel="canonical" href="${url}" />`);
  tpl = tpl.replace(/<meta property="og:type" content="website" \/>/, `<meta property="og:type" content="article" />`);
  tpl = tpl.replace(/<meta property="og:title"[^>]*\/>/, `<meta property="og:title" content="${esc(post.title)}" />`);
  tpl = tpl.replace(/<meta property="og:description"[^>]*\/>/, `<meta property="og:description" content="${esc(post.excerpt)}" />`);
  tpl = tpl.replace(/<meta property="og:url"[^>]*\/>/, `<meta property="og:url" content="${url}" />`);
  tpl = tpl.replace(
    /<script type="application\/ld\+json">[\s\S]*?<\/script>/,
    `<script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": ${JSON.stringify(post.title)},
      "description": ${JSON.stringify(post.excerpt)},
      "datePublished": ${JSON.stringify(dateISO)},
      "dateModified": ${JSON.stringify(dateISO)},
      "url": ${JSON.stringify(url)},
      "mainEntityOfPage": ${JSON.stringify(url)},
      "inLanguage": "en",
      "author": {
        "@type": "Person",
        "name": "Eververdants",
        "alternateName": "万山青未阑",
        "url": "${SITE}/",
        "sameAs": [
          "https://github.com/Eververdants",
          "https://space.bilibili.com/2019959464",
          "https://www.douyin.com/user/MS4wLjABAAAA8MEFE6VVh4_nWkTLPbueZYywgSyN19xhUFkmDF-nkhlnWytZWiBZ9YWM5s3RsprJ"
        ]
      },
      "publisher": { "@type": "Person", "name": "Eververdants", "url": "${SITE}/" }
    }
    </script>`
  );
  tpl = tpl.replace(/<div id="root"><\/div>/, `<div id="root">${articleHtml}</div>`);
  const out = join(ROOT, "dist/blog", post.slug, "index.html");
  mkdirSync(join(ROOT, "dist/blog", post.slug), { recursive: true });
  writeFileSync(out, tpl);
  return out;
}

function writeSitemap(posts) {
  const today = new Date().toISOString().slice(0, 10);
  const urls = [
    `<url><loc>${SITE}/</loc><priority>1.0</priority></url>`,
    `<url><loc>${SITE}/selected-blog/</loc><priority>0.8</priority></url>`,
    `<url><loc>${SITE}/blog/</loc><priority>0.7</priority></url>`,
    ...posts.map(
      (p) => `<url><loc>${SITE}/blog/${p.slug}/</loc><lastmod>${p.date.replace(/\./g, "-")}</lastmod><priority>0.9</priority></url>`
    ),
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((u) => `  ${u}`)
    .join("\n")}\n</urlset>\n`;
  writeFileSync(join(ROOT, "dist/sitemap.xml"), xml);
}

async function main() {
  const chromePath = findChrome();
  if (!chromePath) {
    console.log("prerender: Chrome not found, skipping static generation");
    return;
  }
  const posts = parsePosts();
  console.log(`prerender: ${posts.length} article(s) via ${chromePath}`);
  const server = startServer();
  await sleep(300);
  let ok = 0;
  for (const post of posts) {
    try {
      const html = await renderArticle(chromePath, post.slug);
      const out = buildStatic(post, html);
      ok++;
      console.log(`  ✓ ${post.slug} (${html.length} chars) -> ${out.replace(ROOT, ".")}`);
    } catch (e) {
      console.log(`  ✗ ${post.slug}: ${e.message}`);
    }
  }
  writeSitemap(posts);
  writeFileSync(
    join(ROOT, "dist/robots.txt"),
    "User-agent: *\nAllow: /\n\nSitemap: " + SITE + "/sitemap.xml\n"
  );
  server.close();
  console.log(`prerender done: ${ok}/${posts.length} articles + sitemap.xml + robots.txt`);
}

main().catch((e) => {
  console.error("prerender failed:", e.message);
  process.exit(0); // never break the deploy
});
