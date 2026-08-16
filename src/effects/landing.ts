/* Coordinator: wires every landing-page effect together and returns a
   destroy() for React unmount cleanup. Effects live in sibling files. */

import type Lenis from "lenis";
import { initFluid, FLUID_PARAMS } from "./fluid";
import { initDots } from "./dots";
import { initSmoothScroll } from "./smoothScroll";
import { initScrollbar } from "./scrollbar";
import { initGsap } from "./gsap";

export interface LandingHandle {
  destroy: () => void;
  lenis: Lenis | null;
  /* Re-measure the custom scrollbar after the document height changes without
     a window resize (e.g. the sub-site reveals the main site). */
  resizeScrollbar: () => void;
}

export function initLanding(): LandingHandle {
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const disposers: Array<() => void> = [];

  const fluidDispose = initFluid(
    document.getElementById("bg-fluid") as HTMLCanvasElement,
    FLUID_PARAMS,
    prefersReduced
  );
  if (fluidDispose) disposers.push(fluidDispose);

  const dotsDispose = initDots(
    document.getElementById("bg-dots") as HTMLCanvasElement,
    prefersReduced
  );
  if (dotsDispose) disposers.push(dotsDispose);

  let lenis: Lenis | null = null;
  const smooth = initSmoothScroll(prefersReduced);
  if (smooth) {
    lenis = smooth.lenis;
    disposers.push(smooth.destroy);
  }

  const barDispose = initScrollbar(
    document.getElementById("scrollbar") as HTMLElement,
    document.getElementById("scrollbar-thumb") as HTMLElement,
    lenis
  );
  let resizeScrollbar = () => {};
  if (barDispose) {
    resizeScrollbar = barDispose.resize;
    disposers.push(barDispose.destroy);
  }

  // GSAP runs last: it needs the hero/resume DOM mounted and Lenis ready.
  disposers.push(initGsap(prefersReduced, lenis).destroy);

  return {
    lenis,
    resizeScrollbar,
    destroy: function () {
      for (let i = disposers.length - 1; i >= 0; i--) {
        disposers[i]();
      }
    }
  };
}
