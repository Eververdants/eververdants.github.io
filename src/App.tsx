import { useEffect } from 'react';
import Background from './components/Background';
import FilmGrain from './components/FilmGrain';
import FocusBand from './components/FocusBand';
import HeroScene from './components/HeroScene';
import PortfolioScene from './components/PortfolioScene';
import ResumeScene from './components/ResumeScene';
import Scrollbar from './components/Scrollbar';
import { initLanding } from './effects/landing';

export default function App() {
  useEffect(() => {
    const handle = initLanding();

    /* Scroll owners in DOM order (ascending document Y). Each owns the URL
       once its top passes the viewport midpoint. This screen is the SELECTED
       (精选) works — the curated pick — so it owns /selected; a future full
       portfolio sub-site gets /works. The handscroll's panels are horizontal
       (no vertical midpoint), so the screen is the URL unit. */
    const SECTIONS = [
      { path: "/resume", sel: "main section[data-resume]" },
      { path: "/selected", sel: "main section[data-works]" },
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
            el ? el.getBoundingClientRect().top + window.scrollY : Infinity
          ];
        })
      );
    };
    measure();
    if (document.fonts?.ready) document.fonts.ready.then(measure);
    window.addEventListener("resize", measure);

    // Normalize unknown paths (e.g. /foo served via 404.html) to the root.
    let path = window.location.pathname.replace(/\/+$/, "");
    if (!VALID.has(path)) {
      history.replaceState(null, "", "/");
      path = "";
    }

    // Deep link: visiting a screen or a works act scrolls straight there.
    const target = SECTIONS.find((s) => s.path === path);
    let timer: number | undefined;
    let ready = !target;
    if (target) {
      timer = window.setTimeout(() => {
        const sec = document.querySelector<HTMLElement>(target.sel);
        if (sec) {
          const y = sec.getBoundingClientRect().top + window.scrollY;
          if (handle.lenis) handle.lenis.scrollTo(y, { immediate: true });
          else window.scrollTo(0, y);
        }
        ready = true;
      }, 60);
    }

    // Seamless URL following: replaceState on scroll, no reload, no history spam.
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
      handle.destroy();
      if (timer !== undefined) clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
    };
  }, []);

  return (
    <>
      <Background />
      <main className="relative">
        <HeroScene />
        <ResumeScene />
        <PortfolioScene />
      </main>
      <FilmGrain />
      <FocusBand />
      <Scrollbar />
    </>
  );
}
