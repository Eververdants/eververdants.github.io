import gsap from "gsap";

/* Selected-works handscroll: vertical page scroll unrolls the horizontal
   track, and the data-hscroll-done flag tells FocusBand when the unroll is
   over so the blur band can leave the right edge. */

/* ---- reduced-motion state ----
   No handscroll runs under reduced motion (the track stacks vertically in
   CSS), so there is nothing horizontal to focus — mark every handscroll
   done, keeping the FocusBand on the bottom edge. */
export function markHandscrollsDone() {
  gsap.utils.toArray<HTMLElement>("[data-hscroll]").forEach((sec) => {
    sec.setAttribute("data-hscroll-done", "");
  });
}

/* ---- vertical→horizontal unroll ----
   The section stays in normal flow (CSS sticky viewport inside), so the
   scrub measures it reliably — no pin, no pinned-element distortion. The
   unroll starts as the section first enters (top bottom) and runs through
   its rise; the sticky viewport holds the track full-screen for the rest.

   The vertical→horizontal turn is a rounded corner, not a right angle: the
   first rise segment eases the track in (sine.in — zero lateral velocity
   at the top of the rise, accelerating into the turn), so the content arcs
   off the vertical axis instead of snapping sideways. The unroll that
   follows is linear for even reading. */
export function initHandscroll() {
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
    // FocusBand relocation: while the track is mid-unroll the content moves
    // sideways, so the blur band sits on the right edge; once the track
    // reaches the far end (the 卷尾 colophon is fully in frame) nothing moves
    // sideways anymore and the band returns to the bottom edge. The flag is
    // a boolean attribute so FocusBand can read it in one cheap check.
    const setDone = () => {
      const x = gsap.getProperty(track, "x");
      const done =
        dist() > 0 &&
        typeof x === "number" &&
        x <= -dist() + 1;
      section.toggleAttribute("data-hscroll-done", done);
    };
    gsap
      .timeline({
        scrollTrigger: {
          trigger: section,
          start: `top ${Math.round(startFrac * 100)}%`,
          end: () => "+=" + scrollRoom(),
          scrub: true,
          invalidateOnRefresh: true,
          onUpdate: setDone,
          // Scroll room for the sticky viewport = horizontal travel + viewport.
          onRefresh: () => {
            section.style.height = dist() + vh + "px";
            setDone();
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
    // Initial state (e.g. deep-link load mid-scroll): refresh fires on
    // creation, but set once for safety before the first paint settles.
    setDone();
  });
}
