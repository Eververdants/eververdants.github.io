import { journal, type JournalPost } from "../data/journal";

/* Fourth screen — SELECTED BLOG, the journal.

   A deliberate departure from the resume's centered-chapter grammar so the
   journal does not read as another act of the same play. Three beats:

   1. Cover — an ASYMMETRIC editorial masthead: oversized warm-gradient
      italic JOURNAL hugging the left, a ghost issue numeral on the right,
      a caption in the corner. Not centered, not stroked.
   2. The Reading Deck — each post is a FULL-SCREEN spread that stands up
      (rotateX) as it enters and lays flat back down as it leaves — pages
      turned on a reading table (gsap.ts [data-journal-spread]). Every
      spread is its own moment: giant italic title left, excerpt right, a
      ghost index numeral behind. No sticky chapter numerals, no marquee.
   3. Close — one line that types out word by word.

   Reduced motion opts out via gsap.ts; copy lives in data/journal.ts. */

export default function BlogScene({ onOpen }: { onOpen: (slug: string) => void }) {
  const deck = [journal.featured, ...journal.posts];
  return (
    <section className="relative z-[1] px-[clamp(16px,4vw,48px)]" data-blog>
      <Cover />
      <Deck deck={deck} onOpen={onOpen} />
      <Close />
    </section>
  );
}

/* ---- Act 1 — cover: asymmetric editorial masthead ---- */

function Cover() {
  const c = journal.cover;
  return (
    <div className="relative flex h-[120vh] items-center" data-cover>
      {/* ghost issue numeral — big stroke italic, drifts with scroll */}
      <span
        aria-hidden
        className="text-stroke-faint absolute right-[clamp(0px,1vw,24px)] top-[10%] font-fraunces italic leading-none text-[clamp(120px,24vw,380px)]"
        data-parallax
      >
        {c.issue}
      </span>

      <div className="relative z-[1]">
        <p className="text-[11px] tracking-[0.45em] text-white/35">{c.overline}</p>
        {/* JOURNAL as SVG text filled with a gradient. background-clip:text
            paints only the element's box, so Fraunces italic ink that
            overhangs the box renders transparent (a shaved letter) — that
            was the clipping all along. SVG <text fill="url(#grad)"> paints
            the gradient directly into the glyph path: no box, no clip, the
            whole letter always renders. overflow=visible so swash descenders
            (the J, the U) are never trimmed to the viewBox. */}
        <h2 className="no-rv mt-[clamp(28px,5vh,56px)]">
          <svg
            viewBox="0 0 840 230"
            role="img"
            aria-label="JOURNAL"
            className="h-auto w-[min(84vw,840px)] overflow-visible"
            data-cover-title
          >
            <defs>
              <linearGradient id="journal-grad" x1="0%" y1="0%" x2="100%" y2="70%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="55%" stopColor="#ffd9a8" />
                <stop offset="100%" stopColor="#f9a633" />
              </linearGradient>
            </defs>
            <text
              x="0"
              y="180"
              fontFamily="Fraunces, Georgia, serif"
              fontStyle="italic"
              fontWeight="500"
              fontSize="200"
              fill="url(#journal-grad)"
            >
              JOURNAL
            </text>
          </svg>
        </h2>
        <p className="mt-[clamp(24px,4vh,48px)] font-fraunces text-[clamp(15px,1.8vw,24px)] tracking-[0.06em] text-white/55">
          {c.subtitle}
        </p>
      </div>

      {/* corner caption — editorial margin note */}
      <p className="absolute bottom-[8%] left-0 text-[10px] tracking-[0.4em] text-white/20">
        {c.caption}
      </p>
    </div>
  );
}

/* ---- Act 2 — the reading deck: full-screen spreads that turn ----
   Each spread opens its article (App routes /selected-blog/<slug>). */

function Deck({ deck, onOpen }: { deck: JournalPost[]; onOpen: (slug: string) => void }) {
  return (
    <div className="pt-[clamp(40px,8vh,120px)]">
      {deck.map((post, i) => (
        <article
          key={post.title}
          className="group relative h-screen h-dvh cursor-pointer"
          data-journal-spread
          onClick={() => onOpen(post.slug)}
          role="button"
          tabIndex={0}
          aria-label={`Read ${post.title.replace(/\n/g, " ")}`}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onOpen(post.slug);
            }
          }}
        >
          {/* running header: category left, folio right */}
          <div className="absolute inset-x-0 top-0 z-[2] flex items-baseline justify-between border-t border-white/10 pt-[clamp(14px,2.5vh,28px)]">
            <span className="text-[10px] tracking-[0.4em] text-white/30">
              {post.category}
            </span>
            <span className="font-fraunces italic text-white/25 text-[clamp(14px,1.4vw,20px)]">
              {String(i + 1).padStart(2, "0")}
            </span>
          </div>

          {/* ghost folio — the spread's own giant numeral */}
          <span
            aria-hidden
            className="text-stroke-faint absolute right-[clamp(8px,2vw,40px)] top-[6%] hidden font-fraunces italic leading-none text-[clamp(140px,26vw,420px)] min-[720px]:block"
          >
            {String(i + 1).padStart(2, "0")}
          </span>

          {/* title — giant italic, bottom-left, two-column against the excerpt */}
          <div className="absolute bottom-[10%] left-0 z-[1] max-w-[min(62vw,820px)]">
            {post.title.split("\n").map((line) => (
              <span
                key={line}
                className="block font-fraunces italic font-medium leading-[0.9] tracking-[-0.02em] text-white text-[clamp(38px,7vw,112px)]"
              >
                {line}
              </span>
            ))}
          </div>

          {/* open affordance — visible on touch, warms on hover */}
          <div className="absolute bottom-[4%] left-0 z-[1] flex items-center gap-2 text-[10px] tracking-[0.42em] text-white/30 transition-colors duration-300 group-hover:text-[#f9a633]/90">
            <span>READ ESSAY</span>
            <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1">↗</span>
          </div>

          {/* excerpt + meta — quiet, right-aligned */}
          <div className="absolute bottom-[10%] right-0 z-[1] max-w-[min(30ch,26vw)] text-right">
            <p className="no-rv text-[clamp(13px,1.4vw,16px)] leading-[1.75] text-[#8e8e8e]">
              {post.excerpt}
            </p>
            <p className="no-rv mt-[clamp(16px,3vh,36px)] text-[11px] tracking-[0.3em] text-[#6f6f6f]">
              {post.date}
              <span aria-hidden className="mx-[0.7em] text-white/20">·</span>
              {post.read}
            </p>
          </div>
        </article>
      ))}
    </div>
  );
}

/* ---- Act 3 — close: one line, word by word ---- */

function Close() {
  return (
    <div className="flex min-h-[100vh] min-h-dvh flex-col items-center justify-center pb-[clamp(120px,20vh,240px)] pt-[clamp(60px,10vh,120px)] text-center">
      <div className="line-mask">
        {journal.close.line.split(" ").map((w, i) => (
          <span
            key={i}
            className="mr-[0.28em] inline-block font-fraunces font-light italic leading-[1.35] tracking-[-0.01em] text-white/85 text-[clamp(22px,4vw,64px)]"
          >
            {w}
          </span>
        ))}
      </div>
      <span className="mt-[clamp(56px,9vh,110px)] inline-block text-[11px] tracking-[0.5em] text-white/40">
        END
      </span>
      <p className="mt-[clamp(20px,3vh,36px)] text-[11px] tracking-[0.3em] text-white/25">
        © {journal.close.year} EVERVERDANTS — WRITTEN IN THE GREEN MOUNTAINS
      </p>
    </div>
  );
}
