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
const SITE = "https://eververdants.github.io";
const POSTS = join(ROOT, "src/blog/posts");
const WORKS = join(ROOT, "src/photos/works");
const REPOS = join(ROOT, "src/projects/data/repos.json");

function frontmatter(raw) {
  /* BOM-tolerant: a leading U+FEFF would break the ^--- anchor. */
  const m = raw.replace(/^\uFEFF/, "").match(/^---\r?\n([\s\S]*?)\r?\n---/);
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
const body = {};
for (const file of walk(POSTS)) {
  const name = basename(file);
  let raw;
  try {
    raw = readFileSync(file, "utf8");
  } catch (e) {
    /* One unreadable file must not kill dev (this runs before `vite`). */
    console.warn(`[build-geo] skip unreadable post ${name}: ${e.message}`);
    continue;
  }
  const get = frontmatter(raw);
  const slug = get("slug");
  if (!slug) continue;
  const isZh = name.endsWith(".zh.md");
  const row = {
    title: get("title"),
    category: get("category"),
    date: get("date"),
    excerpt: get("excerpt"),
    tags: get("tags"),
  };
  // Everything after the closing --- is the essay itself, kept verbatim so
  // llms-full.txt can hand a model the whole text without crawling.
  body[slug] = { ...(body[slug] || {}), [isZh ? "zh" : "en"]: raw.slice(raw.indexOf("---", 3) + 3).replace(/^[\r\n]+/, "").trim() };
  if (isZh) zh[slug] = row;
  else en[slug] = row;
}
const postRows = [];
for (const [slug, p] of Object.entries(en)) {
  const z = zh[slug];
  postRows.push({
    slug,
    url: `/blog/${slug}/`,
    urlZh: z ? `/blog/zh/${slug}/` : undefined,
    title: { en: p.title, zh: z?.title || p.title },
    category: { en: p.category, zh: z?.category || p.category },
    date: p.date,
    excerpt: { en: p.excerpt, zh: z?.excerpt || p.excerpt },
    tags: p.tags,
    wordCount: {
      en: (body[slug]?.en || "").split(/\s+/).filter(Boolean).length,
      zh: (body[slug]?.zh || "").replace(/\s/g, "").length,
    },
  });
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
const workRows = [];
try {
  for (const name of readdirSync(WORKS).filter((n) => n.endsWith(".md"))) {
    const get = frontmatter(readFileSync(join(WORKS, name), "utf8"));
    const slug = get("slug");
    if (!slug) continue;
    workRows.push({
      slug,
      url: `/photos/work/${slug}/`,
      title: { en: get("title"), zh: get("titleZh") || get("title") },
      category: get("category"),
      date: get("date"),
      location: { en: get("location"), zh: get("locationZh") || get("location") },
      description: {
        en: get("description"),
        zh: get("descriptionZh") || get("description"),
      },
      image: `/${get("cover")}`,
      exif: {
        camera: get("camera"),
        lens: get("lens"),
        focal: get("focal"),
        aperture: get("aperture"),
        shutter: get("shutter"),
        iso: get("iso"),
      },
    });
    const w = workRows[workRows.length - 1];
    items.push({
      type: "photo",
      url: w.url,
      title: w.title,
      label: w.category ? { en: w.category, zh: w.category } : undefined,
      blurb: w.description,
      date: w.date,
    });
  }
} catch {
  /* no works yet */
}

/* repositories */
let repoCount = 0;
try {
  const { repos } = JSON.parse(readFileSync(REPOS, "utf8"));
  for (const r of repos ?? []) {
    if (r.archived) continue;
    repoCount++;
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

/* ---- write the machine-readable surface -------------------------------
   Everything below exists so a generative engine can answer a question about
   this site without rendering JavaScript or guessing at markup: a flat search
   index for the palette, per-content-type JSON feeds, and llms-full.txt with
   the essays inline. All are generated, hence gitignored. */
const generated = new Date().toISOString().slice(0, 10);

function emit(file, text) {
  mkdirSync(join(ROOT, "public"), { recursive: true });
  writeFileSync(join(ROOT, "public", file), text);
  if (existsSync(join(ROOT, "dist"))) writeFileSync(join(ROOT, "dist", file), text);
  return `${file}: ${(text.length / 1024).toFixed(1)} kB`;
}

const writes = [];

writes.push(
  emit(
    "search.json",
    JSON.stringify({ generated, items }, null, 1),
  ),
);

writes.push(
  emit(
    "posts.json",
    JSON.stringify(
      {
        generated,
        site: SITE,
        feed: `${SITE}/rss.xml`,
        count: postRows.length,
        posts: postRows,
      },
      null,
      1,
    ),
  ),
);

writes.push(
  emit(
    "works.json",
    JSON.stringify(
      {
        generated,
        site: SITE,
        count: workRows.length,
        notice: {
          en: "Every original carries a blind watermark — please do not repost or reuse.",
          zh: "每张原片都带有盲水印，请勿转载复用。",
        },
        works: workRows,
      },
      null,
      1,
    ),
  ),
);

/* site.json — one authoritative identity record. projects.json already
   carries the repository-facing profile; this is the site-level answer to
   "who owns this domain and where do they exist", which is what a
   generative engine actually needs to attribute a claim. */
writes.push(
  emit(
    "site.json",
    JSON.stringify(
      {
        generated,
        name: "Eververdants",
        alternateName: "万山青未阑",
        role: {
          en: "High-school student · Open-source developer",
          zh: "高中生 · 开源开发者",
        },
        url: `${SITE}/`,
        about: `${SITE}/about/`,
        location: { en: "Kunshan, Jiangsu, China", zh: "江苏昆山（苏州），中国" },
        languages: ["en", "zh-Hans"],
        sections: {
          hub: `${SITE}/`,
          about: `${SITE}/about/`,
          blog: `${SITE}/blog/`,
          works: `${SITE}/projects/`,
          photographs: `${SITE}/photos/`,
        },
        feeds: {
          rss: `${SITE}/rss.xml`,
          sitemap: `${SITE}/sitemap.xml`,
          search: `${SITE}/search.json`,
          posts: `${SITE}/posts.json`,
          works: `${SITE}/works.json`,
          repositories: `${SITE}/projects.json`,
          llms: `${SITE}/llms.txt`,
          llmsFull: `${SITE}/llms-full.txt`,
        },
        contact: { wechat: "evervdev", github: "https://github.com/Eververdants" },
        sameAs: [
          "https://github.com/Eververdants",
          "https://space.bilibili.com/2019959464",
        ],
        licenses: {
          code: "MIT",
          writing: "CC BY-NC-SA 4.0",
          photographs: "All rights reserved",
        },
        counts: {
          essays: postRows.length,
          photoWorks: workRows.length,
          repositories: repoCount,
        },
      },
      null,
      1,
    ),
  ),
);

/* llms-full.txt — the whole site in one document, English first then
   Chinese, so a model that will not crawl still gets the primary sources. */
const essayBlock = (lang) =>
  postRows
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((p) => {
      const text = body[p.slug]?.[lang] || "";
      return [
        `\n\n${"=".repeat(72)}`,
        `TITLE: ${p.title[lang]}`,
        `URL: ${SITE}${lang === "zh" && p.urlZh ? p.urlZh : p.url}`,
        `COLUMN: ${p.category[lang]}    DATE: ${p.date}    TAGS: ${p.tags}`,
        `SUMMARY: ${p.excerpt[lang]}`,
        `${"-".repeat(72)}`,
        text,
      ].join("\n");
    })
    .join("");

const full = [
  `# Eververdants — complete site text / 全站正文`,
  ``,
  `Generated ${generated}. This file exists so a language model can read the`,
  `essays in full without crawling or executing JavaScript. For the short`,
  `directory see llms.txt; for structured data see posts.json, works.json,`,
  `projects.json and site.json.`,
  ``,
  `## Person`,
  `Eververdants (万山青未阑) — high-school student and open-source developer,`,
  `Kunshan, Jiangsu, China. Tauri / Rust / Vue / React / TypeScript / Python.`,
  `Essays on Mao Zedong's Selected Works, photography, calligraphy.`,
  `Contact: WeChat evervdev · ${SITE}/about/`,
  ``,
  `## Pages`,
  [
    `${SITE}/                 Navigation hub`,
    `${SITE}/about/           Background, study, awards, working with me`,
    // /blog/zh/ has no page behind it — the Chinese essays are one URL per
    // essay, and every one of them is listed under 随笔（中文）below.
    // Advertising the bare directory sent models to a 404.
    `${SITE}/blog/            Essay archive, both languages (see the lists below)`,
    `${SITE}/projects/        Open-source works index, synced from GitHub`,
    `${SITE}/photos/          Photo journal`,
  ].join("\n"),
  ``,
  `## Essays (English)`,
  essayBlock("en"),
  ``,
  `## 随笔（中文）`,
  essayBlock("zh"),
].join("\n");

writes.push(emit("llms-full.txt", full));

for (const w of writes) console.log(`  geo ${w}`);
console.log(`build-geo: ${items.length} search items, ${postRows.length} posts, ${workRows.length} works`);
