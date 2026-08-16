import { useState } from "react";
import { journal } from "../data/journal";
import { getDeck } from "../data/articles";

/* Blog sub-site — a simple index at /blog where the full list of essays can
   be browsed and filtered by tag. Deliberately functional (light page, list
   rows, tag chips) against the main site's cinematic selected-blog. The
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

  return (
    <section
      data-article
      className="relative z-[1] min-h-screen"
      style={{
        backgroundColor: "#f7f5ef",
        backgroundImage:
          "linear-gradient(#e5e2d9 1px, transparent 1px), linear-gradient(90deg, #e5e2d9 1px, transparent 1px)",
        backgroundSize: "28px 28px"
      }}
    >
      <div className="mx-auto max-w-[860px] px-[clamp(16px,4vw,40px)] pb-[clamp(80px,14vh,160px)] pt-[clamp(24px,4vh,48px)]">
        {/* top bar: back to the main site */}
        <button
          onClick={onClose}
          className="group inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.2em] text-[#5a564d] transition-colors hover:text-[#141414]"
        >
          <span aria-hidden className="transition-transform duration-200 group-hover:-translate-x-0.5">←</span>
          JOURNAL
        </button>

        {/* header */}
        <header className="mt-[clamp(48px,8vh,88px)]">
          <p className="text-[11px] font-semibold tracking-[0.4em] text-[#9a968b]">ALL ESSAYS</p>
          <h1 className="mt-[clamp(16px,3vh,32px)] font-sans text-[clamp(32px,4.5vw,60px)] font-bold leading-[1.05] tracking-[-0.02em] text-[#141414]">
            BLOG
          </h1>
          <p className="mt-[clamp(20px,3.5vh,36px)] max-w-[52ch] text-[clamp(14px,1.3vw,16px)] leading-[1.8] text-[#5a564d]">
            {journal.cover.subtitle}
          </p>
        </header>

        {/* tag filter */}
        <div className="mt-[clamp(36px,6vh,60px)] flex flex-wrap items-center gap-2">
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
