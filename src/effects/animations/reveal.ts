import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/* Universal scroll reveal — the base entrance shared by every screen.
   Every matching element starts hidden and rises in as it enters.
   [data-hero-in] elements run their own mount entrance, and sticky /
   masthead / award-row / journal-row elements carry .no-rv so they are
   excluded. Runs inside the coordinator's gsap.context, so ctx.revert()
   tears it all down. */

const REVEAL_SELECTOR =
  "main :where(h1,h2,h3,p,li,img):not(.hero-content *):not(.no-rv):not([data-works] *):not([data-outro] *)";

export function initUniversalReveal() {
  gsap.set(REVEAL_SELECTOR, { autoAlpha: 0, y: () => window.innerHeight * 0.05 });
  ScrollTrigger.batch(REVEAL_SELECTOR, {
    // Fire just as the element peeks in from below the viewport (105% is a
    // hair off-screen), so the rise reads as entry — not mid-screen. A
    // short duration keeps it done before fast scroll overtakes it.
    start: "top 105%",
    once: true,
    onEnter: (batch) =>
      gsap.to(batch, { autoAlpha: 1, y: 0, duration: 0.6, ease: "power2.out", overwrite: true })
  });
}
