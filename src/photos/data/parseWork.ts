import type { Work } from "./types.ts";

type Front = Record<string, string | string[] | number | boolean>;

function stripQuotes(s: string): string {
  s = s.trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    return s.slice(1, -1);
  }
  return s;
}

export function parseFrontmatter(text: string): Front {
  const out: Front = {};
  const lines = text.split(/\r?\n/);
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
    const li = line.match(/^\s*-\s+(.*)$/);
    if (li) { i++; continue; }
    const kv = line.match(/^([A-Za-z_][\w-]*)\s*:\s*(.*)$/);
    if (!kv) { i++; continue; }
    const key = kv[1];
    const rest = kv[2];
    if (rest === undefined || rest === "") {
      const list: string[] = [];
      let j = i + 1;
      while (j < lines.length) {
        const ln = lines[j];
        const m2 = ln.match(/^\s*-\s+(.*)$/);
        if (m2) { list.push(stripQuotes(m2[1])); j++; continue; }
        if (ln.trim() === "") { j++; continue; }
        break;
      }
      if (list.length) { out[key] = list; i = j; continue; }
      out[key] = ""; i++; continue;
    }
    const val = stripQuotes(rest);
    if (val === "true") out[key] = true;
    else if (val === "false") out[key] = false;
    else if (/^-?\d+(?:\.\d+)?$/.test(val)) out[key] = Number(val);
    else out[key] = val;
    i++;
  }
  return out;
}

export function parseWorkMeta(raw: string): Work {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const fm: Front = m ? parseFrontmatter(m[1]) : {};
  const s = (k: string): string | undefined => {
    const v = fm[k];
    return typeof v === "string" ? v : undefined;
  };
  const a = (k: string): string[] | undefined => {
    const v = fm[k];
    return Array.isArray(v) ? v : undefined;
  };
  const num = (k: string): number | undefined => {
    const v = fm[k];
    return typeof v === "number" ? v : undefined;
  };
  const bool = (k: string): boolean | undefined => {
    const v = fm[k];
    return typeof v === "boolean" ? v : undefined;
  };
  return {
    slug: s("slug") ?? "",
    title: s("title") ?? "",
    titleZh: s("titleZh"),
    date: s("date") ?? "",
    category: s("category") ?? "",
    location: s("location"),
    locationZh: s("locationZh"),
    description: s("description"),
    descriptionZh: s("descriptionZh"),
    cover: s("cover") ?? "",
    gallery: a("gallery"),
    camera: s("camera"),
    lens: s("lens"),
    focal: s("focal"),
    aperture: s("aperture"),
    shutter: s("shutter"),
    iso: s("iso"),
    featured: bool("featured"),
    order: num("order"),
  };
}
