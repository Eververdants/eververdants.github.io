import type { CSSProperties } from "react";
import type { Work } from "../data/types";
import { asset } from "../lib/asset";
import { categoryById } from "../data/categories";
import { fmtMonthYearShort } from "../lib/format";
import { usePhotosPrefs } from "../lib/prefs";
import { ui, titleOf, catLabelOf } from "../lib/i18n";

const workHref = (slug: string) => `/photos/work/${slug}/`;

export function WorkCard({ work, index }: { work: Work; index: number }) {
  const { lang } = usePhotosPrefs();
  const t = ui[lang];
  const cat = categoryById[work.category];
  const catLabel = catLabelOf(cat, work.category, lang);
  return (
    <a
      className="work-card fade-up"
      href={workHref(work.slug)}
      style={{ animationDelay: `${index * 70}ms` } as CSSProperties}
    >
      <div className="work-card-media">
        <img
          src={asset(work.cover)}
          alt={titleOf(work, lang)}
          loading="lazy"
          decoding="async"
        />
        <div className="work-card-overlay" aria-hidden>
          <span className="o-cat">{catLabel}</span>
          <h3 className="o-title">{titleOf(work, lang)}</h3>
          <span className="o-date">{fmtMonthYearShort(work.date, lang)}</span>
        </div>
      </div>
      <div className="work-card-meta">
        <span className="m-cat">
          {catLabel}
          {work.featured && (
            <span className="m-selected">· {t.selected}</span>
          )}
        </span>
        <span className="m-date">{fmtMonthYearShort(work.date, lang)}</span>
      </div>
    </a>
  );
}
