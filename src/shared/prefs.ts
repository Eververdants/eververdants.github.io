/* Site-wide preferences — the store every entry reads.
 *
 * The resolution rule itself is not here: it lives once in ./prefs-boot, and
 * vite.config.ts emits that same function into the <head> so the pre-paint
 * script and this store cannot disagree. What this module adds on top is the
 * mutable half — writing the choice down, keeping it in memory, and telling
 * subscribers when it moves.
 *
 * Language and theme live in the same two localStorage keys the site has
 * always used (`blog-lang` / `blog-theme`), so a choice made on any page
 * follows the reader everywhere.
 *
 * Framework-free by design: /projects is deliberately dependency-less
 * vanilla TS, so this module touches nothing but the DOM. React entries
 * use the thin `usePrefs` hook in ./prefs-react. */

import { applyPrefs, bootPrefs, LANG_KEY, THEME_KEY } from "./prefs-boot";
import type { Prefs } from "./prefs-boot";

export type { Lang, Prefs, Theme } from "./prefs-boot";
export { LANG_KEY, THEME_KEY };

const listeners = new Set<(p: Prefs) => void>();

let current: Prefs | null = null;

function write(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* private mode / disabled storage — the setters still apply the choice
       for this page load, they just cannot carry it to the next one. */
  }
}

/** Current preferences, computed once per page and then kept in memory. */
export function getPrefs(): Prefs {
  if (!current) current = bootPrefs();
  return current;
}

/** Resolve and apply, as early in the entry as it can run. Called at module
 * scope by every entry; on a cold load the inlined head copy has usually
 * already painted these attributes, and this is what puts them in the store
 * components subscribe to. */
export function initPrefs(): Prefs {
  current = bootPrefs();
  return current;
}

export function setLang(lang: Prefs["lang"]): void {
  write(LANG_KEY, lang);
  /* Re-resolve rather than assume, so the other key and any URL override keep
     their say; then override with the value just asked for, which is what
     keeps the toggle live when storage refused to take it. */
  current = { ...bootPrefs(), lang };
  applyPrefs(current);
  emit();
}

export function setTheme(theme: Prefs["theme"]): void {
  write(THEME_KEY, theme);
  current = { ...bootPrefs(), theme };
  applyPrefs(current);
  emit();
}

/** Flip the theme through a short colour cross-fade. */
export function toggleTheme(): void {
  const next = getPrefs().theme === "dark" ? "light" : "dark";
  const reduced = (() => {
    try {
      return matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch {
      return true;
    }
  })();
  if (reduced) {
    setTheme(next);
    return;
  }
  const root = document.documentElement;
  root.classList.add("theme-anim");
  setTheme(next);
  setTimeout(() => root.classList.remove("theme-anim"), 360);
}

function emit(): void {
  const snapshot = getPrefs();
  for (const fn of listeners) fn(snapshot);
}

/** Subscribe to preference changes. Returns an unsubscribe function. */
export function subscribePrefs(fn: (p: Prefs) => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Whether the reader has ever chosen a language themselves. A reader who
 * has keeps it everywhere — an article URL in the other language follows
 * their choice, not the reverse. Only a reader without a stored choice
 * adopts the language a shared article URL carries. */
export function hasStoredLang(): boolean {
  try {
    const v = localStorage.getItem(LANG_KEY);
    return v === "en" || v === "zh";
  } catch {
    return false;
  }
}

/** Pick between two strings by language. */
export function pick<T>(lang: Prefs["lang"], en: T, zh: T): T {
  return lang === "zh" ? zh : en;
}

/** Sync the stored preference when another tab changes it. */
try {
  addEventListener("storage", (e) => {
    if (e.key !== LANG_KEY && e.key !== THEME_KEY) return;
    current = bootPrefs();
    emit();
  });
} catch {
  /* non-browser context */
}
