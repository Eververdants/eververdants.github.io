import { useEffect, useRef, useState, type CSSProperties } from "react";
import { journal, journalZh, topics, type JournalPost } from "../../data/journal";
import { getDeck, searchPosts } from "../../data/articles";
import { initBlogIndex } from "../../effects/animations/blogIndex";
import { ui, useBlogPrefs } from "../prefs";
import PostList from "./PostList";

/* Blog sub-site INDEX — the journal's 专题 (topic) directory + the full
   essay archive at /blog.

   Every topic is its own PAGE (/blog/topic/<id>, TopicScene) with its own
   hero screen, slogan and scrapbook collage — this index is the table of
   contents that leads there: one editorial row per topic (glyph, Fraunces
   name, slogan, post count · latest date, a mini taped color card) with a
   hairline between rows. Clicking a row opens the topic page in-app.

   Below the fold the whole journal runs as ALL POSTS (newest first, plain
   editorial rows — no cards): the directory gives the themed doors in,
   the list gives the archive. FIND (archive search) replaces both with a
   flat chronological results list; TAGS narrows the ALL POSTS list (the
   directory stays as is). Language and theme come from the blog prefs
   context; every color is a theme token (var(--x)), every label a ui
   dict entry. */

const byDateDesc = (a: JournalPost, b: JournalPost) =>
  b.date.localeCompare(a.date);

/* Topics that hold at least one post of the pool, newest post first (so
   the freshest feature leads the directory). */
function topicDirectory(pool: JournalPost[]) {
  return topics
    .map((topic) => ({
      topic,
      posts: pool
        .filter((p) => p.topics.includes(topic.id))
        .sort(byDateDesc),
    }))
    .filter((g) => g.posts.length > 0)
    .sort((a, b) => b.posts[0].date.localeCompare(a.posts[0].date));
}

