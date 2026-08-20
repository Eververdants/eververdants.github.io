/* Photos sub-site preferences — language (EN/中文) and theme (light/dark).

   Both preferences SHARE the blog/projects keys (blog-lang / blog-theme), so
   flipping one sub-site's toggle follows everywhere. The inline script in
   photos/index.html applies both BEFORE first paint (plus ?lang=/?theme=
   URL overrides); this provider keeps them in sync from then on. */
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
    /* storage unavailable — fall through */
  }
  return fallback;
}

/* The FOUC script may have applied a ?lang=/?theme= override on this page
   load (links from elsewhere). Honour it until the user toggles again. */
function readOverride(): { lang?: Lang; theme?: Theme } {
  try {
    const p = new URLSearchParams(location.search);
    const lang = p.get("lang");
    const theme = p.get("theme");
    return {
      lang: lang === "en" || lang === "zh" ? lang : undefined,
      theme: theme === "light" || theme === "dark" ? theme : undefined,
    };
  } catch {
    return {};
  }
}

interface PhotosPrefs {
  lang: Lang;
  theme: Theme;
  setLang: (l: Lang) => void;
  setTheme: (t: Theme) => void;
}

const Ctx = createContext<PhotosPrefs | null>(null);

export function PhotosPrefsProvider({ children }: { children: ReactNode }) {
  const ov = readOverride();
  const [lang, setLangState] = useState<Lang>(
    () => ov.lang ?? readInitial<Lang>(LANG_KEY, "en", ["en", "zh"]),
  );
  const [theme, setThemeState] = useState<Theme>(
    () => ov.theme ?? readInitial<Theme>(THEME_KEY, "light", ["light", "dark"]),
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
      value={{ lang, theme, setLang: setLangState, setTheme: setThemeState }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function usePhotosPrefs(): PhotosPrefs {
  const v = useContext(Ctx);
  if (!v) throw new Error("usePhotosPrefs must be used inside PhotosPrefsProvider");
  return v;
}
