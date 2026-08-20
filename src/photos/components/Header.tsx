import { LangToggle } from "./LangToggle";
import { ThemeToggle } from "./ThemeToggle";
import { usePhotosPrefs } from "../lib/prefs";
import { ui } from "../lib/i18n";

const GALLERY = "/photos/";

export function Header() {
  const { lang } = usePhotosPrefs();
  const t = ui[lang];
  return (
    <header className="site-header">
      <a className="site-mark" href={GALLERY} aria-label={t.backGallery}>
        <span>{t.brand}</span>
        <span className="mark-dot" aria-hidden />
        <span className="mark-name">Eververdants</span>
      </a>
      <div className="header-controls">
        <LangToggle />
        <span className="controls-divider" aria-hidden />
        <ThemeToggle />
      </div>
    </header>
  );
}
