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
      "main :where(h1,h2,h3,p,li,img):not(.hero-content *):not(.no-rv):not([data-works] *)";

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
        duration: 0.7,
        ease: "power3.inOut",
        scrollTrigger: { trigger, start: "top 105%", once: true }
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
            duration: 0.7,
            ease: "power2.out",
            delay: i * 0.06,
            scrollTrigger: { trigger: mask, start: "top 105%", once: true }
          }
        );
      });
    });

    /* ---- chapter numerals: recede as the act's content scrolls over ----
       Sticky giant numerals are dramatic at the chapter open but bleed
       through the reading text once rows arrive (stroke shows between the
       lines). Scrub them out over the first ~viewport of the act — bold
       while announcing, gone while reading. Trigger on the act, not the
       sticky label (pinned geometry freezes triggers). */
    gsap.utils.toArray<HTMLElement>("[data-chapter]").forEach((label) => {
      const act = label.closest("[data-act]");
      if (!act) return;
      gsap.to(label, {
        autoAlpha: 0,
        ease: "none",
        scrollTrigger: {
          trigger: act,
          start: "top top",
          end: "+=70%",
          scrub: true
        }
      });
    });

    /* ---- award prize rows: ceremony curtain wipe (was .row-in slide) ----
       Each trophy row is clipped to zero width, then the curtain sweeps
       left-to-right as it scrolls in. Trigger on the row itself (not the
       act), so each prize reveals in sequence — a spotlight, not a list. */
    gsap.utils.toArray<HTMLElement>("[data-row-wipe]").forEach((row, i) => {
      gsap.from(row, {
        clipPath: "inset(0 100% 0 0)",
        duration: 0.65,
        ease: "power3.inOut",
        delay: i * 0.12,
        scrollTrigger: { trigger: row, start: "top 105%", once: true }
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

    /* ---- selected-works handscroll: vertical scroll drives horizontal ----
       Parallel transition: the horizontal motion starts as the section first
       enters the viewport (overlapping the resume tail) and keeps running
       through its rise to the top — so the unroll never waits for a hard pin.
       The pin is a separate trigger that engages once the section reaches the
       top, holding it full-screen while the rest of the unroll completes. */
    /* The section stays in normal flow (CSS sticky viewport inside), so the
       scrub measures it reliably — no pin, no pinned-element distortion. The
       unroll starts as the section first enters (top bottom) and runs through
       its rise; the sticky viewport holds the track full-screen for the rest.

       The vertical→horizontal turn is a rounded corner, not a right angle:
       the first rise segment eases the track in (sine.in — zero lateral
       velocity at the top of the rise, accelerating into the turn), so the
       content arcs off the vertical axis instead of snapping sideways. The
       unroll that follows is linear for even reading. */
    gsap.utils.toArray<HTMLElement>("[data-hscroll]").forEach((section) => {
      const track = section.querySelector<HTMLElement>("[data-hscroll-track]");
      if (!track) return;
      const vh = window.innerHeight;
      const dist = () => Math.max(0, track.scrollWidth - section.clientWidth);
      // Horizontal begins once the section top reaches this viewport fraction,
      // so the title rises into view first; the rounded corner then arcs over
      // the remaining rise and completes exactly at the transition.
      const startFrac = 0.4;
      const cornerScroll = () => vh * startFrac;               // arc's vertical travel
      const scrollRoom = () => dist() + cornerScroll();        // timeline range
      const cornerFrac = () => cornerScroll() / scrollRoom();  // corner segment
      const cornerPx = Math.round(vh * startFrac);             // arc radius (circular)
      gsap
        .timeline({
          scrollTrigger: {
            trigger: section,
            start: `top ${Math.round(startFrac * 100)}%`,
            end: () => "+=" + scrollRoom(),
            scrub: true,
            invalidateOnRefresh: true,
            // Scroll room for the sticky viewport = horizontal travel + viewport.
            onRefresh: () => {
              section.style.height = dist() + vh + "px";
            }
          }
        })
        .to(track, { x: () => -cornerPx, ease: "sine.in", duration: cornerFrac() })
        // 1 - cornerFrac so the timeline totals 1: the corner completes exactly
        // at the transition, then the unroll is linear for even reading.
        .to(
          track,
          { x: () => -dist(), ease: "none", duration: () => 1 - cornerFrac() },
          cornerFrac()
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
