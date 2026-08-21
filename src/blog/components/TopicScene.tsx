import { useEffect, type CSSProperties } from "react";
import { journal, journalZh, topicById, topics, type JournalPost } from "../../data/journal";
import { getDeck } from "../../data/articles";
import { ui, useBlogPrefs } from "../prefs";
import TopicArt from "./TopicArt";
import PostList from "./PostList";

/* 专题 PAGE — /blog/topic/<id>, one hero screen per editorial feature.

   The hero is a magazine cover, not a caption: a giant Fraunces italic
   title at full bleed, then a full-width color slab in the topic's accent
   with a huge folio numeral stamped in the page's surface colour, and the
   scrapbook strip (TopicArt) below — which mounts LAZILY via
   IntersectionObserver, so the page never paints (or, later, fetches) the
   collage before it scrolls into view. A dashed "cut here" seam separates
   the hero from the topic's essays, listed newest first as plain
   editorial rows (no cards).

   The same light grammar as the reader: grid background, theme tokens,
   ui-dict labels. Language + theme come from the blog prefs context. */

const byDateDesc = (a: JournalPost, b: JournalPost) =>
  b.date.localeCompare(a.date);

export default function TopicScene({
  topicId,
  onClose,
  onOpen,
}: {
  topicId: string;
  onClose: () => void;
  onOpen: (slug: string) => void;
}) {
  const { lang } = useBlogPrefs();
  const t = ui[lang];
  const j = lang === "zh" ? journalZh : journal;
  const topic = topicById.get(topicId);

  /* An unknown topic id falls back to the index (App normalizes the view
     too; this is the in-scene safety net while the swap happens). */
  useEffect(() => {
    if (!topic) onClose();
  }, [topic, onClose]);

  if (!topic) return null;

  const posts = getDeck(lang)
    .filter((p) => p.topics.includes(topicId))
    .sort(byDateDesc);
  /* Stable editorial number — the curated topics[] order, not recency. */
  const index = Math.max(0, topics.findIndex((x) => x.id === topicId));
  const folio = String(index + 1).padStart(2, "0");

  return (
    <section
      data-article
      className="relative z-[1] min-h-[100vh] min-h-dvh"
      style={{
        backgroundColor: "var(--bg)",
        backgroundImage:
          "linear-gradient(var(--grid) 1px, transparent 1px), linear-gradient(90deg, var(--grid) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }}
    >
      {/* ---- hero: fills the ENTIRE FIRST VIEWPORT, edge to edge — no
           side container, no gutters. The top bar floats above it; copy
           sits below the top bar's band. The title bleeds to the left
           viewport edge, the color slab runs full-bleed to both edges.
           The scrapbook strip lives BELOW the fold. ---- */}
      <div className="w-full">
        <div
          className="topic-band relative h-screen h-dvh overflow-hidden"
          style={{ "--topic": topic.color } as CSSProperties}
        >
          <div className="relative z-[1] flex h-full flex-col pt-[clamp(88px,10vh,112px)] pb-[clamp(20px,3vh,36px)]">
            {/* breadcrumb — back to the index + topic meta; clear of the
                top bar's band, with a gutter off the viewport edges */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-[clamp(20px,5vw,72px)] text-[11px] tracking-[0.18em] text-[var(--faint)]">
              <button
                onClick={onClose}
                className="group inline-flex items-center gap-2 font-semibold tracking-[0.2em] text-[var(--muted)] transition-colors hover:text-[var(--ink)]"
              >
                <span
                  aria-hidden
                  className="transition-transform duration-200 group-hover:-translate-x-0.5"
                >
                  ←
                </span>
                {t.journalBack}
              </button>
              <span>
                {topic.symbol} {topic.name[lang]} · {String(posts.length).padStart(2, "0")}{" "}
                {t.posts}
              </span>
            </div>

            {/* title block — pushed toward the lower half, with a gutter
                off the left viewport edge */}
            <div className="mt-auto px-[clamp(20px,5vw,72px)] pt-[clamp(24px,4vh,40px)]">
              {/* top meta row */}
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <p className="hero-rise flex items-center gap-3 text-[11px] font-semibold tracking-[0.36em] text-[var(--fainter)]">
                  {t.feature}
                  <span
                    aria-hidden
                    className="h-px w-8"
                    style={{
                      backgroundColor:
                        "color-mix(in srgb, var(--topic) 45%, var(--border))",
                    }}
                  />
                  <span className="font-fraunces font-medium italic tracking-[0.1em] text-[var(--muted)]">
                    {folio}
                  </span>
                </p>
                <p
                  className="hero-rise text-[11px] tracking-[0.26em] text-[var(--faint)]"
                  style={{ animationDelay: "80ms" }}
                >
                  {String(posts.length).padStart(2, "0")} {t.posts}
                  <span aria-hidden className="mx-2.5 text-[var(--faintest)]">
                    ·
                  </span>
                  {t.latest} {posts[0]?.date ?? ""}
                </p>
              </div>

              {/* the giant title — full bleed, italic, no wrap; sized to the
                  viewport so it reads across the whole first screen */}
              <h1
                className="hero-rise mt-[clamp(16px,3vh,30px)] whitespace-nowrap font-fraunces font-medium italic leading-[0.92] tracking-[-0.02em] text-[var(--ink)] text-[clamp(56px,min(14vw,18vh),240px)]"
                style={{ animationDelay: "140ms" }}
              >
                {topic.name[lang]}
              </h1>

              {/* slogan */}
              <p
                className="hero-rise mt-[clamp(20px,3.5vh,34px)] max-w-[72ch] text-[clamp(16px,1.7vw,21px)] leading-[1.8] text-[var(--muted-2)]"
                style={{ animationDelay: "200ms" }}
              >
                {topic.slogan[lang]}
              </p>
            </div>

            {/* full-bleed color slab — pinned to the bottom, folio bleeding
                out of it (paper-white in both themes) */}
            <div
              className="relative z-[1] mt-[clamp(28px,4.5vh,44px)] h-[clamp(96px,14vh,150px)] overflow-hidden"
              style={{ "--blob-rotate": "-1.4deg" } as CSSProperties}
            >
              <span
                aria-hidden
                className="topic-blob hero-sweep absolute inset-0"
                style={{ transform: "rotate(-1.4deg)" }}
              />
              <span
                aria-hidden
                className="topic-folio hero-stamp absolute bottom-[-7%] left-[clamp(16px,3vw,40px)] text-[clamp(96px,14vh,200px)]"
                style={{ animationDelay: "120ms" }}
              >
                {folio}
              </span>
            </div>
          </div>
        </div>

        {/* scrapbook strip — below the fold, at hero width */}
        <div className="relative z-[1] px-[clamp(20px,5vw,72px)] pt-[clamp(24px,4vh,40px)]">
          <TopicArt topic={topic} lang={lang} />
        </div>
      </div>

      {/* NARROW column — the essays return to a reading width */}
      <div className="mx-auto max-w-[880px] px-[clamp(16px,4vw,40px)] pb-[clamp(80px,14vh,160px)]">
        {/* "cut here" dashed seam between hero and the list */}
        <hr aria-hidden className="scrap-cut" />

        {posts.length === 0 ? (
          <p className="py-[clamp(48px,8vh,96px)] text-center text-[13px] tracking-[0.2em] text-[var(--faint)]">
            {t.noSection}
          </p>
        ) : (
          <PostList
            posts={posts}
            terms={[]}
            onOpen={onOpen}
            className="mt-[clamp(12px,2vh,20px)]"
          />
        )}

        <p className="mt-[clamp(48px,8vh,96px)] text-center text-[11px] tracking-[0.3em] text-[var(--faintest)]">
          {t.end(j.close.year)}
        </p>
      </div>
    </section>
  );
}
