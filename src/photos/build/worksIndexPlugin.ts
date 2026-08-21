import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import type { Plugin } from "vite";
import { parseWorkMeta } from "../data/parseWork.ts";
import type { Work } from "../data/types.ts";

const VIRTUAL_ID = "virtual:works-index";
const WORKS_DIR = fileURLToPath(new URL("../works/", import.meta.url));

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
    if (w.slug && w.title && w.cover) works.push(w);
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
