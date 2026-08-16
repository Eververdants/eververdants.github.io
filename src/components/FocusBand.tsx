/*
 * Fixed-position blur band:
 * normally a strip at the bottom of the viewport where blur ramps from ~0 at
 * the top edge to ~36px at the bottom edge — content leaving via the bottom.
 * While the selected-works handscroll is pinned and its track is mid-unroll
 * the content moves sideways instead, so the band relocates to the right edge
 * (same ramp, "to right" mirrors it so the strongest blur sits at the screen
 * edge). Once the track reaches the far right — gsap marks the section
 * [data-hscroll-done] — nothing moves sideways anymore, and the band returns
 * to the bottom even though the section is still pinned.
 * 8 stacked backdrop-filter layers, each masked to its own window, so only
 * content passing the strip is blurred — everything else stays sharp.
 */
import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';

const LAYERS: Array<{ radius: number; mask: string }> = [
  { radius: 0.5, mask: "transparent 0%, #000 12.5%, #000 25%, transparent 37.5%" },
  { radius: 0.5625, mask: "transparent 12.5%, #000 25%, #000 37.5%, transparent 50%" },
  { radius: 1.125, mask: "transparent 25%, #000 37.5%, #000 50%, transparent 62.5%" },
  { radius: 2.25, mask: "transparent 37.5%, #000 50%, #000 62.5%, transparent 75%" },
  { radius: 4.5, mask: "transparent 50%, #000 62.5%, #000 75%, transparent 87.5%" },
  { radius: 9, mask: "transparent 62.5%, #000 75%, #000 87.5%, transparent 100%" },
  { radius: 18, mask: "transparent 75%, #000 87.5%, #000 100%" },
  { radius: 36, mask: "transparent 87.5%, #000 100%" }
];

export default function FocusBand() {
  const [right, setRight] = useState(false);
  const [outro, setOutro] = useState(false);
  const [coarse] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(hover: none), (pointer: coarse)").matches
  );

  useEffect(() => {
    const check = () => {
      const sec = document.querySelector<HTMLElement>("[data-works]");
      if (!sec) return setRight(false);
      const r = sec.getBoundingClientRect();
      // Section pinned at the top → the horizontal unroll owns the screen.
      // (Switching earlier — on first entry — read as premature while the
      // title is still rising vertically.) Once the track has fully unrolled
      // (data-hscroll-done, gsap.ts), the unroll is over and the band returns
      // to the bottom for whatever the vertical scroll brings next.
      const done = sec.hasAttribute("data-hscroll-done");
      setRight(r.top <= 0 && r.bottom > 0 && !done);
      // The dissolving finale ends on clean black — no bottom blur strip on
      // it. Drop the band while the outro occupies any of the viewport.
      const end = document.querySelector<HTMLElement>("[data-outro]");
      if (!end) return setOutro(false);
      const er = end.getBoundingClientRect();
      setOutro(er.top < window.innerHeight && er.bottom > 0);
    };
    check();
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => {
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, []);

  /* Coarse pointers (phones/tablets): drop the band entirely — 8 stacked
     backdrop-filter layers are a GPU sink and render as an odd blur strip
     at the screen edge on mobile. Desktop keeps the cinematic focus band. */
  if (coarse || outro) return null;

  return (
    <div
      className={`pointer-events-none fixed z-[2] ${
        right ? "right-0 top-0 bottom-0 w-[22vw]" : "bottom-0 left-0 right-0 h-[22vh]"
      }`}
      aria-hidden="true"
    >
      {LAYERS.map((layer, i) => {
        const mask = `linear-gradient(${right ? "to right" : "to bottom"}, ${layer.mask})`;
        const style: CSSProperties = {
          position: "absolute",
          inset: 0,
          zIndex: i + 1,
          backdropFilter: `blur(${layer.radius}px)`,
          WebkitBackdropFilter: `blur(${layer.radius}px)`,
          maskImage: mask,
          WebkitMaskImage: mask
        };
        return <div key={i} style={style} />;
      })}
    </div>
  );
}
