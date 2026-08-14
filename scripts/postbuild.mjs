// GitHub Pages SPA fallback: unknown deep links (/foo) serve 404.html.
// Copy the built index.html so it carries the correct hashed asset URLs.
import { copyFileSync } from "node:fs";

copyFileSync("dist/index.html", "dist/404.html");
console.log("copied dist/index.html -> dist/404.html");
