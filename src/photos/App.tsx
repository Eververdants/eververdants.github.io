import { useEffect, useRef, useState, type MouseEvent } from "react";
import type Lenis from "lenis";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { Gallery } from "./components/Gallery";
import { WorkDetail } from "./components/WorkDetail";
import { getWork, getWorks } from "./data/works";
import { PhotosPrefsProvider, usePhotosPrefs } from "./lib/prefs";
import { applyGallerySeo, applyWorkSeo } from "./lib/seo";
import { initSmoothScroll } from "../effects/smoothScroll";
import { initScrollbar } from "../effects/scrollbar";
import Scrollbar from "../components/Scrollbar";

/* Path-based routes (matching the prerendered statics + GitHub Pages):
   /photos/                  → gallery
   /photos/work/<slug>/      → a single work's detail page
   All internal links are BASE-relative (/photos/...) — never hardcoded
   domains — so the same build works on any host. */
const PHOTOS = "/photos";
const GALLERY = `${PHOTOS}/`;
const WORK = `${PHOTOS}/work/`;

type Route = { name: "gallery" } | { name: "work"; slug: string };

const routeFromPath = (p: string): Route => {
  const norm = p.replace(/\/+$/, "");
  if (norm.startsWith(WORK)) {
    const slug = decodeURIComponent(norm.slice(WORK.length));
    if (slug) return { name: "work", slug };
  }
  return { name: "gallery" };
};

const parseRoute = (): Route => routeFromPath(location.pathname);

function Scene() {
  const { lang } = usePhotosPrefs();
  const [route, setRoute] = useState<Route>(() => parseRoute());
  const lenisRef = useRef<Lenis | null>(null);

  /* Lenis smooth scroll + the shared embedded custom scrollbar — the SAME
     component the main site and blog use (<Scrollbar/> renders in the tree,
     fixed overlay, no theme accent). initScrollbar just wires drag/measure
     onto it. */
  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const smooth = initSmoothScroll(reduced);
    lenisRef.current = smooth?.lenis ?? null;
    const barEl = document.getElementById("scrollbar");
    const thumbEl = document.getElementById("scrollbar-thumb");
    const bar = barEl && thumbEl
      ? initScrollbar(barEl, thumbEl, lenisRef.current)
      : null;
    return () => {
      bar?.destroy();
      smooth?.destroy();
    };
  }, []);

  const scrollTop = () => {
    const l = lenisRef.current;
    if (l) l.scrollTo(0, { immediate: true });
    else window.scrollTo(0, 0);
  };

  /* SEO per route + guard against unknown slugs (deep link to a removed
     work falls back to the gallery without a history entry). Re-runs on
     language change so title/OG/JSON-LD follow the UI language. */
  useEffect(() => {
    if (route.name === "work") {
      const w = getWork(route.slug);
      if (!w) {
        history.replaceState(null, "", GALLERY);
        setRoute({ name: "gallery" });
        return;
      }
      applyWorkSeo(w, lang);
    } else {
      applyGallerySeo(getWorks(), lang);
    }
  }, [route, lang]);

  /* Browser back/forward. */
  useEffect(() => {
    const onPop = () => {
      setRoute(parseRoute());
      scrollTop();
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  /* Delegate in-app navigation: intercept <a href="/photos/..."> clicks and
     swap routes with pushState (full page loads still work without JS). */
  const onClick = (e: MouseEvent<HTMLDivElement>) => {
    const a = (e.target as HTMLElement).closest?.(
      'a[href]',
    ) as HTMLAnchorElement | null;
    if (!a) return;
    const href = a.getAttribute("href") || "";
    if (!href.startsWith(PHOTOS + "/")) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0)
      return;
    const url = new URL(a.href, location.origin);
    if (url.pathname === location.pathname) return;
    e.preventDefault();
    history.pushState(null, "", url.pathname + url.search + url.hash);
    setRoute(routeFromPath(url.pathname));
    scrollTop();
  };

  return (
    <div className="shell" onClick={onClick}>
      <Header />
      <hr className="hairline" />
      <main style={{ minHeight: "70vh" }}>
        {route.name === "gallery" ? <Gallery /> : <WorkDetail slug={route.slug} />}
      </main>
      <Footer />
      <Scrollbar />
    </div>
  );
}

export function App() {
  return (
    <PhotosPrefsProvider>
      <Scene />
    </PhotosPrefsProvider>
  );
}
