import { useMemo, useState } from "react";
import { getWorks, getCategoryIds } from "../data/works";
import { categoryById } from "../data/categories";
import { WorkCard } from "./WorkCard";

const ALL = "ALL";

export function Gallery() {
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

  return (
    <>
      <section className="gallery-hero">
        <p className="overline">A photographic journal</p>
        <h1>Photographs</h1>
        <p className="lede">
          A small, slow collection — landscapes, architecture, and the rooms in between.
          Filed as it is made.
        </p>
        <div className="filter-bar" role="tablist" aria-label="Filter by category">
          <button
            type="button"
            role="tab"
            aria-selected={active === ALL}
            className={`filter-chip ${active === ALL ? "is-active" : ""}`}
            onClick={() => setActive(ALL)}
          >
            <span>All</span>
            <span className="chip-count">{counts[ALL]}</span>
          </button>
          {orderedIds.map((id) => {
            const cat = categoryById[id];
            const label = cat?.label ?? id;
            return (
              <button
                type="button"
                key={id}
                role="tab"
                aria-selected={active === id}
                className={`filter-chip ${active === id ? "is-active" : ""}`}
                onClick={() => setActive(id)}
              >
                <span>{label}</span>
                <span className="chip-count">{counts[id] ?? 0}</span>
              </button>
            );
          })}
        </div>
      </section>
      <hr className="hairline" />
      {filtered.length === 0 ? (
        <p className="gallery-empty">Nothing filed here yet</p>
      ) : (
        <div className="gallery-grid" key={active /* re-mount → fade replays on filter change */}>
          {filtered.map((w, i) => (
            <WorkCard key={w.slug} work={w} index={i} />
          ))}
        </div>
      )}
    </>
  );
}
