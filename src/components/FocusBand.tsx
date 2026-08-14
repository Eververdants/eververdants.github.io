/*
 * Fixed-position blur band:
 * a fixed strip at the bottom of the viewport where blur ramps from ~0 at
 * the top edge to ~36px at the bottom edge. 8 stacked backdrop-filter layers,
 * each masked to its own vertical window, so only content passing beneath the
 * strip is blurred — elements stay sharp everywhere else.
 */
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
  return (
    <div className="blur-band" aria-hidden="true">
      {LAYERS.map((layer, i) => {
        const mask = `linear-gradient(to bottom, ${layer.mask})`;
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
