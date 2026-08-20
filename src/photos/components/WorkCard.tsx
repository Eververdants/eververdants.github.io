import type { CSSProperties } from "react";
import type { Work } from "../data/types";
import { asset } from "../lib/asset";
import { categoryById } from "../data/categories";
import { fmtMonthYearShort } from "../lib/format";

export function WorkCard({ work, index }: { work: Work; index: number }) {
  const cat = categoryById[work.category];
  const catLabel = cat?.label ?? work.category;
  return (
    <a
      className="work-card fade-up"
      href={`#/work/${work.slug}`}
      style={{ animationDelay: `${index * 70}ms` } as CSSProperties}
    >
      <div className="work-card-media">
        <img
          src={asset(work.cover)}
          alt={work.title}
          loading="lazy"
          decoding="async"
        />
        <div className="work-card-overlay" aria-hidden>
          <span className="o-cat">{catLabel}</span>
          <h3 className="o-title">{work.title}</h3>
          <span className="o-date">{fmtMonthYearShort(work.date)}</span>
        </div>
      </div>
      <div className="work-card-meta">
        <span className="m-cat">
          {catLabel}
          {work.featured && <span className="m-selected">· SELECTED</span>}
        </span>
        <span className="m-date">{fmtMonthYearShort(work.date)}</span>
      </div>
    </a>
  );
}
