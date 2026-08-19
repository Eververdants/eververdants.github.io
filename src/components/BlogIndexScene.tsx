import { useEffect, useRef, useState } from "react";
import { journal, journalZh } from "../data/journal";
import { getDeck, searchPosts } from "../data/articles";
import { initBlogIndex } from "../effects/animations/blogIndex";
import { ui, useBlogPrefs } from "../blog/prefs";
import Highlight from "./Highlight";

/* Blog sub-site — the full essay list at /blog, browsable and filterable by
   tag. Opens with a full-screen hero on the milk-white grid (centered BLOG
   masthead with a mount entrance), then scrolls into the functional list.
   Deliberately light against the main site's cinematic selected-blog. The
   curated deck on the main site links here via VISIT THE BLOG.
   Language and theme come from the blog prefs context; every color is a
   theme token (var(--x)), every label a ui dict entry. */

export default function BlogIndexScene({
  onOpen,
}: {
  onOpen: (slug: string) => void;
}) {
  const { lang } = useBlogPrefs();
  const t = ui[lang];
  const j = lang === "zh" ? journalZh : journal;
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const deck = getDeck(lang);
  const allTags = Array.from(new Set(deck.flatMap((p) => p.tags)));
  const terms = query.trim().split(/\s+/).filter(Boolean);
  const searching = terms.length > 0;
  const searched = searching ? searchPosts(query.trim(), lang) : deck;
  const shown = activeTag
    ? searched.filter((p) => p.tags.includes(activeTag))
    : searched;
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

      {/* ---- below the fold: filter + list + footer ---- */}
      <div className="mx-auto max-w-[860px] px-[clamp(16px,4vw,40px)] pb-[clamp(80px,14vh,160px)]">
        {/* search + tag filter — a query narrows the deck, the tag narrows
            the results further (the two combine with AND) */}
        <div className="flex flex-col gap-5">
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
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTag(null)}
              className={`rounded-full border px-4 py-1.5 text-[10px] font-medium tracking-[0.2em] transition-colors ${
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
                className={`rounded-full border px-4 py-1.5 text-[10px] font-medium tracking-[0.2em] transition-colors ${
                  activeTag === tag
                    ? "border-[var(--accent)] text-[var(--accent)]"
                    : "border-[var(--border)] text-[var(--faint)] hover:border-[var(--border-strong)] hover:text-[var(--muted)]"
                }`}
              >
                {tag.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* article list */}
        {shown.length > 0 ? (
          <>
            {searching && (
              <p className="mt-[clamp(28px,4.5vh,48px)] text-[10px] tracking-[0.3em] text-[var(--faint)]">
                {t.result(shown.length)}
              </p>
            )}
            <ul
              className={
                searching
                  ? "mt-[clamp(14px,2vh,24px)]"
                  : "mt-[clamp(32px,5vh,56px)]"
              }
            >
              {shown.map((post) => (
                <li key={post.slug} className="border-t border-[var(--border)]">
                  <button
                    onClick={() => onOpen(post.slug)}
                    className="group block w-full py-[clamp(24px,4vh,44px)] text-left"
                  >
                    <div className="flex items-baseline justify-between gap-4">
                      <h2 className="font-sans text-[clamp(19px,2.2vw,28px)] font-bold leading-[1.2] tracking-[-0.01em] text-[var(--ink)] transition-colors group-hover:text-[var(--accent)]">
                        <Highlight
                          text={post.title.split("\n").join(" ")}
                          terms={terms}
                        />
                      </h2>
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
          </>
        ) : (
          <p className="py-[clamp(48px,8vh,96px)] text-center text-[13px] tracking-[0.2em] text-[var(--faint)]">
            {searching ? t.noMatch : t.noTag}
          </p>
        )}

        <p className="mt-[clamp(48px,8vh,96px)] text-center text-[11px] tracking-[0.3em] text-[var(--faintest)]">
          © {j.close.year} EVERVERDANTS
        </p>
      </div>
    </section>
  );
}
