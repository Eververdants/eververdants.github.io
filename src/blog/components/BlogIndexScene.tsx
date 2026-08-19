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
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const deck = getDeck(lang);
  const allTags = Array.from(new Set(deck.flatMap((p) => p.tags)));
  const terms = query.trim().split(/\s+/).filter(Boolean);
  const searching = terms.length > 0;
  const searched = searching ? searchPosts(query.trim(), lang) : deck;
  const tagFiltered = activeTag
    ? searched.filter((p) => p.tags.includes(activeTag))
    : searched;

  /* Every essay's frontmatter category (localized per language) keys into
     the section directory — stable ids for state, translated names for
     display, and unknown categories simply fall through to "other". */
  const sectionOf = (post: JournalPost): string | null =>
    sections.find((s) => s.name[lang] === post.category)?.id ?? null;

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

  /* The hero's entrance + scroll-hint exit are owned here, not the global
     coordinator: this scene mounts after App init, so initGsap already ran
     for the main site. Scoped to this section, reverted on unmount. */
  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (rootRef.current) return initBlogIndex(rootRef.current, prefersReduced);
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

      {/* ---- below the fold: columns + search + tags + grouped list ---- */}
      <div className="mx-auto max-w-[860px] px-[clamp(16px,4vw,40px)] pb-[clamp(80px,14vh,160px)]">
        {/* column switcher — the journal's filing system */}
        <div>
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
                  ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                  : "border-[var(--border)] text-[var(--faint)] hover:border-[var(--border-strong)] hover:text-[var(--muted)]"
              }`}
            >
              {t.all}
              <span
                className={`text-[9px] tracking-[0.18em] ${
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
                      ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
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
                    className={`text-[9px] tracking-[0.18em] ${
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

        {/* search + tag filter — a query narrows the deck, a tag narrows the
            results further; both combine with the active column via AND */}
        <div className="mt-[clamp(28px,4.5vh,44px)] flex flex-col gap-4">
          <div className="relative max-w-[400px]">
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--faintest)]"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <circle cx="11" cy="11" r="7" />
              <line x1="16.5" y1="16.5" x2="21" y2="21" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              aria-label={t.searchLabel}
              spellCheck={false}
              className="w-full rounded-full border border-[var(--border)] bg-[var(--field)] py-2.5 pl-11 pr-10 text-[12px] tracking-[0.14em] text-[var(--ink)] outline-none transition-colors placeholder:text-[var(--faintest)] focus:border-[var(--accent)]"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                aria-label={t.clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--faint)] transition-colors hover:text-[var(--ink)]"
              >
                <span aria-hidden className="block text-[14px] leading-none">
                  ✕
                </span>
              </button>
            )}
          </div>
          {allTags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setActiveTag(null)}
                className={`rounded-full border px-3 py-1 text-[9px] font-medium tracking-[0.2em] transition-colors ${
                  activeTag === null
                    ? "border-[var(--accent)] text-[var(--accent)]"
                    : "border-[var(--border)] text-[var(--faint)] hover:border-[var(--border-strong)] hover:text-[var(--muted)]"
                }`}
              >
                {t.all}
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                  className={`rounded-full border px-3 py-1 text-[9px] font-medium tracking-[0.2em] transition-colors ${
                    activeTag === tag
                      ? "border-[var(--accent)] text-[var(--accent)]"
                      : "border-[var(--border)] text-[var(--faint)] hover:border-[var(--border-strong)] hover:text-[var(--muted)]"
                  }`}
                >
                  {tag.toUpperCase()}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* grouped list — re-keyed to replay the staggered entrance */}
        <div key={viewKey}>
          {searching && !empty && (
            <p className="mt-[clamp(28px,4.5vh,48px)] text-[10px] tracking-[0.3em] text-[var(--faint)]">
              {t.result(tagFiltered.length)}
            </p>
          )}

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

      <ul>
        {posts.map((post) => (
          <li key={post.slug} className="border-t border-[var(--border)]">
            <button
              onClick={() => onOpen(post.slug)}
              className="group block w-full py-[clamp(24px,4vh,44px)] text-left"
            >
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="font-sans text-[clamp(19px,2.2vw,28px)] font-bold leading-[1.2] tracking-[-0.01em] text-[var(--ink)] transition-colors group-hover:text-[var(--accent)]">
                  <Highlight
                    text={post.title.split("\n").join(" ")}
                    terms={terms}
                  />
                </h3>
                <span className="shrink-0 text-[11px] tracking-[0.14em] text-[var(--fainter)]">
                  {post.date} · {post.read}
                </span>
              </div>
              <p className="mt-[clamp(12px,2vh,20px)] max-w-[62ch] text-[clamp(14px,1.2vw,16px)] leading-[1.75] text-[var(--muted-2)]">
                <Highlight text={post.excerpt} terms={terms} />
              </p>
              <div className="mt-[clamp(14px,2.5vh,24px)] flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-[var(--border-faint)] bg-[var(--chip)] px-2.5 py-0.5 text-[9px] font-medium tracking-[0.18em] text-[var(--faint)]"
                  >
                    {tag.toUpperCase()}
                  </span>
                ))}
              </div>
            </button>
          </li>
        ))}
        <li className="border-t border-[var(--border)]" aria-hidden />
      </ul>
    </section>
  );
}
