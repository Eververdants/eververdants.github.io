import { useEffect, useRef, useState } from "react";
import { journal, journalZh, type JournalPost } from "../../data/journal";
import { sections, type BlogSection } from "../../data/sections";
import { getDeck, searchPosts } from "../../data/articles";
import { initBlogIndex } from "../../effects/animations/blogIndex";
import { ui, useBlogPrefs } from "../prefs";
import Highlight from "./Highlight";

/* Blog sub-site — the full essay list at /blog, filed by COLUMN (the
   editorial sections from data/sections.ts), browsable, searchable and
   filterable by tag. Opens with a full-screen hero on the milk-white grid
   (centered BLOG masthead with a mount entrance), then scrolls into the
   functional list.

   The list is grouped by section: each column gets an editorial header —
   a Fraunces italic title, an accent glyph, a running folio number and a
   one-line manifesto — followed by its essays. The column switcher above
   the fold narrows the view to a single column (ALL regroups everything);
   search and tag filters combine with it via AND. Switching columns, tags
   or language re-keys the list so every group rises in with a staggered
   fade (animate-fade-up). Deliberately light against the main site's
   cinematic selected-blog. Language and theme come from the blog prefs
   context; every color is a theme token (var(--x)), every label a ui dict
   entry. */

export default function BlogIndexScene({
  onOpen,
}: {
  onOpen: (slug: string) => void;
}) {
  const { lang } = useBlogPrefs();
  const t = ui[lang];
  const j = lang === "zh" ? journalZh : journal;
  /* deck is hoisted above the tag state: the deep-link initializer below
     validates ?tag= against the deck's real tag ids. */
  const deck = getDeck(lang);
  /* Tag pills pair a language-independent id with the current language's
     label (articles.ts: English tag strings are the ids, translations
     provide the labels). Filtering keys on id, display on label. */
  const tagOptions = Array.from(
    deck.reduce((m, p) => {
      p.tags.forEach((id, i) => {
        if (!m.has(id)) m.set(id, p.tagLabels[i] ?? id);
      });
      return m;
    }, new Map<string, string>()),
  ).map(([id, label]) => ({ id, label }));
  const [activeSection, setActiveSection] = useState<string | null>(null);
  /* Deep-link support: /blog?tag=<id> opens the index with that tag
     already filtered (the article footer's tag pills link here). The id is
     language-independent, so the same URL filters in both languages. */
  const [activeTag, setActiveTag] = useState<string | null>(() => {
    const q = new URLSearchParams(location.search).get("tag");
    return q && deck.some((p) => p.tags.includes(q)) ? q : null;
  });
  const [query, setQuery] = useState("");
  const terms = query.trim().split(/\s+/).filter(Boolean);
  const searching = terms.length > 0;
  const searched = searching ? searchPosts(query.trim(), lang) : deck;
  const tagFiltered = activeTag
    ? searched.filter((p) => p.tags.includes(activeTag))
    : searched;

  /* The stable, language-independent section key resolved at parse time
     (articles.ts sectionIdOf). Grouping never re-matches the localized
     category against the reader's current UI language, so switching EN/中
     cannot re-file or drop posts. */
  const sectionOf = (post: JournalPost): string | null => post.sectionId;

  /* Tag pills keep the ?tag= deep link in sync so a filtered view is
     shareable and survives refresh. */
  const pickTag = (tag: string | null) => {
    setActiveTag(tag);
    const u = new URL(location.href);
    if (tag) u.searchParams.set("tag", tag);
    else u.searchParams.delete("tag");
    history.replaceState(null, "", u.pathname + u.search);
  };

  /* Columns are always shown in the curated directory order, each carrying
     its own (filtered) posts; empty columns drop out entirely. */
  const groups = sections
    .map((section, i) => ({
      section,
      index: i,
      posts: tagFiltered.filter((p) => sectionOf(p) === section.id),
    }))
    .filter((g) => g.posts.length > 0);

  const viewGroups = activeSection
    ? groups.filter((g) => g.section.id === activeSection)
    : groups;
  const empty = viewGroups.length === 0;
  const rootRef = useRef<HTMLElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const kbdHint = /Mac|iPhone|iPad/.test(navigator.platform) ? "⌘K" : "CTRL K";

  /* The hero's entrance + scroll-hint exit are owned here, not the global
     coordinator: this scene mounts after App init, so initGsap already ran
     for the main site. Scoped to this section, reverted on unmount. */
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

  /* Re-keying the list container replays the staggered entrance on every
     section/tag/search-mode/language change — a cheap, dependency-free
     swap. The query text itself is deliberately left out so typing inside
     a search re-filters in place instead of flashing the list. */
  const viewKey = `${activeSection ?? "all"}:${activeTag ?? "all"}:${
    searching ? "search" : "browse"
  }:${lang}`;

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

        {/* back to the main site — a real link so the shared site-nav
            interceptor can cover the swap with the LOADING overlay */}
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

        {/* scroll hint — fades out as the hero leaves the first viewport */}
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

      {/* ---- below the fold: FIND → COLUMNS → TAGS → grouped list ----
         Search leads as the first tool (goal-driven: "find something");
         the columns and tags follow as the browse structure. Each zone gets
         its own editorial overline so nothing floats between two pill rows. */}
      <div className="mx-auto max-w-[860px] px-[clamp(16px,4vw,40px)] pb-[clamp(80px,14vh,160px)]">
        {/* FIND — full-width archive search; the live result count sits in
            the overline row, updating without re-keying the list */}
        <div>
          <div className="flex items-center gap-3">
            <p className="shrink-0 text-[10px] font-semibold tracking-[0.34em] text-[var(--fainter)]">
              {t.find}
            </p>
            <span aria-hidden className="h-px flex-1 bg-[var(--border)]" />
            {searching && (
              <span className="shrink-0 text-[10px] tabular-nums tracking-[0.3em] text-[var(--accent)]">
                {t.result(tagFiltered.length)}
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

        {/* COLUMNS — the journal's filing system */}
        <div className="mt-[clamp(36px,6vh,56px)]">
          <div className="flex items-center gap-3">
            <p className="shrink-0 text-[10px] font-semibold tracking-[0.34em] text-[var(--fainter)]">
              {t.columns}
            </p>
            <span aria-hidden className="h-px flex-1 bg-[var(--border)]" />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => setActiveSection(null)}
              aria-pressed={activeSection === null}
              className={`inline-flex items-baseline gap-2 rounded-full border px-[14px] py-[7px] text-[10px] font-semibold tracking-[0.22em] transition-all duration-300 ${
                activeSection === null
                  ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                  : "border-[var(--border)] text-[var(--faint)] hover:border-[var(--border-strong)] hover:text-[var(--muted)]"
              }`}
            >
              {t.all}
              <span
                className={`text-[9px] tabular-nums tracking-[0.18em] ${
                  activeSection === null
                    ? "text-[var(--accent)]/70"
                    : "text-[var(--faintest)]"
                }`}
              >
                {String(deck.length).padStart(2, "0")}
              </span>
            </button>
            {sections.map((s) => {
              const count = deck.filter((p) => sectionOf(p) === s.id).length;
              if (count === 0) return null;
              const on = activeSection === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(on ? null : s.id)}
                  aria-pressed={on}
                  className={`inline-flex items-baseline gap-2 rounded-full border px-[14px] py-[7px] text-[10px] font-semibold tracking-[0.22em] transition-all duration-300 ${
                    on
                      ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                      : "border-[var(--border)] text-[var(--faint)] hover:border-[var(--border-strong)] hover:text-[var(--muted)]"
                  }`}
                >
                  <span
                    className={`${on ? "" : "text-[var(--fainter)]"} text-[11px] leading-none`}
                  >
                    {s.symbol}
                  </span>
                  {s.name[lang]}
                  <span
                    className={`text-[9px] tabular-nums tracking-[0.18em] ${
                      on ? "text-[var(--accent)]/70" : "text-[var(--faintest)]"
                    }`}
                  >
                    {String(count).padStart(2, "0")}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* TAGS — cross-cutting filter, AND-combined with search + column */}
        {tagOptions.length > 0 && (
          <div className="mt-[clamp(28px,4.5vh,44px)]">
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

        {/* grouped list — re-keyed to replay the staggered entrance */}
        <div key={viewKey}>
          {!empty ? (
            viewGroups.map((g, i) => (
              <SectionBlock
                key={g.section.id}
                group={g}
                lang={lang}
                terms={terms}
                t={t}
                onOpen={onOpen}
                delay={i * 90}
              />
            ))
          ) : (
            <p className="py-[clamp(48px,8vh,96px)] text-center text-[13px] tracking-[0.2em] text-[var(--faint)]">
              {searching ? t.noMatch : activeTag ? t.noTag : t.noSection}
            </p>
          )}

          <p className="mt-[clamp(48px,8vh,96px)] text-center text-[11px] tracking-[0.3em] text-[var(--faintest)]">
            © {j.close.year} EVERVERDANTS
          </p>
        </div>
      </div>
    </section>
  );
}

/* ---- one editorial column: manifesto header + its essays ---- */

function SectionBlock({
  group,
  lang,
  terms,
  t,
  onOpen,
  delay,
}: {
  group: { section: BlogSection; index: number; posts: JournalPost[] };
  lang: "en" | "zh";
  terms: string[];
  t: (typeof ui)["en"] | (typeof ui)["zh"];
  onOpen: (slug: string) => void;
  delay: number;
}) {
  const { section, index, posts } = group;
  return (
    <section
      className={`animate-fade-up ${
        index === 0
          ? "mt-[clamp(36px,6vh,64px)]"
          : "mt-[clamp(64px,10vh,110px)]"
      }`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* column head — a file-folder side-tab: folio, glyph, manifesto */}
      <header className="flex items-end justify-between gap-6 border-b border-[var(--border)] pb-[clamp(18px,3vh,28px)]">
        <div className="min-w-0">
          <p className="flex items-center gap-2.5 text-[10px] font-semibold tracking-[0.34em] text-[var(--fainter)]">
            {t.column}
            <span aria-hidden className="h-px w-6 bg-[var(--border-strong)]" />
            <span className="font-fraunces font-medium italic tracking-[0.1em] text-[var(--muted)]">
              {String(index + 1).padStart(2, "0")}
            </span>
          </p>
          <h2 className="mt-3 font-fraunces font-medium italic leading-[0.95] tracking-[-0.01em] text-[var(--ink)] text-[clamp(30px,4.6vw,54px)]">
            <span className="text-[var(--accent)]">{section.symbol} </span>
            {section.name[lang]}
          </h2>
          <p className="mt-3 max-w-[56ch] text-[13px] leading-[1.7] text-[var(--muted-2)]">
            {section.tagline[lang]}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end justify-end gap-3 self-stretch border-l border-[var(--border-faint)] pl-[clamp(14px,2.4vw,24px)]">
          <span
            aria-hidden
            className="font-fraunces italic leading-none text-[var(--faint)] text-[clamp(20px,2.6vw,32px)]"
          >
            {section.symbol}
          </span>
          <span className="text-[10px] tracking-[0.3em] text-[var(--fainter)]">
            {String(posts.length).padStart(2, "0")}{" "}
            <span className="text-[var(--faintest)]">{t.posts}</span>
          </span>
        </div>
      </header>

      <ul className="mt-[clamp(20px,3vh,28px)] flex flex-col gap-4">
        {posts.map((post) => (
          <li key={post.slug}>
            <button
              onClick={() => onOpen(post.slug)}
              className="group block w-full rounded-[var(--radius-card)] border border-[var(--card-border)] bg-[var(--card-bg)] p-[clamp(20px,3vw,30px)] text-left shadow-[var(--card-shadow)] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-[2px] hover:border-[color-mix(in_srgb,var(--accent)_35%,var(--card-border))] hover:shadow-[var(--card-shadow-hover)] focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2"
            >
              <div className="flex items-center justify-between gap-4">
                <span className="shrink-0 text-[10px] font-medium tracking-[0.2em] text-[var(--fainter)]">
                  {post.date}
                </span>
                <span className="shrink-0 rounded-full border border-[color-mix(in_srgb,var(--accent)_35%,transparent)] bg-[var(--accent-soft)] px-2.5 py-[3px] text-[9.5px] font-medium tracking-[0.18em] text-[var(--accent)]">
                  {section.symbol} {post.category}
                </span>
              </div>
              <h3 className="mt-[14px] font-sans text-[clamp(19px,2vw,26px)] font-bold leading-[1.25] tracking-[-0.01em] text-[var(--ink)] transition-colors group-hover:text-[var(--accent)]">
                <Highlight
                  text={post.title.split("\n").join(" ")}
                  terms={terms}
                />
              </h3>
              <p className="mt-[10px] max-w-[62ch] text-[clamp(13.5px,1.1vw,15px)] leading-[1.75] text-[var(--muted-2)] line-clamp-2">
                <Highlight text={post.excerpt} terms={terms} />
              </p>
              <div className="mt-[16px] flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                  {post.tagLabels.map((label, i) => (
                    <span
                      key={post.tags[i] ?? label}
                      className="rounded-full border border-[var(--border-faint)] bg-[var(--chip)] px-2.5 py-0.5 text-[9px] font-medium tracking-[0.18em] text-[var(--faint)]"
                    >
                      {label.toUpperCase()}
                    </span>
                  ))}
                </div>
                <span className="shrink-0 text-[10px] tracking-[0.16em] text-[var(--fainter)] opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  {post.read} ↗
                </span>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
