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
        scrollTrigger: { trigger: el.closest("[data-cover]"), start: "top 60%", once: true }
      }
    );
  });
}

/* ---- reading deck: full-screen spreads turn in 3D ----
   Each spread is invisible below the viewport, then rises AND stands up
   toward the reader (rotateX -55° → 0) as it enters, holds flat while
   centered, then falls back away (0 → 55°) and fades as it leaves — a page
   picked off the table, read, and laid down. transformPerspective puts a
   camera on each spread, so no ancestor perspective container is needed.
   This is the journal's signature motion: the rest of the site is flat
   reveals, this one is a deck that turns. */
function initReadingDeck() {
  /* Mobile: a 3D rotateX card's perspective footprint projects wider than
     the viewport (overflow past the right edge), and scrub can stall
     mid-turn when the URL bar resizes the viewport — use a flat
     rise/fall reveal instead. Desktop keeps the 3D deck. */
  const touch = window.matchMedia("(hover: none), (pointer: coarse)").matches;
  gsap.utils.toArray<HTMLElement>("[data-journal-spread]").forEach((spread) => {
    if (touch) {
      gsap
        .timeline({
          scrollTrigger: {
            trigger: spread,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
            invalidateOnRefresh: true
          }
        })
        .fromTo(
          spread,
          { y: 64, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.38, ease: "power2.out" },
          0
        )
        .to(
          spread,
          { y: -64, autoAlpha: 0, duration: 0.38, ease: "power2.in" },
          0.62
        );
      return;
    }
    gsap
      .timeline({
        scrollTrigger: {
          trigger: spread,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
          invalidateOnRefresh: true
        }
      })
      .fromTo(
        spread,
        { rotateX: -55, y: 130, autoAlpha: 0, transformOrigin: "50% 50%", transformPerspective: 850 },
        { rotateX: 0, y: 0, autoAlpha: 1, duration: 0.38, ease: "power2.out" },
        0
      )
      .to(
        spread,
        { rotateX: 55, y: -130, autoAlpha: 0, duration: 0.38, ease: "power2.in" },
        0.62
      );
  });
}

export function initJournal() {
  initCoverTitle();
  initReadingDeck();
}
