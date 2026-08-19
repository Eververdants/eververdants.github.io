/* Cinematic film texture: animated grain + static vignette, fixed over
   everything. The grain is an SVG feTurbulence tile that gsap shuffles
   (film flicker); the vignette deepens the edges like a lens. Both are
   pointer-transparent and purely decorative. */

import { useState } from "react";

const NOISE_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="2" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>`,
)}`;

export default function FilmGrain({ className = "" }: { className?: string }) {
  /* Coarse pointers (phones/tablets): skip the animated grain layer — a
     full-screen mix-blend-overlay tile costs GPU every frame; the static
     vignette stays. */
  const [coarse] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(hover: none), (pointer: coarse)").matches,
  );
  return (
    <div
      className={`pointer-events-none fixed inset-0 z-[30] transition-opacity duration-300 ${className}`}
      aria-hidden="true"
    >
      {!coarse && (
        <div
          data-film-grain
          className="absolute inset-0 opacity-[0.07] mix-blend-overlay"
          style={{
            backgroundImage: `url("${NOISE_SVG}")`,
            backgroundSize: "300px 300px",
          }}
        />
      )}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,0.5)_100%)]" />
    </div>
  );
}
