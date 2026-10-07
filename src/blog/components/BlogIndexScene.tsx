import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { journal, journalZh, topics, type JournalPost } from "../../data/journal";
import { sections } from "../../data/sections";
import { getDeck, searchPosts } from "../../data/articles";
import { usePrefs } from "../../shared/prefs-react";
import { pick } from "../../shared/prefs";
import { applyHead, breadcrumbLd, websiteLd, SITE } from "../../shared/seo";
import { ui } from "../copy";
import { articlePath, isPlainClick } from "../urls";
import PostList from "./PostList";

/* Blog index — the archive at /blog.

   The previous version opened on a full-viewport masthead and a directory of
   专题 bands with scrapbook collages, and put the actual list of essays
   below the fold. This one leads with the essays: search, a column filter, a
   tag filter, then the archive grouped by column. Topics stay reachable as a
   compact row of links.

   Search still defers its body index to a dynamic import, so the ~100 kB of
   full text only ships once someone actually types a query. */

const byDateDesc = (a: JournalPost, b: JournalPost) =>
  b.date.localeCompare(a.date);

export default function BlogIndexScene({
  onOpen,
  onOpenTopic,
}: {
  onOpen: (slug: string) => void;
  onOpenTopic: (id: string) => void;
}) {
  const { lang } = usePrefs();
  const t = ui[lang];
  const j = lang === "zh" ? journalZh : journal;
  const deck = useMemo(() => getDeck(lang), [lang]);

  const tagOptions = useMemo(
    () =>
      Array.from(
        deck.reduce((m, p) => {
          p.tags.forEach((id, i) => {
            if (!m.has(id)) m.set(id, p.tagLabels[i] ?? id);
          });
          return m;
        }, new Map<string, string>()),
      ).map(([id, label]) => ({ id, label })),
    [deck],
  );

  const topicGroups = useMemo(
    () =>
      topics
        .map((topic) => ({
          topic,
          count: deck.filter((p) => p.topics.includes(topic.id)).length,
        }))
        .filter((g) => g.count > 0),
    [deck],
  );

  const liveSections = useMemo(
    () => sections.filter((s) => deck.some((p) => p.sectionId === s.id)),
    [deck],
  );

  const readParam = (key: string) =>
    new URLSearchParams(location.search).get(key);

  const [activeTag, setActiveTag] = useState<string | null>(() => {
    const q = readParam("tag");
    return q && deck.some((p) => p.tags.includes(q)) ? q : null;
  });
  const [activeSection, setActiveSection] = useState<string | null>(() => {
    const q = readParam("section");
    return q && sections.some((s) => s.id === q) ? q : null;
  });
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<JournalPost[] | null>(null);
  const terms = query.trim().split(/\s+/).filter(Boolean);
  const searching = terms.length > 0;
  const searchRef = useRef<HTMLInputElement>(null);

  /* Full-text search pulls its body-index chunk on first query, debounced so
     typing does not fire a request per keystroke. */
  useEffect(() => {
    if (!searching) {
      setResults(null);
      return;
    }
    let alive = true;
    const timer = window.setTimeout(() => {
      searchPosts(query.trim(), lang).then((r) => {
        if (alive) setResults(r);
      });
    }, 180);
    return () => {
      window.clearTimeout(timer);
      alive = false;
    };
  }, [query, lang, searching]);

  /* Filters live in the query string, so a narrowed archive is shareable and
     survives a refresh. */
  const syncParam = (key: string, value: string | null) => {
    const u = new URL(location.href);
    if (value) u.searchParams.set(key, value);
    else u.searchParams.delete(key);
    history.replaceState(null, "", u.pathname + u.search);
  };

  const pool = searching ? (results ?? []) : deck;
  const tagged = activeTag
    ? pool.filter((p) => p.tags.includes(activeTag))
    : pool;
  const visible = useMemo(
    () =>
      (activeSection
        ? tagged.filter((p) => p.sectionId === activeSection)
        : tagged
      )
        .slice()
        .sort(byDateDesc),
    [tagged, activeSection],
  );

  /* Grouped by column only while browsing the whole archive — a search or a
     single-column filter is already one flat answer. */
  const grouped =
    !searching && !activeSection
      ? liveSections.map((section) => ({
          section,
          posts: visible.filter((p) => p.sectionId === section.id),
        }))
      : null;
  const unfiled = grouped
    ? visible.filter((p) => !liveSections.some((s) => s.id === p.sectionId))
    : [];

  useEffect(() => {
    applyHead({
      title: `${pick(lang, "Blog", "博客")} — Eververdants`,
      description:
        j.cover.subtitle ||
        pick(
          lang,
          "Essays, notes and field records by Eververdants.",
          "Eververdants 的随笔、札记与田野手记。",
        ),
      path: "/blog/",
      ogType: "website",
      locale: lang === "zh" ? "zh_CN" : "en_US",
      lang,
      jsonLd: [
        {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: `${pick(lang, "Blog", "博客")} — Eververdants`,
          url: `${SITE}/blog/`,
          inLanguage: ["en", "zh-Hans"],
          isPartOf: {
            "@type": "WebSite",
            name: "Eververdants",
            url: `${SITE}/`,
          },
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: deck.length,
            itemListElement: deck.map((p, i) => ({
              "@type": "ListItem",
              position: i + 1,
              url: `${SITE}${articlePath(p.slug, lang)}`,
              name: p.title.split("\n").join(" "),
            })),
          },
        },
        websiteLd(),
        breadcrumbLd([
          { name: "Eververdants", path: "/" },
          { name: pick(lang, "Blog", "博客"), path: "/blog/" },
        ]),
      ],
    });
  }, [lang, deck, j.cover.subtitle]);

  /* ⌘K / Ctrl K belongs to the site-wide palette everywhere, including here —
     binding it to this box too would make the same keystroke mean two things.
     The archive box stays reachable by clicking it, and searches essay bodies,
     which the palette does not. */

  const chip = (on: boolean) => `filter-chip sq-sm${on ? " filter-chip--on" : ""}`;

  return (
    <section data-article className="blog-index">
      <header className="blog-index__head rise" data-fx>
        <span className="ring-mark" aria-hidden="true" />
        <h1 className="display blog-index__title">
          {pick(lang, "Blog", "博客")}
        </h1>
        <p className="lede blog-index__sub">
          {j.cover.subtitle}
          <span className="blog-index__count num">
            {deck.length} {t.posts}
          </span>
        </p>
      </header>

      {/* ---------- controls ---------- */}
      <div
        className="blog-index__controls glass sq-lg rise rise-1"
        data-fx
        style={{ "--fx-delay": "60ms" } as CSSProperties}
      >
        <div className="blog-index__search">
          <label className="visually-hidden" htmlFor="blog-search">
            {t.searchLabel}
          </label>
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          >
            <circle cx="11" cy="11" r="7" />
            <line x1="16.5" y1="16.5" x2="21" y2="21" />
          </svg>
          <input
            id="blog-search"
            ref={searchRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            autoComplete="off"
            spellCheck={false}
          />
          {query ? (
            <button
              type="button"
              className="blog-index__clear"
              onClick={() => setQuery("")}
              aria-label={t.clearSearch}
            >
              ✕
            </button>
          ) : (
            <kbd>Ctrl K</kbd>
          )}
        </div>

        {liveSections.length > 1 && (
          <div className="blog-index__filters" role="group" aria-label={t.columns}>
            <button
              type="button"
              className={chip(!activeSection)}
              aria-pressed={!activeSection}
              onClick={() => {
                setActiveSection(null);
                syncParam("section", null);
              }}
            >
              {t.all}
            </button>
            {liveSections.map((s) => (
              <button
                key={s.id}
                type="button"
                className={chip(activeSection === s.id)}
                aria-pressed={activeSection === s.id}
                onClick={() => {
                  const next = activeSection === s.id ? null : s.id;
                  setActiveSection(next);
                  syncParam("section", next);
                }}
              >
                {s.name[lang]}
              </button>
            ))}
          </div>
        )}

        {tagOptions.length > 0 && (
          <div className="blog-index__filters" role="group" aria-label={t.tags}>
            {tagOptions.map((tag) => (
              <button
                key={tag.id}
                type="button"
                className={chip(activeTag === tag.id)}
                aria-pressed={activeTag === tag.id}
                onClick={() => {
                  const next = activeTag === tag.id ? null : tag.id;
                  setActiveTag(next);
                  syncParam("tag", next);
                }}
              >
                {tag.label}
              </button>
            ))}
          </div>
        )}

        {(searching || activeTag || activeSection) && (
          <p className="blog-index__showing" aria-live="polite">
            {searching && results === null
              ? t.loading
              : t.result(visible.length)}
            {activeTag &&
              ` · ${tagOptions.find((o) => o.id === activeTag)?.label ?? ""}`}
            {activeSection &&
              ` · ${liveSections.find((s) => s.id === activeSection)?.name[lang] ?? ""}`}
          </p>
        )}
      </div>

      {/* ---------- archive ---------- */}
      {visible.length === 0 ? (
        <p className="blog-index__empty">
          {searching ? t.noMatch : activeTag ? t.noTag : t.empty}
        </p>
      ) : grouped ? (
        <div
        className="blog-index__groups"
        data-fx
        style={{ "--fx-delay": "120ms" } as CSSProperties}
      >
          {grouped.map(({ section, posts }) => (
            <section key={section.id} className="blog-index__group">
              <h2 className="blog-index__group-title">
                <span aria-hidden="true">{section.symbol}</span>
                {section.name[lang]}
                <span className="num">{posts.length}</span>
              </h2>
              <p className="blog-index__group-sub">{section.tagline[lang]}</p>
              <PostList posts={posts} terms={terms} onOpen={onOpen} />
            </section>
          ))}
          {unfiled.length > 0 && (
            <section className="blog-index__group">
              <h2 className="blog-index__group-title">
                {pick(lang, "Unfiled", "未归类")}
                <span className="num">{unfiled.length}</span>
              </h2>
              <PostList posts={unfiled} terms={terms} onOpen={onOpen} />
            </section>
          )}
        </div>
      ) : (
        <PostList posts={visible} terms={terms} onOpen={onOpen} />
      )}

      {/* ---------- topics ---------- */}
      {topicGroups.length > 0 && !searching && (
        <nav className="blog-index__topics rise rise-2" aria-label={t.topics}>
          <h2 className="kicker">{t.topics}</h2>
          <ul>
            {topicGroups.map(({ topic, count }) => (
              <li key={topic.id}>
                <a
                  className="blog-index__topic sq-md"
                  href={`/blog/topic/${topic.id}`}
                  onClick={(e) => {
                    if (!isPlainClick(e)) return;
                    e.preventDefault();
                    onOpenTopic(topic.id);
                  }}
                >
                  <span aria-hidden="true" style={{ color: topic.color }}>
                    {topic.symbol}
                  </span>
                  <span className="blog-index__topic-name">
                    {topic.name[lang]}
                  </span>
                  <span className="num">{count}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <footer className="blog-index__foot">
        <a href="/">{t.backToHub}</a>
        <a href="/rss.xml">RSS</a>
        <span className="num">© {j.close.year} Eververdants</span>
      </footer>
    </section>
  );
}
