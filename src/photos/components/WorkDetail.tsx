import { getWorks, getWork } from "../data/works";
import { categoryById } from "../data/categories";
import { asset } from "../lib/asset";
import { fmtMonthYearLong } from "../lib/format";
import { usePrefs } from "../../shared/prefs-react";
import { ui, titleOf, subTitleOf, descOf, locOf, catLabelOf } from "../lib/i18n";

const workHref = (slug: string) => `/photos/work/${slug}/`;
const GALLERY = "/photos/";

const Row = ({ k, v }: { k: string; v?: string }) =>
  v ? (
    <div className="meta-row">
      <dt className="m-key">{k}</dt>
      <dd className="m-val">{v}</dd>
    </div>
  ) : null;

/* One photograph: caption, images, and a glass card of the frame's own
   metadata. Entrance is the shared `rise` keyframes, staggered by the
   .rise-N helpers — no choreography library. */
export function WorkDetail({ slug }: { slug: string }) {
  const { lang } = usePrefs();
  const t = ui[lang];
  const work = getWork(slug);
  const all = getWorks();
  if (!work) return null; // App's route guard redirects before this renders.

  const idx = all.findIndex((w) => w.slug === work.slug);
  const prev = idx > 0 ? all[idx - 1] : null;
  const next = idx >= 0 && idx < all.length - 1 ? all[idx + 1] : null;
  const cat = categoryById[work.category];
  const catLabel = catLabelOf(cat, work.category, lang);
  const dateLong = fmtMonthYearLong(work.date, lang);
  const sub = subTitleOf(work, lang);
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <article data-work-slug={work.slug}>
      <div className="detail-top rise">
        <span className="d-cat kicker">{catLabel}</span>
        <span className="d-idx num">
          {pad(idx + 1)} / {pad(all.length)}
        </span>
      </div>
      <h1 className="display detail-title rise rise-1">{titleOf(work, lang)}</h1>
      {sub && <p className="detail-title-sub rise rise-2">{sub}</p>}
      <figure className="detail-hero glass sq-xl rise rise-3">
        {/* The hero is the page's LCP: intrinsic dimensions reserve the box
           (no reflow) and fetchpriority bumps it ahead of the CSS/JS queue. */}
        <img
          src={asset(work.cover)}
          alt={titleOf(work, lang)}
          width={work.coverW}
          height={work.coverH}
          fetchpriority="high"
          decoding="async"
        />
      </figure>
      <div className="detail-body rise rise-4">
        <div className="detail-text">
          {descOf(work, lang) && (
            <p className="detail-description">{descOf(work, lang)}</p>
          )}
          {work.gallery && work.gallery.length > 0 && (
            <div className="detail-gallery">
              {work.gallery.map((g, i) => {
                const dim = work.galleryWH?.[i];
                return (
                  <img
                    key={i}
                    className="sq-lg"
                    src={asset(g)}
                    alt={`${titleOf(work, lang)} — ${i + 1}`}
                    width={dim?.w}
                    height={dim?.h}
                    loading="lazy"
                    decoding="async"
                  />
                );
              })}
            </div>
          )}
        </div>
        <aside className="detail-meta glass-panel sq-xl" aria-labelledby="photo-meta">
          <h2 id="photo-meta" className="detail-meta__head">
            <span className="ring-mark" aria-hidden="true" />
            <span className="kicker">{t.metaAria}</span>
          </h2>
          <dl className="detail-meta__rows">
            <Row k={t.metaDate} v={dateLong} />
            <Row k={t.metaLocation} v={locOf(work, lang)} />
            <Row k={t.metaCategory} v={catLabel} />
            <Row k={t.metaCamera} v={work.camera} />
            <Row k={t.metaLens} v={work.lens} />
            <Row k={t.metaFocal} v={work.focal} />
            <Row k={t.metaAperture} v={work.aperture} />
            <Row k={t.metaShutter} v={work.shutter} />
            <Row k={t.metaIso} v={work.iso} />
          </dl>
        </aside>
      </div>
      <nav className="detail-nav" aria-label={t.navAria}>
        {prev ? (
          <a href={workHref(prev.slug)}>
            <span className="n-dir kicker">{t.prev}</span>
            <span className="n-title">{titleOf(prev, lang)}</span>
          </a>
        ) : (
          <span className="n-empty">{t.first}</span>
        )}
        {next ? (
          <a href={workHref(next.slug)}>
            <span className="n-dir kicker">{t.next}</span>
            <span className="n-title">{titleOf(next, lang)}</span>
          </a>
        ) : (
          <span className="n-empty">{t.latest}</span>
        )}
      </nav>
      <nav className="detail-back" aria-label={t.backAria}>
        <a className="btn btn--ghost sq-md" href={GALLERY}>
          ← {t.brand}
        </a>
      </nav>
    </article>
  );
}
