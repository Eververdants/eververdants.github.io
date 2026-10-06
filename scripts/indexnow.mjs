/* ---- IndexNow submission — "tell Microsoft the page changed" ----
 *
 * The site's IndexNow key lives in the repo as public/<key>.txt (the file
 * name IS the key, its content repeats it): that is the whole protocol —
 * publish the key file, then POST {host, key, keyLocation, urlList} to an
 * IndexNow endpoint and every participating engine (Bing, Yandex, Seznam,
 * Naver) is told those URLs changed. No account, no OAuth, no quota form.
 *
 * Bing runs this as its Webmaster Tools "URL submission" path now, so the
 * msvalidate.01 tag in index.html stays only as the property verification;
 * the actual ping is here.
 *
 * Called by .github/workflows/deploy.yml right after the build, with the
 * freshly written dist/ in hand — the sitemap is the source of truth for
 * what to submit, so nothing has to be kept in sync by hand. Args:
 *
 *   node scripts/indexnow.mjs                     # every URL in dist/sitemap.xml
 *   node scripts/indexnow.mjs <url> [<url> ...]   # only these URLs (one new post)
 *   node scripts/indexnow.mjs --dry-run           # print the payload, POST nothing
 *
 * A submission failure is a warning, never a thrown error: Google ignores
 * IndexNow entirely, Bing re-crawls on its own schedule, and a search-engine
 * ping must never turn a green build red. The response is printed either way
 * so the CI log shows what the engine said.
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, basename } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const SITEMAP = join(ROOT, "dist/sitemap.xml");
const PUBLIC = join(ROOT, "public");
const HOST = "eververdants.github.io";

/* Primary endpoint (fans out to every IndexNow engine); Bing's own endpoint
   is the fallback if the neutral one is unreachable — both take the same
   payload and Bing de-duplicates, but hitting both on every push is noise. */
const ENDPOINTS = [
  "https://api.indexnow.org/indexnow",
  "https://www.bing.com/indexnow",
];

/* The key file's name is the key; its content must repeat the name (IndexNow
   rejects a file that disagrees with the payload). Scanning public/ beats
   hard-coding it here — rotating the key stays a one-file change. */
function readKey() {
  const fromEnv = process.env.INDEXNOW_KEY?.trim();
  if (fromEnv) return fromEnv;
  for (const name of readdirSync(PUBLIC)) {
    if (!/^[A-Za-z0-9-]{8,128}\.txt$/.test(name)) continue;
    const value = readFileSync(join(PUBLIC, name), "utf8").trim();
    if (value === basename(name, ".txt")) return value;
  }
  return "";
}

/* Every <loc> in the sitemap. The sitemap is written by scripts/prerender.mjs
   from the same frontmatter the pages come from, so it cannot list a URL that
   was not built — a post added by hand shows up here with no extra wiring. */
function sitemapUrls() {
  if (!existsSync(SITEMAP)) return [];
  const xml = readFileSync(SITEMAP, "utf8");
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
}

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const explicit = args.filter((a) => /^https?:\/\//.test(a));
const urlList = [...new Set(explicit.length ? explicit : sitemapUrls())];

if (!urlList.length) {
  console.warn(
    "[indexnow] nothing to submit — no URLs given and dist/sitemap.xml is missing or empty (run `npm run build` first).",
  );
  process.exit(0);
}

const key = readKey();
if (!key) {
  console.warn(
    "[indexnow] no key found: expected public/<key>.txt whose content repeats its file name, or INDEXNOW_KEY in the environment.",
  );
  process.exit(0);
}

/* IndexNow takes at most 10,000 URLs per request. The site is nowhere near
   that, but a chunked loop costs three lines and removes the cliff. */
const CHUNK = 10000;
const chunks = [];
for (let i = 0; i < urlList.length; i += CHUNK)
  chunks.push(urlList.slice(i, i + CHUNK));

const keyLocation = `https://${HOST}/${key}.txt`;

for (const [i, chunk] of chunks.entries()) {
  const payload = { host: HOST, key, keyLocation, urlList: chunk };
  if (dryRun) {
    console.log(
      `[indexnow] dry run — ${chunk.length} URL(s), key ${key}, keyLocation ${keyLocation}`,
    );
    console.log(JSON.stringify(payload, null, 2));
    continue;
  }
  let submitted = false;
  for (const endpoint of ENDPOINTS) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify(payload),
      });
      /* 200 = accepted, 202 = accepted, key pending validation. Anything
         else (403 = key file not reachable, 422 = URLs off-host or key
         mismatch) is worth printing verbatim — the body says which. */
      const body = (await res.text()).trim();
      console.log(
        `[indexnow] ${endpoint} → ${res.status}${body ? ` ${body.slice(0, 300)}` : ""} (${chunk.length} URL(s)${chunks.length > 1 ? `, batch ${i + 1}/${chunks.length}` : ""})`,
      );
      if (res.ok || res.status === 202) {
        submitted = true;
        break;
      }
    } catch (e) {
      console.warn(`[indexnow] ${endpoint} failed: ${e.message}`);
    }
  }
  if (!submitted) {
    console.warn(
      "[indexnow] no endpoint accepted this batch — the site itself is unaffected; Bing will still re-crawl on its own schedule.",
    );
  }
}
