import { usePrefs } from "../../shared/prefs-react";
import { ui } from "../lib/i18n";
import { mainSiteHref } from "../lib/asset";

/* The gallery's own closing line — thin glass, same corners as the cards.
   Carries the rights notice for the photographs: every original has a blind
   watermark, which is the one thing a visitor should leave knowing. */
export function Footer() {
  const { lang } = usePrefs();
  const t = ui[lang];
  return (
    <footer className="site-footer shell shell--photos">
      <div className="foot-panel glass-bar sq-xl">
        <p className="foot-copy">
          © {new Date().getFullYear()} Eververdants · {t.brand}
        </p>
        <p className="foot-note">
          <span className="ring-mark" aria-hidden="true" />
          {t.watermark}
        </p>
        <a className="foot-back" href={mainSiteHref()}>
          {t.mainSite} <span aria-hidden="true">↗</span>
        </a>
      </div>
    </footer>
  );
}
