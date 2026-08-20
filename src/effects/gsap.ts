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
import {
  initHeroAvatar,
  initHeroCover,
  initHeroEntrance,
} from "./animations/hero";
import { initResume } from "./animations/resume";
import { initHandscroll, markHandscrollsDone } from "./animations/portfolio";
import { initJournal } from "./animations/journal";
import { initFilmGrain } from "./animations/ambient";
import { initOutro, bindOutroHome } from "./animations/outro";
import { initScrollTriggerGlue } from "./scrollTriggerGlue";

export interface GsapHandle {
  destroy: () => void;
}

export function initGsap(
  prefersReduced: boolean,
  lenis: Lenis | null,
): GsapHandle {
  const disposeGlue = initScrollTriggerGlue(lenis);

  const ctx = gsap.context(() => {
    /* DOM listeners (outro ↗) are NOT gsap animations — ctx.revert() won't
       clean them. Collect the per-module cleanups and hand them back so
       revert() tears the whole context down. */
    const undos: Array<() => void> = [];

    if (prefersReduced) {
      // CSS hides [data-hero-in] until JS animates it; under reduced motion
      // JS never does, so unhide here — independent of the CSS media query
      // matching (covers JS/CSS mismatch).
      gsap.set("[data-hero-in]", { autoAlpha: 1 });
      markHandscrollsDone();
      const undo = bindOutroHome(lenis);
      if (undo) undos.push(undo);
    } else {
      initUniversalReveal();
      /* Hero entrance plays when the intro loader's darkroom wipe opens —
         one continuous camera move: the sheet develops, the page emerges out
         of the circular wipe. IntroLoader fires "site-intro-reveal" right
         before it starts wiping (and immediately, on a skipped-load visit);
         the 3.5s timer is a safety net in case the loader never ran. */
      let heroIn = false;
      const fireHeroEntrance = () => {
        if (heroIn) return;
        heroIn = true;
        initHeroEntrance();
      };
      window.addEventListener("site-intro-reveal", fireHeroEntrance, {
        once: true,
      });
      const heroTimer = window.setTimeout(fireHeroEntrance, 3500);
      undos.push(() => {
        window.removeEventListener("site-intro-reveal", fireHeroEntrance);
        window.clearTimeout(heroTimer);
      });
      initHeroCover();
      initResume();
      initHandscroll();
      initJournal();
      initFilmGrain();
      initHeroAvatar();
      const undo = initOutro(lenis);
      if (undo) undos.push(undo);
    }

    return () => {
      for (let i = undos.length - 1; i >= 0; i--) undos[i]();
    };
  });

  return {
    destroy: function () {
      disposeGlue();
      ctx.revert();
    },
  };
}
