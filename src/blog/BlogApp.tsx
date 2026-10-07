/* The blog sub-site's shell: routing, and nothing else.

   Three views — the index, a topic page, and the essay reader — addressed by
   path so every one of them is a URL someone can share and a crawler can
   read. Lenis, GSAP's ScrollTrigger glue, the custom scrollbar, the
   cross-site loading curtain and the blog's own prefs context are gone: the
   browser scrolls, the shared <site-topbar> navigates, and the shared prefs
   store remembers language and theme. */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";
import ArticleScene from "./components/ArticleScene";
import BackToTop from "./components/BackToTop";
import BlogIndexScene from "./components/BlogIndexScene";
import TopicScene from "./components/TopicScene";
import { topicById } from "../data/journal";
import { setLang, usePrefs, hasStoredLang } from "../shared/prefs-react";
import { defineTopBar } from "../shared/topbar";
import { definePalette } from "../shared/palette";
import { articlePath, BLOG, parseView, topicPath } from "./urls";
import type { BlogView } from "./urls";
import { scrollToTop } from "../shared/smooth";

defineTopBar();
definePalette();

export default function BlogApp() {
  const { lang } = usePrefs();
  const [view, setView] = useState<BlogView>(() => parseView(location.pathname));

  /* An article's language is part of its URL, but the reader's stored choice
     owns the site: a reader who picked a language keeps it on every page,
     and the URL follows them — the other direction would let any English
     article link (an old bookmark, a history entry, a feed row) silently
     rewrite the choice they made on the hub. The one exception is a reader
     who has never chosen: for them a shared /blog/zh/<slug>/ link IS the
     language request, so the URL's language is adopted site-wide.

     The two effects below have to agree on who moves first. The bug this
     replaces: the adopt effect depended on [view, lang], so it re-ran after
     every language change and forced the store back to whatever the URL
     said — which meant the top bar's 中/EN toggle did nothing at all on an
     essay. It now fires once per route, tracked by a ref, and the toggle
     effect moves the route *and* the URL together so nothing pushes the
     language back. */
  const routeKey =
    view.kind === "article" ? `${view.slug}:${view.lang}` : "";
  const adoptedRoute = useRef<string | null>(null);

  /* First arrival at an essay by a reader with no stored language: adopt the
     URL's language instead of showing a Chinese essay under English chrome. */
  useEffect(() => {
    if (view.kind !== "article") return;
    if (adoptedRoute.current === routeKey) return;
    adoptedRoute.current = routeKey;
    if (!hasStoredLang() && view.lang !== lang) setLang(view.lang);
  }, [view, routeKey, lang]);

  /* The reverse: whenever the open essay's URL language differs from the site
     language — the reader toggled inside an essay, or arrived at a link in
     their non-preferred language — the view and the address bar move to
     their language's own URL, so the page being read is the page a share
     would re-open for someone with the same preference. */
  useEffect(() => {
    if (view.kind !== "article" || view.lang === lang) return;
    adoptedRoute.current = `${view.slug}:${lang}`;
    setView({ kind: "article", slug: view.slug, lang });
    history.replaceState(
      { __blogArticle: view.slug },
      "",
      articlePath(view.slug, lang),
    );
  }, [view, lang]);

  /* An unknown /blog/topic/<id> normalizes back to the index. */
  useEffect(() => {
    if (view.kind === "topic" && !topicById.has(view.id)) {
      setView({ kind: "index" });
      history.replaceState(null, "", BLOG);
    }
  }, [view]);

  /* Route changes and prev/next jumps. Goes through the smooth-scroll
     layer rather than window.scrollTo: while Lenis holds an animated
     position, a raw scrollTo is snapped back on its next frame, so the
     reader would see the essay open mid-page and then jump. */
  const toTop = useCallback(() => scrollToTop(), []);

  const openArticle = useCallback(
    (slug: string) => {
      setView({ kind: "article", slug, lang });
      history.pushState({ __blogArticle: slug }, "", articlePath(slug, lang));
      toTop();
    },
    [lang, toTop],
  );

  /* prev/next REPLACE the entry, so Back always pops out to the index rather
     than walking back through a chain of essays. */
  const openArticleReplace = useCallback(
    (slug: string) => {
      setView({ kind: "article", slug, lang });
      history.replaceState(
        { __blogArticle: slug },
        "",
        articlePath(slug, lang),
      );
      toTop();
    },
    [lang, toTop],
  );

  const openTopic = useCallback(
    (id: string) => {
      setView({ kind: "topic", id });
      history.pushState({ __blogTopic: id }, "", topicPath(id));
      toTop();
    },
    [toTop],
  );

  const closeToIndex = useCallback(() => {
    setView({ kind: "index" });
    history.replaceState(null, "", BLOG);
    toTop();
  }, [toTop]);

  useEffect(() => {
    const onPop = () => {
      setView(parseView(location.pathname));
      toTop();
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [toTop]);

  /* Plain links inside the app (tag chips, topic pills, related cards) are
     intercepted here so navigation keeps its state instead of reloading.

     This must be a React onClick on the view root, NOT a document-level
     listener. The shared motion layer (fx.ts) also listens on document and
     registers itself first (at module scope, before this component mounts) —
     a document-level handler here always ran *after* fx had already
     preventDefaulted and scheduled a full-page navigation behind the pixel
     curtain. Links with their own React onClick were fine (React fires at
     #root, before document), but tag/topic chips in the article footer had
     none: they got a wasted SPA swap and then a reload — and a topic chip's
     reload landed on /blog/topic/<id>, which has no static file behind it,
     so GitHub Pages served 404.html and the reader ended up on the hub. */
  const onViewClick = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0)
      return;
    const a = (e.target as HTMLElement | null)?.closest<HTMLAnchorElement>(
      "a[href]",
    );
    if (!a) return;
    const url = new URL(a.href, location.origin);
    if (url.origin !== location.origin) return;
    const next = parseView(url.pathname);
    if (next.kind === "article") {
      if (
        view.kind === "article" &&
        view.slug === next.slug &&
        view.lang === next.lang
      ) {
        e.preventDefault();
        return;
      }
      e.preventDefault();
      setView(next);
      history.pushState({ __blogArticle: next.slug }, "", url.pathname);
      toTop();
    } else if (next.kind === "topic") {
      e.preventDefault();
      setView(next);
      history.pushState({ __blogTopic: next.id }, "", url.pathname);
      toTop();
    } else if (
      next.kind === "index" &&
      (url.pathname === BLOG || url.pathname === `${BLOG}/`)
    ) {
      /* The query string carries the archive filters (?tag= / ?section=) —
         dropping it here silently discarded the tag a chip in an article
         footer pointed at. */
      e.preventDefault();
      setView({ kind: "index" });
      history.pushState(null, "", url.pathname + url.search);
      toTop();
    }
  };

  /* A view swap unmounts the previous scene; land keyboard and screen-reader
     focus on the new view's root instead of leaving it in <body>. */
  const viewRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    viewRef.current?.focus({ preventScroll: true });
  }, [view]);

  return (
    <>
      <site-topbar active="blog" search />
      <site-palette />
      {/* id="main": the shared skip link points here, and each view swap keeps
          it as the focus landing spot (tabIndex -1). */}
      <div
        ref={viewRef}
        id="main"
        tabIndex={-1}
        className="outline-none"
        onClick={onViewClick}
      >
      {view.kind === "article" ? (
        <ArticleScene
          slug={view.slug}
          onClose={closeToIndex}
          onOpen={openArticleReplace}
          onNotFound={closeToIndex}
        />
      ) : view.kind === "topic" ? (
        <TopicScene topicId={view.id} onClose={closeToIndex} onOpen={openArticle} />
      ) : (
        <BlogIndexScene onOpen={openArticle} onOpenTopic={openTopic} />
      )}
      </div>
      <BackToTop />
    </>
  );
}
