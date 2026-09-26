import { useMemo, useState } from "react";
import { getWorks, getCategoryIds } from "../data/works";
import { categoryById } from "../data/categories";
import { WorkCard } from "./WorkCard";
import { usePrefs } from "../../shared/prefs-react";
import { ui, estYear, countImages, catLabelOf } from "../lib/i18n";
import { mainSiteHref } from "../lib/asset";

const ALL = "ALL";

/* The hero counts are written as they are, not counted up: a number that
   animates is a number the prerendered page can bake half-way through, and a
   crawler reading dist/photos/index.html would be told there were two works. */
function Count({ target, label }: { target: number; label: string }) {
  return (
    <div className="meta-item">
      <b className="num">{target}</b>
      <span className="kicker">{label}</span>
    </div>
  );
}

export function Gallery() {
  const { lang } = usePrefs();
  const t = ui[lang];
  const works = getWorks();
  const usedIds = getCategoryIds();
  const orderedIds = useMemo(() => {
    const known = Object.keys(categoryById).filter((id) => usedIds.includes(id));
    const unknown = usedIds.filter((id) => !categoryById[id]);
    return [...known, ...unknown];
  }, [usedIds]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { [ALL]: works.length };
    for (const w of works) c[w.category] = (c[w.category] ?? 0) + 1;
    return c;
  }, [works]);

  const [active, setActive] = useState<string>(ALL);
  const filtered = active === ALL ? works : works.filter((w) => w.category === active);
  const catCount = orderedIds.length;
  const imgCount = countImages(works);

  return (
    <>
      <section
        className="gallery-hero glass-panel sq-xl glass-sheen rise"
        data-fx
      >
        <span className="ring-field" aria-hidden="true" />
        <p className="kicker">{t.overline(estYear(works))}</p>
        <div className="gallery-head">
          <span className="ring-mark" aria-hidden="true" />
          <h1 className="display gallery-title">{t.title}</h1>
        </div>
        <div className="hero-row">
          <p className="lede">{t.lede}</p>
          <a className="btn btn--ghost sq-md home-btn" href={mainSiteHref()}>
            {t.mainSite} <span aria-hidden="true">↗</span>
          </a>
        </div>
        <div className="hero-meta">
          <Count target={works.length} label={t.metaWorks} />
          <Count target={catCount} label={t.metaCategories} />
          <Count target={imgCount} label={t.metaImages} />
        </div>
        <div className="filter-bar glass-bar sq-lg" role="tablist" aria-label={t.filterAria}>
          <button
            type="button"
            role="tab"
            aria-selected={active === ALL}
            className={`filter-chip sq-sm ${active === ALL ? "is-active" : ""}`}
            onClick={() => setActive(ALL)}
          >
            <span>{t.all}</span>
            <span className="chip-count num">{counts[ALL]}</span>
          </button>
          {orderedIds.map((id) => {
            const cat = categoryById[id];
            return (
              <button
                type="button"
                key={id}
                role="tab"
                aria-selected={active === id}
                className={`filter-chip sq-sm ${active === id ? "is-active" : ""}`}
                onClick={() => setActive(id)}
              >
                <span>{catLabelOf(cat, id, lang)}</span>
                <span className="chip-count num">{counts[id] ?? 0}</span>
              </button>
            );
          })}
        </div>
      </section>
      <hr className="ring-rule" />
      {filtered.length === 0 ? (
        <p className="gallery-empty">{t.empty}</p>
      ) : (
        <div className="gallery-grid" key={active} data-fx>
          {filtered.map((w, i) => (
            <WorkCard key={w.slug} work={w} index={i} />
          ))}
        </div>
      )}
    </>
  );
}
