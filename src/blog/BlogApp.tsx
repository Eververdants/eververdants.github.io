import { useCallback, useEffect, useRef, useState } from "react";
import type Lenis from "lenis";
import ArticleScene from "./components/ArticleScene";
import BackToTop from "./components/BackToTop";
import BlogIndexScene from "./components/BlogIndexScene";
import TopicScene from "./components/TopicScene";
import LoadingOverlay from "../components/LoadingOverlay";
import Scrollbar from "../components/Scrollbar";
import GlassTopBar from "../components/GlassTopBar";
import { topicById } from "../data/journal";
import { initScrollbar } from "../effects/scrollbar";
import { initScrollTriggerGlue } from "../effects/scrollTriggerGlue";
import { initSiteNavIntercept } from "../effects/siteNav";
import { initSmoothScroll } from "../effects/smoothScroll";
import { BlogPrefsProvider, useBlogPrefs } from "./prefs";

const BLOG = "/blog";

/* The blog sub-site's three view kinds: the index (topic directory),
   a 专题 topic page (/blog/topic/<id>) and an essay reader (/blog/<slug>).
   App routes between them in-app with pushState/replaceState. */
type BlogView =
  | { kind: "index" }
  | { kind: "topic"; id: string }
  | { kind: "article"; slug: string };

/* Path → view. A topic page is a two-segment path: topic/<id>. Anything
   else under /blog/ is an article slug (existing slugs never collide with
   the literal "topic"). Unknown slugs validate asynchronously in the
   reader; unknown topic ids fall back to the index below. */
const parseView = (path: string): BlogView => {
  const clean = path.replace(/\/+$/, "");
  if (clean === BLOG) return { kind: "index" };
  const rest = clean.startsWith(BLOG + "/")
    ? clean.slice(BLOG.length + 1)
    : "";
  const [head, tail] = rest.split("/");
  if (head === "topic")
    return tail
      ? { kind: "topic", id: decodeURIComponent(tail) }
      : { kind: "index" };
  return head
    ? { kind: "article", slug: decodeURIComponent(head) }
    : { kind: "index" };
};

/* The glass top bar, fed by the blog's own prefs provider. Active is always
   "blog" on this sub-site; in the article reader it auto-hides on scroll
   for an immersive read (topic pages keep it visible like the index). */
function BlogTopBar({ autoHide = false }: { autoHide?: boolean }) {
  const prefs = useBlogPrefs();
  return <GlassTopBar prefs={prefs} active="blog" autoHide={autoHide} />;
}

export default function BlogApp() {
  const [view, setView] = useState<BlogView>(() =>
    parseView(location.pathname),
  );
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

  /* An unknown /blog/topic/<id> is normalized back to the index and the
     URL cleaned up. */
  useEffect(() => {
    if (view.kind === "topic" && !topicById.has(view.id)) {
      setView({ kind: "index" });
      history.replaceState(null, "", BLOG);
    }
  }, [view]);

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

  /* Index / topic page → article pushes an entry so Back returns. */
  const openArticle = useCallback(
    (slug: string) => {
      setView({ kind: "article", slug });
      history.pushState({ __blogArticle: slug }, "", `${BLOG}/${slug}`);
      scrollTop();
    },
    [scrollTop],
  );

  /* prev/next inside an article REPLACE the entry — the stack never grows,
     and JOURNAL always pops back to the index. */
  const openArticleReplace = useCallback(
    (slug: string) => {
      setView({ kind: "article", slug });
      history.replaceState({ __blogArticle: slug }, "", `${BLOG}/${slug}`);
      scrollTop();
    },
    [scrollTop],
  );

  /* Index → 专题 page pushes an entry so Back returns to the directory. */
  const openTopic = useCallback(
    (id: string) => {
      setView({ kind: "topic", id });
      history.pushState({ __blogTopic: id }, "", `${BLOG}/topic/${id}`);
      scrollTop();
    },
    [scrollTop],
  );

  /* Close the essay back to the /blog index. */
  const closeArticle = useCallback(() => {
    setView({ kind: "index" });
    history.replaceState(null, "", BLOG);
    scrollTop();
  }, [scrollTop]);

  /* Close the topic page back to the /blog index. */
  const closeTopic = useCallback(() => {
    setView({ kind: "index" });
    history.replaceState(null, "", BLOG);
    scrollTop();
  }, [scrollTop]);

  /* The reader calls this when its on-demand body load turns up nothing —
     an unknown /blog/<slug> falls back to the index, same as before, only
     validated asynchronously now. */
  const closeNotFound = useCallback(() => {
    setView({ kind: "index" });
    history.replaceState(null, "", BLOG);
    scrollTop();
  }, [scrollTop]);

  /* Browser Back/Forward across the index, topic pages and essays. The
     reader validates its slug on its own; unknown topic ids normalize in
     the effect above. */
  useEffect(() => {
    const onPop = () => {
      setView(parseView(location.pathname));
      scrollTop();
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [scrollTop]);

  return (
    <BlogPrefsProvider>
      {view.kind === "article" ? (
        <ArticleScene
          slug={view.slug}
          onClose={closeArticle}
          onOpen={openArticleReplace}
          onNotFound={closeNotFound}
          scrollTo={scrollToY}
          scrollToImmediate={scrollToImmediate}
        />
      ) : view.kind === "topic" ? (
        <TopicScene topicId={view.id} onClose={closeTopic} onOpen={openArticle} />
      ) : (
        <BlogIndexScene onOpen={openArticle} onOpenTopic={openTopic} />
      )}
      <BlogTopBar autoHide={view.kind === "article"} />
      <BackToTop scrollTo={scrollToY} />
      <Scrollbar />
      <LoadingOverlay />
    </BlogPrefsProvider>
  );
}
