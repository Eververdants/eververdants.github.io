/* Site-wide preferences — one implementation for all five entries.
 *
 * Language and theme live in the same two localStorage keys the site has
 * always used (`blog-lang` / `blog-theme`), so a choice made on any page
 * follows the reader everywhere. Resolution order is:
 *
 *   localStorage  →  ?lang= / ?theme=  →  dark
 *
 * A stored choice outranks the URL. The override exists so a link can hand
 * the site to someone who has not picked a language yet; once they have
 * picked, pinning every visit to whatever a link happened to carry quietly
 * discards that pick — and since resolvePrefs runs again on every reload and
 * every cross-tab sync, the override would outlive the link that introduced
 * it. (The zh articles are path-routed at /blog/zh/<slug>/, so nothing that
 * needs a URL-forced language depends on this.) The theme falls back to dark
 * because the terminal direction is the site's default look; a reader who
 * wants daylight picks it once in the bar.
 * The inline pre-paint script in vite.config.ts mirrors this exactly —
 * keep the two in step.
 *
 * Framework-free by design: /projects is deliberately dependency-less
 * vanilla TS, so this module touches nothing but the DOM. React entries
 * use the thin `usePrefs` hook in ./prefs-react. */

export type Lang = "en" | "zh";
export type Theme = "light" | "dark";

export interface Prefs {
  lang: Lang;
  theme: Theme;
}

const LANG_KEY = "blog-lang";
const THEME_KEY = "blog-theme";

const listeners = new Set<(p: Prefs) => void>();

let current: Prefs | null = null;

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null; /* private mode / disabled storage */
  }
}

function write(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* ignore — the preference still applies for this page load */
  }
}

function asLang(v: string | null | undefined): Lang | null {
  return v === "en" || v === "zh" ? v : null;
}

function asTheme(v: string | null | undefined): Theme | null {
  return v === "light" || v === "dark" ? v : null;
}

function urlOverride(): Partial<Prefs> {
  try {
    const q = new URLSearchParams(location.search);
    return { lang: asLang(q.get("lang")) ?? undefined, theme: asTheme(q.get("theme")) ?? undefined };
  } catch {
    return {};
  }
}

function resolvePrefs(): Prefs {
  const ov = urlOverride();
  return {
    lang: asLang(read(LANG_KEY)) ?? ov.lang ?? "en",
    theme: asTheme(read(THEME_KEY)) ?? ov.theme ?? "dark",
  };
}

function apply(p: Prefs): void {
  const root = document.documentElement;
  root.lang = p.lang === "zh" ? "zh-Hans" : "en";
  root.dataset.theme = p.theme;
}

/** Current preferences, computed once per page and then kept in memory. */
export function getPrefs(): Prefs {
  if (!current) current = resolvePrefs();
  return current;
}

/** Write the attributes before first paint. Called at module scope by every entry. */
export function initPrefs(): Prefs {
  current = resolvePrefs();
  apply(current);
  return current;
}

export function setLang(lang: Lang): void {
  current = { ...getPrefs(), lang };
  apply(current);
  write(LANG_KEY, lang);
  emit();
}

export function setTheme(theme: Theme): void {
  current = { ...getPrefs(), theme };
  apply(current);
  write(THEME_KEY, theme);
  emit();
}

/** Flip the theme through a short colour cross-fade. */
export function toggleTheme(): void {
  const next: Theme = getPrefs().theme === "dark" ? "light" : "dark";
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
  return asLang(read(LANG_KEY)) !== null;
}

/** Pick between two strings by language. */
export function pick<T>(lang: Lang, en: T, zh: T): T {
  return lang === "zh" ? zh : en;
}

/** Sync the stored preference when another tab changes it. */
try {
  addEventListener("storage", (e) => {
    if (e.key !== LANG_KEY && e.key !== THEME_KEY) return;
    current = resolvePrefs();
    apply(current);
    emit();
  });
} catch {
  /* non-browser context */
}
