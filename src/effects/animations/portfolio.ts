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
    // so the title rises into view first. The two corners round the scroll
    // trajectory: the ENTRY arc bends vertical → horizontal as the title
    // rises and pins, and the EXIT arc bends horizontal → vertical as the
    // section un-pins into the journal — no right-angle anywhere.
    const startFrac = 0.4;
    const cornerScroll = () => vh * startFrac;   // entry arc's vertical travel
    const exitScroll = () => vh - cornerScroll(); // exit arc's vertical travel
    const cornerPx = Math.round(vh * startFrac);  // entry arc radius (circular)
    const exitPx = Math.round(exitScroll());      // exit arc radius
    const room = () => dist() + vh;               // timeline range = section height
    const eIn = () => cornerScroll() / room();    // entry corner fraction
    const lin = () => dist() / room();            // linear unroll fraction
    const eOut = () => exitScroll() / room();     // exit corner fraction
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
          end: () => "+=" + room(),
          scrub: true,
          invalidateOnRefresh: true,
          onUpdate: setDone,
          // Scroll room for the sticky viewport = horizontal travel + viewport.
          onRefresh: () => {
            section.style.height = room() + "px";
            setDone();
          }
        }
      })
      // ENTRY corner: rise + ease sideways in one arc (sine.in — zero lateral
      // velocity at the top of the rise, accelerating into the turn).
      .to(track, { x: () => -cornerPx, ease: "sine.in", duration: eIn() })
      // Linear unroll for even reading.
      .to(track, { x: () => -dist(), ease: "none", duration: lin() }, eIn())
      // EXIT corner: ease the unroll past its end (sine.out) while the
      // section un-pins and rises, so the 卷尾 arcs out of horizontal into
      // the journal's vertical — the mirror of the entry corner.
      .to(
        track,
        { x: () => -dist() - exitPx, ease: "sine.out", duration: eOut() },
        eIn() + lin()
      );
    // Initial state (e.g. deep-link load mid-scroll): refresh fires on
    // creation, but set once for safety before the first paint settles.
    setDone();
  });
}
