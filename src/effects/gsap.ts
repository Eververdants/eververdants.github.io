/* GSAP coordinator — wires every scroll animation together.

   The actual tweens live in src/effects/animations/, one module per screen
   or concern (reveal, hero, resume, portfolio, journal, ambient). This file
   runs each module inside a single gsap.context so one ctx.revert() tears
   everything down. ScrollTrigger registration, the Lenis update hook, and
   the font/load refresh timing live in scrollTriggerGlue.ts (shared with the
   blog sub-site).

   Lenis is the scroller: it keeps its own rAF loop (smoothScroll.ts), GSAP
   just pushes ScrollTrigger updates on scroll so triggers stay in sync.

   Reduced motion skips every module: with the CSS reveals removed, elements
   sit at their natural (visible) state. [data-hero-in] hides via CSS only
   before JS runs (opacity 0) so the mount entrance has no flash — that
   initial opacity is overridden to 1 under prefers-reduced-motion in CSS. */

import gsap from "gsap";
import type Lenis from "lenis";
import { initUniversalReveal } from "./animations/reveal";
import { initHeroAvatar, initHeroCover, initHeroEntrance } from "./animations/hero";
import { initResume } from "./animations/resume";
import { initHandscroll, markHandscrollsDone } from "./animations/portfolio";
import { initJournal } from "./animations/journal";
import { initFilmGrain } from "./animations/ambient";
import { initScrollTriggerGlue } from "./scrollTriggerGlue";

export interface GsapHandle {
  destroy: () => void;
}

export function initGsap(prefersReduced: boolean, lenis: Lenis | null): GsapHandle {
  const disposeGlue = initScrollTriggerGlue(lenis);

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

  return {
    destroy: function () {
      disposeGlue();
      ctx.revert();
    }
  };
}
