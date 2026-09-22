/* The blog sub-site's shell: routing, and nothing else.

   Three views — the index, a topic page, and the essay reader — addressed by
   path so every one of them is a URL someone can share and a crawler can
   read. Lenis, GSAP's ScrollTrigger glue, the custom scrollbar, the
   cross-site loading curtain and the blog's own prefs context are gone: the
   browser scrolls, the shared <site-topbar> navigates, and the shared prefs
   store remembers language and theme. */

import { useCallback, useEffect, useState } from "react";
import ArticleScene from "./components/ArticleScene";
import BackToTop from "./components/BackToTop";
import BlogIndexScene from "./components/BlogIndexScene";
import TopicScene from "./components/TopicScene";
import { topicById } from "../data/journal";
import { setLang, usePrefs } from "../shared/prefs-react";
import { defineTopBar } from "../shared/topbar";
import { definePalette } from "../shared/palette";
import { articlePath, BLOG, parseView, topicPath } from "./urls";
import type { BlogView } from "./urls";

defineTopBar();
definePalette();

export default function BlogApp() {
  const { lang } = usePrefs();
  const [view, setView] = useState<BlogView>(() => parseView(location.pathname));

  /* A /blog/zh/<slug>/ link means the reader wants Chinese — adopt it as the
     site language rather than showing a Chinese essay under English chrome. */
  useEffect(() => {
    if (view.kind === "article" && view.lang !== lang) setLang(view.lang);
  }, [view, lang]);

  /* The reverse: toggling language inside an essay moves the address bar to
     that language's own URL, so the page you are reading is the page you
     just shared. */
  useEffect(() => {
    if (view.kind !== "article") return;
    const want = articlePath(view.slug, lang);
    if (location.pathname.replace(/\/+$/, "") !== want.replace(/\/+$/, "")) {
      history.replaceState({ __blogArticle: view.slug }, "", want);
    }
  }, [view, lang]);

  /* An unknown /blog/topic/<id> normalizes back to the index. */
  useEffect(() => {
    if (view.kind === "topic" && !topicById.has(view.id)) {
      setView({ kind: "index" });
      history.replaceState(null, "", BLOG);
    }
  }, [view]);

  const toTop = useCallback(() => window.scrollTo({ top: 0 }), []);

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
     intercepted here so navigation keeps its state instead of reloading. */
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest<HTMLAnchorElement>(
        "a[href]",
      );
      if (!a) return;
      const url = new URL(a.href, location.origin);
      if (url.origin !== location.origin) return;
      const next = parseView(url.pathname);
      if (next.kind === "article") {
        e.preventDefault();
        if (
          view.kind === "article" &&
          view.slug === next.slug &&
          view.lang === next.lang
        )
          return;
        setView(next);
        history.pushState({ __blogArticle: next.slug }, "", url.pathname);
        toTop();
      } else if (next.kind === "topic") {
        e.preventDefault();
        setView(next);
        history.pushState({ __blogTopic: next.id }, "", url.pathname);
        toTop();
      } else if (next.kind === "index" && url.pathname === BLOG) {
        e.preventDefault();
        setView({ kind: "index" });
        history.pushState(null, "", url.pathname);
        toTop();
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [view, toTop]);

  return (
    <>
      <site-topbar active="blog" search />
      <site-palette />
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
      <BackToTop />
    </>
  );
}
