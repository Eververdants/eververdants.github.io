import type { CSSProperties } from "react";
import { getWorks, getWork } from "../data/works";
import { categoryById } from "../data/categories";
import { asset } from "../lib/asset";
import { fmtMonthYearLong } from "../lib/format";

const Row = ({ k, v }: { k: string; v?: string }) =>
  v ? (
    <div className="meta-row">
      <span className="m-key">{k}</span>
      <span className="m-val">{v}</span>
    </div>
  ) : null;

export function WorkDetail({ slug }: { slug: string }) {
  const work = getWork(slug);
  const all = getWorks();
  if (!work) return null; // App's hashchange guard redirects before this renders.

  const idx = all.findIndex((w) => w.slug === work.slug);
  const prev = idx > 0 ? all[idx - 1] : null;
  const next = idx >= 0 && idx < all.length - 1 ? all[idx + 1] : null;
  const cat = categoryById[work.category];
  const catLabel = cat?.label ?? work.category;
  const dateLong = fmtMonthYearLong(work.date);
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <article>
      <div className="detail-top fade-up">
        <span className="d-cat">{catLabel}</span>
        <span className="d-idx">{pad(idx + 1)} / {pad(all.length)}</span>
      </div>
      <h1 className="detail-title fade-up" style={{ animationDelay: "70ms" } as CSSProperties}>
        {work.title}
      </h1>
      {work.titleZh && (
        <p className="detail-title-zh fade-up" style={{ animationDelay: "140ms" } as CSSProperties} lang="zh-Hans">
          {work.titleZh}
        </p>
      )}
      <figure className="detail-hero fade-up" style={{ animationDelay: "210ms" } as CSSProperties}>
        <img src={asset(work.cover)} alt={work.title} />
      </figure>
      <div className="detail-body fade-up" style={{ animationDelay: "300ms" } as CSSProperties}>
        <div>
          {work.description && <p className="detail-description">{work.description}</p>}
          {work.descriptionZh && (
            <p className="detail-description" lang="zh-Hans">{work.descriptionZh}</p>
          )}
          {work.gallery && work.gallery.length > 0 && (
            <div className="detail-gallery">
              {work.gallery.map((g, i) => (
                <img key={i} src={asset(g)} alt={`${work.title} — ${i + 1}`} loading="lazy" decoding="async" />
              ))}
            </div>
          )}
        </div>
        <aside className="detail-meta" aria-label="Metadata">
          <Row k="Date" v={dateLong} />
          {work.location && (
            <Row
              k="Location"
              v={[work.location, work.locationZh].filter(Boolean).join(" · ")}
            />
          )}
          <Row k="Category" v={catLabel} />
          <Row k="Camera" v={work.camera} />
          <Row k="Lens" v={work.lens} />
          <Row k="Focal" v={work.focal} />
          <Row k="Aperture" v={work.aperture} />
          <Row k="Shutter" v={work.shutter} />
          <Row k="ISO" v={work.iso} />
        </aside>
      </div>
      <nav className="detail-nav" aria-label="Work navigation">
        {prev ? (
          <a href={`#/work/${prev.slug}`}>
            <span className="n-dir">← Previous</span>
            <span className="n-title">{prev.title}</span>
          </a>
        ) : (
          <span className="n-empty">— First entry</span>
        )}
        {next ? (
          <a href={`#/work/${next.slug}`}>
            <span className="n-dir">Next →</span>
            <span className="n-title">{next.title}</span>
          </a>
        ) : (
          <span className="n-empty">Latest entry —</span>
        )}
      </nav>
    </article>
  );
}
