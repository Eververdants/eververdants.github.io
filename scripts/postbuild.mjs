/* Post-build fixes GitHub Pages cannot do itself.
 *
 * 1. 404.html — Pages serves this for any path with no file behind it.
 * 2. Redirect stubs for the URLs the old single-page deck published.
 *
 * The deck rewrote the address bar as you scrolled, so /resume, /selected and
 * /selected-blog were shared, bookmarked and sat in the sitemap. They are not
 * routes any more. A meta refresh plus a canonical link hands both the reader
 * and the crawler to wherever that content lives now, which is kinder than a
 * 404 and cheaper than a rewrite rule Pages does not support. */
import { copyFileSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const SITE = "https://eververdants.github.io";

const REDIRECTS = [
  { from: "/resume", to: "/about/", label: "About" },
  { from: "/selected", to: "/projects/", label: "Works" },
  { from: "/selected-blog", to: "/blog/", label: "Blog" },
];

function redirectPage(to, label) {
  const url = `${SITE}${to}`;
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="refresh" content="0; url=${url}" />
    <link rel="canonical" href="${url}" />
    <meta name="robots" content="noindex" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${label} — Eververdants</title>
    <script>location.replace(${JSON.stringify(url)});</script>
  </head>
  <body>
    <p>This page has moved. <a href="${url}">Continue to ${label}</a>.</p>
  </body>
</html>
`;
}

copyFileSync("dist/index.html", "dist/404.html");
console.log("copied dist/index.html -> dist/404.html");

for (const r of REDIRECTS) {
  const file = join("dist", r.from.replace(/^\//, ""), "index.html");
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, redirectPage(r.to, r.label));
  console.log(`redirect ${r.from}/ -> ${r.to}`);
}
