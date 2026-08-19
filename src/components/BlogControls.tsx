import { useBlogPrefs } from "../blog/prefs";

/* Floating preference controls for the blog sub-site — top-right, above
   everything (z-60, under the site-nav overlay). Two pills in the blog's
   own grammar: hairline border, small tracked caps, teal hover. The lang
   pill shows both scripts with the active one highlighted; the theme pill
   shows the mode you'd switch TO (moon in light, sun in dark). */

function LangIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="h-3.5 w-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M3.6 9h16.8M3.6 15h16.8" />
      <path d="M12 3a13.6 13.6 0 0 1 0 18M12 3a13.6 13.6 0 0 0 0 18" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="h-3.5 w-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    >
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.5v2.4M12 19.1v2.4M2.5 12h2.4M19.1 12h2.4M5.3 5.3l1.7 1.7M17 17l1.7 1.7M18.7 5.3L17 7M7 17l-1.7 1.7" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="h-3.5 w-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.2 14.2A8.3 8.3 0 0 1 9.8 3.8a8.3 8.3 0 1 0 10.4 10.4Z" />
    </svg>
  );
}

const pill =
  "inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--field)]/90 px-3.5 py-2 text-[10px] font-semibold tracking-[0.22em] text-[var(--muted)] shadow-[0_1px_0_rgba(0,0,0,0.03)] backdrop-blur transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]";

export default function BlogControls() {
  const { lang, setLang, theme, setTheme } = useBlogPrefs();

  return (
    <div className="fixed right-[clamp(14px,2.5vw,28px)] top-[clamp(14px,2.5vh,26px)] z-[60] flex items-center gap-2">
      {/* language — EN / 中, active script highlighted */}
      <button
        type="button"
        onClick={() => setLang(lang === "en" ? "zh" : "en")}
        className={pill}
        aria-label={lang === "en" ? "Switch to Chinese" : "切换到英文"}
        title={lang === "en" ? "中文" : "EN"}
      >
        <LangIcon />
        <span className="leading-none">
          <span
            className={
              lang === "en" ? "text-[var(--accent)]" : "text-[var(--fainter)]"
            }
          >
            EN
          </span>
          <span className="mx-1 text-[var(--border-strong)]">/</span>
          <span
            className={
              lang === "zh" ? "text-[var(--accent)]" : "text-[var(--fainter)]"
            }
          >
            中
          </span>
        </span>
      </button>

      {/* theme — shows the mode you'd switch TO */}
      <button
        type="button"
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        className={pill}
        aria-label={
          theme === "light" ? "Switch to dark mode" : "切换到浅色模式"
        }
        title={theme === "light" ? "Dark" : "Light"}
      >
        {theme === "light" ? <MoonIcon /> : <SunIcon />}
      </button>
    </div>
  );
}
