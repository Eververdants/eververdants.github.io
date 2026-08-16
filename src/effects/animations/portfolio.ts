import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

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
  /* Touch devices: the handscroll is stacked vertically in CSS (see the
     coarse-pointer fallback in global.css) — no horizontal track to drive,
     and sliding it would fight the vertical layout. */
  if (window.matchMedia("(hover: none), (pointer: coarse)").matches) {
    gsap.utils.toArray<HTMLElement>("[data-hscroll]").forEach((sec) =>
      sec.setAttribute("data-hscroll-done", "")
    );
    return;
  }
  gsap.utils.toArray<HTMLElement>("[data-hscroll]").forEach((section) => {
    const track = section.querySelector<HTMLElement>("[data-hscroll-track]");
    if (!track) return;
    // Measurements are FUNCTIONS read live on every update: the sub-site hides
    // the main site, so initHandscroll can run while the section is
    // display:none (track width 0). A timeline built from that state is
    // mis-scaled and the unroll jumps straight to the end on re-show. Driving
    // the track from scroll progress directly (below) never caches a stale
    // layout, so it survives the hide/re-show and resize alike.
    const startFrac = 0.4;
    const dist = () => Math.max(0, track.scrollWidth - section.clientWidth);
    const cornerScroll = () => window.innerHeight * startFrac; // entry arc's vertical travel
    const exitScroll = () => window.innerHeight - cornerScroll(); // exit arc's vertical travel
    const cornerPx = () => Math.round(cornerScroll()); // entry arc radius (circular)
    const exitPx = () => Math.round(exitScroll());     // exit arc radius
    const room = () => dist() + window.innerHeight;    // scroll room = section height
    const eIn = () => cornerScroll() / room();         // entry corner fraction
    const eOut = () => exitScroll() / room();          // exit corner fraction

    /* Map scroll progress 0..1 to the track's x. The two corners round the
       trajectory with sine easings (entry accelerates in, exit decelerates
       out); the unroll between them is linear. */
    const setX = (p: number) => {
      const c = cornerPx();
      const d = dist();
      const ex = exitPx();
      const linStart = eIn();
      const linEnd = 1 - eOut();
      let x: number;
      if (p <= linStart) {
        x = -c * (1 - Math.cos((Math.PI / 2) * (p / linStart)));
      } else if (p < linEnd) {
        x = -(c + d * ((p - linStart) / (linEnd - linStart)));
      } else {
        x = -(c + d + ex * Math.sin((Math.PI / 2) * ((p - linEnd) / (1 - linEnd))));
      }
      gsap.set(track, { x });
      // FocusBand relocation: while the track is mid-unroll the content moves
      // sideways, so the blur band sits on the right edge; once the track
      // reaches the far end (the 卷尾 colophon is fully in frame) nothing moves
      // sideways anymore and the band returns to the bottom edge.
      section.toggleAttribute("data-hscroll-done", d > 0 && p >= linEnd);
    };

    ScrollTrigger.create({
      trigger: section,
      start: `top ${Math.round(startFrac * 100)}%`,
      end: () => "+=" + room(),
      scrub: true,
      invalidateOnRefresh: true,
      onUpdate: (self) => setX(self.progress),
      // Scroll room for the sticky viewport = horizontal travel + viewport.
      onRefresh: (self) => {
        section.style.height = room() + "px";
        setX(self.progress);
      }
    });
    // Initial state (e.g. deep-link load mid-scroll): refresh fires on
    // creation, but set once for safety before the first paint settles.
    setX(0);
  });
}
