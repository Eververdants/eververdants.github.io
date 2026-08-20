import type { Work } from "./types.ts";
import { works as allWorks } from "virtual:works-index";

export const getWorks = (): Work[] => allWorks;

export const getWork = (slug: string): Work | undefined =>
  allWorks.find((w) => w.slug === slug);

export const getCategoryIds = (): string[] => {
  const s = new Set<string>();
  for (const w of allWorks) s.add(w.category);
  return Array.from(s);
};
