import { useState } from "react";

type Theme = "light" | "dark";
const KEY = "photos-theme";

const current = (): Theme =>
  (document.documentElement.dataset.theme as Theme) || "light";

const apply = (t: Theme) => {
  document.documentElement.dataset.theme = t;
  try { localStorage.setItem(KEY, t); } catch {}
};

export function ThemeToggle() {
  const [t, setT] = useState<Theme>(current);
  const isDark = t === "dark";
  const onClick = () => {
    const next: Theme = current() === "dark" ? "light" : "dark";
    apply(next);
    setT(next);
  };
  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={onClick}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
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
