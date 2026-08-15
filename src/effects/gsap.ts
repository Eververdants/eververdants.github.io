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
       Title card: letters blur-rise in staggered as the masthead enters,
       hold, then fly apart as it leaves. One scrub over the visibility
       window. */
    const letters = gsap.utils.toArray<HTMLElement>("[data-mast-letter]");
    if (letters.length) {
      gsap
        .timeline({
          scrollTrigger: {
            trigger: "[data-masthead]",
            start: "top bottom",
            end: "bottom top",
            scrub: true
          }
        })
        .fromTo(
          letters,
          { yPercent: 130, autoAlpha: 0, filter: "blur(18px)" },
          {
            yPercent: 0,
            autoAlpha: 1,
            filter: "blur(0px)",
            duration: 0.3,
            stagger: 0.06,
            ease: "none"
          },
          0
        )
        .to({}, { duration: 0.4 })
        .to(
          letters,
          {
            scale: 1.1,
            autoAlpha: 0,
            filter: "blur(16px)",
            x: (i: number) => (i - (letters.length - 1) / 2) * 50,
            duration: 0.3,
            stagger: { each: 0.05, from: "start" },
            ease: "none"
          },
          0.7
        );
    }

    /* ---- parallax numerals (was .drift) + skew swing ---- */
    gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
      gsap.fromTo(
        el,
        { y: () => window.innerHeight * 0.08, skewX: -6 },
        {
          y: () => window.innerHeight * -0.08,
          skewX: 6,
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

    /* ---- sticky chapter labels: clip-path curtain wipe ----
       Trigger on the non-sticky act container, not the sticky label: a
       pinned label's geometry freezes, so a once-trigger on it never lets
       the tween finish. */
    gsap.utils.toArray<HTMLElement>("[data-wipe]").forEach((el) => {
      const trigger = el.closest("[data-act]") ?? el;
      gsap.from(el, {
        clipPath: "inset(0 100% 0 0)",
        duration: 0.9,
        ease: "power4.inOut",
        scrollTrigger: { trigger, start: "top 88%", once: true }
      });
    });

    /* ---- line-mask reveals (was .line-mask > span lineUp) ----
       Trigger on the mask so all its sibling lines fire together, then
       stagger the slide per line index. */
    gsap.utils.toArray<HTMLElement>(".line-mask").forEach((mask) => {
      const lines = Array.from(mask.querySelectorAll<HTMLElement>(":scope > span"));
      lines.forEach((span, i) => {
        gsap.fromTo(
          span,
          { yPercent: 110, filter: "blur(8px)", scale: 1.02 },
          {
            yPercent: 0,
            filter: "blur(0px)",
            scale: 1,
            duration: 0.9,
            ease: "power3.out",
            delay: i * 0.08,
            scrollTrigger: { trigger: mask, start: "top 92%", once: true }
          }
        );
      });
    });

    /* ---- award prize rows: ceremony curtain wipe (was .row-in slide) ----
       Each trophy row is clipped to zero width, then the curtain sweeps
       left-to-right as it scrolls in. Trigger on the row itself (not the
       act), so each prize reveals in sequence — a spotlight, not a list. */
    gsap.utils.toArray<HTMLElement>("[data-row-wipe]").forEach((row, i) => {
      gsap.from(row, {
        clipPath: "inset(0 100% 0 0)",
        duration: 0.9,
        ease: "power4.inOut",
        delay: i * 0.15,
        scrollTrigger: { trigger: row, start: "top 92%", once: true }
      });
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

    /* ---- marquee bands: scroll-scrubbed skew swing ---- */
    gsap.utils.toArray<HTMLElement>("[data-marquee-parallax]").forEach((band, i) => {
      gsap.fromTo(
        band,
        { skewX: i % 2 ? -3 : 3 },
        {
          skewX: i % 2 ? 3 : -3,
          ease: "none",
          scrollTrigger: {
            trigger: band,
            start: "top bottom",
            end: "bottom top",
            scrub: true
          }
        }
      );
    });

    /* ---- film grain flicker ---- */
    gsap.to("[data-film-grain]", {
      backgroundPosition: "300px 300px",
      duration: 1.2,
      ease: "none",
      repeat: -1
    });

    /* ---- hero avatar: slow living zoom (ken burns) ---- */
    gsap.to("[data-hero-avatar]", {
      scale: 1.07,
      duration: 9,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1
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
