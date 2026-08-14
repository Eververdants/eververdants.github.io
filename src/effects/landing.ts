/* Coordinator: wires every landing-page effect together and returns a
   destroy() for React unmount cleanup. Effects live in sibling files. */

import type Lenis from "lenis";
import { initFluid, FLUID_PARAMS } from "./fluid";
import { initDots } from "./dots";
import { initSmoothScroll } from "./smoothScroll";
import { initScrollbar } from "./scrollbar";

export interface LandingHandle {
  destroy: () => void;
  lenis: Lenis | null;
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
  if (barDispose) disposers.push(barDispose);

  return {
    lenis,
    destroy: function () {
      for (let i = disposers.length - 1; i >= 0; i--) {
        disposers[i]();
      }
    }
  };
}
