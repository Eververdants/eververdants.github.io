/* The one copy of the language/theme resolution rule.

   It has to run twice at *runtime*: once inlined into <head> before the first
   paint, and once from ./prefs when the app boots. That split is forced by the
   platform — the app bundle is a deferred `<script type="module">`, far too
   late to stop a light-theme reader being flashed with the dark field colour
   the head cover paints — so what must not be duplicated is the *rule*.
   vite.config.ts emits the head copy from `bootPrefs.toString()`, which makes
   the two incapable of disagreeing.

   bootPrefs is therefore self-contained by construction: `toString()` captures
   only the body, so it may not close over anything but its own siblings in
   this file — which is why `applyPrefs` lives here too and the config emits
   both. The storage keys appear as literals rather than as LANG_KEY for the
   same reason; the config asserts at build time that those literals still
   match the exported constants, so renaming a key in one place fails the
   build instead of silently splitting behaviour. */

export type Lang = "en" | "zh";
export type Theme = "light" | "dark";

export interface Prefs {
  lang: Lang;
  theme: Theme;
}

/** The two localStorage keys the site has always used. */
export const LANG_KEY = "blog-lang";
export const THEME_KEY = "blog-theme";

/** Stamp a resolved preference pair onto `<html>`. */
export function applyPrefs(p: Prefs): void {
  const root = document.documentElement;
  root.lang = p.lang === "zh" ? "zh-Hans" : "en";
  root.dataset.theme = p.theme;
}

/**
 * Resolve the reader's preferences and apply them.
 *
 * A stored choice outranks a `?lang=` / `?theme=` URL parameter: the override
 * exists to hand the site to someone who has not picked yet, and because this
 * runs again on every reload and cross-tab sync, letting the URL win would
 * keep discarding a pick long after the link that carried it was gone.
 *
 * Never throws — a reader with storage disabled, or a browser without
 * `dataset`, still gets the default look rather than a blank page.
 */
export function bootPrefs(): Prefs {
  try {
    const q = new URLSearchParams(location.search);

    let theme: Theme;
    const storedTheme = localStorage.getItem("blog-theme");
    if (storedTheme === "dark" || storedTheme === "light") {
      theme = storedTheme;
    } else {
      const urlTheme = q.get("theme");
      theme = urlTheme === "dark" || urlTheme === "light" ? urlTheme : "dark";
    }

    let lang: Lang;
    const storedLang = localStorage.getItem("blog-lang");
    if (storedLang === "en" || storedLang === "zh") {
      lang = storedLang;
    } else {
      const urlLang = q.get("lang");
      lang = urlLang === "en" || urlLang === "zh" ? urlLang : "en";
    }

    const prefs = { lang, theme };
    applyPrefs(prefs);
    return prefs;
  } catch {
    document.documentElement.dataset.theme = "dark";
    return { lang: "en", theme: "dark" };
  }
}
