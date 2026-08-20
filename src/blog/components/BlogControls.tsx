import type { MouseEvent } from "react";
import { useBlogPrefs } from "../prefs";
import { themeFlip } from "../../effects/themePlain";

/* Floating preference controls for the blog sub-site — top-right, above
   everything (z-60, under the site-nav overlay). A single quiet strip in
   the blog's own grammar: hairline border, field-tinted surface, tiny
   tracked caps. Nothing filled, nothing heavy:

   [ EN   中 ] │ ☀/☾

   - Language is a TYPOGRAPHIC pair — the active script is in full ink with
     a thin accent underline that glides between the two; the inactive one
     is faint. No thumb, no filled segment: just ink and a hairline.
   - Theme is a bare icon button whose glyph morphs with a springy rotate +
     scale as it flips (sun spins in for light, moon for dark).
   - Pressing the theme button just flips the palette with a plain colour
     transition (themePlain.ts) — the same quiet behaviour every sub-site
     now shares. No reveal animation. */

function SunIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="h-4 w-4"
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
      className="h-4 w-4"
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

/* Springy overshoot so the icons pop as they swap. */
const iconSwap =
  "absolute inset-0 grid place-items-center transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]";

export default function BlogControls() {
  const { lang, setLang, theme, setTheme } = useBlogPrefs();

  const onTheme = (_e: MouseEvent<HTMLButtonElement>) => {
    const next = theme === "light" ? "dark" : "light";
    themeFlip(() => setTheme(next));
  };

  return (
    <div className="fixed right-[clamp(14px,2.5vw,28px)] top-[clamp(14px,2.5vh,26px)] z-[60] flex items-center">
      <div className="flex items-center rounded-full border border-[var(--border)] bg-[var(--field)]/85 py-1 pl-1.5 pr-1.5 shadow-[0_1px_0_rgba(0,0,0,0.03),0_10px_30px_-18px_rgba(20,20,20,0.3)] backdrop-blur">
        {/* language — typographic pair; the active script gets a thin
            accent underline that slides between the two */}
        <div className="relative flex items-stretch">
          <span
            aria-hidden
            className="absolute bottom-[3px] left-0 h-[2px] w-8 rounded-full bg-[var(--accent)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ transform: `translateX(${lang === "zh" ? "100%" : "0"})` }}
          />
          <button
            type="button"
            onClick={() => setLang("en")}
            aria-pressed={lang === "en"}
            className={`relative z-[1] w-8 py-1.5 text-[10px] font-semibold tracking-[0.16em] transition-colors duration-300 ${
              lang === "en"
                ? "text-[var(--ink)]"
                : "text-[var(--faint)] hover:text-[var(--muted)]"
            }`}
            title="English"
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => setLang("zh")}
            aria-pressed={lang === "zh"}
            className={`relative z-[1] w-8 py-1.5 text-[10px] font-semibold tracking-[0.02em] transition-colors duration-300 ${
              lang === "zh"
                ? "text-[var(--ink)]"
                : "text-[var(--faint)] hover:text-[var(--muted)]"
            }`}
            title="中文"
          >
            中
          </button>
        </div>

        {/* divider */}
        <span
          aria-hidden
          className="mx-1.5 h-3.5 w-px self-center bg-[var(--border-strong)]"
        />

        {/* theme — the glyph morphs in place; the press flips the palette
            with a plain colour transition (themePlain.ts) */}
        <button
          type="button"
          onClick={onTheme}
          aria-label={
            theme === "light" ? "Switch to dark mode" : "切换到浅色模式"
          }
          title={theme === "light" ? "Dark" : "Light"}
          className="relative h-8 w-8 rounded-full text-[var(--muted)] transition-colors duration-300 hover:text-[var(--accent)] focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-1"
        >
          <span
            aria-hidden
            className={`${iconSwap} ${
              theme === "light"
                ? "rotate-0 scale-100 opacity-100"
                : "-rotate-[120deg] scale-50 opacity-0"
            }`}
          >
            <SunIcon />
          </span>
          <span
            aria-hidden
            className={`${iconSwap} ${
              theme === "dark"
                ? "rotate-0 scale-100 opacity-100"
                : "rotate-[120deg] scale-50 opacity-0"
            }`}
          >
            <MoonIcon />
          </span>
        </button>
      </div>
    </div>
  );
}
