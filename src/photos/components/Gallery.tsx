import { useEffect, useMemo, useState } from "react";
import { getWorks, getCategoryIds } from "../data/works";
import { categoryById } from "../data/categories";
import { WorkCard } from "./WorkCard";
import { usePhotosPrefs } from "../lib/prefs";
import { ui, estYear, countImages, catLabelOf } from "../lib/i18n";
import { mainSiteHref } from "../lib/asset";

const ALL = "ALL";

function CountUp({ target }: { target: number }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setV(target);
      return;
    }
    const t0 = performance.now();
    const dur = 800;
    const ease = (p: number) => 1 - Math.pow(1 - p, 3);
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min((now - t0) / dur, 1);
      setV(Math.round(ease(p) * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return <b>{v}</b>;
}

export function Gallery() {
  const { lang } = usePhotosPrefs();
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
      <section className="gallery-hero">
        <p className="overline">{t.overline(estYear(works))}</p>
        <h1 className="gallery-hero__title">{t.title}</h1>
        <div className="hero-row">
          <p className="lede">{t.lede}</p>
          <a className="home-btn" href={mainSiteHref()}>
            {t.mainSite} <span aria-hidden>↗</span>
          </a>
        </div>
        <div className="hero-meta">
          <div className="meta-item">
            <CountUp target={works.length} />
            <span className="mono">{t.metaWorks}</span>
          </div>
          <div className="meta-item">
            <CountUp target={catCount} />
            <span className="mono">{t.metaCategories}</span>
          </div>
          <div className="meta-item">
            <CountUp target={imgCount} />
            <span className="mono">{t.metaImages}</span>
          </div>
        </div>
        <div className="filter-bar" role="tablist" aria-label={t.filterAria}>
          <button
            type="button"
            role="tab"
            aria-selected={active === ALL}
            className={`filter-chip ${active === ALL ? "is-active" : ""}`}
            onClick={() => setActive(ALL)}
          >
            <span>{t.all}</span>
            <span className="chip-count">{counts[ALL]}</span>
          </button>
          {orderedIds.map((id) => {
            const cat = categoryById[id];
            return (
              <button
                type="button"
                key={id}
                role="tab"
                aria-selected={active === id}
                className={`filter-chip ${active === id ? "is-active" : ""}`}
                onClick={() => setActive(id)}
              >
                <span>{catLabelOf(cat, id, lang)}</span>
                <span className="chip-count">{counts[id] ?? 0}</span>
              </button>
            );
          })}
        </div>
      </section>
      <hr className="hairline" />
      {filtered.length === 0 ? (
        <p className="gallery-empty">{t.empty}</p>
      ) : (
        <div className="gallery-grid" key={active}>
          {filtered.map((w, i) => (
            <WorkCard key={w.slug} work={w} index={i} />
          ))}
        </div>
      )}
    </>
  );
}
