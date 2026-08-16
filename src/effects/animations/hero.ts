import gsap from "gsap";

/* Hero: mount entrance, sticky-cover exit, avatar ken burns. */

/* ---- mount entrance (was .animate-hero-in) ---- */
export function initHeroEntrance() {
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
}

/* ---- scroll cover (was hero-cover + glass-in) ----
   The sticky hero fades out and drifts up while the glass overlay blurs in,
   over the first viewport of scroll. */
export function initHeroCover() {
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
}

/* ---- avatar: slow living zoom (ken burns) ---- */
export function initHeroAvatar() {
  gsap.to("[data-hero-avatar]", {
    scale: 1.07,
    duration: 9,
    ease: "sine.inOut",
    yoyo: true,
    repeat: -1
  });
}
