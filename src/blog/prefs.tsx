/* Blog sub-site preferences — language (EN/中文) and theme (light/dark).

   Two independent preferences, both persisted to localStorage and mirrored
   onto <html>: lang via the lang attribute, theme via [data-theme] (the CSS
   variable system in styles/global.css keys off it). An inline script in
   blog/index.html applies both BEFORE first paint so a returning visitor
   never sees a light flash.

   The theme attribute also drives the site's shared CSS (scrollbar,
   overlay, article reader), which is safe: the main site never sets
   data-theme, so it keeps the :root light values by default. */
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type Lang = "en" | "zh";
export type Theme = "light" | "dark";

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
    /* storage unavailable (private mode etc.) — fall through */
  }
  return fallback;
}

interface BlogPrefs {
  lang: Lang;
  theme: Theme;
  setLang: (l: Lang) => void;
  setTheme: (t: Theme) => void;
}

const Ctx = createContext<BlogPrefs | null>(null);

export function BlogPrefsProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() =>
    readInitial<Lang>(LANG_KEY, "en", ["en", "zh"]),
  );
  const [theme, setThemeState] = useState<Theme>(() =>
    readInitial<Theme>(THEME_KEY, "light", ["light", "dark"]),
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
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  return (
    <Ctx.Provider
      value={{
        lang,
        theme,
        setLang: setLangState,
        setTheme: setThemeState,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useBlogPrefs(): BlogPrefs {
  const v = useContext(Ctx);
  if (!v) throw new Error("useBlogPrefs must be used inside BlogPrefsProvider");
  return v;
}

/* ---- UI copy — every visible label on the blog sub-site ---- */
export const ui = {
  en: {
    searchPlaceholder: "SEARCH ESSAYS",
    searchLabel: "Search essays",
    clearSearch: "Clear search",
    all: "ALL",
    result: (n: number) => `${n} ${n === 1 ? "RESULT" : "RESULTS"}`,
    noMatch: "NO MATCH",
    noTag: "NO ESSAYS UNDER THIS TAG",
    noSection: "NOTHING FILED HERE YET",
    columns: "COLUMNS",
    column: "COLUMN",
    posts: "POSTS",
    visitMain: "VISIT THE MAIN SITE",
    scroll: "SCROLL",
    journalBack: "JOURNAL",
    onThisPage: (n?: number) =>
      n === undefined ? "ON THIS PAGE" : `ON THIS PAGE · ${n}`,
    previous: "← PREVIOUS",
    next: "NEXT →",
    end: (year: number) => `END — © ${year} EVERVERDANTS`,
  },
  zh: {
    searchPlaceholder: "搜索文章",
    searchLabel: "搜索文章",
    clearSearch: "清除搜索",
    all: "全部",
    result: (n: number) => `${n} 条结果`,
    noMatch: "无匹配结果",
    noTag: "该标签下暂无文章",
    noSection: "这里还没有归档文章",
    columns: "栏目",
    column: "栏目",
    posts: "篇",
    visitMain: "返回主站",
    scroll: "滚动",
    journalBack: "返回列表",
    onThisPage: (n?: number) =>
      n === undefined ? "本页目录" : `本页目录 · ${n}`,
    previous: "← 上一篇",
    next: "下一篇 →",
    end: (year: number) => `完 — © ${year} EVERVERDANTS`,
  },
} as const;

export type Ui = (typeof ui)["en"];
