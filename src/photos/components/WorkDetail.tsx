import type { CSSProperties } from "react";
import { getWorks, getWork } from "../data/works";
import { categoryById } from "../data/categories";
import { asset } from "../lib/asset";
import { fmtMonthYearLong } from "../lib/format";
import { usePhotosPrefs } from "../lib/prefs";
import { ui, titleOf, subTitleOf, descOf, locOf, catLabelOf } from "../lib/i18n";

const workHref = (slug: string) => `/photos/work/${slug}/`;
const GALLERY = "/photos/";

const Row = ({ k, v }: { k: string; v?: string }) =>
  v ? (
    <div className="meta-row">
      <span className="m-key">{k}</span>
      <span className="m-val">{v}</span>
    </div>
  ) : null;

export function WorkDetail({ slug }: { slug: string }) {
  const { lang } = usePhotosPrefs();
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
      <div className="detail-top fade-up">
        <span className="d-cat">{catLabel}</span>
        <span className="d-idx">
          {pad(idx + 1)} / {pad(all.length)}
        </span>
      </div>
      <h1 className="detail-title fade-up" style={{ animationDelay: "70ms" } as CSSProperties}>
        {titleOf(work, lang)}
      </h1>
      {sub && (
        <p className="detail-title-sub fade-up" style={{ animationDelay: "140ms" } as CSSProperties}>
          {sub}
        </p>
      )}
      <figure className="detail-hero fade-up" style={{ animationDelay: "210ms" } as CSSProperties}>
        <img src={asset(work.cover)} alt={titleOf(work, lang)} />
      </figure>
      <div className="detail-body fade-up" style={{ animationDelay: "300ms" } as CSSProperties}>
        <div>
          {descOf(work, lang) && (
            <p className="detail-description">{descOf(work, lang)}</p>
          )}
          {work.gallery && work.gallery.length > 0 && (
            <div className="detail-gallery">
              {work.gallery.map((g, i) => (
                <img
                  key={i}
                  src={asset(g)}
                  alt={`${titleOf(work, lang)} — ${i + 1}`}
                  loading="lazy"
                  decoding="async"
                />
              ))}
            </div>
          )}
        </div>
        <aside className="detail-meta" aria-label="Metadata">
          <Row k={t.metaDate} v={dateLong} />
          <Row k={t.metaLocation} v={locOf(work, lang)} />
          <Row k={t.metaCategory} v={catLabel} />
          <Row k={t.metaCamera} v={work.camera} />
          <Row k={t.metaLens} v={work.lens} />
          <Row k={t.metaFocal} v={work.focal} />
          <Row k={t.metaAperture} v={work.aperture} />
          <Row k={t.metaShutter} v={work.shutter} />
          <Row k={t.metaIso} v={work.iso} />
        </aside>
      </div>
      <nav className="detail-nav" aria-label="Work navigation">
        {prev ? (
          <a href={workHref(prev.slug)}>
            <span className="n-dir">{t.prev}</span>
            <span className="n-title">{titleOf(prev, lang)}</span>
          </a>
        ) : (
          <span className="n-empty">{t.first}</span>
        )}
        {next ? (
          <a href={workHref(next.slug)}>
            <span className="n-dir">{t.next}</span>
            <span className="n-title">{titleOf(next, lang)}</span>
          </a>
        ) : (
          <span className="n-empty">{t.latest}</span>
        )}
      </nav>
      <nav className="detail-back" aria-label="Back to gallery">
        <a href={GALLERY}>← {t.brand}</a>
      </nav>
    </article>
  );
}
