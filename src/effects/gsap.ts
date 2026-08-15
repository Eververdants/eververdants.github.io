/* GSAP coordinator — every DOM animation lives here.

   ScrollTrigger drives the scroll-linked set (universal reveal, hero cover,
   masthead, parallax numerals, line reveals, award rows, marquee loop).
   Lenis is the scroller: it keeps its own rAF loop (smoothScroll.ts), GSAP
   just pushes ScrollTrigger updates on scroll so triggers stay in sync.

   Reduced motion skips everything: with the CSS reveals removed, elements
   sit at their natural (visible) state. [data-hero-in] hides via CSS only
   before JS runs (opacity 0) so the mount entrance has no flash — that
   initial opacity is overridden to 1 under prefers-reduced-motion in CSS. */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type Lenis from "lenis";

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
      return;
    }

    /* ---- universal scroll reveal (was .rv-in) ----
       Every content element starts hidden and rises in as it enters.
       [data-hero-in] elements run their own mount entrance and sticky /
       masthead / award-row elements carry .no-rv, so all three are excluded. */
    const REVEAL_SELECTOR =
      "main :where(h1,h2,h3,p,li,img):not(.hero-content *):not(.no-rv)";

    gsap.set(REVEAL_SELECTOR, { autoAlpha: 0, y: () => window.innerHeight * 0.05 });
    ScrollTrigger.batch(REVEAL_SELECTOR, {
      start: "top 90%",
      once: true,
      onEnter: (batch) =>
        gsap.to(batch, { autoAlpha: 1, y: 0, duration: 0.8, ease: "power2.out", overwrite: true })
    });

    /* ---- hero mount entrance (was .animate-hero-in) ---- */
    gsap.fromTo(
      "[data-hero-in]",
      { y: 18, filter: "blur(14px)" },
      {
        autoAlpha: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 0.8,
        stagger: 0.12,
        ease: "power3.out"
      }
    );

    /* ---- hero scroll cover (was hero-cover + glass-in) ----
       The sticky hero fades out and drifts up while the glass overlay
       blurs in, over the first viewport of scroll. */
    gsap
      .timeline({
        scrollTrigger: {
          trigger: "[data-hero-scroll]",
          start: "top top",
          end: "bottom top",
          scrub: true,
          invalidateOnRefresh: true
        }
      })
      .to(
        "[data-hero-fade]",
        { y: () => -window.innerHeight * 0.16, opacity: 0, ease: "none" },
        0
      )
      .to("[data-hero-glass]", { opacity: 1, ease: "none" }, 0)
      // Scroll hint lives in the sticky hero, so it must leave with the same
      // animation as the hero content (drift up + fade), otherwise it sticks
      // on screen forever. Explicit from start: gsap otherwise captures the
      // element's opacity-at-create as the tween start.
      .fromTo(
        "[data-hero-hint]",
        { opacity: 1, y: 0 },
        { opacity: 0, y: () => -window.innerHeight * 0.16, ease: "none" },
        0
      );

    /* ---- resume masthead RESUME (was .mast) ----
       Blur-rise in, hold, zoom-out fade: one scrub over the masthead's
       visibility window. */
    gsap.fromTo(
      "[data-mast]",
      { scale: 0.95, autoAlpha: 0, filter: "blur(18px)" },
      {
        keyframes: [
          { scale: 1, autoAlpha: 1, filter: "blur(0px)", duration: 0.3 },
          { scale: 1, autoAlpha: 1, filter: "blur(0px)", duration: 0.4 },
          { scale: 1.08, autoAlpha: 0, filter: "blur(16px)", duration: 0.3 }
        ],
        ease: "none",
        scrollTrigger: {
          trigger: "[data-masthead]",
          start: "top bottom",
          end: "bottom top",
          scrub: true
        }
      }
    );

    /* ---- parallax numerals (was .drift) ---- */
    gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
      gsap.fromTo(
        el,
        { y: () => window.innerHeight * 0.08 },
        {
          y: () => window.innerHeight * -0.08,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
            invalidateOnRefresh: true
          }
        }
      );
    });

    /* ---- line-mask reveals (was .line-mask > span lineUp) ---- */
    gsap.utils.toArray<HTMLElement>(".line-mask > span").forEach((span) => {
      gsap.fromTo(
        span,
        { yPercent: 110 },
        {
          yPercent: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: span, start: "top 92%", once: true }
        }
      );
    });

    /* ---- award result rows (was .row-in) ---- */
    gsap.utils.toArray<HTMLElement>(".row-in").forEach((row) => {
      gsap.fromTo(
        row,
        { autoAlpha: 0, x: -28 },
        {
          autoAlpha: 1,
          x: 0,
          duration: 0.7,
          ease: "power2.out",
          scrollTrigger: { trigger: row, start: "top 92%", once: true }
        }
      );
    });

    /* ---- focus marquee bands (was CSS marquee loop) ----
       Two identical groups per track; xPercent -50 loops seamlessly.
       Direction/speed come from data attributes. */
    gsap.utils.toArray<HTMLElement>(".marquee-track").forEach((track) => {
      const slow = track.dataset.marquee === "slow";
      const reverse = track.dataset.marqueeReverse !== undefined;
      gsap.fromTo(
        track,
        { xPercent: reverse ? -50 : 0 },
        { xPercent: reverse ? 0 : -50, repeat: -1, ease: "none", duration: slow ? 52 : 28 }
      );
    });
  });

  if (document.fonts?.ready) {
    // Big-type layout means element offsets shift once Fraunces loads.
    document.fonts.ready.then(() => ScrollTrigger.refresh());
  }

  return {
    destroy: function () {
      if (lenis) lenis.off("scroll", onScroll);
      ctx.revert();
    }
  };
}
