import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import type { Plugin } from "vite";
import { parseWorkMeta } from "../data/parseWork.ts";
import type { Work } from "../data/types.ts";

const VIRTUAL_ID = "virtual:works-index";
const WORKS_DIR = fileURLToPath(new URL("../works/", import.meta.url));
/* Frontmatter cover paths are public-relative ("works/x/cover.webp"), so the
   dimension probe reads from public/ to keep them in step with what the
   browser actually fetches. */
const PUBLIC_DIR = fileURLToPath(new URL("../../../public/", import.meta.url));

/* Dependency-free WebP dimensions, straight from the container headers:
   RIFF "WEBP" → one of three frame formats, each carrying width/height at a
   fixed offset. Returns null for anything that does not parse, so a broken
   or re-encoded cover degrades to no attributes instead of a broken build. */
function webpSize(
  path: string,
): { width: number; height: number } | null {
  let b: Buffer;
  try {
    b = readFileSync(path);
  } catch {
    return null;
  }
  try {
    if (
      b.length < 30 ||
      b.toString("ascii", 0, 4) !== "RIFF" ||
      b.toString("ascii", 8, 12) !== "WEBP"
    ) {
      return null;
    }
    const fmt = b.toString("ascii", 12, 16);
    if (fmt === "VP8X") {
      return {
        width: 1 + (b.readUInt32LE(24) & 0xffffff),
        height: 1 + (b.readUInt32LE(27) & 0xffffff),
      };
    }
    if (fmt === "VP8 ") {
      return {
        width: b.readUInt16LE(26) & 0x3fff,
        height: b.readUInt16LE(28) & 0x3fff,
      };
    }
    if (fmt === "VP8L") {
      const bits = b.readUInt32LE(21);
      return {
        width: (bits & 0x3fff) + 1,
        height: ((bits >> 14) & 0x3fff) + 1,
      };
    }
    return null;
  } catch {
    return null;
  }
}

function loadAll(): Work[] {
  let entries: string[] = [];
  try {
    entries = readdirSync(WORKS_DIR).filter((n) => n.endsWith(".md"));
  } catch {
    return [];
  }
  // Stable load order: alphabetical by filename, so "load order" ties are
  // deterministic across machines instead of depending on readdir() order.
  entries.sort();
  const works: Work[] = [];
  for (const name of entries) {
    const raw = readFileSync(join(WORKS_DIR, name), "utf8");
    const w = parseWorkMeta(raw);
    if (w.slug && w.title && w.cover) {
      /* Intrinsic dimensions go into the index so <img> can carry width/height
         (and the browser can reserve the box before the bytes arrive — no
         masonry jump when a cover finishes loading). */
      const size = webpSize(join(PUBLIC_DIR, w.cover));
      if (size) {
        w.coverW = size.width;
        w.coverH = size.height;
      }
      if (w.gallery?.length) {
        w.galleryWH = w.gallery.map((g) => webpSize(join(PUBLIC_DIR, g)));
      }
      works.push(w);
    }
  }
  // Sort: date desc (newest → oldest); equal dates keep load order
  // (Array.sort is stable, so returning 0 preserves the alphabetical load order).
  works.sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? 1 : -1;
    return 0;
  });
  return works;
}

export function worksIndexPlugin(): Plugin {
  return {
    name: "works-index",
    resolveId(id) {
      if (id === VIRTUAL_ID) return "\0" + VIRTUAL_ID;
      return undefined;
    },
    load(id) {
      if (id === "\0" + VIRTUAL_ID) {
        const works = loadAll();
        return `export const works = ${JSON.stringify(works)};`;
      }
      return undefined;
    },
  };
}
