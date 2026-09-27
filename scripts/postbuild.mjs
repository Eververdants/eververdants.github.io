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
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
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

/* GitHub Pages serves 404.html for any path with no file behind it, so it is
   built from the hub — but it must not masquerade as the homepage. Left alone
   it carried the hub's rel=canonical, which tells every crawler that an
   arbitrary wrong URL *is* https://eververdants.github.io/ — a soft-404 and a
   canonical conflict in one. Strip the canonical, add noindex, and give it a
   title that says what happened. */
function makeNotFound() {
  const hub = readFileSync("dist/index.html", "utf8");
  const stripped = hub
    .replace(/<link rel="canonical"[^>]*>\s*/i, "")
    .replace(
      /<meta name="description"[^>]*>\s*/i,
      '<meta name="description" content="Page not found." />\n    ',
    )
    .replace(
      /<title>[\s\S]*?<\/title>/i,
      "<title>Page not found — Eververdants</title>",
    );
  /* The shared head carries `<meta name="robots" content="max-image-preview:large">`,
     so a plain "already has robots?" check would skip the noindex and let
     GitHub Pages' catch-all 404 get indexed. Replace whatever robots content
     is there; only inject a fresh tag when there is none at all. */
  const strippedRobots = stripped.includes('name="robots"')
    ? stripped.replace(
        /<meta name="robots"[^>]*>/i,
        '<meta name="robots" content="noindex" />',
      )
    : stripped.replace(
        /<meta name="viewport"/i,
        '<meta name="robots" content="noindex" />\n    <meta name="viewport"',
      );
  /* GitHub Pages serves this one file for EVERY missing path. For a missing
     page (no extension) booting the hub is the intended fallback, but a
     missing FILE — a stale llms.txt link, a typo'd site.json, a feed that
     failed to generate — must not render the homepage at that URL. The guard
     below aborts the SPA before it boots and writes a plain, honest 404. */
  return strippedRobots.replace(
    /<head>/i,
    `<head>
    <script>
    (function () {
      var p = location.pathname;
      if (!/\\.[A-Za-z0-9]+$/.test(p)) return;
      window.stop();
      document.documentElement.replaceChildren();
      var head = document.createElement("head");
      var meta = document.createElement("meta");
      meta.name = "robots";
      meta.content = "noindex";
      var title = document.createElement("title");
      title.textContent = "404 Not Found — Eververdants";
      head.append(meta, title);
      var body = document.createElement("body");
      body.style.cssText =
        "margin:0;min-height:100vh;display:grid;place-content:center;" +
        "background:#060608;color:#8a93a3;" +
        "font:13px/1.7 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace";
      var pre = document.createElement("pre");
      pre.style.margin = "0";
      pre.textContent = "404 Not Found: " + p + "\\nhttps://eververdants.github.io/";
      body.appendChild(pre);
      document.documentElement.append(head, body);
    })();
    </script>`,
  );
}

writeFileSync("dist/404.html", makeNotFound());
console.log("wrote dist/404.html (noindex, canonical stripped)");

for (const r of REDIRECTS) {
  const file = join("dist", r.from.replace(/^\//, ""), "index.html");
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, redirectPage(r.to, r.label));
  console.log(`redirect ${r.from}/ -> ${r.to}`);
}
