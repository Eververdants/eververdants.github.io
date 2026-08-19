import gsap from "gsap";

/* Journal screen: the cover title reveal and the reading deck's 3D flip. */

/* ---- cover title: rise + unblur (SVG text) ----
   The cover's warm-gradient JOURNAL is SVG <text fill="url(#grad)"> —
   gradient painted inside the glyph path, so no box can ever shave the
   ink. One clean rise for the whole word; nothing is clipped. */
function initCoverTitle() {
  gsap.utils.toArray<HTMLElement>("[data-cover-title]").forEach((el) => {
    gsap.fromTo(
      el,
      { autoAlpha: 0, y: 56, rotate: -3, filter: "blur(8px)" },
      {
        autoAlpha: 1,
        y: 0,
        rotate: 0,
        filter: "blur(0px)",
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el.closest("[data-cover]"),
          start: "top 60%",
          once: true,
        },
      },
    );
  });
}

/* ---- reading deck: full-screen spreads turn in 3D ----
   Lives in BlogScene now (it owns the spreads and must rebuild the scroll
   triggers when the tag filter changes the deck). Desktop keeps the 3D
   flip; coarse pointers get a flat rise/fall reveal (a 3D card's
   perspective footprint overflows the viewport and scrub can stall
   mid-turn when the URL bar resizes). */
export function initReadingDeck(spreads: HTMLElement[]) {
  const touch = window.matchMedia("(hover: none), (pointer: coarse)").matches;
  spreads.forEach((spread) => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: spread,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
        invalidateOnRefresh: true,
      },
    });
    if (touch) {
      tl.fromTo(
        spread,
        { y: 64, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.38, ease: "power2.out" },
        0,
      ).to(
        spread,
        { y: -64, autoAlpha: 0, duration: 0.38, ease: "power2.in" },
        0.62,
      );
    } else {
      tl.fromTo(
        spread,
        {
          rotateX: -55,
          y: 130,
          autoAlpha: 0,
          transformOrigin: "50% 50%",
          transformPerspective: 850,
        },
        { rotateX: 0, y: 0, autoAlpha: 1, duration: 0.38, ease: "power2.out" },
        0,
      ).to(
        spread,
        {
          rotateX: 55,
          y: -130,
          autoAlpha: 0,
          duration: 0.38,
          ease: "power2.in",
        },
        0.62,
      );
    }
  });
}

export function initJournal() {
  initCoverTitle();
}
