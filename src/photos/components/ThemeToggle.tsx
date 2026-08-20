import { usePhotosPrefs } from "../lib/prefs";
import { ui } from "../lib/i18n";
import { themeFlip } from "../../effects/themePlain";

/* Plain theme button — the photos form that the whole site now shares:
   no reveal animation, just a short colour transition (themeFlip). The
   preference persists to blog-theme so blog/projects follow instantly. */
export function ThemeToggle() {
  const { theme, setTheme, lang } = usePhotosPrefs();
  const isDark = theme === "dark";
  const t = ui[lang];

  const onClick = () => {
    const next: "light" | "dark" = theme === "dark" ? "light" : "dark";
    themeFlip(() => setTheme(next));
  };

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={onClick}
      aria-label={isDark ? t.themeLight : t.themeDark}
      title={isDark ? "Light" : "Dark"}
    >
      <span className="toggle-icon" aria-hidden>
        {isDark
          ? <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><circle cx="8" cy="8" r="3" /><path d="M8 1.5v1.6M8 12.9v1.6M1.5 8h1.6M12.9 8h1.6M3.3 3.3l1.1 1.1M11.6 11.6l1.1 1.1M3.3 12.7l1.1-1.1M11.6 4.4l1.1-1.1" /></svg>
          : <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M13.2 9.6A5.6 5.6 0 0 1 6.4 2.8a5.6 5.6 0 1 0 6.8 6.8z" /></svg>}
      </span>
      <span>{isDark ? "Light" : "Dark"}</span>
    </button>
  );
}
