import gsap from "gsap";
import type Lenis from "lenis";

/* Dissolving finale: the site's last screen pins and empties out.

   A scrubbed timeline (ScrollTrigger pin) drives three stages over ~3.5
   screens of travel: the three big lines rise in, dissolve up; the black
   layer fades in over the ambient canvas (background cleans); a tiny name
   appears and goes; the final sentence settles in; a faint ↗ arrives.

   The ↗ scrolls home in two bezier phases: accelerate up the page to just
   below the hero, cut, then decelerate into the real first screen.

   Reduced motion never reaches the scrub (the gsap coordinator returns
   early), so CSS collapses the outro to its last state; bindOutroHome only
   gives the button a plain jump. */

export function initOutro(lenis: Lenis | null) {
  const section = document.querySelector<HTMLElement>("[data-outro]");
  if (!section) return;

  const lines = section.querySelectorAll<HTMLElement>("[data-outro-line]");
  const nameEl = section.querySelector<HTMLElement>("[data-outro-name]");
  const endEl = section.querySelector<HTMLElement>("[data-outro-end]");
  const homeEl = section.querySelector<HTMLElement>("[data-outro-home]");
  const black = section.querySelector<HTMLElement>("[data-outro-black]");
  if (!nameEl || !endEl || !homeEl || !black || lines.length === 0) return;

  /* Hidden pre-JS by CSS (anti-flash); set the scrub's initial state the
     same frame so nothing flashes in before the timeline takes over. */
  gsap.set([...lines, nameEl, endEl, homeEl, black], { autoAlpha: 0 });

  const travel = () => window.innerHeight * 3.5;
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: "top top",
      end: () => "+=" + travel(),
      scrub: true,
      pin: true,
      anticipatePin: 1,
      invalidateOnRefresh: true
    },
    defaults: { ease: "power2.inOut" }
  });

  /* Stage 1 — the three lines rise in one by one, then leave with a parallax
     stagger (each line a little further up) so the dissolve has depth. */
  lines.forEach((line, i) => {
    tl.fromTo(
      line,
      { autoAlpha: 0, y: 70, filter: "blur(12px)" },
      { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.35, ease: "power3.out" },
      i * 0.05
    );
  });
  lines.forEach((line, i) => {
    /* Explicit from: a `to` would capture opacity-at-build (0, the set below)
       as its start and snap the line invisible when this tween begins. */
    tl.fromTo(
      line,
      { autoAlpha: 1, y: 0, filter: "blur(0px)" },
      { autoAlpha: 0, y: -40 - i * 18, filter: "blur(8px)", duration: 0.3, ease: "power2.in" },
      0.22
    );
  });

  /* Background cleans: the black layer fades in over the ambient canvas. */
  tl.to(black, { autoAlpha: 1, duration: 0.34, ease: "power1.inOut" }, 0.26);

  /* Stage 2 — a very small name, then gone. */
  tl.fromTo(nameEl, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.16, ease: "power2.out" }, 0.36).fromTo(
    nameEl,
    { autoAlpha: 1 },
    { autoAlpha: 0, duration: 0.09 },
    0.54
  );

  /* Stage 3 — the sentence settles in slowly, unblurring. */
  tl.fromTo(
    endEl,
    { autoAlpha: 0, y: 14, filter: "blur(10px)" },
    { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.26, ease: "power2.out" },
    0.58
  );

  /* The faint ↗ arrives last and stays. */
  tl.fromTo(homeEl, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.1, ease: "power2.out" }, 0.84);

  /* ↗ → home, in two bezier phases. Phase 1 accelerates up the page (slower,
     faster, fastest — the middle rushes by) to just below the hero. There a
     cut: the fast scroll hands straight into the slow phase, no easing bridge.
     Phase 2 decelerates up the last viewport, the real hero sliding in and
     settling. Real scroll, real top, ~2s total. */
  const homeClick = (e: Event) => {
    e.preventDefault();
    if (lenis && lenis.isScrolling) return;
    if (!lenis) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const heroH = window.innerHeight; // hero is the first full viewport
    lenis.scrollTo(heroH, {
      duration: 0.95,
      easing: easeInBezier,
      lock: true,
      onComplete: () => {
        lenis.scrollTo(0, { duration: 1.05, easing: easeOutBezier, lock: true });
      }
    });
  };
  homeEl.addEventListener("click", homeClick);

  return () => {
    homeEl.removeEventListener("click", homeClick);
  };
}

/* Bezier speed curves for the return.
   easeInBezier = cubic-bezier(0.55, 0, 1, 0.45): velocity climbs the whole
   way — "越来越快". easeOutBezier = cubic-bezier(0.22, 1, 0.36, 1): velocity
   bleeds off gently — "慢慢变慢", the soft landing into the hero. */
const easeInBezier = (t: number) => t * t * t;
const easeOutBezier = (t: number) => 1 - Math.pow(1 - t, 3);

/* Reduced-motion fallback: no scrub, no dip. The button just jumps straight
   to the real top (instant — reduced motion skips smooth scroll too). */
export function bindOutroHome(lenis: Lenis | null) {
  const homeEl = document.querySelector<HTMLElement>("[data-outro-home]");
  if (!homeEl) return;
  const homeClick = () => {
    if (lenis) lenis.scrollTo(0, { immediate: true });
    else window.scrollTo(0, 0);
  };
  homeEl.addEventListener("click", homeClick);
  return () => homeEl.removeEventListener("click", homeClick);
}
