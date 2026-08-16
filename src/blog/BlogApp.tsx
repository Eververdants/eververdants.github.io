import { useCallback, useEffect, useRef, useState } from "react";
import type Lenis from "lenis";
import ArticleScene from "../components/ArticleScene";
import BlogIndexScene from "../components/BlogIndexScene";
import LoadingOverlay from "../components/LoadingOverlay";
import Scrollbar from "../components/Scrollbar";
import { getArticle } from "../data/articles";
import { initScrollbar } from "../effects/scrollbar";
import { initScrollTriggerGlue } from "../effects/scrollTriggerGlue";
import { initSiteNavIntercept } from "../effects/siteNav";
import { initSmoothScroll } from "../effects/smoothScroll";

const BLOG = "/blog";

const getSlug = (p: string) =>
  p.startsWith(BLOG + "/") ? decodeURIComponent(p.slice(BLOG.length + 1)) : null;

/* The blog sub-site's own SPA: /blog = the light index, /blog/<slug> = an
   essay reader. Independent of the main site — a full page-load lands here,
   and index ↔ article swap in-app with pushState/replaceState. Owns the
   blog's smooth scroll, custom scrollbar, and ScrollTrigger wiring. */
export default function BlogApp() {
  /* Only known slugs open an article — an unknown /blog/<slug> falls back to
     the index (defensive; the 404 flow already normalizes the rest). */
  const [article, setArticle] = useState<string | null>(() => {
    const slug = getSlug(location.pathname.replace(/\/+$/, ""));
    return slug && getArticle(slug) ? slug : null;
  });
  const lenisRef = useRef<Lenis | null>(null);

  /* The main site's initLanding targets deck effects only, so the blog wires
     its own smooth scroll + custom scrollbar + ScrollTrigger glue. */
  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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

  /* Index → article pushes an entry so Back returns to the index. */
  const openArticle = useCallback(
    (slug: string) => {
      setArticle(slug);
      history.pushState({ __blogArticle: slug }, "", `${BLOG}/${slug}`);
      scrollTop();
    },
    [scrollTop]
  );

  /* prev/next inside an article REPLACE the entry — the stack never grows,
     and JOURNAL always pops back to the index. */
  const openArticleReplace = useCallback(
    (slug: string) => {
      setArticle(slug);
      history.replaceState({ __blogArticle: slug }, "", `${BLOG}/${slug}`);
      scrollTop();
    },
    [scrollTop]
  );

  /* Close the essay back to the /blog index. */
  const closeArticle = useCallback(() => {
    setArticle(null);
    history.replaceState(null, "", BLOG);
    scrollTop();
  }, [scrollTop]);

  /* Browser Back/Forward between the index and essays. */
  useEffect(() => {
    const onPop = () => {
      const slug = getSlug(location.pathname.replace(/\/+$/, ""));
      const next = slug && getArticle(slug) ? slug : null;
      setArticle(next);
      scrollTop();
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [scrollTop]);

  const valid = article !== null && getArticle(article) !== null;

  return (
    <>
      {valid ? (
        <ArticleScene
          slug={article!}
          onClose={closeArticle}
          onOpen={openArticleReplace}
          scrollTo={(y) => {
            const lenis = lenisRef.current;
            if (lenis) lenis.scrollTo(y);
            else window.scrollTo(0, y);
          }}
        />
      ) : (
        <BlogIndexScene onOpen={openArticle} />
      )}
      <Scrollbar />
      <LoadingOverlay />
    </>
  );
}
