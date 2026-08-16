/* ScrollTrigger glue shared by both entries (the main-site coordinator and
   the blog sub-site). Kept in its own module so importing it into the blog
   bundle does NOT drag in the main site's deck animations (gsap.ts).

   Lenis smooth-scrolls without native scroll events, so GSAP must be pushed
   updates on Lenis scroll; big-type layout shifts once fonts load, so
   triggers re-measure on every font event plus load. Plugin registration
   fires at import time — before any component effect creates a trigger. */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

export function initScrollTriggerGlue(lenis: Lenis | null): () => void {
  const onScroll = () => ScrollTrigger.update();
  if (lenis) lenis.on("scroll", onScroll);

  const refreshST = () => ScrollTrigger.refresh();
  document.fonts?.ready.then(refreshST).catch(() => {});
  if (document.fonts?.addEventListener) {
    document.fonts.addEventListener("loadingdone", refreshST);
    document.fonts.addEventListener("load", refreshST);
  }
  window.addEventListener("load", refreshST);
  const safety = window.setTimeout(refreshST, 1500);

  return () => {
    if (lenis) lenis.off("scroll", onScroll);
    if (document.fonts?.removeEventListener) {
      document.fonts.removeEventListener("loadingdone", refreshST);
      document.fonts.removeEventListener("load", refreshST);
    }
    window.removeEventListener("load", refreshST);
    clearTimeout(safety);
  };
}
