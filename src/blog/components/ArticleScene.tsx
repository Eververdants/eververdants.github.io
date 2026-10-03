import { useEffect, useMemo, useRef, useState } from "react";
import type { JournalPost } from "../../data/journal";
import { journal, topicById } from "../../data/journal";
import { getDeck, loadArticle } from "../../data/articles";
import { sections } from "../../data/sections";
import { usePrefs } from "../../shared/prefs-react";
import { pick } from "../../shared/prefs";
import { applyHead, breadcrumbLd, PERSON, SITE } from "../../shared/seo";
import { scrollToEl, scrollToY, refreshScroll } from "../../shared/smooth";
import { streamHtml } from "../../shared/stream";
import { endProgress, startProgress, stepProgress } from "../../shared/progress";
import { articlePath, isPlainClick } from "../urls";
import { ui } from "../copy";

/* Article reader — a functional reading page. 米白 background with a faint
   grid, a reading-progress bar at the very top, and a sticky table of
   contents on the right that scroll-spies the article's headings. There is no
   entrance choreography: the essay is simply there to read.

   The body loads on demand (one chunk per essay) and the language is part of
   the URL — /blog/<slug>/ and /blog/zh/<slug>/ are different pages with their
   own canonical and an hreflang pair to each other, so both languages are
   indexable instead of only whichever one got baked. */

interface TocItem {
  id: string;
  text: string;
  level: number;
}

/* Scrolling goes through the shared layer (src/shared/smooth.ts): while
   Lenis holds an animated position, a raw window.scrollTo is snapped
   back on its next frame — the reader would see the heading land and
   then slide away. scrollToEl applies the top-bar clearance itself. */

