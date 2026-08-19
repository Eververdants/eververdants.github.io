import { useEffect, useRef } from "react";
import Background from "./components/Background";
import BlogScene from "./components/BlogScene";
import FilmGrain from "./components/FilmGrain";
import FocusBand from "./components/FocusBand";
import HeroScene from "./components/HeroScene";
import LoadingOverlay from "./components/LoadingOverlay";
import OutroScene from "./components/OutroScene";
import PortfolioScene from "./components/PortfolioScene";
import ResumeScene from "./components/ResumeScene";
import Scrollbar from "./components/Scrollbar";
import { initLanding } from "./effects/landing";
import { initSiteNavIntercept } from "./effects/siteNav";
import type { LandingHandle } from "./effects/landing";

export default function App() {
  const handleRef = useRef<LandingHandle | null>(null);
  const measureRef = useRef<() => void>(() => {});

  useEffect(() => {
    const handle = initLanding();
    handleRef.current = handle;

    /* Cross-site (deck → blog) navigations run the LOADING overlay first. */
    const disposeNav = initSiteNavIntercept();

    /* Scroll owners in DOM order (ascending document Y). Each owns the URL
       once its top passes the viewport midpoint. The works screen is the
       SELECTED (精选) pick so it owns /selected; the journal is the SELECTED
       BLOG and owns /selected-blog. The handscroll's panels are horizontal
       (no vertical midpoint), so the screen is the URL unit. */
    const SECTIONS = [
      { path: "/resume", sel: "main section[data-resume]" },
      { path: "/selected", sel: "main section[data-works]" },
      { path: "/selected-blog", sel: "main section[data-blog]" },
    ];
    const VALID = new Set(["", ...SECTIONS.map((s) => s.path)]);

    // Document Y of each owner, cached; layout shifts on font load / resize.
    let bounds = new Map<string, number>();
    const measure = () => {
      bounds = new Map(
        SECTIONS.map((s) => {
          const el = document.querySelector<HTMLElement>(s.sel);
          return [
            s.path,
            el ? el.getBoundingClientRect().top + window.scrollY : Infinity,
          ];
        }),
      );
    };
    measureRef.current = measure;
    measure();
    if (document.fonts?.ready) document.fonts.ready.then(measure);
    window.addEventListener("resize", measure);

    // Normalize unknown paths (e.g. /foo served via 404.html) to the root.
    let path = window.location.pathname.replace(/\/+$/, "");
    if (!VALID.has(path)) {
      history.replaceState(null, "", "/");
      path = "";
    }

    // Deep link: visiting a screen scrolls straight there.
    const target = SECTIONS.find((s) => s.path === path);
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
      if (document.fonts?.ready)
        document.fonts.ready.then(retry).catch(() => {});
      retryOnLoad = retry;
      window.addEventListener("load", retry);
    }

    // Seamless URL following: replaceState on scroll, no reload, no history
    // spam.
    const currentPath = () => window.location.pathname.replace(/\/+$/, "");
    const onScroll = () => {
      if (!ready) return;
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

    return () => {
      disposeNav();
      handle.destroy();
      if (timer !== undefined) clearTimeout(timer);
      if (retryOnLoad) window.removeEventListener("load", retryOnLoad);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
    };
  }, []);

  return (
    <>
      {/* The dark fluid canvas is the cinematic backdrop for the main site. */}
      <Background />
      <main className="relative">
        <HeroScene />
        <ResumeScene />
        <PortfolioScene />
        <BlogScene />
        <OutroScene />
      </main>
      {/* Film grain stays mounted (its gsap loop targets it). Focus blur is
          the dark handscroll edge. */}
      <FilmGrain />
      <FocusBand />
      <Scrollbar />
      <LoadingOverlay />
    </>
  );
}
