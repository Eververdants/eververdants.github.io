#!/usr/bin/env node
// scripts/new-work.mjs
// Scaffold a new work entry for the photos sub-site.
// Interactive in a TTY; accepts flags for scripted use.
//
//   npm run new-work
//   npm run new-work -- --slug my-work --title "My Work" --category LANDSCAPE
//
// Creates:
//   src/photos/works/<slug>.md   (frontmatter + an HTML comment listing optional fields)
//   public/works/<slug>/         (folder with a .gitkeep so git tracks the directory)
//
// Drop the cover image at public/works/<slug>/cover.webp before building.
// Any extra images in the same folder are auto-detected and listed under `gallery:`.

import { readFile, writeFile, mkdir, readdir, access } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createInterface } from "node:readline";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const ROOT = resolve(__dirname, "..");

const CATS_FILE = join(ROOT, "src/photos/data/categories.ts");
const WORKS_DIR = join(ROOT, "src/photos/works");
const PUBLIC_WORKS_DIR = join(ROOT, "public/works");

const IMG_EXTS = new Set([".webp", ".jpg", ".jpeg", ".png", ".avif"]);

const parseArgs = (argv) => {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) continue;
    const k = a.slice(2);
    const v = argv[i + 1];
    if (v && !v.startsWith("--")) { out[k] = v; i++; }
    else out[k] = true;
  }
  return out;
};

