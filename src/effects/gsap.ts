/* GSAP coordinator — wires every scroll animation together.

   The actual tweens live in src/effects/animations/, one module per screen
   or concern (reveal, hero, resume, portfolio, journal, ambient). This file
   only registers ScrollTrigger, hooks Lenis, and runs each module inside a
   single gsap.context so one ctx.revert() tears everything down.

   Lenis is the scroller: it keeps its own rAF loop (smoothScroll.ts), GSAP
   just pushes ScrollTrigger updates on scroll so triggers stay in sync.

   Reduced motion skips every module: with the CSS reveals removed, elements
   sit at their natural (visible) state. [data-hero-in] hides via CSS only
   before JS runs (opacity 0) so the mount entrance has no flash — that
   initial opacity is overridden to 1 under prefers-reduced-motion in CSS. */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type Lenis from "lenis";
import { initUniversalReveal } from "./animations/reveal";
import { initHeroAvatar, initHeroCover, initHeroEntrance } from "./animations/hero";
import { initResume } from "./animations/resume";
import { initHandscroll, markHandscrollsDone } from "./animations/portfolio";
import { initJournal } from "./animations/journal";
import { initFilmGrain } from "./animations/ambient";

gsap.registerPlugin(ScrollTrigger);

export interface GsapHandle {
  destroy: () => void;
}

export function initGsap(prefersReduced: boolean, lenis: Lenis | null): GsapHandle {
  const onScroll = () => ScrollTrigger.update();
  if (lenis) lenis.on("scroll", onScroll);

  const ctx = gsap.context(() => {
    if (prefersReduced) {
      // CSS hides [data-hero-in] until JS animates it; under reduced motion
      // JS never does, so unhide here — independent of the CSS media query
      // matching (covers JS/CSS mismatch).
      gsap.set("[data-hero-in]", { autoAlpha: 1 });
      markHandscrollsDone();
      return;
    }

    initUniversalReveal();
    initHeroEntrance();
    initHeroCover();
    initResume();
    initHandscroll();
    initJournal();
    initFilmGrain();
    initHeroAvatar();
  });

  /* Big-type layout means element offsets shift once Fraunces loads.
     document.fonts.ready resolves with display=swap BEFORE the real face
     swaps in, so stale trigger positions would fire reveals when elements
     are already high on screen. Re-measure on every font event plus load,
     and once more as a safety net. */
  const refreshST = () => ScrollTrigger.refresh();
  document.fonts?.ready.then(refreshST).catch(() => {});
  if (document.fonts?.addEventListener) {
    document.fonts.addEventListener("loadingdone", refreshST);
    document.fonts.addEventListener("load", refreshST);
  }
  window.addEventListener("load", refreshST);
  const safety = window.setTimeout(refreshST, 1500);

  return {
    destroy: function () {
      if (lenis) lenis.off("scroll", onScroll);
      if (document.fonts?.removeEventListener) {
        document.fonts.removeEventListener("loadingdone", refreshST);
        document.fonts.removeEventListener("load", refreshST);
      }
      window.removeEventListener("load", refreshST);
      clearTimeout(safety);
      ctx.revert();
    }
  };
}
