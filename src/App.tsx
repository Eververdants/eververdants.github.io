import { useCallback, useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Background from './components/Background';
import BlogScene from './components/BlogScene';
import BlogIndexScene from './components/BlogIndexScene';
import ArticleScene from './components/ArticleScene';
import { getArticle } from './data/articles';
import FilmGrain from './components/FilmGrain';
import FocusBand from './components/FocusBand';
import HeroScene from './components/HeroScene';
import PortfolioScene from './components/PortfolioScene';
import ResumeScene from './components/ResumeScene';
import Scrollbar from './components/Scrollbar';
import { initLanding } from './effects/landing';
import type { LandingHandle } from './effects/landing';

/* The journal screen's URL is /selected-blog; an open essay lives at
   /blog/<slug>. The screen sections hide (display:none) while an essay is
   open — never unmount — so gsap's triggers keep their element references
   and the scroll-cinema resumes where it was on close. */
const BLOG = "/selected-blog";
const ARTICLE = "/blog"; // /blog = sub-site index, /blog/<slug> = an essay
const BLOG_INDEX = "/blog";
const getArticleSlug = (p: string) =>
  p.startsWith(ARTICLE + "/") ? decodeURIComponent(p.slice(ARTICLE.length + 1)) : null;

export default function App() {
  // Initial article read straight from the URL so a deep link to an essay
  // never flashes the deck first. Only known slugs open an article — an
  // unknown /blog/<slug> follows the 404 path (normalized to the root) like
  // every other unknown URL.
  const [article, setArticle] = useState<string | null>(() => {
    const slug = getArticleSlug(location.pathname.replace(/\/+$/, ""));
    return slug && getArticle(slug) ? slug : null;
  });
  const articleRef = useRef(article);
  articleRef.current = article;
  // Blog sub-site (/blog) — a simple index with tag filtering.
  const [blogIndex, setBlogIndex] = useState<boolean>(
    () => location.pathname.replace(/\/+$/, "") === BLOG_INDEX
  );
  const blogIndexRef = useRef(blogIndex);
  blogIndexRef.current = blogIndex;
  const handleRef = useRef<LandingHandle | null>(null);
  const measureRef = useRef<() => void>(() => {});
  // Transition overlay between the dark main site and the light article
  // reader (opening the first essay, and closing back to the deck).
  const [transitioning, setTransitioning] = useState(false);

  /* Return to the deck: unhide the screens, scroll to the blog, then
     re-measure. The unhide is flushed synchronously and the scroll happens
     right away; ScrollTrigger.refresh is deferred until AFTER the browser
     has laid out the re-shown sections (rAF runs before layout, so it is
     too early — a zero-height trigger freezes every handscroll/reading-deck
     timeline at progress 0 and the essay spreads stay invisible). */
  const resetToBlog = useCallback(() => {
    articleRef.current = null;
    blogIndexRef.current = false;
    flushSync(() => {
      setArticle(null);
      setBlogIndex(false);
    });
    const sec = document.querySelector<HTMLElement>("[data-blog]");
    const y = sec ? sec.getBoundingClientRect().top + window.scrollY : 0;
    const h = handleRef.current;
    if (h?.lenis) {
      h.lenis.resize();
      h.lenis.scrollTo(y, { immediate: true });
    } else {
      window.scrollTo(0, y);
    }
    measureRef.current();
    // The works section's JS-set height comes back during the first refresh;
    // a second refresh after layout settles fixes every downstream trigger
    // (the reading-deck spreads freeze at progress 0 otherwise).
    setTimeout(() => ScrollTrigger.refresh(), 80);
    setTimeout(() => ScrollTrigger.refresh(), 320);
  }, []);

  /* Open the blog sub-site (/blog) from the main site — a loading
     transition covers the dark site → light index swap. */
  const openBlogIndex = useCallback(() => {
    if (blogIndexRef.current || articleRef.current) return;
    setTransitioning(true);
    setTimeout(() => {
      blogIndexRef.current = true;
      setBlogIndex(true);
      history.pushState({ __blogIndex: true }, "", BLOG_INDEX);
      const h = handleRef.current;
      if (h?.lenis) h.lenis.scrollTo(0, { immediate: true });
      else window.scrollTo(0, 0);
      setTimeout(() => setTransitioning(false), 550);
    }, 320);
  }, []);

  /* Close the sub-site: pop its history entry, or reset directly. A
     loading transition covers the return to the dark main site. */
  const closeBlogIndex = useCallback(() => {
    setTransitioning(true);
    setTimeout(() => {
      if (history.state && (history.state as { __blogIndex?: boolean }).__blogIndex) {
        history.back();
      } else {
        history.replaceState(null, "", BLOG);
        resetToBlog();
      }
      setTimeout(() => setTransitioning(false), 650);
    }, 300);
  }, [resetToBlog]);

  /* Smooth-scroll a heading into view (article TOC uses this). */
  const scrollTo = useCallback((y: number) => {
    const h = handleRef.current;
    if (h?.lenis) h.lenis.scrollTo(y);
    else window.scrollTo(0, y);
  }, []);

  /* Open an essay. The first open from the deck pushes a history entry so
     Back returns to the deck; next/prev hops within an article REPLACE the
     current entry instead, so the stack never grows and the JOURNAL back
     button always pops straight back to the deck. The first open runs a
     loading transition (米白 overlay) to bridge the dark site → light reader
     swap; in-article next/prev swaps instantly. */
  const openArticle = useCallback((slug: string) => {
    if (articleRef.current === slug) return;
    const alreadyInArticle = articleRef.current !== null;
    // Opening from the sub-site (or hopping within an article) is a fast
    // swap — the loading transition only bridges the main site's dark deck
    // to the light reader.
    const fromSubSite = blogIndexRef.current;
    if (alreadyInArticle || fromSubSite) {
      articleRef.current = slug;
      setArticle(slug);
      if (alreadyInArticle) {
        history.replaceState({ __article: slug }, "", `${ARTICLE}/${slug}`);
      } else {
        history.pushState({ __article: slug }, "", `${ARTICLE}/${slug}`);
      }
      const h = handleRef.current;
      if (h?.lenis) h.lenis.scrollTo(0, { immediate: true });
      else window.scrollTo(0, 0);
      return;
    }
    setTransitioning(true);
    setTimeout(() => {
      articleRef.current = slug;
      setArticle(slug);
      history.pushState({ __article: slug }, "", `${ARTICLE}/${slug}`);
      const h = handleRef.current;
      if (h?.lenis) h.lenis.scrollTo(0, { immediate: true });
      else window.scrollTo(0, 0);
      setTimeout(() => setTransitioning(false), 550);
    }, 320);
  }, []);

  /* Close: if the essay was opened here, pop its history entry (popstate
     does the reset). If it was deep-linked (no entry), reset directly. A
     loading transition covers the return to the dark deck — but returning
     to the light sub-site (essay opened from /blog) swaps instantly. */
  const closeArticle = useCallback(() => {
    if (blogIndexRef.current) {
      if (history.state && (history.state as { __article?: string }).__article) {
        history.back();
      } else {
        history.replaceState(null, "", BLOG_INDEX);
        resetToBlog();
      }
      return;
    }
    setTransitioning(true);
    setTimeout(() => {
      if (history.state && (history.state as { __article?: string }).__article) {
        history.back();
      } else {
        history.replaceState(null, "", BLOG);
        resetToBlog();
      }
      setTimeout(() => setTransitioning(false), 650);
    }, 300);
  }, [resetToBlog]);

  useEffect(() => {
    const handle = initLanding();
    handleRef.current = handle;

    /* Scroll owners in DOM order (ascending document Y). Each owns the URL
       once its top passes the viewport midpoint. The works screen is the
       SELECTED (精选) pick so it owns /selected; the journal is the SELECTED
       BLOG and owns /selected-blog. The handscroll's panels are horizontal
       (no vertical midpoint), so the screen is the URL unit. */
    const SECTIONS = [
      { path: "/resume", sel: "main section[data-resume]" },
      { path: "/selected", sel: "main section[data-works]" },
      { path: BLOG, sel: "main section[data-blog]" },
    ];
    const VALID = new Set(["", BLOG_INDEX, ...SECTIONS.map((s) => s.path)]);

    // Document Y of each owner, cached; layout shifts on font load / resize.
    let bounds = new Map<string, number>();
    const measure = () => {
      bounds = new Map(
        SECTIONS.map((s) => {
          const el = document.querySelector<HTMLElement>(s.sel);
          return [
            s.path,
            el ? el.getBoundingClientRect().top + window.scrollY : Infinity
          ];
        })
      );
    };
    measureRef.current = measure;
    measure();
    if (document.fonts?.ready) document.fonts.ready.then(measure);
    window.addEventListener("resize", measure);

    // Normalize unknown paths (e.g. /foo served via 404.html) to the root.
    // Essay paths are valid only for known slugs; an unknown one is a 404
    // like anything else and redirects home.
    let path = window.location.pathname.replace(/\/+$/, "");
    const articleSlug = getArticleSlug(path);
    const articleValid = articleSlug ? getArticle(articleSlug) !== null : false;
    const isBlogIndex = path === BLOG_INDEX;
    if (!articleValid && !isBlogIndex && !VALID.has(path)) {
      history.replaceState(null, "", "/");
      path = "";
    }

    // Deep link: visiting a screen or a works act scrolls straight there.
    const target = articleValid || isBlogIndex ? null : SECTIONS.find((s) => s.path === path);
    let timer: number | undefined;
    let ready = !target;
    const scrollToSection = () => {
      if (!target) return;
      const sec = document.querySelector<HTMLElement>(target.sel);
      if (!sec) return;
      const y = sec.getBoundingClientRect().top + window.scrollY;
      if (handle.lenis) {
        // The handscroll's height is set by gsap AFTER Lenis initializes, so
        // Lenis's cached limit is stale (too small) at first. resize() forces
        // it to the real document height — without it, scrolling to the last
        // screen (JOURNAL) clamps at the stale limit and lands mid-handscroll.
        handle.lenis.resize();
        handle.lenis.scrollTo(y, { immediate: true });
      } else {
        window.scrollTo(0, y);
      }
      ready = true;
    };
    let retryOnLoad: (() => void) | undefined;
    if (target) {
      timer = window.setTimeout(scrollToSection, 60);
      // Layout only settles after fonts load + ScrollTrigger's refresh sets
      // the handscroll height. Retry once fonts are ready so a deep link that
      // fired against a half-measured page still lands correctly.
      const retry = () => window.setTimeout(scrollToSection, 0);
      if (document.fonts?.ready) document.fonts.ready.then(retry).catch(() => {});
      retryOnLoad = retry;
      window.addEventListener("load", retry);
    }

    // Deep-linked straight into an essay: the article is already open from
    // state; just make sure the viewport sits at its top once layout settles.
    if (articleValid) {
      ready = true;
      timer = window.setTimeout(() => {
        if (handle.lenis) handle.lenis.scrollTo(0, { immediate: true });
        else window.scrollTo(0, 0);
      }, 60);
    }

    // Seamless URL following: replaceState on scroll, no reload, no history
    // spam. Skipped while an essay is open — its URL must not be clobbered.
    const currentPath = () => window.location.pathname.replace(/\/+$/, "");
    const onScroll = () => {
      if (!ready) return;
      if (articleRef.current || blogIndexRef.current) return;
      const y = window.scrollY;
      let next = "/";
      for (let i = SECTIONS.length - 1; i >= 0; i--) {
        const s = SECTIONS[i];
        if (y >= (bounds.get(s.path) ?? Infinity) - window.innerHeight / 2) {
          next = s.path;
          break;
        }
      }
      if (currentPath() !== next) history.replaceState(null, "", next);
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    // Browser Back/Forward between the deck and essays.
    const onPop = () => {
      const p = location.pathname.replace(/\/+$/, "");
      const slug = getArticleSlug(p);
      if (slug) {
        if (articleRef.current !== slug) {
          articleRef.current = slug;
          setArticle(slug);
          const h = handleRef.current;
          if (h?.lenis) h.lenis.scrollTo(0, { immediate: true });
          else window.scrollTo(0, 0);
        }
      } else if (p === BLOG_INDEX) {
        // back onto the sub-site (e.g. closing an essay opened from it)
        articleRef.current = null;
        setArticle(null);
        blogIndexRef.current = true;
        setBlogIndex(true);
        const h = handleRef.current;
        if (h?.lenis) h.lenis.scrollTo(0, { immediate: true });
        else window.scrollTo(0, 0);
      } else if (articleRef.current || blogIndexRef.current) {
        resetToBlog();
      }
    };
    window.addEventListener("popstate", onPop);

    return () => {
      handle.destroy();
      if (timer !== undefined) clearTimeout(timer);
      if (retryOnLoad) window.removeEventListener("load", retryOnLoad);
      window.removeEventListener("popstate", onPop);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
    };
  }, []);

  return (
    <>
      {/* The dark fluid canvas is the cinematic backdrop for the main site;
          the light article reader should not carry it (or its scroll bar). */}
      <Background className={article || blogIndex ? "hidden" : ""} />
      <main className="relative">
        {/* Hidden, not unmounted: gsap's triggers hold references to these
            sections, and the works handscroll sets its own height in flow. */}
        <div className={article || blogIndex ? "hidden" : undefined}>
          <HeroScene />
          <ResumeScene />
          <PortfolioScene />
          <BlogScene onOpen={openArticle} onOpenBlog={openBlogIndex} />
        </div>
        {!article && blogIndex && (
          <BlogIndexScene onClose={closeBlogIndex} onOpen={openArticle} />
        )}
        {article && (
          <ArticleScene slug={article} onClose={closeArticle} onOpen={openArticle} scrollTo={scrollTo} />
        )}
      </main>
      {/* Film grain stays mounted (its gsap loop targets it), but fades
          away on the light article reader. Focus blur is the dark handscroll
          edge; the article reader doesn't carry it. */}
      <FilmGrain className={article || blogIndex ? "opacity-0" : ""} />
      {!article && !blogIndex && <FocusBand />}
      <Scrollbar />
      {/* Loading transition: 米白 overlay fades in, holds, fades out while
          the app swaps main site ↔ article reader. 米白 matches the reader,
          so its disappearance is seamless there. */}
      {transitioning && (
        <div className="overlay-transition fixed inset-0 z-[70] flex flex-col items-center justify-center gap-4" aria-hidden>
          <span className="text-[10px] font-semibold tracking-[0.45em] text-[#8a867c]">
            LOADING
          </span>
          <span className="relative h-[2px] w-28 overflow-hidden bg-[#e2dfd6]">
            <span className="overlay-bar absolute inset-0 origin-left bg-[#0e7a86]" />
          </span>
        </div>
      )}
    </>
  );
}
