import { useCallback, useEffect, useRef, useState } from "react";
import type Lenis from "lenis";
import ArticleScene from "./components/ArticleScene";
import BackToTop from "./components/BackToTop";
import BlogIndexScene from "./components/BlogIndexScene";
import LoadingOverlay from "../components/LoadingOverlay";
import Scrollbar from "../components/Scrollbar";
import GlassTopBar from "../components/GlassTopBar";
import { initScrollbar } from "../effects/scrollbar";
import { initScrollTriggerGlue } from "../effects/scrollTriggerGlue";
import { initSiteNavIntercept } from "../effects/siteNav";
import { initSmoothScroll } from "../effects/smoothScroll";
import { BlogPrefsProvider, useBlogPrefs } from "./prefs";

const BLOG = "/blog";

/* The glass top bar, fed by the blog's own prefs provider. Active is always
   "blog" on this sub-site (index + reader are both the Blog section). In the
   article reader it auto-hides on scroll for an immersive read. */
function BlogTopBar({ autoHide = false }: { autoHide?: boolean }) {
  const prefs = useBlogPrefs();
  return <GlassTopBar prefs={prefs} active="blog" autoHide={autoHide} />;
}

const getSlug = (p: string) =>
  p.startsWith(BLOG + "/")
    ? decodeURIComponent(p.slice(BLOG.length + 1))
    : null;

/* The blog sub-site's own SPA: /blog = the light index, /blog/<slug> = an
   essay reader. Independent of the main site — a full page-load lands here,
   and index ↔ article swap in-app with pushState/replaceState. Owns the
   blog's smooth scroll, custom scrollbar, and ScrollTrigger wiring. */
export default function BlogApp() {
  /* Any /blog/<slug> opens the reader; the article scene validates the
     slug itself (its body loads on demand) and reports back via
     onNotFound when the slug does not exist — the unknown-slug fallback
     back to the index is preserved, just async now. */
  const [article, setArticle] = useState<string | null>(() => {
    const slug = getSlug(location.pathname.replace(/\/+$/, ""));
    return slug ?? null;
  });
  const lenisRef = useRef<Lenis | null>(null);

  /* The main site's initLanding targets deck effects only, so the blog wires
     its own smooth scroll + custom scrollbar + ScrollTrigger glue. */
  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const smooth = initSmoothScroll(prefersReduced);
    const lenis = smooth?.lenis ?? null;
    lenisRef.current = lenis;
    const barEl = document.getElementById("scrollbar");
    const thumbEl = document.getElementById("scrollbar-thumb");
    const bar = barEl && thumbEl ? initScrollbar(barEl, thumbEl, lenis) : null;
    const disposeGlue = initScrollTriggerGlue(lenis);
    const disposeNav = initSiteNavIntercept();
    return () => {
      disposeNav();
      disposeGlue();
      bar?.destroy();
      smooth?.destroy();
    };
  }, []);

  const scrollTop = useCallback(() => {
    const lenis = lenisRef.current;
    if (lenis) lenis.scrollTo(0, { immediate: true });
    else window.scrollTo(0, 0);
  }, []);

  /* Smooth scroll to any offset (TOC jumps, back-to-top) via lenis. */
  const scrollToY = useCallback((y: number) => {
    const lenis = lenisRef.current;
    if (lenis) {
      // lenis caches its max-scroll limit — a freshly loaded article body
      // changed the page height, so re-measure before the clamp applies.
      lenis.resize();
      lenis.scrollTo(y);
    } else window.scrollTo(0, y);
  }, []);

  /* Instant scroll — used to restore the reader's place after a language
     swap has replaced the article body (no animation, no chase). */
  const scrollToImmediate = useCallback((y: number) => {
    const lenis = lenisRef.current;
    if (lenis) {
      lenis.resize();
      lenis.scrollTo(y, { immediate: true });
    } else window.scrollTo(0, y);
  }, []);

  /* Index → article pushes an entry so Back returns to the index. */
  const openArticle = useCallback(
    (slug: string) => {
      setArticle(slug);
      history.pushState({ __blogArticle: slug }, "", `${BLOG}/${slug}`);
      scrollTop();
    },
    [scrollTop],
  );

  /* prev/next inside an article REPLACE the entry — the stack never grows,
     and JOURNAL always pops back to the index. */
  const openArticleReplace = useCallback(
    (slug: string) => {
      setArticle(slug);
      history.replaceState({ __blogArticle: slug }, "", `${BLOG}/${slug}`);
      scrollTop();
    },
    [scrollTop],
  );

  /* Close the essay back to the /blog index. */
  const closeArticle = useCallback(() => {
    setArticle(null);
    history.replaceState(null, "", BLOG);
    scrollTop();
  }, [scrollTop]);

  /* The reader calls this when its on-demand body load turns up nothing —
     an unknown /blog/<slug> falls back to the index, same as before, only
     validated asynchronously now. */
  const closeNotFound = useCallback(() => {
    setArticle(null);
    history.replaceState(null, "", BLOG);
    scrollTop();
  }, [scrollTop]);

  /* Browser Back/Forward between the index and essays. The reader
     validates the slug on its own. */
  useEffect(() => {
    const onPop = () => {
      const slug = getSlug(location.pathname.replace(/\/+$/, ""));
      setArticle(slug);
      scrollTop();
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [scrollTop]);

  return (
    <BlogPrefsProvider>
      {article !== null ? (
        <ArticleScene
          slug={article}
          onClose={closeArticle}
          onOpen={openArticleReplace}
          onNotFound={closeNotFound}
          scrollTo={scrollToY}
          scrollToImmediate={scrollToImmediate}
        />
      ) : (
        <BlogIndexScene onOpen={openArticle} />
      )}
      <BlogTopBar autoHide={article !== null} />
      <BackToTop scrollTo={scrollToY} />
      <Scrollbar />
      <LoadingOverlay />
    </BlogPrefsProvider>
  );
}
