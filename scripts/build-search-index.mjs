/* Emits dist/search.json — one flat list every entry's command palette can
 * search without importing three sub-sites' worth of data into each bundle.
 *
 * Deliberately independent of scripts/prerender.mjs: that one needs Chrome and
 * bails silently when it cannot find it, while the palette should still work.
 * Frontmatter is parsed here with the same CRLF-tolerant regexes the prerender
 * pass now uses.
 */
import {
  readFileSync,
  readdirSync,
  writeFileSync,
  mkdirSync,
  existsSync,
} from "node:fs";
import { join, basename } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const POSTS = join(ROOT, "src/blog/posts");
const WORKS = join(ROOT, "src/photos/works");
const REPOS = join(ROOT, "src/projects/data/repos.json");
const OUT = join(ROOT, "dist/search.json");

function frontmatter(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return {};
  const get = (key) => {
    const line = m[1].match(new RegExp(`^${key}:[ \t]*(.*)$`, "m"));
    if (!line) return "";
    let v = line[1].trim();
    if (v.startsWith('"')) v = v.slice(1, -1).replace(/\\n/g, " ");
    return v;
  };
  return get;
}

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(p));
    else if (entry.name.endsWith(".md")) out.push(p);
  }
  return out;
}

const items = [];

/* essays — English frontmatter carries the canonical slug; the .zh.md twin
   supplies the Chinese title so one row can serve both languages. */
const en = {};
const zh = {};
for (const file of walk(POSTS)) {
  const name = basename(file);
  const get = frontmatter(readFileSync(file, "utf8"));
  const slug = get("slug");
  if (!slug) continue;
  const row = {
    title: get("title"),
    category: get("category"),
    date: get("date"),
    excerpt: get("excerpt"),
  };
  if (name.endsWith(".zh.md")) zh[slug] = row;
  else en[slug] = row;
}
for (const [slug, p] of Object.entries(en)) {
  const z = zh[slug];
  items.push({
    type: "essay",
    url: `/blog/${slug}/`,
    urlZh: z ? `/blog/zh/${slug}/` : undefined,
    title: { en: p.title, zh: z?.title || p.title },
    label: { en: p.category, zh: z?.category || p.category },
    blurb: { en: p.excerpt, zh: z?.excerpt || p.excerpt },
    date: p.date,
  });
}

/* photo works */
try {
  for (const name of readdirSync(WORKS).filter((n) => n.endsWith(".md"))) {
    const get = frontmatter(readFileSync(join(WORKS, name), "utf8"));
    const slug = get("slug");
    if (!slug) continue;
    items.push({
      type: "photo",
      url: `/photos/work/${slug}/`,
      title: { en: get("title"), zh: get("titleZh") || get("title") },
      label: { en: get("category"), zh: get("category") },
      blurb: {
        en: get("description"),
        zh: get("descriptionZh") || get("description"),
      },
      date: get("date"),
    });
  }
} catch {
  /* no works yet */
}

/* repositories */
try {
  const { repos } = JSON.parse(readFileSync(REPOS, "utf8"));
  for (const r of repos ?? []) {
    if (r.archived) continue;
    items.push({
      type: "repo",
      url: r.url,
      external: true,
      title: { en: r.name, zh: r.name },
      label: {
        en: r.language || r.tag || "Repository",
        zh: r.language || r.tag || "仓库",
      },
      blurb: {
        en: r.blurbEn || r.description || "",
        zh: r.blurbZh || r.description || "",
      },
      stars: r.stars,
      date: (r.pushedAt || "").slice(0, 10),
    });
  }
} catch {
  /* repos.json not built yet */
}

/* the fixed pages, so the palette can navigate as well as search */
for (const page of [
  { url: "/", en: "Home", zh: "首页", blurbEn: "The navigation hub", blurbZh: "导航主页" },
  { url: "/about/", en: "About", zh: "关于", blurbEn: "Background, study, awards, contact", blurbZh: "背景、学业、获奖与联系方式" },
  { url: "/blog/", en: "Blog", zh: "博客", blurbEn: "All essays", blurbZh: "全部文章" },
  { url: "/projects/", en: "Works", zh: "作品", blurbEn: "The open-source index", blurbZh: "开源作品索引" },
  { url: "/photos/", en: "Photographs", zh: "摄影", blurbEn: "The photo journal", blurbZh: "相册" },
]) {
  items.push({
    type: "page",
    url: page.url,
    title: { en: page.en, zh: page.zh },
    blurb: { en: page.blurbEn, zh: page.blurbZh },
  });
}

const json = JSON.stringify(
  { generated: new Date().toISOString().slice(0, 10), items },
  null,
  1,
);

/* Written into public/ so `vite dev` serves it (the dev server reads public/,
   not dist/), and into dist/ as well when that directory exists so a build
   that already ran does not need re-running. Generated, so both are
   gitignored. */
mkdirSync(join(ROOT, "public"), { recursive: true });
writeFileSync(join(ROOT, "public/search.json"), json);
if (existsSync(join(ROOT, "dist"))) {
  writeFileSync(OUT, json);
}
console.log(`search.json: ${items.length} items`);
