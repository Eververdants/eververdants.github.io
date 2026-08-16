import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { JournalPost } from "../data/journal";
import { journal } from "../data/journal";
import { getArticle, getDeck } from "../data/articles";

/* Article reader — a functional, light reading page for journal essays
   (and future technical posts), deliberately the opposite of the dark
   cinematic screens: 米白 background with a gray grid, a reading-progress
   bar at the very top, and a sticky table of contents on the right that
   scroll-spies the article's headings. No entrance choreography — content
   is just there to read.

   App routes /blog/<slug> and passes scrollTo (a lenis-backed smooth
   scroll) so the TOC can jump to headings. */

const deck = getDeck();

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export default function ArticleScene({
  slug,
  onClose,
  onOpen,
  scrollTo
}: {
  slug: string;
  onClose: () => void;
  onOpen: (slug: string) => void;
  scrollTo: (y: number) => void;
}) {
  const root = useRef<HTMLElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const tocNavRef = useRef<HTMLDivElement>(null);
  const tocIndicatorRef = useRef<HTMLSpanElement>(null);
  const [toc, setToc] = useState<TocItem[]>([]);
  const article = getArticle(slug);
  const i = deck.findIndex((p) => p.slug === slug);
  const prev: JournalPost | null = i > 0 ? deck[i - 1] : null;
  const next: JournalPost | null = i >= 0 && i < deck.length - 1 ? deck[i + 1] : null;

  /* Reading progress + TOC scroll-spy — one scroll listener. Progress fills
     the top bar; the active heading is the last one whose top sits above the
     reading line (30% from the top of the viewport), the last heading winning
     at the bottom of the article. Deterministic, no observer timing. */
  useEffect(() => {
    const content = root.current?.querySelector(".article-content");
    const heads = content
      ? Array.from(content.querySelectorAll<HTMLElement>("h2[id], h3[id]"))
      : [];
    setToc(
      heads.map((h) => ({
        id: h.id,
        text: h.textContent ?? "",
        level: h.tagName === "H2" ? 2 : 3
      }))
    );
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${p})`;
      // Query fresh every frame: heading elements captured at mount go
      // stale (detached) once React re-renders the article.
      const currentHeads = root.current
        ? Array.from(root.current.querySelectorAll<HTMLElement>(".article-content h2[id], .article-content h3[id]"))
        : [];
      if (!currentHeads.length) return;
      const line = window.innerHeight * 0.3;
      let current = "";
      for (const h of currentHeads) {
        if (h.getBoundingClientRect().top <= line) current = h.id;
        else break;
      }
      // Scrolled to the bottom — the last section is being read.
      if (
        window.scrollY + window.innerHeight >=
        document.documentElement.scrollHeight - 2
      ) {
        current = currentHeads[currentHeads.length - 1].id;
      }
      // Imperative highlight (like the progress bar): React state updates
      // from a scroll handler were not reliably re-rendering the buttons.
      tocNavRef.current
        ?.querySelectorAll<HTMLButtonElement>("button[data-toc-id]")
        .forEach((btn) => {
          const on = btn.dataset.tocId === current;
          btn.classList.toggle("font-semibold", on);
          btn.classList.toggle("text-[#141414]", on);
          btn.classList.toggle("is-active", on);
        });
      // Slide the single rail indicator onto the active entry.
      const activeBtn = tocNavRef.current?.querySelector<HTMLButtonElement>("button.is-active");
      if (tocIndicatorRef.current && activeBtn) {
        tocIndicatorRef.current.style.height = activeBtn.offsetHeight + "px";
        tocIndicatorRef.current.style.transform = `translateY(${activeBtn.offsetTop}px)`;
      } else if (tocIndicatorRef.current) {
        tocIndicatorRef.current.style.opacity = "0";
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [slug]);

  // App only ever opens known slugs — an unknown /blog/<slug> is redirected
  // to the root as a 404 (the same 404.html flow as every unknown URL), so
  // this branch is defensive only.
  /* Mount entrance — the header (back link, title, meta) rises in as the
     essay opens. Functional, quick, no mask tricks. */
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-art-head]",
        { y: 22, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.55, ease: "power3.out", stagger: 0.07 }
      );
    }, root);
    return () => ctx.revert();
  }, [slug]);

  /* Scroll reveals — each body block (paragraph, heading, quote) rises in
     as it enters. Subtle and once-only so reading never fights the motion.
     The article mounts after the global coordinator, so these triggers are
     created here, scoped to this root. */
  useEffect(() => {
    const ctx = gsap.context(() => {
      const blocks = gsap.utils.toArray<HTMLElement>(".article-content > *");
      if (!blocks.length) return;
      gsap.set(blocks, { autoAlpha: 0, y: 16 });
      ScrollTrigger.batch(blocks, {
        start: "top 90%",
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, {
            autoAlpha: 1,
            y: 0,
            duration: 0.5,
            ease: "power2.out",
            overwrite: true
          })
      });
    }, root);
    return () => ctx.revert();
  }, [slug]);

  if (!article) return null;
  const { post } = article;

  const jump = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    scrollTo(el.getBoundingClientRect().top + window.scrollY - 20);
  };

  return (
    <section
      ref={root}
      data-article
      className="relative z-[1] min-h-[100vh] min-h-dvh"
      style={{
        backgroundColor: "#f7f5ef",
        backgroundImage:
          "linear-gradient(#e5e2d9 1px, transparent 1px), linear-gradient(90deg, #e5e2d9 1px, transparent 1px)",
        backgroundSize: "28px 28px"
      }}
    >
      {/* reading progress — pure black fill */}
      <div className="fixed inset-x-0 top-0 z-[40] h-[3px] bg-black/5">
        <div ref={progressRef} className="h-full w-full origin-left bg-black" style={{ transform: "scaleX(0)" }} />
      </div>

      <div className="mx-auto max-w-[1080px] px-[clamp(16px,4vw,40px)] pb-[clamp(80px,14vh,160px)] pt-[clamp(24px,4vh,48px)]">
        {/* top bar: back + meta */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] tracking-[0.18em] text-[#8a867c]">
          <button
            onClick={onClose}
            data-art-head
            className="group inline-flex items-center gap-2 font-semibold tracking-[0.2em] text-[#5a564d] transition-colors hover:text-[#141414]"
          >
            <span aria-hidden className="transition-transform duration-200 group-hover:-translate-x-0.5">←</span>
            JOURNAL
          </button>
          <span data-art-head>
            {post.category} · {post.date} · {post.read}
          </span>
        </div>

        {/* header */}
        <header className="mt-[clamp(40px,7vh,72px)]">
          <h1
            data-art-head
            className="font-sans text-[clamp(26px,3.4vw,44px)] font-bold leading-[1.15] tracking-[-0.01em] text-[#141414]"
          >
            {post.title.split("\n").join(" ")}
          </h1>
          <div data-art-head className="mt-[clamp(18px,3vh,28px)] flex flex-wrap gap-2">
            {post.tags.map((t) => (
              <span
                key={t}
                className="rounded-full border border-[#d8d5cd] px-3 py-1 text-[10px] font-medium tracking-[0.2em] text-[#6b675d]"
              >
                {t.toUpperCase()}
              </span>
            ))}
          </div>
        </header>

        {/* content + right TOC */}
        {/* Mobile: collapsible TOC above the article (desktop keeps the
            sticky right rail below). */}
        {toc.length > 0 && (
          <details className="mb-[clamp(24px,4vh,40px)] border-b border-[#ddd9cf] pb-[10px] lg:hidden">
            <summary className="cursor-pointer select-none text-[10px] font-semibold tracking-[0.3em] text-[#9a968b]">
              ON THIS PAGE · {toc.length}
            </summary>
            <nav className="mt-[10px] flex flex-col gap-[6px] border-l border-[#ddd9cf] pl-[14px]">
              {toc.map((item) => (
                <button
                  key={item.id}
                  onClick={() => jump(item.id)}
                  className={`text-left text-[13px] leading-snug transition-colors hover:text-[#141414] ${
                    item.level === 3 ? "pl-[12px] text-[#8a867c]" : "text-[#5a564d]"
                  }`}
                >
                  {item.text}
                </button>
              ))}
            </nav>
          </details>
        )}
        <div className="mt-[clamp(36px,6vh,60px)] lg:grid lg:grid-cols-[minmax(0,1fr)_220px] lg:gap-[clamp(32px,5vw,64px)]">
          <article
            className="article-content min-w-0"
            dangerouslySetInnerHTML={{ __html: article.html }}
          />

          {/* table of contents — sticky right rail (desktop only) */}
          {toc.length > 0 && (
            <aside className="hidden lg:block">
              <div className="sticky top-[24px]">
                <p className="text-[10px] font-semibold tracking-[0.3em] text-[#9a968b]">
                  ON THIS PAGE
                </p>
                <nav ref={tocNavRef} className="relative mt-[14px] flex flex-col gap-[6px] border-l border-[#ddd9cf] pl-[14px]">
                  <span ref={tocIndicatorRef} aria-hidden className="toc-indicator" />
                  {toc.map((item) => (
                    <button
                      key={item.id}
                      data-toc-id={item.id}
                      onClick={() => jump(item.id)}
                      className={`toc-item text-left text-[13px] leading-snug transition-colors hover:text-[#141414] ${
                        item.level === 3 ? "pl-[12px] text-[#8a867c]" : "text-[#5a564d]"
                      }`}
                    >
                      {item.text}
                    </button>
                  ))}
                </nav>
              </div>
            </aside>
          )}
        </div>

        {/* prev / next */}
        <nav className="mt-[clamp(56px,10vh,96px)] grid gap-4 border-t border-[#ddd9cf] pt-[clamp(24px,4vh,40px)] sm:grid-cols-2">
          {prev ? (
            <button onClick={() => onOpen(prev.slug)} className="group text-left">
              <span className="text-[10px] tracking-[0.3em] text-[#9a968b]">← PREVIOUS</span>
              <span className="mt-2 block font-medium text-[#2a2824] transition-colors group-hover:text-[#0e7a86]">
                {prev.title.split("\n").join(" ")}
              </span>
            </button>
          ) : (
            <span aria-hidden />
          )}
          {next ? (
            <button onClick={() => onOpen(next.slug)} className="group text-right sm:col-start-2">
              <span className="text-[10px] tracking-[0.3em] text-[#9a968b]">NEXT →</span>
              <span className="mt-2 block font-medium text-[#2a2824] transition-colors group-hover:text-[#0e7a86]">
                {next.title.split("\n").join(" ")}
              </span>
            </button>
          ) : (
            <span aria-hidden />
          )}
        </nav>

        <p className="mt-[clamp(40px,8vh,80px)] text-center text-[11px] tracking-[0.3em] text-[#aaa59a]">
          END — © {journal.close.year} EVERVERDANTS
        </p>
      </div>
    </section>
  );
}
