import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import type { JournalPost } from "../../data/journal";
import { journal } from "../../data/journal";
import { getDeck, loadArticle } from "../../data/articles";
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
  onNotFound,
  scrollTo,
  scrollToImmediate,
}: {
  slug: string;
  onClose: () => void;
  onOpen: (slug: string) => void;
  onNotFound: () => void;
  scrollTo: (y: number) => void;
  scrollToImmediate: (y: number) => void;
}) {
  const { lang } = useBlogPrefs();
  const t = ui[lang];
  const root = useRef<HTMLElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const tocNavRef = useRef<HTMLDivElement>(null);
  const tocIndicatorRef = useRef<HTMLSpanElement>(null);
  const tocScrollbarRef = useRef<HTMLDivElement>(null);
  const tocThumbRef = useRef<HTMLDivElement>(null);
  const lightboxRef = useRef<HTMLDialogElement>(null);
  /* Language swaps keep the reader's place: htmlRef tracks the body
     currently on screen, restoreRef remembers where the reader was before
     the body is swapped, so the new-language body lands on the same
     heading at the same viewport offset. */
  const htmlRef = useRef<string | null>(null);
  const restoreRef = useRef<{
    idx: number;
    offset: number;
    fraction: number;
  } | null>(null);
  /* TOC auto-follow state */
  const lastActiveRef = useRef("");
  const followRafRef = useRef(0);
  /* Which article the TOC currently belongs to — used to reset the nav's
     own scroll when a new article replaces the index (a long-index article
     must never leave the next one scrolled mid-list). */
  const tocSlugRef = useRef<string | null>(null);
  /* Animation gating — entrances/reveals run for a fresh article only,
     never for an in-place language swap (which must not flash). */
  const prevSlugRef = useRef<string | null>(null);
  const prevLangRef = useRef(lang);
  const [toc, setToc] = useState<TocItem[]>([]);
  const [lightbox, setLightbox] = useState<{
    src: string;
    alt: string;
    caption: string;
  } | null>(null);
  const deck = getDeck(lang);

  /* Metadata comes from the build-time index, so the header renders
     instantly while the essay's own chunk streams in. An unknown slug
     reports back to App (onNotFound) instead of rendering an error. */
  const i = deck.findIndex((p) => p.slug === slug);
  const post: JournalPost | null = i >= 0 ? deck[i] : null;
  const prev: JournalPost | null = i > 0 ? deck[i - 1] : null;
  const next: JournalPost | null =
    i >= 0 && i < deck.length - 1 ? deck[i + 1] : null;

  /* The body — fetched on demand the first time this essay is opened.
     On a deep link the prerendered static shell already carries the
     rendered body inside #root; reusing it as the initial content means
     React takes over without a skeleton flash. The lazy fetch still runs
     and lands on identical HTML. */
  const [html, setHtml] = useState<string | null>(() => {
    const el = document.querySelector("#root .article-content");
    return el && el.innerHTML.trim().length > 300 ? el.innerHTML : null;
  });
  const [failed, setFailed] = useState(false);
  const [retry, setRetry] = useState(0);

  /* Keep a ref of the body currently on screen — read by the load effect
     to decide how to swap (fresh load vs in-place language swap). */
  useEffect(() => {
    htmlRef.current = html;
  }, [html]);

  /* Reading-position memory: capture where the reader is (the active
     heading by INDEX — translations mirror their structure, so the same
     index lands on the same section) before a language swap replaces the
     body, then restore the same viewport offset once the new body is
     laid out. Fallback: scroll fraction. */
  const captureReadingPosition = () => {
    const heads = root.current?.querySelectorAll<HTMLElement>(
      ".article-content h2[id], .article-content h3[id]",
    );
    const line = window.innerHeight * 0.3;
    let idx = -1;
    if (heads) {
      for (let k = 0; k < heads.length; k++) {
        if (heads[k].getBoundingClientRect().top <= line) idx = k;
        else break;
      }
    }
    // Always record the scroll fraction too — the idx/offset pairing is the
    // primary restore key, but if the other language's heading list differs
    // in length (translations usually mirror, not always), the fraction is
    // the honest fallback instead of a bogus 0.
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const fraction = max > 0 ? window.scrollY / max : 0;
    if (idx >= 0 && heads) {
      const r = heads[idx].getBoundingClientRect();
      return { idx, offset: r.top - line, fraction };
    }
    return { idx: -1, offset: 0, fraction };
  };

  const restoreReadingPosition = () => {
    const cap = restoreRef.current;
    restoreRef.current = null;
    if (!cap) return;
    // Reader was pinned at the very bottom — the fraction is the exact
    // target. (The languages' heading lists sometimes differ in length, so
    // an index-anchored restore would land a section short of the footer.)
    if (cap.fraction >= 0.98) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      scrollToImmediate(max * cap.fraction);
      return;
    }
    const heads = root.current?.querySelectorAll<HTMLElement>(
      ".article-content h2[id], .article-content h3[id]",
    );
    let y: number;
    if (heads && heads.length && cap.idx >= 0) {
      // Clamp to the last heading when the translation has fewer headings —
      // an out-of-range index must never fall through to the fraction
      // branch with a stale value (that used to land readers at the top).
      const target = heads[Math.min(cap.idx, heads.length - 1)];
      const r = target.getBoundingClientRect();
      // Put the heading back where it was: same viewport top as before.
      y = r.top + window.scrollY - window.innerHeight * 0.3 - cap.offset;
    } else {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      y = max * cap.fraction;
    }
    scrollToImmediate(y);
  };

  /* Smoothly scroll the TOC container so the active entry sits centered
     (or at least in view) — the same easing language as the page's lenis,
     applied to the nav's own scrollTop via a small rAF tween. Retargets
     cleanly if the active entry changes mid-tween. */
  const followActive = (btn: HTMLButtonElement) => {
    const nav = tocNavRef.current;
    if (!nav) return;
    const nRect = nav.getBoundingClientRect();
    const bRect = btn.getBoundingClientRect();
    const pad = 6;
    if (bRect.top >= nRect.top + pad && bRect.bottom <= nRect.bottom - pad)
      return; // already visible
    const target =
      nav.scrollTop +
      (bRect.top - nRect.top) -
      (nRect.height - bRect.height) / 2;
    const start = nav.scrollTop;
    const dist = target - start;
    if (Math.abs(dist) < 1) return;
    const dur = 260;
    const t0 = performance.now();
    if (followRafRef.current) cancelAnimationFrame(followRafRef.current);
    const ease = (k: number) => 1 - Math.pow(1 - k, 3);
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / dur);
      nav.scrollTop = start + dist * ease(k);
      followRafRef.current = k < 1 ? requestAnimationFrame(step) : 0;
    };
    followRafRef.current = requestAnimationFrame(step);
  };

  /* The TOC is its own scroll container with a custom overlay scrollbar
     (the page's slim bar, applied to the nav's scrollport). Smooth scrolling
     runs on the same library the page uses — a lenis instance rooted at the
     nav — so fast flicks get proper velocity easing instead of a hand-rolled
     lerp's jitter. Lenis's nested-scroll propagation passes the wheel back
     to the page at the container's ends (scroll chaining), so no manual
     event juggling is needed. The thumb is draggable, tracks every scrollTop
     change, and hides entirely when nothing overflows. */
  useEffect(() => {
    const nav = tocNavRef.current;
    const bar = tocScrollbarRef.current;
    const thumb = tocThumbRef.current;
    if (!nav || !bar || !thumb) return;

    const updateThumb = () => {
      const sh = nav.scrollHeight - nav.clientHeight;
      if (sh <= 0) {
        bar.classList.remove("has-thumb");
        return;
      }
      bar.classList.add("has-thumb");
      const track = bar.clientHeight;
      const h = Math.max(20, (nav.clientHeight / nav.scrollHeight) * track);
      thumb.style.height = h + "px";
      thumb.style.top = (nav.scrollTop / sh) * (track - h) + "px";
    };
    updateThumb();

    /* smooth wheel scrolling — lenis on the nav as its own scrollport */
    const tocLenis = new Lenis({
      wrapper: nav,
      content: nav,
      lerp: 0.1,
      smoothWheel: true,
      autoRaf: true,
    });

    /* drag the thumb — direct manipulation; pause the smooth loop while
       the pointer is down so the two never fight */
    const onThumbDown = (e: MouseEvent) => {
      const sh = nav.scrollHeight - nav.clientHeight;
      if (sh <= 0) return;
      e.preventDefault();
      e.stopPropagation();
      tocLenis.stop();
      const startY = e.clientY;
      const startTop = parseFloat(thumb.style.top || "0");
      bar.classList.add("dragging");
      const onMove = (ev: MouseEvent) => {
        const track = bar.clientHeight;
        const max = track - thumb.offsetHeight;
        const top = Math.max(
          0,
          Math.min(max, startTop + (ev.clientY - startY)),
        );
        thumb.style.top = top + "px";
        if (max > 0) nav.scrollTop = (top / max) * sh;
      };
      const onUp = () => {
        bar.classList.remove("dragging");
        tocLenis.start();
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    };
    thumb.addEventListener("mousedown", onThumbDown);

    /* keep the thumb in sync with any scrollTop change (lenis wheel, drag,
       or the follow-active tween) and with size changes */
    nav.addEventListener("scroll", updateThumb, { passive: true });
    const ro = new ResizeObserver(() => {
      updateThumb();
      tocLenis.resize();
    });
    ro.observe(nav);

    return () => {
      nav.removeEventListener("scroll", updateThumb);
      thumb.removeEventListener("mousedown", onThumbDown);
      ro.disconnect();
      tocLenis.destroy();
    };
  }, [toc, lang, html]);

  /* Cancel any in-flight TOC follow tween on unmount. */
  useEffect(() => {
    return () => {
      if (followRafRef.current) cancelAnimationFrame(followRafRef.current);
    };
  }, []);

  /* Body loading — on demand. A language swap does NOT blank the screen
     (no skeleton flash, no height collapse): the old-language body stays
     up while the new one streams in, then swaps in place at the same
     scroll offset. A slug that has no body in the target language keeps
     showing what's on screen (graceful) instead of kicking the reader
     back to the index; a genuinely unknown slug on first load still
     reports not-found. */
  useEffect(() => {
    let alive = true;
    const langChanged = prevLangRef.current !== lang;
    prevLangRef.current = lang;
    if (langChanged) {
      if (htmlRef.current) restoreRef.current = captureReadingPosition();
    } else {
      // Fresh article (or retry) — never carry a stale restore forward.
      restoreRef.current = null;
    }
    setFailed(false);
    loadArticle(slug, lang)
      .then((a) => {
        if (!alive) return;
        if (!a) {
          if (!htmlRef.current) onNotFound();
          return;
        }
        setHtml(a.html);
        if (langChanged && restoreRef.current) {
          // Two frames: the new body's headings and fonts must settle
          // before the offset can be restored.
          requestAnimationFrame(() =>
            requestAnimationFrame(() => {
              if (alive) restoreReadingPosition();
            }),
          );
        }
      })
      .catch(() => {
        if (alive) setFailed(true);
      });
    return () => {
      alive = false;
    };
  }, [slug, lang, onNotFound, retry]);

  /* Reading progress + TOC scroll-spy — one scroll listener. Progress fills
     the top bar; the active heading is the last one whose top sits above the
     reading line (30% from the top of the viewport), the last heading winning
     at the bottom of the article. Deterministic, no observer timing. Re-runs
     on lang change so the TOC mirrors the active language's headings. */
  useEffect(() => {
    // A new article replaced the index — clear the OLD index immediately
    // (it must never linger while the new body streams in — that reads as
    // "the TOC didn't update"), and start the nav's own scroll from the
    // top again so a long-index article never leaves the next one scrolled
    // into the middle or clamped with a stale thumb. The real index lands
    // with the new body (the html effect below re-runs and fills it).
    const newArticle = tocSlugRef.current !== slug;
    if (newArticle) {
      tocSlugRef.current = slug;
      const nav = tocNavRef.current;
      if (nav) nav.scrollTop = 0;
      // Drop any in-flight follow tween and stale active tracking — the
      // new article's index gets a clean scroll-spy pass.
      if (followRafRef.current) {
        cancelAnimationFrame(followRafRef.current);
        followRafRef.current = 0;
      }
      lastActiveRef.current = "";
    }
    // On a fresh article there is nothing to scan yet (the body is still
    // the previous one) — treat the index as empty instead of rebuilding
    // it from the old article's headings.
    const content = newArticle
      ? null
      : root.current?.querySelector(".article-content");
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
      // Auto-follow: keep the active entry inside the TOC's scrollable
      // viewport — as the page scrolls, the rail recenters on the section
      // being read (only when the active entry actually changes).
      if (current !== lastActiveRef.current) {
        lastActiveRef.current = current;
        const activeEntry = Array.from(
          tocNavRef.current?.querySelectorAll<HTMLButtonElement>(
            "button[data-toc-id]",
          ) ?? [],
        ).find((b) => b.dataset.tocId === current);
        if (activeEntry) followActive(activeEntry);
      }
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
  }, [slug, lang, html]);

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
      // Live in the header strip (language left, button right) so wide
      // code scrolling underneath never carries the button away.
      const head = pre.querySelector<HTMLElement>(".code-head");
      if (head) head.appendChild(btn);
      else pre.appendChild(btn);
      buttons.push(btn);
    });
    return () => buttons.forEach((b) => b.remove());
  }, [slug, lang, html, t]);

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
     essay opens. Functional, quick, no mask tricks. Runs once per article
     (slug change); a language swap swaps the header text in place so the
     reader's eye never loses the scroll position. */
  useEffect(() => {
    const first = prevSlugRef.current === null;
    const slugChanged = prevSlugRef.current !== slug;
    prevSlugRef.current = slug;
    if (!first && !slugChanged) return;
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
     created here, scoped to this root. Re-runs when the on-demand body
     arrives (html state) — before that there is nothing to reveal. A
     language swap is skipped entirely (restoreRef is set for exactly that
     case): the new body lands fully visible at the same scroll offset, so
     a block fade-in would read as a flash. */
  useEffect(() => {
    if (restoreRef.current) return;
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
  }, [slug, lang, html]);

  /* Related reading — tag Jaccard similarity (|A∩B| / |A∪B|), same-column
     posts weighted +0.2, newest first on ties; never the current article.
     With zero tag overlap the scoring degenerates to same-column recency,
     so the fallback is built into the sort rather than a separate branch. */
  const related = useMemo(() => {
    if (!post) return [];
    const tags = post.tags;
    const sid = post.sectionId;
    return deck
      .filter((p) => p.slug !== post.slug)
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
  }, [post, deck]);

  /* Unknown slug — the load effect has already called onNotFound and App
     is swapping back to the index; render nothing on this frame. */
  if (!post) return null;

  /* The column's editorial glyph for the author card — looked up by the
     language-independent sectionId, never by matching the localized
     category against the current UI language. Falls back to a neutral
     quill when the post belongs to no known section. */
  const sectionSymbol =
    sections.find((s) => s.id === post.sectionId)?.symbol ?? "✎";

  const jump = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    /* Clear the fixed top bar (up to ~112px) so a TOC jump never lands a
       heading underneath it. */
    const clear = Math.max(88, window.innerHeight * 0.12);
    scrollTo(el.getBoundingClientRect().top + window.scrollY - clear);
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

      <div className="mx-auto max-w-[1080px] px-[clamp(16px,4vw,40px)] pb-[clamp(80px,14vh,160px)] pt-[clamp(88px,11vh,112px)]">
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
            <nav className="toc-nav mt-[10px] flex flex-col gap-[2px] border-l border-[var(--border)] pl-[14px]">
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
          {/* body — on-demand: a quiet skeleton while the essay's own
              chunk streams in, an editorial error state on failure */}
          {html ? (
            <article
              key={lang}
              className="article-content min-w-0"
              onClick={onArticleClick}
              dangerouslySetInnerHTML={{ __html: html }}
            />
          ) : failed ? (
            <div className="min-w-0" role="alert">
              <p className="text-[12px] tracking-[0.3em] text-[var(--faint)]">
                {t.loadFailed}
              </p>
              <button
                onClick={() => setRetry((n) => n + 1)}
                className="mt-5 inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-4 py-2 text-[10px] font-semibold tracking-[0.24em] text-[var(--muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
              >
                {t.retry} ↻
              </button>
            </div>
          ) : (
            <div
              className="article-skeleton min-w-0"
              aria-busy="true"
              aria-label={t.loading}
            >
              <p className="mb-6 text-[10px] font-semibold tracking-[0.34em] text-[var(--fainter)]">
                {t.loading}
              </p>
              <div className="space-y-3.5">
                <div className="h-3.5 w-2/3 animate-pulse rounded-[2px] bg-[var(--border)]" />
                <div className="h-3.5 w-full animate-pulse rounded-[2px] bg-[var(--border)]" />
                <div className="h-3.5 w-11/12 animate-pulse rounded-[2px] bg-[var(--border)]" />
                <div className="h-3.5 w-4/5 animate-pulse rounded-[2px] bg-[var(--border)]" />
                <div className="h-3.5 w-[92%] animate-pulse rounded-[2px] bg-[var(--border)]" />
              </div>
            </div>
          )}

          {/* table of contents — sticky right rail (desktop only) */}
          {toc.length > 0 && (
            <aside className="hidden lg:block">
              <div className="sticky top-[clamp(88px,11vh,112px)]">
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
                <div className="toc-scroll relative mt-[14px]">
                  <nav
                    ref={tocNavRef}
                    className="toc-nav relative flex flex-col gap-[6px] border-l border-[var(--border)] pl-[14px] pr-[12px]"
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
                  <div
                    ref={tocScrollbarRef}
                    className="toc-scrollbar"
                    aria-hidden="true"
                  >
                    <div ref={tocThumbRef} className="toc-scrollbar-thumb" />
                  </div>
                </div>
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