export default function BlogIndexScene({
  onOpen,
  onOpenTopic,
}: {
  onOpen: (slug: string) => void;
  onOpenTopic: (id: string) => void;
}) {
  const { lang } = useBlogPrefs();
  const t = ui[lang];
  const j = lang === "zh" ? journalZh : journal;
  const deck = getDeck(lang);
  const directory = topicDirectory(deck);
  const tagOptions = Array.from(
    deck.reduce((m, p) => {
      p.tags.forEach((id, i) => {
        if (!m.has(id)) m.set(id, p.tagLabels[i] ?? id);
      });
      return m;
    }, new Map<string, string>()),
  ).map(([id, label]) => ({ id, label }));
  const [activeTag, setActiveTag] = useState<string | null>(() => {
    const q = new URLSearchParams(location.search).get("tag");
    return q && deck.some((p) => p.tags.includes(q)) ? q : null;
  });
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<JournalPost[] | null>(null);
  const terms = query.trim().split(/\s+/).filter(Boolean);
  const searching = terms.length > 0;

  /* Full-text search fetches its body index chunk on first query — deferred
     with a short debounce so typing never fires a request per keystroke. */
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

  const searched = searching ? (results ?? []) : deck;
  const tagFiltered = activeTag
    ? searched.filter((p) => p.tags.includes(activeTag))
    : searched;
  const rootRef = useRef<HTMLElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const kbdHint = /Mac|iPhone|iPad/.test(navigator.platform) ? "⌘K" : "CTRL K";

  /* Tag pills keep the ?tag= deep link in sync so a filtered view is
     shareable and survives refresh. */
  const pickTag = (tag: string | null) => {
    setActiveTag(tag);
    const u = new URL(location.href);
    if (tag) u.searchParams.set("tag", tag);
    else u.searchParams.delete("tag");
    history.replaceState(null, "", u.pathname + u.search);
  };

  /* The hero's entrance + scroll-hint exit are owned here. */
  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (rootRef.current) return initBlogIndex(rootRef.current, prefersReduced);
  }, []);

  /* ⌘K / Ctrl K jumps into the archive search from anywhere on the index. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const viewKey = `${activeTag ?? "all"}:${searching ? "search" : "browse"}:${lang}`;

  return (
    <section
      ref={rootRef}
      data-article
      className="relative z-[1]"
      style={{
        backgroundColor: "var(--bg)",
        backgroundImage:
          "linear-gradient(var(--grid) 1px, transparent 1px), linear-gradient(90deg, var(--grid) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }}
    >
      {/* ---- hero: full-screen, centered, milk-white grid ---- */}
      <div
        data-blog-hero
        className="relative flex h-screen h-dvh flex-col items-center justify-center px-[clamp(16px,4vw,40px)] text-center"
      >
        <p
          data-blog-in
          className="text-[11px] font-semibold tracking-[0.4em] text-[var(--fainter)]"
        >
          EVERVERDANTS
        </p>
        <h1
          data-blog-in
          className="mt-[clamp(16px,3vh,28px)] font-sans text-[clamp(48px,7vw,80px)] font-bold leading-[1.05] tracking-[-0.02em] text-[var(--ink)]"
        >
          BLOG
        </h1>
        <p
          data-blog-in
          className="mt-[clamp(20px,3.5vh,32px)] text-[clamp(14px,1.3vw,16px)] leading-[1.8] text-[var(--muted)]"
        >
          {j.cover.subtitle}
        </p>

        <a
          href="/"
          data-blog-in
          className="group mt-[clamp(40px,7vh,60px)] inline-flex items-center gap-2.5 rounded-full border border-[var(--border-strong)] px-[clamp(18px,2.4vw,28px)] py-[clamp(9px,1.4vh,14px)] text-[11px] font-medium tracking-[0.28em] text-[var(--muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
        >
          {t.visitMain}
          <span
            aria-hidden
            className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
          >
            ↗
          </span>
        </a>

        <div
          data-blog-hint
          className="absolute bottom-[clamp(22px,4.5vh,40px)] left-1/2 flex -translate-x-1/2 flex-col items-center gap-3"
          aria-hidden="true"
        >
          <span className="text-[10px] tracking-[0.42em] indent-[0.42em] text-[var(--faint)]">
            {t.scroll}
          </span>
          <span className="relative h-[46px] w-px overflow-hidden bg-[var(--border)]">
            <span className="absolute left-0 top-0 h-0 w-full animate-scroll-fill bg-[var(--accent)]" />
          </span>
        </div>
      </div>

      {/* ---- below the fold: FIND → TOPICS directory → TAGS ---- */}
      <div className="mx-auto max-w-[860px] px-[clamp(16px,4vw,40px)] pb-[clamp(80px,14vh,160px)]">
        {/* FIND — full-width archive search */}
        <div>
          <div className="flex items-center gap-3">
            <p className="shrink-0 text-[10px] font-semibold tracking-[0.34em] text-[var(--fainter)]">
              {t.find}
            </p>
            <span aria-hidden className="h-px flex-1 bg-[var(--border)]" />
            {searching && (
              <span className="shrink-0 text-[10px] tabular-nums tracking-[0.3em] text-[var(--accent)]">
                {results === null ? "…" : t.result(tagFiltered.length)}
              </span>
            )}
          </div>
          <div className="relative mt-3">
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              className="pointer-events-none absolute left-[18px] top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[var(--faint)]"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <circle cx="11" cy="11" r="7" />
              <line x1="16.5" y1="16.5" x2="21" y2="21" />
            </svg>
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              aria-label={t.searchLabel}
              spellCheck={false}
              className="w-full rounded-full border border-[var(--border)] bg-[var(--field)] py-3 pl-12 pr-16 text-[13px] tracking-[0.12em] text-[var(--ink)] outline-none transition-all placeholder:text-[var(--faintest)] focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_var(--accent-soft)]"
            />
            {query ? (
              <button
                onClick={() => setQuery("")}
                aria-label={t.clearSearch}
                className="absolute right-3 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full text-[var(--faint)] transition-colors hover:bg-[var(--chip)] hover:text-[var(--ink)]"
              >
                <span aria-hidden className="block text-[12px] leading-none">
                  ✕
                </span>
              </button>
            ) : (
              <kbd className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 rounded-md border border-[var(--border-strong)] bg-[var(--chip)] px-1.5 py-[3px] text-[9px] font-medium tracking-[0.14em] text-[var(--fainter)]">
                {kbdHint}
              </kbd>
            )}
          </div>
        </div>

        {/* TAGS — cross-cutting filter; activating one narrows the ALL
            POSTS list below (the topic directory stays as is) */}
        {tagOptions.length > 0 && (
          <div className="mt-[clamp(36px,6vh,56px)]">
            <div className="flex items-center gap-3">
              <p className="shrink-0 text-[10px] font-semibold tracking-[0.34em] text-[var(--fainter)]">
                {t.tags}
              </p>
              <span aria-hidden className="h-px flex-1 bg-[var(--border)]" />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                onClick={() => pickTag(null)}
                className={`rounded-full border px-3 py-1 text-[9px] font-medium tracking-[0.2em] transition-colors ${
                  activeTag === null
                    ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                    : "border-[var(--border)] text-[var(--faint)] hover:border-[var(--border-strong)] hover:text-[var(--muted)]"
                }`}
              >
                {t.all}
              </button>
              {tagOptions.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => pickTag(activeTag === id ? null : id)}
                  className={`rounded-full border px-3 py-1 text-[9px] font-medium tracking-[0.2em] transition-colors ${
                    activeTag === id
                      ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                      : "border-[var(--border)] text-[var(--faint)] hover:border-[var(--border-strong)] hover:text-[var(--muted)]"
                  }`}
                >
                  {label.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* TOPICS — the editorial directory: one compact entry per topic
            page, four across on desktop (two on mobile). Always shown
            while browsing (a tag filter narrows the ALL POSTS list
            below, never the directory). Hidden while searching. */}
        {!searching && directory.length > 0 && (
          <div className="mt-[clamp(36px,6vh,56px)]">
            <div className="flex items-center gap-3">
              <p className="shrink-0 text-[10px] font-semibold tracking-[0.34em] text-[var(--fainter)]">
                {t.topics}
              </p>
              <span aria-hidden className="h-px flex-1 bg-[var(--border)]" />
            </div>
            <div className="mt-[clamp(8px,1.5vh,14px)] grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {directory.map((g) => (
                <button
                  key={g.topic.id}
                  onClick={() => onOpenTopic(g.topic.id)}
                  className="group flex min-h-[clamp(96px,13vh,118px)] flex-col gap-3 border border-[var(--border-faint)] bg-[var(--card-bg)] p-[clamp(14px,1.8vw,20px)] text-left shadow-[var(--card-shadow)] transition-all duration-300 hover:-translate-y-[1px] hover:border-[color-mix(in_srgb,var(--topic)_55%,var(--border-strong))] hover:shadow-[var(--card-shadow-hover)] focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2"
                  style={{ "--topic": g.topic.color } as CSSProperties}
                >
                  {/* top row — colour dot · glyph · post count */}
                  <span className="flex items-center justify-between text-[9.5px] tracking-[0.2em] text-[var(--fainter)]">
                    <span className="flex items-center gap-1.5">
                      <span
                        aria-hidden
                        className="h-[7px] w-[7px] rounded-full"
                        style={{ backgroundColor: g.topic.color, opacity: 0.8 }}
                      />
                      <span>{g.topic.symbol}</span>
                    </span>
                    <span className="tabular-nums">
                      {String(g.posts.length).padStart(2, "0")}
                    </span>
                  </span>

                  {/* the topic name */}
                  <span className="font-fraunces font-medium italic leading-none tracking-[-0.01em] text-[var(--ink)] text-[clamp(19px,1.9vw,24px)] transition-colors group-hover:text-[var(--accent)]">
                    {g.topic.name[lang]}
                  </span>

                  {/* bottom row — accent tick · arrow */}
                  <span className="mt-auto flex items-center justify-between">
                    <span
                      aria-hidden
                      className="h-[3px] w-8 rounded-full"
                      style={{
                        backgroundColor:
                          "color-mix(in srgb, var(--topic) 55%, var(--border))",
                      }}
                    />
                    <span
                      aria-hidden
                      className="text-[12px] text-[var(--fainter)] transition-all duration-300 group-hover:translate-x-1 group-hover:text-[var(--accent)]"
                    >
                      →
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* content — re-keyed to replay the staggered entrance */}
        <div key={viewKey}>
          {searching ? (
            /* search mode — a flat chronological list of hits */
            <div className="mt-[clamp(36px,6vh,56px)]">
              <div className="flex items-center gap-3">
                <p className="shrink-0 text-[10px] font-semibold tracking-[0.34em] text-[var(--fainter)]">
                  {t.find}
                </p>
                <span aria-hidden className="h-px flex-1 bg-[var(--border)]" />
                <span className="shrink-0 text-[10px] tabular-nums tracking-[0.3em] text-[var(--accent)]">
                  {results === null ? "…" : t.result(tagFiltered.length)}
                </span>
              </div>
              {results === null ? (
                <p className="py-[clamp(48px,8vh,96px)] text-center text-[13px] tracking-[0.2em] text-[var(--faint)]">
                  …
                </p>
              ) : tagFiltered.length === 0 ? (
                <p className="py-[clamp(48px,8vh,96px)] text-center text-[13px] tracking-[0.2em] text-[var(--faint)]">
                  {t.noMatch}
                </p>
              ) : (
                <PostList
                  posts={[...tagFiltered].sort(byDateDesc)}
                  terms={terms}
                  onOpen={onOpen}
                  className="mt-[clamp(20px,3vh,28px)]"
                />
              )}
            </div>
          ) : (
            /* ALL POSTS — the whole journal, newest first. A tag filter
                narrows this list (the directory above stays as is). */
            <div className="mt-[clamp(36px,6vh,56px)]">
              <div className="flex items-center gap-3">
                <p className="shrink-0 text-[10px] font-semibold tracking-[0.34em] text-[var(--fainter)]">
                  {t.allPosts}
                </p>
                <span aria-hidden className="h-px flex-1 bg-[var(--border)]" />
                <span className="shrink-0 text-[10px] tabular-nums tracking-[0.3em] text-[var(--accent)]">
                  {activeTag
                    ? `${(tagOptions.find((o) => o.id === activeTag)?.label ?? "").toUpperCase()} · `
                    : ""}
                  {t.result(tagFiltered.length)}
                </span>
              </div>
              {tagFiltered.length === 0 ? (
                <p className="py-[clamp(48px,8vh,96px)] text-center text-[13px] tracking-[0.2em] text-[var(--faint)]">
                  {activeTag ? t.noTag : t.noSection}
                </p>
              ) : (
                <PostList
                  posts={[...tagFiltered].sort(byDateDesc)}
                  terms={terms}
                  onOpen={onOpen}
                  className="mt-[clamp(20px,3vh,28px)]"
                />
              )}
            </div>
          )}

          <p className="mt-[clamp(48px,8vh,96px)] text-center text-[11px] tracking-[0.3em] text-[var(--faintest)]">
            © {j.close.year} EVERVERDANTS
          </p>
        </div>
      </div>
    </section>
  );
}
