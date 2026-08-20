import { usePhotosPrefs } from "../lib/prefs";
import { ui } from "../lib/i18n";
import { mainSiteHref } from "../lib/asset";

export function Footer() {
  const { lang } = usePhotosPrefs();
  const t = ui[lang];
  return (
    <footer className="site-footer">
      <span>© {new Date().getFullYear()} Eververdants · {t.brand}</span>
      <a className="f-back" href={mainSiteHref()}>
        {t.mainSite} ↗
      </a>
    </footer>
  );
}
