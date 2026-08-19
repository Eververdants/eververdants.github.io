import gsap from "gsap";

/* Resume chapters: title-card mastheads, parallax drift, curtain wipes,
   line-mask reveals, chapter recede, award rows, focus marquees.

   A couple of these selectors are shared with the journal screen:
   [data-parallax] drives the cover's ghost numeral, and .line-mask reveals
   the journal's closing line. They run here for every screen — the
   selectors are global, so both owners animate. */

/* ---- title-card mastheads (RESUME, JOURNAL — was .mast) ----
   Each masthead's letters blur-rise in staggered as it enters, hold, then
   fly apart as it leaves. One scrub per masthead over its own visibility
   window, so every [data-masthead] block (not just the first) gets the
   same treatment. */
function initMastheads() {
  gsap.utils.toArray<HTMLElement>("[data-masthead]").forEach((mast) => {
    const letters = Array.from(
      mast.querySelectorAll<HTMLElement>("[data-mast-letter]"),
    );
    if (!letters.length) return;
    gsap
      .timeline({
        scrollTrigger: {
          trigger: mast,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
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
          ease: "none",
        },
        0,
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
          ease: "none",
        },
        0.7,
      );
  });
}

/* ---- parallax numerals (was .drift) + skew swing ----
   Also drives the journal cover's ghost issue numeral. */
function initParallax() {
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
          invalidateOnRefresh: true,
        },
      },
    );
  });
}

/* ---- sticky chapter labels: clip-path curtain wipe ----
   Trigger on the non-sticky act container, not the sticky label: a pinned
   label's geometry freezes, so a once-trigger on it never lets the tween
   finish. */
function initWipes() {
  gsap.utils.toArray<HTMLElement>("[data-wipe]").forEach((el) => {
    const trigger = el.closest("[data-act]") ?? el;
    gsap.from(el, {
      clipPath: "inset(0 100% 0 0)",
      duration: 0.7,
      ease: "power3.inOut",
      scrollTrigger: { trigger, start: "top 105%", once: true },
    });
  });
}

/* ---- line-mask reveals (was .line-mask > span lineUp) ----
   Trigger on the mask so all its sibling lines fire together, then stagger
   the slide per line index. Also reveals the journal's closing line. */
function initLineMasks() {
  gsap.utils.toArray<HTMLElement>(".line-mask").forEach((mask) => {
    const lines = Array.from(
      mask.querySelectorAll<HTMLElement>(":scope > span"),
    );
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
          scrollTrigger: { trigger: mask, start: "top 105%", once: true },
        },
      );
    });
  });
}

/* ---- chapter numerals: recede as the act's content scrolls over ----
   Sticky giant numerals are dramatic at the chapter open but bleed through
   the reading text once rows arrive (stroke shows between the lines). Scrub
   them out over the first ~viewport of the act — bold while announcing,
   gone while reading. Trigger on the act, not the sticky label (pinned
   geometry freezes triggers). */
function initChapterRecede() {
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
        scrub: true,
      },
    });
  });
}

/* ---- award prize rows: ceremony curtain wipe (was .row-in slide) ----
   Each trophy row is clipped to zero width, then the curtain sweeps
   left-to-right as it scrolls in. Trigger on the row itself (not the act),
   so each prize reveals in sequence — a spotlight, not a list. */
function initAwardRows() {
  gsap.utils.toArray<HTMLElement>("[data-row-wipe]").forEach((row, i) => {
    gsap.from(row, {
      clipPath: "inset(0 100% 0 0)",
      duration: 0.65,
      ease: "power3.inOut",
      delay: i * 0.12,
      scrollTrigger: { trigger: row, start: "top 105%", once: true },
    });
  });
}

/* ---- focus marquee bands (was CSS marquee loop) ----
   Two identical groups per track; xPercent -50 loops seamlessly.
   Direction/speed come from data attributes. */
function initMarqueeLoops() {
  gsap.utils.toArray<HTMLElement>(".marquee-track").forEach((track) => {
    const slow = track.dataset.marquee === "slow";
    const reverse = track.dataset.marqueeReverse !== undefined;
    gsap.fromTo(
      track,
      { xPercent: reverse ? -50 : 0 },
      {
        xPercent: reverse ? 0 : -50,
        repeat: -1,
        ease: "none",
        duration: slow ? 52 : 28,
      },
    );
  });
}

/* ---- marquee bands: scroll-scrubbed skew swing ---- */
function initMarqueeSkew() {
  gsap.utils
    .toArray<HTMLElement>("[data-marquee-parallax]")
    .forEach((band, i) => {
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
            scrub: true,
          },
        },
      );
    });
}

export function initResume() {
  initMastheads();
  initParallax();
  initWipes();
  initLineMasks();
  initChapterRecede();
  initAwardRows();
  initMarqueeLoops();
  initMarqueeSkew();
}
