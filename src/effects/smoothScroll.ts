/* Lenis smooth scroll — same feel as charlieosborne.co. */

import Lenis from "lenis";

export interface SmoothScrollHandle {
  lenis: Lenis;
  destroy: () => void;
}

export function initSmoothScroll(prefersReduced: boolean): SmoothScrollHandle | null {
  if (prefersReduced) return null;
  if (window.matchMedia("(hover: none), (pointer: coarse)").matches) return null;

  const lenis = new Lenis({
    lerp: 0.1,
    wheelMultiplier: 1,
    smoothWheel: true
  });

  let rafId = 0;
  function raf(time: number) {
    lenis.raf(time);
    rafId = requestAnimationFrame(raf);
  }
  rafId = requestAnimationFrame(raf);

  return {
    lenis,
    destroy: function () {
      if (rafId) cancelAnimationFrame(rafId);
      lenis.destroy();
    }
  };
}