const parseCategories = async () => {
  // Reads the canonical { id, label, labelZh } entries from categories.ts.
  // If the schema changes, update this regex to match.
  const src = await readFile(CATS_FILE, "utf8");
  const re = /\{\s*id:\s*['"`]([^'"`]+)['"`]\s*,\s*label:\s*['"`]([^'"`]+)['"`]\s*,\s*labelZh:\s*['"`]([^'"`]+)['"`][^}]*\}/g;
  const out = [];
  let m;
  while ((m = re.exec(src))) out.push({ id: m[1], label: m[2], labelZh: m[3] });
  return out;
};

const prompt = (rl, q, def) =>
  new Promise((resolve) => {
    const suffix = def ? ` [${def}]` : "";
    rl.question(`${q}${suffix}: `, (a) => resolve(a.trim() || def || ""));
  });

const isValidSlug = (s) =>
  /^[a-z0-9]$/.test(s) || /^[a-z0-9][a-z0-9-]{0,62}[a-z0-9]$/.test(s);

const detectImages = async (dir) => {
  try {
    const names = await readdir(dir);
    return names
      .filter((n) => IMG_EXTS.has("." + n.split(".").pop().toLowerCase()) && n !== ".gitkeep")
      .sort();
  } catch { return []; }
};

const buildFrontmatter = (d) => {
  const lines = ["---"];
  const push = (k, v) => { if (v !== undefined && v !== "") lines.push(`${k}: ${typeof v === "string" && /[:#]/.test(v) ? JSON.stringify(v) : v}`); };
  push("slug", d.slug);
  push("title", d.title);
  push("titleZh", d.titleZh);
  push("date", d.date);
  push("category", d.category);
  push("location", d.location);
  push("locationZh", d.locationZh);
  push("description", d.description);
  push("descriptionZh", d.descriptionZh);
  push("cover", d.cover);
  if (d.gallery && d.gallery.length) {
    lines.push("gallery:");
    for (const g of d.gallery) lines.push(`  - ${g}`);
  }
  push("camera", d.camera);
  push("lens", d.lens);
  push("focal", d.focal);
  push("aperture", d.aperture);
  push("shutter", d.shutter);
  push("iso", d.iso);
  if (d.featured) lines.push("featured: true");
  if (d.order !== undefined && d.order !== "") lines.push(`order: ${d.order}`);
  lines.push("---");
  return lines.join("\n");
};

const main = async () => {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || args.h) {
    console.log(`Usage: npm run new-work -- [--slug <s>] [--title <t>] [--titleZh <t>] [--date YYYY-MM] [--category ID] [--location <loc>] [--locationZh <loc>] [--description <d>] [--descriptionZh <d>] [--cover <path>] [--featured]`);
    process.exit(0);
  }

  const categories = await parseCategories();
  const catIds = categories.map((c) => c.id);
  const catHint = catIds.join(" / ");

  const isTTY = !!process.stdin.isTTY;
  const rl = isTTY ? createInterface({ input: process.stdin, output: process.stdout }) : null;

  const ask = async (k, q, def) => {
    if (args[k] !== undefined && args[k] !== true && args[k] !== "") return String(args[k]);
    if (rl) return await prompt(rl, q, def);
    return def || "";
  };

  // --- slug ---
  let slug = args.slug;
  if (!slug && rl) slug = (await prompt(rl, "Slug (lowercase, hyphens; used in URL)")).toLowerCase();
  if (!slug) { console.error("Error: --slug is required (or run interactively in a TTY)."); process.exit(1); }
  if (!isValidSlug(slug)) { console.error(`Error: invalid slug "${slug}". Use lowercase letters, digits, hyphens.`); process.exit(1); }

  const mdPath = join(WORKS_DIR, `${slug}.md`);
  try { await access(mdPath); console.error(`Error: ${mdPath} already exists.`); process.exit(1); } catch {}

  // --- main fields ---
  const title = await ask("title", "Title (English)");
  if (!title) { console.error("Error: title is required."); process.exit(1); }
  const titleZh = await ask("titleZh", "Title 中文 (optional)");
  const date = await ask("date", "Date (YYYY-MM)", new Date().toISOString().slice(0, 7));
  const category = await ask("category", `Category (${catHint})`);
  if (!catIds.includes(category)) {
    console.error(`Error: unknown category "${category}". Known: ${catIds.join(", ")}`);
    process.exit(1);
  }
  const location = await ask("location", "Location (optional)");
  const locationZh = await ask("locationZh", "Location 中文 (optional)");
  const description = await ask("description", "Description (optional)");
  const descriptionZh = await ask("descriptionZh", "Description 中文 (optional)");

  // --- images: create the folder, auto-detect existing files ---
  const pubDir = join(PUBLIC_WORKS_DIR, slug);
  await mkdir(pubDir, { recursive: true });
  await writeFile(join(pubDir, ".gitkeep"), "");
  const imgs = await detectImages(pubDir);
  let cover = args.cover;
  let gallery = [];
  if (!cover && imgs.length) {
    cover = `works/${slug}/${imgs[0]}`;
    gallery = imgs.slice(1).map((n) => `works/${slug}/${n}`);
    console.log(`  · auto-detected cover: ${cover}`);
    if (gallery.length) console.log(`  · auto-detected gallery: ${gallery.length} image(s)`);
  } else if (imgs.length) {
    gallery = imgs.map((n) => `works/${slug}/${n}`);
  }
  if (!cover) cover = `works/${slug}/cover.webp`;

  const body = [
    "",
    "<!--",
    "  Optional frontmatter fields you can fill in this file:",
    "    camera, lens, focal, aperture, shutter, iso — only rendered when present.",
    "    featured: true  → marks the work as 'SELECTED' on the card.",
    "    order: <number> → manual sort priority (ascending; lower = earlier).",
    "  Gallery images: list any extra files in public/works/<slug>/ under `gallery:`.",
    "-->",
    "",
  ].join("\n");

  const md = buildFrontmatter({
    slug, title, titleZh, date, category, location, locationZh,
    description, descriptionZh, cover, gallery,
    featured: !!args.featured,
  }) + body;

  await writeFile(mdPath, md, "utf8");
  if (rl) rl.close();

  console.log(`\n✓ Created  ${mdPath}`);
  console.log(`✓ Ensured   public/works/${slug}/  (.gitkeep)`);
  console.log("\nNext steps:");
  if (!imgs.length) {
    console.log(`  1. Drop the cover image at:  public/works/${slug}/cover.webp`);
    console.log(`     (any extra images in the same folder are auto-detected as gallery.)`);
  } else {
    console.log(`  1. Verified images in:        public/works/${slug}/`);
  }
  console.log(`  2. Refine the frontmatter in: ${mdPath}  (title, date, description, optional EXIF)`);
  console.log(`  3. Run \`npm run build\` (or \`npm run dev\` to preview live).`);
};

main().catch((e) => { console.error(e); process.exit(1); });
