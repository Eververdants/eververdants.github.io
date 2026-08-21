/* Shared top-bar preferences for the MAIN site.
 *
 * The three sub-sites (blog / photos / projects) all read & write the same
 * pair of localStorage keys (blog-lang / blog-theme) and mirror them onto
 * <html> (lang attribute + data-theme). The main site is English-only and
 * dark by design, so it defaults lang to "en" and theme to "dark" — but it
 * still participates in the SAME keys, so a choice made here follows into the
 * sub-sites (and vice-versa).
 *
 * To avoid clobbering a sub-site's light default for first-time visitors,
 * we only PERSIST the theme once a value already exists in storage (i.e. the
 * user has been to a sub-site, or toggled here). A brand-new visitor who only
 * ever opens the main site leaves blog-theme untouched, so their first trip
 * to /blog still defaults to light. */
import { useEffect, useState } from "react";

export type Lang = "en" | "zh";
export type Theme = "light" | "dark";

export interface TopBarPrefs {
  lang: Lang;
  setLang: (l: Lang) => void;
  theme: Theme;
  setTheme: (t: Theme) => void;
}

const LANG_KEY = "blog-lang";
const THEME_KEY = "blog-theme";

function readInitial<T extends string>(
  key: string,
  fallback: T,
  valid: T[],
): T {
  try {
    const v = localStorage.getItem(key);
    if (v && (valid as string[]).includes(v)) return v as T;
  } catch {
    /* storage unavailable — fall through */
  }
  return fallback;
}

export function useSharedPrefs(): TopBarPrefs {
  const [lang, setLangState] = useState<Lang>(() =>
    readInitial<Lang>(LANG_KEY, "en", ["en", "zh"]),
  );
  const [theme, setThemeState] = useState<Theme>(() =>
    readInitial<Theme>(THEME_KEY, "dark", ["light", "dark"]),
  );

  useEffect(() => {
    document.documentElement.lang = lang;
    try {
      localStorage.setItem(LANG_KEY, lang);
    } catch {
      /* ignore */
    }
  }, [lang]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    /* Only persist if a preference was already recorded elsewhere — never
       overwrite a sub-site's light default on a fresh main-site visit. */
    try {
      if (localStorage.getItem(THEME_KEY))
        localStorage.setItem(THEME_KEY, theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  return { lang, theme, setLang: setLangState, setTheme: setThemeState };
}