export default function ArticleScene({
  slug,
  onClose,
  onOpen,
  onNotFound,
}: {
  slug: string;
  onClose: () => void;
  onOpen: (slug: string) => void;
  onNotFound: () => void;
}) {
  const { lang } = usePrefs();
  const t = ui[lang];
  const root = useRef<HTMLElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const tocNavRef = useRef<HTMLDivElement>(null);
  const tocIndicatorRef = useRef<HTMLSpanElement>(null);
  const lightboxRef = useRef<HTMLDialogElement>(null);
  /* Language swaps keep the reader's place: htmlRef tracks the body
     currently on screen, restoreRef remembers where the reader was before
     the body is swapped, so the new-language body lands on the same
     heading at the same viewport offset. */
  const htmlRef = useRef<string | null>(null);
  /* Whether the next body should be streamed in chunks. True only for
     an in-app jump to a different essay — see shared/stream.ts for why
     a deep link and a language swap must never stream. */
  const streamMode = useRef(false);
  const streamToken = useRef(0);
  const bodyRef = useRef<HTMLElement>(null);
  const restoreRef = useRef<{
    idx: number;
    offset: number;
    fraction: number;
  } | null>(null);
  /* TOC auto-follow state */
  const lastActiveRef = useRef("");
  /* Which article the TOC currently belongs to — used to reset the nav's
     own scroll when a new article replaces the index (a long-index article
     must never leave the next one scrolled mid-list). */
  const tocSlugRef = useRef<string | null>(null);
  const prevLangRef = useRef(lang);
  /* The slug this scene currently holds — the component is NOT re-keyed on
     slug (App keeps the same instance across prev/next/related jumps), so
     the load effect is what must notice a different essay arriving. */
  const prevSlugRef = useRef(slug);
  const [toc, setToc] = useState<TocItem[]>([]);
  /* Share feedback. "done" / "link" are the two transient confirmations;
     the button label swaps for 2s and then reverts, so the reader is
     told something happened without a toast layer. */
  const [shared, setShared] = useState<"idle" | "done" | "link">("idle");
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
  /* Bumped when a streamed body finishes landing. Everything that reads
     the article's DOM for its own structure (the TOC, the code-copy
     buttons, the lightbox wiring) depends on it, because a streamed
     article only has its first batch on the frame `html` changes. */
  const [streamTick, setStreamTick] = useState(0);

  /* Keep a ref of the body currently on screen — read by the load effect
     to decide how to swap (fresh load vs in-place language swap). */
  useEffect(() => {
    htmlRef.current = html;
  }, [html]);

  /* Insert the body. The <article> owns no React children, so this module
     can write into it directly — and it has to, because React's
     dangerouslySetInnerHTML re-parses the *whole* string on every change,
     which would make a chunked insert O(n²) and re-request every image.
     On the paths that must not stream (deep link, language swap) this is
     a single replaceChildren — see shared/stream.ts. */
  useEffect(() => {
    const el = bodyRef.current;
    if (!el || !html) return;
    streamToken.current += 1;
    return streamHtml(el, html, {
      progressive: streamMode.current,
      token: streamToken,
      onBatch: stepProgress,
      onDone: () => {
        endProgress();
        /* A batch landed, so the document is taller than Lenis thinks. */
        refreshScroll();
        /* The TOC and the code-copy buttons are built from the DOM —
           rebuild them now that every heading actually exists. */
        setStreamTick((n) => n + 1);
      },
    });
    /* lang is a dependency as well as html: the <article> is keyed on
       it, so a language swap remounts the node and the effect has to
       refill it even when the two translations happen to produce the
       same string. */
  }, [html, slug, lang]);

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
      scrollToY(max * cap.fraction, true);
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
    scrollToY(y, true);
  };

  /* Keep the active entry inside the TOC's own scrollport as the reader
     moves down the article. The nav is a plain overflow container now, so
     this is one call rather than a tween loop competing with a scroll
     library. */
  const followActive = (btn: HTMLButtonElement) => {
    const nav = tocNavRef.current;
    if (!nav) return;
    const nRect = nav.getBoundingClientRect();
    const bRect = btn.getBoundingClientRect();
    const pad = 6;
    if (bRect.top >= nRect.top + pad && bRect.bottom <= nRect.bottom - pad)
      return; // already visible
    nav.scrollTo({
      top:
        nav.scrollTop +
        (bRect.top - nRect.top) -
        (nRect.height - bRect.height) / 2,
      behavior: "smooth",
    });
  };

  /* Body loading — on demand. A language swap does NOT blank the screen
     (no skeleton flash, no height collapse): the old-language body stays
     up while the new one streams in, then swaps in place at the same
     scroll offset. A slug that has no body in the target language keeps
     showing what's on screen (graceful) instead of kicking the reader
     back to the index; a genuinely unknown slug on first load still
     reports not-found. */
  useEffect(() => {
    let alive = true;
    const slugChanged = prevSlugRef.current !== slug;
    const langChanged = prevLangRef.current !== lang;
    prevSlugRef.current = slug;
    prevLangRef.current = lang;
    if (slugChanged) {
      /* A different essay replaced this one — drop the old body at once.
         Keeping it up (the language-swap trick below) would render the
         previous essay's text under the new one's title while the chunk
         streams in, and if the new slug failed to load the old body would
         sit there forever with onNotFound short-circuited by the stale
         htmlRef. The skeleton flash is the honest state here. */
      setHtml(null);
      restoreRef.current = null;
      /* Client-side navigation: the body is arriving as a chunk into an
         already-painted page, so it can be streamed. A deep link or a
         language swap cannot (shared/stream.ts). */
      streamMode.current = true;
    } else {
      streamMode.current = false;
      if (langChanged) {
        if (htmlRef.current) restoreRef.current = captureReadingPosition();
      } else {
        // Fresh article (or retry) — never carry a stale restore forward.
        restoreRef.current = null;
      }
    }
    setFailed(false);
    /* The bar runs from here until the body's last chunk is in — one
       owner, so it can never be left spinning by a branch below. */
    startProgress();
    loadArticle(slug, lang)
      .then((a) => {
        if (!alive) {
          endProgress();
          return;
        }
        if (!a) {
          if (!htmlRef.current) onNotFound();
          endProgress();
          return;
        }
        setHtml(a.html);
        if (langChanged && !slugChanged && restoreRef.current) {
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
        endProgress();
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
      // Resetting scrollTop also interrupts any in-flight smooth follow.
      const nav = tocNavRef.current;
      if (nav) nav.scrollTop = 0;
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
    /* streamTick: a streamed body only has its first batch on the frame
       `html` changes — without this the index would be built from the
       headings that happen to have landed. */
  }, [slug, lang, html, streamTick]);

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
          /* Clipboard unavailable (permissions / non-secure context): say so
             instead of staying silent — a button that does nothing reads as
             a bug. */
          btn.classList.add("code-copy--failed");
          btn.setAttribute("aria-label", t.copyFailed);
          window.setTimeout(() => {
            btn.classList.remove("code-copy--failed");
            btn.setAttribute("aria-label", t.copyCode);
          }, 1600);
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
  }, [slug, lang, html, streamTick, t]);

  /* Figure images open the lightbox on click, but the delegated handler only
     serves pointers. Make each figure keyboard-operable — focusable, labelled,
     and Enter/Space re-dispatch the same click the pointer would give. */
  useEffect(() => {
    const content = root.current?.querySelector(".article-content");
    if (!content) return;
    const imgs = Array.from(
      content.querySelectorAll<HTMLImageElement>("figure img"),
    );
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault();
      (e.currentTarget as HTMLElement).click();
    };
    imgs.forEach((img) => {
      img.tabIndex = 0;
      img.setAttribute("role", "button");
      img.setAttribute("aria-label", t.openImage);
      img.addEventListener("keydown", onKey);
    });
    return () =>
      imgs.forEach((img) => img.removeEventListener("keydown", onKey));
  }, [html, streamTick, t]);

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

  /* Per-route head. The prerender pass bakes this into the static page, and
     this keeps it true while the reader moves between essays and languages
     without a page load — otherwise every article in a session would report
     the same title and canonical to the browser and to any engine reading
     the live DOM. */
  useEffect(() => {
    if (!post) return;
    const title = post.title.split("\n").join(" ");
    const iso = post.date.replace(/\./g, "-");
    const path = articlePath(post.slug, lang);
    applyHead({
      title: `${title} — ${pick(lang, "Blog", "博客")} — Eververdants`,
      description: post.excerpt || title,
      path,
      ogType: "article",
      publishedTime: iso,
      modifiedTime: iso,
      locale: lang === "zh" ? "zh_CN" : "en_US",
      localeAlternate: lang === "zh" ? ["en_US"] : ["zh_CN"],
      lang,
      alternates: [
        { hreflang: "en", href: articlePath(post.slug, "en") },
        { hreflang: "zh-Hans", href: articlePath(post.slug, "zh") },
        { hreflang: "x-default", href: articlePath(post.slug, "en") },
      ],
      jsonLd: [
        {
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: title,
          description: post.excerpt || undefined,
          datePublished: iso,
          dateModified: iso,
          inLanguage: lang === "zh" ? "zh-Hans" : "en",
          articleSection: post.category || undefined,
          keywords: post.tags.join(", ") || undefined,
          wordCount: post.read ? Number(post.read.replace(/\D/g, "")) * 225 : undefined,
          timeRequired: `PT${post.read.replace(/\D/g, "")}M`,
          mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE}${path}` },
          url: `${SITE}${path}`,
          author: PERSON,
          publisher: PERSON,
        },
        breadcrumbLd([
          { name: "Eververdants", path: "/" },
          { name: pick(lang, "Blog", "博客"), path: "/blog/" },
          { name: title, path },
        ]),
      ],
    });
  }, [post, lang]);

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
    /* scrollToEl applies the top-bar clearance itself, so a TOC jump
       never lands a heading underneath it. */
    scrollToEl(id);
  };

  /* ---- sharing ----
     Web Share on the platforms that have it (mobile, Safari, Windows);
     a clipboard copy everywhere else. Both are "share", so they live on
     one row and neither is ever the only way to get a link — the URL bar
     is still there. */
  const flash = (state: "done" | "link") => {
    setShared(state);
    window.setTimeout(() => setShared("idle"), 2200);
  };

  const share = async () => {
    const url = location.href;
    const title = post ? post.title.split("\n").join(" ") : "";
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      flash("done");
    } catch {
      /* A dismissed share sheet throws AbortError — that is the reader
         changing their mind, not a failure. Fall back to copying the
         link, which is what they probably wanted anyway. */
      try {
        await navigator.clipboard.writeText(url);
        flash("done");
      } catch {
        /* Clipboard blocked (insecure context, permissions): leaving the
           label unchanged would look like a dead button. */
        flash("link");
      }
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(location.href);
      flash("link");
    } catch {
      /* Nothing else to try — say nothing rather than lie. */
    }
  };

  return (
    <section
      ref={root}
      data-article
      className="relative z-[1] min-h-[100dvh]"
    >
      {/* reading progress — a run of 6px blocks with a 4px gap, so the
          bar is *made of* pixels instead of being a smooth line with a
          texture on it. Filled by transform only (see the scroll-spy). */}
      <div
        aria-hidden="true"
        className="fixed inset-x-0 top-0 z-[40] h-[3px]"
      >
        <div
          ref={progressRef}
          className="h-full w-full origin-left"
          style={{
            transform: "scaleX(0)",
            backgroundImage:
              "repeating-linear-gradient(90deg, var(--accent) 0 6px, transparent 6px 10px)",
          }}
        />
      </div>

      <div className="mx-auto max-w-[1080px] px-[clamp(16px,4vw,40px)] pb-[clamp(80px,14vh,160px)] pt-[clamp(88px,11vh,112px)]">
        {/* top bar: back + meta */}
        <div className="rise flex flex-wrap items-center justify-between gap-3 text-[11px] tracking-[0.18em] text-[var(--faint)]">
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
            {t.backToIndex}
          </button>
          <span>
            {post.category} · {post.date} · {post.read}
          </span>
        </div>

        {/* header */}
        <header className="mt-[clamp(40px,7vh,72px)]">
          <h1 className="rise rise-1 font-display text-[clamp(24px,3.2vw,42px)] font-black leading-[1.12] tracking-[-0.03em] text-[var(--ink)] [text-wrap:balance]">
            {post.title.split("\n").join(" ")}
          </h1>
          {/* Meta, on one line under the title: what it is, when, how
              long. Tabular figures so the date never reflows between
              essays, and a hairline above to open the reading area. */}
          {post.excerpt && (
            <p className="mt-[clamp(12px,2vh,18px)] max-w-[62ch] text-[13.5px] leading-[1.75] text-[var(--muted)]">
              {post.excerpt}
            </p>
          )}
          <div className="rise rise-2 mt-[clamp(14px,2.4vh,22px)] flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-[var(--rule-faint)] pb-[clamp(14px,2.4vh,22px)] text-[10px] tracking-[0.2em] text-[var(--faint)]">
            <span className="text-[var(--body)]">{post.category}</span>
            <span aria-hidden className="text-[var(--faintest)]">
              ·
            </span>
            <time className="num" dateTime={post.date.replace(/\./g, "-")}>
              {post.date}
            </time>
            <span aria-hidden className="text-[var(--faintest)]">
              ·
            </span>
            <span className="num">{post.read}</span>
            {/* Share sits with the meta it belongs to rather than as a
                floating rail: two actions, no icons-only buttons. */}
            <span className="ml-auto flex items-center gap-3">
              <button
                type="button"
                onClick={share}
                className="tracking-[0.2em] text-[var(--muted)] transition-colors hover:text-[var(--accent)]"
              >
                {shared === "done" ? t.shared : t.share}
              </button>
              <button
                type="button"
                onClick={copyLink}
                className="tracking-[0.2em] text-[var(--muted)] transition-colors hover:text-[var(--accent)]"
              >
                {shared === "link" ? t.linkCopied : t.copyLink}
              </button>
            </span>
          </div>
          <div className="mt-[clamp(14px,2.4vh,22px)] flex flex-wrap gap-2">
            {post.tagLabels.map((label, i) => (
              <span
                key={post.tags[i] ?? label}
                className="border border-[var(--rule)] px-2.5 py-1 text-[10px] font-medium tracking-[0.18em] text-[var(--faint)]"
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
              <span className="border border-[var(--accent-line)] px-1.5 py-0.5 text-[9px] tabular-nums tracking-[0.1em] text-[var(--accent)]">
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
            /* Children are written imperatively by the streaming effect —
               React must not own them, or every chunk would re-parse the
               whole body. */
            <article
              key={lang}
              ref={bodyRef}
              className="article-content min-w-0"
              data-fx
              onClick={onArticleClick}
            />
          ) : failed ? (
            <div className="min-w-0" role="alert">
              <p className="text-[12px] tracking-[0.3em] text-[var(--faint)]">
                {t.loadFailed}
              </p>
              <button
                onClick={() => setRetry((n) => n + 1)}
                className="mt-5 inline-flex items-center gap-2 border border-[var(--border-strong)] px-4 py-2 text-[10px] font-semibold tracking-[0.24em] text-[var(--muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
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
              <p className="mb-6 text-[10px] font-semibold tracking-[0.34em] text-[var(--faint)]">
                {t.loading}
              </p>
              {/* One plate of grey blocks rather than five shimmering
                  bars: it says "there is a page here, it is arriving",
                  and it reserves roughly a screen so the swap does not
                  throw the reader's scroll position. */}
              <div
                className="px-skeleton h-[min(46vh,340px)]"
                aria-hidden="true"
              />
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
                    onClick={() => scrollToY(0)}
                    className="inline-flex items-center gap-1 text-[9px] tracking-[0.24em] text-[var(--faint)] transition-colors hover:text-[var(--accent)]"
                  >
                    ↑ {t.backToTop}
                  </button>
                </p>
                <div className="toc-scroll relative mt-[14px]">
                  {/* data-lenis-prevent: the rail is its own scrollport.
                      Without it Lenis would swallow the wheel over the
                      TOC and scroll the article instead. */}
                  <nav
                    ref={tocNavRef}
                    data-lenis-prevent
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
                </div>
              </div>
            </aside>
          )}
        </div>

        {/* ---- footer: author · tags · related ---- */}
        <div className="mt-[clamp(56px,10vh,96px)] border-t border-[var(--border)] pt-[clamp(24px,4vh,40px)]">
          {/* author card — byline from frontmatter, site name as fallback */}
          <div className="flex items-center gap-4 border-l-2 border-[var(--rule-heavy)] py-1 pl-[clamp(14px,2.2vw,20px)]">
            <span
              aria-hidden
              className="flex h-10 w-10 flex-none items-center justify-center border border-[var(--rule)] font-fraunces text-[15px] italic leading-none text-[var(--accent)]"
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
              {t.backToHub} ↗
            </a>
          </div>

          {/* topics — which 专题 features this essay belongs to; jump to
              the topic's own page (/blog/topic/<id>). href carries the
              language-independent id so the deep link opens the same
              topic in either language. */}
          {post.topics.length > 0 && (
            <div className="mt-[clamp(28px,5vh,44px)]">
              <p className="text-[10px] font-semibold tracking-[0.3em] text-[var(--fainter)]">
                {t.topicLabel}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {post.topics.map((id) => {
                  const tp = topicById.get(id);
                  if (!tp) return null;
                  return (
                    <a
                      key={id}
                      href={`/blog/topic/${encodeURIComponent(id)}`}
                      className="inline-flex items-center gap-2 border border-[var(--rule)] px-3 py-1.5 text-[10px] font-medium tracking-[0.18em] text-[var(--muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
                    >
                      <span
                        aria-hidden
                        className="h-[6px] w-[6px]"
                        style={{ backgroundColor: tp.color, opacity: 0.75 }}
                      />
                      {tp.symbol} {tp.name[lang]}
                    </a>
                  );
                })}
              </div>
            </div>
          )}

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
                    className="border border-[var(--rule)] px-3 py-1.5 text-[10px] font-medium tracking-[0.18em] text-[var(--muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
                  >
                    {post.tagLabels[i]?.toUpperCase() ?? tag.toUpperCase()}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* references — the cited originals, each a link straight to
              the full text. Written in frontmatter, so a reader can
              check a claim without leaving the page to go looking. */}
          {post.sources.length > 0 && (
            <div className="mt-[clamp(28px,5vh,44px)]">
              <p className="text-[10px] font-semibold tracking-[0.3em] text-[var(--fainter)]">
                {t.references}
              </p>
              <ol className="mt-3 border-t border-[var(--rule-faint)]">
                {post.sources.map((s) => (
                  <li
                    key={s.url}
                    className="border-b border-[var(--rule-faint)] py-[11px] text-[12.5px] leading-[1.6]"
                  >
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[var(--body)] transition-colors hover:text-[var(--accent)]"
                    >
                      {s.title}
                    </a>
                    {s.source && (
                      <span className="mt-[3px] block text-[10px] tracking-[0.12em] text-[var(--faintest)]">
                        {s.source}
                      </span>
                    )}
                  </li>
                ))}
              </ol>
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
                  <a
                    key={r.slug}
                    href={`/blog/${r.slug}/`}
                    onClick={(e) => {
                      if (!isPlainClick(e)) return;
                      e.preventDefault();
                      onOpen(r.slug);
                    }}
                    className="group border-t border-[var(--rule-faint)] px-0 py-4 text-left transition-colors duration-300 hover:border-t-2 hover:border-t-[var(--accent)]"
                  >
                    <p className="line-clamp-2 text-[13px] font-semibold leading-[1.5] text-[var(--body)] transition-colors group-hover:text-[var(--accent)]">
                      {r.title.split("\n").join(" ")}
                    </p>
                    <p className="mt-2 text-[10px] tracking-[0.16em] text-[var(--fainter)]">
                      {r.date} · {r.read}
                    </p>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* prev / next */}
        <nav className="mt-[clamp(40px,7vh,64px)] grid gap-4 border-t border-[var(--border)] pt-[clamp(24px,4vh,40px)] sm:grid-cols-2">
          {prev ? (
            <a
              href={`/blog/${prev.slug}/`}
              onClick={(e) => {
                if (!isPlainClick(e)) return;
                e.preventDefault();
                onOpen(prev.slug);
              }}
              className="group text-left"
            >
              <span className="inline-flex items-center gap-1 text-[10px] tracking-[0.3em] text-[var(--fainter)] transition-transform duration-300 group-hover:-translate-x-1">
                {t.previous}
              </span>
              <span className="mt-2 block font-medium text-[var(--body)] transition-colors group-hover:text-[var(--accent)]">
                {prev.title.split("\n").join(" ")}
              </span>
            </a>
          ) : (
            <span aria-hidden />
          )}
          {next ? (
            <a
              href={`/blog/${next.slug}/`}
              onClick={(e) => {
                if (!isPlainClick(e)) return;
                e.preventDefault();
                onOpen(next.slug);
              }}
              className="group text-right sm:col-start-2"
            >
              <span className="inline-flex items-center gap-1 text-[10px] tracking-[0.3em] text-[var(--fainter)] transition-transform duration-300 group-hover:translate-x-1">
                {t.next}
              </span>
              <span className="mt-2 block font-medium text-[var(--body)] transition-colors group-hover:text-[var(--accent)]">
                {next.title.split("\n").join(" ")}
              </span>
            </a>
          ) : (
            <span aria-hidden />
          )}
        </nav>

        <p className="mt-[clamp(40px,8vh,80px)] text-center text-[11px] tracking-[0.3em] text-[var(--faint)]">
          {t.end(journal.close.year)}
        </p>
      </div>

      {/* image lightbox — native dialog: Esc or backdrop click dismisses */}
      <dialog
        ref={lightboxRef}
        aria-label={t.lightbox}
        onClose={() => setLightbox(null)}
        onClick={(e) => {
          if (e.target === e.currentTarget) setLightbox(null);
        }}
        className="m-auto max-w-none border-0 bg-transparent p-0 backdrop:bg-[color-mix(in_oklab,var(--bg)_90%,transparent)]"
      >
        {lightbox && (
          <figure className="text-center">
            <img
              src={lightbox.src}
              alt={lightbox.alt}
              className="max-h-[82vh] w-auto max-w-[min(92vw,1200px)] border border-[var(--border-strong)] bg-[var(--surface)]"
            />
            {lightbox.caption && (
              <figcaption className="mt-4 text-[11px] tracking-[0.14em] text-[var(--faint)]">
                {lightbox.caption}
              </figcaption>
            )}
          </figure>
        )}
      </dialog>
    </section>
  );
}
