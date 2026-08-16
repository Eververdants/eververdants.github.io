import { useEffect, useRef, useState } from "react";
import { journal } from "../data/journal";
import { getDeck } from "../data/articles";
import { initBlogIndex } from "../effects/animations/blogIndex";

/* Blog sub-site — the full essay list at /blog, browsable and filterable by
   tag. Opens with a full-screen hero on the milk-white grid (centered BLOG
   masthead with a mount entrance), then scrolls into the functional list.
   Deliberately light against the main site's cinematic selected-blog. The
   curated deck on the main site links here via VISIT THE BLOG. */

export default function BlogIndexScene({
  onClose,
  onOpen
}: {
  onClose: () => void;
  onOpen: (slug: string) => void;
}) {
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const deck = getDeck();
  const allTags = Array.from(new Set(deck.flatMap((p) => p.tags)));
  const shown = activeTag ? deck.filter((p) => p.tags.includes(activeTag)) : deck;
  const rootRef = useRef<HTMLElement>(null);

  /* The hero's entrance + scroll-hint exit are owned here, not the global
     coordinator: this scene mounts after App init, so initGsap already ran
     for the main site. Scoped to this section, reverted on unmount. */
  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (rootRef.current) return initBlogIndex(rootRef.current, prefersReduced);
  }, []);

  return (
    <section
      ref={rootRef}
      data-article
      className="relative z-[1]"
      style={{
        backgroundColor: "#f7f5ef",
        backgroundImage:
          "linear-gradient(#e5e2d9 1px, transparent 1px), linear-gradient(90deg, #e5e2d9 1px, transparent 1px)",
        backgroundSize: "28px 28px"
      }}
    >
      {/* ---- hero: full-screen, centered, milk-white grid ---- */}
      <div
        data-blog-hero
        className="relative flex h-screen h-dvh flex-col items-center justify-center px-[clamp(16px,4vw,40px)] text-center"
      >
        {/* top bar: back to the main site */}
        <button
          onClick={onClose}
          className="group absolute left-[clamp(16px,4vw,40px)] top-[clamp(24px,4vh,48px)] inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.2em] text-[#5a564d] transition-colors hover:text-[#141414]"
        >
          <span aria-hidden className="transition-transform duration-200 group-hover:-translate-x-0.5">←</span>
          JOURNAL
        </button>

        <p data-blog-in className="text-[11px] font-semibold tracking-[0.4em] text-[#9a968b]">
          EVERVERDANTS
        </p>
        <h1
          data-blog-in
          className="mt-[clamp(16px,3vh,28px)] font-sans text-[clamp(48px,7vw,80px)] font-bold leading-[1.05] tracking-[-0.02em] text-[#141414]"
        >
          BLOG
        </h1>
        <p
          data-blog-in
          className="mt-[clamp(20px,3.5vh,32px)] text-[clamp(14px,1.3vw,16px)] leading-[1.8] text-[#5a564d]"
        >
          {journal.cover.subtitle}
        </p>

        {/* scroll hint — fades out as the hero leaves the first viewport */}
        <div
          data-blog-hint
          className="absolute bottom-[clamp(22px,4.5vh,40px)] left-1/2 flex -translate-x-1/2 flex-col items-center gap-3"
          aria-hidden="true"
        >
          <span className="text-[10px] tracking-[0.42em] indent-[0.42em] text-[#8a867c]">
            SCROLL
          </span>
          <span className="relative h-[46px] w-px overflow-hidden bg-[#ddd9cf]">
            <span className="absolute left-0 top-0 h-0 w-full animate-scroll-fill bg-[#0e7a86]" />
          </span>
        </div>
      </div>

      {/* ---- below the fold: filter + list + footer ---- */}
      <div className="mx-auto max-w-[860px] px-[clamp(16px,4vw,40px)] pb-[clamp(80px,14vh,160px)]">
        {/* tag filter */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTag(null)}
            className={`rounded-full border px-4 py-1.5 text-[10px] font-medium tracking-[0.2em] transition-colors ${
              activeTag === null
                ? "border-[#0e7a86] text-[#0e7a86]"
                : "border-[#ddd9cf] text-[#8a867c] hover:border-[#b5b0a4] hover:text-[#5a564d]"
            }`}
          >
            ALL
          </button>
          {allTags.map((t) => (
            <button
              key={t}
              onClick={() => setActiveTag(activeTag === t ? null : t)}
              className={`rounded-full border px-4 py-1.5 text-[10px] font-medium tracking-[0.2em] transition-colors ${
                activeTag === t
                  ? "border-[#0e7a86] text-[#0e7a86]"
                  : "border-[#ddd9cf] text-[#8a867c] hover:border-[#b5b0a4] hover:text-[#5a564d]"
              }`}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </div>

        {/* article list */}
        {shown.length > 0 ? (
          <ul className="mt-[clamp(32px,5vh,56px)]">
            {shown.map((post) => (
              <li key={post.slug} className="border-t border-[#ddd9cf]">
                <button
                  onClick={() => onOpen(post.slug)}
                  className="group block w-full py-[clamp(24px,4vh,44px)] text-left"
                >
                  <div className="flex items-baseline justify-between gap-4">
                    <h2 className="font-sans text-[clamp(19px,2.2vw,28px)] font-bold leading-[1.2] tracking-[-0.01em] text-[#141414] transition-colors group-hover:text-[#0e7a86]">
                      {post.title.split("\n").join(" ")}
                    </h2>
                    <span className="shrink-0 text-[11px] tracking-[0.14em] text-[#9a968b]">
                      {post.date} · {post.read}
                    </span>
                  </div>
                  <p className="mt-[clamp(12px,2vh,20px)] max-w-[62ch] text-[clamp(14px,1.2vw,16px)] leading-[1.75] text-[#6b675d]">
                    {post.excerpt}
                  </p>
                  <div className="mt-[clamp(14px,2.5vh,24px)] flex flex-wrap gap-2">
                    {post.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-full border border-[#e2dfd6] bg-[#efece4] px-2.5 py-0.5 text-[9px] font-medium tracking-[0.18em] text-[#8a867c]"
                      >
                        {t.toUpperCase()}
                      </span>
                    ))}
                  </div>
                </button>
              </li>
            ))}
            <li className="border-t border-[#ddd9cf]" aria-hidden />
          </ul>
        ) : (
          <p className="py-[clamp(48px,8vh,96px)] text-center text-[13px] tracking-[0.2em] text-[#8a867c]">
            NO ESSAYS UNDER THIS TAG
          </p>
        )}

        <p className="mt-[clamp(48px,8vh,96px)] text-center text-[11px] tracking-[0.3em] text-[#aaa59a]">
          © {journal.close.year} EVERVERDANTS
        </p>
      </div>
    </section>
  );
}
