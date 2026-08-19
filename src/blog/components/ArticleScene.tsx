import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { JournalPost } from "../../data/journal";
import { journal } from "../../data/journal";
import { getArticle, getDeck } from "../../data/articles";
import { sections } from "../../data/sections";
import { ui, useBlogPrefs } from "../prefs";

/* Article reader — a functional, light reading page for journal essays
   (and future technical posts), deliberately the opposite of the dark
   cinematic screens: 米白 background with a gray grid, a reading-progress
   bar at the very top, and a sticky table of contents on the right that
   scroll-spies the article's headings. No entrance choreography — content
   is just there to read.

   App routes /blog/<slug> and passes scrollTo (a lenis-backed smooth
   scroll) so the TOC can jump to headings.

   Language + theme come from the blog prefs context: the deck, the article
   body and every label switch with lang; every color is a theme token
   (var(--x)). The animation effects re-run on lang change ([slug, lang])
   because the article HTML is swapped wholesale. */

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export default function ArticleScene({
  slug,
  onClose,
  onOpen,
  scrollTo,
}: {
  slug: string;
  onClose: () => void;
  onOpen: (slug: string) => void;
  scrollTo: (y: number) => void;
}) {
  const { lang } = useBlogPrefs();
  const t = ui[lang];
  const root = useRef<HTMLElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const tocNavRef = useRef<HTMLDivElement>(null);
  const tocIndicatorRef = useRef<HTMLSpanElement>(null);
  const lightboxRef = useRef<HTMLDialogElement>(null);
  const [toc, setToc] = useState<TocItem[]>([]);
  const [lightbox, setLightbox] = useState<{
    src: string;
    alt: string;
    caption: string;
  } | null>(null);
  const article = getArticle(slug, lang);
  const deck = getDeck(lang);
  const i = deck.findIndex((p) => p.slug === slug);
  const prev: JournalPost | null = i > 0 ? deck[i - 1] : null;
  const next: JournalPost | null =
    i >= 0 && i < deck.length - 1 ? deck[i + 1] : null;

  /* Reading progress + TOC scroll-spy — one scroll listener. Progress fills
     the top bar; the active heading is the last one whose top sits above the
     reading line (30% from the top of the viewport), the last heading winning
     at the bottom of the article. Deterministic, no observer timing. Re-runs
     on lang change so the TOC mirrors the active language's headings. */
  useEffect(() => {
    const content = root.current?.querySelector(".article-content");
    const heads = content
      ? Array.from(content.querySelectorAll<HTMLElement>("h2[id], h3[id]"))
      : [];
    setToc(
      heads.map((h) => ({
        id: h.id,
        text: h.textContent ?? "",
        level: h.tagName === "H2" ? 2 : 3,
      })),
    );
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      if (progressRef.current)
        progressRef.current.style.transform = `scaleX(${p})`;
      // Query fresh every frame: heading elements captured at mount go
      // stale (detached) once React re-renders the article.
      const currentHeads = root.current
        ? Array.from(
            root.current.querySelectorAll<HTMLElement>(
              ".article-content h2[id], .article-content h3[id]",
            ),
          )
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
          btn.classList.toggle("text-[var(--ink)]", on);
          btn.classList.toggle("is-active", on);
        });
      // Slide the single rail indicator onto the active entry. The active
      // branch must also restore opacity: the scroll-spy hides the rail when
      // no heading is in view (top of the article), and the inline opacity: 0
      // would otherwise stick forever once a heading enters the reading line.
      const activeBtn =
        tocNavRef.current?.querySelector<HTMLButtonElement>("button.is-active");
      if (tocIndicatorRef.current && activeBtn) {
        tocIndicatorRef.current.style.height = activeBtn.offsetHeight + "px";
        tocIndicatorRef.current.style.transform = `translateY(${activeBtn.offsetTop}px)`;
        tocIndicatorRef.current.style.opacity = "1";
      } else if (tocIndicatorRef.current) {
        tocIndicatorRef.current.style.opacity = "0";
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [slug, lang]);

  /* Code blocks — inject a copy button into every <pre>. The article HTML
     is renderer output, not React-owned, so the button is added via the
     DOM and cleaned up on lang/slug change (the article is re-keyed then). */
  useEffect(() => {
    const content = root.current?.querySelector(".article-content");
    if (!content) return;
    const pres = content.querySelectorAll<HTMLElement>("pre");
    const buttons: HTMLButtonElement[] = [];
    const copyIcon =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>';
    const checkIcon =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12.5 9.5 18 20 6.5"/></svg>';
    pres.forEach((pre) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "code-copy";
      btn.setAttribute("aria-label", t.copyCode);
      btn.title = t.copyCode;
      btn.innerHTML = copyIcon;
      btn.addEventListener("click", async () => {
        const text = pre.querySelector("code")?.textContent ?? "";
        try {
          await navigator.clipboard.writeText(text);
          btn.classList.add("code-copied");
          btn.setAttribute("aria-label", t.copied);
          btn.innerHTML = checkIcon;
          window.setTimeout(() => {
            btn.classList.remove("code-copied");
            btn.setAttribute("aria-label", t.copyCode);
            btn.innerHTML = copyIcon;
          }, 1600);
        } catch {
          /* clipboard unavailable — no feedback needed */
        }
      });
      pre.appendChild(btn);
      buttons.push(btn);
    });
    return () => buttons.forEach((b) => b.remove());
  }, [slug, lang, t]);

  /* Lightbox — showModal on open, close() on dismiss (Esc or backdrop). */
  useEffect(() => {
    const d = lightboxRef.current;
    if (!d) return;
    if (lightbox && !d.open) d.showModal();
    else if (!lightbox && d.open) d.close();
  }, [lightbox]);

  /* Figure images open the lightbox — delegated so renderer HTML needs no
     per-image wiring. */
  const onArticleClick = (e: React.MouseEvent<HTMLElement>) => {
    const img = (e.target as HTMLElement).closest<HTMLImageElement>(
      "figure img",
    );
    if (!img) return;
    const fig = img.closest("figure");
    const caption =
      fig?.querySelector("figcaption")?.textContent?.trim() ??
      img.getAttribute("alt") ??
      "";
    setLightbox({
      src: img.getAttribute("src") ?? "",
      alt: img.getAttribute("alt") ?? "",
      caption,
    });
  };

  // App only ever opens known slugs — an unknown /blog/<slug> is redirected
  // to the root as a 404 (the same 404.html flow as every unknown URL), so
  // this branch is defensive only.
  /* Mount entrance — the header (back link, title, meta) rises in as the
     essay opens. Functional, quick, no mask tricks. Replays on lang change
     as a natural transition between the two language versions. */
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-art-head]",
        { y: 22, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.55,
          ease: "power3.out",
          stagger: 0.07,
        },
      );
    }, root);
    return () => ctx.revert();
  }, [slug, lang]);

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
            overwrite: true,
          }),
      });
    }, root);
    return () => ctx.revert();
  }, [slug, lang]);

  /* Related reading — tag Jaccard similarity (|A∩B| / |A∪B|), same-column
     posts weighted +0.2, newest first on ties; never the current article.
     With zero tag overlap the scoring degenerates to same-column recency,
     so the fallback is built into the sort rather than a separate branch. */
  const related = useMemo(() => {
    if (!article) return [];
    const tags = article.post.tags;
    const sid = article.post.sectionId;
    return deck
      .filter((p) => p.slug !== article.post.slug)
      .map((p) => {
        const overlap = p.tags.filter((tg) => tags.includes(tg)).length;
        const union = new Set([...p.tags, ...tags]).size || 1;
        let s = overlap / union;
        // Same-section bonus uses the language-independent key.
        if (sid && p.sectionId === sid) s += 0.2;
        return { post: p, s };
      })
      .sort((a, b) => b.s - a.s || b.post.date.localeCompare(a.post.date))
      .slice(0, 3)
      .map((x) => x.post);
  }, [article, deck]);

  if (!article) return null;
  const { post } = article;

  /* The column's editorial glyph for the author card — looked up by the
     language-independent sectionId, never by matching the localized
     category against the current UI language. Falls back to a neutral
     quill when the post belongs to no known section. */
  const sectionSymbol =
    sections.find((s) => s.id === post.sectionId)?.symbol ?? "✎";

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
        backgroundColor: "var(--bg)",
        backgroundImage:
          "linear-gradient(var(--grid) 1px, transparent 1px), linear-gradient(90deg, var(--grid) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }}
    >
      {/* reading progress — accent fill, rounded head */}
      <div className="fixed inset-x-0 top-0 z-[40] h-[3px] bg-[var(--progress-track)]">
        <div
          ref={progressRef}
          className="h-full w-full origin-left rounded-r-full bg-[var(--accent)]"
          style={{ transform: "scaleX(0)" }}
        />
      </div>

      <div className="mx-auto max-w-[1080px] px-[clamp(16px,4vw,40px)] pb-[clamp(80px,14vh,160px)] pt-[clamp(24px,4vh,48px)]">
        {/* top bar: back + meta */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] tracking-[0.18em] text-[var(--faint)]">
          <button
            onClick={onClose}
            data-art-head
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
          <span data-art-head>
            {post.category} · {post.date} · {post.read}
          </span>
        </div>

        {/* header */}
        <header className="mt-[clamp(40px,7vh,72px)]">
          <h1
            data-art-head
            className="font-sans text-[clamp(26px,3.4vw,44px)] font-bold leading-[1.15] tracking-[-0.01em] text-[var(--ink)]"
          >
            {post.title.split("\n").join(" ")}
          </h1>
          <div
            data-art-head
            className="mt-[clamp(18px,3vh,28px)] flex flex-wrap gap-2"
          >
            {post.tagLabels.map((label, i) => (
              <span
                key={post.tags[i] ?? label}
                className="rounded-full border border-[var(--border-soft)] px-3 py-1 text-[10px] font-medium tracking-[0.2em] text-[var(--muted-2)]"
              >
                {label.toUpperCase()}
              </span>
            ))}
          </div>
        </header>

        {/* content + right TOC */}
        {/* Mobile: collapsible TOC above the article (desktop keeps the
            sticky right rail below). */}
        {toc.length > 0 && (
          <details className="mobile-toc mb-[clamp(24px,4vh,40px)] border-b border-[var(--border)] pb-[10px] lg:hidden">
            <summary className="flex cursor-pointer select-none items-center gap-2 py-1 text-[10px] font-semibold tracking-[0.3em] text-[var(--fainter)]">
              {t.onThisPage()}
              <span className="rounded-full bg-[var(--accent-soft)] px-2 py-0.5 text-[9px] tabular-nums tracking-[0.1em] text-[var(--accent)]">
                {toc.length}
              </span>
            </summary>
            <nav className="mt-[10px] flex flex-col gap-[2px] border-l border-[var(--border)] pl-[14px]">
              {toc.map((item) => (
                <button
                  key={item.id}
                  onClick={() => jump(item.id)}
                  className={`flex min-h-[44px] items-center text-left text-[13px] leading-snug transition-colors hover:text-[var(--ink)] ${
                    item.level === 3
                      ? "pl-[12px] text-[var(--faint)]"
                      : "text-[var(--muted)]"
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
            key={lang}
            className="article-content min-w-0"
            onClick={onArticleClick}
            dangerouslySetInnerHTML={{ __html: article.html }}
          />

          {/* table of contents — sticky right rail (desktop only) */}
          {toc.length > 0 && (
            <aside className="hidden lg:block">
              <div className="sticky top-[24px]">
                <p className="flex items-center justify-between gap-2 text-[10px] font-semibold tracking-[0.3em] text-[var(--fainter)]">
                  {t.onThisPage()}
                  <button
                    type="button"
                    onClick={() => scrollTo(0)}
                    className="inline-flex items-center gap-1 text-[9px] tracking-[0.24em] text-[var(--faintest)] transition-colors hover:text-[var(--accent)]"
                  >
                    ↑ {t.backToTop}
                  </button>
                </p>
                <nav
                  ref={tocNavRef}
                  className="relative mt-[14px] flex flex-col gap-[6px] border-l border-[var(--border)] pl-[14px]"
                >
                  <span
                    ref={tocIndicatorRef}
                    aria-hidden
                    className="toc-indicator"
                  />
                  {toc.map((item) => (
                    <button
                      key={item.id}
                      data-toc-id={item.id}
                      onClick={() => jump(item.id)}
                      className={`toc-item text-left text-[13px] leading-snug transition-colors hover:text-[var(--ink)] ${
                        item.level === 3
                          ? "pl-[12px] text-[var(--faint)]"
                          : "text-[var(--muted)]"
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

        {/* ---- footer: author · tags · related ---- */}
        <div className="mt-[clamp(56px,10vh,96px)] border-t border-[var(--border)] pt-[clamp(24px,4vh,40px)]">
          {/* author card — byline from frontmatter, site name as fallback */}
          <div className="flex items-center gap-4 rounded-[var(--radius-card)] border border-[var(--border-faint)] bg-[var(--card-bg)] p-[clamp(16px,2.5vw,22px)]">
            <span
              aria-hidden
              className="flex h-10 w-10 flex-none items-center justify-center rounded-full border border-[color-mix(in_srgb,var(--accent)_35%,transparent)] bg-[var(--accent-soft)] font-fraunces text-[15px] italic leading-none text-[var(--accent)]"
            >
              {sectionSymbol}
            </span>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-[var(--ink)]">
                {post.author ?? "EVERVERDANTS"}
              </p>
              <p className="mt-0.5 text-[10px] tracking-[0.22em] text-[var(--fainter)]">
                {post.category} · {post.date}
              </p>
            </div>
            <a
              href="/"
              className="ml-auto shrink-0 text-[10px] font-medium tracking-[0.24em] text-[var(--muted)] transition-colors hover:text-[var(--accent)]"
            >
              {t.visitMain} ↗
            </a>
          </div>

          {/* tags — clickable, jump back to the index with the tag active.
              href carries the language-independent id so the deep link
              filters the same posts in either language. */}
          {post.tags.length > 0 && (
            <div className="mt-[clamp(28px,5vh,44px)]">
              <p className="text-[10px] font-semibold tracking-[0.3em] text-[var(--fainter)]">
                {t.taggedUnder}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {post.tags.map((tag, i) => (
                  <a
                    key={tag}
                    href={`/blog?tag=${encodeURIComponent(tag)}`}
                    className="rounded-full border border-[var(--border)] bg-[var(--chip)] px-3.5 py-1.5 text-[10px] font-medium tracking-[0.18em] text-[var(--muted-2)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
                  >
                    {post.tagLabels[i]?.toUpperCase() ?? tag.toUpperCase()}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* related reading — tag Jaccard top 3 */}
          {related.length > 0 && (
            <div className="mt-[clamp(32px,5vh,48px)]">
              <p className="text-[10px] font-semibold tracking-[0.3em] text-[var(--fainter)]">
                {t.related}
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {related.map((r) => (
                  <button
                    key={r.slug}
                    onClick={() => onOpen(r.slug)}
                    className="group rounded-[var(--radius-card)] border border-[var(--border-faint)] bg-[var(--card-bg)] p-4 text-left transition-all duration-300 hover:-translate-y-[1px] hover:border-[color-mix(in_srgb,var(--accent)_35%,var(--border-faint))]"
                  >
                    <p className="line-clamp-2 text-[13px] font-semibold leading-[1.5] text-[var(--ink-2)] transition-colors group-hover:text-[var(--accent)]">
                      {r.title.split("\n").join(" ")}
                    </p>
                    <p className="mt-2 text-[10px] tracking-[0.16em] text-[var(--fainter)]">
                      {r.date} · {r.read}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* prev / next */}
        <nav className="mt-[clamp(40px,7vh,64px)] grid gap-4 border-t border-[var(--border)] pt-[clamp(24px,4vh,40px)] sm:grid-cols-2">
          {prev ? (
            <button
              onClick={() => onOpen(prev.slug)}
              className="group text-left"
            >
              <span className="inline-flex items-center gap-1 text-[10px] tracking-[0.3em] text-[var(--fainter)] transition-transform duration-300 group-hover:-translate-x-1">
                {t.previous}
              </span>
              <span className="mt-2 block font-medium text-[var(--ink-2)] transition-colors group-hover:text-[var(--accent)]">
                {prev.title.split("\n").join(" ")}
              </span>
            </button>
          ) : (
            <span aria-hidden />
          )}
          {next ? (
            <button
              onClick={() => onOpen(next.slug)}
              className="group text-right sm:col-start-2"
            >
              <span className="inline-flex items-center gap-1 text-[10px] tracking-[0.3em] text-[var(--fainter)] transition-transform duration-300 group-hover:translate-x-1">
                {t.next}
              </span>
              <span className="mt-2 block font-medium text-[var(--ink-2)] transition-colors group-hover:text-[var(--accent)]">
                {next.title.split("\n").join(" ")}
              </span>
            </button>
          ) : (
            <span aria-hidden />
          )}
        </nav>

        <p className="mt-[clamp(40px,8vh,80px)] text-center text-[11px] tracking-[0.3em] text-[var(--faintest)]">
          {t.end(journal.close.year)}
        </p>
      </div>

      {/* image lightbox — native dialog: Esc or backdrop click dismisses */}
      <dialog
        ref={lightboxRef}
        onClose={() => setLightbox(null)}
        onClick={(e) => {
          if (e.target === e.currentTarget) setLightbox(null);
        }}
        className="m-auto max-w-none border-0 bg-transparent p-0 backdrop:bg-[rgba(18,16,12,0.88)]"
      >
        {lightbox && (
          <figure className="text-center">
            <img
              src={lightbox.src}
              alt={lightbox.alt}
              className="max-h-[82vh] w-auto max-w-[min(92vw,1200px)] rounded-xl border border-[var(--border-strong)] bg-[var(--chip)]"
            />
            {lightbox.caption && (
              <figcaption className="mt-4 text-[11px] tracking-[0.14em] text-[#d8d4c8]">
                {lightbox.caption}
              </figcaption>
            )}
          </figure>
        )}
      </dialog>
    </section>
  );
}
